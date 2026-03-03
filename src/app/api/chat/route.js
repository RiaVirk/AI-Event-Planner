// app/api/chat/route.js
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 60; // Vercel serverless timeout
export const dynamic = "force-dynamic"; // Important for streaming

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: google("gemini-2.5-flash"), // or gemini-1.5-pro, gemini-2.0-flash-exp-...
      messages,
      system: `You are an expert event concierge AI.
               Be helpful, friendly, concise and enthusiastic.
               When recommending events, venues or locations:
               - Suggest real places with approximate addresses
               - Mention why it's great for the occasion
               - If relevant, describe atmosphere / vibe`,
      temperature: 0.7,
      maxTokens: 1800,
    });

    // Plain text streaming — most reliable with Gemini right now
    return new Response(result.textStream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no", // Helps on Vercel / nginx proxies
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: error?.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
