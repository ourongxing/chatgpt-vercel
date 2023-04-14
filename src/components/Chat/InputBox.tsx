import { makeEventListener } from "@solid-primitives/event-listener"
import { Fzf } from "fzf"
import throttle from "just-throttle"
import { Show, createEffect, createSignal, onMount } from "solid-js"
import { RootStore } from "~/store"
import type { PromptItem } from "~/types"
import { parsePrompts, scrollToBottom } from "~/utils"
import PromptList from "./PromptList"
import SettingAction, { type FakeRoleUnion } from "./SettingAction"
import { state as actionState } from "./SettingAction"

const prompts = parsePrompts()
const fzf = new Fzf(prompts, {
  selector: k => `${k.desc}||${k.prompt}`
})

// 3em
const defaultHeight = 48
export default function (props: {
  width: string
  sendMessage(content?: string, fakeRole?: FakeRoleUnion): void
  stopStreamFetch(): void
}) {
  const [height, setHeight] = createSignal(defaultHeight)
  const [candidatePrompts, setCandidatePrompts] = createSignal<PromptItem[]>([])
  const [compositionend, setCompositionend] = createSignal(true)
  const { store, setStore } = RootStore

  onMount(() => {
    if (store.inputRef) {
      makeEventListener(
        store.inputRef,
        "compositionend",
        () => {
          setCompositionend(true)
          handleInput()
        },
        { passive: true }
      )
      makeEventListener(
        store.inputRef,
        "compositionstart",
        () => {
          setCompositionend(false)
        },
        { passive: true }
      )
    }
  })

  function setSuitableheight() {
    const scrollHeight = store.inputRef?.scrollHeight
    if (scrollHeight)
      setHeight(
        scrollHeight > window.innerHeight - 64
          ? window.innerHeight - 64
          : scrollHeight
      )
  }

  createEffect(prev => {
    store.inputContent
    if (prev) {
      setHeight(defaultHeight)
      if (store.inputContent === "") {
        setCandidatePrompts([])
      } else {
        setSuitableheight()
      }
      store.inputRef?.focus()
    }
    return true
  })

  function selectPrompt(prompt: string) {
    setStore("inputContent", prompt)
    setCandidatePrompts([])
    setSuitableheight()
    store.inputRef?.focus()
  }

  const findPrompts = throttle(
    (value: string) => {
      if (value === "/" || value === " ") return setCandidatePrompts(prompts)
      const query = value.replace(/^[\/ ](.*)/, "$1")
      if (query !== value)
        setCandidatePrompts(
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
    setHeight(defaultHeight)
    setSuitableheight()
    if (!compositionend()) return
    const value = store.inputRef?.value
    if (value) {
      setStore("inputContent", value)
      findPrompts(value)
    } else {
      setStore("inputContent", "")
      setCandidatePrompts([])
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
            !store.loading &&
            !candidatePrompts().length &&
            height() === defaultHeight
          }
        >
          <SettingAction />
        </Show>
        <Show
          when={!store.loading}
          fallback={
            <div
              class="px-2em animate-gradient-border cursor-pointer hover:bg-op-90 dark:bg-#292B31 bg-#E7EBF0 h-3em flex items-center justify-center"
              onClick={props.stopStreamFetch}
            >
              <span class="dark:text-slate text-slate-7">
                AI 正在思考 | Tokens: {store.currentMessageToken}/$
                {store.currentMessageToken$}
              </span>
            </div>
          }
        >
          <Show when={candidatePrompts().length}>
            <PromptList
              prompts={candidatePrompts()}
              select={selectPrompt}
            ></PromptList>
          </Show>
          <div class="flex items-end relative">
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
                if (candidatePrompts().length) {
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
                    props.sendMessage(undefined, actionState.fakeRole)
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
                height: height() + "px"
              }}
              class="self-end p-3 pr-2.2em resize-none w-full text-slate-7 dark:text-slate bg-slate bg-op-15 focus:(bg-op-20 ring-0 outline-none) placeholder:(text-slate-800 dark:text-slate-400 op-40)"
              classList={{
                "rounded-t": candidatePrompts().length === 0,
                "rounded-b": true
              }}
            />
            <Show when={store.inputContent}>
              <div
                class="absolute flex text-1em items-center"
                classList={{
                  "right-2.5em bottom-1em": height() === defaultHeight,
                  "right-0.8em top-0.8em": height() !== defaultHeight
                }}
              >
                <button
                  class="i-carbon:add-filled rotate-45 text-slate-7 dark:text-slate text-op-20! hover:text-op-60!"
                  onClick={() => {
                    setStore("inputContent", "")
                    store.inputRef?.focus()
                  }}
                />
              </div>
            </Show>
            <div class="absolute right-0.5em bottom-0.8em flex items-center">
              <button
                title="发送"
                onClick={() =>
                  props.sendMessage(undefined, actionState.fakeRole)
                }
                class="i-carbon:send-filled text-1.5em text-slate-7 dark:text-slate text-op-80! hover:text-op-100!"
              />
            </div>
          </div>
        </Show>
      </div>
    </div>
  )
}
