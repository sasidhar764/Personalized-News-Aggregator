import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import ForgotPassword from "./pages/forgotpassword";
import ResetPassword from "./pages/resetpassword";
import AdminPage from "./pages/adminpage";
import FlaggedArticles from "./pages/flaggedarticles";
import PersonalizedNews from "./pages/personalize";
import Bookmarks from "./pages/bookmark";
import Settings from "./pages/settings";
import SharedLayout from "./pages/sharedlayout";
import ProtectedRoute from "./protectedroute";
import QuizPage from "./pages/QuizPage";
import ResultPage from "./pages/ResultPage";
import FeedbackPage from "./pages/feedbackpage";
import AdminFeedbackPage from "./pages/adminfeedbackpage";

function App() {
  const [isSubmitted, setIsSubmitted] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || !user.username) {
      setLoading(false);
      return;
    }

    const checkSubmission = async () => {
      try {
        const res = await axios.post(`${process.env.REACT_APP_SERVER_URL}/quiz/fetch`, {
          username: user.username,
        });

        if (res.data.submitted) {
          setIsSubmitted({
            score: res.data.score,
            total: res.data.total,
            results: res.data.results,
          });
        }
      } catch (err) {
        console.error("Error checking quiz submission:", err);
      } finally {
        setLoading(false);
      }
    };

    checkSubmission();
  }, []);

  if (loading) return <p>Loading...</p>;

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
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/adminfeedback" element={<AdminFeedbackPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
