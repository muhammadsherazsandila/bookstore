import dotenv from "dotenv";
import pgp from "pg-promise";
dotenv.config();
const DB_URI: any = process.env.DB_URI;
const pgpInit = pgp();
const db = pgpInit(DB_URI);
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
