"use client";

import { useActionState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/actions/auth";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

type LoginState = { ok: boolean; error?: string };
const initialState: LoginState = { ok: false };

export default function LoginPage() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [state, action, pending] = useActionState(login, initialState);

  useEffect(() => {
    if (!state.ok) return;
    startTransition(() => {
      router.push("/studio/admin");
      router.refresh();
    });
  }, [state.ok, router, startTransition]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-12">
      <div className="rounded-3xl border border-border/10 bg-surface/50 p-6 sm:p-8">
        <h1 className="font-display text-3xl font-medium text-fg">Admin-login</h1>
        <p className="mt-2 text-[14px] text-muted">
          Endast for ADMIN_EMAIL kan logga in.
        </p>

        <form action={action} className="mt-6 space-y-4">
          <Field label="E-post">
            <Input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="du@hejsot.lol"
              required
            />
          </Field>

          <Field label="Losenord" error={state.error}>
            <Input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </Field>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Loggar in..." : "Logga in"}
          </Button>
        </form>
      </div>
    </main>
  );
}
