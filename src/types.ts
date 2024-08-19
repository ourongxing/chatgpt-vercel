import { type SessionSettings } from "./env"

export const enum LocalStorageKey {
  GLOBALSETTINGS = "gpt-global-settings",
  THEME = "gpt-theme",
  PREFIXSESSION = "gpt-session-"
}

export interface ChatMessage {
  role: Role
  content: string
  type?: "default" | "locked" | "temporary"
}

export type Role = "system" | "user" | "assistant" | "error"
export type SimpleModel = "gpt-4o" | "gpt-4o-mini"
export type Model = "gpt-4o-mini" | "gpt-4o-2024-08-06"

export interface Prompt {
  desc: string
  detail: string
}

export interface Session {
  id: string
  lastVisit: number
  messages: ChatMessage[]
  settings: SessionSettings
}

export interface Option {
  desc: string
  title: string
  positions?: Set<number>
  extra?: any
}
