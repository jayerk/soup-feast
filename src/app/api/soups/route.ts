import { NextRequest, NextResponse } from "next/server";
import { getAll, create, update, remove, Collections, where, orderBy } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("eventId");

  const constraints = eventId
    ? [where("eventId", "==", eventId), orderBy("createdAt", "asc")]
    : [orderBy("createdAt", "asc")];

  const soups = await getAll(Collections.soups, ...constraints);

  // Sort by number first (nulls last), then by createdAt
  soups.sort((a, b) => {
    const numA = (a.number as number | null) ?? Infinity;
    const numB = (b.number as number | null) ?? Infinity;
    if (numA !== numB) return numA - numB;
    return 0;
  });

  return NextResponse.json({ soups });
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  const soup = await create(Collections.soups, {
    eventId: data.eventId,
    name: data.name,
    cookName: data.cookName,
    cookEmail: data.cookEmail || null,
    description: data.description,
    dietaryTags: data.dietaryTags || [],
    surpriseEntry: data.surpriseEntry || false,
    number: data.number || null,
    status: data.status || "CONFIRMED",
  });

  return NextResponse.json({ soup }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const data = await request.json();

  if (!data.id) {
    return NextResponse.json({ error: "Soup ID required" }, { status: 400 });
  }

  const soup = await update(Collections.soups, data.id, {
    name: data.name,
    cookName: data.cookName,
    cookEmail: data.cookEmail,
    description: data.description,
    dietaryTags: data.dietaryTags,
    surpriseEntry: data.surpriseEntry,
    number: data.number,
    status: data.status,
  });

  return NextResponse.json({ soup });
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  await remove(Collections.soups, id);
  return NextResponse.json({ success: true });
}
