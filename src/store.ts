import { createStore } from "solid-js/store"
import { defaultEnv } from "./env"
import type { ChatMessage } from "./types"
import { createMemo, createRoot } from "solid-js"
import { countTokens, countTokensDollar } from "./utils"

let setting = defaultEnv.CLIENT_DEFAULT_SETTING
let _ = import.meta.env.CLIENT_DEFAULT_SETTING
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

let maxInputTokens = defaultEnv.CLIENT_MAX_INPUT_TOKENS
_ = import.meta.env.CLIENT_MAX_INPUT_TOKENS
if (_) {
  try {
    if (Number.isNaN(+_)) {
      maxInputTokens = {
        ...maxInputTokens,
        ...JSON.parse(_)
      }
    }
  } catch (e) {
    console.error("Error parsing MAX_INPUT_TOKEN:", e)
  }
}

export const LocalStorageKey = {
  GlobalSettings: "gpt-global-settings",
  Sessions: "gpt-sessions",
  MainSession: "gpt-main-session",
  Theme: "gpt-theme"
}
export const defaultMessage: ChatMessage = {
  role: "assistant",
  content:
    import.meta.env.CLIENT_DEFAULT_MESSAGE || defaultEnv.CLIENT_DEFAULT_MESSAGE,
  type: "default"
}

function Store() {
  const [store, setStore] = createStore({
    setting,
    inputContent: "",
    messageList: [] as ChatMessage[],
    currentAssistantMessage: "",
    loading: false,
    inputRef: null as HTMLTextAreaElement | null,
    get validContext() {
      return validContext()
    },
    get contextToken() {
      return contextToken()
    },
    get contextToken$() {
      return contextToken$()
    },
    get currentMessageToken() {
      return currentMessageToken()
    },
    get currentMessageToken$() {
      return currentMessageToken$()
    },
    get inputContentToken() {
      return inputContentToken()
    },
    get inputContentToken$() {
      return inputContentToken$()
    },
    get remainingToken() {
      return remainingToken()
    }
  })

  const validContext = createMemo(() =>
    store.setting.continuousDialogue
      ? store.messageList.filter(
          (k, i, _) =>
            (k.role === "assistant" && _[i - 1]?.role === "user") ||
            (k.role === "user" && _[i + 1]?.role !== "error")
        )
      : store.messageList.filter(k => k.type === "locked")
  )

  const contextToken = createMemo(() =>
    store.validContext.reduce((acc, cur) => acc + countTokens(cur.content), 0)
  )

  const contextToken$ = createMemo(
    () =>
      +countTokensDollar(
        store.contextToken,
        store.setting.APIModel,
        false
      ).toFixed(4)
  )

  const currentMessageToken = createMemo(() =>
    countTokens(store.currentAssistantMessage)
  )

  const currentMessageToken$ = createMemo(
    () =>
      +countTokensDollar(
        store.currentMessageToken,
        store.setting.APIModel,
        true
      ).toFixed(4)
  )

  const inputContentToken = createMemo(() => countTokens(store.inputContent))

  const inputContentToken$ = createMemo(
    () =>
      +countTokensDollar(
        store.inputContentToken,
        store.setting.APIModel,
        true
      ).toFixed(4)
  )

  const remainingToken = createMemo(
    () =>
      maxInputTokens[store.setting.APIModel] -
      store.contextToken -
      store.inputContentToken
  )
  return { store, setStore }
}

export const RootStore = createRoot(Store)
