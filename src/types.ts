export interface ChatMessage {
  role: Role
  content: string
}

export type Role = "system" | "user" | "assistant" | "error"
