import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const guestToken = request.nextUrl.searchParams.get("token");
  const soupId = request.nextUrl.searchParams.get("soupId");

  if (guestToken) {
    const guest = await prisma.guest.findUnique({ where: { uniqueToken: guestToken } });
    if (!guest) return NextResponse.json({ notes: [] });

    const notes = await prisma.tastingNote.findMany({
      where: { guestId: guest.id },
    });
    return NextResponse.json({ notes });
  }

  if (soupId) {
    const notes = await prisma.tastingNote.findMany({
      where: { soupId },
    });
    return NextResponse.json({ notes });
  }

  return NextResponse.json({ notes: [] });
}

export async function POST(request: NextRequest) {
  const { guestToken, soupId, rating, flavorTags, noteText } = await request.json();

  const guest = await prisma.guest.findUnique({ where: { uniqueToken: guestToken } });
  if (!guest) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  const note = await prisma.tastingNote.upsert({
    where: {
      guestId_soupId: { guestId: guest.id, soupId },
    },
    update: { rating, flavorTags, noteText },
    create: {
      guestId: guest.id,
      soupId,
      eventId: guest.eventId,
      rating,
      flavorTags,
      noteText,
    },
  });

  return NextResponse.json({ note });
}
