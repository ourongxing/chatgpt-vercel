import {
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show
} from "solid-js"
import { createStore } from "solid-js/store"
import MessageItem from "./MessageItem"
import type { ChatMessage } from "../types"
import Setting from "./Setting"

const defaultSetting = {
  continuousDialogue: false,
  archiveSession: false,
  openaiAPIKey: "xxxxxxxxxxxxxxxxxxxxxxxxxxx",
  openaiAPITemperature: 60
}

export type Setting = typeof defaultSetting
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
  const [controller, setController] = createSignal<AbortController>()
  const [setting, setSetting] = createSignal(defaultSetting)

  onMount(() => {
    const storage = localStorage.getItem("setting")
    const session = localStorage.getItem("session")
    try {
      let archiveSession = false
      if (storage) {
        const parsed = JSON.parse(storage)
        archiveSession = parsed.archiveSession
        setSetting({
          ...parsed,
          continuousDialogue: false
        })
      }
      if (session && archiveSession) {
        setMessageList(JSON.parse(session))
      }
    } catch {
      console.log("Setting parse error")
    }
  })

  createEffect(() => {
    localStorage.setItem("setting", JSON.stringify(setting()))
  })
  createEffect(() => {
    if (setting().archiveSession)
      localStorage.setItem("session", JSON.stringify(messageList()))
  })
  function archiveCurrentMessage() {
    if (currentAssistantMessage()) {
      setMessageList([
        ...messageList(),
        {
          role: "assistant",
          content: currentAssistantMessage()
        }
      ])
      setCurrentAssistantMessage("")
      setLoading(false)
      setController()
      inputRef.focus()
    }
  }
  async function handleButtonClick(value?: string) {
    const inputValue = value ?? inputRef.value
    if (!inputValue) {
      return
    }
    // @ts-ignore
    if (window?.umami) umami.trackEvent("chat_generate")
    inputRef.value = ""
    setHeight("3em")
    if (
      !value ||
      value !==
        messageList()
          .filter(k => k.role === "user")
          .at(-1)?.content
    ) {
      setMessageList([
        ...messageList(),
        {
          role: "user",
          content: inputValue
        }
      ])
    }
    try {
      await fetchGPT(inputValue)
    } catch (error) {
      setCurrentAssistantMessage(String(error))
    }
    archiveCurrentMessage()
  }
  async function fetchGPT(inputValue: string) {
    setLoading(true)
    const controller = new AbortController()
    setController(controller)
    const response = await fetch("/api/stream", {
      method: "POST",
      body: JSON.stringify({
        messages: setting().continuousDialogue
          ? messageList()
          : [
              {
                role: "user",
                content: inputValue
              }
            ],
        key: setting().openaiAPIKey,
        temperature: setting().openaiAPITemperature / 100
      }),
      signal: controller.signal
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const data = response.body
    if (!data) {
      throw new Error("没有返回数据")
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
  }

  function clear() {
    inputRef.value = ""
    setMessageList([])
    setCurrentAssistantMessage("")
  }

  function stopStreamFetch() {
    if (controller()) {
      controller()?.abort()
      archiveCurrentMessage()
    }
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
            <span>AI 正在思考...</span>
            <div
              class="ml-1em px-2 py-0.5 border border-slate text-slate rounded-md text-sm op-70 cursor-pointer hover:bg-slate/10"
              onClick={stopStreamFetch}
            >
              不需要了
            </div>
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
            onClick={() =>
              handleButtonClick(
                messageList()
                  .filter(k => k.role === "user")
                  .at(-1)?.content
              )
            }
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
      <Setting setting={setting} setSetting={setSetting} />
    </div>
  )
}
