const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "No description available" },
    url: { type: String, required: true, unique: true },
    publishedAt: { type: Date, default: Date.now },
    source: { type: String, default: "Unknown" },
    verified: { type: Boolean, default: false },
    reportCount: { type: Number, default: 0 },
    reportedUsers: { type: [String], default: [] },
    category: { type: String, default: "General" },
    language: { type: String, default: "" },
    country: { type: String, default: "" },
    viewcount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("News", NewsSchema);
