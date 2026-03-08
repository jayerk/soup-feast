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
      <div className="flex min-h-screen items-center justify-center bg-stone-900">
        <p className="text-stone-400">Loading...</p>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-900 px-4 text-center">
        <div>
          <p className="mb-4 text-stone-400">Invalid invite link.</p>
          <Link href="/" className="text-amber-400 hover:underline">Go to homepage</Link>
        </div>
      </div>
    );
  }

  const isConfirmed = guest.rsvpStatus === "CONFIRMED";
  const isDeclined = guest.rsvpStatus === "DECLINED";

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-900 px-4">
      <div className="w-full max-w-sm text-center">
        <p className="mb-4 text-5xl">🍲</p>
        <h1 className="mb-2 text-2xl font-bold text-white">
          Hey {guest.name}!
        </h1>
        <p className="mb-8 text-stone-400">
          You&rsquo;re invited to The Great Soup Feast.
        </p>

        {isConfirmed ? (
          <div>
            <p className="mb-4 text-lg font-semibold text-green-400">You&rsquo;re confirmed!</p>
            <button
              onClick={() => handleRsvp("DECLINED")}
              disabled={updating}
              className="text-sm text-stone-500 hover:text-stone-300"
            >
              Changed your mind? Cancel RSVP
            </button>
          </div>
        ) : isDeclined ? (
          <div>
            <p className="mb-4 text-stone-400">You declined this invite.</p>
            <button
              onClick={() => handleRsvp("CONFIRMED")}
              disabled={updating}
              className="rounded-lg bg-amber-500 px-6 py-3 font-semibold text-stone-900 hover:bg-amber-400"
            >
              Changed your mind? I&rsquo;m In!
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleRsvp("CONFIRMED")}
              disabled={updating}
              className="rounded-lg bg-amber-500 px-6 py-3 font-semibold text-stone-900 hover:bg-amber-400 disabled:opacity-50"
            >
              I&rsquo;m In!
            </button>
            <button
              onClick={() => handleRsvp("DECLINED")}
              disabled={updating}
              className="rounded-lg border border-stone-700 px-6 py-3 font-semibold text-stone-300 hover:bg-stone-800 disabled:opacity-50"
            >
              Can&rsquo;t Make It
            </button>
          </div>
        )}

        <Link href="/" className="mt-8 inline-block text-sm text-stone-500 hover:text-stone-300">
          View event details
        </Link>
      </div>
    </div>
  );
}
