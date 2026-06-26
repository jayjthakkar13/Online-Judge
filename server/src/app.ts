import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 5000;

app.use(cors());

connectDB()
  .then(() => {
    console.log('MongoDB is connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err: Error) => console.error('MongoDB Connection Error', err));

export default app;