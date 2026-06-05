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
      author: { name: author.name, email: author.email },
      token: generateToken(author.email),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const registerAuthor = async (req: any, res: any) => {
  const { name, email, password } = req.body;
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
      "INSERT INTO authors (name, email, password) VALUES ($1, $2, $3) RETURNING name, email",
      [name, email, hashedPassword],
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

export const deleteAuthor = async (req: any, res: any) => {
  const author_email = req.author_email;
  try {
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
