"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/fetcher";
import { boardKey } from "./useBoard";
import type { BoardMember, Role } from "@/types";

type AddMemberInput = {
    boardId: string;
    email: string;
    role?: "EDITOR" | "VIEWER";
};

type UpdateRoleInput = {
    boardId: string;
    memberId: string;
    role: Role;
};

/**
 * Add member to board
 */
export function useAddMember() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ boardId, email, role }: AddMemberInput) =>
            apiFetch<BoardMember>(`/api/boards/${boardId}/members`, {
                method: "POST",
                body: JSON.stringify({ email, role }),
            }),
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: boardKey(vars.boardId) });
            qc.invalidateQueries({ queryKey: ["boards"] });
            toast.success("Member added");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

/**
 * Remove member from board
 */
export function useRemoveMember() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ boardId, memberId }: { boardId: string; memberId: string }) =>
            apiFetch(`/api/boards/${boardId}/members/${memberId}`, {
                method: "DELETE",
            }),
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: boardKey(vars.boardId) });
            qc.invalidateQueries({ queryKey: ["boards"] });
            toast.success("Member removed");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

/**
 * Update member role
 */
export function useUpdateMemberRole() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ boardId, memberId, role }: UpdateRoleInput) =>
            apiFetch(`/api/boards/${boardId}/members/${memberId}`, {
                method: "PATCH",
                body: JSON.stringify({ role }),
            }),
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: boardKey(vars.boardId) });
            toast.success("Role updated");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}