// app/api/gemini/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse, NextRequest } from 'next/server';

// Define an interface for the expected structure of the GoogleGenerativeAI error response
interface GeminiErrorResponse {
  status?: number;
  statusText?: string;
}

// Retrieve API key from environment variables
const geminiApiKey = process.env.GEMINI_API_KEY;

// Basic check for API key presence (server-side warning)
if (!geminiApiKey) {
  console.error('SERVER ERROR: GEMINI_API_KEY environment variable is not set. Please check your .env.local file or Vercel environment variables.');
}

// Initialize the Generative AI client globally if the key is available.
const genAI = new GoogleGenerativeAI(geminiApiKey || '');

export async function POST(req: NextRequest) {
  try {
    const { prompt, modelName: clientModelName } = await req.json();

    const finalModelName = clientModelName || 'gemini-2.0-flash';

    if (!prompt) {
      console.warn('SERVER WARNING: Prompt is missing in the request.');
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    console.log(`SERVER INFO: Received request for model "${finalModelName}" with prompt: "${prompt.substring(0, 100)}..."`);

    const model = genAI.getGenerativeModel({ model: finalModelName });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('SERVER INFO: Successfully generated content from Gemini API.');
    return NextResponse.json({ generatedText: text });

  } catch (error: unknown) { // 'error' is safely typed as 'unknown'
    console.error('SERVER ERROR: An error occurred while calling the Gemini API:');

    if (error instanceof Error) {
        console.error(`  Error Message: ${error.message}`);
        // <--- FIXED: Safely check for 'response' and cast it
        if ('response' in error && typeof error.response === 'object' && error.response !== null) {
            const geminiErrorResponse = error.response as GeminiErrorResponse; // Use the interface
            if (geminiErrorResponse.status) {
                console.error(`  Gemini API Status: ${geminiErrorResponse.status}`);
            }
            if (geminiErrorResponse.statusText) {
                console.error(`  Gemini API Status Text: ${geminiErrorResponse.statusText}`);
            }
        }
    } else {
        console.error('  Full error object:', JSON.stringify(error, null, 2));
    }

    return NextResponse.json(
      { error: 'Failed to generate content from LLM. Check server logs for more details.' },
      { status: 500 }
    );
  }
}