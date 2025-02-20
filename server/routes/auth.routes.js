const express = require("express");
const { loginUser, registerUser, forgotPassword, resetPassword } = require("../controllers/auth.controller");

const router = express.Router();

// Login route
router.post("/login", loginUser);

// Register route
router.post("/register", registerUser);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

module.exports = router;
