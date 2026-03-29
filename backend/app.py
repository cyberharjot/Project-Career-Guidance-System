import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from ai_service import get_ai_reply

load_dotenv()

app = Flask(__name__)
CORS(app)

# Temporary memory for now.
# Later we can move this to Firebase.
conversations = {}


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/chat")
def chat():
    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    message = data.get("message")
    history = data.get("history", [])

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    if not message or not message.strip():
        return jsonify({"error": "message is required"}), 400

    if user_id not in conversations:
        conversations[user_id] = []

    # If frontend sends full history, use that as source of truth.
    # Otherwise keep backend memory.
    if history and isinstance(history, list):
        conversations[user_id] = history

    conversations[user_id].append({"role": "user", "content": message})

    try:
        reply = get_ai_reply(conversations[user_id])
    except Exception as e:
        return jsonify({
            "error": "AI request failed",
            "details": str(e)
        }), 500

    conversations[user_id].append({"role": "assistant", "content": reply})

    return jsonify({
        "reply": reply
    })


if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)