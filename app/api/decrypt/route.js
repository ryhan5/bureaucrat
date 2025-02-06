import { NextResponse } from 'next/server';
import crypto from 'crypto';

function generateKey(password) {
  return crypto.scryptSync(password, 'salt', 32);
}

function decrypt(encrypted, password) {
  try {
    const { iv, content } = JSON.parse(encrypted);
    const key = generateKey(password);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    throw new Error('Invalid password or corrupted content');
  }
}

export async function POST(req) {
  try {
    const { encryptedContent, password } = await req.json();

    if (!encryptedContent || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    try {
      const decrypted = decrypt(encryptedContent, password);
      return NextResponse.json({ content: decrypted });
    } catch (error) {
      console.error('Decryption error:', error);
      return NextResponse.json(
        { message: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
