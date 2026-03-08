"use client";

import { useEffect, useState } from "react";

interface ArchiveEvent {
  id?: string;
  year: number;
  location: string;
  championSoup: string;
  championCook: string;
  runnerUpSoup: string;
  runnerUpCook: string;
  totalSoups: string;
  totalGuests: string;
  soupList: string;
}

export default function ArchiveManagePage() {
  const [archives, setArchives] = useState<ArchiveEvent[]>([]);
  const [form, setForm] = useState<ArchiveEvent>({
    year: 2024,
    location: "",
    championSoup: "",
    championCook: "",
    runnerUpSoup: "",
    runnerUpCook: "",
    totalSoups: "",
    totalGuests: "",
    soupList: "",
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchArchives();
  }, []);

  async function fetchArchives() {
    const res = await fetch("/api/archive");
    const data = await res.json();
    setArchives(data.archives || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        totalSoups: form.totalSoups ? parseInt(form.totalSoups as string) : null,
        totalGuests: form.totalGuests ? parseInt(form.totalGuests as string) : null,
        soupList: form.soupList ? (form.soupList as string).split(",").map((s: string) => s.trim()) : [],
      }),
    });
    setShowForm(false);
    fetchArchives();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Archive Manager</h1>
        <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-soup-red px-4 py-2 text-sm font-medium text-white hover:bg-red-800">
          Add Year
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-xl border border-stone-200 bg-white p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700">Year</label>
              <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })} className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700">Champion Soup</label>
              <input type="text" value={form.championSoup} onChange={(e) => setForm({ ...form, championSoup: e.target.value })} className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Champion Cook</label>
              <input type="text" value={form.championCook} onChange={(e) => setForm({ ...form, championCook: e.target.value })} className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700">Runner-Up Soup</label>
              <input type="text" value={form.runnerUpSoup} onChange={(e) => setForm({ ...form, runnerUpSoup: e.target.value })} className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Runner-Up Cook</label>
              <input type="text" value={form.runnerUpCook} onChange={(e) => setForm({ ...form, runnerUpCook: e.target.value })} className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700">Total Soups</label>
              <input type="number" value={form.totalSoups} onChange={(e) => setForm({ ...form, totalSoups: e.target.value })} className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Total Guests</label>
              <input type="number" value={form.totalGuests} onChange={(e) => setForm({ ...form, totalGuests: e.target.value })} className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Soup List (comma-separated)</label>
            <textarea value={form.soupList} onChange={(e) => setForm({ ...form, soupList: e.target.value })} className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2" rows={3} placeholder="Tomato Bisque, Chicken Noodle, French Onion..." />
          </div>
          <button type="submit" className="rounded-lg bg-soup-red px-4 py-2 text-sm font-medium text-white hover:bg-red-800">Save</button>
        </form>
      )}

      <div className="space-y-3">
        {archives.map((a: ArchiveEvent) => (
          <div key={a.id || a.year} className="rounded-xl border border-stone-200 bg-white p-5">
            <h3 className="font-semibold text-stone-900">Year {a.year}</h3>
            {a.championSoup && <p className="text-sm text-amber-600">Champion: {a.championSoup} by {a.championCook}</p>}
            {a.runnerUpSoup && <p className="text-sm text-stone-500">Runner-Up: {a.runnerUpSoup}</p>}
          </div>
        ))}
        {archives.length === 0 && (
          <p className="py-10 text-center text-stone-400">No archived years yet. Add years 1 & 2 to build the tradition.</p>
        )}
      </div>
    </div>
  );
}
