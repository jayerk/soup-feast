"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface LeaderboardData {
  votePulse: { cast: number; total: number };
  top5: { soupId: string; name: string; cookName: string; votes: number; number: number | null }[];
  totalSoups: number;
  votingOpen: boolean;
  dietaryBreakdown: Record<string, number>;
}

const SOUP_FACTS = [
  "The world's oldest soup recipe is from 6000 BC.",
  "Americans consume over 10 billion bowls of soup each year.",
  "Soup was one of the first foods to be canned commercially.",
  "The word 'soup' comes from the French 'soupe' meaning broth.",
  "Astronauts eat dehydrated soup in space.",
  "Bird's nest soup can cost up to $100 per bowl.",
  "Campbell's sells about 2.5 billion bowls of soup a year.",
  "Soup kitchens date back to at least the 1700s.",
  "In Japan, slurping soup is considered polite.",
  "The largest bowl of soup was 6,656 gallons.",
];

export function LeaderboardClient() {
  const searchParams = useSearchParams();
  const tvMode = searchParams.get("mode") === "tv";
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [activeBlock, setActiveBlock] = useState(0);
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!tvMode) return;
    const interval = setInterval(() => {
      setActiveBlock((prev) => (prev + 1) % 4);
      setFactIndex(Math.floor(Math.random() * SOUP_FACTS.length));
    }, 12000);
    return () => clearInterval(interval);
  }, [tvMode]);

  async function fetchData() {
    try {
      const res = await fetch("/api/leaderboard");
      const json = await res.json();
      setData(json);
    } catch {
      // retry on next interval
    }
  }

  if (!data) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${tvMode ? "bg-stone-950" : "bg-stone-50"}`}>
        <p className={tvMode ? "text-stone-500" : "text-stone-400"}>Loading leaderboard...</p>
      </div>
    );
  }

  if (tvMode) {
    const blocks = [
      // Vote Pulse
      <div key="pulse" className="flex flex-col items-center justify-center">
        <p className="mb-4 text-2xl text-stone-400">Ballots Cast</p>
        <p className="text-8xl font-bold text-amber-400">{data.votePulse.cast}</p>
        <p className="mt-2 text-xl text-stone-500">of ~{data.votePulse.total}</p>
        <div className="mt-6 h-4 w-96 overflow-hidden rounded-full bg-stone-800">
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-1000"
            style={{ width: `${Math.min((data.votePulse.cast / Math.max(data.votePulse.total, 1)) * 100, 100)}%` }}
          />
        </div>
      </div>,
      // Top 5
      <div key="top5" className="w-full max-w-2xl">
        <p className="mb-6 text-center text-2xl text-stone-400">Current Top 5</p>
        <div className="space-y-4">
          {data.top5.map((soup, i) => (
            <div key={soup.soupId} className="flex items-center gap-4 rounded-xl bg-stone-800/50 px-6 py-4">
              <span className="text-4xl font-bold text-amber-400">#{i + 1}</span>
              <div className="flex-1">
                <p className="text-xl font-semibold text-white">{soup.name}</p>
                <p className="text-stone-400">by {soup.cookName}</p>
              </div>
              <span className="text-2xl font-bold text-stone-300">{soup.votes}</span>
            </div>
          ))}
          {data.top5.length === 0 && (
            <p className="text-center text-stone-500">No votes yet — start tasting!</p>
          )}
        </div>
      </div>,
      // Soup Fact
      <div key="fact" className="max-w-2xl text-center">
        <p className="mb-4 text-xl text-stone-400">Did You Know?</p>
        <p className="text-3xl font-semibold text-white">{SOUP_FACTS[factIndex]}</p>
      </div>,
      // Dietary Breakdown
      <div key="dietary" className="w-full max-w-lg">
        <p className="mb-6 text-center text-2xl text-stone-400">This Year&rsquo;s Lineup</p>
        <div className="space-y-3">
          {Object.entries(data.dietaryBreakdown).map(([tag, count]) => (
            <div key={tag} className="flex items-center gap-3">
              <span className="w-32 text-right text-stone-400">{tag}</span>
              <div className="h-8 flex-1 overflow-hidden rounded-full bg-stone-800">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${(count / Math.max(data.totalSoups, 1)) * 100}%` }}
                />
              </div>
              <span className="w-8 text-stone-300">{count}</span>
            </div>
          ))}
        </div>
      </div>,
    ];

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-950 p-12">
        <h1 className="mb-12 text-center text-4xl font-bold text-amber-400">
          The Great Soup Feast
        </h1>
        <div className="flex-1 flex items-center justify-center w-full">
          {blocks[activeBlock]}
        </div>
      </div>
    );
  }

  // Phone mode
  return (
    <div className="min-h-screen bg-stone-50 px-4 py-8">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="mb-6 inline-block text-sm text-stone-500 hover:text-stone-700">
          &larr; Back
        </Link>
        <h1 className="mb-6 text-2xl font-bold text-stone-900">Live Leaderboard</h1>

        {/* Vote pulse */}
        <div className="mb-6 rounded-xl border border-stone-200 bg-white p-6 text-center">
          <p className="text-sm text-stone-500">Ballots Cast</p>
          <p className="text-4xl font-bold text-stone-900">{data.votePulse.cast}</p>
          <p className="text-sm text-stone-400">of ~{data.votePulse.total}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{ width: `${Math.min((data.votePulse.cast / Math.max(data.votePulse.total, 1)) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Top 5 */}
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-stone-900">Top 5</h2>
          <div className="space-y-2">
            {data.top5.map((soup, i) => (
              <div key={soup.soupId} className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3">
                <span className="text-lg font-bold text-amber-600">#{i + 1}</span>
                <div className="flex-1">
                  <p className="font-medium text-stone-900">{soup.name}</p>
                  <p className="text-xs text-stone-500">by {soup.cookName}</p>
                </div>
                <span className="text-sm font-semibold text-stone-600">{soup.votes} votes</span>
              </div>
            ))}
            {data.top5.length === 0 && (
              <p className="py-6 text-center text-stone-400">No votes yet</p>
            )}
          </div>
        </div>

        {/* Soup fact */}
        <div className="rounded-xl border border-stone-200 bg-white p-4 text-center">
          <p className="text-xs font-medium text-stone-400">Soup Fact</p>
          <p className="mt-1 text-sm text-stone-700">{SOUP_FACTS[factIndex]}</p>
        </div>
      </div>
    </div>
  );
}
