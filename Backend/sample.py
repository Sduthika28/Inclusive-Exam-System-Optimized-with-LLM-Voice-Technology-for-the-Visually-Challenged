'''from flask import Flask, request, jsonify
import numpy as np
import sounddevice as sd
import scipy.io.wavfile as wav
from resemblyzer import VoiceEncoder, preprocess_wav
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

encoder = VoiceEncoder()
SAMPLE_RATE = 16000
DATA_PATH = "voice_data"
os.makedirs(DATA_PATH, exist_ok=True)

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
    record_audio(filename, duration=9)  # Authentication duration set to 7 seconds

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
    app.run(debug=True)'''
