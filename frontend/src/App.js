import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard";
import ForgotPassword from "./pages/forgotpassword";
import ResetPassword from "./pages/resetpassword";
import AdminPage from "./pages/adminpage";
import FlaggedArticles from "./pages/FlaggedArticles";
import PersonalizedNews from "./pages/personalize"; // Import the new component
import ProtectedRoute from "./protectedroute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/flagged-articles" element={<ProtectedRoute element={<FlaggedArticles />} />} />
        <Route path="/personalized-news" element={<ProtectedRoute element={<PersonalizedNews />} />} /> {/* New Route */}
        <Route path="/register" element={<Navigate to="/signup" />} />
        <Route path="/admin" element={<ProtectedRoute element={<AdminPage />} requiredRole="admin" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;