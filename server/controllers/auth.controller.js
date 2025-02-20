require("dotenv").config();
const jwt = require("jsonwebtoken");
const axios = require("axios");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const DATABASE_URL_USERS = "http://localhost:7000/api/users";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 10;

const CLIENT_HOST = process.env.CLIENT_HOST || "localhost";

// Fetch all users
const fetchUsers = async () => {
  try {
    const response = await axios.get(DATABASE_URL_USERS);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

// Add a new user
const addUser = async (user) => {
  try {
    const response = await axios.post(DATABASE_URL_USERS, user);
    return response.data;
  } catch (error) {
    console.error("Error adding user:", error);
    return null;
  }
};

// Updating Password
const updateUser = async (email, newPassword) => {
  try {
    const response = await axios.put(`${DATABASE_URL_USERS}/reset-password`, {
      email,
      password: newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating password:", error);
    return null;
  }
};

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

  // Compare hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Incorrect Password" });
  }

  // Generate JWT token
  const token = jwt.sign(
    { username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: "12h" }
  );

  return res.json({
    message: "Login successful",
    user: { username: user.username },
    token,
  });
};

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ error: "All details are required" });
  }

  const users = await fetchUsers();

  const existingUserEmail = users.find((u) => u.email === email);
  if (existingUserEmail) {
    return res.status(409).json({ error: "Email ID already exists" });
  }

  const existingUserName = users.find((u) => u.username === username);
  if (existingUserName) {
    return res.status(409).json({ error: "Username already exists" });
  }

  // Hash the password before storing
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = { username, email, password: hashedPassword };
  const addedUser = await addUser(newUser);

  if (!addedUser) {
    return res.status(500).json({ error: "Failed to register user" });
  }

  return res.status(201).json({
    message: "User registered successfully",
    user: { username: newUser.username },
  });
};

// Forgot Password - Send Reset Link
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const users = await fetchUsers();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Generate reset token (valid for 15 minutes)
  const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: "15m" });

  // Send email with reset link
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const resetLink = `http://${CLIENT_HOST}:3000/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    text: `Click the link to reset your password: ${resetLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    res.status(500).json({ error: "Error sending email" });
  }
};

// Reset Password Function
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and new password are required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const email = decoded.email;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update user password
    const updatedUser = await updateUser(email, hashedPassword);

    if (!updatedUser) {
      return res.status(500).json({ error: "Failed to reset password" });
    }

    return res.json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }
};

module.exports = { loginUser, registerUser, forgotPassword, resetPassword };
