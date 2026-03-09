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

    const eventRes = await fetch("/api/events");
    const eventData = await eventRes.json();

    if (!eventData.event) {
      setError("No active event found.");
      setLoading(false);
      return;
    }

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
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <p
          className="text-5xl font-bold text-wine mb-4"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          You&rsquo;re In.
        </p>
        <div className="w-12 h-px bg-harvest-gold mx-auto mb-6" />
        <p className="text-espresso mb-8" style={{ fontFamily: "var(--font-lora)" }}>
          We can&rsquo;t wait to see you at The Great Soup Feast.
        </p>
        <Link href="/" className="btn-vintage">
          View Event Details
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <p className="text-xs tracking-[0.3em] uppercase text-taupe mb-6">You&rsquo;re Invited</p>
      <h2
        className="text-4xl font-bold text-espresso mb-2"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        Join the Feast
      </h2>
      <p className="text-taupe mb-10" style={{ fontFamily: "var(--font-lora)" }}>
        Enter your name to reserve your seat at the table.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-vintage text-center"
          placeholder="Your name"
          required
        />

        {error && <p className="text-sm text-wine">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-vintage-filled w-full text-center disabled:opacity-50"
        >
          {loading ? "Confirming..." : "Count Me In"}
        </button>
      </form>

      <div className="mt-10 text-center text-harvest-gold text-xs tracking-[0.5em]">◆</div>

      <p className="mt-6 text-sm text-taupe italic" style={{ fontFamily: "var(--font-lora)" }}>
        Bringing a soup?{" "}
        <Link href="/signup" className="text-wine hover:underline">
          Register it here
        </Link>
      </p>
    </div>
  );
}
