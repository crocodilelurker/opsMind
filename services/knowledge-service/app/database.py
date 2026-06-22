
from contextlib import asynccontextmanager
from psycopg_pool import AsyncConnectionPool
from app.config import settings

pool = AsyncConnectionPool(
    conninfo=settings.DATABASE_URL,
    min_size=1,
    max_size=10,
    open = False
)

@asynccontextmanager
async def get_db () :
    async with pool.connection() as conn:
        yield conn
