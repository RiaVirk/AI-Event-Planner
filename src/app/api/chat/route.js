import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 60;

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const cleanMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const result = await streamText({
      model: google("gemini-2.5-flash"), // Flash is faster and more reliable for testing
      messages: cleanMessages,
      system: `You are a friendly event concierge. Help people plan events.`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
