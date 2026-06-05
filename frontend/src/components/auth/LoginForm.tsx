"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { LinkPulseLogo } from "@/components/brand/LinkPulseLogo";
import { createStaffSessionAction } from "@/lib/actions/auth";
import { auth } from "@/lib/firebaseClient";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const idToken = await cred.user.getIdToken();
      const session = await createStaffSessionAction(idToken);
      if (!session.ok) {
        throw new Error(session.error ?? "Could not start session");
      }
      router.replace(next.startsWith("/") ? next : "/dashboard");
      router.refresh();
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        setError("Incorrect email or password.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Wait a moment and try again.");
      } else {
        setError(
          err instanceof Error ? err.message : "Sign-in failed. Check your details.",
        );
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-[var(--dash-bg)] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex justify-center">
          <LinkPulseLogo variant="full" className="max-w-[180px]" />
        </div>
        <h1 className="mt-6 text-center text-xl font-semibold text-zinc-900">
          Staff sign in
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500">
          CRM access is restricted to authorized team members.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm text-zinc-600">
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-zinc-900 outline-none focus:border-[var(--dash-accent)]"
            />
          </label>
          <label className="block text-sm text-zinc-600">
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-zinc-900 outline-none focus:border-[var(--dash-accent)]"
            />
          </label>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Customer QR landing:{" "}
          <a href="/qr" className="text-[var(--dash-accent)] hover:underline">
            /qr
          </a>
        </p>
      </div>
    </div>
  );
}
