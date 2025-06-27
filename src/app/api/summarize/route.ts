import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    const summaryPrompt = `Summarize the content of the website at this URL: ${url}. Be brief, helpful, and accurate.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are Jarvis, the web summarizer AI for Mr. Stark.' },
        { role: 'user', content: summaryPrompt },
      ],
    });

    const summary = response.choices[0]?.message?.content?.trim();
    return NextResponse.json({ summary });
  } catch (err: any) {
    console.error('❌ Summarize Error:', err.message);
    return NextResponse.json({ summary: 'Unable to summarize that site, sir.' }, { status: 500 });
  }
}
