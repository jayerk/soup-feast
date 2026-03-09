"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface SoupIdea {
  name: string;
  category: string;
  vegan: boolean;
  effort: string;
  description: string;
}

const CATEGORIES = [
  { id: "classic_comfort", label: "Classic Comfort", color: "bg-parchment text-espresso" },
  { id: "around_the_world", label: "Around the World", color: "bg-terracotta/10 text-terracotta" },
  { id: "vegan_plant_based", label: "Vegan / Plant-Based", color: "bg-avocado/10 text-avocado" },
  { id: "weird_wonderful", label: "Weird & Wonderful", color: "bg-wine/10 text-wine" },
  { id: "crowd_pleaser", label: "Crowd Pleasers", color: "bg-harvest-gold/10 text-harvest-gold" },
];

const EFFORT_LABELS: Record<string, string> = {
  crockpot_and_forget: "Crockpot & Forget",
  some_love: "Some Love",
  showstopper: "Showstopper",
};

export default function IdeasPage() {
  const [soups, setSoups] = useState<SoupIdea[]>([]);
  const [mode, setMode] = useState<"wheel" | "prompt">("wheel");
  const [spinning, setSpinning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentIdea, setCurrentIdea] = useState<SoupIdea | null>(null);

  const [promptStep, setPromptStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SoupIdea[]>([]);

  useEffect(() => {
    fetch("/api/ideas")
      .then((res) => res.json())
      .then((data) => setSoups(data.soups || []))
      .catch(() => {});
  }, []);

  function spinWheel() {
    setSpinning(true);
    setCurrentIdea(null);

    const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    setSelectedCategory(cat.id);

    setTimeout(() => {
      const matches = soups.filter((s) => s.category === cat.id);
      if (matches.length > 0) {
        setCurrentIdea(matches[Math.floor(Math.random() * matches.length)]);
      }
      setSpinning(false);
    }, 1500);
  }

  function answerPrompt(answer: string) {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (newAnswers.length === 3) {
      let filtered = [...soups];
      if (newAnswers[0] === "vegan") {
        filtered = filtered.filter((s) => s.vegan);
      }
      if (newAnswers[1] === "adventurous") {
        filtered = filtered.filter(
          (s) => s.category === "around_the_world" || s.category === "weird_wonderful"
        );
      } else {
        filtered = filtered.filter(
          (s) => s.category === "classic_comfort" || s.category === "crowd_pleaser"
        );
      }
      if (newAnswers[2] !== "any") {
        filtered = filtered.filter((s) => s.effort === newAnswers[2]);
      }
      const shuffled = filtered.sort(() => Math.random() - 0.5);
      setSuggestions(shuffled.slice(0, 3));
      setPromptStep(3);
    } else {
      setPromptStep(newAnswers.length);
    }
  }

  function resetPrompt() {
    setPromptStep(0);
    setAnswers([]);
    setSuggestions([]);
  }

  const categoryMeta = CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className="text-xs tracking-[0.3em] uppercase text-taupe mb-4">Inspiration</p>
      <h2
        className="text-4xl font-bold text-espresso mb-2"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        What Should I Make?
      </h2>
      <p className="text-taupe mb-10" style={{ fontFamily: "var(--font-lora)" }}>
        Need a muse? Spin the wheel for serendipity, or answer a few questions for a tailored suggestion.
      </p>

      {/* Mode toggle */}
      <div className="mb-10 flex gap-3">
        <button
          onClick={() => setMode("wheel")}
          className={`px-4 py-2 text-xs uppercase tracking-[0.15em] border transition-colors ${
            mode === "wheel"
              ? "bg-espresso border-espresso text-cream"
              : "border-sand text-taupe hover:border-espresso hover:text-espresso"
          }`}
        >
          Spin the Wheel
        </button>
        <button
          onClick={() => { setMode("prompt"); resetPrompt(); }}
          className={`px-4 py-2 text-xs uppercase tracking-[0.15em] border transition-colors ${
            mode === "prompt"
              ? "bg-espresso border-espresso text-cream"
              : "border-sand text-taupe hover:border-espresso hover:text-espresso"
          }`}
        >
          Help Me Choose
        </button>
      </div>

      {mode === "wheel" && (
        <div className="text-center">
          {/* Wheel visualization */}
          <div className="relative mx-auto mb-8 flex h-64 w-64 items-center justify-center">
            <div
              className={`grid h-full w-full grid-cols-1 gap-px overflow-hidden rounded-full border-2 border-espresso ${
                spinning ? "animate-spin" : ""
              }`}
              style={{ animationDuration: spinning ? "0.3s" : "0s" }}
            >
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className={`flex items-center justify-center text-xs font-semibold tracking-wider ${cat.color} ${
                    selectedCategory === cat.id && !spinning ? "ring-2 ring-inset ring-wine" : ""
                  }`}
                  style={{ fontFamily: "var(--font-lora)" }}
                >
                  {cat.label}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={spinWheel}
            disabled={spinning || soups.length === 0}
            className="btn-vintage-filled disabled:opacity-50"
          >
            {spinning ? "Spinning..." : "Spin the Wheel"}
          </button>

          {currentIdea && (
            <div className="mt-10 card-editorial text-left">
              <div className="mb-3 flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 text-xs font-medium tracking-wider uppercase ${categoryMeta?.color}`}>
                  {categoryMeta?.label}
                </span>
                {currentIdea.vegan && (
                  <span className="px-2 py-0.5 text-xs font-medium tracking-wider uppercase bg-avocado/10 text-avocado">
                    Vegan
                  </span>
                )}
                <span className="px-2 py-0.5 text-xs text-taupe tracking-wider uppercase">
                  {EFFORT_LABELS[currentIdea.effort]}
                </span>
              </div>
              <h3
                className="text-2xl font-bold text-espresso"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {currentIdea.name}
              </h3>
              <p className="mt-2 text-taupe leading-relaxed" style={{ fontFamily: "var(--font-lora)" }}>
                {currentIdea.description}
              </p>
              <button
                onClick={spinWheel}
                className="mt-4 text-sm text-wine hover:underline"
                style={{ fontFamily: "var(--font-lora)" }}
              >
                Not feeling it? Spin again &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {mode === "prompt" && (
        <div>
          {promptStep === 0 && (
            <div className="card-editorial">
              <h3
                className="text-xl font-bold text-espresso mb-5"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                First &mdash; any dietary direction?
              </h3>
              <div className="flex gap-3">
                <button onClick={() => answerPrompt("vegan")} className="btn-vintage flex-1 text-center !border-avocado !text-avocado hover:!bg-avocado hover:!text-cream">
                  Vegan / Plant-Based
                </button>
                <button onClick={() => answerPrompt("any")} className="btn-vintage flex-1 text-center">
                  Anything Goes
                </button>
              </div>
            </div>
          )}

          {promptStep === 1 && (
            <div className="card-editorial">
              <h3
                className="text-xl font-bold text-espresso mb-5"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                What&rsquo;s your spirit?
              </h3>
              <div className="flex gap-3">
                <button onClick={() => answerPrompt("adventurous")} className="btn-vintage flex-1 text-center !border-wine !text-wine hover:!bg-wine hover:!text-cream">
                  Adventurous
                </button>
                <button onClick={() => answerPrompt("crowd_pleaser")} className="btn-vintage flex-1 text-center !border-harvest-gold !text-harvest-gold hover:!bg-harvest-gold hover:!text-cream">
                  Crowd Pleaser
                </button>
              </div>
            </div>
          )}

          {promptStep === 2 && (
            <div className="card-editorial">
              <h3
                className="text-xl font-bold text-espresso mb-5"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                How much effort are you willing to give?
              </h3>
              <div className="flex flex-col gap-3">
                <button onClick={() => answerPrompt("crockpot_and_forget")} className="btn-vintage text-left">
                  Crockpot &amp; Forget &mdash; Set it and show up
                </button>
                <button onClick={() => answerPrompt("some_love")} className="btn-vintage text-left">
                  Some Love &mdash; Worth the work
                </button>
                <button onClick={() => answerPrompt("showstopper")} className="btn-vintage text-left">
                  Showstopper &mdash; Go big or go home
                </button>
              </div>
            </div>
          )}

          {promptStep === 3 && (
            <div>
              {suggestions.length > 0 ? (
                <div className="space-y-6">
                  <h3
                    className="text-xl font-bold text-espresso"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    Our Recommendations
                  </h3>
                  <div className="w-8 h-px bg-harvest-gold" />
                  {suggestions.map((soup) => {
                    const cat = CATEGORIES.find((c) => c.id === soup.category);
                    return (
                      <div key={soup.name} className="card-editorial">
                        <div className="mb-3 flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 text-xs font-medium tracking-wider uppercase ${cat?.color}`}>
                            {cat?.label}
                          </span>
                          {soup.vegan && (
                            <span className="px-2 py-0.5 text-xs font-medium tracking-wider uppercase bg-avocado/10 text-avocado">
                              Vegan
                            </span>
                          )}
                          <span className="px-2 py-0.5 text-xs text-taupe tracking-wider uppercase">
                            {EFFORT_LABELS[soup.effort]}
                          </span>
                        </div>
                        <h4
                          className="text-xl font-bold text-espresso"
                          style={{ fontFamily: "var(--font-playfair)" }}
                        >
                          {soup.name}
                        </h4>
                        <p className="mt-2 text-taupe leading-relaxed" style={{ fontFamily: "var(--font-lora)" }}>
                          {soup.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-taupe italic" style={{ fontFamily: "var(--font-lora)" }}>
                    No matches for that combination &mdash; try different answers.
                  </p>
                </div>
              )}

              <button
                onClick={resetPrompt}
                className="btn-vintage mt-8"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-16 text-center border-t border-sand pt-10">
        <p className="text-taupe italic mb-4" style={{ fontFamily: "var(--font-lora)" }}>
          Found your inspiration?
        </p>
        <Link href="/signup" className="btn-vintage-filled">
          Register Your Soup
        </Link>
      </div>
    </div>
  );
}
