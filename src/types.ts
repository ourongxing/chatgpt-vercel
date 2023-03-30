export interface ChatMessage {
  role: Role
  content: string
  special?: "default" | "locked" | "temporary"
}

export type Role = "system" | "user" | "assistant" | "error"
export type Model = "gpt-3.5-turbo" | "gpt-4" | "gpt-4-32k"

export interface PromptItem {
  desc: string
  prompt: string
  positions?: Set<number>
}
