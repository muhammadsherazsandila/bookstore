import db from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import { verifyToken } from "../utils/jwt.js";

const getAccount = async (email: string) =>
  db.oneOrNone("SELECT name, email, role FROM authors WHERE email = $1", [
    email,
  ]);

const requireAuthorAccount = async (req: any, res: any) => {
  const account = await getAccount(req.author_email.email);
  if (!account) {
    res.status(404).json({ message: "Account not found" });
    return null;
  }
  if (account.role !== "author") {
    res.status(403).json({ message: "Only author accounts can manage books" });
    return null;
  }
  return account;
};

const requireCloudinaryConfig = () => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("Cloudinary credentials are required to upload images");
  }
};

const uploadCoverImage = async (file?: Express.Multer.File) => {
  if (!file) return null;

  requireCloudinaryConfig();

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "bookstore/covers",
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        resolve(result.secure_url);
      },
    );

    stream.end(file.buffer);
  });
};

const getCloudinaryPublicId = (imageUrl?: string | null) => {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);
    const uploadIndex = url.pathname.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    const pathAfterUpload = url.pathname.slice(uploadIndex + "/upload/".length);
    const withoutVersion = pathAfterUpload.replace(/^v\d+\//, "");
    return withoutVersion.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
};

const deleteCoverImage = async (imageUrl?: string | null) => {
  const publicId = getCloudinaryPublicId(imageUrl);
  if (!publicId) return;

  requireCloudinaryConfig();
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.error("Delete cover image error:", error);
  }
};

export const createBook = async (req: any, res: any) => {
  const { isbn, title, price, published_date, category, description } = req.body;
  const author_email = req.author_email.email;
  try {
    const account = await requireAuthorAccount(req, res);
    if (!account) return;

    const coverImage = await uploadCoverImage(req.file);

    const newBook = await db.one(
      "INSERT INTO books (isbn, title, price, published_date, author_email, cover_image, category, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [isbn, title, price, published_date, author_email, coverImage, category, description],
    );
    res.status(201).json({
      message: "Book created successfully",
      book: newBook,
    });
  } catch (error) {
    console.error("Create book error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getBooks = async (req: any, res: any) => {
  const author_email = req.author_email.email;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 6;
  const offset = (page - 1) * limit;

  try {
    const account = await requireAuthorAccount(req, res);
    if (!account) return;

    const statsResult = await db.one(
      "SELECT COUNT(*)::int as count, COALESCE(SUM(price), 0)::float as total_value FROM books WHERE author_email = $1",
      [author_email]
    );
    const totalBooks = statsResult.count;
    const totalValue = statsResult.total_value;

    const books = await db.any(
      "SELECT * FROM books WHERE author_email = $1 ORDER BY created_at DESC, isbn ASC LIMIT $2 OFFSET $3",
      [author_email, limit, offset]
    );

    res.status(200).json({
      books,
      pagination: {
        totalBooks,
        totalPages: Math.ceil(totalBooks / limit),
        currentPage: page,
        limit,
        totalValue,
      },
    });
  } catch (error) {
    console.error("Get books error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPublicBooks = async (req: any, res: any) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;
  const offset = (page - 1) * limit;
  const category = req.query.category as string;

  try {
    let countQuery = "SELECT COUNT(*)::int as count FROM books";
    let booksQuery = `
      SELECT b.*, a.name as author_name, 
             (SELECT COUNT(*)::int FROM likes l WHERE l.book_isbn = b.isbn) as likes_count
      FROM books b 
      JOIN authors a ON a.email = b.author_email
    `;
    const queryParams: any[] = [];

    if (category) {
      countQuery += " WHERE category = $1";
      booksQuery += " WHERE b.category = $1";
      queryParams.push(category);
    }

    const statsResult = await db.one(countQuery, queryParams);
    const totalBooks = statsResult.count;

    booksQuery += ` ORDER BY b.created_at DESC, b.isbn ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    const books = await db.any(booksQuery, [...queryParams, limit, offset]);

    res.status(200).json({
      books,
      pagination: {
        totalBooks,
        totalPages: Math.ceil(totalBooks / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Get public books error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getBookByISBN = async (req: any, res: any) => {
  const { isbn } = req.params;
  const author_email = req.author_email.email;
  try {
    const account = await requireAuthorAccount(req, res);
    if (!account) return;

    const book = await db.oneOrNone(
      "SELECT * FROM books WHERE isbn = $1 AND author_email = $2",
      [isbn, author_email],
    );
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json({ book });
  } catch (error) {
    console.error("Get book by ISBN error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPublicBookByISBN = async (req: any, res: any) => {
  const { isbn } = req.params;
  
  // Try to check if token exists to get user_liked info
  let userEmail = null;
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    if (token) {
      try {
        const decoded = verifyToken(token);
        userEmail = (decoded as any).email;
      } catch (err) {
        // ignore invalid token in public route
      }
    }
  }

  try {
    const book = await db.oneOrNone(
      `SELECT b.*, a.name as author_name, 
              (SELECT COUNT(*)::int FROM likes l WHERE l.book_isbn = b.isbn) as likes_count
       FROM books b 
       JOIN authors a ON a.email = b.author_email 
       WHERE b.isbn = $1`,
      [isbn],
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    let user_liked = false;
    if (userEmail) {
      const existingLike = await db.oneOrNone(
        "SELECT 1 FROM likes WHERE user_email = $1 AND book_isbn = $2",
        [userEmail, isbn]
      );
      user_liked = !!existingLike;
    }

    res.status(200).json({ 
      book: {
        ...book,
        user_liked
      }
    });
  } catch (error) {
    console.error("Get public book by ISBN error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateBook = async (req: any, res: any) => {
  const author_email = req.author_email.email;
  const { isbn } = req.params;
  const { title, price, published_date, category, description } = req.body;
  try {
    const account = await requireAuthorAccount(req, res);
    if (!account) return;

    const existingBook = await db.oneOrNone(
      "SELECT cover_image FROM books WHERE isbn = $1 AND author_email = $2",
      [isbn, author_email],
    );
    if (!existingBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    const newCoverImage = await uploadCoverImage(req.file);
    const coverImage = newCoverImage ?? existingBook.cover_image;

    const updatedBook = await db.oneOrNone(
      "UPDATE books SET title = $1, price = $2, published_date = $3, cover_image = $4, category = $5, description = $6 WHERE isbn = $7 AND author_email = $8 RETURNING *",
      [title, price, published_date, coverImage, category, description, isbn, author_email],
    );

    if (newCoverImage && existingBook.cover_image) {
      await deleteCoverImage(existingBook.cover_image);
    }

    res.status(200).json({
      message: "Book updated successfully",
      book: updatedBook,
    });
  } catch (error) {
    console.error("Update book error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteBook = async (req: any, res: any) => {
  const author_email = req.author_email.email;
  const { isbn } = req.params;
  try {
    const account = await requireAuthorAccount(req, res);
    if (!account) return;

    const deletedBook = await db.oneOrNone(
      "DELETE FROM books WHERE isbn = $1 AND author_email = $2 RETURNING *",
      [isbn, author_email],
    );
    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    await deleteCoverImage(deletedBook.cover_image);

    res.status(200).json({
      message: "Book deleted successfully",
      book: deletedBook,
    });
  } catch (error) {
    console.error("Delete book error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const saveBook = async (req: any, res: any) => {
  const user_email = req.author_email.email;
  const { isbn } = req.params;

  try {
    const book = await db.oneOrNone("SELECT isbn FROM books WHERE isbn = $1", [
      isbn,
    ]);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    await db.none(
      "INSERT INTO saved_books (user_email, isbn) VALUES ($1, $2) ON CONFLICT (user_email, isbn) DO NOTHING",
      [user_email, isbn],
    );

    res.status(200).json({ message: "Book saved successfully" });
  } catch (error) {
    console.error("Save book error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const unsaveBook = async (req: any, res: any) => {
  const user_email = req.author_email.email;
  const { isbn } = req.params;

  try {
    await db.none("DELETE FROM saved_books WHERE user_email = $1 AND isbn = $2", [
      user_email,
      isbn,
    ]);
    res.status(200).json({ message: "Book removed from saved books" });
  } catch (error) {
    console.error("Unsave book error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSavedBooks = async (req: any, res: any) => {
  const user_email = req.author_email.email;

  try {
    const books = await db.any(
      `SELECT b.*, a.name as author_name, sb.created_at as saved_at,
              (SELECT COUNT(*)::int FROM likes l WHERE l.book_isbn = b.isbn) as likes_count
       FROM saved_books sb 
       JOIN books b ON b.isbn = sb.isbn 
       JOIN authors a ON a.email = b.author_email 
       WHERE sb.user_email = $1 
       ORDER BY sb.created_at DESC`,
      [user_email],
    );

    res.status(200).json({ books });
  } catch (error) {
    console.error("Get saved books error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
