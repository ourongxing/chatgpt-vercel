import { makeEventListener } from "@solid-primitives/event-listener"
import { createResizeObserver } from "@solid-primitives/resize-observer"
import { Fzf } from "fzf"
import throttle from "just-throttle"
import { createEffect, createSignal, For, onMount, Show } from "solid-js"
import { useSearchParams } from "solid-start"
import { defaultEnv } from "~/env"
import { setStore, store } from "~/store"
import type { ChatMessage, PromptItem } from "~/types"
import { parsePrompts, isMobile, scrollToBottom } from "~/utils"
import MessageItem from "./MessageItem"
import PromptList from "./PromptList"
import SettingAction from "./SettingAction"

const prompts = parsePrompts()
const fzf = new Fzf(prompts, {
  selector: k => `${k.desc}||${k.prompt}`
})
const _message =
  import.meta.env.CLIENT_DEFAULT_MESSAGE || defaultEnv.CLIENT_DEFAULT_MESSAGE
let _setting = defaultEnv.CLIENT_DEFAULT_SETTING
if (import.meta.env.CLIENT_DEFAULT_SETTING) {
  try {
    _setting = {
      ..._setting,
      ...JSON.parse(import.meta.env.CLIENT_DEFAULT_SETTING)
    }
  } catch (e) {
    console.error("Error parsing DEFAULT_SETTING:", e)
  }
}

const _ = import.meta.env.CLIENT_AUTO_RESET_CONTINUOUS_DIALOGUE
const __ = import.meta.env.CLIENT_AUTO_RESET_CONTINUOUS_DIALOGUE
const _reset = _ && _ !== String(__) ? !__ : __

export default function (props: { sessionID?: string }) {
  let inputRef: HTMLTextAreaElement
  let containerRef: HTMLDivElement
  const [currentAssistantMessage, setCurrentAssistantMessage] = createSignal("")
  const [loading, setLoading] = createSignal(false)
  const [controller, setController] = createSignal<AbortController>()
  const [compatiblePrompt, setCompatiblePrompt] = createSignal<PromptItem[]>([])
  const [containerWidth, setContainerWidth] = createSignal("init")
  const defaultMessage: ChatMessage = {
    role: "assistant",
    content: _message,
    special: "default"
  }
  const [height, setHeight] = createSignal("48px")
  const [compositionend, setCompositionend] = createSignal(true)
  const [searchParams] = useSearchParams()

  onMount(() => {
    makeEventListener(
      inputRef,
      "compositionend",
      () => {
        setCompositionend(true)
        handleInput()
      },
      { passive: true }
    )
    makeEventListener(
      inputRef,
      "compositionstart",
      () => {
        setCompositionend(false)
      },
      { passive: true }
    )
    createResizeObserver(containerRef, ({ width, height }, el) => {
      if (el === containerRef) setContainerWidth(`${width}px`)
    })
    const setting = localStorage.getItem("setting")
    const session = localStorage.getItem("session")
    try {
      let archiveSession = false
      if (setting) {
        const parsed = JSON.parse(setting)
        archiveSession = parsed.archiveSession
        setStore("setting", t => ({
          ...t,
          ...parsed,
          ...(_reset ? { continuousDialogue: false } : {})
        }))
      }
      if (searchParams.q) {
        window.history.replaceState(undefined, "ChatGPT", "/")
        sendMessage(searchParams.q)
      } else {
        if (session && archiveSession) {
          const parsed = JSON.parse(session) as ChatMessage[]
          if (parsed.length === 1 && parsed[0].special === "default") {
            setStore("messageList", [defaultMessage])
          } else setStore("messageList", parsed)
        } else setStore("messageList", [defaultMessage])
      }
    } catch {
      console.log("Setting parse error")
    }
  })

  createEffect((prev: number | undefined) => {
    if (prev !== undefined && store.messageList.length > prev) {
      scrollToBottom()
    }
    return store.messageList.length
  })

  createEffect(() => {
    if (currentAssistantMessage()) scrollToBottom()
  })

  createEffect(prev => {
    store.messageList
    if (prev) {
      if (store.messageList.length === 0) {
        setStore("messageList", [defaultMessage])
      } else if (
        store.messageList.length > 1 &&
        store.messageList[0].special === "default"
      ) {
        setStore("messageList", store.messageList.slice(1))
      } else if (store.setting.archiveSession) {
        localStorage.setItem("session", JSON.stringify(store.messageList))
      }
    }
    return true
  })

  createEffect(() => {
    localStorage.setItem("setting", JSON.stringify(store.setting))
  })

  createEffect(prev => {
    store.inputContent
    if (prev) {
      setHeight("48px")
      if (store.inputContent === "") {
        setCompatiblePrompt([])
      } else {
        const scrollHeight = inputRef?.scrollHeight
        if (scrollHeight)
          setHeight(
            `${
              scrollHeight > window.innerHeight - 64
                ? window.innerHeight - 64
                : scrollHeight
            }px`
          )
      }
      inputRef.focus()
    }
    return true
  })

  function archiveCurrentMessage() {
    if (currentAssistantMessage()) {
      setStore("messageList", [
        ...store.messageList,
        {
          role: "assistant",
          content: currentAssistantMessage().trim()
        }
      ])
      setCurrentAssistantMessage("")
      setLoading(false)
      setController()
      !isMobile() && inputRef.focus()
    }
  }

  async function sendMessage(value?: string) {
    const inputValue = value ?? store.inputContent
    if (!inputValue) {
      return
    }
    // @ts-ignore
    if (window?.umami) umami.trackEvent("chat_generate")
    setStore("inputContent", "")
    if (
      !value ||
      value !== store.messageList.filter(k => k.role === "user").at(-1)?.content
    ) {
      setStore("messageList", [
        ...store.messageList,
        {
          role: "user",
          content: inputValue
        }
      ])
    }
    try {
      await fetchGPT(inputValue)
    } catch (error: any) {
      setLoading(false)
      setController()
      if (!error.message.includes("abort"))
        setStore("messageList", [
          ...store.messageList,
          {
            role: "error",
            content: error.message.replace(/(sk-\w{5})\w+/g, "$1")
          }
        ])
    }
    archiveCurrentMessage()
  }

  async function fetchGPT(inputValue: string) {
    setLoading(true)
    const controller = new AbortController()
    setController(controller)
    const systemRule = store.setting.systemRule.trim()
    const message = {
      role: "user",
      content: inputValue
    }
    if (systemRule) message.content += "。\n\n" + systemRule
    const response = await fetch("/api", {
      method: "POST",
      body: JSON.stringify({
        messages: store.setting.continuousDialogue
          ? [...store.messageList.slice(0, -1), message].filter(
              k => k.role !== "error"
            )
          : [...store.messageList.filter(k => k.special === "locked"), message],
        key: store.setting.openaiAPIKey || undefined,
        temperature: store.setting.openaiAPITemperature / 100,
        password: store.setting.password,
        model: store.setting.model
      }),
      signal: controller.signal
    })
    if (!response.ok) {
      const res = await response.json()
      throw new Error(res.error.message)
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
        const char = decoder.decode(value)
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

  function clearSession() {
    setStore("messageList", messages =>
      messages.filter(k => k.special === "locked")
    )
    setCurrentAssistantMessage("")
  }

  function stopStreamFetch() {
    if (controller()) {
      controller()?.abort()
      archiveCurrentMessage()
    }
  }

  function selectPrompt(prompt: string) {
    setStore("inputContent", prompt)
    setCompatiblePrompt([])

    const scrollHeight = inputRef?.scrollHeight
    if (scrollHeight)
      setHeight(
        `${
          scrollHeight > window.innerHeight - 64
            ? window.innerHeight - 64
            : scrollHeight
        }px`
      )
    inputRef.focus()
  }

  const findPrompts = throttle(
    (value: string) => {
      if (value === "/" || value === " ") return setCompatiblePrompt(prompts)
      const query = value.replace(/^[\/ ](.*)/, "$1")
      if (query !== value)
        setCompatiblePrompt(
          fzf.find(query).map(k => ({
            ...k.item,
            positions: k.positions
          }))
        )
    },
    250,
    {
      trailing: false,
      leading: true
    }
  )

  async function handleInput() {
    setHeight("48px")
    const scrollHeight = inputRef?.scrollHeight
    if (scrollHeight)
      setHeight(
        `${
          scrollHeight > window.innerHeight - 64
            ? window.innerHeight - 64
            : scrollHeight
        }px`
      )
    if (!compositionend()) return
    const { value } = inputRef
    setStore("inputContent", value)
    findPrompts(value)
  }

  return (
    <div ref={containerRef!} class="mt-4">
      <div class="px-1em mb-6em">
        <div
          id="message-container"
          class="px-1em"
          style={{
            "background-color": "var(--c-bg)"
          }}
        >
          <For each={store.messageList}>
            {(message, index) => (
              <MessageItem
                message={message}
                hiddenAction={loading() || message.special === "default"}
                index={index()}
                sendMessage={sendMessage}
              />
            )}
          </For>
          {currentAssistantMessage() && (
            <MessageItem
              hiddenAction={true}
              message={{
                role: "assistant",
                content: currentAssistantMessage(),
                special: "temporary"
              }}
            />
          )}
        </div>
      </div>
      <div
        class="pb-2em px-2em fixed bottom-0 z-100"
        style={{
          "background-color": "var(--c-bg)",
          width: containerWidth() === "init" ? "100%" : containerWidth()
        }}
      >
        <div
          style={{
            transition: "opacity 1s ease-in-out",
            opacity: containerWidth() === "init" ? 0 : 100
          }}
        >
          <Show
            when={
              !loading() && !compatiblePrompt().length && height() === "48px"
            }
          >
            <SettingAction clear={clearSession} messaages={store.messageList} />
          </Show>
          <Show
            when={!loading()}
            fallback={
              <div class="h-12 flex items-center justify-center bg-slate bg-op-15 text-slate rounded">
                <span>AI 正在思考...</span>
                <div
                  class="ml-1em px-2 py-0.5 border border-slate text-slate rounded-md text-sm op-70 cursor-pointer hover:bg-slate/10"
                  onClick={stopStreamFetch}
                >
                  不需要了
                </div>
              </div>
            }
          >
            <Show when={compatiblePrompt().length}>
              <PromptList
                prompts={compatiblePrompt()}
                select={selectPrompt}
              ></PromptList>
            </Show>
            <div class="flex items-end">
              <textarea
                ref={inputRef!}
                id="input"
                placeholder="与 ta 对话吧"
                autocomplete="off"
                value={store.inputContent}
                autofocus
                onClick={scrollToBottom}
                onKeyDown={e => {
                  if (e.isComposing) return
                  if (compatiblePrompt().length) {
                    if (
                      e.key === "ArrowUp" ||
                      e.key === "ArrowDown" ||
                      e.keyCode === 13
                    ) {
                      e.preventDefault()
                    }
                  } else if (e.keyCode === 13) {
                    if (!e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  } else if (e.key === "ArrowUp") {
                    const userMessages = store.messageList
                      .filter(k => k.role === "user")
                      .map(k => k.content)
                    const content = userMessages.at(-1)
                    if (content && !store.inputContent) {
                      e.preventDefault()
                      setStore("inputContent", content)
                    }
                  }
                }}
                onInput={handleInput}
                style={{
                  height: height(),
                  "border-bottom-right-radius": 0,
                  "border-top-right-radius":
                    height() === "48px" ? 0 : "0.25rem",
                  "border-top-left-radius":
                    compatiblePrompt().length === 0 ? "0.25rem" : 0
                }}
                class="self-end py-3 resize-none w-full px-3 text-slate-7 dark:text-slate bg-slate bg-op-15 focus:bg-op-20 focus:ring-0 focus:outline-none placeholder:text-slate-400 placeholder:text-slate-400 placeholder:op-40 rounded-l"
              />
              <Show when={store.inputContent}>
                <button
                  class="i-carbon:add-filled absolute right-5.5em bottom-3em rotate-45 text-op-20! hover:text-op-80! text-slate-7 dark:text-slate"
                  onClick={() => {
                    setStore("inputContent", "")
                    inputRef.focus()
                  }}
                />
              </Show>
              <div
                class="flex text-slate-7 dark:text-slate bg-slate bg-op-15 text-op-80! hover:text-op-100! h-3em items-center rounded-r"
                style={{
                  "border-top-right-radius":
                    compatiblePrompt().length === 0 ? "0.25rem" : 0
                }}
              >
                <button
                  title="发送"
                  onClick={() => sendMessage()}
                  class="i-carbon:send-filled text-5 mx-3"
                />
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  )
}
