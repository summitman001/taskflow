"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
    board: { id: string; title: string } | null;
    onClose: () => void;
    onConfirm: (id: string) => void;
    isDeleting: boolean;
}

export function DeleteBoardDialog({
    board,
    onClose,
    onConfirm,
    isDeleting,
}: Props) {
    return (
        <Dialog open={!!board} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete board?</DialogTitle>
                    <DialogDescription>
                        This will permanently delete{" "}
                        <span className="font-semibold text-slate-900">
                            &ldquo;{board?.title}&rdquo;
                        </span>{" "}
                        and all of its columns and cards. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={onClose} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => board && onConfirm(board.id)}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete board"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}