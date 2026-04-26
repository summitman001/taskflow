"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { useCreateBoard } from "@/hooks/useBoards";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateBoardDialog({ open, onOpenChange }: Props) {
    const [title, setTitle] = useState("");
    const createBoard = useCreateBoard();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = title.trim();
        if (!trimmed) return;

        createBoard.mutate(trimmed, {
            onSuccess: () => {
                setTitle("");
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create new board</DialogTitle>
                        <DialogDescription>
                            Give your board a clear name. You can always rename it later.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-6 space-y-2">
                        <Label htmlFor="board-title">Title</Label>
                        <Input
                            id="board-title"
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Q4 Marketing Sprint"
                            maxLength={200}
                            disabled={createBoard.isPending}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={createBoard.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!title.trim() || createBoard.isPending}
                        >
                            {createBoard.isPending ? "Creating..." : "Create board"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}