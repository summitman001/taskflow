import { NextResponse } from "next/server";

/**
 * Standart hata response'ları
 */
export const apiError = {
    unauthorized: () =>
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),

    notFound: (resource = "Resource") =>
        NextResponse.json({ error: `${resource} not found` }, { status: 404 }),

    forbidden: () =>
        NextResponse.json({ error: "Forbidden" }, { status: 403 }),

    badRequest: (message: string) =>
        NextResponse.json({ error: message }, { status: 400 }),

    serverError: (message = "Internal server error") =>
        NextResponse.json({ error: message }, { status: 500 }),
};

/**
 * String alan validasyonu — boş, çok uzun, yanlış tipte mi?
 */
export function validateTitle(value: unknown, fieldName = "title"): string | null {
    if (typeof value !== "string") {
        return `${fieldName} must be a string`;
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
        return `${fieldName} cannot be empty`;
    }
    if (trimmed.length > 200) {
        return `${fieldName} must be 200 characters or less`;
    }
    return null;
}

/**
 * Position string'i için basit validasyon (fractional indexing değerleri).
 */
export function validatePosition(value: unknown): string | null {
    if (typeof value !== "string" || value.length === 0) {
        return "position must be a non-empty string";
    }
    if (value.length > 100) {
        return "position is too long";
    }
    return null;
}