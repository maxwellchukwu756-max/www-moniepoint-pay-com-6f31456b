// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Force-enable Nitro outside the Lovable sandbox so self-hosted deploys
// (Netlify / Vercel / Cloudflare) get a real SSR server bundle instead of
// a static-only build (which is what produces 404s on refresh / deep links).
// The actual target is auto-detected from NITRO_PRESET or the host CI
// (Netlify sets NETLIFY=true, Vercel sets VERCEL=1, etc.).
export default defineConfig({
  nitro: true,
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
