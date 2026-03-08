import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("eventId");

  const where = eventId ? { eventId } : {};
  const soups = await prisma.soup.findMany({
    where,
    orderBy: [{ number: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ soups });
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  const soup = await prisma.soup.create({
    data: {
      eventId: data.eventId,
      name: data.name,
      cookName: data.cookName,
      cookEmail: data.cookEmail || null,
      description: data.description,
      dietaryTags: data.dietaryTags || [],
      surpriseEntry: data.surpriseEntry || false,
      number: data.number || null,
      status: data.status || "CONFIRMED",
    },
  });

  return NextResponse.json({ soup }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const data = await request.json();

  if (!data.id) {
    return NextResponse.json({ error: "Soup ID required" }, { status: 400 });
  }

  const soup = await prisma.soup.update({
    where: { id: data.id },
    data: {
      name: data.name,
      cookName: data.cookName,
      cookEmail: data.cookEmail,
      description: data.description,
      dietaryTags: data.dietaryTags,
      surpriseEntry: data.surpriseEntry,
      number: data.number,
      status: data.status,
    },
  });

  return NextResponse.json({ soup });
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();

  await prisma.soup.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
