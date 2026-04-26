import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { BoardsList } from "@/components/board/BoardsList";

export default async function BoardsPage() {
    const user = await currentUser();
    const displayName =
        user?.firstName || user?.emailAddresses[0]?.emailAddress || "there";

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <h1 className="text-xl font-semibold text-slate-900">TaskFlow</h1>
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