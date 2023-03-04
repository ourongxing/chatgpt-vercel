import { defineConfig } from "astro/config"
import vercel from "@astrojs/vercel/edge"
import unocss from "unocss/astro"
import {
  presetUno,
  presetIcons,
  presetAttributify,
  presetTypography
} from "unocss"
import solidJs from "@astrojs/solid-js"

// https://astro.build/config
export default defineConfig({
  integrations: [
    unocss({
      presets: [
        presetAttributify(),
        presetUno(),
        presetTypography(),
        presetIcons()
      ]
    }),
    solidJs()
  ],
  output: "server",
  adapter: vercel()
})
