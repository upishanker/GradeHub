/**
 * Centralized API client for the GradeHub backend.
 *
 * All network calls should go through the helpers exported here instead of
 * hardcoding `http://localhost:8080`. The base URL comes from the
 * `NEXT_PUBLIC_API_BASE_URL` environment variable (see `.env.local`) and falls
 * back to `http://localhost:8080` for local development.
 */

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

/**
 * Error thrown for any non-2xx response. Callers can `catch (e)` and check
 * `e instanceof ApiError` to read `status` / `message` (e.g. to show a toast).
 */
export class ApiError extends Error {
    readonly status: number;
    readonly body: string;

    constructor(status: number, message: string, body = "") {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.body = body;
        // Required so `instanceof` works when targeting ES5/ES2017.
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

/** Joins the configured base URL with a relative API path. */
export function apiUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) return path;
    return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Reads the JWT from localStorage. Returns null during SSR. */
export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("token");
}

function authHeader(): Record<string, string> {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export type ApiRequestOptions = {
    /** Extra headers merged on top of the defaults. */
    headers?: Record<string, string>;
    /** Skip the Authorization header (e.g. login / signup). */
    skipAuth?: boolean;
    signal?: AbortSignal;
};

async function parseBody(response: Response): Promise<unknown> {
    if (response.status === 204) return null;
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        // Some endpoints (e.g. plain BigDecimal / text responses) may not be JSON.
        return text;
    }
}

/**
 * Core request helper. Prepends the base URL, attaches auth, serializes JSON
 * bodies, and throws {@link ApiError} on non-2xx responses.
 *
 * `body` may be a plain object (serialized to JSON) or a `FormData` /
 * `Blob` / string, in which case it is passed through untouched and the
 * `Content-Type` header is left for the browser to set (important for
 * multipart uploads such as the syllabus OCR endpoint).
 */
export async function apiRequest<T = any>(
    path: string,
    method: string,
    body?: unknown,
    options: ApiRequestOptions = {}
): Promise<T> {
    const headers: Record<string, string> = {
        ...(options.skipAuth ? {} : authHeader()),
        ...(options.headers ?? {}),
    };

    let payload: BodyInit | undefined;
    if (body !== undefined && body !== null) {
        const isRaw =
            typeof FormData !== "undefined" && body instanceof FormData
            || typeof Blob !== "undefined" && body instanceof Blob
            || typeof body === "string"
            || body instanceof ArrayBuffer
            || body instanceof URLSearchParams;

        if (isRaw) {
            payload = body as BodyInit;
        } else {
            payload = JSON.stringify(body);
            if (!headers["Content-Type"]) {
                headers["Content-Type"] = "application/json";
            }
        }
    }

    const response = await fetch(apiUrl(path), {
        method,
        headers,
        body: payload,
        signal: options.signal,
    });

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new ApiError(
            response.status,
            text || `Request failed with status ${response.status}`,
            text
        );
    }

    return (await parseBody(response)) as T;
}

export function apiGet<T = any>(path: string, options?: ApiRequestOptions) {
    return apiRequest<T>(path, "GET", undefined, options);
}

export function apiPost<T = any>(
    path: string,
    body?: unknown,
    options?: ApiRequestOptions
) {
    return apiRequest<T>(path, "POST", body, options);
}

export function apiPatch<T = any>(
    path: string,
    body?: unknown,
    options?: ApiRequestOptions
) {
    return apiRequest<T>(path, "PATCH", body, options);
}

export function apiPut<T = any>(
    path: string,
    body?: unknown,
    options?: ApiRequestOptions
) {
    return apiRequest<T>(path, "PUT", body, options);
}

export function apiDelete<T = any>(path: string, options?: ApiRequestOptions) {
    return apiRequest<T>(path, "DELETE", undefined, options);
}

/**
 * Multipart/form-data POST. The `Content-Type` header is intentionally NOT set
 * so the browser can generate the correct multipart boundary.
 */
export function apiPostFormData<T = any>(
    path: string,
    formData: FormData,
    options?: ApiRequestOptions
) {
    return apiRequest<T>(path, "POST", formData, options);
}

/** Convenience fetcher for `useSWR(path, apiFetcher)`. */
export const apiFetcher = (path: string): Promise<any> => apiGet<any>(path);
