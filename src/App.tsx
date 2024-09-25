import PrefixTitle from "~/components/PrefixTitle"
import { LocalStorageKey } from "~/types"
import "@unocss/reset/tailwind.css"
import "~/styles/main.css"
import "katex/dist/katex.min.css"
import "highlight.js/styles/atom-one-dark.css"
import { MetaProvider } from "@solidjs/meta"
import { ParentProps } from "solid-js"
import "uno.css"

const e = localStorage.getItem(LocalStorageKey.THEME) || ""
const a = window.matchMedia("(prefers-color-scheme: dark)").matches
if (!e || e === "auto" ? a : e === "dark") {
  document.documentElement.classList.add("dark")
}

if (!Array.prototype.at) {
  Array.prototype.at = function (index) {
    index = index < 0 ? index + this.length : index
    if (index >= 0 && index < this.length) {
      return this[index]
    }
  }
}

export default function (props: ParentProps) {
  return (
    <MetaProvider>
      <PrefixTitle />
      {props.children}
    </MetaProvider>
  )
}
