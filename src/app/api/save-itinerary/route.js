import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { persona, user_query, ai_response } = await req.json();

    // Ensure these values aren't undefined
    if (!persona || !user_query || !ai_response) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await sql`
      INSERT INTO itineraries (persona, user_query, ai_response)
      VALUES (${persona}, ${user_query}, ${ai_response});
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database Error:", error);
    // This will show us the REAL error in the terminal
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
