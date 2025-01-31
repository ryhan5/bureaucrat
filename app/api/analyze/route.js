import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { query, document } = await req.json();

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Prepare the prompt
    const prompt = `You are a helpful AI assistant analyzing the following document. 
    Please provide clear, concise answers based on the document content.
    If the answer cannot be found in the document, politely say so.
    Always maintain a professional and friendly tone.

    Document content:
    """
    ${document}
    """

    Question: ${query}`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Return the AI response
    return NextResponse.json({
      response: text
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    );
  }
}
