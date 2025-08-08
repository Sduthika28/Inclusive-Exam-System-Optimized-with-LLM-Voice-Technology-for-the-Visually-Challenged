import React, { useEffect, useState, useRef } from "react";
import { db, collection, addDoc } from "../firebase";
import "./exam.css";

const questions = [
  { id: 1, question: "Discuss the impact of the Industrial Revolution.", marks: 10 },
  { id: 2, question: "Explain the process of photosynthesis.", marks: 5 },
  { id: 3, question: "What are Newton’s three laws of motion?", marks: 10 },
  { id: 4, question: "Describe the significance of World War II.", marks: 10 },
];

const ExamPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const hasStartedExam = useRef(false);

  const speakText = (text) => {
    return new Promise((resolve) => {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 1;
        utterance.onend = () => resolve();
        window.speechSynthesis.speak(utterance);
      } else {
        alert("Text-to-Speech is not supported in this browser.");
        resolve();
      }
    });
  };

  const speechToText = () => {
    return new Promise((resolve, reject) => {
      if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
        alert("Speech recognition is not supported in this browser.");
        reject("Speech recognition not supported");
        return;
      }

      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript.toLowerCase();
        resolve(spokenText);
      };

      recognition.onerror = () => {
        speakText("Sorry, there was an error recognizing your speech. Please try again.");
        reject("Speech recognition failed");
      };

      recognition.start();
    });
  };

  const saveAnswerToFirebase = async (questionId, questionText, answerText, marks) => {
    try {
      await addDoc(collection(db, "exam_answers"), {
        questionId,
        question: questionText,
        answer: answerText,
        marks,
        timestamp: new Date(),
      });
      console.log("Answer saved successfully!");
    } catch (error) {
      console.error("Error saving answer: ", error);
    }
  };

  const startTimer = () => {
    setTimeLeft(15 * 60); // 15 minutes per question

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          speakText("Time is up for this question.");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (timeLeft > 0 && timeLeft % 300 === 0 && timeLeft !== 900) {
      const minutesLeft = Math.floor(timeLeft / 60);
      speakText(`You have ${minutesLeft} minutes remaining.`);
    }
  }, [timeLeft]);

  const giveInstructions = async () => {
    speakText("Welcome to the online exam.");
    speakText("1. You will be asked a question, and you must answer it using your voice.");
    speakText("2. You can modify your answer after submitting it.");
    speakText("3. Each question has a time limit of 15 minutes.");
    speakText("4. Your answers will be recorded and saved automatically.");

    while (true) {
      await speakText("Are you ready to begin? Please say yes or no.");
      const response = await speechToText();

      if (response.includes("yes")) {
        speakText("Great! Let's begin.");
        setCurrentStep(1);
        break;
      } else {
        speakText("I will ask you again in 5 seconds.");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  };

  const processCommand = (text) => {
    const numbers = text.match(/\d+/g); 
  
    if (numbers) {
      let qNum = parseInt(numbers[0], 10); 
      if (qNum >= 1 && qNum <= questions.length) {
        setCurrentStep(qNum); 
      } else {
        speakText("Invalid question number. Please try again.");
      }
    } else {
      speakText("I didn't understand. Please say a question number.");
    }
  };

  const handleQuestionFlow = async () => {
    if (currentStep > questions.length) {
      await speakText("You have completed the exam. Thank you for your participation.");
      clearInterval(timerRef.current);
      return;
    }

    const currentQuestion = questions[currentStep - 1];
    await speakText(`Question ${currentStep}: ${currentQuestion.question}. This question carries ${currentQuestion.marks} marks.`);

    await speakText("You have 15 minutes to answer this question.");

    startTimer();

    await speakText("Please say your answer now.");
    const recordedAnswer = await speechToText();

    setAnswers((prevAnswers) => {
      const updatedAnswers = [...prevAnswers];
      updatedAnswers[currentStep - 1] = recordedAnswer;
      return updatedAnswers;
    });

    await saveAnswerToFirebase(currentQuestion.id, currentQuestion.question, recordedAnswer, currentQuestion.marks);

    await speakText("Your answer has been recorded.");
    await speakText("Do you want to modify your answer? Say yes or no.");
    const response = await speechToText();

    if (response.includes("yes")) {
      await speakText("Please say your modified answer.");
      const modifiedAnswer = await speechToText();

      setAnswers((prevAnswers) => {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[currentStep - 1] = modifiedAnswer;
        return updatedAnswers;
      });

      await saveAnswerToFirebase(currentQuestion.id, currentQuestion.question, modifiedAnswer, currentQuestion.marks);
      await speakText("Your answer has been updated.");
    }

    await speakText("Do you want to go to the next question? Say yes or a question number.");
    let ques = await speechToText();

    if (ques.includes("yes")) {
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      processCommand(ques);
    }
  };

  useEffect(() => {
    if (!hasStartedExam.current) {
      hasStartedExam.current = true;
      giveInstructions();
    }
  }, []);

  useEffect(() => {
    if (currentStep > 0 && currentStep <= questions.length) {
      handleQuestionFlow();
    }
  }, [currentStep]);

  return (
    <div className="exam-container">
      <div className="exam-child">
        <h1>Exam</h1>

        {currentStep > 0 && currentStep <= questions.length && (
          <h2>
            Time Left: {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")}
          </h2>
        )}

        <div className="questions">
          {currentStep > 0 && currentStep <= questions.length ? (
            <>
              <h2>{questions[currentStep - 1]?.question}</h2>
              <p>Marks: {questions[currentStep - 1]?.marks}</p>
              <label>Answer:</label>
              <input type="text" value={answers[currentStep - 1] || ""} readOnly style={{ width: "100%", padding: "10px" }} />
            </>
          ) : (
            <><h2>📝Welcome to the online exam.📝</h2><ul>
               
                <li>✒️ Please listen to the instructions carefully.</li>
                <li>✒️ You will be asked a question, and you must answer it using your voice.</li>
                <li>✒️ You can modify your answer after submitting it.</li>
                <li>✒️ Each question has a time limit of 15 minutes.</li>
                <li>✒️ Your answers will be recorded and saved automatically.</li>
                <li>✒️ The exam will begin once you say "Yes".</li>
              </ul></>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
-------------------------------------------------------------------------------------------------------------------------



import React, { useEffect, useState, useRef } from "react";
import { db, collection, addDoc } from "../firebase";
import "./exam.css";

const questions = [
  { id: 1, question: "Discuss the impact of the Industrial Revolution.", marks: 10 },
  { id: 2, question: "Explain the process of photosynthesis.", marks: 5 },
  { id: 3, question: "What are Newton’s three laws of motion?", marks: 10 },
  { id: 4, question: "Describe the significance of World War II.", marks: 10 },
];

const ExamPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const hasStartedExam = useRef(false);

  const speakText = (text) => {
    return new Promise((resolve) => {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 1;
        utterance.onend = () => resolve();
        window.speechSynthesis.speak(utterance);
      } else {
        alert("Text-to-Speech is not supported in this browser.");
        resolve();
      }
    });
  };

  const speechToText = () => {
    return new Promise((resolve, reject) => {
      if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
        alert("Speech recognition is not supported in this browser.");
        reject("Speech recognition not supported");
        return;
      }

      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript.toLowerCase();
        resolve(spokenText);
      };

      recognition.onerror = () => {
        speakText("Sorry, there was an error recognizing your speech. Please try again.");
        reject("Speech recognition failed");
      };

      recognition.start();
    });
  };

  const saveAnswerToFirebase = async (questionId, questionText, answerText, marks) => {
    try {
      await addDoc(collection(db, "exam_answers"), {
        questionId,
        question: questionText,
        answer: answerText,
        marks,
        timestamp: new Date(),
      });
      console.log("Answer saved successfully!");
    } catch (error) {
      console.error("Error saving answer: ", error);
    }
  };

  const startTimer = () => {
    setTimeLeft(15 * 60); // 15 minutes per question   

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          speakText("Time is up for this question.");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (timeLeft > 0 && timeLeft % 300 === 0 && timeLeft !== 900) {
      const minutesLeft = Math.floor(timeLeft / 60);
      speakText(`You have ${minutesLeft} minutes remaining.`);
    }
  }, [timeLeft]);

  const giveInstructions = async () => {
    // speakText("Welcome to the online exam.");
    // speakText("1. You will be asked a question, and you must answer it using your voice.");
    // speakText("2. You can modify your answer after submitting it.");
    // speakText("3. Each question has a time limit of 15 minutes.");
    // speakText("4. Your answers will be recorded and saved automatically.");

    while (true) {
      await speakText("Are you ready to begin? Please say yes or no.");
      const response = await speechToText();

      if (response.includes("yes")) {
        speakText("Great! Let's begin.");
        setCurrentStep(1);
        break;
      } else {
        speakText("I will ask you again in 5 seconds.");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  };

  const processCommand = (text) => {
    const numbers = text.match(/\d+/g); 
  
    if (numbers) {
      let qNum = parseInt(numbers[0], 10); 
      if (qNum >= 1 && qNum <= questions.length) {
        setCurrentStep(qNum); 
      } else {
        speakText("Invalid question number. Please try again.");
      }
    } else {
      speakText("I didn't understand. Please say a question number.");
    }
  };

  const handleQuestionFlow = async () => {
    if (currentStep > questions.length) {
      await speakText("You have completed the exam. Thank you for your participation.");
      clearInterval(timerRef.current);
      return;
    }

    const currentQuestion = questions[currentStep - 1];
    await speakText(`Question ${currentStep}: ${currentQuestion.question}. This question carries ${currentQuestion.marks} marks.`);

    await speakText("You have 15 minutes to answer this question.");

    startTimer();

    await speakText("Please say your answer now.");
    const recordedAnswer = await speechToText();

    setAnswers((prevAnswers) => {
      const updatedAnswers = [...prevAnswers];
      updatedAnswers[currentStep - 1] = recordedAnswer;
      return updatedAnswers;
    });

    await saveAnswerToFirebase(currentQuestion.id, currentQuestion.question, recordedAnswer, currentQuestion.marks);

    await speakText("Your answer has been recorded.");
    await speakText("Do you want to modify your answer? Say yes or no.");
    let response = await speechToText();
    do {
      if (response.includes("yes")) {
        await speakText("Please describe how you want to modify your answer.");
      
        const modificationRequest = await speechToText();
      
        try {
          const currentQuestion = questions[currentStep - 1]; 
          const currentAnswer = answers[currentStep - 1] || ""; // Ensure it's not undefined

          console.log("Debugging Request:");
          console.log("Question:", currentQuestion?.question || "No question found");
          console.log("Original Answer:", recordedAnswer || "No answer found");
          console.log("Modification Request:", modificationRequest || "No modification request");
    
          console.log("Sending to backend:", {
            question: currentQuestion.question,
            original_answer: currentAnswer,
            modification_request: modificationRequest
          });
    
            response = await fetch("http://localhost:5000/modify_answer", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              question: currentQuestion?.question || "", 
              original_answer: recordedAnswer, 
              modification_request: modificationRequest,
            }),
          });
    
          const data = await response.json();
    
          if (data.modified_answer) { 
            setAnswers((prevAnswers) => {
              const updatedAnswers = [...prevAnswers];
              updatedAnswers[currentStep - 1] = data.modified_answer;
              return updatedAnswers;
            });
    
            await saveAnswerToFirebase(
              currentQuestion.id,
              currentQuestion.question,
              data.modified_answer,
              currentQuestion.marks
            );
    
            await speakText("Your answer has been updated.");
          } else {
            await speakText("Sorry, the modification could not be processed.");
          }
        } catch (error) {
          console.error("Error communicating with backend:", error);
          await speakText("There was an error processing your request. Please try again.");
        }
    
        await speakText("Do you want to modify your answer? Say yes or no.");
        response = await speechToText(); 
      }
    } while (response.includes("yes"));
    
    await speakText("Do you want to go to the next question? Say yes or a question number.");
    let ques = await speechToText();

    if (ques.includes("yes")) {
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      processCommand(ques);
    }
  };

  useEffect(() => {
    if (!hasStartedExam.current) {
      hasStartedExam.current = true;
      giveInstructions();
    }
  }, []);

  useEffect(() => {
    if (currentStep > 0 && currentStep <= questions.length) {
      handleQuestionFlow();
    }
  }, [currentStep]);

  return (
    <div className="exam-container">
      <div className="exam-child">
        <h1>Exam</h1>

        {currentStep > 0 && currentStep <= questions.length && (
          <h2>
            Time Left: {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")}
          </h2>
        )}

        <div className="questions">
          {currentStep > 0 && currentStep <= questions.length ? (
            <>
              <h2>{questions[currentStep - 1]?.question}</h2>
              <p>Marks: {questions[currentStep - 1]?.marks}</p>
              <label>Answer:</label>
              <input type="text" value={answers[currentStep - 1] || ""} readOnly style={{ width: "100%", padding: "10px" }} />
            </>
          ) : (
            <><h2>📝Welcome to the online exam.📝</h2><ul>
               
                <li>✒️ Please listen to the instructions carefully.</li>
                <li>✒️ You will be asked a question, and you must answer it using your voice.</li>
                <li>✒️ You can modify your answer after submitting it.</li>
                <li>✒️ Each question has a time limit of 15 minutes.</li>
                <li>✒️ Your answers will be recorded and saved automatically.</li>
                <li>✒️ The exam will begin once you say "Yes".</li>
              </ul></>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPage;

---------------------------------------------------------------------------------------------------------------





import React, { useEffect, useState, useRef } from "react";
import { db, collection, addDoc } from "../firebase";
import "./exam.css";

const questions = [
  { id: 1, question: "Discuss the impact of the Industrial Revolution.", marks: 10 },
  { id: 2, question: "Explain the process of photosynthesis.", marks: 5 },
  { id: 3, question: "What are Newton’s three laws of motion?", marks: 10 },
  { id: 4, question: "Describe the significance of World War II.", marks: 10 },
];

const ExamPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const hasStartedExam = useRef(false);

  const speakText = (text) => {
    return new Promise((resolve) => {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 1;
        utterance.onend = () => resolve();
        window.speechSynthesis.speak(utterance);
      } else {
        alert("Text-to-Speech is not supported in this browser.");
        resolve();
      }
    });
  };

  const speechToText = () => {
    return new Promise((resolve, reject) => {
      if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
        alert("Speech recognition is not supported in this browser.");
        reject("Speech recognition not supported");
        return;
      }

      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript.toLowerCase();
        resolve(spokenText);
      };

      recognition.onerror = () => {
        speakText("Sorry, there was an error recognizing your speech. Please try again.");
        reject("Speech recognition failed");
      };

      recognition.start();
    });
  };

  const saveAnswerToFirebase = async (questionId, questionText, answerText, marks) => {
    try {
      await addDoc(collection(db, "exam_answers"), {
        questionId,
        question: questionText,
        answer: answerText,
        marks,
        timestamp: new Date(),
      });
      console.log("Answer saved successfully!");
    } catch (error) {
      console.error("Error saving answer: ", error);
    }
  };

  const startTimer = () => {
    setTimeLeft(15 * 60); // 15 minutes per question   

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          speakText("Time is up for this question.");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (timeLeft > 0 && timeLeft % 300 === 0 && timeLeft !== 900) {
      const minutesLeft = Math.floor(timeLeft / 60);
      speakText(`You have ${minutesLeft} minutes remaining.`);
    }
  }, [timeLeft]);

  const giveInstructions = async () => {
    // speakText("Welcome to the online exam.");
    // speakText("1. You will be asked a question, and you must answer it using your voice.");
    // speakText("2. You can modify your answer after submitting it.");
    // speakText("3. Each question has a time limit of 15 minutes.");
    // speakText("4. Your answers will be recorded and saved automatically.");

    while (true) {
      await speakText("Are you ready to begin? Please say yes or no.");
      const response = await speechToText();

      if (response.includes("yes")) {
        speakText("Great! Let's begin.");
        setCurrentStep(1);
        break;
      } else {
        speakText("I will ask you again in 5 seconds.");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  };

  const processCommand = (text) => {
    const numbers = text.match(/\d+/g); 
  
    if (numbers) {
      let qNum = parseInt(numbers[0], 10); 
      if (qNum >= 1 && qNum <= questions.length) {
        setCurrentStep(qNum); 
      } else {
        speakText("Invalid question number. Please try again.");
      }
    } else {
      speakText("I didn't understand. Please say a question number.");
    }
  };

  const handleQuestionFlow = async () => {
    if (currentStep > questions.length) {
      await speakText("You have completed the exam. Thank you for your participation.");
      clearInterval(timerRef.current);
      return;
    }

    async function AnswerText() {
      return new Promise((resolve, reject) => {
          const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
          recognition.continuous = true;
          recognition.interimResults = false;
          recognition.lang = "en-US";
  
          let transcript = "";
  
          recognition.onresult = (event) => {
              const result = event.results[event.results.length - 1][0].transcript.trim();
              transcript += " " + result;
  
              // Stop listening if the user says "end of the answer" or "completed answer"
              if (/end of the answer|completed answer/i.test(result)) {
                  recognition.stop();
                  resolve(transcript.replace(/end of the answer|completed answer/i, "").trim());
              }
          };
  
          recognition.onerror = (event) => {
              reject(event.error);
          };
  
          recognition.onend = () => {
              resolve(transcript.trim());
          };
  
          recognition.start();
      });
  }

    const currentQuestion = questions[currentStep - 1];
    await speakText(`Question ${currentStep}: ${currentQuestion.question}. This question carries ${currentQuestion.marks} marks.`);

    await speakText("You have 15 minutes to answer this question.");

    startTimer();

    await speakText("Please say your answer now.");
    const recordedAnswer = await AnswerText();

    setAnswers((prevAnswers) => {
      const updatedAnswers = [...prevAnswers];
      updatedAnswers[currentStep - 1] = recordedAnswer;
      return updatedAnswers;
    });

    await saveAnswerToFirebase(currentQuestion.id, currentQuestion.question, recordedAnswer, currentQuestion.marks);

    await speakText("Your answer has been recorded.");
    await speakText("Do you want to modify your answer? Say yes or no.");
    let response = await speechToText();
    do {
      if (response.includes("yes")) {
        await speakText("Please describe how you want to modify your answer.");
      
        const modificationRequest = await speechToText();
      
        try {
          const currentQuestion = questions[currentStep - 1]; 
          const currentAnswer = answers[currentStep - 1] || ""; // Ensure it's not undefined

          console.log("Debugging Request:");
          console.log("Question:", currentQuestion?.question || "No question found");
          console.log("Original Answer:", recordedAnswer || "No answer found");
          console.log("Modification Request:", modificationRequest || "No modification request");
    
          console.log("Sending to backend:", {
            question: currentQuestion.question,
            original_answer: currentAnswer,
            modification_request: modificationRequest
          });
    
            response = await fetch("http://localhost:5000/modify_answer", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              question: currentQuestion?.question || "", 
              original_answer: recordedAnswer, 
              modification_request: modificationRequest,
            }),
          });
    
          const data = await response.json();
    
          if (data.modified_answer) { 
            setAnswers((prevAnswers) => {
              const updatedAnswers = [...prevAnswers];
              updatedAnswers[currentStep - 1] = data.modified_answer;
              return updatedAnswers;
            });
    
            await saveAnswerToFirebase(
              currentQuestion.id,
              currentQuestion.question,
              data.modified_answer,
              currentQuestion.marks
            );
    
            await speakText("Your answer has been updated.");
          } else {
            await speakText("Sorry, the modification could not be processed.");
          }
        } catch (error) {
          console.error("Error communicating with backend:", error);
          await speakText("There was an error processing your request. Please try again.");
        }
    
        await speakText("Do you want to modify your answer? Say yes or no.");
        response = await speechToText(); 
      }
    } while (response.includes("yes"));
    
    await speakText("Do you want to go to the next question? Say yes or a question number.");
    let ques = await speechToText();

    if (ques.includes("yes")) {
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      processCommand(ques);
    }
  };

  useEffect(() => {
    if (!hasStartedExam.current) {
      hasStartedExam.current = true;
      giveInstructions();
    }
  }, []);

  useEffect(() => {
    if (currentStep > 0 && currentStep <= questions.length) {
      handleQuestionFlow();
    }
  }, [currentStep]);

  return (
    <div className="exam-container">
      <div className="exam-child">
        <h1>Exam</h1>

        {currentStep > 0 && currentStep <= questions.length && (
          <h2>
            Time Left: {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")}
          </h2>
        )}

        <div className="questions">
          {currentStep > 0 && currentStep <= questions.length ? (
            <>
              <h2>{questions[currentStep - 1]?.question}</h2>
              <p>Marks: {questions[currentStep - 1]?.marks}</p>
              <label>Answer:</label>
              <input type="text" value={answers[currentStep - 1] || ""} readOnly style={{ width: "100%", padding: "10px" }} />
            </>
          ) : (
            <><h2>📝Welcome to the online exam.📝</h2><ul>
               
                <li>✒️ Please listen to the instructions carefully.</li>
                <li>✒️ You will be asked a question, and you must answer it using your voice.</li>
                <li>✒️ You can modify your answer after submitting it.</li>
                <li>✒️ Each question has a time limit of 15 minutes.</li>
                <li>✒️ Your answers will be recorded and saved automatically.</li>
                <li>✒️ The exam will begin once you say "Yes".</li>
              </ul></>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
