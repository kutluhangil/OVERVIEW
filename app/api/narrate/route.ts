export const runtime = 'edge';

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface NarrateRequest {
  events: Array<{
    layer: string;
    label: string;
    magnitude?: number;
    timestamp: number;
  }>;
  issPosition?: { lat: number; lng: number; alt?: number };
  question?: string; // "Ask the Globe" free-form query
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ text: 'The planet continues its eternal rotation...' });
    }

    const body = (await req.json()) as NarrateRequest;
    const { events, issPosition, question } = body;

    const topEvents = (events ?? [])
      .sort((a, b) => (b.magnitude ?? 0) - (a.magnitude ?? 0))
      .slice(0, 8);

    const eventsText = topEvents.map((e) => {
      const timeAgo = Math.round((Date.now() - e.timestamp) / 60000);
      return `${e.layer}: ${e.label} (${timeAgo}m ago${e.magnitude ? `, M${e.magnitude.toFixed(1)}` : ''})`;
    }).join('; ');

    const issText = issPosition
      ? `ISS at ${issPosition.lat.toFixed(1)}°, ${issPosition.lng.toFixed(1)}°`
      : '';

    const context = [eventsText, issText].filter(Boolean).join('. ');

    const isQuestion = question && question.trim().length > 0;
    const maxTokens = isQuestion ? 120 : 80;

    const system = isQuestion
      ? `You are the knowledgeable narrator of OVERVIEW, a real-time globe visualization. The user has asked a question about current planetary activity. Answer concisely in 1-2 sentences (max 30 words) using the real-time data provided. Tone: calm, authoritative documentary voice. No markdown. No quotes. Current data: ${context || 'No events in current window.'}`
      : `You are the calm, knowledgeable narrator of OVERVIEW, a real-time globe of the planet's activity. Given recent events, write ONE short sentence (max 20 words) describing what's happening right now. Tone: documentary narrator. No markdown. Present tense. No quotes.`;

    const userContent = isQuestion ? question : (context || 'Describe the current state of the planet.');

    if (!userContent.trim()) {
      return Response.json({ text: 'The planet is quiet right now. Watching and waiting...' });
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userContent }],
    });

    const text =
      message.content[0].type === 'text' ? message.content[0].text.trim() : '';

    return Response.json({ text });
  } catch {
    return Response.json({ text: 'Monitoring planetary activity...' });
  }
}
