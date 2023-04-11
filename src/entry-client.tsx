import { mount, StartClient } from "solid-start/entry-client"

const e = localStorage.getItem("theme") || ""
const a = window.matchMedia("(prefers-color-scheme: dark)").matches
if (!e || e === "auto" ? a : e === "dark") {
  document.documentElement.classList.add("dark")
}

mount(() => <StartClient />, document)
