/**
 * Invite templates — the personality layer.
 *
 * Each template keeps the same design DNA (typography, spacing, motion) but
 * brings its own palette, mood and default copy. Palettes are theme-independent
 * accent gradients tinting the invite's cinematic backdrop; the surrounding UI
 * still honours dark/light.
 *
 * Copy is Swedish: confident, warm, concise — emotionally intelligent, never
 * trying too hard. Admins can override any line.
 */

export const TEMPLATE_IDS = [
  "coffee",
  "drinks",
  "walk",
  "dinner",
  "spontaneous",
  "custom",
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

export type Template = {
  id: TemplateId;
  label: string; // shown in the studio picker
  icon: string; // lucide-react icon name, resolved in components
  mood: string; // one-word vibe, shown as a quiet kicker on the invite
  tagline: string; // studio descriptor
  /** Accent gradient stops (hex) for the invite backdrop + buttons. */
  from: string;
  to: string;
  accent: string; // primary action / glow color
  defaultHeadline: string;
  defaultMessage: string;
};

export const TEMPLATES: Record<TemplateId, Template> = {
  coffee: {
    id: "coffee",
    label: "Kaffe",
    icon: "Coffee",
    mood: "lugnt",
    tagline: "En kopp, en stund, inga förväntningar.",
    from: "#e9b489",
    to: "#b8745a",
    accent: "#cf8a55",
    defaultHeadline: "Kaffe, du och jag?",
    defaultMessage:
      "Inget stort. Bara en kopp och en bra pratstund. Jag tänkte att det skulle bli fint — med just dig.",
  },
  drinks: {
    id: "drinks",
    label: "Drinkar",
    icon: "Wine",
    mood: "kväll",
    tagline: "En kväll som börjar lugnt och ser vart den tar vägen.",
    from: "#8b5cf6",
    to: "#ec4899",
    accent: "#a974f0",
    defaultHeadline: "En drink, någon kväll?",
    defaultMessage:
      "Vi tar något gott, sätter oss ner och ser vart kvällen leder. Du och jag — låter det bra?",
  },
  walk: {
    id: "walk",
    label: "Promenad",
    icon: "Footprints",
    mood: "luft",
    tagline: "Frisk luft och ett samtal utan brådska.",
    from: "#86efac",
    to: "#22d3ee",
    accent: "#34d399",
    defaultHeadline: "Följer du med på en promenad?",
    defaultMessage:
      "Ingen plan, bara en runda, lite luft och tid att prata. Jag skulle vilja gå den med dig.",
  },
  dinner: {
    id: "dinner",
    label: "Middag",
    icon: "UtensilsCrossed",
    mood: "intimt",
    tagline: "Lite finare. Helt och hållet värt det.",
    from: "#fb7185",
    to: "#f59e0b",
    accent: "#f43f6e",
    defaultHeadline: "Middag, bara vi två?",
    defaultMessage:
      "Jag bjuder. Vi tar god mat, tar tid på oss och låter kvällen vara vår. Vad säger du?",
  },
  spontaneous: {
    id: "spontaneous",
    label: "Spontant",
    icon: "Sparkle",
    mood: "nu",
    tagline: "Ingen kalender. Bara nu.",
    from: "#fda4af",
    to: "#fbbf24",
    accent: "#fb7a4b",
    defaultHeadline: "Har du tid… typ nu?",
    defaultMessage:
      "Ingen planering, ingen press. Bara du, jag och det som råkar hända. Häng på?",
  },
  custom: {
    id: "custom",
    label: "Eget",
    icon: "PenLine",
    mood: "ditt sätt",
    tagline: "Dina ord, din vibe.",
    from: "#ff7ca1",
    to: "#b28aff",
    accent: "#ff7ca1",
    defaultHeadline: "Jag har en fråga till dig.",
    defaultMessage: "",
  },
};

export function getTemplate(id: string | null | undefined): Template {
  if (id && id in TEMPLATES) return TEMPLATES[id as TemplateId];
  return TEMPLATES.custom;
}

export const TEMPLATE_LIST: Template[] = TEMPLATE_IDS.map((id) => TEMPLATES[id]);
