import { Suspense } from "react";
import { LeaderboardClient } from "./leaderboard-client";

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-stone-400">Loading leaderboard...</p></div>}>
      <LeaderboardClient />
    </Suspense>
  );
}
