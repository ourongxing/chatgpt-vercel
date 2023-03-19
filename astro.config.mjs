import { defineConfig } from "astro/config"
import vercel from "@astrojs/vercel/edge"
import node from "@astrojs/node"
import netlify from "@astrojs/netlify/edge-functions"
import cloudflare from "@astrojs/cloudflare"
import unocss from "unocss/astro"
import {
  presetUno,
  presetIcons,
  presetAttributify,
  presetTypography
} from "unocss"
import solidJs from "@astrojs/solid-js"

const adapter = () => {
  if (process.env.VERCEL) {
    return vercel()
  } else if (process.env.NETLIFY) {
    return netlify()
  } else if (process.env.CLOUDFLARE) {
    return cloudflare()
  } else {
    return node({
      mode: "standalone"
    })
  }
}

// https://astro.build/config
export default defineConfig({
  integrations: [
    unocss({
      presets: [
        presetAttributify(),
        presetUno(),
        presetTypography({
          cssExtend: {
            ":not(pre) > code::before,:not(pre) > code::after": ""
          }
        }),
        presetIcons()
      ]
    }),
    solidJs()
  ],
  output: "server",
  adapter: adapter()
})
