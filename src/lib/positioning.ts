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

/**
 * Sıralı bir liste içinde, hedef indeksin "öncesi" ve "sonrası" arasındaki
 * fractional position'ı hesapla.
 *
 * @param items - Sıralı liste (position'a göre sıralı varsayılır)
 * @param targetIndex - Yeni elemanın bu indekse yerleşeceği yer
 * @param excludeId - Sürüklenen elemanın kendi ID'si (varsa) — kendini hesaba katma
 *
 * Örnekler:
 *   items: [A(a0), B(b0), C(c0)]
 *   targetIndex: 0 → A'dan önce → returns key < a0
 *   targetIndex: 1 → A ile B arasında → returns key (a0, b0)
 *   targetIndex: 3 → C'den sonra → returns key > c0
 */
export function getPositionForIndex(
  items: { id: string; position: string }[],
  targetIndex: number,
  excludeId?: string,
): string {
  // Sürüklenen elemanı listeden çıkar (yeniden konumlanıyor)
  const filtered = excludeId
    ? items.filter((item) => item.id !== excludeId)
    : items;

  const prev = targetIndex > 0 ? filtered[targetIndex - 1]?.position : null;
  const next =
    targetIndex < filtered.length ? filtered[targetIndex]?.position : null;

  return generateKeyBetween(prev ?? null, next ?? null);
}