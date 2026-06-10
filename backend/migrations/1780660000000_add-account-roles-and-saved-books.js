/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.addColumn("authors", {
    role: {
      type: "varchar(20)",
      notNull: true,
      default: "author",
    },
  });

  pgm.addConstraint("authors", "authors_role_check", {
    check: "role IN ('author', 'user')",
  });

  pgm.createTable("saved_books", {
    user_email: {
      type: "varchar(255)",
      notNull: true,
      references: "authors(email)",
      onDelete: "cascade",
    },
    isbn: {
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

  pgm.addConstraint("saved_books", "saved_books_pkey", {
    primaryKey: ["user_email", "isbn"],
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("saved_books");
  pgm.dropConstraint("authors", "authors_role_check");
  pgm.dropColumn("authors", "role");
};
