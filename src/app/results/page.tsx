"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SoupInfo {
  name: string;
  cookName: string;
  number: number | null;
  description: string;
}

interface ResultsData {
  revealed: boolean;
  rcvResult?: {
    winner: string;
    rounds: {
      counts: Record<string, number>;
      eliminated: string | null;
      redistributed: Record<string, number>;
    }[];
    finalRankings: string[];
  };
  awards?: {
    champion: string;
    runnerUp: string;
    sleeperHit: string | null;
    mostPolarizing: string | null;
    crowdComfort: string | null;
    boldestBowl: string | null;
  };
  soupMap?: Record<string, SoupInfo>;
  stats?: {
    totalVotes: number;
    avgRanked: string;
    mostRanked: string | null;
    leastRanked: string | null;
    firstVote: string | null;
    lastVote: string | null;
    totalSoups: number;
  };
}

export default function ResultsPage() {
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/results")
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-900">
        <p className="text-stone-400">Loading results...</p>
      </div>
    );
  }

  if (!data?.revealed || !data.rcvResult || !data.soupMap || !data.awards) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-900 px-4 text-center">
        <p className="mb-4 text-5xl">🏆</p>
        <h1 className="mb-2 text-2xl font-bold text-white">Results Coming Soon</h1>
        <p className="mb-6 text-stone-400">The admin hasn&rsquo;t revealed the results yet. Stay tuned!</p>
        <Link href="/leaderboard" className="text-amber-400 hover:underline">
          Check the leaderboard
        </Link>
      </div>
    );
  }

  const { rcvResult, awards, soupMap, stats } = data;

  function soupName(id: string): string {
    return soupMap![id]?.name || "Unknown Soup";
  }
  function cookName(id: string): string {
    return soupMap![id]?.cookName || "Unknown";
  }

  const awardsList = [
    { label: "Champion", id: awards.champion, emoji: "🏆" },
    { label: "Runner-Up", id: awards.runnerUp, emoji: "🥈" },
    { label: "Sleeper Hit", id: awards.sleeperHit, emoji: "🌟", subtitle: "Biggest mover from round 1 to final" },
    { label: "Most Polarizing", id: awards.mostPolarizing, emoji: "🔥", subtitle: "Highest ranking variance" },
    { label: "Crowd Comfort", id: awards.crowdComfort, emoji: "🫕", subtitle: 'Most "hearty" + "savory" tags' },
    { label: "Boldest Bowl", id: awards.boldestBowl, emoji: "🌶️", subtitle: 'Most "spicy" + "smoky" + "umami" tags' },
  ].filter((a) => a.id);

  return (
    <div className="min-h-screen bg-stone-900 px-4 py-12 text-stone-100">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm uppercase tracking-widest text-amber-400">The Results Are In</p>
          <h1 className="text-4xl font-bold sm:text-5xl">
            {soupName(rcvResult.winner)} Wins!
          </h1>
          <p className="mt-2 text-lg text-stone-400">by {cookName(rcvResult.winner)}</p>
        </div>

        {/* RCV Rounds Visualization */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-amber-400">How the Votes Flowed</h2>
          <div className="space-y-4">
            {rcvResult.rounds.map((round, i) => (
              <div key={i} className="rounded-xl bg-stone-800/50 p-6">
                <h3 className="mb-3 text-sm font-medium text-stone-400">Round {i + 1}</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {Object.entries(round.counts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([soupId, count]) => (
                      <div
                        key={soupId}
                        className={`rounded-lg p-3 ${
                          soupId === round.eliminated
                            ? "bg-red-900/30 line-through opacity-60"
                            : soupId === rcvResult.winner && i === rcvResult.rounds.length - 1
                              ? "bg-amber-900/40 ring-1 ring-amber-500"
                              : "bg-stone-700/50"
                        }`}
                      >
                        <p className="truncate text-sm font-medium">{soupName(soupId)}</p>
                        <p className="text-lg font-bold text-amber-400">{count}</p>
                      </div>
                    ))}
                </div>
                {round.eliminated && (
                  <p className="mt-3 text-sm text-red-400">
                    Eliminated: {soupName(round.eliminated)}
                    {Object.keys(round.redistributed).length > 0 && (
                      <span className="text-stone-500">
                        {" — votes went to "}
                        {Object.entries(round.redistributed)
                          .map(([id, n]) => `${soupName(id)} (+${n})`)
                          .join(", ")}
                      </span>
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Final Rankings */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-amber-400">Final Rankings</h2>
          <div className="space-y-2">
            {rcvResult.finalRankings.map((soupId, i) => (
              <div
                key={soupId}
                className={`flex items-center gap-4 rounded-lg px-4 py-3 ${
                  i === 0 ? "bg-amber-900/30 ring-1 ring-amber-500" : "bg-stone-800/50"
                }`}
              >
                <span className="w-8 text-right text-lg font-bold text-amber-400">#{i + 1}</span>
                <div className="flex-1">
                  <p className="font-semibold">{soupName(soupId)}</p>
                  <p className="text-sm text-stone-400">by {cookName(soupId)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Awards */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-amber-400">Awards</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {awardsList.map((award) => (
              <div key={award.label} className="rounded-xl bg-stone-800/50 p-6 text-center">
                <p className="mb-2 text-3xl">{award.emoji}</p>
                <p className="text-xs font-medium uppercase tracking-wider text-amber-400">
                  {award.label}
                </p>
                <p className="mt-1 text-lg font-bold">{soupName(award.id!)}</p>
                <p className="text-sm text-stone-400">by {cookName(award.id!)}</p>
                {award.subtitle && (
                  <p className="mt-1 text-xs text-stone-500">{award.subtitle}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fun Stats */}
        {stats && (
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-amber-400">By the Numbers</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-stone-800/50 p-4 text-center">
                <p className="text-3xl font-bold text-white">{stats.totalVotes}</p>
                <p className="text-xs text-stone-400">Ballots Cast</p>
              </div>
              <div className="rounded-xl bg-stone-800/50 p-4 text-center">
                <p className="text-3xl font-bold text-white">{stats.totalSoups}</p>
                <p className="text-xs text-stone-400">Soups Entered</p>
              </div>
              <div className="rounded-xl bg-stone-800/50 p-4 text-center">
                <p className="text-3xl font-bold text-white">{stats.avgRanked}</p>
                <p className="text-xs text-stone-400">Avg Soups Ranked</p>
              </div>
              {stats.mostRanked && (
                <div className="rounded-xl bg-stone-800/50 p-4 text-center">
                  <p className="text-lg font-bold text-white">{soupName(stats.mostRanked)}</p>
                  <p className="text-xs text-stone-400">Most Ranked Soup</p>
                </div>
              )}
              {stats.leastRanked && (
                <div className="rounded-xl bg-stone-800/50 p-4 text-center">
                  <p className="text-lg font-bold text-white">{soupName(stats.leastRanked)}</p>
                  <p className="text-xs text-stone-400">Hidden Gem</p>
                </div>
              )}
              {stats.firstVote && (
                <div className="rounded-xl bg-stone-800/50 p-4 text-center">
                  <p className="text-lg font-bold text-white">{stats.firstVote}</p>
                  <p className="text-xs text-stone-400">First Vote</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-center">
          <Link href="/archive" className="text-amber-400 hover:underline">
            View Past Years
          </Link>
        </div>
      </div>
    </div>
  );
}
