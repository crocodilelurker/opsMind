from pydantic import BaseModel, Field

class KnowlegdeIngestRequest (BaseModel):
    project_id:int = Field(...,description="stores id of the project")
    content : str = Field(...,description="stores the content to index")
class KnowlegdeQueryRequest (BaseModel):
    project_id:int = Field(...,description="stores id of the project")
    query_text:str = Field(...,description="stores the query")