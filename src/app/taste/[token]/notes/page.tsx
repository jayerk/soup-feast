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

interface Note {
  soupId: string;
  rating: number;
  flavorTags: string[];
  noteText: string;
}

const FLAVOR_TAGS = ["savory", "sweet", "spicy", "creamy", "hearty", "light", "umami", "smoky"];

export default function TastingNotesPage() {
  const params = useParams();
  const token = params.token as string;
  const [soups, setSoups] = useState<Soup[]>([]);
  const [notes, setNotes] = useState<Record<string, Note>>({});
  const [activeSoup, setActiveSoup] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const eventRes = await fetch("/api/events");
      const eventData = await eventRes.json();
      if (!eventData.event) { setLoading(false); return; }

      const [soupsRes, logsRes, notesRes] = await Promise.all([
        fetch(`/api/soups?eventId=${eventData.event.id}`),
        fetch(`/api/tasting-logs?token=${token}`),
        fetch(`/api/tasting-notes?token=${token}`),
      ]);

      const soupsData = await soupsRes.json();
      const logsData = await logsRes.json();
      const notesData = await notesRes.json();

      const triedIds = new Set(logsData.triedSoupIds || []);
      setSoups(soupsData.soups.filter((s: Soup) => triedIds.has(s.id)));

      const noteMap: Record<string, Note> = {};
      for (const n of notesData.notes || []) {
        noteMap[n.soupId] = n;
      }
      setNotes(noteMap);
      setLoading(false);
    }
    load();
  }, [token]);

  async function saveNote(soupId: string, rating: number, flavorTags: string[], noteText: string) {
    setNotes((prev) => ({ ...prev, [soupId]: { soupId, rating, flavorTags, noteText } }));

    await fetch("/api/tasting-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestToken: token, soupId, rating, flavorTags, noteText }),
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-stone-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-8">
      <div className="mx-auto max-w-lg">
        <Link href={`/taste/${token}`} className="mb-4 inline-block text-sm text-stone-500 hover:text-stone-700">
          &larr; Back to tasting
        </Link>
        <h1 className="mb-2 text-2xl font-bold text-stone-900">Tasting Notes</h1>
        <p className="mb-6 text-sm text-stone-500">
          Rate the soups you tried. Notes are private — cooks get an anonymized summary.
        </p>

        <div className="space-y-3">
          {soups.map((soup) => {
            const note = notes[soup.id];
            const isActive = activeSoup === soup.id;

            return (
              <div key={soup.id} className="rounded-xl border border-stone-200 bg-white">
                <button
                  onClick={() => setActiveSoup(isActive ? null : soup.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800">
                    {soup.number || "?"}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-stone-900">{soup.name}</p>
                    <p className="text-xs text-stone-500">by {soup.cookName}</p>
                  </div>
                  {note && (
                    <span className="text-sm text-amber-500">
                      {"🥣".repeat(note.rating)}
                    </span>
                  )}
                </button>

                {isActive && (
                  <NoteEditor
                    note={note}
                    onSave={(rating, tags, text) => saveNote(soup.id, rating, tags, text)}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link href="/leaderboard" className="text-sm text-soup-orange hover:underline">
            See the leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function NoteEditor({
  note,
  onSave,
}: {
  note?: Note;
  onSave: (rating: number, tags: string[], text: string) => void;
}) {
  const [rating, setRating] = useState(note?.rating || 0);
  const [tags, setTags] = useState<string[]>(note?.flavorTags || []);
  const [text, setText] = useState(note?.noteText || "");

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function handleSave() {
    if (rating === 0) return;
    onSave(rating, tags, text);
  }

  return (
    <div className="border-t border-stone-100 px-4 py-4">
      {/* Rating */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-stone-500">Rating</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              className={`text-2xl transition-transform ${n <= rating ? "scale-110" : "opacity-30"}`}
            >
              🥣
            </button>
          ))}
        </div>
      </div>

      {/* Flavor tags */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-stone-500">Flavor Tags</p>
        <div className="flex flex-wrap gap-1">
          {FLAVOR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                tags.includes(tag)
                  ? "bg-amber-500 text-white"
                  : "bg-stone-100 text-stone-600"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Note text */}
      <div className="mb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 140))}
          className="block w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
          rows={2}
          maxLength={140}
          placeholder="Quick thoughts? (140 chars)"
        />
        <p className="mt-1 text-right text-xs text-stone-400">{text.length}/140</p>
      </div>

      <button
        onClick={handleSave}
        disabled={rating === 0}
        className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-stone-900 hover:bg-amber-400 disabled:opacity-50"
      >
        Save Note
      </button>
    </div>
  );
}
