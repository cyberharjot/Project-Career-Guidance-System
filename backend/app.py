import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from ai_service import get_ai_reply

load_dotenv()

app = Flask(__name__)
CORS(app)

# Temporary in-memory storage for hackathon/demo use.
# Structure:
# conversations[user_id] = {
#     "history": [...],
#     "profile": {...}
# }
conversations = {}


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


def normalize_history(history):
    """
    Accepts frontend history items and normalizes them into:
    [{"role": "user"|"assistant", "content": "..."}]
    """
    normalized = []

    if not isinstance(history, list):
        return normalized

    for item in history:
        if not isinstance(item, dict):
            continue

        role = item.get("role")
        content = item.get("content")

        if role == "bot":
            role = "assistant"

        if role not in {"user", "assistant"}:
            continue

        if not isinstance(content, str) or not content.strip():
            continue

        normalized.append({
            "role": role,
            "content": content.strip()
        })

    return normalized


@app.post("/chat")
def chat():
    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    message = data.get("message")
    history = data.get("history", [])
    profile = data.get("profile")

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    if not message or not isinstance(message, str) or not message.strip():
        return jsonify({"error": "message is required"}), 400

    if user_id not in conversations:
        conversations[user_id] = {
            "history": [],
            "profile": None
        }

    # If frontend sends profile from assessment, store it.
    if isinstance(profile, dict):
        conversations[user_id]["profile"] = profile

    # If frontend sends full history, use that as the source of truth.
    # Otherwise keep backend memory.
    normalized_history = normalize_history(history)
    if normalized_history:
        conversations[user_id]["history"] = normalized_history

    conversations[user_id]["history"].append({
        "role": "user",
        "content": message.strip()
    })

    try:
        reply = get_ai_reply(
            conversations[user_id]["history"],
            profile=conversations[user_id]["profile"]
        )
    except Exception as e:
        return jsonify({
            "error": "AI request failed",
            "details": str(e)
        }), 500

    conversations[user_id]["history"].append({
        "role": "assistant",
        "content": reply
    })

    return jsonify({
        "reply": reply
    })


if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", "5000"))
    debug_mode = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug_mode)