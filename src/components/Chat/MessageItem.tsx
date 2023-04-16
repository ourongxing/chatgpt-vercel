import { Show } from "solid-js"
import { useCopyCode } from "~/hooks"
import md from "~/markdown-it"
import { RootStore } from "~/store"
import type { ChatMessage } from "~/types"
import { copyToClipboard } from "~/utils"
import MessageAction from "./MessageAction"
import openai from "/assets/openai.svg?raw"
import vercel from "/assets/vercel.svg?raw"
import type { FakeRoleUnion } from "./SettingAction"

interface Props {
  message: ChatMessage
  hiddenAction: boolean
  index?: number
  sendMessage?: (value?: string, fakeRole?: FakeRoleUnion) => void
}

export default (props: Props) => {
  useCopyCode()
  const { store, setStore } = RootStore
  const roleClass = {
    error: "bg-gradient-to-r from-red-400 to-red-700",
    system: "bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300",
    user: "bg-gradient-to-r from-red-300 to-blue-700 ",
    assistant: "bg-gradient-to-r from-yellow-300 to-red-700 "
  }

  function copy() {
    copyToClipboard(props.message.content)
  }

  function edit() {
    setStore("inputContent", props.message.content)
  }

  function del() {
    if (
      !props.hiddenAction &&
      props.index !== undefined &&
      props.index < store.messageList.length
    ) {
      setStore("messageList", messages => {
        if (messages[props.index!].role === "user") {
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
    if (
      props.sendMessage &&
      props.index !== undefined &&
      props.index < store.messageList.length
    ) {
      let question = ""
      setStore("messageList", messages => {
        if (messages[props.index!].role === "user") {
          question = messages[props.index!].content
          return messages.filter(
            (_, i) =>
              !(
                i === props.index ||
                (i === props.index! + 1 && _.role !== "user")
              )
          )
        } else {
          question = messages[props.index! - 1].content
          return messages.filter(
            (_, i) => !(i === props.index || i === props.index! - 1)
          )
        }
      })
      props.sendMessage(question)
    }
  }

  function lockMessage() {
    if (
      !props.hiddenAction &&
      props.index !== undefined &&
      props.index < store.messageList.length
    ) {
      if (store.messageList[props.index].role === "user") {
        setStore(
          "messageList",
          (k, i) =>
            i === props.index ||
            (i === props.index! + 1 && k.role === "assistant"),
          "type",
          type => (type === "locked" ? undefined : "locked")
        )
      } else {
        setStore("messageList", [props.index - 1, props.index], "type", type =>
          type === "locked" ? undefined : "locked"
        )
      }
    }
  }

  return (
    <div
      class="group flex gap-3 px-4 mx--4 rounded-lg transition-colors sm:hover:bg-slate/6 dark:sm:hover:bg-slate/5 relative message-item"
      classList={{
        temporary: props.message.type === "temporary"
      }}
    >
      <div
        class={`shadow-slate-5 shadow-sm dark:shadow-none shrink-0 w-7 h-7 mt-4 rounded-full op-80 flex items-center justify-center cursor-pointer ${
          roleClass[props.message.role]
        }`}
        classList={{
          "animate-spin": props.message.type === "temporary"
        }}
        onClick={lockMessage}
      >
        <Show when={props.message.type === "locked"}>
          <div class="i-carbon:locked text-white" />
        </Show>
      </div>
      <div
        class="message prose prose-slate dark:prose-invert dark:text-slate break-words overflow-hidden"
        innerHTML={md
          .render(props.message.content)
          .replace(
            /\s*Vercel\s*/g,
            `<a href="http://vercel.com/?utm_source=busiyi&utm_campaign=oss" style="border-bottom:0;margin-left: 6px">${vercel}</a>`
          )
          .replace(
            /\s*OpenAI\s*/g,
            `<a href="https://www.openai.com" style="border-bottom:0;margin-left: 6px">${openai}</a>`
          )}
      />
      <MessageAction
        del={del}
        copy={copy}
        edit={edit}
        reAnswer={reAnswer}
        role={props.message.role}
        hidden={props.hiddenAction}
      />
    </div>
  )
}
