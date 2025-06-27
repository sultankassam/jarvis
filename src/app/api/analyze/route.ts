import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    const arrayBuffer = await file.arrayBuffer();
    const text = Buffer.from(arrayBuffer).toString("utf-8");

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a file analysis expert for Stark Industries.' },
        { role: 'user', content: `Analyze and summarize this file content:\n\n${text}` },
      ],
    });

    const analysis = response.choices[0]?.message?.content?.trim();
    return NextResponse.json({ analysis });
  } catch (err: any) {
    console.error('❌ File Analyze Error:', err.message);
    return NextResponse.json({ analysis: 'Analysis failed, sir.' }, { status: 500 });
  }
}
