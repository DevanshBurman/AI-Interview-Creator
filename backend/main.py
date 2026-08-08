import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from backend.api.interview import router as interview_router
from backend.services.data_loader import data_loader

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler: loads curriculum and candidate data once at startup."""
    data_loader.load_data()
    yield

app = FastAPI(
    title="AI Interview Agent API",
    version="2.0.0",
    description="Personalized Technical Interviewer for AI Cohort Hackathon",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(interview_router)

@app.get("/")
def read_root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "AI Interview Agent API",
        "version": "2.0.0",
        "data_loaded": data_loader.is_loaded()
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
