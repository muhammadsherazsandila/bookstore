import express from "express";
import { protectedRoute } from "../middlewares/auth.js";
import {
  createCollection,
  getCollections,
  deleteCollection,
  addBookToCollection,
  removeBookFromCollection,
  getCollectionBooks,
} from "../controllers/featuresController.js";

export const router = express.Router();

router.post("/", protectedRoute, createCollection);
router.get("/", protectedRoute, getCollections);
router.delete("/:id", protectedRoute, deleteCollection);
router.post("/:id/books/:isbn", protectedRoute, addBookToCollection);
router.delete("/:id/books/:isbn", protectedRoute, removeBookFromCollection);
router.get("/:id/books", protectedRoute, getCollectionBooks);
