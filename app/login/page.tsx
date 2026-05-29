"use client";

import { useActionState } from "react";
import { signInWithEmail } from "@/app/actions/auth";

type State = { error?: string; success?: boolean } | undefined;

export default function LoginPage() {
  const [state, action, pending] = useActionState<State, FormData>(
    signInWithEmail,
    undefined
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-amber-400 tracking-tight">Semper</h1>
          <p className="mt-1 text-stone-400 text-sm">D&amp;D 5e character sheets, forged for play.</p>
        </div>

        {state?.success ? (
          <div className="rounded-lg border border-emerald-700 bg-emerald-950/40 p-5 text-center">
            <p className="text-emerald-300 font-medium">Check your email</p>
            <p className="mt-1 text-stone-400 text-sm">
              We sent you a magic link. Click it to sign in.
            </p>
          </div>
        ) : (
          <form action={action} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-300 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-md border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {state?.error && (
              <p className="text-red-400 text-sm">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-stone-950 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {pending ? "Sending…" : "Send magic link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
