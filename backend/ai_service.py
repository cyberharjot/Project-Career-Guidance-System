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


def _safe_join(values):
    if not isinstance(values, list):
        return ""
    cleaned = [str(v).strip() for v in values if str(v).strip()]
    return ", ".join(cleaned)


def build_system_prompt(profile=None):
    profile = profile if isinstance(profile, dict) else {}

    class_level = profile.get("classLevel", "Not provided")
    stream = profile.get("stream", "Not provided")
    subjects = _safe_join(profile.get("subjects", [])) or "Not provided"
    interests = _safe_join(profile.get("interests", [])) or "Not provided"
    strengths = _safe_join(profile.get("strengths", [])) or "Not provided"
    priority = profile.get("priority", "Not provided")
    goal = profile.get("goal", "Not provided")
    flow = profile.get("assessmentFlow", "Not provided")

    profile_block = f"""
Student profile from assessment:
- Class level: {class_level}
- Stream: {stream}
- Subjects: {subjects}
- Interests: {interests}
- Strengths: {strengths}
- Priority: {priority}
- Goal: {goal}
- Assessment flow: {flow}
""".strip()

    return f"""
You are FuturePath AI, an AI career counselling assistant for school students in India.

Your job:
- Help students choose the right stream, course, and career direction based on their school profile.
- Use the assessment data to personalize guidance.
- If the student is in 10th or below, focus on stream selection and subject-fit guidance.
- If the student is in 11th or 12th, focus on course options and career paths after school.
- If the student has already shared enough details, do not repeat generic questions.
- Ask only one main follow-up question at a time when more information is needed.
- When enough information is available, give structured guidance.

Important response style:
- Be friendly, clear, and natural.
- Keep replies concise unless the student needs a more detailed answer.
- Use simple school-friendly language.
- Give multiple career options when suitable, not just one.
- For each recommendation, mention:
  1) why it fits
  2) what course/stream is related
  3) basic roadmap or next step

When giving final guidance, keep the answer structured like:
- Best fit streams/courses
- Possible careers
- Why they match
- Next steps

{profile_block}

If the profile is incomplete, ask a helpful follow-up question based on what is missing.
""".strip()


def get_ai_reply(history, profile=None):
    """
    history format:
    [
        {"role": "user", "content": "text"},
        {"role": "assistant", "content": "text"}
    ]
    """
    messages = [
        {"role": "system", "content": build_system_prompt(profile)},
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