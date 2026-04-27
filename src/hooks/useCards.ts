"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/fetcher";
import { boardKey } from "./useBoard";
import type { Card } from "@/types";

export function useCreateCard(boardId: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (input: {
            columnId: string;
            title: string;
            position: string;
            priority?: string | null;
            dueDate?: string | null;
        }) =>
            apiFetch<Card>("/api/cards", {
                method: "POST",
                body: JSON.stringify(input),
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: boardKey(boardId) });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

export function useUpdateCard(boardId: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({
            cardId,
            ...data
        }: {
            cardId: string;
            title?: string;
            description?: string | null;
            priority?: string | null;
            dueDate?: string | null;
        }) =>
            apiFetch<Card>(`/api/cards/${cardId}`, {
                method: "PATCH",
                body: JSON.stringify(data),
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: boardKey(boardId) });
            toast.success("Card updated");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

export function useDeleteCard(boardId: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (cardId: string) =>
            apiFetch<{ success: boolean }>(`/api/cards/${cardId}`, {
                method: "DELETE",
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: boardKey(boardId) });
            toast.success("Card deleted");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}