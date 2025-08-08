import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { db } from "../firebaseConfig"; 
import { collection, addDoc } from "firebase/firestore"; 
import "./AdminDashboard.css"; 

function Admindash() {
  const [questionNumber, setQuestionNumber] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [marks, setMarks] = useState(""); 
  const [message, setMessage] = useState("");

  const navigate = useNavigate(); 

  const saveQuestion = async () => {
    if (!questionNumber.trim() || !questionText.trim() || !marks.trim()) {
      setMessage("Please enter question number, question text, and marks.");
      return;
    }

    try {
      await addDoc(collection(db, "questions"), {
        questionNumber: questionNumber,
        questionText: questionText,
        marks: parseInt(marks),
        timestamp: new Date(),
      });

      setMessage("Question saved successfully!");
      setQuestionNumber("");
      setQuestionText("");
      setMarks(""); 
    } catch (error) {
      console.error("Error saving question:", error);
      setMessage("Failed to save question. Try again.");
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className="top">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <p className="dashboard-description">
          Upload and manage exam questions for visually challenged students.
        </p>
      </div>

      <div className="bottom bottom-primary">
        <div className="question-upload">
          <div>
            <label className="num">Question Number:</label>
            <input
              className="number"
              type="text"
              placeholder="Enter question number"
              value={questionNumber}
              onChange={(e) => setQuestionNumber(e.target.value)}
            />
          </div>
          <div className="textbox">
            <label className="text">Question Text:</label>
            <textarea
              className="textt"
              placeholder="Enter your question here"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </div>
          <div className="marks-box">
            <label className="marks-label">Marks:</label>
            <input
              className="marks-input"
              type="number"
              placeholder="Enter marks"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        <button className="btn btn-primary" onClick={saveQuestion}>
          Save Question
        </button>
        <button className="qbuttton qbutton-primary">
          Upload Questions
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate("/Student")} 
        >
          Student Answer Booklet
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate("/Detail")} 
        >
          Student Details Form
        </button>
      </div>
      
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default Admindash;
