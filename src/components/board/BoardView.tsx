"use client";

import { useState } from "react";
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

    // Sensor'ları kur
    const sensors = useSensors(
        useSensor(PointerSensor, {
            // Karta tıklayınca direkt sürükleme başlamasın, 5px hareket gerekir
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
    };

    const handleDragOver = (e: DragOverEvent) => {
        const { active, over } = e;
        if (!over) return;

        const activeData = active.data.current as DragData | undefined;
        const overData = over.data.current as DragData | undefined;
        if (!activeData || !overData) return;

        // Sadece kart sürükleme için: kart farklı column'a girince cache'i güncelle
        if (activeData.type !== "card") return;

        // Kart bir column'un üstünde mi yoksa başka bir kartın üstünde mi?
        const overColumnId =
            overData.type === "column"
                ? overData.column.id
                : overData.type === "card"
                    ? overData.columnId
                    : null;

        if (!overColumnId) return;
        if (activeData.columnId === overColumnId) return;

        // Kartı yeni column'a taşı (sadece local cache, henüz API'ye değil)
        qc.setQueryData<BoardWithColumns>(boardKey(boardId), (old) => {
            if (!old) return old;
            return moveCardBetweenColumns(
                old,
                active.id as string,
                activeData.columnId,
                overColumnId,
            );
        });
    };

    const handleDragEnd = (e: DragEndEvent) => {
        const { active, over } = e;
        setDrag({ type: null, id: null });

        if (!over) return;
        if (active.id === over.id) return;

        const activeData = active.data.current as DragData | undefined;
        const overData = over.data.current as DragData | undefined;
        if (!activeData || !overData) return;

        // Column reorder
        if (activeData.type === "column" && overData.type === "column") {
            qc.setQueryData<BoardWithColumns>(boardKey(boardId), (old) => {
                if (!old) return old;
                const oldIdx = old.columns.findIndex((c) => c.id === active.id);
                const newIdx = old.columns.findIndex((c) => c.id === over.id);
                if (oldIdx === -1 || newIdx === -1) return old;
                const newColumns = [...old.columns];
                const [moved] = newColumns.splice(oldIdx, 1);
                newColumns.splice(newIdx, 0, moved);
                return { ...old, columns: newColumns };
            });
            return;
        }

        // Card reorder (aynı column içinde veya çapraz)
        if (activeData.type === "card") {
            const overColumnId =
                overData.type === "column"
                    ? overData.column.id
                    : overData.type === "card"
                        ? overData.columnId
                        : null;
            if (!overColumnId) return;

            qc.setQueryData<BoardWithColumns>(boardKey(boardId), (old) => {
                if (!old) return old;
                return reorderCardInColumn(
                    old,
                    active.id as string,
                    over.id as string,
                    overColumnId,
                );
            });
        }
    };

    const handleDragCancel = () => {
        setDrag({ type: null, id: null });
    };

    // Drag overlay için aktif item'ı bul
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

/* ----- Cache update helpers (saf fonksiyonlar) ----- */

function moveCardBetweenColumns(
    board: BoardWithColumns,
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
): BoardWithColumns {
    const columns = board.columns.map((col) => {
        if (col.id === fromColumnId) {
            return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
        }
        if (col.id === toColumnId) {
            const card = board.columns
                .flatMap((c) => c.cards)
                .find((c) => c.id === cardId);
            if (!card) return col;
            // Geçici: en sona ekle. handleDragEnd'de doğru yere koyulacak.
            return { ...col, cards: [...col.cards, { ...card, columnId: toColumnId }] };
        }
        return col;
    });
    return { ...board, columns };
}

function reorderCardInColumn(
    board: BoardWithColumns,
    cardId: string,
    overId: string,
    overColumnId: string,
): BoardWithColumns {
    const targetCol = board.columns.find((c) => c.id === overColumnId);
    if (!targetCol) return board;

    const cardIdx = targetCol.cards.findIndex((c) => c.id === cardId);
    const overIdx = targetCol.cards.findIndex((c) => c.id === overId);

    // Eğer kart hedef column'da değilse (column'un üstüne bırakıldıysa) sona ekleyelim zaten
    if (cardIdx === -1) return board;
    if (overIdx === -1) return board;
    if (cardIdx === overIdx) return board;

    const newCards = [...targetCol.cards];
    const [moved] = newCards.splice(cardIdx, 1);
    newCards.splice(overIdx, 0, moved);

    const columns = board.columns.map((c) =>
        c.id === overColumnId ? { ...c, cards: newCards } : c,
    );
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