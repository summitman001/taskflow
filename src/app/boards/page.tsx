import { auth, currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

export default async function BoardsPage() {
    const { userId } = await auth();
    const user = await currentUser();

    return (
        <main className="min-h-screen bg-slate-50 p-8">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">My Boards</h1>
                    <p className="text-slate-600">
                        Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                    </p>
                </div>
                <UserButton />
            </header>

            <div className="rounded-lg border border-slate-200 bg-white p-6">
                <p className="text-slate-500">
                    Boards will be listed here. (Coming in Step 5)
                </p>
                <p className="mt-2 text-xs text-slate-400">
                    Your Clerk user ID: <code className="rounded bg-slate-100 px-2 py-1">{userId}</code>
                </p>
            </div>
        </main>
    );
}