import Link from "next/link";
import { getAll, Collections, where, orderBy, limit } from "@/lib/firestore";

export const dynamic = "force-dynamic";

async function getEvent() {
  try {
    const events = await getAll(Collections.events, orderBy("year", "desc"), limit(1));
    const event = events[0] || null;
    if (event) {
      const soups = await getAll(Collections.soups, where("eventId", "==", event.id));
      const guests = await getAll(Collections.guests, where("eventId", "==", event.id));
      (event as Record<string, unknown>)._count = {
        soups: soups.length,
        guests: guests.length,
      };
    }
    return event;
  } catch {
    return null;
  }
}

function CountdownClient({ targetDate }: { targetDate: string }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const target = new Date("${targetDate}").getTime();
            const container = document.getElementById("countdown");
            if (!container) return;
            function update() {
              const now = Date.now();
              const diff = target - now;
              if (diff <= 0) {
                container.innerHTML = '<p style="font-family:var(--font-playfair);font-size:1.5rem;font-style:italic;color:#722F37;">The feast is upon us.</p>';
                return;
              }
              const days = Math.floor(diff / 86400000);
              const hours = Math.floor((diff % 86400000) / 3600000);
              const mins = Math.floor((diff % 3600000) / 60000);
              container.innerHTML = \`
                <div style="display:flex;gap:2.5rem;justify-content:center;">
                  <div style="text-align:center;">
                    <p style="font-family:var(--font-playfair);font-size:3rem;font-weight:700;color:#3D2B1F;line-height:1;">\${days}</p>
                    <p style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.2em;color:#8B7355;margin-top:0.25rem;">Days</p>
                  </div>
                  <div style="text-align:center;">
                    <p style="font-family:var(--font-playfair);font-size:3rem;font-weight:700;color:#3D2B1F;line-height:1;">\${hours}</p>
                    <p style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.2em;color:#8B7355;margin-top:0.25rem;">Hours</p>
                  </div>
                  <div style="text-align:center;">
                    <p style="font-family:var(--font-playfair);font-size:3rem;font-weight:700;color:#3D2B1F;line-height:1;">\${mins}</p>
                    <p style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.2em;color:#8B7355;margin-top:0.25rem;">Minutes</p>
                  </div>
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
  const _count = (event as Record<string, unknown>)?._count as { soups: number; guests: number } | undefined;

  return (
    <div className="bg-cream">
      {/* Editorial Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-12 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-taupe mb-6">
          {event?.year ? `Year ${(event.year as number) - 2023} of the Tradition` : "A New Tradition"}
        </p>

        <h2
          className="text-5xl sm:text-7xl font-bold text-espresso leading-[0.95] mb-6"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          An Evening<br />of Soup
        </h2>

        <div className="w-16 h-px bg-harvest-gold mx-auto mb-6" />

        {event ? (
          <>
            <p
              className="text-lg text-espresso mb-1 italic"
              style={{ fontFamily: "var(--font-lora)" }}
            >
              {new Date(event.date as string).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-sm text-taupe mb-10">{event.location as string}</p>

            <div id="countdown" className="mb-12" suppressHydrationWarning>
              <CountdownClient targetDate={event.date as string} />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/rsvp" className="btn-vintage-filled">
                RSVP to the Feast
              </Link>
              <Link href="/signup" className="btn-vintage">
                Register Your Soup
              </Link>
            </div>
          </>
        ) : (
          <p className="text-taupe italic mt-4" style={{ fontFamily: "var(--font-lora)" }}>
            Details coming soon&hellip;
          </p>
        )}
      </section>

      {/* Divider */}
      <div className="text-center text-harvest-gold text-xs tracking-[0.5em] py-4">◆ ◆ ◆</div>

      {/* Editorial Three-Column */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center">
            <p
              className="text-4xl font-bold text-wine mb-3"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Taste
            </p>
            <div className="w-8 h-px bg-sand mx-auto mb-4" />
            <p className="text-sm text-taupe leading-relaxed" style={{ fontFamily: "var(--font-lora)" }}>
              {_count?.soups || "25+"} soups from talented home cooks.
              Browse by table, follow your palate, or let chance decide.
            </p>
          </div>
          <div className="text-center">
            <p
              className="text-4xl font-bold text-wine mb-3"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Vote
            </p>
            <div className="w-8 h-px bg-sand mx-auto mb-4" />
            <p className="text-sm text-taupe leading-relaxed" style={{ fontFamily: "var(--font-lora)" }}>
              Rank your five favorites. Our ranked-choice ballot
              ensures the people&rsquo;s champion rises to the top.
            </p>
          </div>
          <div className="text-center">
            <p
              className="text-4xl font-bold text-wine mb-3"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Celebrate
            </p>
            <div className="w-8 h-px bg-sand mx-auto mb-4" />
            <p className="text-sm text-taupe leading-relaxed" style={{ fontFamily: "var(--font-lora)" }}>
              Watch votes tally live on the big screen. Awards for
              Champion, Sleeper Hit, Most Polarizing, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Call to action strip */}
      <section className="border-t border-b border-sand py-10 text-center bg-parchment">
        <p
          className="text-2xl font-bold text-espresso mb-2"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Not sure what to bring?
        </p>
        <p className="text-sm text-taupe mb-6" style={{ fontFamily: "var(--font-lora)" }}>
          Spin the wheel or take our three-question quiz for inspiration.
        </p>
        <Link href="/ideas" className="btn-vintage">
          Explore Soup Ideas
        </Link>
      </section>

      {/* Stats strip */}
      {_count && (_count.soups > 0 || _count.guests > 0) && (
        <section className="mx-auto max-w-3xl px-6 py-16 text-center">
          <div className="flex justify-center gap-16">
            {_count.soups > 0 && (
              <div>
                <p
                  className="text-5xl font-bold text-espresso"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {_count.soups}
                </p>
                <p className="text-xs tracking-[0.2em] uppercase text-taupe mt-1">
                  Soups Registered
                </p>
              </div>
            )}
            {_count.guests > 0 && (
              <div>
                <p
                  className="text-5xl font-bold text-espresso"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {_count.guests}
                </p>
                <p className="text-xs tracking-[0.2em] uppercase text-taupe mt-1">
                  Guests Expected
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
