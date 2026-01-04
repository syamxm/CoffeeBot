import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# 1. Load env vars
load_dotenv()

app = Flask(__name__)

# 2. Enable CORS (Essential for separate frontend)
CORS(app)

# 3. Load Keys
KEYS = {
    "razfan": os.getenv("GOOGLE_API_KEY_1"),
    "syamim": os.getenv("GOOGLE_API_KEY_2"),
    "hateem": os.getenv("GOOGLE_API_KEY_3"),
}

# 4. System Instruction
SYSTEM_INSTRUCTION = """
### ROLE
You are 'The Barista Bot,' a helpful and friendly virtual barista.
You speak in clear, modern, and polite English. Your recommendations should be concise and engaging. 
Please limit your responses to a maximum of 50 words.

### KNOWLEDGE BASE
- **Zus Coffee:** Spanish Latte, CEO Latte, Thunder, Buttercrème Latte, Velvet Creme.
- **Kenangan Coffee:** Kenangan Latte (Gula Aren), Avocado Coffee, Salted Caramel Macchiato, Hojicha Latte.

### RULES
1. If user asks for a signature drink from the list, recommend it and **name the cafe**.
2. If generic request, recommend drink **without** naming the cafe.
3. If non-coffee topic, refuse politely.
"""


# 5. Rotation Logic
def get_rotation_state(count):
    # Phase 1: High Model (Flash)
    if count <= 20:
        return "razfan", "gemini-2.5-flash"
    elif count <= 40:
        return "syamim", "gemini-2.5-flash"
    elif count <= 60:
        return "hateem", "gemini-2.5-flash"
    # Phase 2: Lite Model (Flash-Lite)
    elif count <= 80:
        return "razfan", "gemini-2.5-flash-lite"
    elif count <= 100:
        return "syamim", "gemini-2.5-flash-lite"
    else:
        return "hateem", "gemini-2.5-flash-lite"


chat_sessions = {}


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_message = data.get("message")
        session_id = data.get("sessionId", "default_user")

        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # Init Session
        if session_id not in chat_sessions:
            chat_sessions[session_id] = {
                "chat": None,
                "count": 0,
                "owner": None,
                "model_name": None,
            }

        session_data = chat_sessions[session_id]
        session_data["count"] += 1
        current_count = session_data["count"]

        # --- ROTATION LOGIC ---
        target_owner, target_model_name = get_rotation_state(current_count)

        needs_switch = (
            session_data["chat"] is None
            or session_data["owner"] != target_owner
            or session_data["model_name"] != target_model_name
        )

        if needs_switch:
            print(
                f"[{session_id}] Switching to Owner: {target_owner} | Model: {target_model_name}"
            )

            old_history = []
            if session_data["chat"] is not None:
                old_history = session_data["chat"].history

            active_key = KEYS.get(target_owner)
            if not active_key:
                return jsonify({"reply": f"Missing API Key for {target_owner}!"}), 500

            genai.configure(api_key=active_key)
            new_model = genai.GenerativeModel(
                model_name=target_model_name, system_instruction=SYSTEM_INSTRUCTION
            )
            session_data["chat"] = new_model.start_chat(history=old_history)

            session_data["owner"] = target_owner
            session_data["model_name"] = target_model_name
        else:
            # Ensure correct key is active
            genai.configure(api_key=KEYS.get(session_data["owner"]))

        response = session_data["chat"].send_message(user_message)
        return jsonify({"reply": response.text})

    except Exception as e:
        print(f"Server Error: {e}")
        return (
            jsonify({"reply": "The magical scrolls are tangled (Server Error)."}),
            500,
        )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
