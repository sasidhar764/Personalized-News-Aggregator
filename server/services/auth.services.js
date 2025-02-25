require("dotenv").config();
const axios = require("axios");

const DATABASE_URL_USERS = "http://localhost:7000/api/users";

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

// Fetch all users (for Express response)
const fetchAllUsers = async (req, res) => {
  try {
    const users = await fetchUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
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

// Update user details
const updateUserDetails = async (username, userData) => {
  try {
    const response = await axios.put(`${DATABASE_URL_USERS}/${username}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user details:", error);
    return null;
  }
};

// Update user password specifically
const updateUserPassword = async (email, newPassword) => {
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

// Delete user by username
const deleteUser = async (username) => {
  console.log(`Deleting user: ${username}`);
  try {
    const response = await axios.delete(`${DATABASE_URL_USERS}/${username}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    return null;
  }
};

module.exports = { 
  fetchUsers, 
  fetchAllUsers, 
  addUser, 
  updateUserDetails,
  updateUserPassword,
  deleteUser 
};
