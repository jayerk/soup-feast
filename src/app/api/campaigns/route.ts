import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ campaigns: [] });

  const campaigns = await prisma.campaign.findMany({
    where: { eventId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ campaigns });
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  const campaign = await prisma.campaign.create({
    data: {
      eventId: data.eventId,
      name: data.name,
      sendDate: data.sendDate ? new Date(data.sendDate) : null,
      channel: data.channel || "BOTH",
      templateBody: data.templateBody,
      status: data.status || "DRAFT",
    },
  });

  return NextResponse.json({ campaign }, { status: 201 });
}
