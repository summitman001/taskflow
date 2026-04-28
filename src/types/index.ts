import type { Board, Column, Card, User, BoardMember, Role } from "@prisma/client";

// Prisma types
export type { Board, Column, Card, User, BoardMember, Role };

// Board with columns and cards
export type BoardWithColumns = Board & {
    columns: ColumnWithCards[];
};

export type ColumnWithCards = Column & {
    cards: Card[];
};

// ⭐ NEW: Board with members (for lists)
export type BoardWithMembers = Board & {
    members: (BoardMember & {
        user: Pick<User, "id" | "email" | "name">;
    })[];
    _count: { columns: number };
};

// ⭐ NEW: Full board with everything
export type BoardFull = Board & {
    owner: Pick<User, "id" | "email" | "name">;
    members: (BoardMember & {
        user: Pick<User, "id" | "email" | "name">;
    })[];
    columns: ColumnWithCards[];
};

// Drag-drop (unchanged)
export type DragData =
    | { type: "card"; card: Card; columnId: string }
    | { type: "column"; column: Column };