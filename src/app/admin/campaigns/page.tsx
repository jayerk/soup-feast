"use client";

import { useEffect, useState } from "react";

interface Campaign {
  id: string;
  name: string;
  sendDate: string | null;
  channel: string;
  templateBody: string;
  status: string;
  sentCount: number;
}

const DEFAULT_TEMPLATES = [
  { name: "Save the Date", channel: "BOTH", body: "The Great Soup Feast returns {{event_date}}. Mark your calendar. {{rsvp_link}}" },
  { name: "Soup Sign-Up Opens", channel: "BOTH", body: "Think you've got what it takes? Register your soup at {{signup_link}}" },
  { name: "The Lineup Teaser", channel: "BOTH", body: "{{soup_count}} soups confirmed. Here's a sneak peek at what's brewing." },
  { name: "Final Call", channel: "BOTH", body: "RSVP now at {{rsvp_link}}. Voting goes live at the event!" },
  { name: "Game Day", channel: "SMS", body: "It's here. Scan, taste, vote. {{vote_link}}" },
  { name: "Results Are In", channel: "BOTH", body: "And the winner is... {{results_link}}" },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.event) {
        setEventId(data.event.id);
        const cRes = await fetch(`/api/campaigns?eventId=${data.event.id}`);
        const cData = await cRes.json();
        setCampaigns(cData.campaigns || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function seedTemplates() {
    for (const t of DEFAULT_TEMPLATES) {
      await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, ...t, templateBody: t.body }),
      });
    }
    const cRes = await fetch(`/api/campaigns?eventId=${eventId}`);
    const cData = await cRes.json();
    setCampaigns(cData.campaigns || []);
  }

  const statusColors: Record<string, string> = {
    DRAFT: "bg-stone-100 text-stone-600",
    SCHEDULED: "bg-blue-100 text-blue-700",
    SENT: "bg-green-100 text-green-700",
  };

  if (loading) return <p className="text-stone-500">Loading...</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Campaign Manager</h1>
        {campaigns.length === 0 && (
          <button onClick={seedTemplates} className="rounded-lg bg-soup-red px-4 py-2 text-sm font-medium text-white hover:bg-red-800">
            Load Default Templates
          </button>
        )}
      </div>

      <p className="mb-6 text-sm text-stone-500">
        Manage drip campaign messages. Email and SMS sending requires Resend and Twilio API keys.
      </p>

      {campaigns.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white py-12 text-center">
          <p className="text-stone-400">No campaigns yet. Load the default templates to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => (
            <div key={c.id} className="rounded-xl border border-stone-200 bg-white p-5">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-stone-900">{c.name}</h3>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[c.status]}`}>
                  {c.status.toLowerCase()}
                </span>
              </div>
              <p className="text-sm text-stone-600">{c.templateBody}</p>
              <div className="mt-3 flex items-center gap-4 text-xs text-stone-400">
                <span>Channel: {c.channel.toLowerCase()}</span>
                {c.sendDate && <span>Send: {new Date(c.sendDate).toLocaleDateString()}</span>}
                {c.sentCount > 0 && <span>Sent: {c.sentCount}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
