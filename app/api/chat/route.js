import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

// Create OpenRouter provider wrapper manually
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const coreMessages = messages.map((m) => ({
      role: m.role,
      content: m.content || (m.parts ? m.parts.map(p => p.text).join('') : ''),
    }));

    const result = streamText({
      model: openrouter('openrouter/free'),
      system: "You are Swarnika concierge, an elegant luxury jewelry assistant. Provide polite, sophisticated, and helpful guidance to customers browsing The Archive. Keep your answers concise, refined, and helpful.",
      messages: coreMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat request." }), { status: 500 });
  }
}
