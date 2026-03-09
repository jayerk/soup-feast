import { Suspense } from "react";
import { LeaderboardClient } from "./leaderboard-client";

export default function LeaderboardPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-taupe italic" style={{ fontFamily: "var(--font-lora)" }}>Loading leaderboard...</p>
      </div>
    }>
      <LeaderboardClient />
    </Suspense>
  );
}
