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
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-xs tracking-[0.3em] uppercase text-taupe mb-4">The Record</p>
      <h2
        className="text-4xl font-bold text-espresso mb-2"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        Soup Feast Archive
      </h2>
      <p className="text-taupe mb-10" style={{ fontFamily: "var(--font-lora)" }}>
        The history and lore of The Great Soup Feast.
      </p>

      {!hasData && (
        <div className="py-20 text-center text-taupe">
          <p
            className="text-3xl font-bold text-espresso mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            No history yet.
          </p>
          <p className="italic" style={{ fontFamily: "var(--font-lora)" }}>
            Every tradition has to start somewhere.
          </p>
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
          <div key={ev.id as string} className="mb-8 card-editorial">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3
                  className="text-2xl font-bold text-espresso"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Year {year - 2023}: {year}
                </h3>
                {location && <p className="text-sm text-taupe mt-1">{location}</p>}
              </div>
              <div className="text-right text-sm text-taupe">
                {totalSoups && <p>{totalSoups} soups</p>}
                {totalGuests && <p>{totalGuests} guests</p>}
              </div>
            </div>

            {championSoup && (
              <div className="mb-4 border-l-2 border-harvest-gold pl-4 py-2">
                <p className="text-xs tracking-[0.15em] uppercase text-harvest-gold mb-1">Champion</p>
                <p
                  className="text-lg font-bold text-espresso"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {championSoup}
                </p>
                {championCook && <p className="text-sm text-taupe italic">by {championCook}</p>}
              </div>
            )}

            {runnerUpSoup && (
              <div className="mb-4 border-l-2 border-sand pl-4 py-2">
                <p className="text-xs tracking-[0.15em] uppercase text-taupe mb-1">Runner-Up</p>
                <p className="font-semibold text-espresso" style={{ fontFamily: "var(--font-playfair)" }}>
                  {runnerUpSoup}
                </p>
                {runnerUpCook && <p className="text-sm text-taupe italic">by {runnerUpCook}</p>}
              </div>
            )}

            {soupList.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-xs tracking-[0.15em] uppercase text-taupe hover:text-espresso transition-colors">
                  View all soups ({soupList.length})
                </summary>
                <ul className="mt-3 grid grid-cols-2 gap-1 text-sm text-taupe" style={{ fontFamily: "var(--font-lora)" }}>
                  {soupList.map((name, i) => (
                    <li key={i}>{name}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        );
      })}

      {/* Revealed events from current data */}
      {revealedEvents.map((event) => (
        <div key={event.id} className="mb-8 card-editorial">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3
                className="text-2xl font-bold text-espresso"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {event.name}
              </h3>
              <p className="text-sm text-taupe mt-1">{event.location}</p>
            </div>
            <div className="text-right text-sm text-taupe">
              <p>{event.soups.length} soups</p>
              <p>{event._count.guests} guests</p>
              <p>{event._count.ballots} votes</p>
            </div>
          </div>
          <Link
            href="/results"
            className="text-sm text-wine hover:underline"
            style={{ fontFamily: "var(--font-lora)" }}
          >
            View full results &rarr;
          </Link>
        </div>
      ))}
    </div>
  );
}
