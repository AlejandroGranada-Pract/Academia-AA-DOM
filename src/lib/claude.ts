import Anthropic from "@anthropic-ai/sdk";

// Cliente de Anthropic (lee ANTHROPIC_API_KEY del entorno).
// El asistente usa Claude Sonnet por costo, según el spec del proyecto.
export const anthropic = new Anthropic();

export const ASISTENTE_MODEL = "claude-sonnet-4-6";
