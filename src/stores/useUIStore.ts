import { create } from "zustand";

interface UIState {
    // Hangi kart düzenleme modal'ında açık (null = kapalı)
    editingCardId: string | null;
    setEditingCardId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
    editingCardId: null,
    setEditingCardId: (id) => set({ editingCardId: id }),
}));