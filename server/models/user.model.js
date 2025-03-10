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
            type: [String], // Accepts an array of strings
            default: [], // Default category if not provided
        },
        country: {
            type: String,
            default: 'India' // Default country if not provided
        },
        language: {
            type: String,
            default: 'English' // Default language if not provided
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;