import { validationResult, body, param, query } from "express-validator";

export const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return standard error response
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

export const registerValidationRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

export const loginValidationRules = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const createBookValidationRules = [
  body("isbn").trim().notEmpty().withMessage("ISBN is required"),
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("price")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a number greater than 0"),
  body("published_date")
    .isISO8601()
    .withMessage("Invalid published date format (must be YYYY-MM-DD)"),
];

export const updateBookValidationRules = [
  param("isbn").trim().notEmpty().withMessage("ISBN route parameter is required"),
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
  body("price")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Price must be a number greater than 0"),
  body("published_date")
    .optional()
    .isISO8601()
    .withMessage("Invalid published date format (must be YYYY-MM-DD)"),
];

export const isbnParamValidationRules = [
  param("isbn").trim().notEmpty().withMessage("ISBN route parameter is required"),
];

export const getBooksValidationRules = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];
