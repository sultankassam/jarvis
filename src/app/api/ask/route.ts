import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const response = await openai.chat.completions.create({
     model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are Jarvis, an advanced AI assistant built by Tony Stark. Be witty, concise, and helpful.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const result = response.choices[0]?.message?.content?.trim();

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('🔥 JARVIS ROUTE ERROR:', error?.message || error);
    return NextResponse.json({ result: 'System malfunction, Mr. Stark. Please retry.' }, { status: 500 });
  }
}
