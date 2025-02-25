import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import connectionRoutes from './routes/connection.route.js'

import { connectToDB } from "./lib/db.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({limit: '5mb'}));
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoute);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/connections", connectionRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectToDB();
});
