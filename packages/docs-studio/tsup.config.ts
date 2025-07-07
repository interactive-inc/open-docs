import { defineConfig } from "tsup"

export default defineConfig({
  config: "tsconfig.lib.json", // not working
  entry: ["lib/index.ts"],
  outDir: "build",
  format: ["esm"],
  clean: false, // false for vite build
  dts: true,
})
