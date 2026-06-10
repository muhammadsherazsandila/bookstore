import dotenv from "dotenv";

dotenv.config({ quiet: true });

const requireEnv = (name: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
};

const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

const configuredOrigins =
  process.env.ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

export const env = {
  DATABASE_URL: requireEnv(
    "DATABASE_URL",
    process.env.DATABASE_URL ?? process.env.DB_URI,
  ),
  JWT_SECRET: requireEnv("JWT_SECRET", process.env.JWT_SECRET),
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  ORIGINS: Array.from(new Set([...configuredOrigins, ...defaultOrigins])),
  PORT: process.env.PORT ?? "3000",
};
