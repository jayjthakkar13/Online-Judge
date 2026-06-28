import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config";

import authRouter from "./routes/auth.routes";
import problemRouter from "./routes/problems.routes"

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 5000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use(problemRouter);

connectDB()
  .then(() => {
    console.log('MongoDB is connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err: Error) => console.error('MongoDB Connection Error', err));

export default app;