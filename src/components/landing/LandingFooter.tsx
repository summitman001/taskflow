import Link from "next/link";

export function LandingFooter() {
    return (
        <footer className="border-t border-slate-200 bg-slate-50/50">
            <div className="mx-auto max-w-6xl px-6 py-12">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
                            T
                        </span>
                        <span className="text-sm font-semibold text-slate-900">TaskFlow</span>
                    </div>

                    <div className="flex flex-col items-center gap-1 text-xs text-slate-500 md:flex-row md:gap-4">
                        <span>Built with Next.js, Prisma, and OpenAI.</span>
                        <span className="hidden md:inline">·</span>
                        <a 
                            href="https://github.com/summitman001/taskflow" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-slate-800 transition-colors"
                        >
                            Open source on GitHub.
                        </a>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                        <Link href="/sign-in" className="text-slate-600 hover:text-slate-900">
                            Sign in
                        </Link>
                        <Link
                            href="/sign-up"
                            className="font-medium text-slate-900 hover:text-slate-700"
                        >
                            Get started →
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}