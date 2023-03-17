import type { APIRoute } from "astro"
import { splitKeys } from "~/utils"
import { localKey, genBillingsTable, baseURL, fetchBilling } from "."
// @ts-ignore
import fetch from "node-fetch-retry-timeout"
const sendKey = import.meta.env.SENDKEY || process.env.SENDKEY
const sendChannel =
  import.meta.env.SENDCHANNEL || process.env.SENDCHANNEL || "9"

export const get: APIRoute = async () => {
  try {
    const keys = splitKeys(localKey)
    const status = await Promise.all(keys.map(k => checkBan(k)))
    const bannedKey = keys.filter((_, i) => status[i])
    const unbanKey = keys.filter((_, i) => !status[i])
    const billings = await Promise.all(unbanKey.map(k => fetchBilling(k)))
    const table = await genBillingsTable(billings)
    const titles = ["帐号余额充足", "没有帐号被 ban"]
    const descs = [table, ""]
    if (billings.some(k => k.rate < 0.05)) titles[0] = "有帐号余额已少于 5%"
    if (bannedKey.length) {
      titles[1] = "有帐号被 ban"
      descs[1] =
        "以下帐号被 ban，请检查\n\n" + bannedKey.map(k => "- " + k).join("\n")
    }
    await push(titles.join("，"), descs.join("\n\n"))
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
      timeout: 700,
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

async function push(title: string, desp?: string) {
  if (sendKey)
    await fetch(`https://sctapi.ftqq.com/${sendKey}.send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        desp,
        channel: Number.isInteger(sendChannel) ? Number(sendChannel) : 9
      })
    })
}
