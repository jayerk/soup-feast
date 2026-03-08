"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Soup {
  id: string;
  name: string;
  cookName: string;
  description: string;
  dietaryTags: string[];
  number: number | null;
  surpriseEntry: boolean;
}

type BrowseMode = "by_table" | "by_vibe" | "surprise_me";

const VIBE_FILTERS = [
  { id: "comfort", label: "Comfort", tags: ["hearty", "savory"] },
  { id: "adventurous", label: "Adventurous", tags: [] },
  { id: "light", label: "Light & Fresh", tags: ["dairy-free", "vegetarian"] },
  { id: "spicy", label: "Spicy", tags: ["spicy"] },
  { id: "vegan", label: "Vegan / Plant-Based", tags: ["vegan"] },
];

export default function TastingPage() {
  const params = useParams();
  const token = params.token as string;
  const [soups, setSoups] = useState<Soup[]>([]);
  const [triedSoups, setTriedSoups] = useState<Set<string>>(new Set());
  const [browseMode, setBrowseMode] = useState<BrowseMode>("by_table");
  const [vibeFilter, setVibeFilter] = useState<string | null>(null);
  const [surpriseIndex, setSurpriseIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [eventId, setEventId] = useState("");

  useEffect(() => {
    async function load() {
      const eventRes = await fetch("/api/events");
      const eventData = await eventRes.json();
      if (!eventData.event) { setLoading(false); return; }
      setEventId(eventData.event.id);

      const soupsRes = await fetch(`/api/soups?eventId=${eventData.event.id}`);
      const soupsData = await soupsRes.json();
      setSoups(soupsData.soups.filter((s: Soup) => s.number !== null || true));

      // Load tried soups
      const logRes = await fetch(`/api/tasting-logs?token=${token}`);
      const logData = await logRes.json();
      setTriedSoups(new Set(logData.triedSoupIds || []));
      setLoading(false);
    }
    load();
  }, [token]);

  async function markTried(soupId: string) {
    setTriedSoups((prev) => new Set([...prev, soupId]));
    await fetch("/api/tasting-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestToken: token, soupId, eventId, browseMode }),
    });
  }

  function getFilteredSoups(): Soup[] {
    if (browseMode === "by_table") {
      return [...soups].sort((a, b) => (a.number || 99) - (b.number || 99));
    }
    if (browseMode === "by_vibe" && vibeFilter) {
      const filter = VIBE_FILTERS.find((f) => f.id === vibeFilter);
      if (filter && filter.tags.length > 0) {
        return soups.filter((s) =>
          s.dietaryTags.some((t) => filter.tags.includes(t))
        );
      }
      return soups;
    }
    return soups;
  }

  const filteredSoups = getFilteredSoups();
  const canVote = triedSoups.size >= 5;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-stone-400">Loading your tasting experience...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Header */}
      <div className="bg-stone-900 px-4 py-6 text-center text-white">
        <h1 className="text-xl font-bold text-amber-400">Tasting Time</h1>
        <p className="mt-1 text-sm text-stone-400">
          You&rsquo;ve tried {triedSoups.size} of {soups.length} soups
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-700">
          <div
            className="h-full rounded-full bg-amber-400 transition-all"
            style={{ width: `${(triedSoups.size / Math.max(soups.length, 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Browse mode selector */}
      <div className="flex gap-2 overflow-x-auto px-4 py-4">
        {([
          { mode: "by_table" as BrowseMode, label: "By Table" },
          { mode: "by_vibe" as BrowseMode, label: "By Vibe" },
          { mode: "surprise_me" as BrowseMode, label: "Surprise Me" },
        ]).map((m) => (
          <button
            key={m.mode}
            onClick={() => { setBrowseMode(m.mode); setSurpriseIndex(0); }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              browseMode === m.mode
                ? "bg-stone-900 text-white"
                : "bg-white text-stone-600 ring-1 ring-stone-200"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Vibe filter */}
      {browseMode === "by_vibe" && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-4">
          {VIBE_FILTERS.map((vibe) => (
            <button
              key={vibe.id}
              onClick={() => setVibeFilter(vibeFilter === vibe.id ? null : vibe.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                vibeFilter === vibe.id
                  ? "bg-amber-500 text-stone-900"
                  : "bg-stone-100 text-stone-600"
              }`}
            >
              {vibe.label}
            </button>
          ))}
        </div>
      )}

      {/* Soup cards */}
      <div className="px-4">
        {browseMode === "surprise_me" ? (
          // Single card at a time
          soups.length > 0 && (
            <div>
              {(() => {
                const untried = soups.filter((s) => !triedSoups.has(s.id));
                const soup = untried[surpriseIndex % Math.max(untried.length, 1)] || soups[0];
                return (
                  <SoupCard
                    key={soup.id}
                    soup={soup}
                    tried={triedSoups.has(soup.id)}
                    onTried={() => markTried(soup.id)}
                    onSkip={() => setSurpriseIndex((i) => i + 1)}
                  />
                );
              })()}
            </div>
          )
        ) : (
          <div className="space-y-3">
            {filteredSoups.map((soup) => (
              <SoupCard
                key={soup.id}
                soup={soup}
                tried={triedSoups.has(soup.id)}
                onTried={() => markTried(soup.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Vote button */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-stone-200 bg-white p-4">
        {canVote ? (
          <Link
            href={`/taste/${token}/vote`}
            className="block w-full rounded-lg bg-soup-red py-3 text-center font-semibold text-white hover:bg-red-800"
          >
            Ready to Vote ({triedSoups.size} soups tried)
          </Link>
        ) : (
          <button
            disabled
            className="w-full rounded-lg bg-stone-200 py-3 text-center font-medium text-stone-400"
          >
            Try at least 5 soups before voting ({triedSoups.size}/5)
          </button>
        )}
      </div>
    </div>
  );
}

function SoupCard({
  soup,
  tried,
  onTried,
  onSkip,
}: {
  soup: Soup;
  tried: boolean;
  onTried: () => void;
  onSkip?: () => void;
}) {
  return (
    <div className={`rounded-xl border bg-white p-5 ${tried ? "border-green-200 bg-green-50/50" : "border-stone-200"}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg font-bold text-amber-800">
            {soup.number || "?"}
          </span>
          <div>
            <h3 className="text-lg font-semibold text-stone-900">
              {soup.surpriseEntry ? "Mystery Soup" : soup.name}
            </h3>
            <p className="text-sm text-stone-500">by {soup.cookName}</p>
          </div>
        </div>
        {tried && <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">Tried</span>}
      </div>

      <p className="mt-2 text-sm text-stone-600">{soup.description}</p>

      {soup.dietaryTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {soup.dietaryTags.map((tag) => (
            <span key={tag} className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {!tried && (
          <button
            onClick={onTried}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-stone-900 hover:bg-amber-400"
          >
            Tried It!
          </button>
        )}
        {onSkip && !tried && (
          <button
            onClick={onSkip}
            className="rounded-lg bg-stone-100 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-200"
          >
            Skip for Now
          </button>
        )}
      </div>
    </div>
  );
}
