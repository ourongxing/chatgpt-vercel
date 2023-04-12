import { Show, createEffect, createSignal, onMount } from "solid-js"
import { store, setStore } from "~/store"
import { parsePrompts, scrollToBottom } from "~/utils"
import PromptList from "./PromptList"
import SettingAction from "./SettingAction"
import { makeEventListener } from "@solid-primitives/event-listener"
import type { PromptItem } from "~/types"
import throttle from "just-throttle"
import { Fzf } from "fzf"
import { defaultMessage } from "./MessageBox"

const prompts = parsePrompts()
const fzf = new Fzf(prompts, {
  selector: k => `${k.desc}||${k.prompt}`
})

export default function (props: {
  width: string
  sendMessage(content?: string): void
  stopStreamFetch(): void
}) {
  const [height, setHeight] = createSignal("48px")
  const [compatiblePrompt, setCompatiblePrompt] = createSignal<PromptItem[]>([])
  const [compositionend, setCompositionend] = createSignal(true)
  onMount(() => {
    makeEventListener(
      store.inputRef!,
      "compositionend",
      () => {
        setCompositionend(true)
        handleInput()
      },
      { passive: true }
    )
    makeEventListener(
      store.inputRef!,
      "compositionstart",
      () => {
        setCompositionend(false)
      },
      { passive: true }
    )
  })

  createEffect(prev => {
    store.inputContent
    if (prev) {
      setHeight("48px")
      if (store.inputContent === "") {
        setCompatiblePrompt([])
      } else {
        const scrollHeight = store.inputRef?.scrollHeight
        if (scrollHeight)
          setHeight(
            `${
              scrollHeight > window.innerHeight - 64
                ? window.innerHeight - 64
                : scrollHeight
            }px`
          )
      }
      store.inputRef?.focus()
    }
    return true
  })

  function clearSession() {
    setStore("messageList", messages => {
      const locked = messages.filter(k => k.type === "locked")
      if (locked.length) return locked
      else return [defaultMessage]
    })
    setStore("currentAssistantMessage", "")
  }

  function selectPrompt(prompt: string) {
    setStore("inputContent", prompt)
    setCompatiblePrompt([])

    const scrollHeight = store.inputRef?.scrollHeight
    if (scrollHeight)
      setHeight(
        `${
          scrollHeight > window.innerHeight - 64
            ? window.innerHeight - 64
            : scrollHeight
        }px`
      )
    store.inputRef?.focus()
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
    const scrollHeight = store.inputRef?.scrollHeight
    if (scrollHeight)
      setHeight(
        `${
          scrollHeight > window.innerHeight - 64
            ? window.innerHeight - 64
            : scrollHeight
        }px`
      )
    if (!compositionend()) return
    const value = store.inputRef?.value
    if (value) {
      setStore("inputContent", value)
      findPrompts(value)
    }
  }
  return (
    <div
      class="pb-2em px-2em fixed bottom-0 z-100"
      style={{
        "background-color": "var(--c-bg)",
        width: props.width === "init" ? "100%" : props.width
      }}
    >
      <div
        style={{
          transition: "opacity 1s ease-in-out",
          opacity: props.width === "init" ? 0 : 100
        }}
      >
        <Show
          when={
            !store.loading && !compatiblePrompt().length && height() === "48px"
          }
        >
          <SettingAction clear={clearSession} messaages={store.messageList} />
        </Show>
        <Show
          when={!store.loading}
          fallback={
            <div class="h-12 flex items-center justify-center bg-slate bg-op-15 text-slate rounded">
              <span>AI 正在思考...</span>
              <div
                class="ml-1em px-2 py-0.5 border border-slate text-slate rounded-md text-sm op-70 cursor-pointer hover:bg-slate/10"
                onClick={props.stopStreamFetch}
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
              ref={el => setStore("inputRef", el)}
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
                    props.sendMessage()
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
                "border-top-right-radius": height() === "48px" ? 0 : "0.25rem",
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
                  store.inputRef?.focus()
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
                onClick={() => props.sendMessage()}
                class="i-carbon:send-filled text-5 mx-3"
              />
            </div>
          </div>
        </Show>
      </div>
    </div>
  )
}
