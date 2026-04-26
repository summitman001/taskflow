"use client";

import { useRef } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import { useBoardQuery, boardKey } from "@/hooks/useBoard";
import { useUIStore } from "@/stores/useUIStore";
import { useMoveCard, useMoveColumn } from "@/hooks/useDnd";
import { getPositionForIndex } from "@/lib/positioning";
import { ColumnList } from "./ColumnList";
import { CardEditDialog } from "./CardEditDialog";
import { CardOverlay } from "./CardOverlay";
import { ColumnOverlay } from "./ColumnOverlay";
import type { BoardWithColumns, DragData } from "@/types";

interface Props {
    boardId: string;
}

export function BoardView({ boardId }: Props) {
    const { data: board, isLoading, isError, error } = useBoardQuery(boardId);

    if (isLoading) return <BoardSkeleton />;
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

    return <BoardContent board={board} boardId={boardId} />;
}

function BoardContent({
    board,
    boardId,
}: {
    board: BoardWithColumns;
    boardId: string;
}) {
    const qc = useQueryClient();
    const setDrag = useUIStore((s) => s.setDrag);
    const drag = useUIStore((s) => s.drag);

    const moveCard = useMoveCard(boardId);
    const moveColumn = useMoveColumn(boardId);

    // Drag başlarken kartın orijinal lokasyonunu snapshot'la.
    // handleDragOver cache'i mutate ettiği için, end'de orijinal yer kaybolur.
    const dragStartColumnIdRef = useRef<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragStart = (e: DragStartEvent) => {
        const data = e.active.data.current as DragData | undefined;
        if (!data) return;

        setDrag({ type: data.type, id: e.active.id as string });

        // Kartın orijinal column'ını snapshot'la (drag-over cache'i bozmadan önce)
        if (data.type === "card") {
            dragStartColumnIdRef.current = data.columnId;
        } else {
            dragStartColumnIdRef.current = null;
        }
    };

    /**
     * Sürükleme sırasında kartı farklı column'a girince geçici cache update.
     * Bu sadece "preview" — final position handleDragEnd'de hesaplanacak.
     */
    const handleDragOver = (e: DragOverEvent) => {
        const { active, over } = e;
        if (!over) return;

        const activeData = active.data.current as DragData | undefined;
        const overData = over.data.current as DragData | undefined;
        if (!activeData || !overData) return;
        if (activeData.type !== "card") return;

        const overColumnId =
            overData.type === "column"
                ? overData.column.id
                : overData.type === "card"
                    ? overData.columnId
                    : null;
        if (!overColumnId) return;
        if (activeData.columnId === overColumnId) return;

        // Kartı yeni column'a "preview" olarak taşı
        qc.setQueryData<BoardWithColumns>(boardKey(boardId), (old) => {
            if (!old) return old;
            return previewCardMove(old, active.id as string, overColumnId);
        });
    };

    const handleDragEnd = (e: DragEndEvent) => {
        const { active, over } = e;
        setDrag({ type: null, id: null });

        if (!over) return;

        const activeData = active.data.current as DragData | undefined;
        const overData = over.data.current as DragData | undefined;
        if (!activeData || !overData) return;

        const currentBoard = qc.getQueryData<BoardWithColumns>(boardKey(boardId));
        if (!currentBoard) return;

        /* ----- Column reorder ----- */
        if (activeData.type === "column" && overData.type === "column") {
            if (active.id === over.id) return;

            const oldIdx = currentBoard.columns.findIndex((c) => c.id === active.id);
            const newIdx = currentBoard.columns.findIndex((c) => c.id === over.id);
            if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return;

            const newPosition = getPositionForIndex(
                currentBoard.columns,
                newIdx,
                active.id as string,
            );

            moveColumn.mutate({
                columnId: active.id as string,
                newPosition,
                newIndex: newIdx,
            });
            return;
        }

        /* ----- Card reorder ----- */
        if (activeData.type === "card") {
            const overColumnId =
                overData.type === "column"
                    ? overData.column.id
                    : overData.type === "card"
                        ? overData.columnId
                        : null;
            if (!overColumnId) return;

            const targetCol = currentBoard.columns.find((c) => c.id === overColumnId);
            if (!targetCol) return;

            const cardCurrentIdx = targetCol.cards.findIndex(
                (c) => c.id === active.id,
            );

            let targetIndex: number;

            if (overData.type === "column") {
                targetIndex =
                    cardCurrentIdx >= 0
                        ? targetCol.cards.length - 1
                        : targetCol.cards.length;
            } else if (active.id === over.id) {
                targetIndex =
                    cardCurrentIdx >= 0 ? cardCurrentIdx : targetCol.cards.length;
            } else {
                targetIndex = targetCol.cards.findIndex((c) => c.id === over.id);
                if (targetIndex === -1) return;
            }

            // Drag start'taki orijinal column'ı kullan (cache mutate edilmiş olabilir)
            const originalColumnId = dragStartColumnIdRef.current;
            dragStartColumnIdRef.current = null; // temizle

            // No-op: kart aynı column'da aynı indekse geri bırakıldıysa
            const isSameColumn = originalColumnId === overColumnId;

            if (isSameColumn && cardCurrentIdx === targetIndex) {
                const originalCard = currentBoard.columns
                    .flatMap((c) => c.cards)
                    .find((c) => c.id === active.id);

                if (!originalCard) return;
            }

            const newPosition = getPositionForIndex(
                targetCol.cards,
                targetIndex,
                active.id as string,
            );

            moveCard.mutate({
                cardId: active.id as string,
                toColumnId: overColumnId,
                newPosition,
                newIndex: targetIndex,
            });
        }
    };

    const handleDragCancel = () => {
        setDrag({ type: null, id: null });
        // Preview cache update'i geri al
        qc.invalidateQueries({ queryKey: boardKey(boardId) });
    };

    const activeCard =
        drag.type === "card"
            ? board.columns.flatMap((c) => c.cards).find((c) => c.id === drag.id)
            : null;
    const activeColumn =
        drag.type === "column"
            ? board.columns.find((c) => c.id === drag.id)
            : null;

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

            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <ColumnList board={board} />

                <DragOverlay>
                    {activeCard && <CardOverlay card={activeCard} />}
                    {activeColumn && <ColumnOverlay column={activeColumn} />}
                </DragOverlay>
            </DndContext>

            <CardEditDialog boardId={boardId} board={board} />
        </div>
    );
}

/* ----- Preview transform (handleDragOver için) ----- */

function previewCardMove(
    board: BoardWithColumns,
    cardId: string,
    toColumnId: string,
): BoardWithColumns {
    let movedCard: BoardWithColumns["columns"][0]["cards"][0] | undefined;
    const columnsWithoutCard = board.columns.map((col) => {
        const found = col.cards.find((c) => c.id === cardId);
        if (found) movedCard = found;
        return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
    });
    if (!movedCard) return board;

    const columns = columnsWithoutCard.map((col) => {
        if (col.id !== toColumnId) return col;
        return {
            ...col,
            cards: [...col.cards, { ...movedCard!, columnId: toColumnId }],
        };
    });

    return { ...board, columns };
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