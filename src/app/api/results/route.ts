import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runRCV, computeAwards } from "@/lib/rcv";

export async function GET() {
  const event = await prisma.event.findFirst({
    orderBy: { year: "desc" },
    where: { resultsRevealed: true },
    include: {
      soups: { orderBy: { createdAt: "asc" } },
      ballots: true,
      tastingNotes: true,
    },
  });

  if (!event) {
    return NextResponse.json({ revealed: false });
  }

  const soupIds = event.soups.map((s) => s.id);
  const registrationOrder: Record<string, number> = {};
  event.soups.forEach((s, i) => {
    registrationOrder[s.id] = i;
  });

  const rcvResult = runRCV(event.ballots, soupIds, registrationOrder);
  const awards = computeAwards(rcvResult, event.ballots, event.tastingNotes);

  // Build soup map for display
  const soupMap: Record<string, { name: string; cookName: string; number: number | null; description: string }> = {};
  for (const soup of event.soups) {
    soupMap[soup.id] = {
      name: soup.name,
      cookName: soup.cookName,
      number: soup.number,
      description: soup.description,
    };
  }

  // Fun stats
  const totalVotes = event.ballots.length;
  const avgRanked = totalVotes > 0
    ? (event.ballots.reduce((sum, b) => sum + b.rankings.length, 0) / totalVotes).toFixed(1)
    : "0";

  // Most-ranked soup (appeared on the most ballots)
  const ballotAppearances: Record<string, number> = {};
  for (const ballot of event.ballots) {
    for (const soupId of ballot.rankings) {
      ballotAppearances[soupId] = (ballotAppearances[soupId] || 0) + 1;
    }
  }
  const mostRanked = Object.entries(ballotAppearances).sort(([, a], [, b]) => b - a)[0]?.[0] || null;
  const leastRanked = Object.entries(ballotAppearances).sort(([, a], [, b]) => a - b)[0]?.[0] || null;

  // Timing stats
  const timestamps = event.ballots.map((b) => new Date(b.submittedAt).getTime()).sort();
  const firstVote = timestamps[0] ? new Date(timestamps[0]).toLocaleTimeString() : null;
  const lastVote = timestamps[timestamps.length - 1]
    ? new Date(timestamps[timestamps.length - 1]).toLocaleTimeString()
    : null;

  return NextResponse.json({
    revealed: true,
    rcvResult,
    awards,
    soupMap,
    stats: {
      totalVotes,
      avgRanked,
      mostRanked,
      leastRanked,
      firstVote,
      lastVote,
      totalSoups: event.soups.length,
    },
  });
}
