# FuturePath AI

FuturePath AI is a smart career guidance system for school students.  
It helps students understand their strengths, interests, subjects, and goals, then gives personalized career guidance using AI.

## What this project does

This project is designed for students from school level, especially class 9th to 12th.  
It does not just give random career answers. Instead, it follows a proper flow:

1. Landing page
2. Assessment page
3. Quiz page
4. Chat page
5. Career tools page

The assessment collects basic student details.  
The quiz helps refine the profile further.  
The chatbot then uses this data to give better and more relevant career advice.  
The tools page gives extra features like career comparison, career fit analysis, career reality, and risk meter.

## Main features

- Modern landing page
- School-student assessment form
- Personalized quiz based on student profile
- AI-powered career chatbot
- Career tools page
- Career comparison
- Career fit analysis
- Career reality check
- Career risk meter
- Responsive UI
- Local storage for profile and quiz data

## Tech stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Python
- Flask

### AI
- OpenAI-compatible API through GitHub Models

### Deployment
- Frontend: Netlify
- Backend: Render

## Project structure

```bash
project-root/
├── backend/
│   ├── app.py
│   ├── ai_service.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .env   # not committed to GitHub
│
├── css/
├── js/
├── images/
│
├── index.html
├── assessment.html
├── quiz.html
├── chat.html
├── tools.html
├── README.md
└── .gitignore

How it works
User starts from the landing page
User completes the assessment
User may take the personalized quiz
User chats with AI for guidance
User can open the tools page for deeper career analysis

This flow helps the system understand the student before giving career advice.

Environment variables

Create a .env file inside the backend/ folder and add:

GITHUB_TOKEN=your_api_key_here
GITHUB_MODEL=openai/gpt-4.1-mini
GITHUB_BASE_URL=https://models.github.ai/inference
FLASK_PORT=10000
FLASK_DEBUG=true
Setup instructions
Backend setup

Go to the backend folder and install dependencies:

cd backend
pip install -r requirements.txt

Create your .env file by copying .env.example and filling in the real values.

Start the Flask server:

python app.py
Frontend setup

You can open index.html directly in the browser for local testing.

For a better local workflow, use Live Server in VS Code.

Deployment
Backend on Render

When deploying the backend on Render:

Root directory: backend
Build command: pip install -r requirements.txt
Start command: python app.py
Environment variables:
GITHUB_TOKEN
GITHUB_MODEL
GITHUB_BASE_URL
FLASK_PORT=10000
Frontend on Netlify

Deploy the frontend files to Netlify.

Make sure your frontend points to the live backend URL from Render.

Notes-
Assessment data and quiz result are stored in localStorage for now.
There is no database yet.
There is no login system yet.
This is intentional to keep the project simple, stable, and hackathon-ready.

Team- FUTUREPATH AI
Team ID: OI041
Team Leader: Harleen Kaur
Theme: Open Innovation
GNA HACKATHON 4.0
Project goal

FuturePath AI aims to help students make better career decisions with structured assessment, personalized quiz flow, AI counselling, and decision-support tools.

License

This project is created for hackathon and demo purposes.