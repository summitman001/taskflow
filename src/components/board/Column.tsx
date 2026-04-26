"use client";

import { useState } from "react";
import { MoreHorizontal, Trash2, Pencil } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useDeleteColumn, useUpdateColumn } from "@/hooks/useColumns";
import { Card } from "./Card";
import { AddCardButton } from "./AddCardButton";
import type { ColumnWithCards } from "@/types";

interface Props {
    column: ColumnWithCards;
    boardId: string;
}

export function Column({ column, boardId }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(column.title);

    const updateColumn = useUpdateColumn(boardId);
    const deleteColumn = useDeleteColumn(boardId);

    const handleSubmitTitle = () => {
        const trimmed = editTitle.trim();
        if (!trimmed || trimmed === column.title) {
            setEditTitle(column.title);
            setIsEditing(false);
            return;
        }
        updateColumn.mutate(
            { columnId: column.id, title: trimmed },
            { onSuccess: () => setIsEditing(false) },
        );
    };

    const handleDelete = () => {
        if (
            column.cards.length > 0 &&
            !confirm(
                `Delete "${column.title}" and its ${column.cards.length} card${column.cards.length === 1 ? "" : "s"}?`,
            )
        ) {
            return;
        }
        deleteColumn.mutate(column.id);
    };

    return (
        <div className="flex h-full w-72 flex-shrink-0 flex-col rounded-lg bg-slate-100">
            {/* Column header */}
            <div className="flex items-center justify-between gap-2 px-3 py-3">
                {isEditing ? (
                    <Input
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={handleSubmitTitle}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSubmitTitle();
                            if (e.key === "Escape") {
                                setEditTitle(column.title);
                                setIsEditing(false);
                            }
                        }}
                        maxLength={200}
                        className="h-8 bg-white"
                    />
                ) : (
                    <h3
                        onClick={() => setIsEditing(true)}
                        className="flex-1 cursor-pointer truncate text-sm font-semibold text-slate-700"
                    >
                        {column.title}
                        <span className="ml-2 text-xs font-normal text-slate-400">
                            {column.cards.length}
                        </span>
                    </h3>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger className="rounded p-1 text-slate-500 hover:bg-slate-200">
                        <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={handleDelete}
                            className="text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete column
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Cards list */}
            <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
                {column.cards.map((card) => (
                    <Card key={card.id} card={card} />
                ))}
            </div>

            {/* Add card button */}
            <div className="px-2 pb-3">
                <AddCardButton
                    boardId={boardId}
                    columnId={column.id}
                    existingCards={column.cards}
                />
            </div>
        </div>
    );
}