"use client";

import { useState } from "react";
import Link from "next/link";

const DIETARY_OPTIONS = [
  "vegan",
  "vegetarian",
  "gluten-free",
  "dairy-free",
  "contains nuts",
  "spicy",
];

export default function SoupSignup() {
  const [form, setForm] = useState({
    cookName: "",
    cookEmail: "",
    name: "",
    description: "",
    dietaryTags: [] as string[],
    surpriseEntry: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleTag(tag: string) {
    setForm((prev) => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter((t) => t !== tag)
        : [...prev.dietaryTags, tag],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Fetch the active event
    const eventRes = await fetch("/api/events");
    const eventData = await eventRes.json();

    if (!eventData.event) {
      setError("No active event found. Check back soon!");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/soups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        eventId: eventData.event.id,
      }),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <div className="max-w-md text-center">
          <p className="mb-4 text-5xl">🍲</p>
          <h1 className="mb-2 text-2xl font-bold text-stone-900">Soup Registered!</h1>
          <p className="mb-6 text-stone-500">
            Your soup &ldquo;{form.name}&rdquo; has been added to the lineup. The admin will confirm your entry soon.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/" className="rounded-lg bg-soup-red px-6 py-3 font-medium text-white hover:bg-red-800">
              Back to Home
            </Link>
            <Link href="/ideas" className="rounded-lg border border-stone-300 px-6 py-3 font-medium text-stone-700 hover:bg-stone-100">
              Browse Soup Ideas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-12">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="mb-6 inline-block text-sm text-stone-500 hover:text-stone-700">
          &larr; Back to home
        </Link>
        <h1 className="mb-2 text-3xl font-bold text-stone-900">Register Your Soup</h1>
        <p className="mb-8 text-stone-500">Think you&rsquo;ve got what it takes? Sign up below.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">About You</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">Your Name</label>
                <input
                  type="text"
                  value={form.cookName}
                  onChange={(e) => setForm({ ...form, cookName: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-soup-orange focus:outline-none focus:ring-1 focus:ring-soup-orange"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Email (for feedback after the event)</label>
                <input
                  type="email"
                  value={form.cookEmail}
                  onChange={(e) => setForm({ ...form, cookEmail: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-soup-orange focus:outline-none focus:ring-1 focus:ring-soup-orange"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Your Soup</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">Soup Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-soup-orange focus:outline-none focus:ring-1 focus:ring-soup-orange"
                  placeholder="e.g., Smoky Chipotle Butternut Squash"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Description (2-3 sentences)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-soup-orange focus:outline-none focus:ring-1 focus:ring-soup-orange"
                  rows={3}
                  placeholder="Tell people what makes your soup special..."
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
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
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
              <label className="flex items-center gap-2 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={form.surpriseEntry}
                  onChange={(e) => setForm({ ...form, surpriseEntry: e.target.checked })}
                  className="h-4 w-4 rounded border-stone-300"
                />
                Surprise entry — hide my soup name until the reveal!
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-soup-red px-6 py-3 font-semibold text-white hover:bg-red-800 disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register My Soup"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-400">
          Not sure what to make?{" "}
          <Link href="/ideas" className="text-soup-orange hover:underline">
            Get some ideas
          </Link>
        </p>
      </div>
    </div>
  );
}
