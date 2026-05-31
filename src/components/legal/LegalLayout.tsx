import Link from "next/link";
import { Heart } from "lucide-react";

export function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-2xl px-5 py-16">
        <Link
          href="/"
          className="mb-10 flex items-center gap-1.5 text-muted/60 transition-colors hover:text-muted"
        >
          <Heart className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
          <span className="font-display text-[14px] italic">hejsöt</span>
        </Link>
        <h1 className="font-display text-3xl font-medium text-fg">{title}</h1>
        <div className="prose prose-sm mt-8 max-w-none text-muted/90 [&_a]:text-fg [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-[1.15rem] [&_h2]:font-medium [&_h2]:text-fg [&_h3]:mt-5 [&_h3]:text-[0.95rem] [&_h3]:font-medium [&_h3]:text-fg">
          {children}
        </div>
      </div>
    </div>
  );
}
