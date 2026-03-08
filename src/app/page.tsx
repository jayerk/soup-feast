import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getEvent() {
  try {
    return await prisma.event.findFirst({
      orderBy: { year: "desc" },
      include: { _count: { select: { soups: true, guests: true } } },
    });
  } catch {
    return null;
  }
}

function Countdown({ date }: { date: string }) {
  return (
    <div
      className="flex gap-4 text-center"
      suppressHydrationWarning
    >
      <CountdownClient targetDate={date} />
    </div>
  );
}

function CountdownClient({ targetDate }: { targetDate: string }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const target = new Date("${targetDate}").getTime();
            const container = document.getElementById("countdown");
            function update() {
              const now = Date.now();
              const diff = target - now;
              if (diff <= 0) {
                container.innerHTML = '<p class="text-2xl font-bold text-amber-400">It\\'s Soup Day!</p>';
                return;
              }
              const days = Math.floor(diff / 86400000);
              const hours = Math.floor((diff % 86400000) / 3600000);
              const mins = Math.floor((diff % 3600000) / 60000);
              container.innerHTML = \`
                <div class="flex gap-4 justify-center">
                  <div><p class="text-4xl font-bold text-amber-400">\${days}</p><p class="text-xs text-stone-400 uppercase">Days</p></div>
                  <div><p class="text-4xl font-bold text-amber-400">\${hours}</p><p class="text-xs text-stone-400 uppercase">Hours</p></div>
                  <div><p class="text-4xl font-bold text-amber-400">\${mins}</p><p class="text-xs text-stone-400 uppercase">Minutes</p></div>
                </div>
              \`;
            }
            update();
            setInterval(update, 60000);
          })();
        `,
      }}
    />
  );
}

export default async function Home() {
  const event = await getEvent();

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100">
      {/* Hero */}
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-amber-400">
          Year {event?.year ? event.year - 2023 : 3} of the Tradition
        </p>
        <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-7xl">
          The Great<br />
          <span className="text-amber-400">Soup Feast</span>
        </h1>

        {event ? (
          <>
            <p className="mb-2 text-lg text-stone-300">
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="mb-8 text-stone-400">{event.location}</p>

            <div id="countdown" className="mb-10">
              <Countdown date={event.date.toISOString()} />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/rsvp"
                className="rounded-lg bg-amber-500 px-8 py-3 font-semibold text-stone-900 transition-colors hover:bg-amber-400"
              >
                RSVP Now
              </Link>
              <Link
                href="/signup"
                className="rounded-lg border border-stone-600 px-8 py-3 font-semibold text-stone-200 transition-colors hover:bg-stone-800"
              >
                Register a Soup
              </Link>
              <Link
                href="/ideas"
                className="rounded-lg border border-stone-600 px-8 py-3 font-semibold text-stone-200 transition-colors hover:bg-stone-800"
              >
                Need Soup Ideas?
              </Link>
            </div>
          </>
        ) : (
          <p className="mt-4 text-stone-400">Coming soon...</p>
        )}
      </div>

      {/* Info section */}
      <div className="mx-auto max-w-4xl px-4 py-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <p className="mb-2 text-3xl">🍲</p>
            <h3 className="mb-1 font-semibold text-amber-400">Taste</h3>
            <p className="text-sm text-stone-400">
              {event?._count.soups || "25+"} soups from talented cooks. Browse by table, vibe, or go surprise mode.
            </p>
          </div>
          <div className="text-center">
            <p className="mb-2 text-3xl">🗳️</p>
            <h3 className="mb-1 font-semibold text-amber-400">Vote</h3>
            <p className="text-sm text-stone-400">
              Rank your top 5 favorites. Ranked-choice voting determines the champion.
            </p>
          </div>
          <div className="text-center">
            <p className="mb-2 text-3xl">🏆</p>
            <h3 className="mb-1 font-semibold text-amber-400">Celebrate</h3>
            <p className="text-sm text-stone-400">
              Watch votes flow live on the big screen. Awards for Champion, Sleeper Hit, and more.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-stone-800 py-8 text-center text-xs text-stone-500">
        <Link href="/archive" className="hover:text-stone-300">View Past Years</Link>
        <span className="mx-3">&middot;</span>
        <Link href="/leaderboard" className="hover:text-stone-300">Leaderboard</Link>
      </footer>
    </div>
  );
}
