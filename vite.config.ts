import solid from "solid-start/vite"
// @ts-ignore
import netlify from "solid-start-netlify"
// @ts-ignore
import node from "solid-start-node"
import vercel from "solid-start-vercel"
import { defineConfig } from "vite"
import unocss from "unocss/vite"
import { presetUno, presetIcons, presetTypography } from "unocss"
import { VitePWA } from "vite-plugin-pwa"

const adapter = () => {
  if (process.env.VERCEL) {
    return vercel({ edge: true })
  } else if (process.env.NETLIFY) {
    return netlify({ edge: true })
  } else {
    return node()
  }
}

export default defineConfig({
  envPrefix: "CLIENT_",
  plugins: [
    unocss({
      mergeSelectors: false,
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
      ]
    }),
    solid({ ssr: false, adapter: adapter() }),
    VitePWA({
      base: "/",
      scope: "/",
      includeAssets: ["favicon.svg"],
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
      workbox: {
        navigateFallback: "/404",
        globPatterns: ["**/*.{css,js,html,svg,png,ico,txt}"]
      },
      devOptions: {
        enabled: true,
        navigateFallbackAllowlist: [/^\/404$/]
      }
    })
  ]
})
