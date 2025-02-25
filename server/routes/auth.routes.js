const express = require("express");
const { fetchAllUsers } = require("../services/auth.services");
const { loginUser, registerUser, forgotPassword, resetPassword, updateUser } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/admin", fetchAllUsers);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Add the update user details route
router.put("/update-user", updateUser);

module.exports = router;
