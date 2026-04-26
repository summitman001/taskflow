import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function BoardPage({
    params,
}: {
    params: Promise<{ boardId: string }>;
}) {
    const { boardId } = await params;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <Link
                href="/boards"
                className="mb-6 inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
            >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to boards
            </Link>
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
                <h1 className="text-2xl font-semibold text-slate-900">Board view</h1>
                <p className="mt-2 text-sm text-slate-500">
                    Board ID: <code className="rounded bg-slate-100 px-2 py-1">{boardId}</code>
                </p>
                <p className="mt-4 text-slate-600">Kanban view coming in Step 6 ✨</p>
            </div>
        </div>
    );
}