import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

// Inside Lovable builds, the preset is forced to Cloudflare automatically.
// Outside Lovable (e.g. deploying to Vercel), Nitro auto-detects the VERCEL
// env var and builds the Vercel output. We hard-pin the preset as a
// belt-and-suspenders so `vercel` / `vercel build` always produces the
// correct `.vercel/output` directory even if auto-detection fails.
export default defineConfig({
  nitro: { preset: "vercel" },
  plugins: [mcpPlugin()],
});
