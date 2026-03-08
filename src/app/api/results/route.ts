import { NextResponse } from "next/server";
import { getAll, Collections, where, orderBy, limit } from "@/lib/firestore";
import { runRCV, computeAwards } from "@/lib/rcv";

export async function GET() {
  // Get the latest event with resultsRevealed = true
  const events = await getAll(
    Collections.events,
    where("resultsRevealed", "==", true),
    orderBy("year", "desc"),
    limit(1)
  );
  const event = events[0];

  if (!event) {
    return NextResponse.json({ revealed: false });
  }

  // Fetch related data
  const soups = await getAll(
    Collections.soups,
    where("eventId", "==", event.id),
    orderBy("createdAt", "asc")
  );
  const ballots = await getAll(Collections.ballots, where("eventId", "==", event.id));
  const tastingNotes = await getAll(Collections.tastingNotes, where("eventId", "==", event.id));

  const soupIds = soups.map((s) => s.id as string);
  const registrationOrder: Record<string, number> = {};
  soups.forEach((s, i) => {
    registrationOrder[s.id as string] = i;
  });

  const rcvResult = runRCV(
    ballots as { rankings: string[] }[],
    soupIds,
    registrationOrder
  );
  const awards = computeAwards(
    rcvResult,
    ballots as { rankings: string[] }[],
    tastingNotes as { soupId: string; flavorTags: string[] }[]
  );

  // Build soup map
  const soupMap: Record<string, { name: string; cookName: string; number: number | null; description: string }> = {};
  for (const soup of soups) {
    soupMap[soup.id as string] = {
      name: soup.name as string,
      cookName: soup.cookName as string,
      number: (soup.number as number | null) || null,
      description: soup.description as string,
    };
  }

  // Stats
  const totalVotes = ballots.length;
  const avgRanked = totalVotes > 0
    ? (ballots.reduce((sum, b) => sum + (b.rankings as string[]).length, 0) / totalVotes).toFixed(1)
    : "0";

  const ballotAppearances: Record<string, number> = {};
  for (const ballot of ballots) {
    for (const soupId of ballot.rankings as string[]) {
      ballotAppearances[soupId] = (ballotAppearances[soupId] || 0) + 1;
    }
  }
  const mostRanked = Object.entries(ballotAppearances).sort(([, a], [, b]) => b - a)[0]?.[0] || null;
  const leastRanked = Object.entries(ballotAppearances).sort(([, a], [, b]) => a - b)[0]?.[0] || null;

  const timestamps = ballots
    .map((b) => new Date(b.submittedAt as string).getTime())
    .filter((t) => !isNaN(t))
    .sort();
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
      totalSoups: soups.length,
    },
  });
}
