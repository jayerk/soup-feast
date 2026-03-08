"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Soup {
  id: string;
  name: string;
  cookName: string;
  number: number | null;
}

export default function VotePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [triedSoups, setTriedSoups] = useState<Soup[]>([]);
  const [rankings, setRankings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rankingDepth, setRankingDepth] = useState(5);

  useEffect(() => {
    async function load() {
      // Get event config
      const eventRes = await fetch("/api/events");
      const eventData = await eventRes.json();
      if (!eventData.event) { setLoading(false); return; }
      setRankingDepth(eventData.event.rankingDepth || 5);

      // Get all soups
      const soupsRes = await fetch(`/api/soups?eventId=${eventData.event.id}`);
      const soupsData = await soupsRes.json();

      // Get tried soups
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
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-stone-400">Loading...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 text-center">
        <p className="mb-4 text-5xl">🗳️</p>
        <h1 className="mb-2 text-2xl font-bold text-stone-900">Your taste buds have spoken!</h1>
        <p className="mb-8 text-stone-500">
          Ballot submitted. You can update it anytime before voting closes.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href={`/taste/${token}/notes`}
            className="rounded-lg bg-amber-500 px-6 py-3 font-medium text-stone-900 hover:bg-amber-400"
          >
            Leave Tasting Notes
          </Link>
          <Link
            href="/leaderboard"
            className="rounded-lg border border-stone-300 px-6 py-3 font-medium text-stone-700 hover:bg-stone-100"
          >
            See the Leaderboard
          </Link>
          <button
            onClick={() => { setSubmitted(false); }}
            className="text-sm text-stone-500 hover:text-stone-700"
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
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="bg-stone-900 px-4 py-6 text-center text-white">
        <h1 className="text-xl font-bold text-amber-400">Rank Your Favorites</h1>
        <p className="mt-1 text-sm text-stone-400">
          Pick your top {rankingDepth} from the soups you tried
        </p>
      </div>

      {/* Current ranking */}
      <div className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h2 className="mb-2 text-sm font-semibold text-amber-800">Your Top {rankingDepth}</h2>
        {rankings.length === 0 ? (
          <p className="text-sm text-amber-600">Tap soups below to add them to your ranking.</p>
        ) : (
          <div className="space-y-1">
            {rankings.map((soupId, i) => (
              <div key={soupId} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2">
                <span className="w-6 text-center text-sm font-bold text-amber-600">#{i + 1}</span>
                <span className="flex-1 text-sm font-medium">{soupName(soupId)}</span>
                <button onClick={() => moveUp(i)} className="text-xs text-stone-400 hover:text-stone-700" disabled={i === 0}>▲</button>
                <button onClick={() => moveDown(i)} className="text-xs text-stone-400 hover:text-stone-700" disabled={i === rankings.length - 1}>▼</button>
                <button onClick={() => addToRanking(soupId)} className="text-xs text-red-400 hover:text-red-600">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Soup list */}
      <div className="px-4 py-4">
        <h2 className="mb-3 text-sm font-semibold text-stone-600">Soups You Tried</h2>
        <div className="space-y-2">
          {triedSoups.map((soup) => {
            const rank = rankings.indexOf(soup.id);
            const isRanked = rank !== -1;
            return (
              <button
                key={soup.id}
                onClick={() => addToRanking(soup.id)}
                className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                  isRanked
                    ? "border-amber-300 bg-amber-50"
                    : rankings.length >= rankingDepth
                      ? "border-stone-100 bg-stone-50 opacity-50"
                      : "border-stone-200 bg-white hover:border-amber-300"
                }`}
                disabled={!isRanked && rankings.length >= rankingDepth}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-sm font-bold text-stone-600">
                  {soup.number || "?"}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-stone-900">{soup.name}</p>
                  <p className="text-xs text-stone-500">by {soup.cookName}</p>
                </div>
                {isRanked && (
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                    #{rank + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-stone-200 bg-white p-4">
        <button
          onClick={handleSubmit}
          disabled={rankings.length === 0 || submitting}
          className="w-full rounded-lg bg-soup-red py-3 font-semibold text-white hover:bg-red-800 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : `Submit Ballot (${rankings.length} ranked)`}
        </button>
        <Link
          href={`/taste/${token}`}
          className="mt-2 block text-center text-sm text-stone-500 hover:text-stone-700"
        >
          Tried another one? Go back to tasting
        </Link>
      </div>
    </div>
  );
}
