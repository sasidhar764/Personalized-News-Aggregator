require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;
const HOST = process.env.HOST || "localhost";

// Import routes
const authRoutes = require("./routes/auth.routes");
const newsRoute = require('./routes/news.route');

// Middleware
app.use(express.json());
app.use(cors());

// Public routes
app.use("/api", authRoutes);

// Protected routes
app.use('/api/news', newsRoute);

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});