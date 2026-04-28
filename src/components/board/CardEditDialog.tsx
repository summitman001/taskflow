"use client";

import { useEffect, useState } from "react";
import { Activity, ChevronDown, Trash2, Calendar, X } from "lucide-react";
import { CardActivityList } from "./CardActivityList";
import { AIBreakdownPanel } from "./AIBreakdownPanel";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUIStore } from "@/stores/useUIStore";
import { useDeleteCard, useUpdateCard } from "@/hooks/useCards";
import { priorities, type Priority } from "@/lib/priority";
import { toDateInputValue } from "@/lib/date";
import type { BoardWithColumns } from "@/types";

interface Props {
    boardId: string;
    board: BoardWithColumns;
}

export function CardEditDialog({ boardId, board }: Props) {
    const editingCardId = useUIStore((s) => s.editingCardId);
    const setEditingCardId = useUIStore((s) => s.setEditingCardId);

    const card =
        editingCardId &&
        board.columns
            .flatMap((c) => c.cards)
            .find((c) => c.id === editingCardId);

    // Kartın bulunduğu column (subtask eklemek için)
    const cardColumn = card
        ? board.columns.find((col) => col.cards.some((c) => c.id === card.id))
        : null;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<Priority | null>(null);
    const [dueDate, setDueDate] = useState("");

    const updateCard = useUpdateCard(boardId);
    const deleteCard = useDeleteCard(boardId);

    // Kart değişince formu senkronize et
    useEffect(() => {
        if (card) {
            setTitle(card.title);
            setDescription(card.description ?? "");
            setPriority((card.priority as Priority | null) ?? null);
            setDueDate(toDateInputValue(card.dueDate));
        }
    }, [card]);

    const handleClose = () => setEditingCardId(null);

    const handleSave = () => {
        if (!card) return;
        const trimmedTitle = title.trim();
        if (!trimmedTitle) return;

        const trimmedDesc = description.trim();
        const newDueDate = dueDate ? new Date(dueDate).toISOString() : null;
        const newPriority = priority ?? null;

        // Hiç değişiklik yoksa close
        const noChange =
            trimmedTitle === card.title &&
            (trimmedDesc || null) === (card.description ?? null) &&
            newPriority === (card.priority ?? null) &&
            newDueDate === (card.dueDate ? new Date(card.dueDate).toISOString() : null);

        if (noChange) {
            handleClose();
            return;
        }

        updateCard.mutate(
            {
                cardId: card.id,
                title: trimmedTitle,
                description: trimmedDesc || null,
                priority: newPriority,
                dueDate: newDueDate,
            },
            { onSuccess: handleClose },
        );
    };

    const handleDelete = () => {
        if (!card) return;
        if (!confirm(`Delete "${card.title}"?`)) return;
        deleteCard.mutate(card.id, { onSuccess: handleClose });
    };

    return (
        <Dialog open={!!card} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit card</DialogTitle>
                    <DialogDescription>
                        Update the card details, set priority, or add a due date.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="card-title">Title</Label>
                        <Input
                            id="card-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={200}
                            disabled={updateCard.isPending}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="card-description">Description</Label>
                        <Textarea
                            id="card-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a more detailed description…"
                            rows={4}
                            disabled={updateCard.isPending}
                        />
                    </div>

                    {/* AI Breakdown */}
                    {card && cardColumn && (
                        <AIBreakdownPanel
                            cardId={card.id}
                            columnId={cardColumn.id}
                            columnCards={cardColumn.cards}
                            boardId={boardId}
                        />
                    )}

                    {/* Priority + Due Date */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <div className="flex flex-wrap gap-1.5">
                                {(Object.values(priorities) as Array<typeof priorities[Priority]>).map(
                                    (p) => {
                                        const Icon = p.icon;
                                        const isSelected = priority === p.id;
                                        return (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => setPriority(isSelected ? null : p.id)}
                                                disabled={updateCard.isPending}
                                                className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${isSelected
                                                    ? p.buttonClassName
                                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                                    }`}
                                            >
                                                <Icon className="h-3 w-3" />
                                                {p.label}
                                            </button>
                                        );
                                    },
                                )}
                            </div>
                            {priority && (
                                <button
                                    type="button"
                                    onClick={() => setPriority(null)}
                                    className="text-[11px] text-slate-500 hover:text-slate-700"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="card-due-date">Due date</Label>
                            <div className="relative">
                                <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="card-due-date"
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    disabled={updateCard.isPending}
                                    className="pl-9"
                                />
                                {dueDate && (
                                    <button
                                        type="button"
                                        onClick={() => setDueDate("")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                        aria-label="Clear date"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Section */}
                {card && (
                    <div className="border-t border-slate-200 pt-4 pb-2">
                        <details className="group">
                            <summary className="flex cursor-pointer items-center gap-2 list-none text-sm font-medium text-slate-700 hover:text-slate-900">
                                <Activity className="h-4 w-4 text-slate-500" />
                                <span>Activity</span>
                                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180 ml-auto" />
                            </summary>
                            <div className="mt-3">
                                <CardActivityList cardId={card.id} />
                            </div>
                        </details>
                    </div>
                )}

                <DialogFooter className="flex flex-row items-center justify-between gap-2 sm:justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        disabled={deleteCard.isPending || updateCard.isPending}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={updateCard.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!title.trim() || updateCard.isPending}
                        >
                            {updateCard.isPending ? "Saving…" : "Save"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}