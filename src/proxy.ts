import { auth } from "@/lib/auth/server";

// Coarse gate only: real authorization is requireAdmin() on every admin page and action.
export const proxy = auth.middleware({ loginUrl: "/auth/sign-in" });

export const config = { matcher: ["/admin/:path*"] };
