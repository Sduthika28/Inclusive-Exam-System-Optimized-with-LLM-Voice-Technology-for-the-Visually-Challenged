import numpy as np
import sounddevice as sd
import scipy.io.wavfile as wav
from resemblyzer import VoiceEncoder, preprocess_wav
import os


encoder = VoiceEncoder()


DURATION = 5 
SAMPLE_RATE = 16000  
DATA_PATH = "voice_data"  


os.makedirs(DATA_PATH, exist_ok=True)

def record_audio(filename, duration=DURATION, samplerate=SAMPLE_RATE):
    print(f"🎙 Recording for {duration} seconds...")
    audio = sd.rec(int(duration * samplerate), samplerate=samplerate, channels=1, dtype='int16')
    sd.wait() 
    wav.write(filename, samplerate, audio)
    print(f"✅ Recording saved: {filename}")

def extract_embedding(audio_path):
    try:
        wav_data = preprocess_wav(audio_path)  
        return encoder.embed_utterance(wav_data)
    except Exception as e:
        print(f"❌ Error processing audio file: {e}")
        return None

def save_enrollment_voice(user_id):
    filename = os.path.join(DATA_PATH, f"user_{user_id}_enrollment.wav")
    record_audio(filename)
    embedding = extract_embedding(filename)
    
    if embedding is None:
        print("❌ Enrollment failed. Try again.")
        return

    np.save(os.path.join(DATA_PATH, f"user_{user_id}_embedding.npy"), embedding)
    print("✅ Enrollment successful! Voice embedding saved.")

def authenticate_user(user_id):
    filename = os.path.join(DATA_PATH, f"user_{user_id}_test.wav")
    record_audio(filename)

    stored_embedding_path = os.path.join(DATA_PATH, f"user_{user_id}_embedding.npy")
    if not os.path.exists(stored_embedding_path):
        print("⚠ No enrolled voice found for user. Please enroll first.")
        return False

    stored_embedding = np.load(stored_embedding_path)
    test_embedding = extract_embedding(filename)

    if test_embedding is None:
        print("❌ Authentication failed due to processing error.")
        return False

    similarity = np.dot(stored_embedding, test_embedding) / (np.linalg.norm(stored_embedding) * np.linalg.norm(test_embedding))
    print(f"📊 Voice Similarity Score: {similarity:.2f}")

    if similarity >= 0.9: 
        print("✅ Authentication successful! 🎉")
        return True
    else:
        print("❌ Authentication failed. Voice does not match.")
        return False

# Main Menu
if __name__ == "__main__":
    print("\n🔹 Voice Authentication System 🔹")
    print("1️⃣ Enroll Voice\n2️⃣ Authenticate User")
    choice = input("Enter your choice (1/2): ")

    user_id = input("Enter User ID: ")

    if choice == "1":
        save_enrollment_voice(user_id)
    elif choice == "2":
        authenticate_user(user_id)
    else:
        print("⚠ Invalid choice. Exiting.")