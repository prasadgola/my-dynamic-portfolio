// app/api/gemini/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse, NextRequest } from 'next/server'; // Keep NextRequest import

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

export async function POST(req: NextRequest) { // Use NextRequest for correct typing
  try {
    // Attempt to extract prompt and an optional modelName from the request body.
    // Default to 'gemini-2.0-flash' if clientModelName is not provided.
    const { prompt, modelName: clientModelName } = await req.json();

    const finalModelName = clientModelName || 'gemini-2.0-flash'; // <-- CRITICAL FIX: Use the model that worked locally

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

  } catch (error: any) { // Explicitly type error for better handling and logging
    console.error('SERVER ERROR: An error occurred while calling the Gemini API:');

    // Detailed error logging
    if (error.status) {
        console.error(`  HTTP Status: ${error.status}`);
    }
    if (error.message) {
        console.error(`  Message: ${error.message}`);
    }
    // Log the full error object for detailed inspection
    console.error('  Full error object:', error);

    // Provide a generic, informative error to the client, keeping internal details private
    return NextResponse.json(
      { error: 'Failed to generate content from LLM. Check server logs for more details.' },
      { status: 500 }
    );
  }
}