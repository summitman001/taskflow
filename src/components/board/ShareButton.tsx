"use client";
import { useState } from "react";
import { Users } from "lucide-react";
import { ShareBoardDialog } from "./ShareBoardDialog";
import type { BoardFull } from "@/types";

type ShareButtonProps = {
    board: BoardFull;
};

export function ShareButton({ board }: ShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 font-medium shadow-sm transition-all hover:bg-gray-50"
                title="Share board"
            >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
                {board.members.length > 1 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                        {board.members.length}
                    </span>
                )}
            </button>

            <ShareBoardDialog
                board={board}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}