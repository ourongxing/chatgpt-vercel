import { type Accessor, For, Show, createEffect } from "solid-js"
import { RootStore, defaultMessage } from "~/store"
import { scrollToBottom } from "~/utils"
import MessageItem from "./MessageItem"

export default function ({
  sendMessage,
  inputBoxHeight
}: {
  sendMessage(value?: string): void
  inputBoxHeight: Accessor<number>
}) {
  const { store } = RootStore

  createEffect((prev: number | undefined) => {
    if (prev !== undefined && store.messageList.length > prev) {
      scrollToBottom()
    }
    return store.messageList.length
  })

  createEffect(prev => {
    if (store.currentAssistantMessage) scrollToBottom()
  })

  createEffect(prev => {
    inputBoxHeight()
    if (prev) scrollToBottom()
    return true
  })

  return (
    <div
      class="px-1em"
      id="message-container"
      style={{
        "margin-bottom": `calc(6em + ${inputBoxHeight() + "px" ?? "0px"})`
      }}
    >
      <div
        id="message-container-img"
        class="px-1em"
        style={{
          "background-color": "var(--c-bg)"
        }}
      >
        <Show when={!store.messageList.length}>
          <MessageItem hiddenAction={true} message={defaultMessage} />
        </Show>
        <For each={store.messageList}>
          {(message, index) => (
            <MessageItem
              message={message}
              hiddenAction={store.loading}
              index={index()}
              sendMessage={sendMessage}
            />
          )}
        </For>
        <Show when={store.currentAssistantMessage}>
          <MessageItem
            hiddenAction={true}
            message={{
              role: "assistant",
              content: store.currentAssistantMessage,
              type: "temporary"
            }}
          />
        </Show>
      </div>
      <Show
        when={!store.loading && (store.contextToken || store.inputContentToken)}
      >
        <div class="flex items-center px-1em text-0.8em">
          <hr class="flex-1 border-slate/40" />
          <Show
            when={store.inputContentToken}
            fallback={
              <span class="mx-1 text-slate/40">
                {`有效上下文 Tokens : ${
                  store.contextToken
                }/$${store.contextToken$.toFixed(4)}`}
              </span>
            }
          >
            <span class="mx-1 text-slate/40">
              {`有效上下文+提问 Tokens : ${
                store.contextToken + store.inputContentToken
              }(`}
              <span
                classList={{
                  "text-red-500": store.remainingToken < 0
                }}
              >
                {store.remainingToken}
              </span>
              {`)/$${(store.contextToken$ + store.inputContentToken$).toFixed(
                4
              )}`}
            </span>
          </Show>
          <hr class="flex-1  border-slate/30" />
        </div>
      </Show>
    </div>
  )
}
