"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/fetcher";
import { boardKey } from "./useBoard";
import type { Column } from "@/types";

export function useCreateColumn(boardId: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (input: { title: string; position: string }) =>
            apiFetch<Column>("/api/columns", {
                method: "POST",
                body: JSON.stringify({ ...input, boardId }),
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: boardKey(boardId) });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

export function useUpdateColumn(boardId: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({
            columnId,
            title,
        }: {
            columnId: string;
            title: string;
        }) =>
            apiFetch<Column>(`/api/columns/${columnId}`, {
                method: "PATCH",
                body: JSON.stringify({ title }),
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: boardKey(boardId) });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

export function useDeleteColumn(boardId: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (columnId: string) =>
            apiFetch<{ success: boolean }>(`/api/columns/${columnId}`, {
                method: "DELETE",
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: boardKey(boardId) });
            toast.success("Column deleted");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}