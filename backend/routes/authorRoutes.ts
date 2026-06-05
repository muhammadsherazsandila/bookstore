import express from "express";
import {
  deleteAuthor,
  loginAuthor,
  registerAuthor,
} from "../controllers/authorController.js";
import { protectedRoute } from "../middlewares/auth.js";
import {
  registerValidationRules,
  loginValidationRules,
  handleValidationErrors,
} from "../middlewares/validation.js";

export const router = express.Router();

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
router.delete("/delete", protectedRoute, deleteAuthor);
