import os
import json
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
# This is the correct way
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure the Gemini API client
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# --- Start of your /generate-quiz function ---
api_key_from_env = os.getenv("GEMINI_API_KEY")
print(f"--- DEBUG: Trying to use API Key: {api_key_from_env} ---")

@app.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    # ADD THESE TWO LINES FOR DEBUGGING
    api_key_from_env = os.getenv("GEMINI_API_KEY")
    print(f"--- DEBUG: Trying to use API Key: {api_key_from_env} ---")

    # ... the rest of your function code ...
    # ... like getting data, calling genai.configure, etc. ...

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

def generate_quiz_questions(disaster_type: str, standard: str, age: int):
    """
    Generates quiz questions using the Gemini API.
    (This is the same function from our previous script)
    """
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        You are a helpful quiz generation assistant. Your task is to create a quiz on disaster management.
        Please generate exactly 5 multiple-choice questions based on the following criteria:
        1.  **Topic:** {disaster_type}
        2.  **Target Audience Standard:** {standard}
        3.  **Target Audience Age:** {age} years old
        **IMPORTANT**: Your response MUST be a valid JSON array of 5 objects.
        Each object must have the keys: "question_id", "question_text", "options" (an object with A,B,C,D), and "correct_answer".
        Do not include any text or markdown formatting like ```json before or after the JSON array.
        """

        response = model.generate_content(prompt)
        
        # Basic cleanup to handle potential markdown formatting
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
        quiz_data = json.loads(cleaned_response)
        return quiz_data

    except Exception as e:
        print(f"An error occurred while calling the Gemini API: {e}")
        return None

# --- API Routes ---

@app.route('/')
def home():
    """Renders the main HTML page."""
    return render_template('index.html')

@app.route('/generate-quiz', methods=['POST'])
def handle_generate_quiz():
    """Handles the quiz generation request from the frontend."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input"}), 400

    disaster_type = data.get('disaster_type')
    standard = data.get('standard')
    age = data.get('age')

    questions = generate_quiz_questions(disaster_type, standard, age)

    if questions:
        return jsonify(questions)
    else:
        return jsonify({"error": "Failed to generate quiz questions from the API."}), 500

# --- Main execution ---
if __name__ == '__main__':
    # Runs the Flask app on [http://127.0.0.1:5000](http://127.0.0.1:5000)
    app.run(debug=True)