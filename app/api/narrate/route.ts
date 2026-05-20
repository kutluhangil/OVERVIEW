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
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ text: 'The planet continues its eternal rotation...' });
    }

    const body = (await req.json()) as NarrateRequest;
    const { events, issPosition } = body;

    const topEvents = events
      .sort((a, b) => (b.magnitude ?? 0) - (a.magnitude ?? 0))
      .slice(0, 5);

    const eventsText = topEvents.map((e) => {
      const timeAgo = Math.round((Date.now() - e.timestamp) / 60000);
      return `${e.layer}: ${e.label} (${timeAgo}m ago${e.magnitude ? `, M${e.magnitude.toFixed(1)}` : ''})`;
    }).join('; ');

    const issText = issPosition
      ? `ISS is at ${issPosition.lat.toFixed(1)}°, ${issPosition.lng.toFixed(1)}°`
      : '';

    const prompt = [eventsText, issText].filter(Boolean).join('. ');

    if (!prompt.trim()) {
      return Response.json({ text: 'The planet is quiet right now. Watching and waiting...' });
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 80,
      system:
        'You are the calm, knowledgeable narrator of OVERVIEW, a real-time globe of the planet\'s activity. Given recent events, write ONE short sentence (max 20 words) describing what\'s happening right now. Tone: documentary narrator. No markdown. Present tense. No quotes.',
      messages: [{ role: 'user', content: prompt }],
    });

    const text =
      message.content[0].type === 'text' ? message.content[0].text : '';

    return Response.json({ text });
  } catch {
    return Response.json({ text: 'Monitoring planetary activity...' });
  }
}
