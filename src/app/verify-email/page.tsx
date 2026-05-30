import { redirect } from "next/navigation";
import { verifyEmail } from "@/actions/user-auth";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ token?: string }> };

/**
 * /verify-email?token=<hex64>
 *
 * Redeems the verification token from the signup email.
 * On success: marks the account verified, logs the user in, redirects to /studio.
 * On failure: shows a friendly error with a link back to login.
 */
export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return <ErrorView message="Ingen verifieringskod hittades i länken." />;
  }

  const result = await verifyEmail(token);

  if (result.ok) {
    redirect("/studio");
  }

  return <ErrorView message={result.error ?? "Verifieringen misslyckades."} />;
}

function ErrorView({ message }: { message: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-3xl border border-border/10 bg-surface/60 p-8 text-center backdrop-blur-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-2xl">
          🥲
        </div>
        <h1 className="font-display text-2xl font-medium text-fg">Hoppsan</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{message}</p>
        <a
          href="/login"
          className="mt-6 inline-block rounded-full bg-surface px-6 py-2.5 text-[14px] font-medium text-fg ring-1 ring-border/20 transition-all hover:ring-accent/40"
        >
          Tillbaka till inloggning
        </a>
      </div>
    </div>
  );
}
