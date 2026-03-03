import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: google("gemini-2.5-flash"),
      messages,
      system: `You are an expert event concierge AI. 
      When you suggest a venue, ALWAYS include its address on a new line 
      wrapped exactly like this: [MAP: Full Address, City, State].
      
      Example:
      "I recommend The Box. 
      [MAP: 189 Chrystie St, New York, NY 10002]"`,
      temperature: 0.7,
    });

    return new Response(result.textStream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
