import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT id, persona, user_query, ai_response, created_at 
      FROM itineraries 
      ORDER BY created_at DESC 
      LIMIT 10;
    `;

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
