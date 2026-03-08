import { NextRequest, NextResponse } from "next/server";
import { update, Collections } from "@/lib/firestore";

export async function POST(request: NextRequest) {
  const { eventId } = await request.json();

  const event = await update(Collections.events, eventId, {
    resultsRevealed: true,
    votingOpen: false,
  });

  return NextResponse.json({ event });
}
