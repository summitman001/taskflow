"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCard } from "@/hooks/useCards";
import { getPositionAtEnd } from "@/lib/positioning";
import type { Card } from "@/types";

interface Props {
    boardId: string;
    columnId: string;
    existingCards: Card[];
}

export function AddCardButton({ boardId, columnId, existingCards }: Props) {
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const createCard = useCreateCard(boardId);

    useEffect(() => {
        if (isAdding) {
            textareaRef.current?.focus();
        }
    }, [isAdding]);

    const handleSubmit = () => {
        const trimmed = title.trim();
        if (!trimmed) return;

        const position = getPositionAtEnd(existingCards);
        createCard.mutate(
            { columnId, title: trimmed, position },
            {
                onSuccess: () => {
                    setTitle("");
                    textareaRef.current?.focus(); // hızlı sıralı kart eklemek için
                },
            },
        );
    };

    const handleCancel = () => {
        setTitle("");
        setIsAdding(false);
    };

    if (!isAdding) {
        return (
            <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="flex w-full items-center gap-1 rounded-md px-2 py-2 text-sm text-slate-600 transition hover:bg-slate-200"
            >
                <Plus className="h-4 w-4" />
                Add a card
            </button>
        );
    }

    return (
        <div className="space-y-2">
            <Textarea
                ref={textareaRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                    }
                    if (e.key === "Escape") handleCancel();
                }}
                placeholder="Enter a title for this card…"
                maxLength={200}
                rows={2}
                className="resize-none bg-white"
            />
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!title.trim() || createCard.isPending}
                >
                    {createCard.isPending ? "Adding…" : "Add card"}
                </Button>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded p-1 text-slate-500 hover:bg-slate-200"
                    aria-label="Cancel"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}