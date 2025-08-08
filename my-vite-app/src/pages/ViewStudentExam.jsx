import React, { useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";

const ViewStudentExam = () => {
  const [rollNumbers, setRollNumbers] = useState([]);
  const [selectedRollNo, setSelectedRollNo] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [examAnswers, setExamAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRollNumbers = async () => {
      const db = getDatabase();
      const studentsRef = ref(db, "students");

      try {
        const snapshot = await get(studentsRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setRollNumbers(Object.keys(data));
        }
      } catch (error) {
        console.error("Error fetching roll numbers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRollNumbers();
  }, []);

  useEffect(() => {
    if (!selectedRollNo) return;

    const fetchStudentData = async () => {
      setLoading(true);
      const db = getDatabase();
      const studentRef = ref(db, `students/${selectedRollNo}`);
      const examAnswersRef = ref(db, `students/${selectedRollNo}/exam_answers`);

      try {
        const studentSnap = await get(studentRef);
        const answersSnap = await get(examAnswersRef);

        if (studentSnap.exists()) {
          setStudentData(studentSnap.val());
        } else {
          setStudentData(null);
        }

        if (answersSnap.exists()) {
          const answersData = answersSnap.val();
          setExamAnswers(Object.values(answersData));
        } else {
          setExamAnswers([]);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        setStudentData(null);
        setExamAnswers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [selectedRollNo]);

  return (
    <div>
      <style>{`
        .roll-button {
          margin: 5px;
          padding: 10px 15px;
          background-color: #f3f4f6;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .roll-button:hover {
          background-color: #3b82f6;
          color: white;
        }
        .active-roll {
          background-color: #3b82f6;
          color: white;
        }
        .student-card {
          background: #ffffff;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0px 4px 12px rgba(0,0,0,0.1);
          margin-top: 20px;
        }
        .student-info {
          margin-bottom: 20px;
        }
        .answer-box {
          background: #f9fafb;
          padding: 15px;
          margin-bottom: 15px;
          border-radius: 10px;
          border-left: 4px solid #2563eb;
        }
        .answer-box h4 {
          margin-bottom: 5px;
          font-size: 1rem;
          color: #1f2937;
        }
        .answer-box p {
          margin: 2px 0;
          color: #374151;
        }
      `}</style>

      <div className="p-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Student User IDs</h2>

        {loading && <p className="text-lg">Loading...</p>}

        <div className="flex flex-wrap mb-6">
          {rollNumbers.map((rollNo) => (
            <div
              key={rollNo}
              className={`roll-button ${selectedRollNo === rollNo ? "active-roll" : ""}`}
              onClick={() => setSelectedRollNo(rollNo)}
            >
              {rollNo}
            </div>
          ))}
        </div>

        {selectedRollNo && studentData && (
          <div className="student-card">
            <h3 className="text-2xl font-semibold mb-4 text-blue-700">Details for Roll No: {selectedRollNo}</h3>

            <div className="student-info">
              <p><strong>Name:</strong> {studentData.firstname} {studentData.lastname}</p>
              <p><strong>Email:</strong> {studentData.email}</p>
              <p><strong>Gender:</strong> {studentData.gender}</p>
              <p><strong>College:</strong> {studentData.collegeName}</p>
              <p><strong>Course:</strong> {studentData.course}</p>
            </div>

            <h4 className="text-xl font-semibold text-gray-700 mb-2">Exam Answers:</h4>
            {examAnswers.length > 0 ? (
              examAnswers.map((ans, idx) => (
                <div key={idx} className="answer-box">
                  <h4>Q: {ans.question}</h4>
                  <p><strong>Answer:</strong> {ans.answer}</p>
                  <p><strong>Marks:</strong> {ans.marks}</p>
                  <p><strong>Question ID:</strong> {ans.questionId}</p>
                </div>
              ))
            ) : (
              <p className="text-red-500">No answers available for this student.</p>
            )}
          </div>
        )}

        {selectedRollNo && !studentData && !loading && (
          <div className="text-red-500 font-semibold mt-4">
            No data found for Roll No: {selectedRollNo}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewStudentExam;






// // ViewStudentExam.jsx

// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { getDatabase, ref, get } from "firebase/database";

// const ViewStudentExam = () => {
//   const { rollNo } = useParams();
//   const [studentData, setStudentData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchStudentData = async () => {
//       const db = getDatabase();
//       const studentRef = ref(db, `students/${rollNo}`);

//       try {
//         const snapshot = await get(studentRef);
//         if (snapshot.exists()) {
//           setStudentData(snapshot.val());
//         } else {
//           setStudentData(null);
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         setStudentData(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStudentData();
//   }, [rollNo]);

//   if (loading) return <p className="text-lg">Loading...</p>;

//   if (!studentData) {
//     return (
//       <div className="p-4">
//         <h2 className="text-xl font-bold text-red-600">No data found for Roll No: {rollNo}</h2>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-3xl mx-auto bg-white rounded-2xl shadow-md">
//       <h2 className="text-2xl font-bold mb-4">Student Exam Details</h2>
      
//       <div className="mb-6">
//         <p><strong>Name:</strong> {studentData.name}</p>
//         <p><strong>Roll No:</strong> {studentData.rollNo}</p>
//         <p><strong>Department:</strong> {studentData.department}</p>
//       </div>

//       <h3 className="text-xl font-semibold mb-3">Answers</h3>
//       {Object.entries(studentData.exam).map(([key, qa]) => (
//         <div key={key} className="mb-4 border-b pb-2">
//           <p className="font-medium">Q{key}: {qa.question}</p>
//           <p className="text-gray-700 mt-1">Answer: {qa.answer}</p>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ViewStudentExam;
