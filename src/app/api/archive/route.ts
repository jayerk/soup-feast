import { NextResponse, NextRequest } from "next/server";
import { getAll, create, update, Collections, where, orderBy } from "@/lib/firestore";

export async function GET() {
  const archives = await getAll(Collections.archiveEvents, orderBy("year", "desc"));
  return NextResponse.json({ archives });
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  // Check if archive for this year exists (upsert)
  const existing = await getAll(Collections.archiveEvents, where("year", "==", data.year));

  const payload = {
    year: data.year,
    location: data.location || null,
    championSoup: data.championSoup || null,
    championCook: data.championCook || null,
    runnerUpSoup: data.runnerUpSoup || null,
    runnerUpCook: data.runnerUpCook || null,
    totalSoups: data.totalSoups || null,
    totalGuests: data.totalGuests || null,
    soupList: data.soupList || [],
    photos: data.photos || [],
  };

  let archive;
  if (existing[0]) {
    archive = await update(Collections.archiveEvents, existing[0].id as string, payload);
  } else {
    archive = await create(Collections.archiveEvents, payload);
  }

  return NextResponse.json({ archive }, { status: 201 });
}
