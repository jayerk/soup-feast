"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface EventData {
  id?: string;
  name: string;
  year: number;
  date: string;
  location: string;
  capacity: number;
  maxSoups: number;
  rankingDepth: number;
  tastingNotesEnabled: boolean;
}

const defaultEvent: EventData = {
  name: "The Great Soup Feast 2026",
  year: 2026,
  date: "2026-11-21",
  location: "",
  capacity: 100,
  maxSoups: 25,
  rankingDepth: 5,
  tastingNotesEnabled: true,
};

export default function EventSetup() {
  const [event, setEvent] = useState<EventData>(defaultEvent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.event) {
          setEvent({
            ...data.event,
            date: data.event.date.split("T")[0],
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const method = event.id ? "PUT" : "POST";
    const res = await fetch("/api/events", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });

    if (res.ok) {
      const data = await res.json();
      setEvent({ ...event, id: data.event.id });
      setMessage("Event saved successfully!");
      router.refresh();
    } else {
      setMessage("Failed to save event.");
    }
    setSaving(false);
  }

  if (loading) {
    return <p className="text-stone-500">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Event Setup</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Event Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700">Event Name</label>
              <input
                type="text"
                value={event.name}
                onChange={(e) => setEvent({ ...event, name: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-soup-orange focus:outline-none focus:ring-1 focus:ring-soup-orange"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">Year</label>
                <input
                  type="number"
                  value={event.year}
                  onChange={(e) => setEvent({ ...event, year: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-soup-orange focus:outline-none focus:ring-1 focus:ring-soup-orange"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Date</label>
                <input
                  type="date"
                  value={event.date}
                  onChange={(e) => setEvent({ ...event, date: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-soup-orange focus:outline-none focus:ring-1 focus:ring-soup-orange"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700">Location</label>
              <input
                type="text"
                value={event.location}
                onChange={(e) => setEvent({ ...event, location: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-soup-orange focus:outline-none focus:ring-1 focus:ring-soup-orange"
                required
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Configuration</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">Capacity</label>
                <input
                  type="number"
                  value={event.capacity}
                  onChange={(e) => setEvent({ ...event, capacity: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-soup-orange focus:outline-none focus:ring-1 focus:ring-soup-orange"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Max Soups</label>
                <input
                  type="number"
                  value={event.maxSoups}
                  onChange={(e) => setEvent({ ...event, maxSoups: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-soup-orange focus:outline-none focus:ring-1 focus:ring-soup-orange"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Ranking Depth</label>
                <input
                  type="number"
                  value={event.rankingDepth}
                  onChange={(e) => setEvent({ ...event, rankingDepth: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-soup-orange focus:outline-none focus:ring-1 focus:ring-soup-orange"
                  min={1}
                  max={10}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="tastingNotes"
                checked={event.tastingNotesEnabled}
                onChange={(e) => setEvent({ ...event, tastingNotesEnabled: e.target.checked })}
                className="h-4 w-4 rounded border-stone-300"
              />
              <label htmlFor="tastingNotes" className="text-sm font-medium text-stone-700">
                Enable tasting notes
              </label>
            </div>
          </div>
        </div>

        {message && (
          <p className={`text-sm ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-soup-red px-6 py-3 font-medium text-white hover:bg-red-800 disabled:opacity-50"
        >
          {saving ? "Saving..." : event.id ? "Update Event" : "Create Event"}
        </button>
      </form>
    </div>
  );
}
