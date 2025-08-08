from flask import Flask, request, jsonify
import ollama

app = Flask(__name__)

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
    return modified_answer

@app.route("/modify-answer", methods=["POST"])
def modify_answer_api():
    data = request.json
    original_answer = data.get("original_answer", "")
    modification_request = data.get("modification_request", "")

    if not original_answer or not modification_request:
        return jsonify({"error": "Missing data"}), 400

    modified_answer = modify_answer(original_answer, modification_request)
    return jsonify({"modified_answer": modified_answer})

if __name__ == "__main__":
    app.run(debug=True)
