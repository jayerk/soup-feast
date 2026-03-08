"use client";

import { useState } from "react";

interface Milestone {
  id: string;
  label: string;
  status: "not_started" | "in_progress" | "done";
}

const DEFAULT_MILESTONES: Milestone[] = [
  { id: "save_date", label: "Save the Date sent", status: "not_started" },
  { id: "signup_open", label: "Soup sign-up opens", status: "not_started" },
  { id: "signup_close", label: "Soup sign-up closes", status: "not_started" },
  { id: "invite_sent", label: "Formal invite sent", status: "not_started" },
  { id: "voting_open", label: "Voting opens", status: "not_started" },
  { id: "voting_close", label: "Voting closes", status: "not_started" },
  { id: "results_reveal", label: "Results revealed", status: "not_started" },
];

const STATUS_STYLES = {
  not_started: "bg-stone-100 text-stone-500",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

const STATUS_LABELS = {
  not_started: "Not Started",
  in_progress: "In Progress",
  done: "Done",
};

export default function TimelinePage() {
  const [milestones, setMilestones] = useState<Milestone[]>(DEFAULT_MILESTONES);

  function cycleStatus(id: string) {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const next = m.status === "not_started" ? "in_progress" : m.status === "in_progress" ? "done" : "not_started";
        return { ...m, status: next };
      })
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Timeline</h1>
      <p className="mb-6 text-sm text-stone-500">Click a status badge to cycle through: Not Started → In Progress → Done</p>

      <div className="space-y-3">
        {milestones.map((m, i) => (
          <div key={m.id} className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-sm font-bold text-stone-600">
              {i + 1}
            </div>
            <p className="flex-1 font-medium text-stone-900">{m.label}</p>
            <button
              onClick={() => cycleStatus(m.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[m.status]}`}
            >
              {STATUS_LABELS[m.status]}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
