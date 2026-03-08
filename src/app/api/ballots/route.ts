import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { guestToken, rankings } = await request.json();

  const guest = await prisma.guest.findUnique({
    where: { uniqueToken: guestToken },
  });

  if (!guest) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  // Get tasting log count
  const triedCount = await prisma.tastingLog.count({
    where: { guestId: guest.id, eventId: guest.eventId },
  });

  // Upsert ballot
  const ballot = await prisma.ballot.upsert({
    where: {
      guestId_eventId: { guestId: guest.id, eventId: guest.eventId },
    },
    update: {
      rankings,
      soupTriedCount: triedCount,
      updatedAt: new Date(),
    },
    create: {
      guestId: guest.id,
      eventId: guest.eventId,
      rankings,
      soupTriedCount: triedCount,
    },
  });

  return NextResponse.json({ ballot });
}
