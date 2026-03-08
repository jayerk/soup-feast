export interface RCVRound {
  counts: Record<string, number>;
  eliminated: string | null;
  redistributed: Record<string, number>;
}

export interface RCVResult {
  winner: string;
  rounds: RCVRound[];
  finalRankings: string[];
}

export function runRCV(
  ballots: { rankings: string[] }[],
  soupIds: string[],
  soupRegistrationOrder: Record<string, number> // soupId -> registration order for tiebreaking
): RCVResult {
  const rounds: RCVRound[] = [];
  const remaining = new Set(soupIds);
  const eliminationOrder: string[] = [];

  while (remaining.size > 1) {
    // Count first-place votes among remaining soups
    const counts: Record<string, number> = {};
    for (const id of remaining) {
      counts[id] = 0;
    }

    for (const ballot of ballots) {
      const topPick = ballot.rankings.find((id) => remaining.has(id));
      if (topPick) {
        counts[topPick]++;
      }
    }

    const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0);
    const round: RCVRound = { counts: { ...counts }, eliminated: null, redistributed: {} };

    // Check for majority winner
    for (const [soupId, count] of Object.entries(counts)) {
      if (count > totalVotes / 2) {
        rounds.push(round);
        const finalRankings = [soupId, ...eliminationOrder.reverse()];
        return { winner: soupId, rounds, finalRankings };
      }
    }

    // Find soup to eliminate (fewest first-place votes)
    const minCount = Math.min(...Object.values(counts));
    const candidates = Object.entries(counts)
      .filter(([, count]) => count === minCount)
      .map(([id]) => id);

    let eliminated: string;
    if (candidates.length === 1) {
      eliminated = candidates[0];
    } else {
      // Tiebreaker: fewest second-place votes
      const secondPlaceCounts: Record<string, number> = {};
      for (const c of candidates) {
        secondPlaceCounts[c] = 0;
      }

      for (const ballot of ballots) {
        const remainingRanks = ballot.rankings.filter((id) => remaining.has(id));
        if (remainingRanks.length >= 2 && candidates.includes(remainingRanks[1])) {
          secondPlaceCounts[remainingRanks[1]]++;
        }
      }

      const minSecond = Math.min(...candidates.map((c) => secondPlaceCounts[c]));
      const stillTied = candidates.filter((c) => secondPlaceCounts[c] === minSecond);

      if (stillTied.length === 1) {
        eliminated = stillTied[0];
      } else {
        // Final tiebreaker: latest registration (highest order number)
        eliminated = stillTied.reduce((a, b) =>
          (soupRegistrationOrder[a] || 0) > (soupRegistrationOrder[b] || 0) ? a : b
        );
      }
    }

    // Track where eliminated soup's votes go
    const redistributed: Record<string, number> = {};
    for (const ballot of ballots) {
      const remainingRanks = ballot.rankings.filter((id) => remaining.has(id));
      if (remainingRanks[0] === eliminated && remainingRanks.length > 1) {
        const nextPick = remainingRanks[1];
        redistributed[nextPick] = (redistributed[nextPick] || 0) + 1;
      }
    }

    round.eliminated = eliminated;
    round.redistributed = redistributed;
    remaining.delete(eliminated);
    eliminationOrder.push(eliminated);
    rounds.push(round);
  }

  const winner = [...remaining][0];
  const finalRankings = [winner, ...eliminationOrder.reverse()];
  return { winner, rounds, finalRankings };
}

export interface Awards {
  champion: string;
  runnerUp: string;
  sleeperHit: string | null;
  mostPolarizing: string | null;
  crowdComfort: string | null;
  boldestBowl: string | null;
}

export function computeAwards(
  result: RCVResult,
  ballots: { rankings: string[] }[],
  tastingNotes: { soupId: string; flavorTags: string[] }[]
): Awards {
  const champion = result.finalRankings[0];
  const runnerUp = result.finalRankings[1];

  // Sleeper Hit: biggest positive jump from round 1 to final round
  let sleeperHit: string | null = null;
  if (result.rounds.length >= 2) {
    const firstRound = result.rounds[0].counts;
    const lastRound = result.rounds[result.rounds.length - 1].counts;
    let maxJump = 0;

    for (const soupId of Object.keys(lastRound)) {
      const jump = (lastRound[soupId] || 0) - (firstRound[soupId] || 0);
      if (jump > maxJump) {
        maxJump = jump;
        sleeperHit = soupId;
      }
    }
  }

  // Most Polarizing: highest std deviation in ranking position
  let mostPolarizing: string | null = null;
  const positionMap: Record<string, number[]> = {};
  for (const ballot of ballots) {
    for (let i = 0; i < ballot.rankings.length; i++) {
      const soupId = ballot.rankings[i];
      if (!positionMap[soupId]) positionMap[soupId] = [];
      positionMap[soupId].push(i + 1);
    }
  }

  let maxStdDev = 0;
  for (const [soupId, positions] of Object.entries(positionMap)) {
    if (positions.length < 2) continue;
    const mean = positions.reduce((a, b) => a + b, 0) / positions.length;
    const variance = positions.reduce((sum, p) => sum + (p - mean) ** 2, 0) / positions.length;
    const stdDev = Math.sqrt(variance);
    if (stdDev > maxStdDev) {
      maxStdDev = stdDev;
      mostPolarizing = soupId;
    }
  }

  // Tasting note-based awards
  const comfortTags = ["hearty", "savory"];
  const boldTags = ["spicy", "smoky", "umami"];

  function countTags(targetTags: string[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const note of tastingNotes) {
      const matchCount = note.flavorTags.filter((t) => targetTags.includes(t)).length;
      if (matchCount > 0) {
        counts[note.soupId] = (counts[note.soupId] || 0) + matchCount;
      }
    }
    return counts;
  }

  function topByTags(targetTags: string[]): string | null {
    const counts = countTags(targetTags);
    const entries = Object.entries(counts);
    if (entries.length === 0) return null;
    return entries.sort(([, a], [, b]) => b - a)[0][0];
  }

  return {
    champion,
    runnerUp,
    sleeperHit,
    mostPolarizing,
    crowdComfort: tastingNotes.length > 0 ? topByTags(comfortTags) : null,
    boldestBowl: tastingNotes.length > 0 ? topByTags(boldTags) : null,
  };
}
