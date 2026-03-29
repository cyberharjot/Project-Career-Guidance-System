import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
MODEL = os.getenv("GITHUB_MODEL", "openai/gpt-4.1-mini")
BASE_URL = os.getenv("GITHUB_BASE_URL", "https://models.github.ai/inference")

if not GITHUB_TOKEN:
    raise ValueError("Missing GITHUB_TOKEN in backend/.env")

client = OpenAI(
    api_key=GITHUB_TOKEN,
    base_url=BASE_URL,
)

def build_system_prompt():
    return """
You are FuturePath AI, a smart career guidance assistant.

Goal:
- Ask dynamic career-related questions one at a time.
- Learn the user's interests, strengths, favorite subjects, work style, and goals.
- Keep the conversation natural and friendly.
- Do not ask a fixed list. Adapt based on answers.
- After enough information is collected, provide:
  1) suggested career paths
  2) short explanation
  3) simple roadmap
  4) confidence or match reasoning

Rules:
- Keep replies concise and conversational.
- Ask only one main question at a time unless you are giving final career suggestions.
- If the user already answered enough, stop asking and give recommendation.
- Be clear and human, not robotic.
""".strip()

def get_ai_reply(history):
    """
    history format:
    [
        {"role": "user", "content": "text"},
        {"role": "assistant", "content": "text"}
    ]
    """
    messages = [
        {"role": "system", "content": build_system_prompt()},
        *history
    ]

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.7,
        )
        content = response.choices[0].message.content
        return content.strip() if content else "Sorry, I could not generate a reply."
    except Exception as e:
        print("AI ERROR:", repr(e))
        return "AI Error: " + str(e)