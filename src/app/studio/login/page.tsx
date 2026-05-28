"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { login } from "@/actions/auth";
import { Logo } from "@/components/ui/Logo";
import { Field, Input } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-2 text-[15px] font-medium text-[#0d0c11] transition-all hover:brightness-105 disabled:opacity-60"
    >
      {pending ? <Spinner /> : null}
      Logga in
    </button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction] = useFormState(login, { ok: false });

  useEffect(() => {
    if (state.ok) router.replace("/studio");
  }, [state.ok, router]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo href={null} />
        </div>
        <div className="glass rounded-3xl p-7 shadow-lift">
          <h1 className="font-display text-2xl text-fg">Studio</h1>
          <p className="mt-1 text-[14px] text-muted">Privat. Endast för admin.</p>

          <form action={formAction} className="mt-6 space-y-4">
            <Field label="E-post">
              <Input name="email" type="email" autoComplete="username" required placeholder="du@exempel.se" />
            </Field>
            <Field label="Lösenord" error={state.error}>
              <Input name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
            </Field>
            <SubmitButton />
          </form>
        </div>
      </div>
    </main>
  );
}
