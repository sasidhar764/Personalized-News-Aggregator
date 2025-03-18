const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        preferredCategory: {
            type: [String],
            default: [],
        },
        country: {
            type: String,
            default: 'India'
        },
        language: {
            type: String,
            default: 'English'
        },
        bookmarks: {
            type: [String],
            default: []
        },
        reportedArticles: {
            type: [String],
            default: []
        },
        summary: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
