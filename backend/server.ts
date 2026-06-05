import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { router as authorRoutes } from "./routes/authorRoutes.js";
import { router as bookRoutes } from "./routes/bookRoutes.js";

export const createApp = () => {
  const app = express();

  // use required middleware
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || env.ORIGINS.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
    }),
  );
  app.use(express.json());

  // use routes
  app.use("/api/authors", authorRoutes);
  app.use("/api/books", bookRoutes);

  return app;
};

export const app = createApp();

export const startServer = () => {
  connectDatabase();

  return app.listen(env.PORT, () => {
    console.log(`Server is running on http://localhost:${env.PORT}`);
  });
};

const currentFile = path.normalize(fileURLToPath(import.meta.url));
const entryFile = process.argv[1]
  ? path.normalize(path.resolve(process.argv[1]))
  : "";

if (entryFile && currentFile.toLowerCase() === entryFile.toLowerCase()) {
  startServer();
}
