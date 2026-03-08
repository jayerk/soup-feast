import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const event = await prisma.event.findFirst({
    orderBy: { year: "desc" },
    include: {
      _count: { select: { soups: true, guests: true, ballots: true } },
    },
  });
  return NextResponse.json({ event });
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  const event = await prisma.event.create({
    data: {
      name: data.name,
      year: data.year,
      date: new Date(data.date),
      location: data.location,
      capacity: data.capacity || 100,
      maxSoups: data.maxSoups || 25,
      rankingDepth: data.rankingDepth || 5,
      tastingNotesEnabled: data.tastingNotesEnabled ?? true,
    },
  });

  return NextResponse.json({ event }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const data = await request.json();

  if (!data.id) {
    return NextResponse.json({ error: "Event ID required" }, { status: 400 });
  }

  const event = await prisma.event.update({
    where: { id: data.id },
    data: {
      name: data.name,
      year: data.year,
      date: new Date(data.date),
      location: data.location,
      capacity: data.capacity,
      maxSoups: data.maxSoups,
      rankingDepth: data.rankingDepth,
      tastingNotesEnabled: data.tastingNotesEnabled,
    },
  });

  return NextResponse.json({ event });
}
