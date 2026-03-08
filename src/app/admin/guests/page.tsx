"use client";

import { useEffect, useState } from "react";

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  inviteChannel: string;
  rsvpStatus: string;
  uniqueToken: string;
  isCook: boolean;
  soup?: { name: string } | null;
}

interface Event {
  id: string;
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    inviteChannel: "EMAIL",
  });
  const [csvInput, setCsvInput] = useState("");
  const [showCsvImport, setShowCsvImport] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const eventRes = await fetch("/api/events");
    const eventData = await eventRes.json();
    if (eventData.event) {
      setEvent(eventData.event);
      const guestsRes = await fetch(`/api/guests?eventId=${eventData.event.id}`);
      const guestsData = await guestsRes.json();
      setGuests(guestsData.guests);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;

    await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, eventId: event.id }),
    });

    setForm({ name: "", email: "", phone: "", inviteChannel: "EMAIL" });
    setShowForm(false);
    fetchData();
  }

  async function handleCsvImport() {
    if (!event || !csvInput.trim()) return;

    const lines = csvInput.trim().split("\n");
    const guests = lines.map((line) => {
      const [name, email, phone] = line.split(",").map((s) => s.trim());
      return { name, email, phone, eventId: event.id };
    });

    await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guests, eventId: event.id }),
    });

    setCsvInput("");
    setShowCsvImport(false);
    fetchData();
  }

  async function updateRsvp(id: string, rsvpStatus: string) {
    await fetch("/api/guests", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, rsvpStatus }),
    });
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this guest?")) return;
    await fetch("/api/guests", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  }

  const filteredGuests = filter === "ALL" ? guests : guests.filter((g) => g.rsvpStatus === filter);

  const rsvpCounts = {
    CONFIRMED: guests.filter((g) => g.rsvpStatus === "CONFIRMED").length,
    DECLINED: guests.filter((g) => g.rsvpStatus === "DECLINED").length,
    INVITED: guests.filter((g) => g.rsvpStatus === "INVITED").length,
    NO_RESPONSE: guests.filter((g) => g.rsvpStatus === "NO_RESPONSE").length,
  };

  const rsvpColors: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-800",
    DECLINED: "bg-red-100 text-red-800",
    INVITED: "bg-blue-100 text-blue-800",
    NO_RESPONSE: "bg-stone-100 text-stone-600",
  };

  if (!event) {
    return <div className="py-10 text-center text-stone-500">Create an event first.</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Guest List</h1>
          <p className="text-sm text-stone-500">{guests.length} guests total</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCsvImport(!showCsvImport)}
            className="rounded-lg bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200"
          >
            CSV Import
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-soup-red px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
          >
            Add Guest
          </button>
        </div>
      </div>

      {/* RSVP summary */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        {Object.entries(rsvpCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilter(filter === status ? "ALL" : status)}
            className={`rounded-lg border p-3 text-center transition-colors ${
              filter === status ? "border-soup-orange bg-amber-50" : "border-stone-200 bg-white"
            }`}
          >
            <p className="text-2xl font-bold text-stone-900">{count}</p>
            <p className="text-xs text-stone-500">{status.replace("_", " ").toLowerCase()}</p>
          </button>
        ))}
      </div>

      {/* CSV Import */}
      {showCsvImport && (
        <div className="mb-6 rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="mb-2 text-lg font-semibold">Import Guests (CSV)</h2>
          <p className="mb-3 text-sm text-stone-500">One guest per line: name, email, phone</p>
          <textarea
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            className="mb-3 block w-full rounded-lg border border-stone-300 px-3 py-2 font-mono text-sm"
            rows={5}
            placeholder="John Doe, john@example.com, 555-0100&#10;Jane Smith, jane@example.com"
          />
          <div className="flex gap-2">
            <button onClick={handleCsvImport} className="rounded-lg bg-soup-red px-4 py-2 text-sm font-medium text-white hover:bg-red-800">
              Import
            </button>
            <button onClick={() => setShowCsvImport(false)} className="rounded-lg bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Add Guest</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-soup-orange focus:outline-none focus:ring-1 focus:ring-soup-orange"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-soup-orange focus:outline-none focus:ring-1 focus:ring-soup-orange"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-soup-orange focus:outline-none focus:ring-1 focus:ring-soup-orange"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Invite Channel</label>
                <select
                  value={form.inviteChannel}
                  onChange={(e) => setForm({ ...form, inviteChannel: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2"
                >
                  <option value="EMAIL">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="BOTH">Both</option>
                  <option value="MAIL">Mail</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="rounded-lg bg-soup-red px-4 py-2 text-sm font-medium text-white hover:bg-red-800">
                Add Guest
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Guest list */}
      <div className="rounded-xl border border-stone-200 bg-white">
        {filteredGuests.length === 0 ? (
          <p className="py-10 text-center text-stone-400">No guests yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50">
              <tr>
                <th className="px-4 py-3 font-medium text-stone-600">Name</th>
                <th className="px-4 py-3 font-medium text-stone-600">Contact</th>
                <th className="px-4 py-3 font-medium text-stone-600">Channel</th>
                <th className="px-4 py-3 font-medium text-stone-600">RSVP</th>
                <th className="px-4 py-3 font-medium text-stone-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredGuests.map((guest) => (
                <tr key={guest.id}>
                  <td className="px-4 py-3">
                    <span className="font-medium text-stone-900">{guest.name}</span>
                    {guest.isCook && guest.soup && (
                      <span className="ml-2 text-xs text-amber-600">Cook: {guest.soup.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-500">
                    <div>{guest.email}</div>
                    <div>{guest.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-stone-500">{guest.inviteChannel.toLowerCase()}</td>
                  <td className="px-4 py-3">
                    <select
                      value={guest.rsvpStatus}
                      onChange={(e) => updateRsvp(guest.id, e.target.value)}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${rsvpColors[guest.rsvpStatus]}`}
                    >
                      <option value="NO_RESPONSE">No Response</option>
                      <option value="INVITED">Invited</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="DECLINED">Declined</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(guest.id)} className="text-xs text-red-400 hover:text-red-600">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
