import express from "express";
import {
  createBook,
  deleteBook,
  getBookByISBN,
  getBooks,
  updateBook,
} from "../controllers/bookController.js";
import { protectedRoute } from "../middlewares/auth.js";
import {
  createBookValidationRules,
  updateBookValidationRules,
  isbnParamValidationRules,
  getBooksValidationRules,
  handleValidationErrors,
} from "../middlewares/validation.js";

export const router = express.Router();

router.post(
  "/create-book",
  protectedRoute,
  createBookValidationRules,
  handleValidationErrors,
  createBook
);
router.put(
  "/update-book/:isbn",
  protectedRoute,
  updateBookValidationRules,
  handleValidationErrors,
  updateBook
);
router.delete(
  "/delete-book/:isbn",
  protectedRoute,
  isbnParamValidationRules,
  handleValidationErrors,
  deleteBook
);
router.get(
  "/get-books",
  protectedRoute,
  getBooksValidationRules,
  handleValidationErrors,
  getBooks
);
router.get(
  "/get-book/:isbn",
  protectedRoute,
  isbnParamValidationRules,
  handleValidationErrors,
  getBookByISBN
);
