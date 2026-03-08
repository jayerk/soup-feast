import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { eventId, votingOpen } = await request.json();

  const event = await prisma.event.update({
    where: { id: eventId },
    data: { votingOpen },
  });

  return NextResponse.json({ event });
}
