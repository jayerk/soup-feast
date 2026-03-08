import Link from "next/link";
import { getAll, Collections, where, orderBy } from "@/lib/firestore";

export const dynamic = "force-dynamic";

async function getArchiveData() {
  try {
    const archiveEvents = await getAll(Collections.archiveEvents, orderBy("year", "desc"));

    const revealedEvents = await getAll(
      Collections.events,
      where("resultsRevealed", "==", true),
      orderBy("year", "desc")
    );

    // Enrich revealed events with counts
    const enriched: { id: string; name: string; location: string; soups: Record<string, unknown>[]; _count: { guests: number; ballots: number } }[] = [];
    for (const event of revealedEvents) {
      const soups = await getAll(Collections.soups, where("eventId", "==", event.id));
      const guests = await getAll(Collections.guests, where("eventId", "==", event.id));
      const ballots = await getAll(Collections.ballots, where("eventId", "==", event.id));
      enriched.push({
        id: event.id as string,
        name: event.name as string,
        location: event.location as string,
        soups,
        _count: { guests: guests.length, ballots: ballots.length },
      });
    }

    return { archiveEvents, revealedEvents: enriched };
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
        {archiveEvents.map((ev) => {
          const year = ev.year as number;
          const location = ev.location as string | null;
          const totalSoups = ev.totalSoups as number | null;
          const totalGuests = ev.totalGuests as number | null;
          const championSoup = ev.championSoup as string | null;
          const championCook = ev.championCook as string | null;
          const runnerUpSoup = ev.runnerUpSoup as string | null;
          const runnerUpCook = ev.runnerUpCook as string | null;
          const soupList = (ev.soupList as string[]) || [];
          return (
            <div key={ev.id as string} className="mb-6 rounded-xl border border-stone-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-stone-900">Year {year - 2023}: {year}</h2>
                  {location && <p className="text-sm text-stone-500">{location}</p>}
                </div>
                <div className="text-right text-sm text-stone-400">
                  {totalSoups && <p>{totalSoups} soups</p>}
                  {totalGuests && <p>{totalGuests} guests</p>}
                </div>
              </div>

              {championSoup && (
                <div className="mb-3 rounded-lg bg-amber-50 p-4">
                  <p className="text-xs font-medium text-amber-600">Champion</p>
                  <p className="text-lg font-bold text-stone-900">{championSoup}</p>
                  {championCook && <p className="text-sm text-stone-600">by {championCook}</p>}
                </div>
              )}

              {runnerUpSoup && (
                <div className="mb-3 rounded-lg bg-stone-50 p-3">
                  <p className="text-xs font-medium text-stone-400">Runner-Up</p>
                  <p className="font-medium text-stone-800">{runnerUpSoup}</p>
                  {runnerUpCook && <p className="text-sm text-stone-500">by {runnerUpCook}</p>}
                </div>
              )}

              {soupList.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-stone-500 hover:text-stone-700">
                    View all soups ({soupList.length})
                  </summary>
                  <ul className="mt-2 grid grid-cols-2 gap-1 text-sm text-stone-600">
                    {soupList.map((name, i) => (
                      <li key={i}>• {name}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          );
        })}

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
