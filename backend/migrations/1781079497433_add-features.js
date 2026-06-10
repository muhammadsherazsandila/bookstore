/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  // Add columns to books
  pgm.addColumns("books", {
    category: {
      type: "varchar(100)",
      notNull: false,
    },
    description: {
      type: "text",
      notNull: false,
    },
  });

  // Add columns to authors/users
  pgm.addColumns("authors", {
    bio: {
      type: "text",
      notNull: false,
    },
    avatar: {
      type: "text",
      notNull: false,
    },
  });

  // Create likes table
  pgm.createTable("likes", {
    user_email: {
      type: "varchar(255)",
      notNull: true,
      references: "authors(email)",
      onDelete: "cascade",
    },
    book_isbn: {
      type: "varchar(20)",
      notNull: true,
      references: "books(isbn)",
      onDelete: "cascade",
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.addConstraint("likes", "likes_pkey", {
    primaryKey: ["user_email", "book_isbn"],
  });

  // Create reviews table
  pgm.createTable("reviews", {
    id: {
      type: "serial",
      primaryKey: true,
    },
    user_email: {
      type: "varchar(255)",
      notNull: true,
      references: "authors(email)",
      onDelete: "cascade",
    },
    book_isbn: {
      type: "varchar(20)",
      notNull: true,
      references: "books(isbn)",
      onDelete: "cascade",
    },
    rating: {
      type: "integer",
      notNull: true,
    },
    comment: {
      type: "text",
      notNull: true,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Create collections/playlists table
  pgm.createTable("collections", {
    id: {
      type: "serial",
      primaryKey: true,
    },
    name: {
      type: "varchar(255)",
      notNull: true,
    },
    description: {
      type: "text",
      notNull: false,
    },
    user_email: {
      type: "varchar(255)",
      notNull: true,
      references: "authors(email)",
      onDelete: "cascade",
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Create collection_books table
  pgm.createTable("collection_books", {
    collection_id: {
      type: "integer",
      notNull: true,
      references: "collections(id)",
      onDelete: "cascade",
    },
    book_isbn: {
      type: "varchar(20)",
      notNull: true,
      references: "books(isbn)",
      onDelete: "cascade",
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.addConstraint("collection_books", "collection_books_pkey", {
    primaryKey: ["collection_id", "book_isbn"],
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("collection_books");
  pgm.dropTable("collections");
  pgm.dropTable("reviews");
  pgm.dropTable("likes");
  pgm.dropColumns("authors", ["bio", "avatar"]);
  pgm.dropColumns("books", ["category", "description"]);
};
