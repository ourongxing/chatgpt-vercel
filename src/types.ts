export interface ChatMessage {
  role: Role
  content: string
}

export type Role = "system" | "user" | "assistant" | "error"
export type Model = "gpt-3.5-turbo" | "gpt-4" | "gpt-4-32k"
