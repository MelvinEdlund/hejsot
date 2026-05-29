/**
 * Invite templates — the personality layer.
 *
 * Each template keeps the same design DNA (typography, spacing, motion) but
 * brings its own palette, mood and default copy. Palettes are theme-independent
 * accent gradients tinting the invite's cinematic backdrop; the surrounding UI
 * still honours dark/light.
 *
 * Copy is Swedish och första-draft: korta, lowercase, lite skissigt. Som om
 * killen själv skrev nåt snabbt i ett textfält. Användaren kan skriva om allt.
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
  label: string;
  icon: string;
  mood: string;
  tagline: string;
  /** Accent gradient stops (hex) for the invite backdrop + buttons. */
  from: string;
  to: string;
  accent: string;
  defaultHeadline: string;
  defaultMessage: string;
};

export const TEMPLATES: Record<TemplateId, Template> = {
  coffee: {
    id: "coffee",
    label: "Fika",
    icon: "Coffee",
    mood: "",
    tagline: "",
    from: "#e9b489",
    to: "#b8745a",
    accent: "#cf8a55",
    defaultHeadline: "fika?",
    defaultMessage: "har du tid nån dag?",
  },
  drinks: {
    id: "drinks",
    label: "Drinkar",
    icon: "Wine",
    mood: "",
    tagline: "",
    from: "#8b5cf6",
    to: "#ec4899",
    accent: "#a974f0",
    defaultHeadline: "drink?",
    defaultMessage: "vet ett ställe.",
  },
  walk: {
    id: "walk",
    label: "Promenad",
    icon: "Footprints",
    mood: "",
    tagline: "",
    from: "#86efac",
    to: "#22d3ee",
    accent: "#34d399",
    defaultHeadline: "promenad?",
    defaultMessage: "vi kan gå ut i parken :)",
  },
  dinner: {
    id: "dinner",
    label: "Middag",
    icon: "UtensilsCrossed",
    mood: "",
    tagline: "",
    from: "#fb7185",
    to: "#f59e0b",
    accent: "#f43f6e",
    defaultHeadline: "middag?",
    defaultMessage: "jag bjuder.",
  },
  spontaneous: {
    id: "spontaneous",
    label: "Spontant",
    icon: "Sparkle",
    mood: "",
    tagline: "",
    from: "#fda4af",
    to: "#fbbf24",
    accent: "#fb7a4b",
    defaultHeadline: "vad gör du?",
    defaultMessage: "hänga?",
  },
  custom: {
    id: "custom",
    label: "Eget",
    icon: "PenLine",
    mood: "",
    tagline: "",
    from: "#ff7ca1",
    to: "#b28aff",
    accent: "#ff7ca1",
    defaultHeadline: "hej.",
    defaultMessage: "",
  },
};

export function getTemplate(id: string | null | undefined): Template {
  if (id && id in TEMPLATES) return TEMPLATES[id as TemplateId];
  return TEMPLATES.custom;
}

export const TEMPLATE_LIST: Template[] = TEMPLATE_IDS.map(
  (id) => TEMPLATES[id],
);
