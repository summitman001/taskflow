import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { BoardView } from "@/components/board/BoardView";

export default async function BoardPage({
    params,
}: {
    params: Promise<{ boardId: string }>;
}) {
    const { boardId } = await params;

    return (
        <div className="flex h-screen flex-col bg-slate-50">
            <header className="border-b bg-white">
                <div className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/boards"
                            className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Boards
                        </Link>
                    </div>
                    <UserButton />
                </div>
            </header>

            <main className="flex-1 overflow-hidden">
                <BoardView boardId={boardId} />
            </main>
        </div>
    );
}