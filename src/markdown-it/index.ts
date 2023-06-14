import MarkdownIt from "markdown-it"
// @ts-ignore
import mdKatex from "markdown-it-katex"
import mdHighlight from "markdown-it-highlightjs"
import mdKbd from "markdown-it-kbd"
import preWrapperPlugin from "./preWrapper"

export const md = MarkdownIt({
  linkify: true,
  breaks: true
})
  .use(mdKatex)
  .use(mdHighlight, {
    inline: true
  })
  .use(mdKbd)
  .use(preWrapperPlugin)
