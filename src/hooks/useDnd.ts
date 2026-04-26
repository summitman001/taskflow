"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/fetcher";
import { boardKey } from "./useBoard";
import type { BoardWithColumns, Card } from "@/types";

interface MoveCardInput {
    cardId: string;
    toColumnId: string;
    newPosition: string;
    // Optimistic UI için lazım: kartın yeni indeks pozisyonu
    newIndex: number;
}

/**
 * Kart taşıma — optimistic + rollback.
 *
 * Strateji:
 * 1. onMutate: Cache'i hemen güncelle, eski cache'i snapshot'la sakla
 * 2. mutationFn: PATCH /api/cards/:id ile sunucuya bildir
 * 3. onError: Snapshot'a geri dön + toast
 * 4. onSettled: Invalidate (sunucu ile syncle)
 */
export function useMoveCard(boardId: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({ cardId, toColumnId, newPosition }: MoveCardInput) => {
            return apiFetch<Card>(`/api/cards/${cardId}`, {
                method: "PATCH",
                body: JSON.stringify({
                    columnId: toColumnId,
                    position: newPosition,
                }),
            });
        },

        onMutate: async (input) => {
            // 1. Aktif refetch'leri durdur (optimistic update'i ezmesinler)
            await qc.cancelQueries({ queryKey: boardKey(boardId) });

            // 2. Eski cache'i snapshot'la (rollback için)
            const previous = qc.getQueryData<BoardWithColumns>(boardKey(boardId));

            // 3. Cache'i optimistic olarak güncelle
            qc.setQueryData<BoardWithColumns>(boardKey(boardId), (old) => {
                if (!old) return old;
                return applyCardMove(old, input);
            });

            return { previous };
        },

        onError: (error: Error, _input, context) => {
            // Rollback
            if (context?.previous) {
                qc.setQueryData(boardKey(boardId), context.previous);
            }
            toast.error(`Failed to move card: ${error.message}`);
        },

        onSettled: () => {
            // Sunucudan en güncel veriyi çek (cache'i otoriter olanla senkronize et)
            qc.invalidateQueries({ queryKey: boardKey(boardId) });
        },
    });
}

interface MoveColumnInput {
    columnId: string;
    newPosition: string;
    newIndex: number;
}

export function useMoveColumn(boardId: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({ columnId, newPosition }: MoveColumnInput) => {
            return apiFetch(`/api/columns/${columnId}`, {
                method: "PATCH",
                body: JSON.stringify({ position: newPosition }),
            });
        },

        onMutate: async (input) => {
            await qc.cancelQueries({ queryKey: boardKey(boardId) });
            const previous = qc.getQueryData<BoardWithColumns>(boardKey(boardId));

            qc.setQueryData<BoardWithColumns>(boardKey(boardId), (old) => {
                if (!old) return old;
                return applyColumnMove(old, input);
            });

            return { previous };
        },

        onError: (error: Error, _input, context) => {
            if (context?.previous) {
                qc.setQueryData(boardKey(boardId), context.previous);
            }
            toast.error(`Failed to move column: ${error.message}`);
        },

        onSettled: () => {
            qc.invalidateQueries({ queryKey: boardKey(boardId) });
        },
    });
}

/* ----- Saf cache transform fonksiyonları ----- */

function applyCardMove(
    board: BoardWithColumns,
    input: MoveCardInput,
): BoardWithColumns {
    const { cardId, toColumnId, newPosition, newIndex } = input;

    // Kartı tüm column'lardan çıkar
    let movedCard: Card | undefined;
    const columnsWithoutCard = board.columns.map((col) => {
        const found = col.cards.find((c) => c.id === cardId);
        if (found) movedCard = found;
        return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
    });

    if (!movedCard) return board;

    // Güncellenmiş kartı yeni column'a, doğru index'e ekle
    const updatedCard: Card = {
        ...movedCard,
        columnId: toColumnId,
        position: newPosition,
    };

    const columns = columnsWithoutCard.map((col) => {
        if (col.id !== toColumnId) return col;
        const newCards = [...col.cards];
        newCards.splice(newIndex, 0, updatedCard);
        return { ...col, cards: newCards };
    });

    return { ...board, columns };
}

function applyColumnMove(
    board: BoardWithColumns,
    input: MoveColumnInput,
): BoardWithColumns {
    const { columnId, newPosition, newIndex } = input;

    const oldIdx = board.columns.findIndex((c) => c.id === columnId);
    if (oldIdx === -1) return board;

    const updatedCol = { ...board.columns[oldIdx], position: newPosition };

    const withoutCol = [...board.columns];
    withoutCol.splice(oldIdx, 1);
    withoutCol.splice(newIndex, 0, updatedCol);

    return { ...board, columns: withoutCol };
}