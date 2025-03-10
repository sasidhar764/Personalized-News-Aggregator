const express = require("express");
const { 
    loginUser, 
    registerUser, 
    forgotPassword, 
    resetPassword, 
    updateUserProfile, 
    fetchAllUsersAdmin, 
    deleteUserController 
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/admin", fetchAllUsersAdmin);
router.delete("/admin/deleteuser/:username", deleteUserController);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/update-user", updateUserProfile);

module.exports = router;