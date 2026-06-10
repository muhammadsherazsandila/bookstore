import express from "express";
import {
  deleteAuthor,
  getPublicAuthorByEmail,
  getPublicAuthors,
  loginAuthor,
  registerAuthor,
  updateProfile,
} from "../controllers/authorController.js";
import { protectedRoute } from "../middlewares/auth.js";
import {
  registerValidationRules,
  loginValidationRules,
  handleValidationErrors,
} from "../middlewares/validation.js";

export const router = express.Router();

router.get("/", getPublicAuthors);
router.get("/:email", getPublicAuthorByEmail);
router.post(
  "/register",
  registerValidationRules,
  handleValidationErrors,
  registerAuthor
);
router.post(
  "/login",
  loginValidationRules,
  handleValidationErrors,
  loginAuthor
);
router.put("/profile", protectedRoute, updateProfile);
router.delete("/delete", protectedRoute, deleteAuthor);
