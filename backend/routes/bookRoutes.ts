import express from "express";
import {
  createBook,
  deleteBook,
  getBookByISBN,
  getBooks,
  updateBook,
} from "../controllers/bookController.ts";
import { protectedRoute } from "../middlewares/auth.ts";
export const router = express.Router();

router.post("/create-book", protectedRoute, createBook);
router.put("/update-book/:isbn", protectedRoute, updateBook);
router.delete("/delete-book/:isbn", protectedRoute, deleteBook);
router.get("/get-books", protectedRoute, getBooks);
router.get("/get-book/:isbn", protectedRoute, getBookByISBN);
