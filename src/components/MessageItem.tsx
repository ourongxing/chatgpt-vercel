import type { Setter } from "solid-js"
import type { ChatMessage, Role } from "../types"
import MessageAction from "./MessageAction"
import "../styles/message.css"
import "../styles/clipboard.css"
import { useCopyCode } from "~/hooks"
import { copyToClipboard } from "~/utils"
import vercel from "/assets/vercel.svg?raw"
import openai from "/assets/openai.svg?raw"
import md from "~/markdown-it"

interface Props {
  role: Role
  message: string
  index?: number
  sendMessage?: (message?: string) => void
  setInputContent?: Setter<string>
  setMessageList?: Setter<ChatMessage[]>
}

export default (props: Props) => {
  useCopyCode()
  const roleClass = {
    error: "bg-gradient-to-r from-red-400 to-red-700",
    system: "bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300",
    user: "bg-gradient-to-r from-red-300 to-blue-700 ",
    assistant: "bg-gradient-to-r from-yellow-300 to-red-700 "
  }

  function copy() {
    copyToClipboard(props.message)
  }

  function edit() {
    props.setInputContent && props.setInputContent(props.message)
  }

  function del() {
    if (props.setMessageList) {
      props.setMessageList(messages => {
        if (messages[props.index!]?.role === "user") {
          return messages.filter(
            (_, i) =>
              !(
                i === props.index ||
                (i === props.index! + 1 && _.role !== "user")
              )
          )
        }
        return messages.filter((_, i) => i !== props.index)
      })
    }
  }

  function reAnswer() {
    if (props.setMessageList && props.sendMessage) {
      let question = ""
      props.setMessageList(messages => {
        if (messages[props.index!]?.role === "user") {
          question = messages[props.index!].content
          return messages.filter(
            (_, i) =>
              !(
                i === props.index ||
                (i === props.index! + 1 && _.role !== "user")
              )
          )
        } else {
          // 回答的前一条消息一定是提问
          question = messages[props.index! - 1].content
          return messages.filter(
            (_, i) => !(i === props.index || i === props.index! - 1)
          )
        }
      })
      props.sendMessage(question)
    }
  }

  return (
    <div
      class="group flex gap-3 px-4 mx--4 rounded-lg transition-colors sm:hover:bg-slate/6 dark:sm:hover:bg-slate/5 relative message-item"
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
        reAnswer={reAnswer}
        role={props.role}
        hidden={props.index === undefined}
      />
    </div>
  )
}
