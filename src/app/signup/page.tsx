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
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p
          className="text-5xl font-bold text-wine mb-4"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Splendid.
        </p>
        <div className="w-12 h-px bg-harvest-gold mx-auto mb-6" />
        <p className="text-espresso mb-2" style={{ fontFamily: "var(--font-lora)" }}>
          Your soup &ldquo;{form.name}&rdquo; has been added to the lineup.
        </p>
        <p className="text-taupe text-sm mb-8" style={{ fontFamily: "var(--font-lora)" }}>
          The organizer will confirm your entry soon.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-vintage-filled">
            Back to Home
          </Link>
          <Link href="/ideas" className="btn-vintage">
            Browse More Ideas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <p className="text-xs tracking-[0.3em] uppercase text-taupe mb-4">For the Cooks</p>
      <h2
        className="text-4xl font-bold text-espresso mb-2"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        Register Your Soup
      </h2>
      <p className="text-taupe mb-10" style={{ fontFamily: "var(--font-lora)" }}>
        Think you&rsquo;ve got what it takes? Tell us what you&rsquo;re bringing.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* About You */}
        <div className="card-editorial">
          <h3
            className="text-lg font-bold text-espresso mb-1"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            The Cook
          </h3>
          <div className="w-8 h-px bg-sand mb-5" />
          <div className="space-y-4">
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-taupe mb-1">Your Name</label>
              <input
                type="text"
                value={form.cookName}
                onChange={(e) => setForm({ ...form, cookName: e.target.value })}
                className="input-vintage"
                required
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-taupe mb-1">
                Email <span className="normal-case tracking-normal">(for feedback after the event)</span>
              </label>
              <input
                type="email"
                value={form.cookEmail}
                onChange={(e) => setForm({ ...form, cookEmail: e.target.value })}
                className="input-vintage"
              />
            </div>
          </div>
        </div>

        {/* Your Soup */}
        <div className="card-editorial">
          <h3
            className="text-lg font-bold text-espresso mb-1"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            The Soup
          </h3>
          <div className="w-8 h-px bg-sand mb-5" />
          <div className="space-y-4">
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-taupe mb-1">Soup Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-vintage"
                placeholder="e.g., Smoky Chipotle Butternut Squash"
                required
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-taupe mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-vintage"
                rows={3}
                placeholder="Tell people what makes your soup special..."
                required
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-taupe mb-3">Dietary Tags</label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`border px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                      form.dietaryTags.includes(tag)
                        ? "bg-avocado border-avocado text-cream"
                        : "border-sand text-taupe hover:border-espresso hover:text-espresso"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-3 text-sm text-espresso cursor-pointer" style={{ fontFamily: "var(--font-lora)" }}>
              <input
                type="checkbox"
                checked={form.surpriseEntry}
                onChange={(e) => setForm({ ...form, surpriseEntry: e.target.checked })}
                className="h-4 w-4 border-sand accent-wine"
              />
              Surprise entry &mdash; hide my soup name until the reveal
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-wine">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-vintage-filled w-full text-center disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register My Soup"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-taupe" style={{ fontFamily: "var(--font-lora)" }}>
        Not sure what to make?{" "}
        <Link href="/ideas" className="text-wine hover:underline">
          Get some ideas
        </Link>
      </p>
    </div>
  );
}
