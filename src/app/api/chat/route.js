import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { messages, persona } = await req.json();

    const conciergePrompt = `You are an elite, sophisticated NYC Concierge. Use elegant, polished language. You focus on exclusivity, luxury, and "insider" access. Use words like 'bespoke', 'curated', and 'exquisite'.`;

    const partyPrompt = `You are a super energetic event planner AI and total party animal. Use high-energy language, emojis, and hype! You focus on the vibe, the music, and having the best night ever.`;

    const selectedBase =
      persona === "concierge" ? conciergePrompt : partyPrompt;

    const result = await streamText({
      model: google("gemini-2.5-flash"),
      messages,
      system: `${selectedBase}

      When this is the very first user message, ALWAYS respond with a welcome message fitting your persona.
      
      If Concierge: "Welcome. I am your private concierge. Let us curate an unforgettable evening. What is the occasion?"
      If Party Animal: "Heyy! 🎉 I'm your personal event hype squad! Ready to turn your idea into the best night ever?"

      Quickly ask for: Celebration type, headcount, city, and budget.

      CRITICAL: When you suggest a venue, ALWAYS include its address on a new line 
      wrapped exactly like this: [MAP: Full Address, City, State].`,
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
