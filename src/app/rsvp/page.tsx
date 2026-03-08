"use client";

import { useState } from "react";
import Link from "next/link";

export default function SharedRsvpPage() {
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Get the active event
    const eventRes = await fetch("/api/events");
    const eventData = await eventRes.json();

    if (!eventData.event) {
      setError("No active event found.");
      setLoading(false);
      return;
    }

    // Create or match guest
    const res = await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: eventData.event.id,
        name,
        inviteChannel: "MAIL",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      // Update RSVP status
      await fetch("/api/guests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data.guest.id, rsvpStatus: "CONFIRMED" }),
      });
      setSubmitted(true);
    } else {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-900 px-4 text-center">
        <div>
          <p className="mb-4 text-5xl">🎉</p>
          <h1 className="mb-2 text-2xl font-bold text-white">You&rsquo;re In!</h1>
          <p className="mb-6 text-stone-400">
            We can&rsquo;t wait to see you at The Great Soup Feast.
          </p>
          <Link
            href="/"
            className="rounded-lg bg-amber-500 px-6 py-3 font-medium text-stone-900 hover:bg-amber-400"
          >
            View Event Details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-900 px-4">
      <div className="w-full max-w-sm text-center">
        <p className="mb-4 text-5xl">🍲</p>
        <h1 className="mb-2 text-2xl font-bold text-white">The Great Soup Feast</h1>
        <p className="mb-8 text-stone-400">Enter your name to RSVP</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-3 text-center text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="Your name"
            required
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-500 px-6 py-3 font-semibold text-stone-900 hover:bg-amber-400 disabled:opacity-50"
          >
            {loading ? "Confirming..." : "I'm In!"}
          </button>
        </form>
      </div>
    </div>
  );
}
