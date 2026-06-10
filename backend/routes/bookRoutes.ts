import express from "express";
import {
  createBook,
  deleteBook,
  getBookByISBN,
  getBooks,
  getPublicBookByISBN,
  getPublicBooks,
  getSavedBooks,
  saveBook,
  unsaveBook,
  updateBook,
} from "../controllers/bookController.js";
import {
  toggleLike,
  getLikes,
  addReview,
  getReviews,
  deleteReview,
} from "../controllers/featuresController.js";
import { protectedRoute } from "../middlewares/auth.js";
import {
  createBookValidationRules,
  updateBookValidationRules,
  isbnParamValidationRules,
  getBooksValidationRules,
  handleValidationErrors,
} from "../middlewares/validation.js";
import { uploadCoverImage } from "../middlewares/upload.js";

export const router = express.Router();

router.get(
  "/public",
  getBooksValidationRules,
  handleValidationErrors,
  getPublicBooks
);
router.get(
  "/public/:isbn",
  isbnParamValidationRules,
  handleValidationErrors,
  getPublicBookByISBN
);
router.get("/saved", protectedRoute, getSavedBooks);
router.post(
  "/saved/:isbn",
  protectedRoute,
  isbnParamValidationRules,
  handleValidationErrors,
  saveBook
);
router.delete(
  "/saved/:isbn",
  protectedRoute,
  isbnParamValidationRules,
  handleValidationErrors,
  unsaveBook
);
router.post(
  "/create-book",
  protectedRoute,
  uploadCoverImage,
  createBookValidationRules,
  handleValidationErrors,
  createBook
);
router.put(
  "/update-book/:isbn",
  protectedRoute,
  uploadCoverImage,
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

// Likes
router.post(
  "/public/:isbn/like",
  protectedRoute,
  isbnParamValidationRules,
  handleValidationErrors,
  toggleLike
);
router.get(
  "/public/:isbn/likes",
  isbnParamValidationRules,
  handleValidationErrors,
  getLikes
);

// Reviews
router.post(
  "/public/:isbn/reviews",
  protectedRoute,
  isbnParamValidationRules,
  handleValidationErrors,
  addReview
);
router.get(
  "/public/:isbn/reviews",
  isbnParamValidationRules,
  handleValidationErrors,
  getReviews
);
router.delete(
  "/public/reviews/:id",
  protectedRoute,
  deleteReview
);
