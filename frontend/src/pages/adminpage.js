import React, { useState, useEffect } from 'react';
import { Search } from "lucide-react";
import './adminpage.css';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/auth/admin`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (username) => {
    if (window.confirm(`Are you sure you want to delete ${username}?`)) {
      try {
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/auth/admin/deleteuser/${username}`, {
          method: 'DELETE',
        });
        console.log(response);

        if (!response.ok) {
          throw new Error('Failed to delete user');
        }

        // Update state to remove deleted user from the list
        setUsers(users.filter(user => user.username !== username));
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="admin-container p-6 bg-white shadow-lg rounded-lg">
      <div className="header flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">USER MANAGEMENT DASHBOARD</h2>
        <div className="search-container">
          <Search className="search-icon" size={22} />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Username</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Category</th>
              <th className="border border-gray-300 px-4 py-2">Country</th>
              <th className="border border-gray-300 px-4 py-2">Language</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">{user.username}</td>
                <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                <td className="border border-gray-300 px-4 py-2">{user.preferredCategory}</td>
                <td className="border border-gray-300 px-4 py-2">{user.country}</td>
                <td className="border border-gray-300 px-4 py-2">{user.language}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <button 
                    onClick={() => handleDelete(user.username)} 
                    className="text-red-500 hover:text-red-700 px-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPage;
