"""
LLM Orchestrator for multi-provider AI interactions.
"""
import logging
from typing import Any, Dict, List, Optional

from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
from tenacity import retry, stop_after_attempt, wait_exponential

from ..config import settings

logger = logging.getLogger(__name__)


class LLMOrchestrator:
    """
    Orchestrates LLM interactions with fallback support.
    """

    def __init__(self):
        self.openai_client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None
        self.anthropic_client = AsyncAnthropic(api_key=settings.anthropic_api_key) if settings.anthropic_api_key else None

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
    )
    async def complete(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        provider: str = "openai",
    ) -> str:
        """
        Generate completion from LLM.

        Args:
            prompt: User prompt
            system_prompt: System prompt for context
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            provider: LLM provider to use (openai or anthropic)

        Returns:
            Generated text completion
        """
        try:
            if provider == "openai" and self.openai_client:
                return await self._openai_complete(
                    prompt, system_prompt, temperature, max_tokens
                )
            elif provider == "anthropic" and self.anthropic_client:
                return await self._anthropic_complete(
                    prompt, system_prompt, temperature, max_tokens
                )
            else:
                # Fallback to available provider
                if self.openai_client:
                    return await self._openai_complete(
                        prompt, system_prompt, temperature, max_tokens
                    )
                elif self.anthropic_client:
                    return await self._anthropic_complete(
                        prompt, system_prompt, temperature, max_tokens
                    )
                else:
                    raise ValueError("No LLM provider configured")
        except Exception as e:
            logger.error(f"LLM completion failed: {e}")
            # Try fallback provider
            if provider == "openai" and self.anthropic_client:
                logger.info("Falling back to Anthropic")
                return await self._anthropic_complete(
                    prompt, system_prompt, temperature, max_tokens
                )
            elif provider == "anthropic" and self.openai_client:
                logger.info("Falling back to OpenAI")
                return await self._openai_complete(
                    prompt, system_prompt, temperature, max_tokens
                )
            raise

    async def _openai_complete(
        self,
        prompt: str,
        system_prompt: Optional[str],
        temperature: float,
        max_tokens: int,
    ) -> str:
        """Generate completion using OpenAI."""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = await self.openai_client.chat.completions.create(
            model=settings.openai_model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        return response.choices[0].message.content

    async def _anthropic_complete(
        self,
        prompt: str,
        system_prompt: Optional[str],
        temperature: float,
        max_tokens: int,
    ) -> str:
        """Generate completion using Anthropic."""
        response = await self.anthropic_client.messages.create(
            model=settings.anthropic_model,
            max_tokens=max_tokens,
            system=system_prompt or "",
            messages=[{"role": "user", "content": prompt}],
        )

        return response.content[0].text

    async def analyze_with_vision(
        self,
        image_url: str,
        prompt: str,
        system_prompt: Optional[str] = None,
    ) -> str:
        """
        Analyze image with vision model.

        Args:
            image_url: URL of image to analyze
            prompt: Analysis prompt
            system_prompt: System context

        Returns:
            Analysis result
        """
        if not self.openai_client:
            raise ValueError("OpenAI client required for vision analysis")

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})

        messages.append({
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": image_url}},
            ],
        })

        response = await self.openai_client.chat.completions.create(
            model="gpt-4-vision-preview",
            messages=messages,
            max_tokens=1000,
        )

        return response.choices[0].message.content
