import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import http from "node:http";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

process.env.DATABASE_URL ??= "postgres://test:test@localhost:5432/bookstore_test";
process.env.JWT_SECRET = "test-secret";
process.env.ORIGINS = "";

const { app } = await import("../server.ts");
const dbModule = await import("../config/db.ts");
const db = dbModule.default as any;

type Author = {
  name: string;
  email: string;
  password: string;
};

type Book = {
  isbn: string;
  title: string;
  price: number;
  published_date: string;
  author_email: string;
};

const authors = new Map<string, Author>();
const books = new Map<string, Book>();

let server: http.Server;
let baseUrl = "";

const normalizeSql = (query: string) => query.replace(/\s+/g, " ").trim();

const tokenFor = (email: string) =>
  jwt.sign({ email }, process.env.JWT_SECRET as string, { expiresIn: "1h" });

const publicAuthor = (author: Author) => ({
  name: author.name,
  email: author.email,
});

const seedAuthor = async ({
  name = "Test Author",
  email = "author@example.com",
  password = "password123",
} = {}) => {
  const author = {
    name,
    email,
    password: await bcrypt.hash(password, 10),
  };

  authors.set(email, author);

  return {
    author,
    password,
    token: tokenFor(email),
  };
};

const seedBook = ({
  isbn = "9780000000001",
  title = "Test Book",
  price = 19.99,
  published_date = "2026-06-05",
  author_email = "author@example.com",
} = {}) => {
  const book = { isbn, title, price, published_date, author_email };
  books.set(isbn, book);
  return book;
};

const installFakeDb = () => {
  db.one = async (query: string, params: any[]) => {
    const sql = normalizeSql(query);

    if (sql.startsWith("INSERT INTO authors")) {
      const [name, email, password] = params;
      const author = { name, email, password };
      authors.set(email, author);
      return publicAuthor(author);
    }

    if (sql.startsWith("INSERT INTO books")) {
      const [isbn, title, price, published_date, author_email] = params;
      if (!author_email || !authors.has(author_email)) {
        throw new Error("author_email must reference an existing author");
      }

      const book = { isbn, title, price, published_date, author_email };
      books.set(isbn, book);
      return book;
    }

    throw new Error(`Unhandled db.one query: ${sql}`);
  };

  db.oneOrNone = async (query: string, params: any[]) => {
    const sql = normalizeSql(query);

    if (sql.startsWith("SELECT * FROM authors WHERE email = $1")) {
      return authors.get(params[0]) ?? null;
    }

    if (sql.startsWith("DELETE FROM authors WHERE email = $1")) {
      const author = authors.get(params[0]);
      if (!author) {
        return null;
      }

      authors.delete(params[0]);
      for (const [isbn, book] of books.entries()) {
        if (book.author_email === params[0]) {
          books.delete(isbn);
        }
      }

      return publicAuthor(author);
    }

    if (
      sql.startsWith(
        "SELECT * FROM books WHERE isbn = $1 AND author_email = $2",
      )
    ) {
      const book = books.get(params[0]);
      return book?.author_email === params[1] ? book : null;
    }

    if (sql.startsWith("UPDATE books SET")) {
      const [title, price, published_date, isbn, author_email] = params;
      const book = books.get(isbn);
      if (!book || book.author_email !== author_email) {
        return null;
      }

      const updatedBook = { ...book, title, price, published_date };
      books.set(isbn, updatedBook);
      return updatedBook;
    }

    if (sql.startsWith("DELETE FROM books WHERE isbn = $1")) {
      const [isbn, author_email] = params;
      const book = books.get(isbn);
      if (!book || book.author_email !== author_email) {
        return null;
      }

      books.delete(isbn);
      return book;
    }

    throw new Error(`Unhandled db.oneOrNone query: ${sql}`);
  };

  db.any = async (query: string, params: any[]) => {
    const sql = normalizeSql(query);

    if (sql.startsWith("SELECT * FROM books WHERE author_email = $1")) {
      return Array.from(books.values()).filter(
        (book) => book.author_email === params[0],
      );
    }

    throw new Error(`Unhandled db.any query: ${sql}`);
  };
};

const request = async (
  method: string,
  path: string,
  options: { body?: unknown; token?: string } = {},
) => {
  const headers: Record<string, string> = {};
  const init: any = { method, headers };

  if (options.body !== undefined) {
    headers["content-type"] = "application/json";
    init.body = JSON.stringify(options.body);
  }

  if (options.token) {
    headers.authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, init);
  const text = await response.text();

  return {
    status: response.status,
    body: text ? JSON.parse(text) : undefined,
  };
};

before(async () => {
  installFakeDb();
  server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address();
  assert.ok(address && typeof address === "object");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

beforeEach(() => {
  authors.clear();
  books.clear();
});

describe("author REST API", () => {
  it("registers an author, hashes the password, and returns a token", async () => {
    const response = await request("POST", "/api/authors/register", {
      body: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "secret123",
      },
    });

    assert.equal(response.status, 201);
    assert.deepEqual(response.body.author, {
      name: "Ada Lovelace",
      email: "ada@example.com",
    });
    assert.equal(typeof response.body.token, "string");

    const storedAuthor = authors.get("ada@example.com");
    assert.ok(storedAuthor);
    assert.notEqual(storedAuthor.password, "secret123");
    assert.equal(await bcrypt.compare("secret123", storedAuthor.password), true);
  });

  it("rejects duplicate author registration", async () => {
    await seedAuthor({ email: "ada@example.com" });

    const response = await request("POST", "/api/authors/register", {
      body: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "secret123",
      },
    });

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { message: "Author already exists" });
  });

  it("logs in an author with valid credentials", async () => {
    await seedAuthor({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "secret123",
    });

    const response = await request("POST", "/api/authors/login", {
      body: {
        email: "ada@example.com",
        password: "secret123",
      },
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body.author, {
      name: "Ada Lovelace",
      email: "ada@example.com",
    });
    assert.equal(typeof response.body.token, "string");
  });

  it("rejects login for an unknown author", async () => {
    const response = await request("POST", "/api/authors/login", {
      body: {
        email: "missing@example.com",
        password: "secret123",
      },
    });

    assert.equal(response.status, 404);
    assert.deepEqual(response.body, { message: "Author not found" });
  });

  it("rejects login with an invalid password", async () => {
    await seedAuthor({
      email: "ada@example.com",
      password: "secret123",
    });

    const response = await request("POST", "/api/authors/login", {
      body: {
        email: "ada@example.com",
        password: "wrong-password",
      },
    });

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { message: "Invalid credentials" });
  });

  it("requires a token before deleting an author", async () => {
    const response = await request("DELETE", "/api/authors/delete");

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { message: "No token provided" });
  });

  it("deletes the authenticated author", async () => {
    const { token } = await seedAuthor({
      name: "Ada Lovelace",
      email: "ada@example.com",
    });

    const response = await request("DELETE", "/api/authors/delete", { token });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      message: "Author deleted successfully",
      author: {
        name: "Ada Lovelace",
        email: "ada@example.com",
      },
    });
    assert.equal(authors.has("ada@example.com"), false);
  });
});

describe("book REST API", () => {
  it("requires a token for protected book routes", async () => {
    const response = await request("GET", "/api/books/get-books");

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { message: "No token provided" });
  });

  it("rejects invalid tokens for protected book routes", async () => {
    const response = await request("GET", "/api/books/get-books", {
      token: "not-a-valid-token",
    });

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { message: "Invalid token" });
  });

  it("creates a book for the authenticated author", async () => {
    const { token } = await seedAuthor({ email: "ada@example.com" });

    const response = await request("POST", "/api/books/create-book", {
      token,
      body: {
        isbn: "9780000000001",
        title: "Notes on the Analytical Engine",
        price: 24.99,
        published_date: "2026-06-05",
      },
    });

    assert.equal(response.status, 201);
    assert.deepEqual(response.body.book, {
      isbn: "9780000000001",
      title: "Notes on the Analytical Engine",
      price: 24.99,
      published_date: "2026-06-05",
      author_email: "ada@example.com",
    });
  });

  it("lists books owned by the authenticated author", async () => {
    const { token } = await seedAuthor({ email: "ada@example.com" });
    await seedAuthor({ email: "grace@example.com" });
    seedBook({ isbn: "9780000000001", author_email: "ada@example.com" });
    seedBook({ isbn: "9780000000002", author_email: "grace@example.com" });

    const response = await request("GET", "/api/books/get-books", { token });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body.books, [
      {
        isbn: "9780000000001",
        title: "Test Book",
        price: 19.99,
        published_date: "2026-06-05",
        author_email: "ada@example.com",
      },
    ]);
  });

  it("gets one owned book by ISBN", async () => {
    const { token } = await seedAuthor({ email: "ada@example.com" });
    seedBook({
      isbn: "9780000000001",
      title: "Owned Book",
      author_email: "ada@example.com",
    });

    const response = await request("GET", "/api/books/get-book/9780000000001", {
      token,
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body.book, {
      isbn: "9780000000001",
      title: "Owned Book",
      price: 19.99,
      published_date: "2026-06-05",
      author_email: "ada@example.com",
    });
  });

  it("returns 404 when the requested book is missing", async () => {
    const { token } = await seedAuthor({ email: "ada@example.com" });

    const response = await request("GET", "/api/books/get-book/missing-isbn", {
      token,
    });

    assert.equal(response.status, 404);
    assert.deepEqual(response.body, { message: "Book not found" });
  });

  it("updates an owned book", async () => {
    const { token } = await seedAuthor({ email: "ada@example.com" });
    seedBook({ isbn: "9780000000001", author_email: "ada@example.com" });

    const response = await request("PUT", "/api/books/update-book/9780000000001", {
      token,
      body: {
        title: "Updated Book",
        price: 29.99,
        published_date: "2026-06-06",
      },
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      message: "Book updated successfully",
      book: {
        isbn: "9780000000001",
        title: "Updated Book",
        price: 29.99,
        published_date: "2026-06-06",
        author_email: "ada@example.com",
      },
    });
  });

  it("does not update another author's book", async () => {
    const { token } = await seedAuthor({ email: "ada@example.com" });
    await seedAuthor({ email: "grace@example.com" });
    seedBook({ isbn: "9780000000001", author_email: "grace@example.com" });

    const response = await request("PUT", "/api/books/update-book/9780000000001", {
      token,
      body: {
        title: "Updated Book",
        price: 29.99,
        published_date: "2026-06-06",
      },
    });

    assert.equal(response.status, 404);
    assert.deepEqual(response.body, { message: "Book not found" });
  });

  it("deletes an owned book", async () => {
    const { token } = await seedAuthor({ email: "ada@example.com" });
    seedBook({ isbn: "9780000000001", author_email: "ada@example.com" });

    const response = await request(
      "DELETE",
      "/api/books/delete-book/9780000000001",
      { token },
    );

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      message: "Book deleted successfully",
      book: {
        isbn: "9780000000001",
        title: "Test Book",
        price: 19.99,
        published_date: "2026-06-05",
        author_email: "ada@example.com",
      },
    });
    assert.equal(books.has("9780000000001"), false);
  });
});
