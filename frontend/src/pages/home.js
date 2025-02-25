import React, { useState } from "react";
import { Link } from "react-router-dom";
import Login from "./login";
import Register from "./Register";
import ForgotPassword from "./forgotpasword";
import "./home.css";

function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <div>
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/" className="logo">newsphere</Link>
        </div>
        <div className="nav-right">
          <button onClick={() => setShowLogin(true)} className="nav-button sign-in">Sign in</button>
          <button onClick={() => setShowSignup(true)} className="nav-button sign-up">Sign up</button>
        </div>
      </nav>
      <div className="magazine-section">
        <div className="magazine-text">
          <h1>Thousands of newspapers and magazines.</h1>
          <h1>One <span style={{ color: "#20c997" }}>subscription.</span></h1>
          <p>Access <strong>more than </strong> the top publications from around the globe.</p>
        </div>
        <div className="magazine-images">
          <img src="./image.png" alt="Magazine" />
        </div>
      </div>

      {/* Modals */}
      {showLogin && <Login onClose={() => setShowLogin(false)} onForgotPassword={() => { setShowLogin(false); setShowForgotPassword(true); }} />}
      {showSignup && <Register onClose={() => setShowSignup(false)} />}
      {showForgotPassword && <ForgotPassword onClose={() => setShowForgotPassword(false)} />}
    </div>
  );
}

export default Home;