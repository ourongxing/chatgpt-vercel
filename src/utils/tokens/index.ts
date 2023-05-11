import type { Model } from "~/types"
import GPT3Tokenizer from "./tokenizer"

export default class GPT3NodeTokenizer extends GPT3Tokenizer {
  private textEncoder: TextEncoder
  private textDecoder: TextDecoder

  constructor(options: { type: "gpt3" | "codex" }) {
    super(options)

    this.textEncoder = new TextEncoder()
    this.textDecoder = new TextDecoder()
  }

  encodeUtf8(text: string): Uint8Array {
    return this.textEncoder.encode(text)
  }

  decodeUtf8(bytes: Uint8Array): string {
    return this.textDecoder.decode(bytes)
  }
}

export function countTokens(text: string) {
  const tokenizer = new GPT3NodeTokenizer({ type: "gpt3" })
  return tokenizer.encode(text).bpe.length
}

export function countTokensDollar(
  tokens: number,
  model: Model,
  completion: boolean
) {
  switch (model) {
    case "gpt-3.5-turbo":
      return (tokens / 1000) * 0.002
    case "gpt-4":
      return completion ? (tokens / 1000) * 0.03 : (tokens / 1000) * 0.06
    case "gpt-4-32k":
      return completion ? (tokens / 1000) * 0.06 : (tokens / 1000) * 0.12
  }
}
