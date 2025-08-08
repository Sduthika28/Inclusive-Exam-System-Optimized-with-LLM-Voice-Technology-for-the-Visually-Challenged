import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const hasSpoken = useRef(false);

  const speakText = (text, callback) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1;
      utterance.onend = () => {
        if (callback) callback();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-Speech is not supported in this browser.");
    }
  };

  useEffect(() => {
    if (!hasSpoken.current) {
      hasSpoken.current = true;
      speakText(
        "Welcome to the Inclusive Exam Platform. This platform is designed to help visually challenged students take exams using speech-to-text and text-to-speech technologies. You will now be redirected to the login page.",
        () => {
          navigate("/voiceAuth");
        }
      );
    }
  }, [navigate]);

  return (
    
    <div className="home-container">
      <div className="top">
        <h1 className="home-title">Welcome to the Inclusive Exam Platform</h1>
        <p className="home-description">
          This platform is designed to help visually challenged students take exams using speech-to-text and text-to-speech technologies.
        </p>
      </div>
      <div className="bottom">
        <button className="btn btn-primary" onClick={() => navigate("/admin-login")}>
          Admin Login
        </button>

        <div className="features-card">
          <p className="features-title">Features:</p>
          <ul className="features-list">
            <li className="feature-item">Speech-to-text for answering questions</li>
            <li className="feature-item">Text-to-speech for reading questions aloud</li>
            <li className="feature-item">Time management with alerts</li>
            <li className="feature-item">Secure voice authentication for both candidates and admins</li>
          </ul>
        </div>
      </div>


    </div>
  );
}

export default Home;
