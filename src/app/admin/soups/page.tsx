"use client";

import { useEffect, useState } from "react";

interface Soup {
  id: string;
  name: string;
  cookName: string;
  cookEmail: string | null;
  description: string;
  dietaryTags: string[];
  surpriseEntry: boolean;
  number: number | null;
  status: string;
}

interface Event {
  id: string;
  maxSoups: number;
}

const DIETARY_OPTIONS = ["vegan", "vegetarian", "gluten-free", "dairy-free", "contains nuts", "spicy"];

export default function SoupsPage() {
  const [soups, setSoups] = useState<Soup[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSoup, setEditingSoup] = useState<Soup | null>(null);
  const [form, setForm] = useState({
    name: "",
    cookName: "",
    cookEmail: "",
    description: "",
    dietaryTags: [] as string[],
    surpriseEntry: false,
    number: "",
    status: "CONFIRMED",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const eventRes = await fetch("/api/events");
    const eventData = await eventRes.json();
    if (eventData.event) {
      setEvent(eventData.event);
      const soupsRes = await fetch(`/api/soups?eventId=${eventData.event.id}`);
      const soupsData = await soupsRes.json();
      setSoups(soupsData.soups);
    }
  }

  function resetForm() {
    setForm({ name: "", cookName: "", cookEmail: "", description: "", dietaryTags: [], surpriseEntry: false, number: "", status: "CONFIRMED" });
    setEditingSoup(null);
    setShowForm(false);
  }

  function startEdit(soup: Soup) {
    setForm({
      name: soup.name,
      cookName: soup.cookName,
      cookEmail: soup.cookEmail || "",
      description: soup.description,
      dietaryTags: soup.dietaryTags,
      surpriseEntry: soup.surpriseEntry,
      number: soup.number?.toString() || "",
      status: soup.status,
    });
    setEditingSoup(soup);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;

    const payload = {
      ...form,
      eventId: event.id,
      number: form.number ? parseInt(form.number) : null,
      id: editingSoup?.id,
    };

    const method = editingSoup ? "PUT" : "POST";
    await fetch("/api/soups", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    resetForm();
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this soup?")) return;
    await fetch("/api/soups", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  }

  function toggleTag(tag: string) {
    setForm((prev) => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter((t) => t !== tag)
        : [...prev.dietaryTags, tag],
    }));
  }

  const statusColors: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-800",
    TENTATIVE: "bg-yellow-100 text-yellow-800",
    WITHDRAWN: "bg-red-100 text-red-800",
  };

  if (!event) {
    return (
      <div className="py-10 text-center text-stone-500">
        <p>Create an event first to manage soups.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Soup Roster</h1>
          <p className="text-sm text-stone-500">{soups.length} / {event.maxSoups} soups registered</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="rounded-lg bg-soup-red px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Add Soup
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">{editingSoup ? "Edit Soup" : "Add New Soup"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">Soup Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-soup-orange focus:outline-none focus:ring-1 focus:ring-soup-orange"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Cook Name</label>
                <input
                  type="text"
                  value={form.cookName}
                  onChange={(e) => setForm({ ...form, cookName: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-soup-orange focus:outline-none focus:ring-1 focus:ring-soup-orange"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">Cook Email (optional)</label>
                <input
                  type="email"
                  value={form.cookEmail}
                  onChange={(e) => setForm({ ...form, cookEmail: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-soup-orange focus:outline-none focus:ring-1 focus:ring-soup-orange"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Crockpot #</label>
                <input
                  type="number"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-soup-orange focus:outline-none focus:ring-1 focus:ring-soup-orange"
                  min={1}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-soup-orange focus:outline-none focus:ring-1 focus:ring-soup-orange"
                rows={2}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">Dietary Tags</label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      form.dietaryTags.includes(tag)
                        ? "bg-green-600 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="CONFIRMED">Confirmed</option>
                <option value="TENTATIVE">Tentative</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.surpriseEntry}
                  onChange={(e) => setForm({ ...form, surpriseEntry: e.target.checked })}
                  className="h-4 w-4 rounded border-stone-300"
                />
                Surprise entry
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-soup-red px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
              >
                {editingSoup ? "Update" : "Add Soup"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Soup list */}
      <div className="space-y-3">
        {soups.length === 0 ? (
          <p className="py-10 text-center text-stone-400">No soups registered yet.</p>
        ) : (
          soups.map((soup) => (
            <div key={soup.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800">
                    {soup.number || "?"}
                  </span>
                  <div>
                    <h3 className="font-semibold text-stone-900">
                      {soup.surpriseEntry ? "??? (Surprise Entry)" : soup.name}
                    </h3>
                    <p className="text-sm text-stone-500">by {soup.cookName}</p>
                    <p className="mt-1 text-sm text-stone-600">{soup.description}</p>
                    {soup.dietaryTags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {soup.dietaryTags.map((tag) => (
                          <span key={tag} className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[soup.status]}`}>
                    {soup.status.toLowerCase()}
                  </span>
                  <button onClick={() => startEdit(soup)} className="text-sm text-stone-400 hover:text-stone-700">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(soup.id)} className="text-sm text-red-400 hover:text-red-600">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
