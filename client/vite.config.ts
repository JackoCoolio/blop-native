import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"
import solidSvg from "vite-plugin-solid-svg"
import WindiCSS from "vite-plugin-windicss"

export default defineConfig({
  plugins: [
    solidPlugin(),
    WindiCSS({
      scan: {
        fileExtensions: ["html", "js", "ts", "jsx", "tsx"],
      },
    }),
    solidSvg(),
  ],
  build: {
    target: "esnext",
    polyfillDynamicImport: false,
  },
})
