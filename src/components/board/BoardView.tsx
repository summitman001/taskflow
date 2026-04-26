"use client";

import { useBoardQuery } from "@/hooks/useBoard";
import { ColumnList } from "./ColumnList";
import { CardEditDialog } from "./CardEditDialog";

interface Props {
    boardId: string;
}

export function BoardView({ boardId }: Props) {
    const { data: board, isLoading, isError, error } = useBoardQuery(boardId);

    if (isLoading) {
        return <BoardSkeleton />;
    }

    if (isError) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
                    Failed to load board: {error?.message ?? "Unknown error"}
                </div>
            </div>
        );
    }

    if (!board) {
        return (
            <div className="flex h-full items-center justify-center text-slate-500">
                Board not found
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <div className="border-b bg-white px-6 py-4">
                <h1 className="text-xl font-semibold text-slate-900">{board.title}</h1>
                <p className="mt-0.5 text-sm text-slate-500">
                    {board.columns.length} column
                    {board.columns.length === 1 ? "" : "s"} ·{" "}
                    {board.columns.reduce((sum, c) => sum + c.cards.length, 0)} cards
                </p>
            </div>

            <ColumnList board={board} />

            <CardEditDialog boardId={boardId} board={board} />
        </div>
    );
}

function BoardSkeleton() {
    return (
        <div className="flex h-full gap-4 overflow-hidden p-6">
            {Array.from({ length: 3 }).map((_, i) => (
                <div
                    key={i}
                    className="h-96 w-72 flex-shrink-0 animate-pulse rounded-lg bg-slate-200"
                />
            ))}
        </div>
    );
}