# AI Interview Agent

Personalized Technical Interviewer for the AI Cohort Enterprise Program.

## Architecture

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI (Python)
- **AI Service**: Google Gemini API
- **State Management**: Session-based in-memory state

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Unix:
# source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000` and the API will be exposed at `http://localhost:8000/api/interview`.
