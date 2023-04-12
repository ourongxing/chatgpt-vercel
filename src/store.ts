import { createStore } from "solid-js/store"
import { defaultEnv } from "./env"
import type { ChatMessage } from "./types"

let setting = defaultEnv.CLIENT_DEFAULT_SETTING
const _ = import.meta.env.CLIENT_DEFAULT_SETTING
if (_) {
  try {
    setting = {
      ...setting,
      ...JSON.parse(_)
    }
  } catch (e) {
    console.error("Error parsing DEFAULT_SETTING:", e)
  }
}

export const [store, setStore] = createStore({
  setting,
  inputContent: "",
  messageList: [] as ChatMessage[],
  currentAssistantMessage: "",
  loading: false,
  inputRef: null as HTMLTextAreaElement | null
})
