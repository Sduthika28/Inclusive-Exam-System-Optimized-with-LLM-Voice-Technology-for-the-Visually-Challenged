import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; 
import { auth } from "../firebaseConfig";  
import "./Login.css";

const SpeechLogin = () => {
  const navigate = useNavigate();
  const [enteredEmail, setEnteredEmail] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const hasStartedAuth = useRef(false);

  // 🔹 Speak function
  const speakText = (text) => {
    return new Promise((resolve) => {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 1;
        utterance.onend = () => resolve();
        window.speechSynthesis.speak(utterance);
      } else {
        alert("Text-to-Speech is not supported.");
        resolve();
      }
    });
  };

  // 🔹 Speech-to-Text function
  const speechToText = () => {
    return new Promise((resolve, reject) => {
      if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
        alert("Speech recognition is not supported.");
        reject("Speech recognition not supported");
        return;
      }

      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => console.log("Listening...");
      recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript.trim();
        resolve(spokenText);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        speakText("Sorry, there was an error. Try again.");
        reject("Speech recognition failed");
      };

      recognition.onend = () => console.log("Speech recognition ended.");
      recognition.start();
    });
  };

  // 🔹 Remove trailing dot, punctuation, and convert to lowercase
  const cleanText = (text) => {
    return text.replace(/\.+$/, "").trim().toLowerCase(); // Remove trailing dot and convert to lowercase
  };

  // 🔹 Authenticate User with Firebase Authentication
  const authenticate = async () => {
    try {
      setEnteredEmail("");
      setEnteredPassword("");

      // Ask for email
      await speakText("Say your email address");
      const spokenEmail = await speechToText();
      const cleanedEmail = cleanText(spokenEmail); // Clean and convert to lowercase
      setEnteredEmail(cleanedEmail);

      // Ask for password
      await speakText("Say your password");
      const spokenPassword = await speechToText();
      const cleanedPassword = cleanText(spokenPassword); // Clean the password
      setEnteredPassword(cleanedPassword);

      // 🔹 Firebase Authentication: Sign in with email and password
      await signInWithEmailAndPassword(auth, cleanedEmail, cleanedPassword);  // Use the imported auth object
      await speakText("Login successful. Redirecting to the exam page.");
      setTimeout(() => navigate("/exam"), 2000); // Redirect after successful login
    } catch (error) {
      console.error("Authentication failed:", error.message);
      await speakText("Login failed. Please try again.");
      setTimeout(() => authenticate(), 2000); // Retry if login fails
    }
  };

  // 🔹 Start authentication on page load
  useEffect(() => {
    if (!hasStartedAuth.current) {
      hasStartedAuth.current = true;
      speakText("Welcome to the login page").then(() => authenticate());
    }
  }, []);

  return (
    <div className="main-login">
      <div className="login">
        <h1>Login Page</h1>
        <form>
          <label>
            Email:
            <input type="text" name="email" value={enteredEmail} style={{ color: "black" }} disabled />
          </label>
          <br />
          <label>
            Password:
            <input type="text" name="password" value={enteredPassword} style={{ color: "black" }} disabled />
          </label>
          <br />
          <button type="submit" disabled>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default SpeechLogin;
