import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const guest = await prisma.guest.findUnique({
    where: { uniqueToken: token },
    select: { id: true, name: true, rsvpStatus: true, eventId: true },
  });

  if (!guest) {
    return NextResponse.json({ guest: null }, { status: 404 });
  }

  return NextResponse.json({ guest });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { rsvpStatus } = await request.json();

  const guest = await prisma.guest.update({
    where: { uniqueToken: token },
    data: { rsvpStatus },
  });

  return NextResponse.json({ guest });
}
