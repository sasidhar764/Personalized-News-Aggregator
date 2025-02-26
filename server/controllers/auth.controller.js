//auth.controller.js
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { 
  fetchUsers, 
  addUser, 
  updateUserDetails,
  updateUserPassword,
  deleteUser
} = require("../services/auth.services");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const CLIENT_HOST = process.env.CLIENT_HOST || "localhost";

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const users = await fetchUsers();
  const user = users.find((u) => u.username === username);

  if (!user) {
    return res.status(401).json({ error: "Invalid Username or Password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Incorrect Password" });
  }

  const token = jwt.sign(
    { username: user.username, email: user.email, role: user.role || "user" },
    JWT_SECRET,
    { expiresIn: "12h" }
  );

  return res.json({
    message: "Login successful",
    user: {
      username: user.username,
      role: user.role, email: user.email,
      preferredCategory: user.preferredCategory,
      language: user.language,
      country: user.country,
    },
    token,
  });
};

const registerUser = async (req, res) => {
  const { username, email, password, role, preferredCategory, country, language } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ error: "All details are required" });
  }

  const users = await fetchUsers();

  if (users.some((u) => u.email === email)) {
    return res.status(409).json({ error: "Email ID already exists" });
  }
  if (users.some((u) => u.username === username)) {
    return res.status(409).json({ error: "Username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    username,
    email,
    password: hashedPassword,
    role: role || "user",
    preferredCategory,
    country,
    language,
  };

  const addedUser = await addUser(newUser);
  if (!addedUser) {
    return res.status(500).json({ error: "Failed to register user" });
  }

  return res.status(201).json({
    message: "User registered successfully",
    user: { username: newUser.username, role: newUser.role },
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const users = await fetchUsers();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: "15m" });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const resetLink = `http://${CLIENT_HOST}:3000/reset-password?token=${resetToken}`;
  const mailOptions = {
  from: process.env.EMAIL_USER,
  to: email,
  subject: "Password Reset Request",
  html: `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p style="color: #555;">Click the button below to reset your password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          Reset Password
        </a>
        <p style="color: #777; font-size: 12px; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `,
};


  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    res.status(500).json({ error: "Error sending email" });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and new password are required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const email = decoded.email;

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await updateUserPassword(email, hashedPassword);

    if (!updatedUser) {
      return res.status(500).json({ error: "Failed to reset password" });
    }

    return res.json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }
};

const updateUser = async (req, res) => {
  const { token, username, email, password, preferredCategory, country, language } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Authentication token is required" });
  }


  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUserName = decoded.username;
    
    const users = await fetchUsers();
    const existingUser = users.find((u) => u.username === currentUserName);

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if new username or email already exists
    if (username && username !== existingUser.username && users.some((u) => u.username === username)) {
      return res.status(409).json({ error: "Username already exists" });
    }
    
    if (email && email !== existingUser.email && users.some((u) => u.email === email)) {
      return res.status(409).json({ error: "Email ID already exists" });
    }

    // Prepare update data
    const updateData = {
      username: username || existingUser.username,
      email: email || existingUser.email,
      preferredCategory: preferredCategory || existingUser.preferredCategory,
      country: country || existingUser.country,
      language: language || existingUser.language,
    };

    // Handle password update separately if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await updateUserDetails(currentUserName, updateData);

    if (!updatedUser) {
      return res.status(500).json({ error: "Failed to update user details" });
    }

    // Generate new token if email or username was updated
    const newToken = (email || username) ? jwt.sign(
      { 
        username: updateData.username, 
        email: updateData.email, 
        role: existingUser.role 
      },
      JWT_SECRET,
      { expiresIn: "12h" }
    ) : null;

    return res.json({ 
      message: "User details updated successfully",
      token: newToken || token
    });
  } catch (error) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }
};

// Delete User
const deleteUserController = async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ error: "Username is required for deletion" });
  }

  try {
    const deletedUser = await deleteUser(username);
    if (!deletedUser) {
      return res.status(500).json({ error: "Failed to delete user" });
    }

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { 
  loginUser, 
  registerUser, 
  forgotPassword, 
  resetPassword, 
  updateUser,
  deleteUserController
};