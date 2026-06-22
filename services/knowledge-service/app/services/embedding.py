from google import genai
from google.genai import types
from app.config import settings


client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def generate_text_embedding(text: str, task_type: str = "RETRIEVAL_DOCUMENT"):
    try:
        response = await client.aio.models.embed_content(
            model="gemini-embedding-2",
            contents=text,
            config=types.EmbedContentConfig(
                task_type=task_type,
                output_dimensionality=1536
            )
        )
        return response.embeddings[0].values
    except Exception as e:
        print(f"[knowledge-service] error generating embedding: {e}")
        raise e