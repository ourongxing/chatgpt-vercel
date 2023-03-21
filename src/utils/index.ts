export async function copyToClipboard(text: string) {
  try {
    return await navigator.clipboard.writeText(text)
  } catch {
    const element = document.createElement("textarea")
    const previouslyFocusedElement = document.activeElement

    element.value = text

    // Prevent keyboard from showing on mobile
    element.setAttribute("readonly", "")

    element.style.contain = "strict"
    element.style.position = "absolute"
    element.style.left = "-9999px"
    element.style.fontSize = "12pt" // Prevent zooming on iOS

    const selection = document.getSelection()
    const originalRange = selection
      ? selection.rangeCount > 0 && selection.getRangeAt(0)
      : null

    document.body.appendChild(element)
    element.select()

    // Explicit selection workaround for iOS
    element.selectionStart = 0
    element.selectionEnd = text.length

    document.execCommand("copy")
    document.body.removeChild(element)

    if (originalRange) {
      selection!.removeAllRanges() // originalRange can't be truthy when selection is falsy
      selection!.addRange(originalRange)
    }

    // Get the focus back on the previously focused element, if any
    if (previouslyFocusedElement) {
      ;(previouslyFocusedElement as HTMLElement).focus()
    }
  }
}

export function isMobile() {
  return /Mobi|Android|iPhone/i.test(navigator.userAgent)
}

export function dateFormat(date: Date, fmt = "YYYY-mm-dd HH:MM") {
  let ret
  const opt = {
    "Y+": date.getFullYear().toString(),
    "m+": (date.getMonth() + 1).toString(),
    "d+": date.getDate().toString(),
    "H+": date.getHours().toString(),
    "M+": date.getMinutes().toString(),
    "S+": date.getSeconds().toString() // second
  }
  Object.entries(opt).forEach(([k, v]) => {
    ret = new RegExp("(" + k + ")").exec(fmt)
    if (ret) {
      fmt = fmt.replace(
        ret[1],
        ret[1].length == 1 ? v : v.padStart(ret[1].length, "0")
      )
    }
  })
  return fmt
}

export function splitKeys(keys: string) {
  return keys
    .trim()
    .split(/\s*[\|\n]\s*/)
    .filter(k => /sk-\w{48}/.test(k))
}

export function randomKey(keys: string[]) {
  return keys.length ? keys[Math.floor(Math.random() * keys.length)] : ""
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: (RequestInit & { timeout?: number }) | undefined
) {
  const { timeout = 500 } = init ?? {}

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  const response = await fetch(input, {
    ...init,
    signal: controller.signal
  })
  clearTimeout(id)
  return response
}
