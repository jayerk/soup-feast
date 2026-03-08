import { NextRequest, NextResponse } from "next/server";
import { getAll, getById, create, update, remove, Collections, where } from "@/lib/firestore";

function generateToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("eventId");

  const constraints = eventId ? [where("eventId", "==", eventId)] : [];
  const guests = await getAll(Collections.guests, ...constraints);

  // Attach soup name if guest is a cook
  for (const guest of guests) {
    if (guest.soupId) {
      const soup = await getById(Collections.soups, guest.soupId as string);
      (guest as Record<string, unknown>).soup = soup ? { name: soup.name } : null;
    } else {
      (guest as Record<string, unknown>).soup = null;
    }
  }

  // Sort by name
  guests.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));

  return NextResponse.json({ guests });
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  // Support bulk import
  if (Array.isArray(data.guests)) {
    const guests = [];
    for (const g of data.guests) {
      const guest = await create(Collections.guests, {
        eventId: g.eventId || data.eventId,
        name: g.name,
        email: g.email || null,
        phone: g.phone || null,
        inviteChannel: g.inviteChannel || "EMAIL",
        rsvpStatus: "NO_RESPONSE",
        uniqueToken: generateToken(),
        isCook: false,
        soupId: null,
      });
      guests.push(guest);
    }
    return NextResponse.json({ guests }, { status: 201 });
  }

  const guest = await create(Collections.guests, {
    eventId: data.eventId,
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    inviteChannel: data.inviteChannel || "EMAIL",
    rsvpStatus: "NO_RESPONSE",
    uniqueToken: generateToken(),
    isCook: false,
    soupId: null,
  });

  return NextResponse.json({ guest }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const data = await request.json();

  if (!data.id) {
    return NextResponse.json({ error: "Guest ID required" }, { status: 400 });
  }

  const guest = await update(Collections.guests, data.id, {
    name: data.name,
    email: data.email,
    phone: data.phone,
    inviteChannel: data.inviteChannel,
    rsvpStatus: data.rsvpStatus,
  });

  return NextResponse.json({ guest });
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  await remove(Collections.guests, id);
  return NextResponse.json({ success: true });
}
