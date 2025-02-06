import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

// Encryption helper functions
function generateKey(password) {
  return crypto.scryptSync(password, 'salt', 32);
}

function encrypt(text, password) {
  const key = generateKey(password);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    content: encrypted
  };
}

export async function POST(req) {
  try {
    const { topic, type, duration, audience, tone, language, isPrivate, password } = await req.json();

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Prepare the prompt
    const prompt = `Generate a ${duration}-minute ${type} about "${topic}" in a ${tone} tone, 
      targeted at a ${audience} audience. The content should be in ${language === 'hi' ? 'Hindi' : 'English'}.
      
      Requirements:
      1. Include an engaging opening that captures attention
      2. Have 3-4 clear main points with supporting details
      3. Include relevant examples and statistics if applicable
      4. Use appropriate cultural references and context
      5. End with a strong call-to-action or memorable conclusion
      6. Add timing guidelines for each section
      7. Include appropriate transitional phrases
      8. Consider the cultural and professional context of a ${audience} audience
      
      Additional Notes:
      - Use formal honorifics and respectful language
      - Include pauses for audience engagement
      - Add notes for vocal emphasis and delivery
      - Consider Q&A session points if applicable`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    // If private, encrypt the content
    if (isPrivate && password) {
      const encrypted = encrypt(content, password);
      return NextResponse.json({
        content: JSON.stringify(encrypted),
        isEncrypted: true
      });
    }

    return NextResponse.json({ 
      content,
      isEncrypted: false 
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
