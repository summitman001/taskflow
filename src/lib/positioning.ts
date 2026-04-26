import { generateKeyBetween } from "fractional-indexing";

/**
 * İki position arasında yeni bir position üret.
 *
 * @param prev - Önceki kart/column'un position'ı (yoksa null)
 * @param next - Sonraki kart/column'un position'ı (yoksa null)
 * @returns Lexicographically arada bir string
 *
 * Örnekler:
 *   getPositionBetween(null, null)    → "a0" (boş listenin sonuna)
 *   getPositionBetween("a0", null)    → "a1"  (en sona)
 *   getPositionBetween(null, "a0")    → "Zz" (en başa)
 *   getPositionBetween("a0", "a1")    → "a0V" (arasına)
 */
export function getPositionBetween(
    prev: string | null,
    next: string | null,
): string {
    return generateKeyBetween(prev, next);
}

/**
 * Sıralı bir listeye yeni eleman eklemek için "sona ekle" helper'ı.
 */
export function getPositionAtEnd(
    items: { position: string }[],
): string {
    const lastPos = items.length > 0 ? items[items.length - 1].position : null;
    return generateKeyBetween(lastPos, null);
}