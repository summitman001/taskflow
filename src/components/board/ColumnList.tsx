"use client";

import {
    SortableContext,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Column } from "./Column";
import { AddColumnButton } from "./AddColumnButton";
import type { BoardWithColumns } from "@/types";

interface Props {
    board: BoardWithColumns;
}

export function ColumnList({ board }: Props) {
    const columnIds = board.columns.map((c) => c.id);

    return (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                <div className="flex h-full items-start gap-4 px-6 py-4">
                    {board.columns.map((column) => (
                        <Column key={column.id} column={column} boardId={board.id} />
                    ))}
                    <AddColumnButton
                        boardId={board.id}
                        existingColumns={board.columns}
                    />
                </div>
            </SortableContext>
        </div>
    );
}