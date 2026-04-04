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


def _pretty_dict(value):
    if not isinstance(value, dict):
        return "Not provided"
    parts = []
    for k, v in value.items():
        if isinstance(v, list):
            v = _safe_join(v)
        parts.append(f"{k}: {v}")
    return "\n".join(parts) if parts else "Not provided"


def build_system_prompt(profile=None, quiz=None):
    profile = profile if isinstance(profile, dict) else {}
    quiz = quiz if isinstance(quiz, dict) else {}

    class_level = profile.get("classLevel", "Not provided")
    stream = profile.get("stream", "Not provided")
    subjects = _safe_join(profile.get("subjects", [])) or "Not provided"
    interests = _safe_join(profile.get("interests", [])) or "Not provided"
    strengths = _safe_join(profile.get("strengths", [])) or "Not provided"
    priority = profile.get("priority", "Not provided")
    goal = profile.get("goal", "Not provided")
    flow = profile.get("assessmentFlow", "Not provided")

    quiz_path = quiz.get("primaryPath", "Not provided")
    quiz_used = quiz.get("pathUsed", "Not provided")
    quiz_scores = _pretty_dict(quiz.get("scores", {}))
    quiz_top = quiz.get("topRecommendations", [])

    top_text = "Not provided"
    if isinstance(quiz_top, list) and quiz_top:
        lines = []
        for item in quiz_top[:3]:
            if isinstance(item, dict):
                track = item.get("track", "Unknown")
                careers = item.get("careers", "Unknown")
                note = item.get("note", "Unknown")
                lines.append(f"- {track}: {careers} | {note}")
        if lines:
            top_text = "\n".join(lines)

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

    quiz_block = f"""
Quiz insights:
- Primary path: {quiz_path}
- Path used: {quiz_used}
- Scores:
{quiz_scores}
- Top recommendations:
{top_text}
""".strip()

    tool_rules = """
When the user asks for a career tool, respond in a structured and practical way:

1) Career comparison:
- Compare the two careers clearly.
- Include: education time, difficulty, cost, salary, work-life balance, reality check, and final verdict.
- Say which one fits the student better and why the other is less suitable.

2) Career fit analyzer:
- Give a fit score out of 100.
- Explain why it fits.
- Explain mismatch or skill gaps.
- End with a verdict: strong fit / moderate fit / low fit.

3) Career reality:
- Be honest and realistic.
- Mention demand, salary reality, competition, effort required, and challenges.
- Do not sugar-coat.

4) Career risk meter:
- Give a risk score out of 100.
- Label it as low / medium / high risk.
- Explain the reasons for the risk.
- Tell the student how to reduce the risk.

General rules:
- Be friendly, clear, and school-student friendly.
- Use simple language.
- Give practical next steps.
- Use the profile and quiz insights whenever relevant.
- If the question is general career counselling, answer conversationally.
""".strip()

    return f"""
You are FuturePath AI, an AI career counselling assistant for school students in India.

Your job:
- Help students choose the right stream, course, and career direction based on their school profile.
- Use both assessment data and quiz insights to personalize guidance.
- If the student is in 10th or below, focus on stream selection and subject-fit guidance.
- If the student is in 11th or 12th, focus on course options and career paths after school.
- If enough information is already available, do not repeat generic questions.
- Ask only one main follow-up question at a time when more information is needed.
- When enough information is available, give structured guidance.
- If the user asks for a comparison, fit analysis, reality check, or risk meter, follow the tool rules exactly.

Important response style:
- Be friendly, clear, and natural.
- Keep replies concise unless the student needs a more detailed answer.
- Use simple school-friendly language.
- Give multiple career options when suitable, not just one.
- For each recommendation, mention:
  1) why it fits
  2) what course/stream is related
  3) basic roadmap or next step
- If quiz insights exist, use them to sharpen the recommendation and confidence.
- Be honest about career challenges, competition, and effort required.

When giving final guidance, keep the answer structured like:
- Best fit streams/courses
- Possible careers
- Why they match
- Next steps

{tool_rules}

{profile_block}

{quiz_block}

If the profile is incomplete, ask a helpful follow-up question based on what is missing.
""".strip()


def get_ai_reply(history, profile=None, quiz=None):
    """
    history format:
    [
        {"role": "user", "content": "text"},
        {"role": "assistant", "content": "text"}
    ]
    """
    messages = [
        {"role": "system", "content": build_system_prompt(profile, quiz)},
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