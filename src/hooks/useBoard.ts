"use client";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/fetcher";
import type { BoardFull } from "@/types"; // ⭐ Updated type

export const boardKey = (boardId: string) => ["board", boardId] as const;

export function useBoardQuery(boardId: string) {
    return useQuery({
        queryKey: boardKey(boardId),
        queryFn: () => apiFetch<BoardFull>(`/api/boards/${boardId}`), // ⭐ Now includes members
    });
}