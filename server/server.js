require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "localhost";

const authRoutes = require("./routes/auth.route");
const newsRoutes = require("./routes/news.route");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);

mongoose
  .connect(
    "mongodb+srv://user:Yjf0CelLvYQOF50K@backenddb.lxmhq.mongodb.net/nodedb?retryWrites=true&w=majority&appName=BackendDB"
  )
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on ${HOST}:${PORT}`);
    });
    console.log("Connected to MongoDB!");

    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        console.log("\nMongoDB connection closed.");
      } catch (err) {
        console.error("\nError closing MongoDB connection:", err);
      }

      server.close(() => {
        console.log("Server shutting down.");
        process.exit(0);
      });
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
