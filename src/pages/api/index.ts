import type { APIRoute } from "astro"
import {
  createParser,
  ParsedEvent,
  ReconnectInterval
} from "eventsource-parser"
import type { ChatMessage } from "~/types"
import GPT3Tokenizer from "gpt3-tokenizer"
import { getAll } from "@vercel/edge-config"
import { splitKeys, randomWithWeight, randomKey } from "~/utils"

const tokenizer = new GPT3Tokenizer({ type: "gpt3" })

export const localKey =
  import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY || ""

export const baseURL = process.env.VERCEL
  ? "api.openai.com"
  : (
      import.meta.env.OPENAI_API_BASE_URL ||
      process.env.OPENAI_API_BASE_URL ||
      "api.openai.com"
    ).replace(/^https?:\/\//, "")

const maxTokens = Number(
  import.meta.env.MAX_INPUT_TOKENS || process.env.MAX_INPUT_TOKENS
)

const pwd = import.meta.env.PASSWORD || process.env.PASSWORD

export const post: APIRoute = async context => {
  try {
    const body = await context.request.json()
    const {
      messages,
      key = localKey,
      temperature = 0.6,
      password
    } = body as {
      messages?: ChatMessage[]
      key?: string
      temperature?: number
      password?: string
    }

    if (pwd && pwd !== password) {
      return new Response("密码错误，请联系网站管理员。")
    }

    if (!messages?.length) {
      return new Response("没有输入任何文字。")
    } else {
      const content = messages.at(-1)!.content.trim()
      if (content.startsWith("查询填写的 Key 的余额")) {
        if (key !== localKey) {
          return new Response(await genBillingsTable(splitKeys(key)))
        } else {
          return new Response("没有填写 OpenAI API key，不会查询内置的 Key。")
        }
      } else if (content.startsWith("sk-")) {
        return new Response(await genBillingsTable(splitKeys(content)))
      }
    }

    const apiKey = randomKeyWithBalance(splitKeys(key))

    if (!apiKey)
      return new Response("没有填写 OpenAI API key，或者 key 填写错误。")

    const tokens = messages.reduce((acc, cur) => {
      const tokens = tokenizer.encode(cur.content).bpe.length
      return acc + tokens
    }, 0)

    if (tokens > (Number.isInteger(maxTokens) ? maxTokens : 3072)) {
      if (messages.length > 1)
        return new Response(
          `由于开启了连续对话选项，导致本次对话过长，请清除部分内容后重试，或者关闭连续对话选项。`
        )
      else return new Response("太长了，缩短一点吧。")
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const completion = await fetch(`https://${baseURL}/v1/chat/completions`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      method: "POST",
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        temperature,
        // max_tokens: 4096 - tokens,
        stream: true
      })
    })

    const stream = new ReadableStream({
      async start(controller) {
        const streamParser = (event: ParsedEvent | ReconnectInterval) => {
          if (event.type === "event") {
            const data = event.data
            if (data === "[DONE]") {
              controller.close()
              return
            }
            try {
              const json = JSON.parse(data)
              const text = json.choices[0].delta?.content
              const queue = encoder.encode(text)
              controller.enqueue(queue)
            } catch (e) {
              controller.error(e)
            }
          }
        }
        const parser = createParser(streamParser)
        for await (const chunk of completion.body as any) {
          parser.feed(decoder.decode(chunk))
        }
      }
    })

    return new Response(stream)
  } catch (e) {
    return new Response(String(e).replace(/sk-\w+/g, "sk-xxxxxxxx"))
  }
}

export async function fetchBilling(key: string) {
  return (await fetch(`https://${baseURL}/dashboard/billing/credit_grants`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`
    }
  }).then(res => res.json())) as {
    total_granted: number
    total_used: number
    total_available: number
  }
}

export async function genBillingsTable(keys: string[]) {
  const res = await Promise.all(keys.map(k => fetchBilling(k)))
  const table = res
    .map(
      (k, i) =>
        `| ${keys[i].slice(0, 8)} | ${k.total_available.toFixed(4)}(${(
          (k.total_available / k.total_granted) *
          100
        ).toFixed(1)}%) | ${k.total_used.toFixed(4)} | ${k.total_granted} |`
    )
    .join("\n")

  return `| Key  | 剩余 | 已用 | 总额度 |
| ---- | ---- | ---- | ------ |
${table}
`
}

async function randomKeyWithBalance(keys: string[]) {
  if (process.env.EDGE_CONFIG) {
    const map = await getAll()
    const weights = keys.map(k => map[k] || 5) as number[]
    return randomWithWeight(keys, weights)
  } else return randomKey(keys)
}
