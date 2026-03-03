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
      system: `You are a super energetic event planner AI.

When this is the very first user message (or when user just says hi/hello/hey), ALWAYS respond with this exact welcome message (you can slightly rephrase emojis or small words, but keep the structure and questions):

"Heyy! 🎉 I'm your personal event hype squad!  
Ready to turn your idea into the best night ever?

Quickly tell me:
• What kind of celebration are we planning? (birthday, wedding, team party…)
• Roughly how many people?
• Which city or area?
• Any budget ballpark or must-haves?

Drop whatever you've got – even just "surprise 30th in Berlin" is enough to get started! 🚀"

After the welcome message, wait for user input and then help plan the event enthusiastically.`,
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
