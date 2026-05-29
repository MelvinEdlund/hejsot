"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff, AlertCircle } from "lucide-react";
import { signIn, signUp, type AuthState } from "@/actions/user-auth";

const initialState: AuthState = { ok: false };

interface Props {
  redirectTo?: string;
  defaultTab?: "login" | "signup";
}

export function LoginForm({ redirectTo = "/studio", defaultTab = "login" }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [showPw, setShowPw] = useState(false);
  const [, startTransition] = useTransition();

  const [loginState, loginAction, loginPending] = useActionState(signIn, initialState);
  const [signupState, signupAction, signupPending] = useActionState(signUp, initialState);

  const state = tab === "login" ? loginState : signupState;
  const pending = tab === "login" ? loginPending : signupPending;

  // On success redirect
  useEffect(() => {
    if (state.ok) {
      startTransition(() => {
        router.push(redirectTo);
        router.refresh();
      });
    }
  }, [state.ok, redirectTo, router]);

  const inputCls =
    "w-full rounded-xl border border-border/10 bg-surface/60 px-4 py-3 text-[15px] text-fg placeholder:text-muted/60 outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all";

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-3 text-4xl">💌</div>
        <h1 className="font-display text-3xl font-medium text-fg">
          {tab === "login" ? "Välkommen tillbaka" : "Skapa konto"}
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          {tab === "login"
            ? "Logga in för att se dina inbjudningar och svar."
            : "Håll koll på alla dina inbjudningar och svar på ett ställe."}
        </p>
      </div>

      {/* Tab switcher */}
      <div className="mb-6 flex rounded-2xl border border-border/10 bg-surface/40 p-1">
        {(["login", "signup"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-xl py-2.5 text-[14px] font-medium transition-all ${
              tab === t
                ? "bg-surface shadow-sm text-fg"
                : "text-muted hover:text-fg"
            }`}
          >
            {t === "login" ? "Logga in" : "Skapa konto"}
          </button>
        ))}
      </div>

      {/* Form */}
      <AnimatePresence mode="wait">
        <motion.form
          key={tab}
          action={tab === "login" ? loginAction : signupAction}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="space-y-4"
        >
          {/* Email */}
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60" />
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="din@email.se"
              required
              className={`${inputCls} pl-11`}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60" />
            <input
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete={tab === "login" ? "current-password" : "new-password"}
              placeholder={tab === "signup" ? "Minst 8 tecken" : "Lösenord"}
              required
              className={`${inputCls} pl-11 pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted/60 hover:text-muted transition-colors"
              aria-label={showPw ? "Dölj lösenord" : "Visa lösenord"}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {state.error && !state.ok && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-400"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {state.error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-accent-2 py-3.5 text-[15px] font-medium text-[#0d0c11] transition hover:brightness-105 disabled:opacity-60"
          >
            {pending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0d0c11]/30 border-t-[#0d0c11]" />
            ) : tab === "login" ? (
              <>
                <LogIn className="h-4 w-4" />
                Logga in
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Skapa konto
              </>
            )}
          </button>
        </motion.form>
      </AnimatePresence>

      {/* Divider + anonymous note */}
      <p className="mt-6 text-center text-[13px] text-muted">
        {tab === "login" ? (
          <>
            Inget konto?{" "}
            <button
              type="button"
              onClick={() => setTab("signup")}
              className="text-accent hover:underline"
            >
              Skapa ett gratis
            </button>
          </>
        ) : (
          <>
            Har du redan ett konto?{" "}
            <button
              type="button"
              onClick={() => setTab("login")}
              className="text-accent hover:underline"
            >
              Logga in
            </button>
          </>
        )}
      </p>
      <p className="mt-3 text-center text-[12px] text-muted/60">
        Du kan även skapa inbjudningar utan att logga in — kontot är bara för att hålla koll på svaren.
      </p>
    </div>
  );
}
