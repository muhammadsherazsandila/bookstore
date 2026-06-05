import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const generateToken = (authorEmail: string) => {
  return jwt.sign({ email: authorEmail }, env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid token");
  }
};
