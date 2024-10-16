import { defineConfig } from "vite"
import unocss from "unocss/vite"
import {
  presetUno,
  presetIcons,
  presetTypography,
  transformerDirectives,
  transformerVariantGroup
} from "unocss"
import solidPlugin from "vite-plugin-solid"
import tsconfigPaths from "vite-tsconfig-paths"
import nitro from "vite-plugin-with-nitro"

export default defineConfig({
  envPrefix: "CLIENT_",
  plugins: [
    unocss({
      mergeSelectors: false,
      transformers: [transformerDirectives(), transformerVariantGroup()],
      presets: [
        presetUno(),
        presetTypography({
          cssExtend: {
            ":not(pre) > code::before,:not(pre) > code::after": {
              content: ""
            }
          }
        }),
        presetIcons()
      ],
      shortcuts: {
        "input-box":
          "max-w-150px ml-1em px-1 text-slate-7 dark:text-slate rounded-sm bg-slate bg-op-15 focus:(bg-op-20 ring-0 outline-none)"
      }
    }),
    solidPlugin(),
    tsconfigPaths(),
    nitro({
      preset: process.env.VERCEL ? "vercel-edge" : "node-server",
    })
  ],
})
