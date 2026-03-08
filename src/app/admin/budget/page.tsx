"use client";

import { useEffect, useState } from "react";

interface BudgetItem {
  id: string;
  itemName: string;
  category: string;
  estimatedCost: number;
  actualCost: number | null;
}

const CATEGORIES = ["SUPPLIES", "PRINTING", "FOOD", "VENUE", "OTHER"];

export default function BudgetPage() {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [eventId, setEventId] = useState("");
  const [form, setForm] = useState({ itemName: "", category: "SUPPLIES", estimatedCost: "", actualCost: "" });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.event) {
        setEventId(data.event.id);
        const bRes = await fetch(`/api/budget?eventId=${data.event.id}`);
        const bData = await bRes.json();
        setItems(bData.items || []);
      }
    }
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        itemName: form.itemName,
        category: form.category,
        estimatedCost: parseFloat(form.estimatedCost) || 0,
        actualCost: form.actualCost ? parseFloat(form.actualCost) : null,
      }),
    });
    setForm({ itemName: "", category: "SUPPLIES", estimatedCost: "", actualCost: "" });
    setShowForm(false);
    // Refresh
    const bRes = await fetch(`/api/budget?eventId=${eventId}`);
    const bData = await bRes.json();
    setItems(bData.items || []);
  }

  const totalEstimated = items.reduce((sum, i) => sum + i.estimatedCost, 0);
  const totalActual = items.reduce((sum, i) => sum + (i.actualCost || 0), 0);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Budget Tracker</h1>
        <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-soup-red px-4 py-2 text-sm font-medium text-white hover:bg-red-800">
          Add Item
        </button>
      </div>

      {/* Totals */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-500">Estimated Total</p>
          <p className="text-2xl font-bold text-stone-900">${totalEstimated.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-500">Actual Total</p>
          <p className="text-2xl font-bold text-stone-900">${totalActual.toFixed(2)}</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 rounded-xl border border-stone-200 bg-white p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Item name" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} className="rounded-lg border border-stone-300 px-3 py-2" required />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-lg border border-stone-300 px-3 py-2">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.toLowerCase()}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="number" step="0.01" placeholder="Estimated $" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} className="rounded-lg border border-stone-300 px-3 py-2" />
            <input type="number" step="0.01" placeholder="Actual $" value={form.actualCost} onChange={(e) => setForm({ ...form, actualCost: e.target.value })} className="rounded-lg border border-stone-300 px-3 py-2" />
          </div>
          <button type="submit" className="rounded-lg bg-soup-red px-4 py-2 text-sm font-medium text-white">Add</button>
        </form>
      )}

      <div className="rounded-xl border border-stone-200 bg-white">
        {items.length === 0 ? (
          <p className="py-10 text-center text-stone-400">No budget items yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-stone-200 bg-stone-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-stone-600">Item</th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">Category</th>
                <th className="px-4 py-3 text-right font-medium text-stone-600">Estimated</th>
                <th className="px-4 py-3 text-right font-medium text-stone-600">Actual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium">{item.itemName}</td>
                  <td className="px-4 py-3 text-stone-500">{item.category.toLowerCase()}</td>
                  <td className="px-4 py-3 text-right">${item.estimatedCost.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">{item.actualCost != null ? `$${item.actualCost.toFixed(2)}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
