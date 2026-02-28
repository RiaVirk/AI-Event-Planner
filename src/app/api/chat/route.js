import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 60;

export async function POST(req) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai("gpt-4o-mini"), // can be 'gpt-4o', 'claude-3-5-sonnet-latest', etc.
    messages,
    system: `
You are a friendly event concierge. Help people plan events.
Ask questions if anything is unclear: number of guests, city/area, budget, date/time, vibe (casual, fancy, outdoor, etc.).
When suggesting venues: give 3–5 options with name, rough price range, capacity, location, and 1–2 reasons why it fits.
Use markdown formatting. Be conversational and helpful.
`,
  });

  return result.toDataStreamResponse();
}
