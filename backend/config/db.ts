import pgp from "pg-promise";
import { env } from "./env.ts";

const pgpInit = pgp();
const db = pgpInit(env.DATABASE_URL);
export const connectDatabase = () =>
  db
    .connect()
    .then((obj) => {
      console.log("Connected to the database successfully!");
      obj.done(); // release the connection
    })
    .catch((error) => {
      console.error("Error connecting to the database:", error);
    });

export default db;
