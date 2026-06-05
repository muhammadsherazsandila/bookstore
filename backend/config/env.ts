import dotenv from "dotenv";

dotenv.config({ quiet: true });

const requireEnv = (name: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
};

export const env = {
  DATABASE_URL: requireEnv(
    "DATABASE_URL",
    process.env.DATABASE_URL ?? process.env.DB_URI,
  ),
  JWT_SECRET: requireEnv("JWT_SECRET", process.env.JWT_SECRET),
  ORIGINS: process.env.ORIGINS?.split(",").filter(Boolean) ?? [],
  PORT: process.env.PORT ?? "3000",
};
