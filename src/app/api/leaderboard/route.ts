import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const event = await prisma.event.findFirst({
    orderBy: { year: "desc" },
    include: {
      soups: { select: { id: true, name: true, cookName: true, number: true, dietaryTags: true } },
      guests: { where: { rsvpStatus: "CONFIRMED" }, select: { id: true } },
      ballots: { select: { rankings: true } },
    },
  });

  if (!event) {
    return NextResponse.json({
      votePulse: { cast: 0, total: 0 },
      top5: [],
      totalSoups: 0,
      votingOpen: false,
      dietaryBreakdown: {},
    });
  }

  // Count first-place votes
  const voteCount: Record<string, number> = {};
  for (const ballot of event.ballots) {
    const firstPick = ballot.rankings[0];
    if (firstPick) {
      voteCount[firstPick] = (voteCount[firstPick] || 0) + 1;
    }
  }

  // Build top 5
  const top5 = Object.entries(voteCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([soupId, votes]) => {
      const soup = event.soups.find((s) => s.id === soupId);
      return {
        soupId,
        name: soup?.name || "Unknown",
        cookName: soup?.cookName || "Unknown",
        number: soup?.number || null,
        votes,
      };
    });

  // Dietary breakdown
  const dietaryBreakdown: Record<string, number> = {};
  for (const soup of event.soups) {
    for (const tag of soup.dietaryTags) {
      dietaryBreakdown[tag] = (dietaryBreakdown[tag] || 0) + 1;
    }
  }

  return NextResponse.json({
    votePulse: { cast: event.ballots.length, total: event.guests.length },
    top5,
    totalSoups: event.soups.length,
    votingOpen: event.votingOpen,
    dietaryBreakdown,
  });
}
