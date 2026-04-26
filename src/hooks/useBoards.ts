"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/fetcher";
import type { Board } from "@/types";

// Liste sayfası için: board + column count
export type BoardListItem = Board & {
    _count: { columns: number };
};

const BOARDS_KEY = ["boards"] as const;

/**
 * Tüm board'ları çek.
 */
export function useBoardsQuery() {
    return useQuery({
        queryKey: BOARDS_KEY,
        queryFn: () => apiFetch<BoardListItem[]>("/api/boards"),
    });
}

/**
 * Yeni board oluştur.
 */
export function useCreateBoard() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (title: string) =>
            apiFetch<Board>("/api/boards", {
                method: "POST",
                body: JSON.stringify({ title }),
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: BOARDS_KEY });
            toast.success("Board created");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

/**
 * Board sil.
 */
export function useDeleteBoard() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (boardId: string) =>
            apiFetch<{ success: boolean }>(`/api/boards/${boardId}`, {
                method: "DELETE",
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: BOARDS_KEY });
            toast.success("Board deleted");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}