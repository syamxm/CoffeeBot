import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# -------------------------------------------------
# 1. Load environment variables
# -------------------------------------------------
load_dotenv()

# -------------------------------------------------
# 2. Flask setup
# -------------------------------------------------
app = Flask(__name__)
CORS(app)

# -------------------------------------------------
# 3. Gemini API key rotation setup
# -------------------------------------------------
API_KEYS = [
    os.getenv("GOOGLE_API_KEY_RAZFAN"),
    os.getenv("GOOGLE_API_KEY_SYAMIM"),
    os.getenv("GOOGLE_API_KEY_HATEEM")
]

# Remove empty / missing keys
API_KEYS = [key for key in API_KEYS if key]

if not API_KEYS:
    raise RuntimeError("❌ No Google API keys found in .env")

current_key_index = 0

def configure_gemini():
    """Configure Gemini using the current API key"""
    genai.configure(api_key=API_KEYS[current_key_index])
    print(f"✅ Using Gemini API key #{current_key_index + 1}")

configure_gemini()

# -------------------------------------------------
# 4. System Instruction
# -------------------------------------------------
SYSTEM_INSTRUCTION = """
### ROLE
You are 'The Barista Bot,' a medieval innkeeper serving magical bean elixirs. 
You speak in MEDIEVAL ENGLISH (e.g., "Hark," "Thou," "Potion").

### TASK
Your goal is to recommend a specific coffee drink.

### RULES
1. **MEMORY CHECK:** Look at what the user has ALREADY told you.
2. **MISSING INFO:** If you do NOT know the user's preference for (1) Temperature (Hot/Cold) and (2) Flavor Profile (Sweet/Bitter/Strong), ask for it specifically.
3. **THE STOP CONDITION:** If the user has provided enough info, DO NOT ASK MORE QUESTIONS.
4. **EXECUTION:** Immediately recommend a drink with a fantasy name.

**GUARDRAILS:**
- If the user talks about non-coffee topics, reply:
  "My scrolls contain only coffee spells. Let us return to the brew!"
"""

# -------------------------------------------------
# 5. Model definitions
# -------------------------------------------------
model_high = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction=SYSTEM_INSTRUCTION
)

model_lite = genai.GenerativeModel(
    model_name="gemini-2.5-flash-lite",
    system_instruction=SYSTEM_INSTRUCTION
)

# -------------------------------------------------
# 6. In-memory chat sessions
# -------------------------------------------------
# Structure:
# { session_id: { chat, count, tier } }
chat_sessions = {}

# -------------------------------------------------
# 7. Chat endpoint
# -------------------------------------------------
@app.route('/chat', methods=['POST'])
def chat():
    global current_key_index

    try:
        data = request.json
        user_message = data.get("message")
        session_id = data.get("sessionId", "default_user")

        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # --- Session setup ---
        if session_id not in chat_sessions:
            chat_sessions[session_id] = {
                "chat": model_high.start_chat(history=[]),
                "count": 0,
                "tier": "high"
            }

        session_data = chat_sessions[session_id]
        session_data["count"] += 1

        # --- Model switching after 20 messages ---
        if session_data["count"] > 20 and session_data["tier"] == "high":
            old_history = session_data["chat"].history
            session_data["chat"] = model_lite.start_chat(history=old_history)
            session_data["tier"] = "lite"
            print(f"🔄 Switched {session_id} to Lite model")

        # --- Send message ---
        response = session_data["chat"].send_message(user_message)
        return jsonify({"reply": response.text})

    except Exception as e:
        print(f"❌ Gemini error: {e}")

        # Rotate API key if available
        if current_key_index < len(API_KEYS) - 1:
            current_key_index += 1
            configure_gemini()
            return jsonify({
                "reply": "The scrolls were refreshed. Pray, speak again."
            }), 500

        return jsonify({
            "reply": "All magical scrolls are exhausted. Return anon, weary traveller."
        }), 500

# -------------------------------------------------
# 8. Home route
# -------------------------------------------------
@app.route('/')
def home():
    return render_template('index.html')

# -------------------------------------------------
# 9. Run server
# -------------------------------------------------
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
