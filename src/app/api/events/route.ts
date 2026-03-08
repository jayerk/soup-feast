import { NextRequest, NextResponse } from "next/server";
import { getAll, create, update, Collections, where, orderBy, limit } from "@/lib/firestore";

export async function GET() {
  const events = await getAll(
    Collections.events,
    orderBy("year", "desc"),
    limit(1)
  );
  const event = events[0] || null;

  if (event) {
    const soups = await getAll(Collections.soups, where("eventId", "==", event.id));
    const guests = await getAll(Collections.guests, where("eventId", "==", event.id));
    const ballots = await getAll(Collections.ballots, where("eventId", "==", event.id));
    (event as Record<string, unknown>)._count = {
      soups: soups.length,
      guests: guests.length,
      ballots: ballots.length,
    };
  }

  return NextResponse.json({ event });
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  const event = await create(Collections.events, {
    name: data.name,
    year: data.year,
    date: data.date,
    location: data.location,
    capacity: data.capacity || 100,
    maxSoups: data.maxSoups || 25,
    rankingDepth: data.rankingDepth || 5,
    tastingNotesEnabled: data.tastingNotesEnabled ?? true,
    votingOpen: false,
    resultsRevealed: false,
  });

  return NextResponse.json({ event }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const data = await request.json();

  if (!data.id) {
    return NextResponse.json({ error: "Event ID required" }, { status: 400 });
  }

  const event = await update(Collections.events, data.id, {
    name: data.name,
    year: data.year,
    date: data.date,
    location: data.location,
    capacity: data.capacity,
    maxSoups: data.maxSoups,
    rankingDepth: data.rankingDepth,
    tastingNotesEnabled: data.tastingNotesEnabled,
  });

  return NextResponse.json({ event });
}
