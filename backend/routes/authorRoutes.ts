import express from "express";
import {
  deleteAuthor,
  loginAuthor,
  registerAuthor,
} from "../controllers/authorController.js";
import { protectedRoute } from "../middlewares/auth.js";
export const router = express.Router();

router.post("/register", registerAuthor);
router.post("/login", loginAuthor);
router.delete("/delete", protectedRoute, deleteAuthor);
