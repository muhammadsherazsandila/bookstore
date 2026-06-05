/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable("books", {
    isbn: {
      type: "varchar(20)",
      notNull: true,
      unique: true,
      primaryKey: true,
    },
    title: {
      type: "varchar(255)",
      notNull: true,
    },
    author_email: {
      type: "varchar(255)",
      notNull: true,
      references: "authors(email)",
      onDelete: "cascade",
    },
    price: {
      type: "decimal(10, 2)",
      notNull: true,
    },
    published_date: {
      type: "date",
      notNull: true,
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {};
