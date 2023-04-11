interface ImportMetaEnv {
  CLIENT_AUTO_RESET_CONTINUOUS_DIALOGUE?: string
  CLIENT_DEFAULT_SETTING?: string
  CLIENT_DEFAULT_MESSAGE?: string
  OPENAI_API_BASE_URL?: string
  OPENAI_API_KEY?: string
  TIMEOUT?: string
  MAX_INPUT_TOKENS?: string
  PASSWORD?: string
  SEND_KEY?: string
  SEND_CHANNEL?: string
  NO_GFW?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
