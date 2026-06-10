import bcrypt from "bcrypt";
import db from "../config/db.js";
import { generateToken } from "../utils/jwt.js";

export const loginAuthor = async (req: any, res: any) => {
  const { email, password } = req.body;
  try {
    const author = await db.oneOrNone(
      "SELECT * FROM authors WHERE email = $1",
      [email],
    );
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }
    const isMatch = await bcrypt.compare(password, author.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    res.status(200).json({
      message: "Login successful",
      author: { 
        name: author.name, 
        email: author.email, 
        role: author.role,
        bio: author.bio,
        avatar: author.avatar
      },
      token: generateToken(author.email),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const registerAuthor = async (req: any, res: any) => {
  const { name, email, password, role = "author" } = req.body;
  try {
    const existingAuthor = await db.oneOrNone(
      "SELECT * FROM authors WHERE email = $1",
      [email],
    );
    if (existingAuthor) {
      return res.status(400).json({ message: "Author already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAuthor = await db.one(
      "INSERT INTO authors (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING name, email, role, bio, avatar",
      [name, email, hashedPassword, role],
    );
    res.status(201).json({
      message: "Author registered successfully",
      author: newAuthor,
      token: generateToken(newAuthor.email),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPublicAuthors = async (_req: any, res: any) => {
  try {
    const authors = await db.any(
      "SELECT a.name, a.email, a.role, a.bio, a.avatar, COUNT(b.isbn)::int as book_count FROM authors a LEFT JOIN books b ON b.author_email = a.email WHERE a.role = 'author' GROUP BY a.email, a.name, a.role, a.bio, a.avatar ORDER BY a.name ASC",
    );
    res.status(200).json({ authors });
  } catch (error) {
    console.error("Get authors error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPublicAuthorByEmail = async (req: any, res: any) => {
  const { email } = req.params;
  try {
    const author = await db.oneOrNone(
      "SELECT name, email, role, bio, avatar FROM authors WHERE email = $1 AND role = 'author'",
      [email],
    );
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    const books = await db.any(
      "SELECT b.*, a.name as author_name FROM books b JOIN authors a ON a.email = b.author_email WHERE b.author_email = $1 ORDER BY b.created_at DESC, b.isbn ASC",
      [email],
    );

    res.status(200).json({ author, books });
  } catch (error) {
    console.error("Get author details error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req: any, res: any) => {
  const email = req.author_email.email;
  const { name, bio, avatar } = req.body;
  try {
    const updatedAuthor = await db.one(
      "UPDATE authors SET name = COALESCE($1, name), bio = COALESCE($2, bio), avatar = COALESCE($3, avatar) WHERE email = $4 RETURNING name, email, role, bio, avatar",
      [name, bio, avatar, email]
    );
    res.status(200).json({
      message: "Profile updated successfully",
      author: updatedAuthor
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteAuthor = async (req: any, res: any) => {
  const author_email = req.author_email;
  try {
    // 1. Delete all books of the author first (since books depend on the author)
    await db.none("DELETE FROM saved_books WHERE user_email = $1", [
      author_email.email,
    ]);
    await db.none("DELETE FROM books WHERE author_email = $1", [
      author_email.email,
    ]);

    // 2. Delete the author
    const deletedAuthor = await db.oneOrNone(
      "DELETE FROM authors WHERE email = $1 RETURNING name, email",
      [author_email.email],
    );
    if (!deletedAuthor) {
      return res.status(404).json({ message: "Author not found" });
    }
    res
      .status(200)
      .json({ message: "Author deleted successfully", author: deletedAuthor });
  } catch (error) {
    console.error("Delete author error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
