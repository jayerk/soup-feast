import { NextRequest, NextResponse } from "next/server";
import { getAll, create, update, Collections, where } from "@/lib/firestore";

export async function POST(request: NextRequest) {
  const { guestToken, rankings } = await request.json();

  const guests = await getAll(Collections.guests, where("uniqueToken", "==", guestToken));
  const guest = guests[0];
  if (!guest) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  // Get tasting log count
  const logs = await getAll(
    Collections.tastingLogs,
    where("guestId", "==", guest.id),
    where("eventId", "==", guest.eventId)
  );
  const triedCount = logs.length;

  // Check for existing ballot (upsert)
  const existing = await getAll(
    Collections.ballots,
    where("guestId", "==", guest.id),
    where("eventId", "==", guest.eventId)
  );

  let ballot;
  if (existing[0]) {
    ballot = await update(Collections.ballots, existing[0].id as string, {
      rankings,
      soupTriedCount: triedCount,
    });
  } else {
    ballot = await create(Collections.ballots, {
      guestId: guest.id,
      eventId: guest.eventId,
      rankings,
      soupTriedCount: triedCount,
    });
  }

  return NextResponse.json({ ballot });
}
