import { NextRequest, NextResponse } from "next/server";
import { getAll, update, Collections, where } from "@/lib/firestore";

async function findGuestByToken(token: string) {
  const guests = await getAll(Collections.guests, where("uniqueToken", "==", token));
  return guests[0] || null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const guest = await findGuestByToken(token);

  if (!guest) {
    return NextResponse.json({ guest: null }, { status: 404 });
  }

  return NextResponse.json({
    guest: {
      id: guest.id,
      name: guest.name,
      rsvpStatus: guest.rsvpStatus,
      eventId: guest.eventId,
    },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { rsvpStatus } = await request.json();

  const guest = await findGuestByToken(token);
  if (!guest) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  const updated = await update(Collections.guests, guest.id as string, { rsvpStatus });
  return NextResponse.json({ guest: updated });
}
