import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getArchiveData() {
  try {
    const archiveEvents = await prisma.archiveEvent.findMany({
      orderBy: { year: "desc" },
    });

    // Also get completed events with revealed results
    const revealedEvents = await prisma.event.findMany({
      where: { resultsRevealed: true },
      orderBy: { year: "desc" },
      include: {
        soups: { orderBy: { number: "asc" } },
        _count: { select: { guests: true, ballots: true } },
      },
    });

    return { archiveEvents, revealedEvents };
  } catch {
    return { archiveEvents: [], revealedEvents: [] };
  }
}

export default async function ArchivePage() {
  const { archiveEvents, revealedEvents } = await getArchiveData();
  const hasData = archiveEvents.length > 0 || revealedEvents.length > 0;

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-6 inline-block text-sm text-stone-500 hover:text-stone-700">
          &larr; Back to home
        </Link>
        <h1 className="mb-2 text-3xl font-bold text-stone-900">Soup Feast Archive</h1>
        <p className="mb-8 text-stone-500">The history and lore of The Great Soup Feast.</p>

        {!hasData && (
          <div className="py-20 text-center text-stone-400">
            <p className="text-5xl mb-4">📚</p>
            <p>No archived events yet. History starts here.</p>
          </div>
        )}

        {/* Archive events (backfilled years) */}
        {archiveEvents.map((event) => (
          <div key={event.id} className="mb-6 rounded-xl border border-stone-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-900">Year {event.year - 2023}: {event.year}</h2>
                {event.location && <p className="text-sm text-stone-500">{event.location}</p>}
              </div>
              <div className="text-right text-sm text-stone-400">
                {event.totalSoups && <p>{event.totalSoups} soups</p>}
                {event.totalGuests && <p>{event.totalGuests} guests</p>}
              </div>
            </div>

            {event.championSoup && (
              <div className="mb-3 rounded-lg bg-amber-50 p-4">
                <p className="text-xs font-medium text-amber-600">Champion</p>
                <p className="text-lg font-bold text-stone-900">{event.championSoup}</p>
                {event.championCook && <p className="text-sm text-stone-600">by {event.championCook}</p>}
              </div>
            )}

            {event.runnerUpSoup && (
              <div className="mb-3 rounded-lg bg-stone-50 p-3">
                <p className="text-xs font-medium text-stone-400">Runner-Up</p>
                <p className="font-medium text-stone-800">{event.runnerUpSoup}</p>
                {event.runnerUpCook && <p className="text-sm text-stone-500">by {event.runnerUpCook}</p>}
              </div>
            )}

            {event.soupList.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-stone-500 hover:text-stone-700">
                  View all soups ({event.soupList.length})
                </summary>
                <ul className="mt-2 grid grid-cols-2 gap-1 text-sm text-stone-600">
                  {event.soupList.map((name, i) => (
                    <li key={i}>• {name}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        ))}

        {/* Revealed events from current data */}
        {revealedEvents.map((event) => (
          <div key={event.id} className="mb-6 rounded-xl border border-stone-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-900">{event.name}</h2>
                <p className="text-sm text-stone-500">{event.location}</p>
              </div>
              <div className="text-right text-sm text-stone-400">
                <p>{event.soups.length} soups</p>
                <p>{event._count.guests} guests</p>
                <p>{event._count.ballots} votes</p>
              </div>
            </div>
            <Link
              href="/results"
              className="text-sm font-medium text-soup-orange hover:underline"
            >
              View full results
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
