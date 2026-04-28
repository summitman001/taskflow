"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, Plus, Trash2, Sparkles } from "lucide-react";
import {
  useBoardsQuery,
  useDeleteBoard,
  useCreateSampleBoard,
  type BoardListItem,
} from "@/hooks/useBoards";
import { Button } from "@/components/ui/button";
import { CreateBoardDialog } from "./CreateBoardDialog";
import { DeleteBoardDialog } from "./DeleteBoardDialog";
import { BoardsStats } from "./BoardsStats";
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
      <div className="space-y-8">
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>

        {/* Boards skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
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
      {/* Stats hero */}
      {boards && boards.length > 0 && (
        <div className="mb-10">
          <BoardsStats boards={boards} />
        </div>
      )}

      {/* Section header */}
      {boards && boards.length > 0 && (
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">
              Your boards
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {boards.length} board{boards.length === 1 ? "" : "s"} · Click any
              to open
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New board
          </Button>
        </div>
      )}

      {/* Empty or list */}
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
  board: BoardListItem;
  onDeleteClick: () => void;
}) {
  const colorClass = getColorFromId(board.id);
  const totalCards = board.columns.reduce((sum, c) => sum + c._count.cards, 0);

  // En çok kart içeren column'a göre normalize et (görsel oran)
  const maxCards = Math.max(...board.columns.map((c) => c._count.cards), 1);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08)]">
      {/* Top edge highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"
      />

      {/* Color strip */}
      <div className={`h-1.5 w-full ${colorClass}`} />

      <Link href={`/boards/${board.id}`} className="block p-5">
        {/* Title */}
        <h3 className="text-base font-semibold tracking-tight text-slate-900 line-clamp-1">
          {board.title}
        </h3>

        {/* Mini preview: column heights */}
        <div className="mt-4 flex h-16 items-end gap-1.5">
          {board.columns.length > 0 ? (
            board.columns.map((col) => {
              const heightPercent = Math.max(
                (col._count.cards / maxCards) * 100,
                8, // Min 8% → boş column'lar bile görünür
              );
              return (
                <div
                  key={col.id}
                  className="group/col relative flex-1"
                  title={`${col.title}: ${col._count.cards} card${col._count.cards === 1 ? "" : "s"}`}
                >
                  <div
                    className="rounded-sm bg-gradient-to-t from-slate-200 to-slate-100 transition-colors group-hover:from-slate-300 group-hover:to-slate-200"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
              );
            })
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-slate-200 text-[11px] text-slate-400">
              Empty board
            </div>
          )}
        </div>

        {/* Footer stats */}
        <div className="mt-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-slate-500">
            <span className="tabular-nums">
              {board._count.columns} col{board._count.columns === 1 ? "" : "s"}
            </span>
            <span className="text-slate-300">·</span>
            <span className="tabular-nums">
              {totalCards} card{totalCards === 1 ? "" : "s"}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            {formatRelativeTime(board.updatedAt)}
          </span>
        </div>
      </Link>

      {/* Delete button — hover'da görünür */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDeleteClick();
        }}
        className="absolute right-3 top-5 rounded-md bg-white/90 p-1.5 text-slate-400 opacity-0 backdrop-blur-sm transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
        aria-label={`Delete board ${board.title}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Relative time helper: "2h ago", "1d ago", "Mar 15"
 */
function formatRelativeTime(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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