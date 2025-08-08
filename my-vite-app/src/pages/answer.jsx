/*import { useState, useEffect } from "react";
import { db } from "../firebaseConfig"; // Firebase Configuration
import { collection, getDocs } from "firebase/firestore"; // Firestore methods
import { useNavigate } from "react-router-dom"; // For navigation
import "./AnswerStorage.css"; // Optional: Add styles

function AnswerStorage() {
  const [answers, setAnswers] = useState([]); // State to store answers
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // For navigation

  // 🔹 Fetch Answers from Firestore
  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "answers")); // Fetch all documents from "answers" collection
        const fetchedAnswers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAnswers(fetchedAnswers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching answers:", error);
        setLoading(false);
      }
    };

    fetchAnswers();
  }, []);

  return (
    <div className="answer-storage-container">
      <h1>Answer Storage</h1>
      <p>Here are the stored answers from the database:</p>

      {loading ? <p>Loading answers...</p> : null}

      <div className="answer-list">
        {answers.length > 0 ? (
          answers.map((answer) => (
            <div key={answer.id} className="answer-item">
              <h3>Question Number: {answer.questionNumber}</h3>
              <p><strong>Answer:</strong> {answer.answerText}</p>
              <p><strong>Marks:</strong> {answer.marks}</p>
            </div>
          ))
        ) : (
          <p>No answers found.</p>
        )}
      </div>

      <button className="btn btn-primary" onClick={() => navigate("/admin")}>
        Back to Admin Dashboard
      </button>
    </div>
  );
}

export default AnswerStorage;*/
