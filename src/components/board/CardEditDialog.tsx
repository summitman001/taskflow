"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
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
import type { BoardWithColumns } from "@/types";

interface Props {
    boardId: string;
    board: BoardWithColumns;
}

export function CardEditDialog({ boardId, board }: Props) {
    const editingCardId = useUIStore((s) => s.editingCardId);
    const setEditingCardId = useUIStore((s) => s.setEditingCardId);

    // Tüm column'ların kartlarını dolaş, eşleşeni bul
    const card =
        editingCardId &&
        board.columns
            .flatMap((c) => c.cards)
            .find((c) => c.id === editingCardId);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const updateCard = useUpdateCard(boardId);
    const deleteCard = useDeleteCard(boardId);

    // Kart değişince form'u senkronize et
    useEffect(() => {
        if (card) {
            setTitle(card.title);
            setDescription(card.description ?? "");
        }
    }, [card]);

    const handleClose = () => setEditingCardId(null);

    const handleSave = () => {
        if (!card) return;
        const trimmedTitle = title.trim();
        if (!trimmedTitle) return;

        const trimmedDesc = description.trim();
        const noChange =
            trimmedTitle === card.title &&
            (trimmedDesc || null) === (card.description ?? null);

        if (noChange) {
            handleClose();
            return;
        }

        updateCard.mutate(
            {
                cardId: card.id,
                title: trimmedTitle,
                description: trimmedDesc || null,
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
                </DialogHeader>

                <div className="space-y-4 py-2">
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

                    <div className="space-y-2">
                        <Label htmlFor="card-description">Description</Label>
                        <Textarea
                            id="card-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a more detailed description…"
                            rows={5}
                            disabled={updateCard.isPending}
                        />
                    </div>
                </div>

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