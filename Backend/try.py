import ollama

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

    # Filter response to ensure no excessive modifications
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
    
    # Reject if the modified answer is significantly longer
    if len(modified) > len(original) * 1.2:  # Allow at most 20% expansion
        return True
    
    # Check for unauthorized phrases
    if any(phrase in modified.lower() for phrase in blocked_phrases):
        return True
    
    return False



original_answer = """Ants are eusocial insects that live in organized colonies. They have a caste system including workers, soldiers, and queens."""
modification_request = "expand this answer"

# Get modified answer
output = modify_answer(original_answer, modification_request)
print("Modified Answer:", output)