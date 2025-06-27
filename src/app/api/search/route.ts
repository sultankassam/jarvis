import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    const prompt = `Simulate a web search for the following query: "${query}". Return a summary of key findings as if scraped from the internet.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are Jarvis, simulating web search results for Mr. Stark.' },
        { role: 'user', content: prompt },
      ],
    });

    const results = response.choices[0]?.message?.content?.trim();
    return NextResponse.json({ results });
  } catch (err: any) {
    console.error('❌ Search Error:', err.message);
    return NextResponse.json({ results: 'Web search failed, sir.' }, { status: 500 });
  }
}
