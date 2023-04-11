import solid from "solid-start/vite"
// @ts-ignore
import netlify from "solid-start-netlify"
// @ts-ignore
import node from "solid-start-node"
import vercel from "solid-start-vercel"
import { defineConfig } from "vite"
import unocss from "unocss/vite"
import { presetUno, presetIcons, presetTypography } from "unocss"

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
    solid({ ssr: false, adapter: adapter() })
  ]
})
