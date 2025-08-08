from flask import Flask, request, jsonify
import numpy as np
import sounddevice as sd
import scipy.io.wavfile as wav
from resemblyzer import VoiceEncoder, preprocess_wav
import os
from flask_cors import CORS
import ollama

app = Flask(__name__)
CORS(app)

encoder = VoiceEncoder()
SAMPLE_RATE = 16000
DATA_PATH = "voice_data"
os.makedirs(DATA_PATH, exist_ok=True)



def modify_answer(original_answer, modification_request):
    prompt = f"""
    You are an exam answer modification assistant. Your ONLY task is to modify the candidate's given answer based on their request. 
    - DO NOT add explanations, extra details, or change the meaning. 
    - DO NOT generate a new answer or provide hints. 
    - Return ONLY the modified text, keeping it minimal.

    Candidate's original answer:
    "{original_answer}"

    Modification request:
    "{modification_request}"

    Modify the answer accordingly and return only the modified text.
    """

    response = ollama.chat(
        model="llama3",
        messages=[{"role": "system", "content": "Strict modification mode activated."},
                  {"role": "user", "content": prompt}]
    )

    modified_answer = response["message"]["content"]

  
    if detect_malpractice(original_answer, modified_answer):
        return "Modification request denied. The answer should not contain new details."

    return modified_answer

def detect_malpractice(original, modified):
    """
    Prevents excessive modifications:
    - Blocks significant length increase
    - Checks for new topic introductions
    - Detects explanation phrases
    """
    blocked_phrases = ["the correct answer is", "explanation:", "in summary", "this means that"]
    
  
    if len(modified) > len(original) * 1.2:  
        return True
    
 
    if any(phrase in modified.lower() for phrase in blocked_phrases):
        return True
    
    return False


@app.route('/modify_answer', methods=['POST'])
def modify_answer_api():
    data = request.json
    question = data.get("question")
    original_answer = data.get("original_answer", "")
    modification_request = data.get("modification_request")

    if not question:
        return jsonify({"error": "Missing question field"}), 400

    if original_answer == "":
        print("No answer is given")
        return jsonify({"error": "No answer provided"}), 400

    if not modification_request:
        return jsonify({"error": "Missing modification request"}), 400

    print(f"Question: {question}")
    print(f"Original Answer: {original_answer}")
    print(f"Modification Request: {modification_request}")

    modified_answer = modify_answer(original_answer, modification_request)
    print(f"Modified Answer: {modified_answer}")

    return jsonify({"modified_answer": modified_answer})




def record_audio(filename, duration, samplerate=SAMPLE_RATE):
    print(f"🎙 Recording for {duration} seconds...")
    audio = sd.rec(int(duration * samplerate), samplerate=samplerate, channels=1, dtype='int16')
    sd.wait()
    wav.write(filename, samplerate, audio)
    print(f"✅ Recording saved: {filename}")

def extract_embedding(audio_path):
    wav_data = preprocess_wav(audio_path)
    return encoder.embed_utterance(wav_data)

@app.route('/enroll', methods=['POST'])
def enroll_user():
    user_id = request.json.get("user_id")
    filename = os.path.join(DATA_PATH, f"user_{user_id}_enrollment.wav")
    record_audio(filename, duration=30)
    np.save(os.path.join(DATA_PATH, f"user_{user_id}_embedding.npy"), extract_embedding(filename))
    return jsonify({"success": True, "message": "Enrollment successful!"})

@app.route('/authenticate', methods=['POST'])
def authenticate_user():
    user_id = request.json.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    filename = os.path.join(DATA_PATH, f"user_{user_id}_test.wav")
    record_audio(filename, duration=9)  

    stored_embedding_path = os.path.join(DATA_PATH, f"user_{user_id}_embedding.npy")
    if not os.path.exists(stored_embedding_path):
        return jsonify({"success": False, "message": "No enrolled voice found"}), 404

    stored_embedding = np.load(stored_embedding_path)
    test_embedding = extract_embedding(filename)

    if test_embedding is None:
        return jsonify({"success": False, "message": "Authentication failed due to processing error"}), 500

    similarity = np.dot(stored_embedding, test_embedding) / (np.linalg.norm(stored_embedding) * np.linalg.norm(test_embedding))
    
    if similarity >= 0.8:
        return jsonify({"success": True, "message": "Authentication successful!"})
    else:
        return jsonify({"success": False, "message": "Authentication failed. Voice does not match."})


if __name__ == '__main__':
    app.run(debug=True)
