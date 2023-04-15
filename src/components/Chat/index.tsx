import { createResizeObserver } from "@solid-primitives/resize-observer"
import { createEffect, createSignal, onMount } from "solid-js"
import { useSearchParams } from "solid-start"
import { LocalStorageKey, RootStore, getSession, setSession } from "~/store"
import type { ChatMessage } from "~/types"
import { isMobile } from "~/utils"
import MessageContainer from "./MessageContainer"
import InputBox from "./InputBox"
import PrefixTitle from "../PrefixTitle"
import { type FakeRoleUnion, setState as setActionState } from "./SettingAction"

const SearchParamKey = "q"

export default function (props: { sessionID: string }) {
  let containerRef: HTMLDivElement
  let controller: AbortController | undefined = undefined
  const [containerWidth, setContainerWidth] = createSignal("init")
  const [searchParams] = useSearchParams()
  const q = searchParams[SearchParamKey]
  const { store, setStore } = RootStore
  onMount(() => {
    createResizeObserver(containerRef, ({ width }, el) => {
      if (el === containerRef) setContainerWidth(`${width}px`)
    })
    setTimeout(() => {
      document.querySelector("#root")?.classList.remove("before")
    })
    document.querySelector("#root")?.classList.add("after")
    const globalSettings = localStorage.getItem(LocalStorageKey.GlobalSettings)
    try {
      if (globalSettings) {
        const parsed = JSON.parse(globalSettings)
        setStore("globalSettings", t => ({
          ...t,
          ...parsed
        }))
      }
      const session = getSession(props.sessionID)
      if (session) {
        const { settings, messages } = session
        if (settings) {
          setStore("sessionSettings", t => ({
            ...t,
            ...settings
          }))
        }
        if (messages) {
          if (store.sessionSettings.saveSession || !q) {
            setStore("messageList", messages)
          } else {
            setStore(
              "messageList",
              messages.filter(m => m.type === "locked")
            )
            if (q) sendMessage(q)
          }
        }
      } else if (q) {
        sendMessage(q)
      }
    } catch {
      console.log("Localstorage parse error")
    }
  })

  createEffect(() => {
    setSession(props.sessionID, {
      lastVisit: Date.now(),
      messages: store.sessionSettings.continuousDialogue
        ? store.validContext
        : store.validContext.filter(m => m.type === "locked"),
      settings: store.sessionSettings
    })
  })

  createEffect(() => {
    localStorage.setItem(
      LocalStorageKey.GlobalSettings,
      JSON.stringify(store.globalSettings)
    )
  })

  function archiveCurrentMessage() {
    if (store.currentAssistantMessage) {
      setStore("messageList", k => [
        ...k,
        {
          role: "assistant",
          content: store.currentAssistantMessage.trim()
        }
      ])
      setStore("currentAssistantMessage", "")
      setStore("loading", false)
      controller = undefined
    }
    !isMobile() && store.inputRef?.focus()
    // searchParams[SearchParamKey] && setSearchParams({ q: undefined })
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
              : "提问太长了，请缩短。"
          )
        }
        setStore("loading", true)
        controller = new AbortController()
        await fetchGPT(store.validContext)
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
        model: store.sessionSettings.APIModel
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
          setStore("currentAssistantMessage", k => k + char)
        }
      }
      done = readerDone
    }
  }

  return (
    <main ref={containerRef!} class="mt-4">
      {searchParams[SearchParamKey] && (
        <PrefixTitle>{searchParams[SearchParamKey]}</PrefixTitle>
      )}
      <MessageContainer sendMessage={sendMessage} />
      <InputBox
        width={containerWidth()}
        sendMessage={sendMessage}
        stopStreamFetch={stopStreamFetch}
      />
    </main>
  )
}
