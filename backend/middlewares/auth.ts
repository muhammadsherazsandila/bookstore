import { verifyToken } from "../utils/jwt.ts";
export const protectedRoute = (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    try {
      const decoded = verifyToken(token);
      req.author_email = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
