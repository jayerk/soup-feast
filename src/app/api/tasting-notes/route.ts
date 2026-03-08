import { NextRequest, NextResponse } from "next/server";
import { getAll, create, update, Collections, where } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const guestToken = request.nextUrl.searchParams.get("token");
  const soupId = request.nextUrl.searchParams.get("soupId");

  if (guestToken) {
    const guests = await getAll(Collections.guests, where("uniqueToken", "==", guestToken));
    const guest = guests[0];
    if (!guest) return NextResponse.json({ notes: [] });

    const notes = await getAll(Collections.tastingNotes, where("guestId", "==", guest.id));
    return NextResponse.json({ notes });
  }

  if (soupId) {
    const notes = await getAll(Collections.tastingNotes, where("soupId", "==", soupId));
    return NextResponse.json({ notes });
  }

  return NextResponse.json({ notes: [] });
}

export async function POST(request: NextRequest) {
  const { guestToken, soupId, rating, flavorTags, noteText } = await request.json();

  const guests = await getAll(Collections.guests, where("uniqueToken", "==", guestToken));
  const guest = guests[0];
  if (!guest) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  // Upsert
  const existing = await getAll(
    Collections.tastingNotes,
    where("guestId", "==", guest.id),
    where("soupId", "==", soupId)
  );

  let note;
  if (existing[0]) {
    note = await update(Collections.tastingNotes, existing[0].id as string, {
      rating,
      flavorTags,
      noteText,
    });
  } else {
    note = await create(Collections.tastingNotes, {
      guestId: guest.id,
      soupId,
      eventId: guest.eventId,
      rating,
      flavorTags,
      noteText,
    });
  }

  return NextResponse.json({ note });
}
