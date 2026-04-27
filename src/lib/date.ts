/**
 * Bir tarih için "due date" durumunu hesapla.
 * UI'da renk/uyarı seçimi için kullanılır.
 */
export type DueDateStatus = "overdue" | "today" | "tomorrow" | "soon" | "later" | "none";

export function getDueDateStatus(dueDate: Date | string | null | undefined): DueDateStatus {
    if (!dueDate) return "none";

    const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
    if (isNaN(due.getTime())) return "none";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    // Geçmiş
    if (due < today) return "overdue";

    // Bugün (aynı gün)
    if (due >= today && due < tomorrow) return "today";

    // Yarın
    if (due >= tomorrow && due < dayAfterTomorrow) return "tomorrow";

    // 7 gün içinde
    if (due < sevenDaysLater) return "soon";

    return "later";
}

/**
 * Tarihi insan okuyabilir formata çevir: "Today", "Tomorrow", "Mar 15", "Mar 15, 2026"
 */
export function formatDueDate(dueDate: Date | string): string {
    const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
    if (isNaN(due.getTime())) return "";

    const status = getDueDateStatus(due);

    if (status === "today") return "Today";
    if (status === "tomorrow") return "Tomorrow";

    const now = new Date();
    const isThisYear = due.getFullYear() === now.getFullYear();

    return due.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...(isThisYear ? {} : { year: "numeric" }),
    });
}

/**
 * Date input value formatı (YYYY-MM-DD) için.
 */
export function toDateInputValue(date: Date | string | null | undefined): string {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}