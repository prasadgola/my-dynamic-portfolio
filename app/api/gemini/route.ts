// app/api/gemini/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set in environment variables.');
      return NextResponse.json({ error: 'Server configuration error: API key missing' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Updated model to 'gemini-1.5-flash'
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedText = response.text();

    return NextResponse.json({ generatedText });

  } catch (error: any) {
    console.error('Gemini API call failed:', error);
    if (error.response && error.response.status) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', await error.response.text());
    }
    return NextResponse.json({ error: 'Failed to generate content from LLM.', details: error.message }, { status: 500 });
  }
}