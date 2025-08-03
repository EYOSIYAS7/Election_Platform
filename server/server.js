import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import tokenRoute from "./routes/token.js";
import userinfoRoute from "./routes/userinfo.js";
import associationRoute from "./routes/association.js";

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000", // Client/React front end dev server
    credentials: true,
  })
);
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI 
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/token", tokenRoute);
app.use("/api/userinfo", userinfoRoute);
app.use("/api/association", associationRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));