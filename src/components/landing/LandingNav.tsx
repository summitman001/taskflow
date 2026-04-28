import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingNav() {
    return (
        <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-900"
                >
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
                        T
                    </span>
                    TaskFlow
                </Link>

                <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/sign-in">Sign in</Link>
                    </Button>
                    <Button asChild size="sm">
                        <Link href="/sign-up">Get started</Link>
                    </Button>
                </div>
            </div>
        </nav>
    );
}