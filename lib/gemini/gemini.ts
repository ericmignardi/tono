import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

export const genAI = new GoogleGenerativeAI(apiKey);

export function getModel(modelName: string = 'gemini-2.5-flash') {
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Retries a Gemini API operation with exponential backoff on 503/429 errors
 * @param operation - The async operation to retry
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param initialDelay - Initial delay in ms (default: 1000)
 */
export async function retryGeminiRequest<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Check for 503 (Service Unavailable) or 429 (Too Many Requests)
      // The error object from Gemini might have status or include the message
      const isOverloaded =
        error.status === 503 ||
        error.status === 429 ||
        error.message?.includes('overloaded') ||
        error.message?.includes('Service Unavailable');

      if (attempt < maxRetries && isOverloaded) {
        const delay = initialDelay * Math.pow(2, attempt); // 1s, 2s, 4s
        console.warn(
          `Gemini API overloaded. Retrying in ${delay}ms (Attempt ${attempt + 1}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}
