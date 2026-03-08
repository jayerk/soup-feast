"use client";

import { useEffect, useState } from "react";

interface Event {
  id: string;
  votingOpen: boolean;
  resultsRevealed: boolean;
}

interface BallotCount {
  total: number;
}

export default function RevealPage() {
  const [event, setEvent] = useState<Event | null>(null);
  const [ballotCount, setBallotCount] = useState<BallotCount>({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const res = await fetch("/api/events");
    const data = await res.json();
    if (data.event) {
      setEvent(data.event);
      const lbRes = await fetch("/api/leaderboard");
      const lbData = await lbRes.json();
      setBallotCount({ total: lbData.votePulse.cast });
    }
    setLoading(false);
  }

  async function toggleVoting() {
    if (!event) return;
    setActionLoading(true);
    await fetch("/api/events/voting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: event.id, votingOpen: !event.votingOpen }),
    });
    await fetchData();
    setActionLoading(false);
  }

  async function revealResults() {
    if (!event || !confirm("Reveal results to everyone? This cannot be undone.")) return;
    setActionLoading(true);
    await fetch("/api/events/reveal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: event.id }),
    });
    await fetchData();
    setActionLoading(false);
  }

  if (loading) return <p className="text-stone-500">Loading...</p>;
  if (!event) return <p className="text-stone-500">Create an event first.</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Results & Reveal</h1>

      {/* Status */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <p className="text-sm text-stone-500">Voting Status</p>
          <p className={`mt-1 text-2xl font-bold ${event.votingOpen ? "text-green-600" : "text-stone-400"}`}>
            {event.votingOpen ? "Open" : "Closed"}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <p className="text-sm text-stone-500">Ballots Cast</p>
          <p className="mt-1 text-2xl font-bold text-stone-900">{ballotCount.total}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="mb-2 text-lg font-semibold">Voting Control</h2>
          <p className="mb-4 text-sm text-stone-500">
            {event.votingOpen
              ? "Voting is currently open. Close it when you're ready to tally."
              : "Voting is closed. Open it to allow guests to vote."}
          </p>
          <button
            onClick={toggleVoting}
            disabled={actionLoading}
            className={`rounded-lg px-6 py-3 font-medium text-white disabled:opacity-50 ${
              event.votingOpen ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {event.votingOpen ? "Close Voting" : "Open Voting"}
          </button>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="mb-2 text-lg font-semibold">Results Reveal</h2>
          {event.resultsRevealed ? (
            <div>
              <p className="mb-4 text-green-600 font-medium">Results have been revealed!</p>
              <a
                href="/results"
                target="_blank"
                className="rounded-lg bg-amber-500 px-6 py-3 font-medium text-stone-900 hover:bg-amber-400 inline-block"
              >
                View Results Page
              </a>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-sm text-stone-500">
                Make sure voting is closed before revealing. This makes the results page public for everyone.
              </p>
              <button
                onClick={revealResults}
                disabled={actionLoading || event.votingOpen}
                className="rounded-lg bg-soup-red px-6 py-3 font-medium text-white hover:bg-red-800 disabled:opacity-50"
              >
                Reveal Results
              </button>
              {event.votingOpen && (
                <p className="mt-2 text-xs text-amber-600">Close voting first to enable reveal.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
