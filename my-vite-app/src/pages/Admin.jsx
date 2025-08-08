import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; 
import { auth } from "../firebaseConfig"; 
import "./Login.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password); 
      navigate("/admin-dashboard"); 
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      console.error("Login error:", err.message);
    }
  };



  return (
    <div className="main-login">
      <div className="login">
        <h1>Admin Login</h1>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleLogin}>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <br />
          <label>
            Password:
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <br />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
