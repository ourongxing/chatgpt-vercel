export function splitKeys(keys: string) {
  return keys
    .trim()
    .split(/\s*[\|\n]\s*/)
    .filter(k => /^(?:sk-\w{48}|sk-proj-\w{48})$/.test(k))
}

export function randomKey(keys: string[]) {
  return keys.length ? keys[Math.floor(Math.random() * keys.length)] : ""
}

export async function fetchWithTimeout(
  input: URL | string,
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
