import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# 1. Load the secret .env file
load_dotenv()

app = Flask(__name__)

# 2. Enable CORS
CORS(app)

# 3. Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY not found in .env file")

genai.configure(api_key=api_key)

# 4. OPTIMIZED SYSTEM INSTRUCTION
SYSTEM_INSTRUCTION = """
### ROLE
You are 'The Barista Bot,' a medieval innkeeper serving magical bean elixirs. 
You speak in MEDIEVAL ENGLISH (e.g., "Hark," "Thou," "Potion").

### TASK
Your goal is to recommend a specific coffee drink.

### RULES
1. **MEMORY CHECK:** Look at what the user has ALREADY told you.
2. **MISSING INFO:** If you do NOT know the user's preference for (1) Temperature (Hot/Cold) and (2) Flavor Profile (Sweet/Bitter/Strong), ask for it specifically.
3. **THE STOP CONDITION:** If the user has provided enough info (or gave a detailed prompt like "I want a strong cold coffee"), DO NOT ASK MORE QUESTIONS. 
4. **EXECUTION:** Immediately recommend a drink. Give it a fantasy name, explain the ingredients, and wish them luck.

**GUARDRAILS:**
- If the user talks about non-coffee topics, reply: "My scrolls contain only coffee spells. Let us return to the brew!"
"""

# --- DEFINE MODELS ---
# We now need TWO model definitions to switch between them
model_high = genai.GenerativeModel(model_name="gemini-2.5-flash", system_instruction=SYSTEM_INSTRUCTION)
model_lite = genai.GenerativeModel(model_name="gemini-2.5-flash-lite", system_instruction=SYSTEM_INSTRUCTION)

# 5. IN-MEMORY STORAGE FOR CHAT SESSIONS
# Structure: { "session_id": { "chat": chat_object, "count": 0, "tier": "high" } }
chat_sessions = {}

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get("message")
        session_id = data.get("sessionId", "default_user")

        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # --- MEMORY LOGIC START ---
        if session_id not in chat_sessions:
            # Start new session with HIGH tier model
            chat_sessions[session_id] = {
                "chat": model_high.start_chat(history=[]),
                "count": 0,
                "tier": "high"
            }
        
        session_data = chat_sessions[session_id]
        session_data["count"] += 1
        
        # --- MODEL SWITCHING LOGIC ---
        # If user exceeds 20 messages and is still on "high", switch to "lite"
        if session_data["count"] > 20 and session_data["tier"] == "high":
            print(f"Switching {session_id} to Lite model (Message #{session_data['count']})")
            
            # Save old history
            old_history = session_data["chat"].history
            
            # Start new chat with Lite model using old history
            session_data["chat"] = model_lite.start_chat(history=old_history)
            session_data["tier"] = "lite"

        chat_session = session_data["chat"]
        # --- MEMORY LOGIC END ---

        # Send message
        response = chat_session.send_message(user_message)
        
        return jsonify({"reply": response.text})

    except Exception as e:
        print(f"Error generating response: {e}")
        return jsonify({"reply": "The magical scrolls are tangled. I cannot read the coffee omens right now."}), 500

@app.route('/')
def home():
    # Keep render_template if you want your HTML to work, 
    # otherwise change back to string if you only want API.
    return render_template('index.html') 

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)