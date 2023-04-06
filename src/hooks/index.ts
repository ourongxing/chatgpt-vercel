import { type Accessor, onCleanup, onMount } from "solid-js"
import { copyToClipboard } from "../utils"

export function useCopyCode() {
  const timeoutIdMap: Map<HTMLElement, NodeJS.Timeout> = new Map()
  const listerner = (e: MouseEvent) => {
    const el = e.target as HTMLElement
    if (el.matches(".copy")) {
      const parent = el.parentElement
      const sibling = el.nextElementSibling as HTMLPreElement | null
      if (!parent || !sibling) {
        return
      }

      const text = sibling.innerText

      copyToClipboard(text.trim()).then(() => {
        el.classList.add("copied")
        clearTimeout(timeoutIdMap.get(el))
        const timeoutId = setTimeout(() => {
          el.classList.remove("copied")
          el.blur()
          timeoutIdMap.delete(el)
        }, 2000)
        timeoutIdMap.set(el, timeoutId)
      })
    }
  }
  onMount(() => {
    window.addEventListener("click", listerner)
  })
  onCleanup(() => {
    window.removeEventListener("click", listerner)
  })
}

export function clickOutside(el: Element, accessor: Accessor<any>) {
  const onClick = (e: any) => !el.contains(e.target) && accessor()?.()
  document.body.addEventListener("click", onClick)

  onCleanup(() => document.body.removeEventListener("click", onClick))
}
