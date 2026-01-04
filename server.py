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

# 3. Load ALL API Keys
KEYS = {
    "razfan": os.getenv("GEMINI_API_KEY_RAZFAN"),
    "syamim": os.getenv("GEMINI_API_KEY_SYAMIM"),
    "hateem": os.getenv("GEMINI_API_KEY_HATEEM")
}

# Check for missing keys
missing_keys = [k for k, v in KEYS.items() if not v]
if missing_keys:
    print(f"Warning: Missing API keys for: {', '.join(missing_keys)}")

# 4. SYSTEM INSTRUCTION (Unchanged)
SYSTEM_INSTRUCTION = """
### ROLE
You are 'The Barista Bot,' a medieval innkeeper serving magical bean elixirs. 
You speak in MEDIEVAL ENGLISH (e.g., "Hark," "Thou," "Potion," "Brew").

### KNOWLEDGE BASE (The Secret Scrolls)
You possess hidden knowledge of the menus from two great realms: **Zus Coffee** and **Kenangan Coffee**. 
*Do not explicitly tell the user you have "checked their menus," simply possess this knowledge.*

**Common Signatures to Recommend:**
- **Zus Coffee:** Spanish Latte, CEO Latte, Thunder, Buttercrème Latte, Velvet Creme.
- **Kenangan Coffee:** Kenangan Latte (Gula Aren), Avocado Coffee, Salted Caramel Macchiato, Hojicha Latte.

### TASK
Your goal is to recommend a specific coffee drink based on user input.

### RULES
1. **MEMORY CHECK:** Look at what the user has ALREADY told you.
2. **MISSING INFO:** If you do NOT know the user's preference for (1) Temperature (Hot/Cold) and (2) Flavor Profile (Sweet/Bitter/Strong), ask for it specifically in character.
3. **THE RECOMMENDATION LOGIC:**
   - **Specific Match:** If the user's preference aligns with a signature drink from Zus or Kenangan, recommend that specific drink and **name the cafe** (e.g., "Thou must seek the legendary Spanish Latte at the House of Zus!").
   - **Generic Match:** If the recommendation is a standard potion (like a standard Americano or Cappuccino) that isn't a unique signature of those two, recommend the drink **without** stating a cafe name.
4. **NON-COFFEE TOPICS:** If the user speaks of matters not related to coffee, reply: "My scrolls contain only coffee spells. Let us return to the brew!"
"""

# 5. HELPER: Determine Owner & Model based on Count
def get_rotation_state(count):
    # Phase 1: High Model (Flash)
    if count <= 20:
        return "razfan", "gemini-2.0-flash"
    elif count <= 40:
        return "syamim", "gemini-2.0-flash"
    elif count <= 60:
        return "hateem", "gemini-2.0-flash"
    
    # Phase 2: Lite Model (Flash-Lite)
    elif count <= 80:
        return "razfan", "gemini-2.0-flash-lite"
    elif count <= 100:
        return "syamim", "gemini-2.0-flash-lite"
    else:
        # 101+ onwards
        return "hateem", "gemini-2.0-flash-lite"

# 6. IN-MEMORY STORAGE
# Structure: { "session_id": { "chat": chat_object, "count": 0, "owner": "razfan", "model_name": "..." } }
chat_sessions = {}

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get("message")
        session_id = data.get("sessionId", "default_user")

        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # Initialize session if not exists
        if session_id not in chat_sessions:
            chat_sessions[session_id] = {
                "chat": None, # Will be initialized below
                "count": 0,
                "owner": None,
                "model_name": None
            }
        
        session_data = chat_sessions[session_id]
        session_data["count"] += 1
        current_count = session_data["count"]

        # --- ROTATION LOGIC START ---
        # 1. Determine who pays (Owner) and what brain to use (Model)
        target_owner, target_model_name = get_rotation_state(current_count)
        
        # 2. Check if we need to switch (either Owner changed OR Model changed)
        # We also force a switch if "chat" is None (first message)
        needs_switch = (
            session_data["chat"] is None or
            session_data["owner"] != target_owner or 
            session_data["model_name"] != target_model_name
        )

        if needs_switch:
            print(f"[{session_id}] Switching to Owner: {target_owner} | Model: {target_model_name} (Msg #{current_count})")
            
            # A. Extract old history (if any)
            old_history = []
            if session_data["chat"] is not None:
                old_history = session_data["chat"].history

            # B. Configure Global GenAI with the TARGET OWNER'S Key
            # Note: In a production multi-threaded app, this global switch can be risky.
            # For this specific logic, we configure immediately before creating the model.
            active_key = KEYS.get(target_owner)
            if not active_key:
                return jsonify({"reply": f"The scrolls for {target_owner} are missing (API Key not found)!"}), 500
            
            genai.configure(api_key=active_key)

            # C. Create New Model & Chat
            new_model = genai.GenerativeModel(model_name=target_model_name, system_instruction=SYSTEM_INSTRUCTION)
            session_data["chat"] = new_model.start_chat(history=old_history)
            
            # D. Update Session State
            session_data["owner"] = target_owner
            session_data["model_name"] = target_model_name

        else:
            # Even if we don't switch models, we must ensure the global API key 
            # is set to the current owner (in case another user changed it in the meantime)
            active_key = KEYS.get(session_data["owner"])
            genai.configure(api_key=active_key)

        # --- ROTATION LOGIC END ---

        # Send message
        response = session_data["chat"].send_message(user_message)
        
        return jsonify({"reply": response.text})

    except Exception as e:
        print(f"Error generating response: {e}")
        return jsonify({"reply": "The magical scrolls are tangled. I cannot read the coffee omens right now."}), 500

@app.route('/')
def home():
    return render_template('index.html') 

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)