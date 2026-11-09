"use client";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export function SignOut() {
  const router = useRouter();
  return (
    <button type="button" className="btn btn-line w-full" onClick={async () => { await authClient.signOut(); router.push("/auth/sign-in"); router.refresh(); }}>
      Sign out
    </button>
  );
}
