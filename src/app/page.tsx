import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { userId } = await auth();

  // Login olmuşsa direkt boards'a yolla
  if (userId) {
    redirect("/boards");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-50 px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900">
          TaskFlow
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          A simple, fast Kanban board for small teams. Drag, drop, ship.
        </p>
      </div>

      <div className="flex gap-3">
        <Button asChild size="lg">
          <Link href="/sign-up">Get started</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    </main>
  );
}