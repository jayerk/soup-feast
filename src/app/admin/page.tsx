import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getActiveEvent() {
  const event = await prisma.event.findFirst({
    orderBy: { year: "desc" },
    include: {
      _count: {
        select: {
          soups: true,
          guests: true,
          ballots: true,
        },
      },
      guests: {
        select: { rsvpStatus: true },
      },
    },
  });
  return event;
}

export default async function AdminDashboard() {
  const event = await getActiveEvent();

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-3xl font-bold text-stone-900">Welcome to Soup Feast</h1>
        <p className="mt-2 text-stone-500">No event has been created yet.</p>
        <Link
          href="/admin/event"
          className="mt-6 rounded-lg bg-soup-red px-6 py-3 font-medium text-white hover:bg-red-800"
        >
          Create Your First Event
        </Link>
      </div>
    );
  }

  const confirmedGuests = event.guests.filter((g) => g.rsvpStatus === "CONFIRMED").length;
  const totalGuests = event._count.guests;

  const stats = [
    { label: "Soups Registered", value: event._count.soups, max: event.maxSoups, href: "/admin/soups" },
    { label: "RSVPs", value: confirmedGuests, max: totalGuests, href: "/admin/guests" },
    { label: "Ballots Cast", value: event._count.ballots, max: confirmedGuests || totalGuests, href: "/admin/reveal" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">{event.name}</h1>
        <p className="text-stone-500">
          {new Date(event.date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          &middot; {event.location}
        </p>
      </div>

      {/* Status badges */}
      <div className="mb-8 flex gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
          event.votingOpen ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-600"
        }`}>
          Voting {event.votingOpen ? "Open" : "Closed"}
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
          event.resultsRevealed ? "bg-amber-100 text-amber-800" : "bg-stone-200 text-stone-600"
        }`}>
          Results {event.resultsRevealed ? "Revealed" : "Hidden"}
        </span>
      </div>

      {/* Stats cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-sm text-stone-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-stone-900">
              {stat.value}
              <span className="text-lg text-stone-400"> / {stat.max}</span>
            </p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-stone-900">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/event" className="rounded-lg bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200">
            Edit Event
          </Link>
          <Link href="/admin/soups" className="rounded-lg bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200">
            Manage Soups
          </Link>
          <Link href="/admin/guests" className="rounded-lg bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200">
            Guest List
          </Link>
          <Link href="/admin/campaigns" className="rounded-lg bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200">
            Campaigns
          </Link>
        </div>
      </div>
    </div>
  );
}
