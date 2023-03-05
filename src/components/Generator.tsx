import { createSignal, For, onMount, Show } from "solid-js"
import MessageItem from "./MessageItem"
import type { ChatMessage } from "../types"

export default () => {
  let inputRef: HTMLTextAreaElement
  const [messageList, setMessageList] = createSignal<ChatMessage[]>([
    // {
    //   role: "system",
    //   content: `
    // \`\`\`js
    // console.log("Hello World")
    // `
    // }
  ])
  const [currentAssistantMessage, setCurrentAssistantMessage] = createSignal("")
  const [loading, setLoading] = createSignal(false)

  const handleButtonClick = async (value?: string) => {
    const inputValue = value ?? inputRef.value
    if (!inputValue) {
      return
    }
    setLoading(true)
    // @ts-ignore
    if (window?.umami) umami.trackEvent("chat_generate")
    inputRef.value = ""
    setHeight("3em")
    setMessageList([
      ...messageList(),
      {
        role: "user",
        content: inputValue
      }
    ])

    const response = await fetch("/api/stream", {
      method: "POST",
      body: JSON.stringify({
        messages:
          localStorage.getItem("continuous-dialogue") === "true"
            ? messageList()
            : [
                {
                  role: "user",
                  content: inputValue
                }
              ],
        key: localStorage.getItem("openai-api-key") || "",
        temperature:
          Number(localStorage.getItem("openai-api-range") || "60") / 100
      })
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const data = response.body
    if (!data) {
      throw new Error("No data")
    }
    const reader = data.getReader()
    const decoder = new TextDecoder("utf-8")
    let done = false

    while (!done) {
      const { value, done: readerDone } = await reader.read()
      if (value) {
        let char = decoder.decode(value)
        if (char === "\n" && currentAssistantMessage().endsWith("\n")) {
          continue
        }
        if (char) {
          setCurrentAssistantMessage(currentAssistantMessage() + char)
        }
      }
      done = readerDone
    }
    setMessageList([
      ...messageList(),
      {
        role: "assistant",
        content: currentAssistantMessage()
      }
    ])
    setCurrentAssistantMessage("")
    setLoading(false)
  }

  const clear = () => {
    inputRef.value = ""
    setMessageList([])
    setCurrentAssistantMessage("")
  }

  const [height, setHeight] = createSignal("3em")
  return (
    <div my-6>
      <For each={messageList()}>
        {message => (
          <MessageItem role={message.role} message={message.content} />
        )}
      </For>
      {currentAssistantMessage() && (
        <MessageItem role="assistant" message={currentAssistantMessage} />
      )}
      <Show
        when={!loading()}
        fallback={() => (
          <div class="h-12 my-4 flex items-center justify-center bg-slate bg-op-15 text-slate rounded-sm">
            AI 正在思考...
          </div>
        )}
      >
        <div class="my-4 flex items-end">
          <textarea
            ref={inputRef!}
            id="input"
            placeholder="与 ta 对话吧"
            autocomplete="off"
            autofocus
            disabled={loading()}
            onKeyDown={e => {
              if (e.key === "Enter") {
                if (!e.shiftKey && !e.isComposing) {
                  handleButtonClick()
                }
              }
            }}
            onInput={e => {
              setHeight("3em")
              setHeight((e.target as HTMLTextAreaElement).scrollHeight + "px")
            }}
            style={{
              height: height()
            }}
            class="self-end py-3 resize-none w-full px-3 text-slate bg-slate bg-op-15 focus:bg-op-20 focus:ring-0 focus:outline-none placeholder:text-slate-400 placeholder:op-30"
            rounded-l
          />
          <button
            onClick={() => handleButtonClick()}
            disabled={loading()}
            h-12
            px-2
            bg-slate
            bg-op-15
            text-slate
          >
            <span class="i-carbon:send-filled">123</span>
          </button>
          <button
            onClick={() => handleButtonClick(messageList().at(-2)?.content)}
            disabled={loading()}
            h-12
            bg-slate
            bg-op-15
            text-slate
          >
            <span class="i-carbon:reset">12312</span>
          </button>
          <button
            title="Clear"
            onClick={clear}
            disabled={loading()}
            h-12
            w-10
            bg-slate
            bg-op-15
            rounded-r
            text-slate
          >
            <span class="i-carbon:trash-can">12312</span>
          </button>
        </div>
      </Show>
    </div>
  )
}
