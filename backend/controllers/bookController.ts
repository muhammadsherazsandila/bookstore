import db from "../config/db.js";

export const createBook = async (req: any, res: any) => {
  const { isbn, title, price, published_date } = req.body;
  const author_email = req.author_email.email;
  try {
    const newBook = await db.one(
      "INSERT INTO books (isbn, title, price, published_date, author_email) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [isbn, title, price, published_date, author_email],
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

export const getBookByISBN = async (req: any, res: any) => {
  const { isbn } = req.params;
  const author_email = req.author_email.email;
  try {
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

export const updateBook = async (req: any, res: any) => {
  const author_email = req.author_email.email;
  const { isbn } = req.params;
  const { title, price, published_date } = req.body;
  try {
    const updatedBook = await db.oneOrNone(
      "UPDATE books SET title = $1, price = $2, published_date = $3 WHERE isbn = $4 AND author_email = $5 RETURNING *",
      [title, price, published_date, isbn, author_email],
    );
    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
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
    const deletedBook = await db.oneOrNone(
      "DELETE FROM books WHERE isbn = $1 AND author_email = $2 RETURNING *",
      [isbn, author_email],
    );
    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json({
      message: "Book deleted successfully",
      book: deletedBook,
    });
  } catch (error) {
    console.error("Delete book error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
