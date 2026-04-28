"use client";

import { useUser } from "@clerk/nextjs";

export function WelcomeHeader() {
  const { user, isLoaded } = useUser();

  const displayName = isLoaded
    ? user?.firstName || user?.emailAddresses[0]?.emailAddress?.split("@")[0] || "there"
    : null;

  // Saat bazlı greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 6 ? "Working late"
    : hour < 12 ? "Good morning"
    : hour < 18 ? "Good afternoon"
    : "Good evening";

  return (
    <div className="mb-10">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
        {displayName ? (
          <>
            {greeting}, {displayName} 👋
          </>
        ) : (
          <span className="inline-block h-9 w-72 animate-pulse rounded bg-slate-200" />
        )}
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Here&apos;s what&apos;s happening with your boards today.
      </p>
    </div>
  );
}
