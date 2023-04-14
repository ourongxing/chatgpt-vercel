import { For, Show, createEffect } from "solid-js"
import { store } from "~/store"
import { scrollToBottom } from "~/utils"
import MessageItem from "./MessageItem"

export default function (props: {
  sendMessage(value?: string, fakeRobot?: boolean): void
}) {
  createEffect(prev => {
    store.messageList
    if (prev) {
      if (store.setting.archiveSession) {
        localStorage.setItem("session", JSON.stringify(store.messageList))
      }
    }
    return true
  })

  createEffect((prev: number | undefined) => {
    if (prev !== undefined && store.messageList.length > prev) {
      scrollToBottom()
    }
    return store.messageList.length
  })

  createEffect(() => {
    if (store.currentAssistantMessage) scrollToBottom()
  })

  return (
    <div class="px-1em mb-6em" id="message-container">
      <div
        id="message-container-img"
        class="px-1em"
        style={{
          "background-color": "var(--c-bg)"
        }}
      >
        <For each={store.messageList}>
          {(message, index) => (
            <MessageItem
              message={message}
              hiddenAction={store.loading || message.type === "default"}
              index={index()}
              sendMessage={props.sendMessage}
            />
          )}
        </For>
        {store.currentAssistantMessage && (
          <MessageItem
            hiddenAction={true}
            message={{
              role: "assistant",
              content: store.currentAssistantMessage,
              type: "temporary"
            }}
          />
        )}
      </div>
      <Show
        when={!store.loading && (store.contextToken || store.inputContentToken)}
      >
        <div class="flex items-center px-1em text-0.8em">
          <hr class="flex-1 border-slate/30" />
          <Show
            when={store.inputContentToken}
            fallback={
              <span class="mx-1 text-slate/30">
                {`有效上下文 Tokens : ${store.contextToken}/$${store.contextToken$}`}
              </span>
            }
          >
            <span class="mx-1 text-slate/30">
              {`有效上下文+提问 Tokens : ${
                store.contextToken + store.inputContentToken
              }(${
                store.maxAllToken - store.contextToken - store.inputContentToken
              })/$${store.contextToken$ + store.inputContentToken$}`}
            </span>
          </Show>
          <hr class="flex-1  border-slate/30" />
        </div>
      </Show>
    </div>
  )
}
