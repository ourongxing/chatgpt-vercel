import type { ParsedEvent, ReconnectInterval } from "eventsource-parser"
import { createParser } from "eventsource-parser"
import type { ChatMessage, Model } from "../../shared/types"
import { defaultEnv } from "../../shared/env"
import { randomKey, splitKeys, fetchWithTimeout } from "../utils"

export const config = {
  runtime: "edge",
  /**
   * https://vercel.com/docs/concepts/edge-network/regions#region-list
   * disable hongkong
   * only for vercel
   */
  regions: [
    "arn1",
    "bom1",
    "bru1",
    "cdg1",
    "cle1",
    "cpt1a",
    "dub1",
    "fra1",
    "gru1",
    "hnd1",
    "iad1",
    "icn1",
    "kix1",
    "lhr1",
    "pdx1",
    "sfo1",
    "sin1",
    "syd1"
  ]
}

export const localKey = process.env.OPENAI_API_KEY || ""

export const baseURL =
  process.env.NO_GFW !== "false"
    ? defaultEnv.OPENAI_API_BASE_URL
    : (
        process.env.OPENAI_API_BASE_URL || defaultEnv.OPENAI_API_BASE_URL
      ).replace(/^https?:\/\//, "")

// + 作用是将字符串转换为数字
const timeout = isNaN(+process.env.TIMEOUT!)
  ? defaultEnv.TIMEOUT
  : +process.env.TIMEOUT!

const passwordSet = process.env.PASSWORD || defaultEnv.PASSWORD


export default defineEventHandler(async event => {
  try {
    const body: {
      messages?: ChatMessage[]
      key?: string
      temperature: number
      password?: string
      model: Model
    } = await readBody(event).then(JSON.parse)
    const { messages, key = localKey, temperature, password, model } = body

    if (passwordSet && password !== passwordSet) {
      throw new Error("密码错误，请联系网站管理员。")
    }

    if (!messages?.length) {
      throw new Error("没有输入任何文字。")
    }

    const apiKey = randomKey(splitKeys(key))

    if (!apiKey) throw new Error("没有填写 OpenAI API key，或者 key 填写错误。")

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const rawRes = await fetchWithTimeout(
      `https://${baseURL}/v1/chat/completions`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        timeout,
        method: "POST",
        body: JSON.stringify({
          model,
          messages: messages.map(k => ({ role: k.role, content: k.content })),
          temperature,
          stream: true
        })
      }
    ).catch((err: { message: any }) => {
      return new Response(
        JSON.stringify({
          error: {
            message: err.message
          }
        }),
        { status: 500 }
      )
    })

    if (!rawRes.ok) {
      return new Response(rawRes.body, {
        status: rawRes.status,
        statusText: rawRes.statusText
      })
    }

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
        for await (const chunk of rawRes.body as any) {
          parser.feed(decoder.decode(chunk))
        }
      }
    })

    return new Response(stream)
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: {
          message: err.message
        }
      }),
      { status: 400 }
    )
  }
})
