import { NextResponse } from "next/server";
import { getAll, Collections, where, orderBy, limit } from "@/lib/firestore";

export async function GET() {
  const events = await getAll(Collections.events, orderBy("year", "desc"), limit(1));
  const event = events[0];

  if (!event) {
    return NextResponse.json({
      votePulse: { cast: 0, total: 0 },
      top5: [],
      totalSoups: 0,
      votingOpen: false,
      dietaryBreakdown: {},
    });
  }

  const soups = await getAll(Collections.soups, where("eventId", "==", event.id));
  const confirmedGuests = await getAll(
    Collections.guests,
    where("eventId", "==", event.id),
    where("rsvpStatus", "==", "CONFIRMED")
  );
  const ballots = await getAll(Collections.ballots, where("eventId", "==", event.id));

  // Count first-place votes
  const voteCount: Record<string, number> = {};
  for (const ballot of ballots) {
    const firstPick = (ballot.rankings as string[])[0];
    if (firstPick) {
      voteCount[firstPick] = (voteCount[firstPick] || 0) + 1;
    }
  }

  // Build top 5
  const top5 = Object.entries(voteCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([soupId, votes]) => {
      const soup = soups.find((s) => s.id === soupId);
      return {
        soupId,
        name: (soup?.name as string) || "Unknown",
        cookName: (soup?.cookName as string) || "Unknown",
        number: (soup?.number as number) || null,
        votes,
      };
    });

  // Dietary breakdown
  const dietaryBreakdown: Record<string, number> = {};
  for (const soup of soups) {
    for (const tag of (soup.dietaryTags as string[]) || []) {
      dietaryBreakdown[tag] = (dietaryBreakdown[tag] || 0) + 1;
    }
  }

  return NextResponse.json({
    votePulse: { cast: ballots.length, total: confirmedGuests.length },
    top5,
    totalSoups: soups.length,
    votingOpen: event.votingOpen,
    dietaryBreakdown,
  });
}
