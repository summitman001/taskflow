import { UserButton } from "@clerk/nextjs";
import { BoardsList } from "@/components/board/BoardsList";
import { WelcomeHeader } from "@/components/board/WelcomeHeader";

export default function BoardsPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
                            T
                        </span>
                        TaskFlow
                    </h1>
                    <UserButton />
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-10">
                <WelcomeHeader />
                <BoardsList />
            </main>
        </div>
    );
}