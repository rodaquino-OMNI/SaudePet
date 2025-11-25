"""
Veterinary Diagnosis Analyzer using LLM.
"""
import json
import logging
from typing import Any, Dict, List, Optional

from ..llm.orchestrator import LLMOrchestrator

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """Voce e um veterinario virtual experiente com conhecimento abrangente em medicina veterinaria.
Seu objetivo e fornecer analises clinicas precisas e protocolos de tratamento baseados em evidencias.

Diretrizes:
1. Sempre considere a seguranca do animal em primeiro lugar
2. Identifique sinais de urgencia que requerem atendimento presencial
3. Forneca diagnosticos diferenciais com probabilidades estimadas
4. Base seus protocolos de tratamento nas melhores praticas veterinarias
5. Sempre recomende acompanhamento quando necessario

IMPORTANTE: Voce NAO substitui um veterinario presencial. Sempre indique quando uma avaliacao presencial e necessaria."""


class VeterinaryAnalyzer:
    """
    AI-powered veterinary analysis engine.
    """

    def __init__(self, llm: LLMOrchestrator):
        self.llm = llm

    async def analyze_symptoms(
        self,
        symptoms: str,
        pet_info: Optional[Dict[str, Any]] = None,
        clarifying_answers: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Analyze symptoms and provide diagnosis.

        Args:
            symptoms: Description of symptoms
            pet_info: Information about the pet
            clarifying_answers: Answers to clarifying questions

        Returns:
            Analysis result with diagnosis or clarifying questions
        """
        pet_context = self._format_pet_info(pet_info) if pet_info else "Informacoes do pet nao fornecidas."

        if clarifying_answers:
            # We have answers, provide final diagnosis
            prompt = f"""Paciente: {pet_context}

Sintomas relatados: {symptoms}

Informacoes adicionais fornecidas:
{chr(10).join(f'- {a}' for a in clarifying_answers)}

Com base nessas informacoes, forneca sua analise clinica completa.

Responda EXATAMENTE neste formato JSON:
{{
    "needs_clarification": false,
    "diagnosis": {{
        "primary": "diagnostico principal",
        "differentials": [
            {{"condition": "condicao 1", "probability": 30}},
            {{"condition": "condicao 2", "probability": 20}}
        ],
        "urgency_level": "low|medium|high|emergency"
    }},
    "confidence": 0.85
}}"""
        else:
            # Initial analysis - may need clarification
            prompt = f"""Paciente: {pet_context}

Sintomas relatados: {symptoms}

Analise os sintomas e determine:
1. Se voce precisa de mais informacoes para um diagnostico preciso
2. Ou se ja pode fornecer um diagnostico

Se precisar de mais informacoes, liste ate 3 perguntas esclarecedoras.
Se ja pode diagnosticar, forneca o diagnostico.

Responda EXATAMENTE neste formato JSON:
{{
    "needs_clarification": true/false,
    "clarifying_questions": ["pergunta 1", "pergunta 2"] // se needs_clarification = true
    "diagnosis": {{ // se needs_clarification = false
        "primary": "diagnostico principal",
        "differentials": [
            {{"condition": "condicao 1", "probability": 30}},
            {{"condition": "condicao 2", "probability": 20}}
        ],
        "urgency_level": "low|medium|high|emergency"
    }},
    "confidence": 0.75 // se diagnosis presente
}}"""

        try:
            response = await self.llm.complete(
                prompt=prompt,
                system_prompt=SYSTEM_PROMPT,
                temperature=0.3,
                max_tokens=1500,
            )

            # Parse JSON response
            result = self._parse_json_response(response)

            logger.info(
                f"Symptom analysis completed: needs_clarification={result.get('needs_clarification')}"
            )

            return result
        except Exception as e:
            logger.error(f"Error in symptom analysis: {e}")
            # Return a safe default
            return {
                "needs_clarification": True,
                "clarifying_questions": [
                    "Ha quanto tempo esses sintomas comecaram?",
                    "O animal esta comendo e bebendo normalmente?",
                    "Houve alguma mudanca recente na rotina ou alimentacao?",
                ],
            }

    async def get_treatment_protocol(
        self,
        diagnosis: Dict[str, Any],
        pet_info: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Generate treatment protocol for diagnosis.

        Args:
            diagnosis: Diagnosis information
            pet_info: Pet information for dosage calculation

        Returns:
            Treatment protocol
        """
        pet_context = self._format_pet_info(pet_info) if pet_info else ""

        prompt = f"""Paciente: {pet_context}

Diagnostico:
- Principal: {diagnosis.get('primary', 'Nao especificado')}
- Nivel de urgencia: {diagnosis.get('urgency_level', 'medium')}

Forneca um protocolo de tratamento completo.

Responda EXATAMENTE neste formato JSON:
{{
    "medications": [
        {{
            "name": "nome do medicamento",
            "dosage": "dosagem (ex: 10mg/kg)",
            "route": "via de administracao (oral, topica, etc)",
            "frequency": "frequencia (ex: a cada 12h)",
            "duration": "duracao (ex: 7 dias)",
            "instructions": "instrucoes especiais"
        }}
    ],
    "supportive_care": [
        "cuidado de suporte 1",
        "cuidado de suporte 2"
    ],
    "monitoring": [
        "o que monitorar 1",
        "o que monitorar 2"
    ],
    "follow_up": "orientacao de acompanhamento",
    "warnings": [
        "alerta importante 1"
    ]
}}"""

        try:
            response = await self.llm.complete(
                prompt=prompt,
                system_prompt=SYSTEM_PROMPT,
                temperature=0.3,
                max_tokens=2000,
            )

            result = self._parse_json_response(response)

            logger.info(
                f"Treatment protocol generated: {len(result.get('medications', []))} medications"
            )

            return result
        except Exception as e:
            logger.error(f"Error generating treatment: {e}")
            return {
                "medications": [],
                "supportive_care": ["Manter hidratacao", "Repouso"],
                "monitoring": ["Observar melhora dos sintomas"],
                "follow_up": "Se nao houver melhora em 48-72h, procure um veterinario presencial.",
                "warnings": ["Este protocolo nao substitui avaliacao veterinaria presencial."],
            }

    async def analyze_image(
        self,
        image_url: str,
        context: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Analyze pet image for visual findings.

        Args:
            image_url: URL of image to analyze
            context: Additional context about the image

        Returns:
            Image analysis results
        """
        prompt = f"""Analise esta imagem de um animal de estimacao.
{f'Contexto adicional: {context}' if context else ''}

Identifique:
1. Quaisquer achados visuais relevantes
2. Preocupacoes potenciais
3. Recomendacoes baseadas na imagem

Responda em formato JSON:
{{
    "findings": ["achado 1", "achado 2"],
    "concerns": ["preocupacao 1"],
    "recommendations": ["recomendacao 1"],
    "urgency_level": "low|medium|high|emergency"
}}"""

        try:
            response = await self.llm.analyze_with_vision(
                image_url=image_url,
                prompt=prompt,
                system_prompt=SYSTEM_PROMPT,
            )

            result = self._parse_json_response(response)

            logger.info(f"Image analysis completed: urgency={result.get('urgency_level')}")

            return result
        except Exception as e:
            logger.error(f"Error analyzing image: {e}")
            return {
                "findings": ["Nao foi possivel analisar a imagem automaticamente."],
                "concerns": [],
                "recommendations": ["Envie uma foto mais clara ou descreva o que voce observa."],
                "urgency_level": "low",
            }

    def _format_pet_info(self, pet_info: Dict[str, Any]) -> str:
        """Format pet information for prompt."""
        parts = []

        if pet_info.get("species"):
            species_map = {
                "dog": "Cachorro",
                "cat": "Gato",
                "bird": "Ave",
                "exotic": "Exotico",
            }
            parts.append(f"Especie: {species_map.get(pet_info['species'], pet_info['species'])}")

        if pet_info.get("breed"):
            parts.append(f"Raca: {pet_info['breed']}")

        if pet_info.get("age"):
            parts.append(f"Idade: {pet_info['age']} anos")

        if pet_info.get("weight"):
            parts.append(f"Peso: {pet_info['weight']} kg")

        if pet_info.get("sex"):
            sex_map = {"male": "Macho", "female": "Femea"}
            parts.append(f"Sexo: {sex_map.get(pet_info['sex'], pet_info['sex'])}")

        if pet_info.get("neutered") is not None:
            parts.append(f"Castrado: {'Sim' if pet_info['neutered'] else 'Nao'}")

        return "\n".join(parts) if parts else "Informacoes nao disponiveis"

    def _parse_json_response(self, response: str) -> Dict[str, Any]:
        """Parse JSON from LLM response."""
        try:
            # Try to extract JSON from response
            response = response.strip()

            # Handle markdown code blocks
            if "```json" in response:
                start = response.find("```json") + 7
                end = response.find("```", start)
                response = response[start:end].strip()
            elif "```" in response:
                start = response.find("```") + 3
                end = response.find("```", start)
                response = response[start:end].strip()

            return json.loads(response)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.debug(f"Response was: {response}")
            raise
