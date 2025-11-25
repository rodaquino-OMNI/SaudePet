"""
NLP endpoints for intent classification and entity extraction.
"""
import logging
from typing import Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..llm.orchestrator import LLMOrchestrator

router = APIRouter()
logger = logging.getLogger(__name__)

llm = LLMOrchestrator()


class IntentRequest(BaseModel):
    """Request for intent classification."""

    text: str
    context: Optional[Dict[str, any]] = None


class IntentResponse(BaseModel):
    """Response for intent classification."""

    intent: str
    confidence: float
    entities: Optional[Dict[str, str]] = None


@router.post("/intent", response_model=IntentResponse)
async def classify_intent(request: IntentRequest):
    """
    Classify user intent from natural language text.
    """
    try:
        logger.info(f"Classifying intent for text: {request.text[:50]}...")

        # Simple intent classification
        text_lower = request.text.lower()

        intents = {
            "consultation": ["consulta", "doente", "sintoma", "dor", "vomito", "febre"],
            "pet_info": ["pet", "cachorro", "gato", "animal"],
            "history": ["historico", "registro", "prontuario"],
            "subscription": ["assinatura", "plano", "pagar"],
            "help": ["ajuda", "help", "socorro"],
            "greeting": ["ola", "oi", "bom dia", "boa tarde", "boa noite"],
            "menu": ["menu", "inicio", "voltar"],
        }

        detected_intent = "unknown"
        confidence = 0.5

        for intent, keywords in intents.items():
            if any(keyword in text_lower for keyword in keywords):
                detected_intent = intent
                confidence = 0.85
                break

        return IntentResponse(
            intent=detected_intent,
            confidence=confidence,
            entities=None,
        )
    except Exception as e:
        logger.error(f"Error classifying intent: {e}")
        raise HTTPException(status_code=500, detail="Failed to classify intent")
