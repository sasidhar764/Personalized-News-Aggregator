const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            "Bug Report",
            "Feature Suggestion",
            "Content Issue",
            "User Experience",
            "Performance Issue",
            "Other"
        ]
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true,
        default: ""
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["Pending", "Reviewed", "Resolved", "Dismissed"],
        default: "Pending"
    }
}, { timestamps: true });

module.exports = mongoose.model("Feedback", FeedbackSchema);
