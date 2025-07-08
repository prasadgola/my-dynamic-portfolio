// app/api/gemini/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  console.error('SERVER ERROR: GEMINI_API_KEY environment variable is not set. Please check your .env.local file.');
  // In a production environment, you might want to throw an error here
  // to prevent the server from starting with a critical missing key.
}

// Initialize the Generative AI client with the API key.
// Use an empty string if the key is not set, though the error above should ideally prevent reaching this point in a bad state.
const genAI = new GoogleGenerativeAI(geminiApiKey || '');

export async function POST(req: Request) {
  try {
    const { prompt, modelName = 'gemini-2.0-flash' } = await req.json();

    if (!prompt) {
      console.warn('SERVER WARNING: Prompt is missing in the request.');
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Log the prompt and model being used for debugging
    console.log(`SERVER INFO: Received request for model "${modelName}" with prompt: "${prompt.substring(0, 100)}..."`); // Log first 100 chars

    // Get the generative model instance
    const model = genAI.getGenerativeModel({ model: modelName });

    // Generate content using the provided prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('SERVER INFO: Successfully generated content from Gemini API.');
    return NextResponse.json({ generatedText: text });
  } catch (error: any) { // Explicitly type error for better handling
    console.error('SERVER ERROR: An error occurred while calling the Gemini API:');

    // Check if the error object has properties typical of an API error
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