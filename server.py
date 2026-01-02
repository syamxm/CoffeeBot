import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# 1. Load env vars
load_dotenv()

app = Flask(__name__)
CORS(app)

# 2. Configure API Key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY not found in .env file")
genai.configure(api_key=api_key)

# 3. DEFINE YOUR MODELS
# "High" is the smart one (first 20 messages)
# "Lite" is the cheap one (after 20 messages)
MODEL_HIGH_NAME = "gemini-2.5-flash"      # Standard 2.5
MODEL_LITE_NAME = "gemini-2.5-flash-lite" # Cheaper/Faster 2.5 Lite

# We create two model objects globally
model_high = genai.GenerativeModel(MODEL_HIGH_NAME)
model_lite = genai.GenerativeModel(MODEL_LITE_NAME)

SYSTEM_INSTRUCTION = """
### ROLE
You are 'The Barista Bot,' a medieval innkeeper serving magical bean elixirs. 
You speak in MEDIEVAL ENGLISH (e.g., "Hark," "Thou," "Potion").
"""

# 4. MEMORY STORAGE
# Structure: 
# { 
#   "session_id": { 
#       "chat": chat_object, 
#       "count": 0, 
#       "current_tier": "high" 
#   } 
# }
chat_sessions = {}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get("message")
        session_id = data.get("sessionId", "default_user")

        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # --- INITIALIZE SESSION IF MISSING ---
        if session_id not in chat_sessions:
            # Start with HIGH tier model
            print(f"New session {session_id}: Starting with {MODEL_HIGH_NAME}")
            new_chat = model_high.start_chat(history=[
                {"role": "user", "parts": SYSTEM_INSTRUCTION},
                {"role": "model", "parts": "I understand. I am the Barista Bot."}
            ])
            chat_sessions[session_id] = {
                "chat": new_chat,
                "count": 0,
                "current_tier": "high"
            }

        # Get session data
        session_data = chat_sessions[session_id]
        session_data["count"] += 1
        current_count = session_data["count"]

        # --- THE SWITCH LOGIC (High -> Lite) ---
        # If we just hit message 21, and we are still on 'high', switch to 'lite'
        if current_count > 20 and session_data["current_tier"] == "high":
            print(f"⚠️ Limit reached ({current_count} msgs). Switching {session_id} to LITE model.")
            
            # 1. Grab history from the old chat
            old_history = session_data["chat"].history
            
            # 2. Start new chat with LITE model, injecting old history
            #    (We use the same history list so the bot remembers context)
            new_lite_chat = model_lite.start_chat(history=old_history)
            
            # 3. Update our session storage
            session_data["chat"] = new_lite_chat
            session_data["current_tier"] = "lite"

        # --- SEND MESSAGE ---
        chat_object = session_data["chat"]
        response = chat_object.send_message(user_message)

        return jsonify({
            "reply": response.text
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"reply": "The magical scrolls are tangled (Server Error)."}), 500

@app.route('/reset', methods=['POST'])
def reset():
    data = request.json
    session_id = data.get("sessionId", "default_user")
    if session_id in chat_sessions:
        del chat_sessions[session_id]
        return jsonify({"message": "Memory cleared."})
    return jsonify({"message": "No memory found."})

if __name__ == '__main__':
    app.run(debug=True)