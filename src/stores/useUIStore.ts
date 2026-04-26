import { create } from "zustand";

type DragType = "card" | "column" | null;

interface DragState {
    type: DragType;
    id: string | null;
}

interface UIState {
    // Edit modal
    editingCardId: string | null;
    setEditingCardId: (id: string | null) => void;

    // Drag state
    drag: DragState;
    setDrag: (drag: DragState) => void;
}

export const useUIStore = create<UIState>((set) => ({
    editingCardId: null,
    setEditingCardId: (id) => set({ editingCardId: id }),

    drag: { type: null, id: null },
    setDrag: (drag) => set({ drag }),
}));