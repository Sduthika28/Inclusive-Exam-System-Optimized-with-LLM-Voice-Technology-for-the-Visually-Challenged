import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SpeechLogin from "./pages/SpeechLogin";
import Exam from "./pages/Exam";
import Admin from "./pages/Admin";
import Admindash from "./pages/Admindash";
import VoiceAuth from "./pages/VoiceAuth";
import Detail  from "./pages/Detail";
import Student from "./pages/Student.jsx";
import ViewStudentExam from "./pages/ViewStudentExam.jsx";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Exam" element={<Exam />} />       
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<SpeechLogin />} />
        <Route path="/admin-login" element={<Admin />} />
        <Route path="/admin-dashboard" element={<Admindash />} />
        <Route path="/VoiceAuth" element={<VoiceAuth />} /> 
        <Route path="/Detail" element={<Detail />} /> 
        <Route path="/Student" element={<Student />} /> 
        <Route path="/view/:rollNo" element={<ViewStudentExam />} />
      
      </Routes>
    </Router>
  );
}

export default App;

/*import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");

  // Fetch data from Flask API on load
  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/test")
      .then(response => setMessage(response.data.message))
      .catch(error => console.error("Error:", error));
  }, []);

  // Send data to Flask API
  const sendData = async () => {
    const response = await axios.post("http://127.0.0.1:5000/api/data", {
      name: "John Doe",
      exam: "Inclusive Exam System"
    });
    console.log(response.data);
  };

  return (
    <div>
      <h1>React + Flask</h1>
      <p>Message from Flask: {message}</p>
      <button onClick={sendData}>Send Data to Flask</button>
    </div>
  );
}

export default App;*/
