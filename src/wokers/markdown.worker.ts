import { md } from "~/markdown-it"

const sw = self as unknown as ServiceWorkerGlobalScope & typeof globalThis

sw.addEventListener("message", event => {
  if (event.data.type === "markdown" && event.data.payload) {
    const renderd = md.render(event.data.payload)
    sw.postMessage({
      type: "markdown-return",
      payload: renderd,
      id: event.data.id
    })
  }
})
