import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const archives = await prisma.archiveEvent.findMany({
    orderBy: { year: "desc" },
  });
  return NextResponse.json({ archives });
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  const archive = await prisma.archiveEvent.upsert({
    where: { year: data.year },
    update: {
      location: data.location || null,
      championSoup: data.championSoup || null,
      championCook: data.championCook || null,
      runnerUpSoup: data.runnerUpSoup || null,
      runnerUpCook: data.runnerUpCook || null,
      totalSoups: data.totalSoups || null,
      totalGuests: data.totalGuests || null,
      soupList: data.soupList || [],
    },
    create: {
      year: data.year,
      location: data.location || null,
      championSoup: data.championSoup || null,
      championCook: data.championCook || null,
      runnerUpSoup: data.runnerUpSoup || null,
      runnerUpCook: data.runnerUpCook || null,
      totalSoups: data.totalSoups || null,
      totalGuests: data.totalGuests || null,
      soupList: data.soupList || [],
    },
  });

  return NextResponse.json({ archive }, { status: 201 });
}
