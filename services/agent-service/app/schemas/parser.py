from pydantic import BaseModel, Field
from typing import List, Optional

class ParserOutput(BaseModel):
    is_relevant: bool = Field(
        ...,
        description="Set to True if query is related to devops, software programming and project related knowledge or infrastructure, software errors, or system operations. Set to False if it is out-of-scope fluff"
    )
    rejection_reason: Optional[str] = Field(
        None,
        description="Provide a brief, professional explanation of why the prompt was blocked if is_relevant is False."
    )
    cleaned_requirements: List[str] = Field(
        default_factory=list,
        description="A list of clean, explicit bullet points breaking down the technical requirements. Stripped of conversational noise."
    )

class OrchestrationRequest(BaseModel):
    query: str = Field(..., description="The user query to be processed by the agent orchestration mesh.")