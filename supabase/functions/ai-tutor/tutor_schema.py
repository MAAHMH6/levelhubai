"""
Pydantic Structured Response Model for LevelHubAI AI Tutor.
Enforces academic rigor, step-by-step clarity, and Cambridge curriculum alignment.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class TutorStep(BaseModel):
    """A single step in a step-by-step academic solution."""
    step_number: int = Field(description="Sequential step number (1, 2, 3...)")
    instruction: str = Field(description="Clear explanation of the action or rule applied in this step")
    working: Optional[str] = Field(default=None, description="Mathematical working, code snippet, or formula calculation for this step")


class TutorResponse(BaseModel):
    """
    Canonical structured response model for LevelHubAI AI Tutor.
    Validates model output to ensure student clarity and prevent malformed responses.
    """
    direct_answer: str = Field(
        description="Clear, concise direct answer to the student's question or calculation."
    )
    explanation: str = Field(
        description="Pedagogical explanation connecting the answer to Cambridge syllabus concepts."
    )
    steps: List[TutorStep] = Field(
        default_factory=list,
        description="Numbered step-by-step breakdown of how the solution is reached."
    )
    example: Optional[str] = Field(
        default=None,
        description="A practical worked example or illustrative parallel scenario."
    )
    common_mistake: Optional[str] = Field(
        default=None,
        description="Frequent candidate pitfall or examiner report note for this topic."
    )
    quick_check: Optional[str] = Field(
        default=None,
        description="A short conceptual question for the student to verify their understanding."
    )
    next_step: Optional[str] = Field(
        default=None,
        description="Suggested next topic or practice step in the verified curriculum tree."
    )
