// app/api/gemini/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log('Gemini API route called');
  
  try {
    const { prompt } = await req.json();
    console.log('Received prompt:', prompt ? 'Present' : 'Missing');

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API Key:', apiKey ? 'Present' : 'Missing');
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set in environment variables.');
      return NextResponse.json({ error: 'Server configuration error: API key missing' }, { status: 500 });
    }

    console.log('Initializing Gemini AI...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Use more stable model

    console.log('Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedText = response.text();

    console.log('Gemini API response received successfully');
    return NextResponse.json({ generatedText });

  } catch (error: unknown) { // Keep 'unknown' as it's the standard way to catch errors now
    console.error('Gemini API call failed:', error);

    // FIX START: Safely check for 'response' and 'status'
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const apiError = error as { response: { status: number, text: () => Promise<string> } }; // Type assertion
      if (apiError.response && typeof apiError.response === 'object' && 'status' in apiError.response) {
        console.error('Error status:', apiError.response.status);
        console.error('Error data:', await apiError.response.text());
      }
    }
    // FIX END

    // Ensure `error` is treated as an Error object for its message
    return NextResponse.json(
      { error: 'Failed to generate content from LLM.', details: (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}