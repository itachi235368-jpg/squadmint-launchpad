// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

// Some older @solana/* packages (codecs, options, …) only export "browser"/"node" builds with no
// workerd/default condition, and nested copies exist. Resolve them to their browser build.
const solanaBrowserBuilds = {
  name: "solana-browser-builds",
  enforce: "pre" as const,
  resolveId(source: string, importer?: string) {
    if (!/^@solana\/(codecs[\w-]*|options|errors)$/.test(source)) return null;
    // Walk up from the importer to find the nearest copy (package.json isn't exported, so no require.resolve).
    let dir = importer ? dirname(importer) : process.cwd();
    for (;;) {
      const file = join(dir, "node_modules", source, "dist/index.browser.mjs");
      if (existsSync(file)) return file;
      const parent = dirname(dir);
      if (parent === dir) return null;
      dir = parent;
    }
  },
};

export default defineConfig({
  vite: {
    plugins: [solanaBrowserBuilds],
    ssr: { noExternal: ["@pump-fun/pump-sdk", "@pump-fun/agent-payments-sdk", "@coral-xyz/anchor", "@solana/spl-token", "@solana/spl-token-metadata", /^@solana\/codecs/, "@solana/options", "@solana/errors"] },
    resolve: {
      // Solana's websocket dependency has no workerd export; use its web-standard build.
      alias: {
        // Absolute path forces the SSR step to bundle it (so its @solana/codecs imports hit the plugin above).
        "@solana/spl-token": fileURLToPath(new URL("./node_modules/@solana/spl-token/lib/esm/index.js", import.meta.url)),
        "rpc-websockets": fileURLToPath(new URL("./node_modules/rpc-websockets/dist/index.browser.mjs", import.meta.url)),
        "@coral-xyz/anchor": fileURLToPath(new URL("./node_modules/@coral-xyz/anchor/dist/browser/index.js", import.meta.url)),
      },
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
