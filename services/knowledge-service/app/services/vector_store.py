from app.database import get_db
async def save_project_vector(project_id:int, content:str,embedding:list[float]):
    async with get_db() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "INSERT INTO project_vectors (project_id, content, embedding) VALUES (%s, %s, %s::vector)",
                (project_id, content, str(embedding))
            )
            await conn.commit()

async def search_project_vectors(project_id:int, embedding:list[float], top_k:int=5):
    async with get_db() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT project_id, content, (embedding <=> %s::vector) AS distance "
                "FROM project_vectors "
                "WHERE project_id = %s "
                "ORDER BY embedding <=> %s::vector "
                "LIMIT %s",
                (str(embedding), project_id, str(embedding), top_k)
            )
            rows = await cur.fetchall()
            return rows