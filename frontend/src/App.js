import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard";
import ForgotPassword from "./pages/forgotpassword";
import ResetPassword from "./pages/resetpassword";
import AdminPage from "./pages/adminpage";
import FlaggedArticles from "./pages/FlaggedArticles";
import PersonalizedNews from "./pages/personalize";
import Bookmarks from "./pages/bookmark";
import Settings from "./pages/settings";
import SharedLayout from "./pages/sharedLayout"; // Add this import (create the file in your project root)
import ProtectedRoute from "./protectedroute";

function App() {
  console.log("App component rendered");

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Navigate to="/signup" />} />
        
        {/* Protected routes with shared layout */}
        <Route element={<ProtectedRoute element={<SharedLayout />} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/personalized-news" element={<PersonalizedNews />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/flagged-articles" element={<FlaggedArticles />} />
          <Route path="/admin" element={<ProtectedRoute element={<AdminPage />} requiredRole="admin" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;