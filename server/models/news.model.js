const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: String, required: true },
    publishedAt: { type: Date, required: true },
    source: { type: String, required: true },
    verified: { type: Boolean, default: false }, // Default: not verified
    reportCount: { type: Number, default: 0 },
    reportedUsers: { type: [String], default: [] }, // List of user IDs
}, { timestamps: true });

module.exports = mongoose.model("News", NewsSchema);