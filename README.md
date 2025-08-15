# Inclusive Exam System: Optimized with LLM & Voice Technology for the Visually Challenged

## 📌 Overview
The **Inclusive Exam System** is a web-based platform designed to enable **visually challenged students** to take exams independently using **voice interaction**.  
It integrates **Speech-to-Text**, **Text-to-Speech**, **Voice Authentication**, and **LLM-powered answer modification** while preventing malpractice.

This project aims to create an **accessible, inclusive, and AI-assisted** examination environment.

---

## 🚀 Features

### 🎯 Candidate Side
- **Voice-Guided Navigation** — Navigate through the system entirely via voice.
- **Voice Authentication** — Login using pre-registered voice samples.
- **Speech-to-Text Answering** — Speak answers directly; system transcribes in real-time.
- **Question Reading** — Automatic reading of MCQs, short, and long questions.
- **Answer Management** — Modify, delete, reread, or skip answers using voice commands.
- **LLM-Assisted Editing** — Modify answers with AI help (without providing direct exam answers).
- **Malpractice Prevention** — System ensures no unfair AI-generated answers.
- **Time Alerts & Auto Submission** — Get time updates and automatic submission on timeout.
- **Answer Sheet Download** — PDF generation of completed answers.

### 🛠 Admin Side
- **Secure Login** — Username & password authentication.
- **Question Upload & Management** — Upload questions of various types.
- **Student Data Management** — Pre-fill and store student details for mapping with voice login.
- **Answer Review** — View and manage submitted answers from students.

---

## 🖥️ Tech Stack

**Frontend**  
- ReactJS  
- React Router  
- Web Speech API (Speech Recognition & Speech Synthesis)  
- html2pdf.js (PDF generation)

**Backend**  
- Python Flask

**Database**  
- Firebase Firestore (with subcollections for `exam_answers`)

**Voice Technology**  
- Text-to-Speech: `SpeechSynthesisUtterance`  
- Speech-to-Text: Web Speech API  
- Voice Authentication: `resemblyzer`

**AI Integration**  
- LLaMA 3 (via Ollama) for AI-assisted answer modifications


---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

git clone https://github.com/Sduthika28/inclusive-exam-system.git
cd inclusive-exam-system

### 2️⃣ Setup Backend (Flask)

cd backend
pip install -r requirements.txt
python app.py
### 3️⃣ Setup Frontend (React)
cd frontend
npm install
npm start
4️⃣ Configure Firebase

Create a Firebase project in Firebase Console

Enable Firestore Database.

Add your Firebase config in frontend/src/services/firebase.js.

5️⃣ Ollama & LLaMA 3 Setup

Install Ollama

Pull LLaMA 3 model:

ollama pull llama3
Ensure Flask backend can call Ollama locally.

---

🎯 How It Works

Admin uploads questions and pre-registers student details with voice samples.

Candidate logs in via voice authentication — the system maps voice to stored data.

Exam interface reads questions aloud and records spoken answers.

Candidates can modify answers via LLM but cannot get direct AI-generated answers.

Answers are stored in Firestore and can be reviewed by admin.

System generates PDF of answers for record keeping.

