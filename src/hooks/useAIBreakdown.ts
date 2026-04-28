"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/fetcher";

export interface AISubtask {
    title: string;
    description: string;
}

export interface BreakdownResponse {
    subtasks: AISubtask[];
    isMock: boolean;
}

/**
 * Bir kart için AI subtask breakdown iste.
 * Mutation pattern — refetch yok, isolated request.
 */
export function useAIBreakdown() {
    return useMutation({
        mutationFn: (cardId: string) =>
            apiFetch<BreakdownResponse>("/api/ai/breakdown", {
                method: "POST",
                body: JSON.stringify({ cardId }),
            }),
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}