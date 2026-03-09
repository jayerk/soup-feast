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
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="text-taupe italic" style={{ fontFamily: "var(--font-lora)" }}>Loading results...</p>
      </div>
    );
  }

  if (!data?.revealed || !data.rcvResult || !data.soupMap || !data.awards) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <p
          className="text-4xl font-bold text-espresso mb-4"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Results Pending
        </p>
        <div className="w-12 h-px bg-harvest-gold mx-auto mb-6" />
        <p className="text-taupe mb-8" style={{ fontFamily: "var(--font-lora)" }}>
          The results haven&rsquo;t been revealed yet. Stay tuned.
        </p>
        <Link href="/leaderboard" className="btn-vintage">
          Check the Leaderboard
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
    { label: "Champion", id: awards.champion },
    { label: "Runner-Up", id: awards.runnerUp },
    { label: "Sleeper Hit", id: awards.sleeperHit, subtitle: "Biggest mover from round 1 to final" },
    { label: "Most Polarizing", id: awards.mostPolarizing, subtitle: "Highest ranking variance" },
    { label: "Crowd Comfort", id: awards.crowdComfort, subtitle: 'Most "hearty" + "savory" tags' },
    { label: "Boldest Bowl", id: awards.boldestBowl, subtitle: 'Most "spicy" + "smoky" + "umami" tags' },
  ].filter((a) => a.id);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Hero */}
      <div className="mb-16 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-taupe mb-6">The Results Are In</p>
        <h2
          className="text-5xl sm:text-6xl font-bold text-espresso leading-tight"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {soupName(rcvResult.winner)} Wins.
        </h2>
        <p className="mt-3 text-lg text-taupe italic" style={{ fontFamily: "var(--font-lora)" }}>
          by {cookName(rcvResult.winner)}
        </p>
        <div className="w-16 h-px bg-harvest-gold mx-auto mt-8" />
      </div>

      {/* RCV Rounds */}
      <section className="mb-16">
        <h3
          className="text-2xl font-bold text-espresso mb-2"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          How the Votes Flowed
        </h3>
        <div className="w-8 h-px bg-sand mb-8" />
        <div className="space-y-6">
          {rcvResult.rounds.map((round, i) => (
            <div key={i} className="card-editorial">
              <h4 className="text-xs tracking-[0.15em] uppercase text-taupe mb-4">Round {i + 1}</h4>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {Object.entries(round.counts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([soupId, count]) => (
                    <div
                      key={soupId}
                      className={`p-3 border ${
                        soupId === round.eliminated
                          ? "border-wine/30 bg-wine/5 line-through opacity-60"
                          : soupId === rcvResult.winner && i === rcvResult.rounds.length - 1
                            ? "border-harvest-gold bg-parchment"
                            : "border-sand bg-cream"
                      }`}
                    >
                      <p className="truncate text-sm font-medium text-espresso">{soupName(soupId)}</p>
                      <p
                        className="text-lg font-bold text-wine"
                        style={{ fontFamily: "var(--font-playfair)" }}
                      >
                        {count}
                      </p>
                    </div>
                  ))}
              </div>
              {round.eliminated && (
                <p className="mt-3 text-sm text-taupe" style={{ fontFamily: "var(--font-lora)" }}>
                  <span className="text-wine">Eliminated:</span> {soupName(round.eliminated)}
                  {Object.keys(round.redistributed).length > 0 && (
                    <span className="text-mushroom">
                      {" — votes redistributed to "}
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
      </section>

      {/* Final Rankings */}
      <section className="mb-16">
        <h3
          className="text-2xl font-bold text-espresso mb-2"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Final Rankings
        </h3>
        <div className="w-8 h-px bg-sand mb-8" />
        <div className="space-y-2">
          {rcvResult.finalRankings.map((soupId, i) => (
            <div
              key={soupId}
              className={`flex items-center gap-4 px-5 py-3 border ${
                i === 0 ? "border-harvest-gold bg-parchment" : "border-sand bg-white"
              }`}
            >
              <span
                className="w-8 text-right text-lg font-bold text-wine"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-espresso">{soupName(soupId)}</p>
                <p className="text-sm text-taupe italic">by {cookName(soupId)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Awards */}
      <section className="mb-16">
        <h3
          className="text-2xl font-bold text-espresso mb-2"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Awards
        </h3>
        <div className="w-8 h-px bg-sand mb-8" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {awardsList.map((award) => (
            <div key={award.label} className="card-editorial text-center">
              <p className="text-xs tracking-[0.2em] uppercase text-harvest-gold mb-2">
                {award.label}
              </p>
              <p
                className="text-lg font-bold text-espresso"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {soupName(award.id!)}
              </p>
              <p className="text-sm text-taupe italic">by {cookName(award.id!)}</p>
              {award.subtitle && (
                <p className="mt-2 text-xs text-mushroom">{award.subtitle}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="mb-16">
          <h3
            className="text-2xl font-bold text-espresso mb-2"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            By the Numbers
          </h3>
          <div className="w-8 h-px bg-sand mb-8" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="card-editorial text-center">
              <p
                className="text-3xl font-bold text-espresso"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {stats.totalVotes}
              </p>
              <p className="text-xs tracking-[0.15em] uppercase text-taupe mt-1">Ballots Cast</p>
            </div>
            <div className="card-editorial text-center">
              <p
                className="text-3xl font-bold text-espresso"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {stats.totalSoups}
              </p>
              <p className="text-xs tracking-[0.15em] uppercase text-taupe mt-1">Soups Entered</p>
            </div>
            <div className="card-editorial text-center">
              <p
                className="text-3xl font-bold text-espresso"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {stats.avgRanked}
              </p>
              <p className="text-xs tracking-[0.15em] uppercase text-taupe mt-1">Avg Soups Ranked</p>
            </div>
            {stats.mostRanked && (
              <div className="card-editorial text-center">
                <p className="text-lg font-bold text-espresso" style={{ fontFamily: "var(--font-playfair)" }}>
                  {soupName(stats.mostRanked)}
                </p>
                <p className="text-xs tracking-[0.15em] uppercase text-taupe mt-1">Most Ranked</p>
              </div>
            )}
            {stats.leastRanked && (
              <div className="card-editorial text-center">
                <p className="text-lg font-bold text-espresso" style={{ fontFamily: "var(--font-playfair)" }}>
                  {soupName(stats.leastRanked)}
                </p>
                <p className="text-xs tracking-[0.15em] uppercase text-taupe mt-1">Hidden Gem</p>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="text-center">
        <Link href="/archive" className="btn-vintage">
          View Past Years
        </Link>
      </div>
    </div>
  );
}
