"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function PersonalRsvpPage() {
  const params = useParams();
  const token = params.token as string;
  const [guest, setGuest] = useState<{ name: string; rsvpStatus: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/guests/by-token/${token}`)
      .then((res) => res.json())
      .then((data) => {
        setGuest(data.guest || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  async function handleRsvp(status: string) {
    setUpdating(true);
    await fetch(`/api/guests/by-token/${token}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rsvpStatus: status }),
    });
    setGuest((prev) => prev ? { ...prev, rsvpStatus: status } : prev);
    setUpdating(false);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-taupe italic" style={{ fontFamily: "var(--font-lora)" }}>Loading...</p>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-taupe mb-4" style={{ fontFamily: "var(--font-lora)" }}>Invalid invite link.</p>
        <Link href="/" className="btn-vintage">Go to Homepage</Link>
      </div>
    );
  }

  const isConfirmed = guest.rsvpStatus === "CONFIRMED";
  const isDeclined = guest.rsvpStatus === "DECLINED";

  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <p className="text-xs tracking-[0.3em] uppercase text-taupe mb-6">Personal Invitation</p>
      <h2
        className="text-4xl font-bold text-espresso mb-2"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        Hello, {guest.name}.
      </h2>
      <p className="text-taupe mb-10" style={{ fontFamily: "var(--font-lora)" }}>
        You&rsquo;re invited to The Great Soup Feast.
      </p>

      {isConfirmed ? (
        <div>
          <p
            className="text-xl font-bold text-avocado mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            You&rsquo;re confirmed.
          </p>
          <div className="w-8 h-px bg-sand mx-auto mb-4" />
          <button
            onClick={() => handleRsvp("DECLINED")}
            disabled={updating}
            className="text-sm text-taupe hover:text-espresso"
            style={{ fontFamily: "var(--font-lora)" }}
          >
            Changed your mind? Cancel RSVP
          </button>
        </div>
      ) : isDeclined ? (
        <div>
          <p className="text-taupe mb-6 italic" style={{ fontFamily: "var(--font-lora)" }}>
            You declined this invite.
          </p>
          <button
            onClick={() => handleRsvp("CONFIRMED")}
            disabled={updating}
            className="btn-vintage-filled"
          >
            Changed Your Mind? Count Me In
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleRsvp("CONFIRMED")}
            disabled={updating}
            className="btn-vintage-filled disabled:opacity-50"
          >
            Count Me In
          </button>
          <button
            onClick={() => handleRsvp("DECLINED")}
            disabled={updating}
            className="btn-vintage disabled:opacity-50"
          >
            Can&rsquo;t Make It
          </button>
        </div>
      )}

      <div className="mt-10">
        <Link
          href="/"
          className="text-sm text-taupe hover:text-espresso"
          style={{ fontFamily: "var(--font-lora)" }}
        >
          View event details &rarr;
        </Link>
      </div>
    </div>
  );
}
