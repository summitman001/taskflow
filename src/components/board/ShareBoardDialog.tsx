"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { X, UserPlus, Mail, Shield, Eye, Edit3, Crown, Trash2 } from "lucide-react";
import { useAddMember, useRemoveMember, useUpdateMemberRole } from "@/hooks/useBoardMembers";
import type { BoardFull, Role } from "@/types";
import { useUser } from "@clerk/nextjs";

type ShareBoardDialogProps = {
    board: BoardFull;
    isOpen: boolean;
    onClose: () => void;
};

export function ShareBoardDialog({ board, isOpen, onClose }: ShareBoardDialogProps) {
    const { user } = useUser();
    const [email, setEmail] = useState("");
    const [selectedRole, setSelectedRole] = useState<"EDITOR" | "VIEWER">("EDITOR");

    const addMember = useAddMember();
    const removeMember = useRemoveMember();
    const updateRole = useUpdateMemberRole();

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        await addMember.mutateAsync({
            boardId: board.id,
            email: email.trim(),
            role: selectedRole,
        });

        setEmail("");
    };

    const handleRemove = (memberId: string) => {
        if (!confirm("Remove this member?")) return;
        removeMember.mutate({ boardId: board.id, memberId });
    };

    const handleRoleChange = (memberId: string, newRole: Role) => {
        updateRole.mutate({ boardId: board.id, memberId, role: newRole });
    };

    const isOwner = board.ownerId === user?.id;
    const currentUserMember = board.members.find((m) => m.userId === user?.id);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
            <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4">
                    <h2 className="text-lg font-semibold">Share Board</h2>
                    <button
                        onClick={onClose}
                        className="rounded p-1 hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Invite Form */}
                {(isOwner || currentUserMember?.role === "EDITOR") && (
                    <form onSubmit={handleInvite} className="border-b p-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Invite by email
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="colleague@example.com"
                                    className="w-full rounded border px-10 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value as "EDITOR" | "VIEWER")}
                                className="rounded border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="EDITOR">Editor</option>
                                <option value="VIEWER">Viewer</option>
                            </select>
                            <button
                                type="submit"
                                disabled={!email.trim() || addMember.isPending}
                                className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <UserPlus className="h-4 w-4" />
                                Invite
                            </button>
                        </div>
                    </form>
                )}

                {/* Members List */}
                <div className="max-h-96 overflow-y-auto p-4">
                    <h3 className="mb-3 text-sm font-medium text-gray-700">
                        Members ({board.members.length})
                    </h3>
                    <div className="space-y-2">
                        {board.members.map((member) => {
                            const isSelf = member.userId === user?.id;
                            const canManage = isOwner && member.role !== "OWNER";

                            return (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-semibold text-white">
                                            {member.user.name?.[0]?.toUpperCase() || member.user.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {member.user.name || member.user.email}
                                                {isSelf && (
                                                    <span className="ml-2 text-xs text-gray-500">(You)</span>
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-500">{member.user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* Role Badge/Selector */}
                                        {canManage ? (
                                            <select
                                                value={member.role}
                                                onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                                                className="rounded border px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            >
                                                <option value="EDITOR">Editor</option>
                                                <option value="VIEWER">Viewer</option>
                                            </select>
                                        ) : (
                                            <RoleBadge role={member.role} />
                                        )}

                                        {/* Remove Button */}
                                        {canManage && (
                                            <button
                                                onClick={() => handleRemove(member.id)}
                                                className="rounded p-1.5 text-red-600 hover:bg-red-50"
                                                title="Remove member"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}

                                        {/* Self-leave button */}
                                        {isSelf && member.role !== "OWNER" && (
                                            <button
                                                onClick={() => handleRemove(member.id)}
                                                className="text-sm text-red-600 hover:underline"
                                            >
                                                Leave
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Role Legend */}
                <div className="border-t bg-gray-50 p-4">
                    <p className="mb-2 text-xs font-medium text-gray-700">Roles:</p>
                    <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                            <Crown className="h-3 w-3" />
                            <span><strong>Owner:</strong> Full control + delete board</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Edit3 className="h-3 w-3" />
                            <span><strong>Editor:</strong> Edit cards, columns, invite members</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Eye className="h-3 w-3" />
                            <span><strong>Viewer:</strong> Read-only access</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

// Role Badge Component
function RoleBadge({ role }: { role: Role }) {
    const config = {
        OWNER: { icon: Crown, color: "text-yellow-700 bg-yellow-100", label: "Owner" },
        EDITOR: { icon: Edit3, color: "text-blue-700 bg-blue-100", label: "Editor" },
        VIEWER: { icon: Eye, color: "text-gray-700 bg-gray-100", label: "Viewer" },
    };

    const { icon: Icon, color, label } = config[role];

    return (
        <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${color}`}>
            <Icon className="h-3 w-3" />
            {label}
        </span>
    );
}