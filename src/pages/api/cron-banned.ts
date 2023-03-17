import type { APIRoute } from "astro"
import { splitKeys } from "~/utils"
// @ts-ignore
import fetch from "node-fetch-retry-timeout"
import { localKey, baseURL } from "."
import { push } from "./cron-available"
export const sendKey = import.meta.env.SENDKEY || process.env.SENDKEY

export const get: APIRoute = async context => {
  try {
    const keys = splitKeys(localKey)
    const status = await Promise.all(keys.map(k => checkBan(k)))
    const bannedKey = keys.filter((_, i) => status[i])
    if (bannedKey.length)
      await push(
        "有帐号被 ban",
        "以下帐号被 ban，请检查\n" + bannedKey.map(k => "-" + k).join("\n")
      )
    else await push("所有帐号正常")
  } catch (e) {
    await push(`运行错误\n${String(e)}`)
  }
  return new Response(`ok`)
}

async function checkBan(key: string) {
  try {
    const res = await fetch(`https://${baseURL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`
      },
      timeout: 500,
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: "Hello"
          }
        ]
      })
    }).then((res: any) => res.json())
    return res.error?.type === "access_terminated"
  } catch {
    return false
  }
}
