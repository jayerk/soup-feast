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
  { id: "classic_comfort", label: "Classic Comfort", color: "bg-amber-100 text-amber-800" },
  { id: "around_the_world", label: "Around the World", color: "bg-blue-100 text-blue-800" },
  { id: "vegan_plant_based", label: "Vegan / Plant-Based", color: "bg-green-100 text-green-800" },
  { id: "weird_wonderful", label: "Weird & Wonderful", color: "bg-purple-100 text-purple-800" },
  { id: "crowd_pleaser", label: "Crowd Pleasers", color: "bg-red-100 text-red-800" },
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

  // Prompt mode state
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

    // Pick random category
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
      // Filter soups based on answers
      let filtered = [...soups];

      // Q1: Vegan or anything?
      if (newAnswers[0] === "vegan") {
        filtered = filtered.filter((s) => s.vegan);
      }

      // Q2: Adventurous or crowd-pleaser?
      if (newAnswers[1] === "adventurous") {
        filtered = filtered.filter(
          (s) => s.category === "around_the_world" || s.category === "weird_wonderful"
        );
      } else {
        filtered = filtered.filter(
          (s) => s.category === "classic_comfort" || s.category === "crowd_pleaser"
        );
      }

      // Q3: Effort level
      if (newAnswers[2] !== "any") {
        filtered = filtered.filter((s) => s.effort === newAnswers[2]);
      }

      // Pick up to 3 random
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
    <div className="min-h-screen bg-stone-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-6 inline-block text-sm text-stone-500 hover:text-stone-700">
          &larr; Back to home
        </Link>
        <h1 className="mb-2 text-3xl font-bold text-stone-900">What Should I Make?</h1>
        <p className="mb-8 text-stone-500">
          Need inspiration? Spin the wheel or answer a few questions.
        </p>

        {/* Mode toggle */}
        <div className="mb-8 flex gap-2">
          <button
            onClick={() => setMode("wheel")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              mode === "wheel" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Spin the Wheel
          </button>
          <button
            onClick={() => { setMode("prompt"); resetPrompt(); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              mode === "prompt" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Help Me Choose
          </button>
        </div>

        {mode === "wheel" && (
          <div className="text-center">
            {/* Wheel visualization */}
            <div className="relative mx-auto mb-6 flex h-64 w-64 items-center justify-center">
              <div
                className={`grid h-full w-full grid-cols-1 gap-1 overflow-hidden rounded-full border-4 border-stone-900 ${
                  spinning ? "animate-spin" : ""
                }`}
                style={{ animationDuration: spinning ? "0.3s" : "0s" }}
              >
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    className={`flex items-center justify-center text-xs font-bold ${cat.color} ${
                      selectedCategory === cat.id && !spinning ? "ring-2 ring-stone-900" : ""
                    }`}
                  >
                    {cat.label}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={spinWheel}
              disabled={spinning || soups.length === 0}
              className="rounded-lg bg-soup-red px-8 py-3 font-semibold text-white hover:bg-red-800 disabled:opacity-50"
            >
              {spinning ? "Spinning..." : "Spin!"}
            </button>

            {currentIdea && (
              <div className="mt-8 rounded-xl border border-stone-200 bg-white p-6 text-left">
                <div className="mb-2 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryMeta?.color}`}>
                    {categoryMeta?.label}
                  </span>
                  {currentIdea.vegan && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      Vegan
                    </span>
                  )}
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                    {EFFORT_LABELS[currentIdea.effort]}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-stone-900">{currentIdea.name}</h3>
                <p className="mt-1 text-stone-600">{currentIdea.description}</p>
                <button
                  onClick={spinWheel}
                  className="mt-4 text-sm font-medium text-soup-orange hover:underline"
                >
                  Not feeling it? Spin again
                </button>
              </div>
            )}
          </div>
        )}

        {mode === "prompt" && (
          <div>
            {promptStep === 0 && (
              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold">Vegan or anything goes?</h3>
                <div className="flex gap-3">
                  <button onClick={() => answerPrompt("vegan")} className="flex-1 rounded-lg bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700">
                    Vegan / Plant-Based
                  </button>
                  <button onClick={() => answerPrompt("any")} className="flex-1 rounded-lg bg-stone-900 px-4 py-3 font-medium text-white hover:bg-stone-800">
                    Anything Goes
                  </button>
                </div>
              </div>
            )}

            {promptStep === 1 && (
              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold">Adventurous or crowd-pleaser?</h3>
                <div className="flex gap-3">
                  <button onClick={() => answerPrompt("adventurous")} className="flex-1 rounded-lg bg-purple-600 px-4 py-3 font-medium text-white hover:bg-purple-700">
                    Adventurous
                  </button>
                  <button onClick={() => answerPrompt("crowd_pleaser")} className="flex-1 rounded-lg bg-amber-500 px-4 py-3 font-medium text-stone-900 hover:bg-amber-400">
                    Crowd Pleaser
                  </button>
                </div>
              </div>
            )}

            {promptStep === 2 && (
              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold">How much effort?</h3>
                <div className="flex flex-col gap-3">
                  <button onClick={() => answerPrompt("crockpot_and_forget")} className="rounded-lg bg-stone-100 px-4 py-3 text-left font-medium text-stone-700 hover:bg-stone-200">
                    Crockpot &amp; Forget — Set it and show up
                  </button>
                  <button onClick={() => answerPrompt("some_love")} className="rounded-lg bg-stone-100 px-4 py-3 text-left font-medium text-stone-700 hover:bg-stone-200">
                    Some Love — Worth the work
                  </button>
                  <button onClick={() => answerPrompt("showstopper")} className="rounded-lg bg-stone-100 px-4 py-3 text-left font-medium text-stone-700 hover:bg-stone-200">
                    Showstopper — Go big or go home
                  </button>
                </div>
              </div>
            )}

            {promptStep === 3 && (
              <div>
                {suggestions.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-stone-900">Here&rsquo;s what we think:</h3>
                    {suggestions.map((soup) => {
                      const cat = CATEGORIES.find((c) => c.id === soup.category);
                      return (
                        <div key={soup.name} className="rounded-xl border border-stone-200 bg-white p-5">
                          <div className="mb-2 flex items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cat?.color}`}>
                              {cat?.label}
                            </span>
                            {soup.vegan && (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Vegan</span>
                            )}
                            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                              {EFFORT_LABELS[soup.effort]}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-stone-900">{soup.name}</h4>
                          <p className="mt-1 text-stone-600">{soup.description}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="py-8 text-center text-stone-500">
                    No matches for that combo — try different answers!
                  </p>
                )}

                <button
                  onClick={resetPrompt}
                  className="mt-6 rounded-lg bg-stone-900 px-6 py-3 font-medium text-white hover:bg-stone-800"
                >
                  Not feeling these? Try again
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/signup"
            className="inline-block rounded-lg bg-soup-red px-8 py-3 font-semibold text-white hover:bg-red-800"
          >
            Ready? Register Your Soup
          </Link>
        </div>
      </div>
    </div>
  );
}
