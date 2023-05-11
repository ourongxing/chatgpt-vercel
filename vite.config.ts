import solid from "solid-start/vite"
// @ts-ignore
import netlify from "solid-start-netlify"
// @ts-ignore
import node from "solid-start-node"
import vercel from "solid-start-vercel"
import cloudflare from "solid-start-cloudflare-workers"
import { defineConfig } from "vite"
import unocss from "unocss/vite"
import {
  presetUno,
  presetIcons,
  presetTypography,
  transformerDirectives,
  transformerVariantGroup
} from "unocss"
import { VitePWA } from "vite-plugin-pwa"

const adapter = () => {
  if (process.env.VERCEL) {
    return vercel({ edge: true })
  } else if (process.env.NETLIFY) {
    return netlify({ edge: true })
  } else if (process.env.CF_WORKER) {
    return cloudflare({})
  } else {
    return node()
  }
}

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
    solid({ ssr: false, adapter: adapter() }),
    VitePWA({
      base: "/",
      scope: "/",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      registerType: "autoUpdate",
      manifest: {
        name: "ChatGPT",
        lang: "zh-cn",
        short_name: "ChatGPT",
        background_color: "#f6f8fa",
        icons: [
          {
            src: "192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "256.png",
            sizes: "256x256",
            type: "image/png"
          },
          {
            src: "512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "apple-touch-icon.png",
            sizes: "192x192",
            type: "image/png"
          }
        ]
      },
      disable: !!process.env.NETLIFY,
      devOptions: {
        enabled: true
      }
    })
  ]
})
