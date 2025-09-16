import mongoose from "mongoose";

import { DEV_DB_URL, NODE_ENV, PROD_DB_URL } from "./serverConfig.js";

export default async function connectDB() {
  try {
    await mongoose.connect(
      NODE_ENV === "development" ? DEV_DB_URL : PROD_DB_URL
    );
    console.log(`Connected to the mongo database ${NODE_ENV} successfully`);
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}
