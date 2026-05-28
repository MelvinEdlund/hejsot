import { customAlphabet } from "nanoid";

/**
 * Slugs look like "sara-8f2k9q": a friendly, URL-safe name prefix plus a
 * short random suffix. The suffix uses a crypto-strong alphabet without
 * confusing characters (no 0/O/1/l/i), so links feel personal but stay
 * effectively unguessable.
 */
const SUFFIX_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
const randomSuffix = customAlphabet(SUFFIX_ALPHABET, 6);

function slugifyName(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/é|è|ê/g, "e")
    .replace(/[^a-z0-9]+/g, "-") // anything else becomes a separator
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  return base || "you";
}

export function makeSlug(recipientName: string): string {
  return `${slugifyName(recipientName)}-${randomSuffix()}`;
}
