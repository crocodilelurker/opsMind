from fastapi import APIRouter
from app.schemas import KnowlegdeIngestRequest,KnowlegdeQueryRequest
from app.config import settings
router = APIRouter(prefix="/serve",tags=["Knowledge"])

@router.post("/index")
async def index_data(payload:KnowlegdeIngestRequest):
    return {
        "payload sent": payload   
    }

@router.post("/query")
async def query_resp(payload:KnowlegdeQueryRequest) :
    return {
        "payload sent": payload   
    }
@router.get("/config")
async def status():
    return {
        "database_url":settings.DATABASE_URL
    }
