import { countTokens } from "~/utils/tokens"

const sw = self as unknown as ServiceWorkerGlobalScope & typeof globalThis

sw.addEventListener("message", event => {
  if (event.data.type === "token" && event.data.payload) {
    const tokens = countTokens(event.data.payload)
    sw.postMessage({
      type: "token-return",
      payload: tokens,
      id: event.data.id
    })
  }
})
