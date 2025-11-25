"""
Diagnosis API endpoints for veterinary AI analysis.
"""
import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..llm.orchestrator import LLMOrchestrator
from ..diagnosis.analyzer import VeterinaryAnalyzer

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize services
llm = LLMOrchestrator()
analyzer = VeterinaryAnalyzer(llm)


class PetInfo(BaseModel):
    """Pet information for diagnosis."""

    species: str
    breed: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    sex: Optional[str] = None
    neutered: Optional[bool] = None


class SymptomAnalysisRequest(BaseModel):
    """Request for symptom analysis."""

    symptoms: str
    pet_id: str
    consultation_id: str
    pet_info: Optional[PetInfo] = None
    clarifying_answers: Optional[List[str]] = None


class Differential(BaseModel):
    """Differential diagnosis."""

    condition: str
    probability: int


class Diagnosis(BaseModel):
    """Diagnosis result."""

    primary: str
    differentials: List[Differential]
    urgency_level: str


class SymptomAnalysisResponse(BaseModel):
    """Response for symptom analysis."""

    needs_clarification: bool
    clarifying_questions: Optional[List[str]] = None
    diagnosis: Optional[Diagnosis] = None
    confidence: Optional[float] = None


class TreatmentRequest(BaseModel):
    """Request for treatment protocol."""

    consultation_id: str
    diagnosis: Diagnosis
    pet_info: Optional[PetInfo] = None


class Medication(BaseModel):
    """Medication in treatment protocol."""

    name: str
    dosage: str
    route: str
    frequency: str
    duration: str
    instructions: Optional[str] = None


class TreatmentResponse(BaseModel):
    """Treatment protocol response."""

    medications: List[Medication]
    supportive_care: List[str]
    monitoring: List[str]
    follow_up: str
    warnings: Optional[List[str]] = None


class ImageAnalysisRequest(BaseModel):
    """Request for image analysis."""

    image_url: str
    pet_id: str
    consultation_id: Optional[str] = None
    context: Optional[str] = None


class ImageAnalysisResponse(BaseModel):
    """Response for image analysis."""

    findings: List[str]
    concerns: List[str]
    recommendations: List[str]
    urgency_level: str


@router.post("/analyze", response_model=SymptomAnalysisResponse)
async def analyze_symptoms(request: SymptomAnalysisRequest):
    """
    Analyze pet symptoms and provide diagnosis.
    """
    try:
        logger.info(
            f"Analyzing symptoms for consultation {request.consultation_id}"
        )

        result = await analyzer.analyze_symptoms(
            symptoms=request.symptoms,
            pet_info=request.pet_info.dict() if request.pet_info else None,
            clarifying_answers=request.clarifying_answers,
        )

        return SymptomAnalysisResponse(**result)
    except Exception as e:
        logger.error(f"Error analyzing symptoms: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze symptoms")


@router.post("/treatment", response_model=TreatmentResponse)
async def get_treatment_protocol(request: TreatmentRequest):
    """
    Get treatment protocol for a diagnosis.
    """
    try:
        logger.info(
            f"Generating treatment for consultation {request.consultation_id}"
        )

        result = await analyzer.get_treatment_protocol(
            diagnosis=request.diagnosis.dict(),
            pet_info=request.pet_info.dict() if request.pet_info else None,
        )

        return TreatmentResponse(**result)
    except Exception as e:
        logger.error(f"Error generating treatment: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate treatment")


@router.post("/image", response_model=ImageAnalysisResponse)
async def analyze_image(request: ImageAnalysisRequest):
    """
    Analyze pet image for visual findings.
    """
    try:
        logger.info(f"Analyzing image for pet {request.pet_id}")

        result = await analyzer.analyze_image(
            image_url=request.image_url,
            context=request.context,
        )

        return ImageAnalysisResponse(**result)
    except Exception as e:
        logger.error(f"Error analyzing image: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze image")
