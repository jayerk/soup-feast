import { NextRequest, NextResponse } from "next/server";
import { getAll, create, Collections, where, orderBy } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ campaigns: [] });

  const campaigns = await getAll(
    Collections.campaigns,
    where("eventId", "==", eventId),
    orderBy("createdAt", "asc")
  );

  return NextResponse.json({ campaigns });
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  const campaign = await create(Collections.campaigns, {
    eventId: data.eventId,
    name: data.name,
    sendDate: data.sendDate || null,
    channel: data.channel || "BOTH",
    templateBody: data.templateBody,
    status: data.status || "DRAFT",
    sentCount: 0,
    openedCount: 0,
    clickedCount: 0,
  });

  return NextResponse.json({ campaign }, { status: 201 });
}
