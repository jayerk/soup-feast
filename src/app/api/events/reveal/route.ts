import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { eventId } = await request.json();

  const event = await prisma.event.update({
    where: { id: eventId },
    data: { resultsRevealed: true, votingOpen: false },
  });

  return NextResponse.json({ event });
}
