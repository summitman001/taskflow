"use client";

import { useState } from "react";
import { MoreHorizontal, Trash2, Pencil, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useDeleteColumn, useUpdateColumn } from "@/hooks/useColumns";
import { useBoardTheme } from "@/hooks/useTheme";
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

    const { theme } = useBoardTheme(boardId);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        data: { type: "column", column },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

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

    const cardIds = column.cards.map((c) => c.id);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex h-full w-72 flex-shrink-0 flex-col rounded-xl border backdrop-blur-sm transition-all ${
                theme.isDark
                    ? "border-slate-700/50 bg-slate-800/40"
                    : "border-slate-200 bg-slate-50/80"
            } ${isDragging ? "opacity-50 ring-2 ring-blue-400" : ""}`}
        >
            {/* Column header */}
            <div className={`flex items-center justify-between gap-1 border-b px-3 py-3 ${
                theme.isDark ? "border-slate-700/40" : "border-slate-200/60"
            }`}>
                {/* Drag handle */}
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="cursor-grab touch-none rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 active:cursor-grabbing"
                    aria-label={`Drag column ${column.title}`}
                >
                    <GripVertical className="h-4 w-4" />
                </button>

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
                        className={`flex flex-1 cursor-pointer items-center gap-2 truncate text-sm font-semibold ${
                            theme.isDark ? "text-slate-200" : "text-slate-700"
                        }`}
                    >
                        <span className="truncate">{column.title}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums ${
                            theme.isDark
                                ? "bg-slate-700 text-slate-300"
                                : "bg-slate-200 text-slate-600"
                        }`}>
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
                            disabled={deleteColumn.isPending}
                            className="text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete column
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Cards list */}
            <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
                    {column.cards.length === 0 ? (
                        <div className="flex h-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-200 bg-white/40 px-3 text-center transition hover:border-slate-300 hover:bg-white/60">
                            <p className="text-xs font-medium text-slate-400">No cards yet</p>
                            <p className="text-[11px] text-slate-400">Drop here or click below to add</p>
                        </div>
                    ) : (
                        column.cards.map((card) => (
                            <Card key={card.id} card={card} columnId={column.id} />
                        ))
                    )}
                </div>
            </SortableContext>

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