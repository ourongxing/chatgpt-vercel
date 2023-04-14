import { mount, StartClient } from "solid-start/entry-client"
import { LocalStorageKey } from "./store"

const e = localStorage.getItem(LocalStorageKey.Theme) || ""
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

mount(() => <StartClient />, document)
