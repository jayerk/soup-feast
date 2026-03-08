import { NextRequest, NextResponse } from "next/server";
import { getAll, create, Collections, where } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ triedSoupIds: [] });

  const guests = await getAll(Collections.guests, where("uniqueToken", "==", token));
  const guest = guests[0];
  if (!guest) return NextResponse.json({ triedSoupIds: [] });

  const logs = await getAll(Collections.tastingLogs, where("guestId", "==", guest.id));
  return NextResponse.json({ triedSoupIds: logs.map((l) => l.soupId) });
}

export async function POST(request: NextRequest) {
  const { guestToken, soupId, eventId, browseMode } = await request.json();

  const guests = await getAll(Collections.guests, where("uniqueToken", "==", guestToken));
  const guest = guests[0];
  if (!guest) return NextResponse.json({ error: "Invalid token" }, { status: 404 });

  // Check if already logged (upsert behavior)
  const existing = await getAll(
    Collections.tastingLogs,
    where("guestId", "==", guest.id),
    where("soupId", "==", soupId)
  );

  if (existing[0]) {
    return NextResponse.json({ log: existing[0] });
  }

  const log = await create(Collections.tastingLogs, {
    guestId: guest.id,
    soupId,
    eventId: eventId || guest.eventId,
    browseMode: browseMode || null,
  });

  return NextResponse.json({ log });
}
