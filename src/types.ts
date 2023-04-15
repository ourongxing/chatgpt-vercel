import { type SessionSettings } from "./env"

export interface ChatMessage {
  role: Role
  content: string
  type?: "default" | "locked" | "temporary"
}

export type Role = "system" | "user" | "assistant" | "error"
export type Model = "gpt-3.5-turbo" | "gpt-4" | "gpt-4-32k"

export interface PromptItem {
  desc: string
  prompt: string
  positions?: Set<number>
}

export interface Session {
  lastVisit: number
  messages: ChatMessage[]
  settings: SessionSettings
}

export interface Option {
  desc: string
  title: string
  positions?: Set<number>
}
