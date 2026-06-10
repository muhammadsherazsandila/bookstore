import db from "../config/db.js";

// ─── LIKES CONTROLLER ────────────────────────────────────────────────────────

export const toggleLike = async (req: any, res: any) => {
  const { isbn } = req.params;
  const user_email = req.author_email.email;

  try {
    const existingLike = await db.oneOrNone(
      "SELECT * FROM likes WHERE user_email = $1 AND book_isbn = $2",
      [user_email, isbn]
    );

    let liked = false;
    if (existingLike) {
      await db.none("DELETE FROM likes WHERE user_email = $1 AND book_isbn = $2", [
        user_email,
        isbn,
      ]);
    } else {
      await db.none(
        "INSERT INTO likes (user_email, book_isbn) VALUES ($1, $2)",
        [user_email, isbn]
      );
      liked = true;
    }

    const countResult = await db.one(
      "SELECT COUNT(*)::int as count FROM likes WHERE book_isbn = $1",
      [isbn]
    );

    res.status(200).json({
      message: liked ? "Book liked" : "Book unliked",
      liked,
      likes_count: countResult.count,
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLikes = async (req: any, res: any) => {
  const { isbn } = req.params;
  const user_email = req.author_email?.email;

  try {
    const countResult = await db.one(
      "SELECT COUNT(*)::int as count FROM likes WHERE book_isbn = $1",
      [isbn]
    );

    let liked = false;
    if (user_email) {
      const existingLike = await db.oneOrNone(
        "SELECT * FROM likes WHERE user_email = $1 AND book_isbn = $2",
        [user_email, isbn]
      );
      liked = !!existingLike;
    }

    res.status(200).json({
      likes_count: countResult.count,
      liked,
    });
  } catch (error) {
    console.error("Get likes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── REVIEWS CONTROLLER ──────────────────────────────────────────────────────

export const addReview = async (req: any, res: any) => {
  const { isbn } = req.params;
  const user_email = req.author_email.email;
  const { rating, comment } = req.body;

  if (rating === undefined || !comment) {
    return res.status(400).json({ message: "Rating and comment are required" });
  }

  try {
    const newReview = await db.one(
      `INSERT INTO reviews (user_email, book_isbn, rating, comment) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, user_email, book_isbn, rating, comment, created_at`,
      [user_email, isbn, rating, comment]
    );

    // Get reviewer details
    const reviewer = await db.one("SELECT name, avatar FROM authors WHERE email = $1", [user_email]);

    res.status(201).json({
      message: "Review added successfully",
      review: {
        ...newReview,
        author_name: reviewer.name,
        avatar: reviewer.avatar,
      },
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getReviews = async (req: any, res: any) => {
  const { isbn } = req.params;

  try {
    const reviews = await db.any(
      `SELECT r.id, r.user_email, r.book_isbn, r.rating, r.comment, r.created_at, a.name as author_name, a.avatar 
       FROM reviews r 
       JOIN authors a ON a.email = r.user_email 
       WHERE r.book_isbn = $1 
       ORDER BY r.created_at DESC`,
      [isbn]
    );

    res.status(200).json({ reviews });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteReview = async (req: any, res: any) => {
  const { id } = req.params;
  const user_email = req.author_email.email;

  try {
    const review = await db.oneOrNone("SELECT user_email FROM reviews WHERE id = $1", [id]);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user_email !== user_email) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await db.none("DELETE FROM reviews WHERE id = $1", [id]);
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── COLLECTIONS CONTROLLER ──────────────────────────────────────────────────

export const createCollection = async (req: any, res: any) => {
  const user_email = req.author_email.email;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Collection name is required" });
  }

  try {
    const newCollection = await db.one(
      `INSERT INTO collections (name, description, user_email) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, description, user_email]
    );

    res.status(201).json({
      message: "Playlist created successfully",
      collection: newCollection,
    });
  } catch (error) {
    console.error("Create collection error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCollections = async (req: any, res: any) => {
  const user_email = req.author_email.email;

  try {
    const collections = await db.any(
      `SELECT c.*, COUNT(cb.book_isbn)::int as book_count 
       FROM collections c 
       LEFT JOIN collection_books cb ON cb.collection_id = c.id 
       WHERE c.user_email = $1 
       GROUP BY c.id 
       ORDER BY c.created_at DESC`,
      [user_email]
    );

    res.status(200).json({ collections });
  } catch (error) {
    console.error("Get collections error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteCollection = async (req: any, res: any) => {
  const { id } = req.params;
  const user_email = req.author_email.email;

  try {
    const collection = await db.oneOrNone("SELECT user_email FROM collections WHERE id = $1", [id]);
    if (!collection) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (collection.user_email !== user_email) {
      return res.status(403).json({ message: "Not authorized to delete this playlist" });
    }

    await db.none("DELETE FROM collections WHERE id = $1", [id]);
    res.status(200).json({ message: "Playlist deleted successfully" });
  } catch (error) {
    console.error("Delete collection error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addBookToCollection = async (req: any, res: any) => {
  const { id, isbn } = req.params;
  const user_email = req.author_email.email;

  try {
    const collection = await db.oneOrNone("SELECT user_email FROM collections WHERE id = $1", [id]);
    if (!collection) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (collection.user_email !== user_email) {
      return res.status(403).json({ message: "Not authorized to modify this playlist" });
    }

    await db.none(
      "INSERT INTO collection_books (collection_id, book_isbn) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [id, isbn]
    );

    res.status(200).json({ message: "Book added to playlist successfully" });
  } catch (error) {
    console.error("Add book to collection error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeBookFromCollection = async (req: any, res: any) => {
  const { id, isbn } = req.params;
  const user_email = req.author_email.email;

  try {
    const collection = await db.oneOrNone("SELECT user_email FROM collections WHERE id = $1", [id]);
    if (!collection) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (collection.user_email !== user_email) {
      return res.status(403).json({ message: "Not authorized to modify this playlist" });
    }

    await db.none(
      "DELETE FROM collection_books WHERE collection_id = $1 AND book_isbn = $2",
      [id, isbn]
    );

    res.status(200).json({ message: "Book removed from playlist successfully" });
  } catch (error) {
    console.error("Remove book from collection error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCollectionBooks = async (req: any, res: any) => {
  const { id } = req.params;
  const user_email = req.author_email.email;

  try {
    const collection = await db.oneOrNone("SELECT user_email FROM collections WHERE id = $1", [id]);
    if (!collection) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (collection.user_email !== user_email) {
      return res.status(403).json({ message: "Not authorized to view this playlist" });
    }

    const books = await db.any(
      `SELECT b.*, a.name as author_name 
       FROM collection_books cb 
       JOIN books b ON b.isbn = cb.book_isbn 
       JOIN authors a ON a.email = b.author_email 
       WHERE cb.collection_id = $1 
       ORDER BY cb.created_at DESC`,
      [id]
    );

    res.status(200).json({ books });
  } catch (error) {
    console.error("Get collection books error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
