"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/fetcher";
import type { BoardWithColumns } from "@/types";

export const boardKey = (boardId: string) => ["board", boardId] as const;

/**
 * Tek board'u column ve kartlarıyla birlikte çek.
 */
export function useBoardQuery(boardId: string) {
    return useQuery({
        queryKey: boardKey(boardId),
        queryFn: () => apiFetch<BoardWithColumns>(`/api/boards/${boardId}`),
    });
}