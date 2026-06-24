from fastapi import APIRouter
from app.config import settings
from app.schemas.parser import OrchestrationRequest, ParserOutput
from app.agents.parser import run_parser_agent

router = APIRouter(prefix="/serve", tags=["agent service routes"])

@router.post("/orchestrate", response_model=ParserOutput)
async def orchestrate_query(payload: OrchestrationRequest):
    result = await run_parser_agent(payload.query)
    return result