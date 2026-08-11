/**
 * Shared auth-state helpers.
 *
 * Previously every page duplicated the JWT decode + expiry check inline and
 * (incorrectly) redirected to `/login`, which is not a real route. The real
 * login page lives at `/account/login`.
 */

export const LOGIN_ROUTE = "/account/login";
export const TOKEN_STORAGE_KEY = "token";

type JwtPayload = {
    exp?: number;
    sub?: string;
    [key: string]: unknown;
};

/** Reads the raw JWT from localStorage. Returns null during SSR. */
export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Decodes the JWT payload (same approach the pages used inline:
 * `JSON.parse(atob(token.split('.')[1]))`). Returns null if it cannot be read.
 */
export function decodeToken(token?: string | null): JwtPayload | null {
    const raw = token ?? getToken();
    if (!raw) return null;
    try {
        const segment = raw.split(".")[1];
        if (!segment) return null;
        return JSON.parse(atob(segment)) as JwtPayload;
    } catch {
        return null;
    }
}

/** True when a token exists and its `exp` claim is still in the future. */
export function isTokenValid(token?: string | null): boolean {
    const payload = decodeToken(token);
    if (!payload || typeof payload.exp !== "number") return false;
    return Date.now() < payload.exp * 1000;
}

/** Alias kept for readability at call sites that used `isLoggedIn()`. */
export function isLoggedIn(): boolean {
    return isTokenValid();
}

/** Removes the stored JWT. */
export function clearToken(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

type RouterLike = { push: (href: string) => void };

/** Sends the user to the real login route (`/account/login`, not `/login`). */
export function redirectToLogin(router: RouterLike): void {
    router.push(LOGIN_ROUTE);
}

/** Clears the token then redirects to login. */
export function logout(router: RouterLike): void {
    clearToken();
    redirectToLogin(router);
}
