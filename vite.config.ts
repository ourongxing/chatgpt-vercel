import solid from "solid-start/vite"
// @ts-ignore
import netlify from "solid-start-netlify"
// @ts-ignore
import node from "solid-start-node"
import vercel from "solid-start-vercel"
import { defineConfig } from "vite"
import unocss from "unocss/vite"
import {
  presetUno,
  presetIcons,
  presetTypography,
  transformerDirectives,
  transformerVariantGroup
} from "unocss"

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
    solid({ ssr: false, adapter: adapter() })
  ]
})
