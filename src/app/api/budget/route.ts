import { NextRequest, NextResponse } from "next/server";
import { getAll, create, Collections, where, orderBy } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ items: [] });

  const items = await getAll(
    Collections.budgetItems,
    where("eventId", "==", eventId),
    orderBy("createdAt", "asc")
  );

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  const item = await create(Collections.budgetItems, {
    eventId: data.eventId,
    itemName: data.itemName,
    category: data.category || "OTHER",
    estimatedCost: data.estimatedCost || 0,
    actualCost: data.actualCost ?? null,
  });

  return NextResponse.json({ item }, { status: 201 });
}
