import { For, createEffect } from "solid-js"
import { defaultEnv } from "~/env"
import { store } from "~/store"
import type { ChatMessage } from "~/types"
import { scrollToBottom } from "~/utils"
import MessageItem from "./MessageItem"

export const defaultMessage: ChatMessage = {
  role: "assistant",
  content:
    import.meta.env.CLIENT_DEFAULT_MESSAGE || defaultEnv.CLIENT_DEFAULT_MESSAGE,
  type: "default"
}

export default function (props: { sendMessage: (content?: string) => void }) {
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
    </div>
  )
}
