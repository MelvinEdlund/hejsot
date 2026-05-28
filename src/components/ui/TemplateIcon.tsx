import { Coffee, Wine, Footprints, UtensilsCrossed, Sparkle, PenLine, type LucideIcon } from "lucide-react";

/** Maps a Template.icon name to its lucide component. */
const ICONS: Record<string, LucideIcon> = {
  Coffee,
  Wine,
  Footprints,
  UtensilsCrossed,
  Sparkle,
  PenLine,
};

export function TemplateIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Sparkle;
  return <Icon className={className} strokeWidth={1.5} />;
}
