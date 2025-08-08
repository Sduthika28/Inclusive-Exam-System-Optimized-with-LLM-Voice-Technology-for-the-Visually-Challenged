import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  getDocsFromServer,
} from "firebase/firestore";
import html2pdf from "html2pdf.js";
import "./AdminStudentDetails.css";

function Student() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [examAnswers, setExamAnswers] = useState([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const pdfRef = useRef();

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "students"));
        const studentData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudents(studentData);
      } catch (error) {
        
        console.error("Error fetching student data: ", error);
      }
    };

    fetchStudentDetails();
  }, []);

  const handleRowClick = async (student) => {
    setSelectedStudent(student);
    setLoadingAnswers(true);
    setExamAnswers([]);

    try {
      const answersRef = collection(db, "students", student.id, "exam_answers");
      const answersSnapshot = await getDocsFromServer(answersRef);
      const answers = answersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      
      answers.sort((a, b) => {
        const numA = parseInt(a.questionId);
        const numB = parseInt(b.questionId);
        return isNaN(numA) || isNaN(numB)
          ? a.questionId.localeCompare(b.questionId)
          : numA - numB;
      });

      setExamAnswers(answers);
    } catch (error) {
      console.error("Error fetching exam answers: ", error);
    }

    setLoadingAnswers(false);
  };

  const handleDownloadPDF = () => {
    if (pdfRef.current) {
      html2pdf()
        .from(pdfRef.current)
        .set({ margin: 1, filename: "Exam_Answer_Sheet.pdf" })
        .save();
    }
  };

  return (
    <div className="admin-container">
      <style>{`
        .admin-container {
          display: flex;
          flex-direction: row;
          height: 100vh;
          font-family: 'Georgia', serif;
          background-color: #f3f2ef;
        }

        .sidebar {
          width: 25%;
          background-color: #ffffff;
          border-right: 2px solid #ddd;
          overflow-y: auto;
          padding: 1rem;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
        }

        .main-content {
          width: 75%;
          padding: 2rem 3rem;
          overflow-y: auto;
          background-color: #fffdf7;
          border-left: 4px double #999;
        }

        .header {
          text-align: center;
          font-size: 1.8rem;
          color: #2c3e50;
          font-weight: bold;
          margin-bottom: 1.5rem;
          font-family: 'Times New Roman', serif;
        }

        .student-table {
          width: 100%;
          border-collapse: collapse;
        }

        .student-table th,
        .student-table td {
          border: 1px solid #ccc;
          padding: 10px;
          text-align: left;
          font-family: Arial, sans-serif;
        }

        .student-table th {
          background-color: #34495e;
          color: white;
          position: sticky;
          top: 0;
        }

        .clickable-row {
          cursor: pointer;
          transition: background-color 0.2s ease-in-out;
        }

        .clickable-row:hover {
          background-color: #f0f0f0;
        }

        .student-details {
          background-color: #fff;
          padding: 2rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 0 10px rgba(0,0,0,0.05);
        }

        .student-details h2 {
          font-size: 1.6rem;
          margin-bottom: 1rem;
          color: #222;
          border-bottom: 1px solid #ccc;
          padding-bottom: 0.5rem;
        }

        .student-info p {
          font-size: 1rem;
          margin: 4px 0;
          color: #333;
        }

        .exam-answers-section {
          margin-top: 2rem;
        }

        .exam-answers-section h3 {
          font-size: 1.3rem;
          color: #1a5276;
          margin-bottom: 1rem;
          border-bottom: 2px dashed #ccc;
          padding-bottom: 0.5rem;
        }

        .answer-list {
          list-style-type: none;
          padding-left: 0;
        }

        .answer-item {
          padding: 1rem;
          margin-bottom: 1.5rem;
          border: 1px solid #bbb;
          border-radius: 5px;
          background-color: #fcfcfc;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          page-break-inside: avoid;
        }

        .question {
          font-weight: bold;
          margin-bottom: 0.5rem;
          font-size: 1.05rem;
          color: #000;
        }

        .response {
          font-size: 1rem;
          color: #444;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .download-button {
          margin-top: 2rem;
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1rem;
        }

        .download-button:hover {
          background-color: #0056b3;
        }
      `}</style>

      <div className="sidebar">
        <h1 className="header">📋 Student Details</h1>
        <table className="student-table">
          <thead>
            <tr>
              <th>Roll No.</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student.id}
                onClick={() => handleRowClick(student)}
                className="clickable-row"
              >
                <td>{student.userID}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="main-content">
        {selectedStudent && (
          <div className="student-details" ref={pdfRef}>
            <h2>👤 {selectedStudent.firstname} {selectedStudent.lastname}</h2>
            <div className="student-info">
              <p><strong>Roll No.:</strong> {selectedStudent.userID}</p>
              <p><strong>Email:</strong> {selectedStudent.email}</p>
              <p><strong>Gender:</strong> {selectedStudent.gender}</p>
              <p><strong>Course:</strong> {selectedStudent.course}</p>
              <p><strong>College:</strong> {selectedStudent.collegeName}</p>
            </div>

            <div className="exam-answers-section">
              <h3>📝 Exam Answers</h3>
              {loadingAnswers ? (
                <p>Loading exam answers...</p>
              ) : examAnswers.length > 0 ? (
                <ul className="answer-list">
                  {examAnswers.map((answer) => (
                    <li key={answer.id} className="answer-item">
                      <div className="question">
                        Qn. {answer.questionId}: {answer.question}
                      </div>
                      <div className="response">A: {answer.answer}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No exam answers available.</p>
              )}
            </div>

            <button className="download-button" onClick={handleDownloadPDF}>
              📄 Download as PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Student;




// import React, { useEffect, useState } from "react";
// import { db } from "../firebase";
// import { collection, getDocs } from "firebase/firestore";
// import "./AdminStudentDetails.css"; // optional for styling

// function Student() {
//   const [students, setStudents] = useState([]);

//   useEffect(() => {
//     const fetchStudentDetails = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "students"));
//         const studentData = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
//         setStudents(studentData);
//       } catch (error) {
//         console.error("Error fetching student data: ", error);
//       }
//     };

//     fetchStudentDetails();
//   }, []);

//   return (
//     <div className="admin-container">
//       <h1>Student Details</h1>
//       {students.length > 0 ? (
//         <table className="student-table">
//           <thead>
//             <tr>
//               <th>User ID</th>
//               <th>First Name</th>
//               <th>Last Name</th>
//               <th>Email</th>
//               <th>Gender</th>
//               <th>Course</th>
//               <th>College Name</th>
//             </tr>
//           </thead>
//           <tbody>
//             {students.map(student => (
//               <tr key={student.id}>
//                 <td>{student.userID}</td>
//                 <td>{student.firstname}</td>
//                 <td>{student.lastname}</td>
//                 <td>{student.email}</td>
//                 <td>{student.gender}</td>
//                 <td>{student.course}</td>
//                 <td>{student.collegeName}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       ) : (
//         <p>No student data available.</p>
//       )}
//     </div>
//   );
// }

// export default Student;
