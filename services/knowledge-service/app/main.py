from fastapi import FastAPI
app = FastAPI(title="opsmind knowledge service")

@app.get("/health")
async def health():
    return {
        "status":"healthy",
        "service":"knowledge-service"
    }