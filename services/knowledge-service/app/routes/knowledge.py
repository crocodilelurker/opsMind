from fastapi import APIRouter, Header, HTTPException
from app.schemas import KnowlegdeIngestRequest, KnowlegdeQueryRequest
from app.config import settings
from app.services.embedding import generate_text_embedding
from app.services.vector_store import save_project_vector, search_project_vectors
import urllib.request
import urllib.error

router = APIRouter(prefix="/serve", tags=["Knowledge"])

def verify_project_membership(project_id: int, user_id: str | None):
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized: User ID missing")
    
    url = f"{settings.PROJECT_SERVICE_URL}/{project_id}"
    req = urllib.request.Request(url)
    req.add_header("x-user-id", user_id)
    try:
        with urllib.request.urlopen(req, timeout=5.0) as response:
            if response.status != 200:
                raise HTTPException(status_code=403, detail="You are not a member of this project")
    except urllib.error.HTTPError as e:
        status_code = e.code if e.code in (401, 403, 404) else 403
        raise HTTPException(status_code=status_code, detail="Project access verification failed")
    except Exception as e:
        print(f"[knowledge-service] Error calling project-service: {e}")
        raise HTTPException(status_code=500, detail="Internal server error verifying project membership")

@router.post("/index")
async def index_data(payload: KnowlegdeIngestRequest, x_user_id: str | None = Header(None, alias="x-user-id")):
    verify_project_membership(payload.project_id, x_user_id)

    try:
        vector = await generate_text_embedding(payload.content, task_type="RETRIEVAL_DOCUMENT")

        await save_project_vector(
            project_id=payload.project_id,
            content=payload.content,
            embedding=vector
        )
        return {
            "status": "success",
            "message": "Text successfully transformed into vector matrix via Gemini.",
            "diagnostics": {
                "project_id": payload.project_id,
                "text_length_characters": len(payload.content),
                "generated_vector_dimensions": len(vector) # Should output exactly 1536
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[knowledge-service] error at indexing text: {e}")
        raise HTTPException(status_code=500, detail=f"Error at indexing text: {str(e)}")

@router.post("/query")
async def query_resp(payload: KnowlegdeQueryRequest, x_user_id: str | None = Header(None, alias="x-user-id")):
    verify_project_membership(payload.project_id, x_user_id)
    try:
        query_vector = await generate_text_embedding(payload.query_text, task_type="RETRIEVAL_QUERY")
        matches = await search_project_vectors(
            project_id=payload.project_id,
            embedding=query_vector,
            top_k=3
        )
        results = []
        for row in matches:
            results.append({
                "project_id": row[0],
                "content": row[1],
                "distance": float(row[2]) if row[2] is not None else None
            })
            
        return {
            "status": "success",
            "results": results
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[knowledge-service] error querying project vectors: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Semantic query execution failed: {str(e)}"
        )

# @router.get("/config")
# async def status():
#     return {
#         "database_url": settings.DATABASE_URL,
#         "gemini_api_key": settings.GEMINI_API_KEY
#     }
