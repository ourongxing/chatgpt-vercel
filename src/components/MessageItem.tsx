import type { Setter } from "solid-js"
import type { ChatMessage } from "../types"
import MarkdownIt from "markdown-it"
// @ts-ignore
import mdKatex from "markdown-it-katex"
import mdHighlight from "markdown-it-highlightjs"
import mdKbd from "markdown-it-kbd"
import MessageAction from "./MessageAction"
import { preWrapperPlugin } from "~/markdown-it"
import "../styles/message.css"
import "../styles/clipboard.css"
import { useCopyCode } from "~/hooks"
import { copyToClipboard } from "~/utils"
import vercel from "/assets/vercel.svg?raw"
import openai from "/assets/openai.svg?raw"

interface Props {
  role: ChatMessage["role"]
  message: string
  index?: number
  setInputContent?: Setter<string>
  setMessageList?: Setter<ChatMessage[]>
}

export default (props: Props) => {
  useCopyCode()
  const roleClass = {
    system: "bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300",
    user: "bg-gradient-to-r from-red-300 to-blue-700 ",
    assistant: "bg-gradient-to-r from-yellow-300 to-red-700 "
  }

  const md = MarkdownIt({
    linkify: true,
    breaks: true
  })
    .use(mdKatex)
    .use(mdHighlight, {
      inline: true
    })
    .use(mdKbd)
    .use(preWrapperPlugin)

  function copy() {
    copyToClipboard(props.message)
  }

  function edit() {
    props.setInputContent && props.setInputContent(props.message)
  }

  function del() {
    if (props.setMessageList && props.index !== undefined) {
      props.setMessageList(list => {
        if (list[props.index!]?.role === "user") {
          const arr = list.reduce(
            (acc, cur, i) => {
              if (cur.role === "assistant" && i === acc.at(-1)! + 1) acc.push(i)
              return acc
            },
            [props.index] as number[]
          )

          return list.filter((_, i) => {
            return !arr.includes(i)
          })
        }
        return list.filter((_, i) => i !== props.index)
      })
    }
  }

  return (
    <div
      class="group flex gap-3 px-4 mx--4 rounded-lg transition-colors sm:hover:bg-slate/5 dark:sm:hover:bg-slate/2 relative message-item"
      classList={{
        temporary: props.index === undefined
      }}
    >
      <div
        class={`shrink-0 w-7 h-7 mt-4 rounded-full op-80 ${
          roleClass[props.role]
        }`}
      />
      <div
        class="message prose prose-slate dark:prose-invert dark:text-slate break-words overflow-hidden"
        innerHTML={md
          .render(props.message)
          .replace(
            /Vercel/g,
            `<a href="http://vercel.com/?utm_source=busiyi&utm_campaign=oss" style="border-bottom:0">${vercel}</a>`
          )
          .replace(
            /OpenAI/g,
            `<a href="https://www.openai.com" style="border-bottom:0">${openai}</a>`
          )}
      />
      <MessageAction
        del={del}
        copy={copy}
        edit={edit}
        role={props.role}
        hidden={props.index === undefined}
      />
    </div>
  )
}
