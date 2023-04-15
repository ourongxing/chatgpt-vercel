import { createStore } from "solid-js/store"
import { defaultEnv } from "./env"
import type { ChatMessage, Session } from "./types"
import { createMemo, createRoot } from "solid-js"
import { countTokens, countTokensDollar } from "./utils"

let globalSettings = { ...defaultEnv.CLIENT_GLOBAL_SETTINGS }
let _ = import.meta.env.CLIENT_GLOBAL_SETTINGS
if (_) {
  try {
    globalSettings = {
      ...globalSettings,
      ...JSON.parse(_)
    }
  } catch (e) {
    console.error("Error parsing CLIENT_GLOBAL_SETTINGS:", e)
  }
}

let sessionSettings = { ...defaultEnv.CLIENT_SESSION_SETTINGS }
_ = import.meta.env.CLIENT_SESSION_SETTINGS
if (_) {
  try {
    sessionSettings = {
      ...globalSettings,
      ...JSON.parse(_)
    }
  } catch (e) {
    console.error("Error parsing CLIENT_SESSION_SETTINGS:", e)
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
    console.error("Error parsing CLIENT_MAX_INPUT_TOKENS:", e)
  }
}

export const defaultMessage: ChatMessage = {
  role: "assistant",
  content:
    import.meta.env.CLIENT_DEFAULT_MESSAGE || defaultEnv.CLIENT_DEFAULT_MESSAGE,
  type: "default"
}

function Store() {
  const [store, setStore] = createStore({
    globalSettings,
    sessionSettings,
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
    store.sessionSettings.continuousDialogue
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

  const contextToken$ = createMemo(() =>
    countTokensDollar(store.contextToken, store.sessionSettings.APIModel, false)
  )

  const currentMessageToken = createMemo(() =>
    countTokens(store.currentAssistantMessage)
  )

  const currentMessageToken$ = createMemo(() =>
    countTokensDollar(
      store.currentMessageToken,
      store.sessionSettings.APIModel,
      true
    )
  )

  const inputContentToken = createMemo(() => countTokens(store.inputContent))

  const inputContentToken$ = createMemo(() =>
    countTokensDollar(
      store.inputContentToken,
      store.sessionSettings.APIModel,
      true
    )
  )

  const remainingToken = createMemo(
    () =>
      maxInputTokens[store.sessionSettings.APIModel] -
      store.contextToken -
      store.inputContentToken
  )
  return { store, setStore }
}

export const RootStore = createRoot(Store)

export const LocalStorageKey = {
  GlobalSettings: "gpt-global-settings",
  Theme: "gpt-theme"
}

export function getSession(id: string) {
  try {
    const _ = localStorage.getItem("gpt-session-" + id)
    if (_) return JSON.parse(_) as Session
  } catch (e) {
    console.error("Error parsing session:", e)
  }
  return undefined
}

export function setSession(id: string, data: Session) {
  localStorage.setItem("gpt-session-" + id, JSON.stringify(data))
}

export function delSession(id: string) {
  localStorage.removeItem("gpt-session-" + id)
}
