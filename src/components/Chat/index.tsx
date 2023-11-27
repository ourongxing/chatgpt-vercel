import { createResizeObserver } from "@solid-primitives/resize-observer"
import { batch, createEffect, createSignal, onMount } from "solid-js"
import { useSearchParams } from "solid-start"
import { RootStore, loadSession } from "~/store"
import { LocalStorageKey, type ChatMessage } from "~/types"
import { setSession, isMobile } from "~/utils"
import MessageContainer from "./MessageContainer"
import InputBox, { defaultInputBoxHeight } from "./InputBox"
import { type FakeRoleUnion, setActionState } from "./SettingAction"

const SearchParamKey = "q"

export default function () {
  let containerRef: HTMLDivElement
  let controller: AbortController | undefined = undefined
  const [containerWidth, setContainerWidth] = createSignal("init")
  const [inputBoxHeight, setInputBoxHeight] = createSignal(
    defaultInputBoxHeight
  )
  const [searchParams] = useSearchParams()
  const q = searchParams[SearchParamKey]
  const { store, setStore } = RootStore
  onMount(() => {
    createResizeObserver(containerRef, ({ width }, el) => {
      if (el === containerRef) setContainerWidth(`${width}px`)
    })
    window.setTimeout(() => {
      document.querySelector("#root")?.classList.remove("before")
    }, 100)
    document.querySelector("#root")?.classList.add("after")
    loadSession(store.sessionId)
    if (q) sendMessage(q)
  })

  createEffect(() => {
    setSession(store.sessionId, {
      id: store.sessionId,
      lastVisit: Date.now(),
      messages: store.sessionSettings.saveSession
        ? store.messageList
        : store.messageList.filter(m => m.type === "locked"),
      settings: store.sessionSettings
    })
  })

  createEffect(() => {
    localStorage.setItem(
      LocalStorageKey.GLOBALSETTINGS,
      JSON.stringify(store.globalSettings)
    )
  })

  function archiveCurrentMessage() {
    if (store.currentAssistantMessage) {
      batch(() => {
        setStore("messageList", k => k.type === "temporary", "type", "default")
        setStore("currentAssistantMessage", "")
        setStore("currentMessageToken", 0)
        setStore("loading", false)
      })
      controller = undefined
    }
    !isMobile() && store.inputRef?.focus()
  }

  function stopStreamFetch() {
    if (controller) {
      controller?.abort()
      archiveCurrentMessage()
    }
  }

  async function sendMessage(value?: string, fakeRole?: FakeRoleUnion) {
    const inputValue = value ?? store.inputContent
    if (!inputValue) return
    setStore("inputContent", "")
    if (fakeRole === "assistant") {
      setActionState("fakeRole", "normal")
      if (
        store.messageList.at(-1)?.role !== "user" &&
        store.messageList.at(-2)?.role === "user"
      ) {
        setStore("messageList", store.messageList.length - 1, {
          role: "assistant",
          content: inputValue
        })
      } else if (store.messageList.at(-1)?.role === "user") {
        setStore("messageList", k => [
          ...k,
          {
            role: "assistant",
            content: inputValue
          }
        ])
      } else {
        setStore("messageList", k => [
          ...k,
          {
            role: "user",
            content: inputValue
          }
        ])
      }
    } else if (fakeRole === "user") {
      setActionState("fakeRole", "normal")
      setStore("messageList", k => [
        ...k,
        {
          role: "user",
          content: inputValue
        }
      ])
    } else {
      try {
        setStore("messageList", k => [
          ...k,
          {
            role: "user",
            content: inputValue
          }
        ])
        if (store.remainingToken < 0) {
          throw new Error(
            store.sessionSettings.continuousDialogue
              ? "本次对话过长，请清除之前部分对话或者缩短当前提问。"
              : "当前提问太长了，请缩短。"
          )
        }
        setStore("loading", true)
        controller = new AbortController()
        // 在关闭连续对话时，有效上下文只包含了锁定的对话。
        await fetchGPT(
          store.sessionSettings.continuousDialogue
            ? store.validContext
            : [
                ...store.validContext,
                {
                  role: "user",
                  content: inputValue
                }
              ]
        )
      } catch (error: any) {
        setStore("loading", false)
        controller = undefined
        if (!error.message.includes("abort")) {
          setStore("messageList", k => [
            ...k,
            {
              role: "error",
              content: error.message.replace(/(sk-\w{5})\w+/g, "$1")
            }
          ])
        }
      }
    }
    archiveCurrentMessage()
  }

  async function fetchGPT(messages: ChatMessage[]) {
    const response = await fetch("/api", {
      method: "POST",
      body: JSON.stringify({
        messages,
        key: store.globalSettings.APIKey || undefined,
        temperature: store.sessionSettings.APITemperature,
        password: store.globalSettings.password,
        model: store.currentModel
      }),
      signal: controller?.signal
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
        if (char === "\n" && store.currentAssistantMessage.endsWith("\n")) {
          continue
        }
        if (char) {
          batch(() => {
            if (store.currentAssistantMessage) {
              setStore(
                "messageList",
                k => k.type === "temporary",
                "content",
                k => k + char
              )
            } else {
              setStore("messageList", k => [
                ...k,
                {
                  role: "assistant",
                  content: char,
                  type: "temporary"
                }
              ])
            }
            setStore("currentAssistantMessage", k => k + char)
          })
        }
      }
      done = readerDone
    }
  }

  return (
    <main ref={containerRef!} class="mt-4">
      <MessageContainer
        sendMessage={sendMessage}
        inputBoxHeight={inputBoxHeight}
      />
      <InputBox
        height={inputBoxHeight}
        width={containerWidth}
        setHeight={setInputBoxHeight}
        sendMessage={sendMessage}
        stopStreamFetch={stopStreamFetch}
      />
    </main>
  )
}
