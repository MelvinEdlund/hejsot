import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo href="/" />
      <h1 className="mt-8 font-display text-4xl text-fg">
        Den här länken finns inte.
      </h1>
      <p className="mt-3 max-w-sm text-muted">Inbjudan kan ha tagits bort.</p>
      <Button href="/" className="mt-8" variant="secondary">
        Till startsidan
      </Button>
    </main>
  );
}
