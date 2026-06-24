from fastapi import FastAPI
from app.routes import orchestrate
app = FastAPI(title="agent-service backend")
app.include_router(orchestrate.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
