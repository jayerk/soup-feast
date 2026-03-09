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
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-taupe italic" style={{ fontFamily: "var(--font-lora)" }}>
          Loading your tasting experience...
        </p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Progress header */}
      <div className="border-b border-sand bg-parchment px-6 py-6 text-center">
        <h2
          className="text-2xl font-bold text-espresso"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Tasting Time
        </h2>
        <p className="mt-1 text-sm text-taupe" style={{ fontFamily: "var(--font-lora)" }}>
          You&rsquo;ve tried {triedSoups.size} of {soups.length} soups
        </p>
        <div className="mt-3 mx-auto max-w-xs h-2 overflow-hidden bg-sand">
          <div
            className="h-full bg-harvest-gold transition-all"
            style={{ width: `${(triedSoups.size / Math.max(soups.length, 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Browse mode selector */}
      <div className="flex gap-2 overflow-x-auto px-6 py-4">
        {([
          { mode: "by_table" as BrowseMode, label: "By Table" },
          { mode: "by_vibe" as BrowseMode, label: "By Vibe" },
          { mode: "surprise_me" as BrowseMode, label: "Surprise Me" },
        ]).map((m) => (
          <button
            key={m.mode}
            onClick={() => { setBrowseMode(m.mode); setSurpriseIndex(0); }}
            className={`shrink-0 px-4 py-2 text-xs uppercase tracking-[0.15em] border transition-colors ${
              browseMode === m.mode
                ? "bg-espresso border-espresso text-cream"
                : "border-sand text-taupe hover:border-espresso hover:text-espresso"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Vibe filter */}
      {browseMode === "by_vibe" && (
        <div className="flex gap-2 overflow-x-auto px-6 pb-4">
          {VIBE_FILTERS.map((vibe) => (
            <button
              key={vibe.id}
              onClick={() => setVibeFilter(vibeFilter === vibe.id ? null : vibe.id)}
              className={`shrink-0 px-3 py-1 text-xs uppercase tracking-wider border transition-colors ${
                vibeFilter === vibe.id
                  ? "bg-harvest-gold border-harvest-gold text-cream"
                  : "border-sand text-taupe hover:border-espresso"
              }`}
            >
              {vibe.label}
            </button>
          ))}
        </div>
      )}

      {/* Soup cards */}
      <div className="px-6">
        {browseMode === "surprise_me" ? (
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
          <div className="space-y-4">
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
      <div className="fixed bottom-0 left-0 right-0 border-t border-sand bg-cream p-4">
        {canVote ? (
          <Link
            href={`/taste/${token}/vote`}
            className="btn-vintage-filled block w-full text-center"
          >
            Ready to Vote ({triedSoups.size} soups tried)
          </Link>
        ) : (
          <button
            disabled
            className="w-full py-3 text-center text-xs uppercase tracking-[0.15em] text-taupe border border-sand"
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
    <div className={`card-editorial ${tried ? "border-avocado/30 bg-avocado/5" : ""}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-sand text-lg font-bold text-espresso"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {soup.number || "?"}
          </span>
          <div>
            <h3
              className="text-lg font-bold text-espresso"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {soup.surpriseEntry ? "Mystery Soup" : soup.name}
            </h3>
            <p className="text-sm text-taupe italic" style={{ fontFamily: "var(--font-lora)" }}>
              by {soup.cookName}
            </p>
          </div>
        </div>
        {tried && (
          <span className="text-xs tracking-[0.15em] uppercase text-avocado">Tried</span>
        )}
      </div>

      <p className="mt-2 text-sm text-taupe leading-relaxed" style={{ fontFamily: "var(--font-lora)" }}>
        {soup.description}
      </p>

      {soup.dietaryTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {soup.dietaryTags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 text-xs text-avocado bg-avocado/10 tracking-wider uppercase">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {!tried && (
          <button
            onClick={onTried}
            className="btn-vintage-filled !py-2 !px-4 !text-xs"
          >
            Tried It
          </button>
        )}
        {onSkip && !tried && (
          <button
            onClick={onSkip}
            className="btn-vintage !py-2 !px-4 !text-xs"
          >
            Skip for Now
          </button>
        )}
      </div>
    </div>
  );
}
