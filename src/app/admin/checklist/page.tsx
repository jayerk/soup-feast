"use client";

import { useEffect, useState } from "react";

interface CheckItem {
  id: string;
  label: string;
  done: boolean;
}

export default function ChecklistPage() {
  const [items, setItems] = useState<CheckItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.event) {
        const soupCount = data.event._count?.soups || 25;
        const guestCount = data.event.capacity || 100;
        setItems(generateChecklist(soupCount, guestCount));
      }
      setLoading(false);
    }
    load();
  }, []);

  function generateChecklist(soupCount: number, guestCount: number): CheckItem[] {
    return [
      { id: "tables", label: `Set up ${Math.ceil(soupCount / 4)} tables for ${soupCount} soups`, done: false },
      { id: "labels", label: `Print ${soupCount} crockpot labels (number + name + dietary tags)`, done: false },
      { id: "bowls", label: `${guestCount + 20} tasting bowls (with extras)`, done: false },
      { id: "spoons", label: `${guestCount + 20} spoons (with extras)`, done: false },
      { id: "napkins", label: `${guestCount * 3} napkins (3 per person)`, done: false },
      { id: "cups", label: `${guestCount} cups for water/drinks`, done: false },
      { id: "qr_signs", label: "Print QR code signs for voting stations (at least 3)", done: false },
      { id: "qr_table", label: "Print individual QR codes per table (optional)", done: false },
      { id: "projector", label: "Projector/TV for leaderboard display", done: false },
      { id: "hdmi", label: "HDMI cable or casting device for leaderboard", done: false },
      { id: "extension", label: `${Math.ceil(soupCount / 2)} extension cords for crockpots`, done: false },
      { id: "power_strips", label: `${Math.ceil(soupCount / 4)} power strips`, done: false },
      { id: "serving", label: `${soupCount} serving ladles (one per crockpot)`, done: false },
      { id: "trash", label: "Trash bags and bins at each table", done: false },
      { id: "water", label: "Water station (palate cleanser)", done: false },
      { id: "bread", label: "Bread/crackers for palate cleansing (optional)", done: false },
      { id: "decor", label: "Table decorations / centerpieces", done: false },
      { id: "wifi", label: "Confirm WiFi access at venue", done: false },
      { id: "test_vote", label: "Test voting system with a test ballot", done: false },
      { id: "test_leaderboard", label: "Test leaderboard display on TV/projector", done: false },
    ];
  }

  function toggle(id: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  }

  if (loading) return <p className="text-stone-500">Loading...</p>;

  const doneCount = items.filter((i) => i.done).length;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Day-of Checklist</h1>
        <p className="text-sm text-stone-500">{doneCount} / {items.length} items complete</p>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <label
            key={item.id}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
              item.done ? "border-green-200 bg-green-50" : "border-stone-200 bg-white"
            }`}
          >
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => toggle(item.id)}
              className="h-4 w-4 rounded border-stone-300"
            />
            <span className={`text-sm ${item.done ? "text-green-700 line-through" : "text-stone-700"}`}>
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
