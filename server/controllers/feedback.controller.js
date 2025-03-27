const Feedback = require("../models/feedback.model");
const User = require("../models/user.model");

const submitFeedback = async (req, res) => {
    try {
        const { username, category, message, phoneNumber, email } = req.body;
        if (!username || !category || !message || !email) {
            return res.status(400).json({ error: "Username, category, message, and email are required." });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found. Invalid username." });
        }

        if (phoneNumber) {
            const phoneRegex = /^\+?[1-9]\d{1,14}$/;
            if (!phoneRegex.test(phoneNumber)) {
                return res.status(400).json({ error: "Invalid phone number format." });
            }
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format." });
        }

        const feedback = new Feedback({
            username,
            category,
            message,
            phoneNumber: phoneNumber || "",
            email
        });

        await feedback.save();

        res.json({ message: "Feedback submitted successfully." });
    } catch (error) {
        console.error("Error submitting feedback:", error.message);
        res.status(500).json({ error: "Failed to submit feedback." });
    }
};

const getAllFeedback = async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ error: "Username is required." });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        if (user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admin role required." });
        }

        const feedback = await Feedback.find().sort({ submittedAt: -1 });
        res.json(feedback);
    } catch (error) {
        console.error("Error fetching feedback:", error.message);
        res.status(500).json({ error: "Failed to fetch feedback." });
    }
};

const updateFeedbackStatus = async (req, res) => {
    try {
        const { username, feedbackId, status } = req.body;
        if (!username || !feedbackId || !status) {
            return res.status(400).json({ error: "Username, feedback ID, and status are required." });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        if (user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admin role required." });
        }

        const feedback = await Feedback.findById(feedbackId);
        if (!feedback) {
            return res.status(404).json({ error: "Feedback not found." });
        }

        const validStatuses = ["Pending", "Reviewed", "Resolved", "Dismissed"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status value." });
        }

        feedback.status = status;
        await feedback.save();

        res.json({ message: "Feedback status updated successfully." });
    } catch (error) {
        console.error("Error updating feedback status:", error.message);
        res.status(500).json({ error: "Failed to update feedback status." });
    }
};

module.exports = {
    submitFeedback,
    getAllFeedback,
    updateFeedbackStatus
};
