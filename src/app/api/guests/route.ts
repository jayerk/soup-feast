import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("eventId");

  const where = eventId ? { eventId } : {};
  const guests = await prisma.guest.findMany({
    where,
    orderBy: { name: "asc" },
    include: { soup: { select: { name: true } } },
  });

  return NextResponse.json({ guests });
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  // Support bulk import
  if (Array.isArray(data.guests)) {
    const guests = await prisma.$transaction(
      data.guests.map((g: { name: string; email?: string; phone?: string; inviteChannel?: string; eventId: string }) =>
        prisma.guest.create({
          data: {
            eventId: g.eventId || data.eventId,
            name: g.name,
            email: g.email || null,
            phone: g.phone || null,
            inviteChannel: (g.inviteChannel as "EMAIL" | "SMS" | "BOTH" | "MAIL") || "EMAIL",
          },
        })
      )
    );
    return NextResponse.json({ guests }, { status: 201 });
  }

  const guest = await prisma.guest.create({
    data: {
      eventId: data.eventId,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      inviteChannel: data.inviteChannel || "EMAIL",
    },
  });

  return NextResponse.json({ guest }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const data = await request.json();

  if (!data.id) {
    return NextResponse.json({ error: "Guest ID required" }, { status: 400 });
  }

  const guest = await prisma.guest.update({
    where: { id: data.id },
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      inviteChannel: data.inviteChannel,
      rsvpStatus: data.rsvpStatus,
    },
  });

  return NextResponse.json({ guest });
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();

  await prisma.guest.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
