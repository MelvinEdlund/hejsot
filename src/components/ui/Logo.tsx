import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Wordmark. Lowercase serif "hejsöt" with a soft gradient dot — refined,
 * not cutesy. The dot is the only flourish.
 */
export function Logo({ className, href = "/" }: { className?: string; href?: string | null }) {
  const content = (
    <span className={cn("font-display text-[1.35rem] font-medium tracking-tightest text-fg", className)}>
      hejsöt
      <span className="ml-[1px] inline-block h-[6px] w-[6px] translate-y-[-2px] rounded-full bg-gradient-to-br from-accent to-accent-2" />
    </span>
  );
  if (!href) return content;
  return (
    <Link href={href} aria-label="hejsöt — hem" className="inline-flex items-center">
      {content}
    </Link>
  );
}
