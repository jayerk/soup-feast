"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Soup {
  id: string;
  name: string;
  cookName: string;
  number: number | null;
}

export default function VotePage() {
  const params = useParams();
  const token = params.token as string;
  const [triedSoups, setTriedSoups] = useState<Soup[]>([]);
  const [rankings, setRankings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rankingDepth, setRankingDepth] = useState(5);

  useEffect(() => {
    async function load() {
      const eventRes = await fetch("/api/events");
      const eventData = await eventRes.json();
      if (!eventData.event) { setLoading(false); return; }
      setRankingDepth(eventData.event.rankingDepth || 5);

      const soupsRes = await fetch(`/api/soups?eventId=${eventData.event.id}`);
      const soupsData = await soupsRes.json();

      const logRes = await fetch(`/api/tasting-logs?token=${token}`);
      const logData = await logRes.json();
      const triedIds = new Set(logData.triedSoupIds || []);

      setTriedSoups(
        soupsData.soups.filter((s: Soup) => triedIds.has(s.id))
      );
      setLoading(false);
    }
    load();
  }, [token]);

  function addToRanking(soupId: string) {
    if (rankings.includes(soupId)) {
      setRankings(rankings.filter((id) => id !== soupId));
    } else if (rankings.length < rankingDepth) {
      setRankings([...rankings, soupId]);
    }
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const newRankings = [...rankings];
    [newRankings[index - 1], newRankings[index]] = [newRankings[index], newRankings[index - 1]];
    setRankings(newRankings);
  }

  function moveDown(index: number) {
    if (index === rankings.length - 1) return;
    const newRankings = [...rankings];
    [newRankings[index], newRankings[index + 1]] = [newRankings[index + 1], newRankings[index]];
    setRankings(newRankings);
  }

  async function handleSubmit() {
    if (rankings.length === 0) return;
    setSubmitting(true);

    const res = await fetch("/api/ballots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestToken: token, rankings }),
    });

    if (res.ok) {
      setSubmitted(true);
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-taupe italic" style={{ fontFamily: "var(--font-lora)" }}>Loading...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <p
          className="text-4xl font-bold text-wine mb-4"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Ballot Cast.
        </p>
        <div className="w-12 h-px bg-harvest-gold mx-auto mb-6" />
        <p className="text-taupe mb-8" style={{ fontFamily: "var(--font-lora)" }}>
          Your taste buds have spoken. You can update your ballot anytime before voting closes.
        </p>
        <div className="flex flex-col gap-3">
          <Link href={`/taste/${token}/notes`} className="btn-vintage-filled">
            Leave Tasting Notes
          </Link>
          <Link href="/leaderboard" className="btn-vintage">
            See the Leaderboard
          </Link>
          <button
            onClick={() => { setSubmitted(false); }}
            className="text-sm text-taupe hover:text-espresso mt-2"
            style={{ fontFamily: "var(--font-lora)" }}
          >
            Update my ballot
          </button>
        </div>
      </div>
    );
  }

  function soupName(id: string): string {
    return triedSoups.find((s) => s.id === id)?.name || "Unknown";
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="border-b border-sand bg-parchment px-6 py-6 text-center">
        <h2
          className="text-2xl font-bold text-espresso"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Rank Your Favorites
        </h2>
        <p className="mt-1 text-sm text-taupe" style={{ fontFamily: "var(--font-lora)" }}>
          Pick your top {rankingDepth} from the soups you tried
        </p>
      </div>

      {/* Current ranking */}
      <div className="mx-6 mt-6 border border-harvest-gold bg-parchment p-5">
        <h3
          className="text-sm font-bold text-espresso mb-3"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Your Top {rankingDepth}
        </h3>
        {rankings.length === 0 ? (
          <p className="text-sm text-taupe italic" style={{ fontFamily: "var(--font-lora)" }}>
            Tap soups below to add them to your ranking.
          </p>
        ) : (
          <div className="space-y-1">
            {rankings.map((soupId, i) => (
              <div key={soupId} className="flex items-center gap-2 bg-white border border-sand px-3 py-2">
                <span
                  className="w-6 text-center text-sm font-bold text-wine"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-medium text-espresso">{soupName(soupId)}</span>
                <button onClick={() => moveUp(i)} className="text-xs text-taupe hover:text-espresso" disabled={i === 0}>&#9650;</button>
                <button onClick={() => moveDown(i)} className="text-xs text-taupe hover:text-espresso" disabled={i === rankings.length - 1}>&#9660;</button>
                <button onClick={() => addToRanking(soupId)} className="text-xs text-wine hover:text-espresso">&#10005;</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Soup list */}
      <div className="px-6 py-6">
        <h3 className="text-xs tracking-[0.15em] uppercase text-taupe mb-4">Soups You Tried</h3>
        <div className="space-y-2">
          {triedSoups.map((soup) => {
            const rank = rankings.indexOf(soup.id);
            const isRanked = rank !== -1;
            return (
              <button
                key={soup.id}
                onClick={() => addToRanking(soup.id)}
                className={`flex w-full items-center gap-3 border px-4 py-3 text-left transition-colors ${
                  isRanked
                    ? "border-harvest-gold bg-parchment"
                    : rankings.length >= rankingDepth
                      ? "border-sand bg-cream opacity-50"
                      : "border-sand bg-white hover:border-harvest-gold"
                }`}
                disabled={!isRanked && rankings.length >= rankingDepth}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center border border-sand text-sm font-bold text-espresso"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {soup.number || "?"}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-espresso">{soup.name}</p>
                  <p className="text-xs text-taupe italic">by {soup.cookName}</p>
                </div>
                {isRanked && (
                  <span
                    className="text-xs font-bold text-wine tracking-wider"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    #{rank + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-sand bg-cream p-4">
        <button
          onClick={handleSubmit}
          disabled={rankings.length === 0 || submitting}
          className="btn-vintage-filled w-full text-center disabled:opacity-50"
        >
          {submitting ? "Submitting..." : `Submit Ballot (${rankings.length} ranked)`}
        </button>
        <Link
          href={`/taste/${token}`}
          className="mt-2 block text-center text-sm text-taupe hover:text-espresso"
          style={{ fontFamily: "var(--font-lora)" }}
        >
          Tried another one? Go back to tasting
        </Link>
      </div>
    </div>
  );
}
