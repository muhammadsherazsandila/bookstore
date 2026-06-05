import bcrypt from "bcrypt";
import db from "../config/db.ts";

export const loginAuthor = async (req: any, res: any) => {
  const { email, password } = req.body;
  try {
    const author = await db.one("SELECT * FROM authors WHERE email = $1", [
      email,
    ]);
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }
    const isMatch = await bcrypt.compare(password, author.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    res.status(200).json({
      message: "Login successful",
      author: { id: author.id, name: author.name, email: author.email },
    });
  } catch (error) {
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
      "INSERT INTO authors (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword],
    );
    res.status(201).json({
      message: "Author registered successfully",
      author: newAuthor,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
