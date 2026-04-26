/**
 * Standart fetch wrapper.
 * - JSON otomatik parse
 * - Hata fırlatır (TanStack Query error state'ini tetikler)
 * - Body varsa otomatik Content-Type
 */
export async function apiFetch<T>(
    url: string,
    options: RequestInit = {},
): Promise<T> {
    const headers: HeadersInit = {
        ...options.headers,
    };

    if (options.body && !(options.body instanceof FormData)) {
        (headers as Record<string, string>)["Content-Type"] = "application/json";
    }

    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
        let message = `Request failed with status ${res.status}`;
        try {
            const data = await res.json();
            if (data?.error) message = data.error;
        } catch {
            // body JSON değilse ignore
        }
        throw new Error(message);
    }

    // 204 No Content
    if (res.status === 204) return null as T;

    return res.json();
}