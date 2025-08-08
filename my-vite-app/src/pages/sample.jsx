import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VoiceAuth = () => {
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();
  const hasSpoken = useRef(false); // Prevents speaking more than once

  useEffect(() => {
    if (!hasSpoken.current) {
      hasSpoken.current = true;
      speak("You are now on the login page. Please say your username.");
    }
  }, []);

  const speak = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      startListening();
    };
    synth.speak(utterance);
  };

  const startListening = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let spokenText = event.results[0][0].transcript.trim();
      if (spokenText.endsWith(".")) {
        spokenText = spokenText.slice(0, -1); // Remove dot at the end
      }
      setUserId(spokenText);
    };
    recognition.start();
  };

  const handleEnroll = async () => {
    if (!userId) {
      toast.error("Please enter User ID");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();
      data.success ? toast.success(data.message) : toast.error(data.message);
    } catch (error) {
      toast.error("Enrollment failed");
    }
  };

  const handleAuthenticate = async () => {
    if (!userId) {
      toast.error("Please enter User ID");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setTimeout(() => navigate("/Exam"), 2000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Authentication failed");
    }
  };

  return (
    <div className="main-login">
      <ToastContainer />
      <div className="login">
        <h1 className="text-2xl font-semibold mb-4 text-center">Voice Authentication</h1>
        <input
          type="text"
          placeholder="Enter User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full px-4 py-2 border rounded-md mb-4"
        />
        <button onClick={handleEnroll} className="login">Enroll Voice</button>
        <button onClick={handleAuthenticate} className="login">Authenticate</button>
      </div>
    </div>
  );
};

export default VoiceAuth;



import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VoiceAuth = () => {
  const [userId, setUserId] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const navigate = useNavigate();
  const hasSpoken = useRef(false);

  useEffect(() => {
    if (!hasSpoken.current) {
      hasSpoken.current = true;
      askForUsername();
    }
  }, []);

  // Speak function that returns a promise
  const speak = (text) => {
    return new Promise((resolve) => {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = resolve; // Wait until speaking is finished
      synth.speak(utterance);
    });
  };

  // Ask for username
  const askForUsername = async () => {
    await speak("You are now on the login page. Please say your username.");
    await startListening("username");
  };

  // Function to listen for voice input
  const startListening = async (type) => {
    if (!isVoiceMode) return;

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";

    return new Promise((resolve) => {
      recognition.onresult = async (event) => {
        let spokenText = event.results[0][0].transcript.trim();
        if (spokenText.endsWith(".")) {
          spokenText = spokenText.slice(0, -1);
        }

        if (type === "username") {
          if (spokenText.length > 0) {
            setUserId(spokenText); // Update state
            await speak(`You said ${spokenText}. Say "Enroll" to register or "Authenticate" to log in.`);
            await startListening("command", spokenText); // Pass userId
          } else {
            await speak("I didn't catch that. Please say your username again.");
            await startListening("username");
          }
        } else if (type === "command") {
          await handleVoiceCommand(spokenText.toLowerCase(), userId);
        }
        resolve();
      };

      recognition.onerror = async () => {
        await speak("I didn't catch that. Please try again.");
        await startListening(type);
        resolve();
      };

      recognition.start();
    });
  };

  // Handle voice command
  const handleVoiceCommand = async (command, enteredUserId) => {
    if (!enteredUserId) {
      await speak("No user ID detected. Please say your username again.");
      await askForUsername();
      return;
    }

    if (command.includes("enroll")) {
      await handleEnroll(enteredUserId);
    } else if (command.includes("authenticate") || command.includes("login")) {
      await handleAuthenticate(enteredUserId);
    } else {
      await speak("Invalid command. Please say 'Enroll' or 'Authenticate'.");
      await startListening("command", enteredUserId);
    }
  };

  // Handle enrollment
  const handleEnroll = async (enteredUserId) => {
    if (!enteredUserId) {
      toast.error("Please enter User ID");
      await speak("Enrollment failed. No user ID detected.");
      await askForUsername();
      return;
    }

    setIsVoiceMode(false);

    try {
      const response = await fetch("http://localhost:5000/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: enteredUserId }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        await speak("Enrollment successful. Now you can authenticate.");
        setIsVoiceMode(true);
        await speak("Say 'Authenticate' to log in.");
        await startListening("command", enteredUserId);
      } else {
        toast.error(data.message);
        await speak("Enrollment failed.");
        setIsVoiceMode(true);
        await startListening("command", enteredUserId);
      }
    } catch (error) {
      toast.error("Enrollment failed");
      await speak("Enrollment failed due to a network error.");
      setIsVoiceMode(true);
      await startListening("command", enteredUserId);
    }
  };

  // Handle authentication
  const handleAuthenticate = async (enteredUserId) => {
    if (!enteredUserId) {
      toast.error("Please enter User ID");
      await speak("Authentication failed. No user ID detected.");
      await askForUsername();
      return;
    }

    setIsVoiceMode(false);

    try {
      const response = await fetch("http://localhost:5000/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: enteredUserId }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        await speak("Authentication successful. Redirecting to exam page.");
        setTimeout(() => navigate("/Exam"), 2000);
      } else {
        toast.error(data.message);
        await speak("Authentication failed. Try again.");
        setIsVoiceMode(true);
        await startListening("command", enteredUserId);
      }
    } catch (error) {
      toast.error("Authentication failed");
      await speak("Authentication failed due to a network error.");
      setIsVoiceMode(true);
      await startListening("command", enteredUserId);
    }
  };

  return (
    <div className="main-login">
      <ToastContainer />
      <div className="login">
        <h1 className="text-2xl font-semibold mb-4 text-center">Voice Authentication</h1>
        <input
          type="text"
          placeholder="Enter User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full px-4 py-2 border rounded-md mb-4"
        />
        <button 
          onClick={async () => {
            setIsVoiceMode(false);
            await handleEnroll(userId);
          }} 
          className="login"
        >
          Enroll Voice
        </button>
        <button 
          onClick={async () => {
            setIsVoiceMode(false);
            await handleAuthenticate(userId);
          }} 
          className="login"
        >
          Authenticate
        </button>
      </div>
    </div>
  );
};

export default VoiceAuth;
