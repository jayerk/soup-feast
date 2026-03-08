import { NextRequest, NextResponse } from "next/server";
import { update, Collections } from "@/lib/firestore";

export async function POST(request: NextRequest) {
  const { eventId, votingOpen } = await request.json();

  const event = await update(Collections.events, eventId, { votingOpen });

  return NextResponse.json({ event });
}
