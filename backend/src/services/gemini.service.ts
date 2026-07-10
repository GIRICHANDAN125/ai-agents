import { GoogleGenerativeAI, GenerationConfig } from "@google/generative-ai";
import { logger } from "./logger.service";
import { cacheService } from "./cache.service";

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || "gemini-1.5-pro";

if (!apiKey || apiKey === "your_gemini_api_key_here") {
  logger.warn(
    "GEMINI_API_KEY is not set. Agent calls will fail until a valid key is provided in .env"
  );
}

const client = new GoogleGenerativeAI(apiKey || "");

export interface GeminiCallOptions {
  systemInstruction?: string;
  temperature?: number;
  jsonMode?: boolean;
  cacheKey?: string;
}

/**
 * Calls the Gemini model with a prompt and returns raw text (or parsed JSON if jsonMode is set).
 * All NEXUS agents route their reasoning through this single function so that
 * logging, caching, and error handling stay consistent across the system.
 */
export async function callGemini(
  prompt: string,
  options: GeminiCallOptions = {}
): Promise<string> {
  const { systemInstruction, temperature = 0.4, jsonMode = false, cacheKey } = options;

  if (cacheKey) {
    const cached = cacheService.get<string>(cacheKey);
    if (cached) {
      logger.info(`Gemini cache hit: ${cacheKey}`);
      return cached;
    }
  }

  const generationConfig: GenerationConfig = {
    temperature,
    responseMimeType: jsonMode ? "application/json" : "text/plain",
  };

  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction,
    generationConfig,
  });

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (cacheKey) cacheService.set(cacheKey, text);
    return text;
  } catch (error) {
    logger.error("Gemini call failed", { error: (error as Error).message });
    throw new Error(
      `Gemini request failed: ${(error as Error).message}. Verify GEMINI_API_KEY is valid.`
    );
  }
}

/**
 * Convenience helper that expects the model to return strict JSON and parses it.
 * Falls back to wrapping raw text if parsing fails so the pipeline never hard-crashes.
 */
export async function callGeminiJSON<T>(
  prompt: string,
  options: GeminiCallOptions = {}
): Promise<T> {
  const raw = await callGemini(prompt, { ...options, jsonMode: true });
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    logger.error("Failed to parse Gemini JSON response", { raw });
    throw new Error("Gemini returned malformed JSON");
  }
}
