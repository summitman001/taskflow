import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { BoardsList } from "@/components/board/BoardsList";

export default async function BoardsPage() {
    const user = await currentUser();
    const displayName =
        user?.firstName || user?.emailAddresses[0]?.emailAddress || "there";

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
                <div className="mb-8">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                        Welcome back, {displayName}
                    </h2>
                    <p className="mt-2 text-slate-600">
                        Manage your boards and keep your team moving.
                    </p>
                </div>

                <BoardsList />
            </main>
        </div>
    );
}