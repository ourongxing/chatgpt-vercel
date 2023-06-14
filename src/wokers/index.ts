import TokenWorker from "./tokens.worker?worker"
import MarkdownWorker from "./markdown.worker?worker"
import { generateId } from "~/utils"

const tokenWorker = new TokenWorker()
const markdownWorker = new MarkdownWorker()
export function countTokensInWorker(content: string): Promise<number> {
  if (!content) return Promise.resolve(0)
  const id = generateId()
  tokenWorker.postMessage({ type: "token", id, payload: content })
  return new Promise(resolve => {
    function handler(e: MessageEvent) {
      if (e.data.type === "token-return" && e.data.id === id) {
        tokenWorker.removeEventListener("message", handler)
        resolve(e.data.payload as number)
      }
    }
    tokenWorker.addEventListener("message", handler)
  })
}

export function renderMarkdownInWorker(content: string): Promise<string> {
  if (!content) return Promise.resolve("")
  const id = generateId()
  markdownWorker.postMessage({ type: "markdown", id, payload: content })
  return new Promise(resolve => {
    function handler(e: MessageEvent) {
      if (e.data.type === "markdown-return" && e.data.id === id) {
        markdownWorker.removeEventListener("message", handler)
        resolve(e.data.payload as string)
      }
    }
    markdownWorker.addEventListener("message", handler)
  })
}
