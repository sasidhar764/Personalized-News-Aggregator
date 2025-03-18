require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const User = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const CLIENT_HOST = process.env.CLIENT_HOST || "localhost";

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ username });

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
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

const registerUser = async (req, res) => {
  const { username, email, password, role, preferredCategory, country, language } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ error: "All details are required" });
  }

  try {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(409).json({ error: "Email ID already exists" });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
      preferredCategory,
      country,
      language,
    });

    await newUser.save();

    return res.status(201).json({
      message: "User registered successfully",
      user: { username: newUser.username, role: newUser.role },
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to register user" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });

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
    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(500).json({ error: "Failed to reset password" });
    }

    return res.json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }
};

const updateUserProfile = async (req, res) => {
  const { token, username, email, password, preferredCategory, country, language } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Authentication token is required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUsername = decoded.username;
    
    const existingUser = await User.findOne({ username: currentUsername });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if new username already exists
    if (username && username !== existingUser.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(409).json({ error: "Username already exists" });
      }
    }
    
    // Check if new email already exists
    if (email && email !== existingUser.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(409).json({ error: "Email ID already exists" });
      }
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

    const updatedUser = await User.findOneAndUpdate(
      { username: currentUsername },
      updateData,
      { new: true }
    );

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

const fetchAllUsersAdmin = async (req, res) => {
  try {
    const users = await User.find({ role: "user" });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
};

const deleteUserController = async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ error: "Username is required for deletion" });
  }

  try {
    const deletedUser = await User.findOneAndDelete({ username });
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
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
  updateUserProfile,
  fetchAllUsersAdmin,
  deleteUserController
};