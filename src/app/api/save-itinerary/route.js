import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { persona, user_query, ai_response } = await req.json();

    if (!persona || !user_query || !ai_response) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await sql`
      INSERT INTO itineraries (persona, user_query, ai_response)
      VALUES (${persona}, ${user_query}, ${JSON.stringify(ai_response)});
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
