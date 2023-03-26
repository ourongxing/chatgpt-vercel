import { createEffect, createSignal, For, onMount, Show } from "solid-js"
import { createResizeObserver } from "@solid-primitives/resize-observer"
import MessageItem from "./MessageItem"
import type { ChatMessage, PromptItem } from "~/types"
import SettingAction from "./SettingAction"
import PromptList from "./PromptList"
import { Fzf } from "fzf"
import throttle from "just-throttle"
import { isMobile } from "~/utils"
import type { Setting } from "~/system"
import { makeEventListener } from "@solid-primitives/event-listener"

export default function (props: {
  prompts: PromptItem[]
  env: {
    setting: Setting
    message: string
    resetContinuousDialogue: boolean
  }
  question?: string
}) {
  let inputRef: HTMLTextAreaElement
  let containerRef: HTMLDivElement

  const {
    message: _message,
    setting: _setting,
    resetContinuousDialogue: _resetContinuousDialogue
  } = props.env
  const [messageList, setMessageList] = createSignal<ChatMessage[]>([])
  const [inputContent, setInputContent] = createSignal("")
  const [currentAssistantMessage, setCurrentAssistantMessage] = createSignal("")
  const [loading, setLoading] = createSignal(false)
  const [controller, setController] = createSignal<AbortController>()
  const [setting, setSetting] = createSignal(_setting)
  const [compatiblePrompt, setCompatiblePrompt] = createSignal<PromptItem[]>([])
  const [containerWidth, setContainerWidth] = createSignal("init")
  const defaultMessage: ChatMessage = {
    role: "assistant",
    content: _message,
    special: "default"
  }
  const fzf = new Fzf(props.prompts, {
    selector: k => `${k.desc}||${k.prompt}`
  })
  const [height, setHeight] = createSignal("48px")
  const [compositionend, setCompositionend] = createSignal(true)

  const scrollToBottom = throttle(
    () => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
      })
    },
    250,
    { leading: false, trailing: true }
  )

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
    document.querySelector("main")?.classList.remove("before")
    document.querySelector("main")?.classList.add("after")
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
        setSetting({
          ..._setting,
          ...parsed,
          ...(_resetContinuousDialogue ? { continuousDialogue: false } : {})
        })
      }
      if (props.question) {
        window.history.replaceState(undefined, "ChatGPT", "/")
        sendMessage(props.question)
      } else {
        if (session && archiveSession) {
          const parsed = JSON.parse(session) as ChatMessage[]
          if (parsed.length === 1 && parsed[0].special === "default") {
            setMessageList([defaultMessage])
          } else setMessageList(parsed)
        } else setMessageList([defaultMessage])
      }
    } catch {
      console.log("Setting parse error")
    }
  })

  createEffect((prev: number | undefined) => {
    if (prev !== undefined && messageList().length > prev) {
      scrollToBottom()
    }
    return messageList().length
  })

  createEffect(() => {
    if (currentAssistantMessage()) scrollToBottom()
  })

  createEffect(prev => {
    messageList()
    if (prev) {
      if (messageList().length === 0) {
        setMessageList([defaultMessage])
      } else if (
        messageList().length > 1 &&
        messageList()[0].special === "default"
      ) {
        setMessageList(messageList().slice(1))
      } else if (setting().archiveSession) {
        localStorage.setItem("session", JSON.stringify(messageList()))
      }
    }
    return true
  })

  createEffect(() => {
    localStorage.setItem("setting", JSON.stringify(setting()))
  })

  createEffect(prev => {
    inputContent()
    if (prev) {
      setHeight("48px")
      if (inputContent() === "") {
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
      setMessageList([
        ...messageList(),
        {
          role: "assistant",
          content: currentAssistantMessage().trim(),
          id: Date.now()
        }
      ])
      setCurrentAssistantMessage("")
      setLoading(false)
      setController()
      !isMobile() && inputRef.focus()
    }
  }

  async function sendMessage(value?: string) {
    const inputValue = value ?? inputContent()
    if (!inputValue) {
      return
    }
    // @ts-ignore
    if (window?.umami) umami.trackEvent("chat_generate")
    setInputContent("")
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
          content: inputValue,
          id: Date.now()
        }
      ])
    }
    try {
      await fetchGPT(inputValue)
    } catch (error: any) {
      setLoading(false)
      setController()
      if (!error.message.includes("aborted a request"))
        setMessageList([
          ...messageList(),
          {
            role: "error",
            content: error.message.replace(/(sk-\w{5})\w+/g, "$1"),
            id: Date.now()
          }
        ])
    }
    archiveCurrentMessage()
  }

  async function fetchGPT(inputValue: string) {
    setLoading(true)
    const controller = new AbortController()
    setController(controller)
    const systemRule = setting().systemRule.trim()
    const message = {
      role: "user",
      content: inputValue
    }
    if (systemRule) message.content += "。\n\n" + systemRule
    const response = await fetch("/api", {
      method: "POST",
      body: JSON.stringify({
        messages: setting().continuousDialogue
          ? [...messageList().slice(0, -1), message].filter(
              k => k.role !== "error"
            )
          : [...messageList().filter(k => k.special === "locked"), message],
        key: setting().openaiAPIKey || undefined,
        temperature: setting().openaiAPITemperature / 100,
        password: setting().password,
        model: setting().model
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
    setMessageList(messages => messages.filter(k => k.special === "locked"))
    setCurrentAssistantMessage("")
  }

  function stopStreamFetch() {
    if (controller()) {
      controller()?.abort()
      archiveCurrentMessage()
    }
  }

  function selectPrompt(prompt: string) {
    setInputContent(prompt)
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
      if (value === "/" || value === " ")
        return setCompatiblePrompt(props.prompts)
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
    setInputContent(value)
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
          <For each={messageList()}>
            {(message, index) => (
              <MessageItem
                message={message}
                hiddenAction={loading() || message.special === "default"}
                index={index()}
                setInputContent={setInputContent}
                sendMessage={sendMessage}
                setMessageList={setMessageList}
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
            <SettingAction
              setting={setting}
              setSetting={setSetting}
              clear={clearSession}
              messaages={messageList()}
            />
          </Show>
          <Show
            when={!loading()}
            fallback={() => (
              <div class="h-12 flex items-center justify-center bg-slate bg-op-15 text-slate rounded">
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
                value={inputContent()}
                autofocus
                onClick={scrollToBottom}
                onKeyDown={e => {
                  if (e.isComposing) return
                  if (compatiblePrompt().length) {
                    if (
                      e.key === "ArrowUp" ||
                      e.key === "ArrowDown" ||
                      e.key === "Enter"
                    ) {
                      e.preventDefault()
                    }
                  } else if (e.key === "Enter") {
                    if (!e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  } else if (e.key === "ArrowUp") {
                    const userMessages = messageList()
                      .filter(k => k.role === "user")
                      .map(k => k.content)
                    const content = userMessages.at(-1)
                    if (content && !inputContent()) {
                      e.preventDefault()
                      setInputContent(content)
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
                class="self-end py-3 resize-none w-full px-3 text-slate-7 dark:text-slate bg-slate bg-op-15 focus:bg-op-20 focus:ring-0 focus:outline-none placeholder:text-slate-400 placeholder:text-slate-400 placeholder:op-40"
                rounded-l
              />
              <Show when={inputContent()}>
                <button
                  class="i-carbon:add-filled absolute right-5em bottom-3em rotate-45 text-op-20! hover:text-op-80! text-slate-7 dark:text-slate"
                  onClick={() => {
                    setInputContent("")
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
