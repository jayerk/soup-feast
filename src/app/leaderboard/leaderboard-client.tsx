"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface LeaderboardData {
  votePulse: { cast: number; total: number };
  top5: { soupId: string; name: string; cookName: string; votes: number; number: number | null }[];
  totalSoups: number;
  votingOpen: boolean;
  dietaryBreakdown: Record<string, number>;
}

const SOUP_FACTS = [
  "The world\u2019s oldest soup recipe is from 6000 BC.",
  "Americans consume over 10 billion bowls of soup each year.",
  "Soup was one of the first foods to be canned commercially.",
  "The word \u2018soup\u2019 comes from the French \u2018soupe\u2019 meaning broth.",
  "Astronauts eat dehydrated soup in space.",
  "Bird\u2019s nest soup can cost up to $100 per bowl.",
  "Campbell\u2019s sells about 2.5 billion bowls of soup a year.",
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
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-taupe italic" style={{ fontFamily: "var(--font-lora)" }}>Loading leaderboard...</p>
      </div>
    );
  }

  // TV Mode — keeps dark for big screen projection
  if (tvMode) {
    const blocks = [
      <div key="pulse" className="flex flex-col items-center justify-center">
        <p className="mb-4 text-2xl text-stone-400" style={{ fontFamily: "var(--font-lora)" }}>Ballots Cast</p>
        <p className="text-8xl font-bold text-amber-200" style={{ fontFamily: "var(--font-playfair)" }}>{data.votePulse.cast}</p>
        <p className="mt-2 text-xl text-stone-500">of ~{data.votePulse.total}</p>
        <div className="mt-6 h-4 w-96 overflow-hidden bg-stone-800">
          <div
            className="h-full bg-amber-200 transition-all duration-1000"
            style={{ width: `${Math.min((data.votePulse.cast / Math.max(data.votePulse.total, 1)) * 100, 100)}%` }}
          />
        </div>
      </div>,
      <div key="top5" className="w-full max-w-2xl">
        <p className="mb-6 text-center text-2xl text-stone-400" style={{ fontFamily: "var(--font-lora)" }}>Current Top 5</p>
        <div className="space-y-4">
          {data.top5.map((soup, i) => (
            <div key={soup.soupId} className="flex items-center gap-4 border border-stone-700 px-6 py-4">
              <span className="text-4xl font-bold text-amber-200" style={{ fontFamily: "var(--font-playfair)" }}>
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="text-xl font-semibold text-white" style={{ fontFamily: "var(--font-playfair)" }}>{soup.name}</p>
                <p className="text-stone-400 italic" style={{ fontFamily: "var(--font-lora)" }}>by {soup.cookName}</p>
              </div>
              <span className="text-2xl font-bold text-stone-300" style={{ fontFamily: "var(--font-playfair)" }}>{soup.votes}</span>
            </div>
          ))}
          {data.top5.length === 0 && (
            <p className="text-center text-stone-500 italic" style={{ fontFamily: "var(--font-lora)" }}>No votes yet &mdash; start tasting!</p>
          )}
        </div>
      </div>,
      <div key="fact" className="max-w-2xl text-center">
        <p className="mb-4 text-xs tracking-[0.3em] uppercase text-stone-500">Did You Know?</p>
        <p className="text-3xl font-semibold text-white" style={{ fontFamily: "var(--font-playfair)" }}>{SOUP_FACTS[factIndex]}</p>
      </div>,
      <div key="dietary" className="w-full max-w-lg">
        <p className="mb-6 text-center text-2xl text-stone-400" style={{ fontFamily: "var(--font-lora)" }}>This Year&rsquo;s Lineup</p>
        <div className="space-y-3">
          {Object.entries(data.dietaryBreakdown).map(([tag, count]) => (
            <div key={tag} className="flex items-center gap-3">
              <span className="w-32 text-right text-stone-400 text-sm" style={{ fontFamily: "var(--font-lora)" }}>{tag}</span>
              <div className="h-6 flex-1 overflow-hidden bg-stone-800">
                <div
                  className="h-full bg-avocado transition-all"
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
        <h1
          className="mb-12 text-center text-4xl font-bold text-amber-200"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          The Great Soup Feast
        </h1>
        <div className="flex-1 flex items-center justify-center w-full">
          {blocks[activeBlock]}
        </div>
      </div>
    );
  }

  // Phone mode — editorial style
  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <p className="text-xs tracking-[0.3em] uppercase text-taupe mb-4">Live</p>
      <h2
        className="text-4xl font-bold text-espresso mb-8"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        Leaderboard
      </h2>

      {/* Vote pulse */}
      <div className="card-editorial text-center mb-8">
        <p className="text-xs tracking-[0.15em] uppercase text-taupe mb-2">Ballots Cast</p>
        <p
          className="text-4xl font-bold text-espresso"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {data.votePulse.cast}
        </p>
        <p className="text-sm text-taupe">of ~{data.votePulse.total}</p>
        <div className="mt-3 h-2 overflow-hidden bg-parchment">
          <div
            className="h-full bg-harvest-gold transition-all"
            style={{ width: `${Math.min((data.votePulse.cast / Math.max(data.votePulse.total, 1)) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Top 5 */}
      <div className="mb-8">
        <h3
          className="text-lg font-bold text-espresso mb-4"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Top 5
        </h3>
        <div className="space-y-2">
          {data.top5.map((soup, i) => (
            <div key={soup.soupId} className="flex items-center gap-3 border border-sand bg-white px-4 py-3">
              <span
                className="text-lg font-bold text-wine"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-espresso">{soup.name}</p>
                <p className="text-xs text-taupe italic">by {soup.cookName}</p>
              </div>
              <span className="text-sm font-semibold text-taupe">{soup.votes}</span>
            </div>
          ))}
          {data.top5.length === 0 && (
            <p className="py-6 text-center text-taupe italic" style={{ fontFamily: "var(--font-lora)" }}>
              No votes yet
            </p>
          )}
        </div>
      </div>

      {/* Soup fact */}
      <div className="card-editorial text-center">
        <p className="text-xs tracking-[0.15em] uppercase text-taupe mb-2">Soup Fact</p>
        <p className="text-sm text-espresso italic" style={{ fontFamily: "var(--font-lora)" }}>
          {SOUP_FACTS[factIndex]}
        </p>
      </div>
    </div>
  );
}
