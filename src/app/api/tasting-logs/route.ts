import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ triedSoupIds: [] });

  const guest = await prisma.guest.findUnique({ where: { uniqueToken: token } });
  if (!guest) return NextResponse.json({ triedSoupIds: [] });

  const logs = await prisma.tastingLog.findMany({
    where: { guestId: guest.id },
    select: { soupId: true },
  });

  return NextResponse.json({ triedSoupIds: logs.map((l) => l.soupId) });
}

export async function POST(request: NextRequest) {
  const { guestToken, soupId, eventId, browseMode } = await request.json();

  const guest = await prisma.guest.findUnique({ where: { uniqueToken: guestToken } });
  if (!guest) return NextResponse.json({ error: "Invalid token" }, { status: 404 });

  const log = await prisma.tastingLog.upsert({
    where: {
      guestId_soupId: { guestId: guest.id, soupId },
    },
    update: {},
    create: {
      guestId: guest.id,
      soupId,
      eventId: eventId || guest.eventId,
      browseMode: browseMode || null,
    },
  });

  return NextResponse.json({ log });
}
