import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

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

    let encryptedContent = content;
    let encryptionKey = null;

    // If private, encrypt the content
    if (isPrivate && password) {
      // Generate a random encryption key
      encryptionKey = crypto.randomBytes(32);
      
      // Create cipher with password-derived key
      const cipher = crypto.createCipher('aes-256-cbc', password);
      
      // Encrypt the content
      encryptedContent = cipher.update(content, 'utf8', 'hex');
      encryptedContent += cipher.final('hex');
    }

    // Return the response
    return NextResponse.json({
      content: isPrivate ? encryptedContent : content,
      encryptionKey: encryptionKey ? encryptionKey.toString('hex') : null,
      isEncrypted: isPrivate,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
