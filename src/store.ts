import { createStore } from "solid-js/store"
import { defaultEnv } from "./env"
import type { ChatMessage } from "./types"

let setting = defaultEnv.CLIENT_DEFAULT_SETTING
if (import.meta.env.CLIENT_DEFAULT_SETTING) {
  try {
    setting = {
      ...setting,
      ...JSON.parse(import.meta.env.CLIENT_DEFAULT_SETTING)
    }
  } catch (e) {
    console.error("Error parsing DEFAULT_SETTING:", e)
  }
}

export const [store, setStore] = createStore({
  setting,
  inputContent: "",
  messageList: [] as ChatMessage[]
})
