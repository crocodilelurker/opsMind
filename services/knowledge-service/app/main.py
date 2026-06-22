from fastapi import FastAPI
from app.routes import knowledge
from contextlib import asynccontextmanager
from app.database import pool

@asynccontextmanager
async def lifespan(app:FastAPI):
    await pool.open()
    print("[knowledge-service] db connected")
    yield
    await pool.close()

app = FastAPI(title="opsmind knowledge service", lifespan=lifespan)
app.include_router(knowledge.router)



@app.get("/health")
async def health():
    return {
        "status":"healthy",
        "service":"knowledge-service"
    }
