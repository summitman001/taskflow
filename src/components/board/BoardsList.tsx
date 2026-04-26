"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, Plus, Trash2 } from "lucide-react";
import { useBoardsQuery, useDeleteBoard } from "@/hooks/useBoards";
import { Button } from "@/components/ui/button";
import { CreateBoardDialog } from "./CreateBoardDialog";
import { DeleteBoardDialog } from "./DeleteBoardDialog";

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
    return (
        <div className="group relative rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm">
            <Link href={`/boards/${board.id}`} className="block">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-slate-100">
                    <LayoutGrid className="h-5 w-5 text-slate-600" />
                </div>
                <h3 className="font-semibold text-slate-900">{board.title}</h3>
                <p className="mt-1 text-sm text-slate-500">
                    {board._count.columns} column{board._count.columns === 1 ? "" : "s"}
                </p>
            </Link>

            {/* Delete button — sadece hover'da görünür */}
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDeleteClick();
                }}
                className="absolute right-3 top-3 rounded-md p-1.5 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                aria-label={`Delete board ${board.title}`}
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
    return (
        <div className="rounded-lg border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <LayoutGrid className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-slate-900">
                No boards yet
            </h3>
            <p className="mb-6 text-sm text-slate-500">
                Create your first board to start organizing tasks.
            </p>
            <Button onClick={onCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create board
            </Button>
        </div>
    );
}