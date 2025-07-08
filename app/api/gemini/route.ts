// app/api/gemini/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse, NextRequest } from 'next/server';

// Retrieve API key from environment variables
const geminiApiKey = process.env.GEMINI_API_KEY;

// Basic check for API key presence (server-side warning)
if (!geminiApiKey) {
  console.error('SERVER ERROR: GEMINI_API_KEY environment variable is not set. Please check your .env.local file or Vercel environment variables.');
  // In a production environment, you might want a more aggressive exit or health check here.
}

// Initialize the Generative AI client globally if the key is available.
// Using an empty string fallback to allow compilation, but the check above handles the actual error case.
const genAI = new GoogleGenerativeAI(geminiApiKey || '');

export async function POST(req: NextRequest) { // Using NextRequest for correct typing
  try {
    const { prompt, modelName: clientModelName } = await req.json();

    const finalModelName = clientModelName || 'gemini-2.0-flash'; // Ensure using the working model

    // Validate if a prompt was actually sent
    if (!prompt) {
      console.warn('SERVER WARNING: Prompt is missing in the request.');
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Log the incoming request details for debugging
    console.log(`SERVER INFO: Received request for model "${finalModelName}" with prompt: "${prompt.substring(0, 100)}..."`);

    // Get the generative model instance with the determined model name
    const model = genAI.getGenerativeModel({ model: finalModelName });

    // Generate content using the provided prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('SERVER INFO: Successfully generated content from Gemini API.');
    return NextResponse.json({ generatedText: text });

  } catch (error: unknown) { // <--- FIXED: Type 'error' as unknown instead of 'any'
    console.error('SERVER ERROR: An error occurred while calling the Gemini API:');

    // Safely check error properties using type narrowing
    if (error instanceof Error) {
        console.error(`  Error Message: ${error.message}`);
        // Attempt to extract more details if it's a GoogleGenerativeAI error
        if ('response' in error && typeof (error as any).response === 'object') {
            const geminiErrorResponse = (error as any).response;
            if (geminiErrorResponse.status) {
                console.error(`  Gemini API Status: ${geminiErrorResponse.status}`);
            }
            if (geminiErrorResponse.statusText) {
                console.error(`  Gemini API Status Text: ${geminiErrorResponse.statusText}`);
            }
        }
    } else {
        // Fallback for errors that are not standard Error objects
        console.error('  Full error object:', JSON.stringify(error, null, 2));
    }

    // Provide a generic, informative error to the client
    return NextResponse.json(
      { error: 'Failed to generate content from LLM. Check server logs for more details.' },
      { status: 500 }
    );
  }
}