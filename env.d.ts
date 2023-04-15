interface ImportMetaEnv {
  CLIENT_GLOBAL_SETTINGS?: string
  CLIENT_SESSION_SETTINGS?: string
  CLIENT_DEFAULT_MESSAGE?: string
  CLIENT_MAX_INPUT_TOKENS?: string
  OPENAI_API_BASE_URL?: string
  OPENAI_API_KEY?: string
  TIMEOUT?: string
  PASSWORD?: string
  SEND_KEY?: string
  SEND_CHANNEL?: string
  NO_GFW?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
