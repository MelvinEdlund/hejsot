/** @type {import('next').NextConfig} */

// ── Security headers ──────────────────────────────────────────────────────────
// Applied to every response. CSP locks down what resources the browser may load.
// Note: 'unsafe-inline' for script-src is required for the anti-FOUC theme script
// (dangerouslySetInnerHTML in layout.tsx). All other script loading is 'self'.
const CSP = [
  "default-src 'self'",
  // Inline scripts needed for anti-FOUC theme init; Next.js also injects inline
  // bootstrap chunks in production. Tighten with nonces if you add a CSP middleware.
  "script-src 'self' 'unsafe-inline'",
  // Tailwind + framer-motion emit inline styles; Google Fonts stylesheet.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Google Fonts woff2 files.
  "font-src 'self' https://fonts.gstatic.com",
  // Hero images from Supabase Storage; OG images (self); external URLs entered
  // by invite creators (https: allows any HTTPS image host).
  "img-src 'self' data: blob: https:",
  // Supabase REST/Storage API, Upstash Redis REST.
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.upstash.io",
  // Spotify embed iframe.
  "frame-src https://open.spotify.com",
  // No plugins, no object embeds, no base-tag hijacking.
  "object-src 'none'",
  "base-uri 'self'",
  // Forms must POST to our own origin only.
  "form-action 'self'",
  // Only HTTPS resources (already enforced by HSTS, but defence-in-depth).
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control",  value: "on" },
  { key: "X-Frame-Options",         value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options",  value: "nosniff" },
  { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=()" },
  {
    key:   "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Allow remote hero images served from Supabase Storage.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
