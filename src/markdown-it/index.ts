import MarkdownIt from "markdown-it"
import mdKbd from "markdown-it-kbd"
import preWrapperPlugin from "./preWrapper"

export async function mdFactory() {
  // @ts-ignore
  const { default: mdKatex } = await import("markdown-it-katex")
  const { default: mdHighlight } = await import("markdown-it-highlightjs")
  return MarkdownIt({
    linkify: true,
    breaks: true
  })
    .use(mdKatex)
    .use(mdHighlight, {
      inline: true
    })
    .use(mdKbd)
    .use(preWrapperPlugin)
}
