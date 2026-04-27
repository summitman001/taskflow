"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, Plus, Sparkles, Trash2 } from "lucide-react";
import { useBoardsQuery, useCreateSampleBoard, useDeleteBoard } from "@/hooks/useBoards";
import { Button } from "@/components/ui/button";
import { CreateBoardDialog } from "./CreateBoardDialog";
import { DeleteBoardDialog } from "./DeleteBoardDialog";
import { getColorFromId } from "@/lib/utils";

export function BoardsList() {
    const { data: boards, isLoading, isError, error } = useBoardsQuery();
    const deleteBoard = useDeleteBoard();
    const [createOpen, setCreateOpen] = useState(false);
    const [boardToDelete, setBoardToDelete] = useState<{
        id: string;
        title: string;
    } | null>(null);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-32 animate-pulse rounded-lg border border-slate-200 bg-white"
                    />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
                Failed to load boards: {error?.message ?? "Unknown error"}
            </div>
        );
    }

    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                    {boards?.length ?? 0} board{boards?.length === 1 ? "" : "s"}
                </p>
                <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New board
                </Button>
            </div>

            {boards && boards.length === 0 ? (
                <EmptyState onCreate={() => setCreateOpen(true)} />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {boards?.map((board) => (
                        <BoardCard
                            key={board.id}
                            board={board}
                            onDeleteClick={() =>
                                setBoardToDelete({ id: board.id, title: board.title })
                            }
                        />
                    ))}
                </div>
            )}

            <CreateBoardDialog open={createOpen} onOpenChange={setCreateOpen} />

            <DeleteBoardDialog
                board={boardToDelete}
                onClose={() => setBoardToDelete(null)}
                onConfirm={(id) => {
                    deleteBoard.mutate(id, {
                        onSuccess: () => setBoardToDelete(null),
                    });
                }}
                isDeleting={deleteBoard.isPending}
            />
        </>
    );
}

function BoardCard({
    board,
    onDeleteClick,
}: {
    board: { id: string; title: string; _count: { columns: number } };
    onDeleteClick: () => void;
}) {
    const colorClass = getColorFromId(board.id);

    return (
        <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm">
            {/* Renk şeridi */}
            <div className={`h-2 w-full ${colorClass}`} />

            <Link href={`/boards/${board.id}`} className="block p-5">
                <h3 className="font-semibold text-slate-900">{board.title}</h3>
                <p className="mt-1 text-sm text-slate-500">
                    {board._count.columns} column{board._count.columns === 1 ? "" : "s"}
                </p>
            </Link>

            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDeleteClick();
                }}
                className="absolute right-3 top-5 rounded-md p-1.5 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                aria-label={`Delete board ${board.title}`}
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
    const createSample = useCreateSampleBoard();

    return (
        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            {/* Custom SVG illustration */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                <svg
                    viewBox="0 0 80 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-20 w-20"
                >
                    <rect
                        x="8"
                        y="16"
                        width="20"
                        height="48"
                        rx="3"
                        className="fill-blue-100 stroke-blue-300"
                        strokeWidth="1.5"
                    />
                    <rect
                        x="30"
                        y="16"
                        width="20"
                        height="36"
                        rx="3"
                        className="fill-emerald-100 stroke-emerald-300"
                        strokeWidth="1.5"
                    />
                    <rect
                        x="52"
                        y="16"
                        width="20"
                        height="24"
                        rx="3"
                        className="fill-amber-100 stroke-amber-300"
                        strokeWidth="1.5"
                    />
                    <line x1="12" y1="24" x2="24" y2="24" className="stroke-blue-300" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="12" y1="30" x2="20" y2="30" className="stroke-blue-300" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="34" y1="24" x2="46" y2="24" className="stroke-emerald-300" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="56" y1="24" x2="68" y2="24" className="stroke-amber-300" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </div>

            <h3 className="mb-2 text-xl font-semibold text-slate-900">
                Welcome to TaskFlow 👋
            </h3>
            <p className="mx-auto mb-6 max-w-sm text-sm text-slate-500">
                Start by creating an empty board, or load a sample sprint to explore
                the drag-and-drop, themes, and keyboard shortcuts.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                    onClick={() => createSample.mutate()}
                    disabled={createSample.isPending}
                    variant="outline"
                    size="lg"
                >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {createSample.isPending ? "Loading sample…" : "Try with sample data"}
                </Button>

                <Button onClick={onCreate} size="lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Create empty board
                </Button>
            </div>

            <p className="mt-6 text-[11px] text-slate-400">
                Sample data is yours to edit or delete after.
            </p>
        </div>
    );
}