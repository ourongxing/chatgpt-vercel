import type { APIRoute } from "astro"
import { fetchWithTimeout, splitKeys } from "~/utils"
import { localKey, genBillingsTable, baseURL, fetchBilling } from "."
const sendKey = import.meta.env.SENDKEY
const sendChannel = import.meta.env.SENDCHANNEL || "9"

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

export const get: APIRoute = async () => {
  try {
    const keys = Array.from(new Set(splitKeys(localKey)))
    if (keys.length === 0) return new Response(`ok`)
    if (!sendKey) return new Response(`ok`)
    const status = await Promise.all(keys.map(k => checkBan(k)))
    const bannedKeys = keys.filter((_, i) => status[i])
    const billings = await Promise.all(keys.map(k => fetchBilling(k)))
    const table = await genBillingsTable(
      billings.sort((a, b) => b.rate - a.rate)
    )
    const titles = ["帐号余额充足", "没有帐号不可用"]
    const descs = [table, ""]
    if (billings.some(k => k.rate < 0.05)) titles[0] = "有帐号余额已少于 5%"
    if (bannedKeys.length) {
      titles[1] = "有帐号不可用"
      descs[1] =
        "\n\n以下帐号不可用，请检查\n\n" +
        bannedKeys.map(k => "- " + k.slice(0, 8)).join("\n")
    }
    await push(titles.join("，"), descs.join("\n\n"))
  } catch (e) {
    await push(`运行错误\n${String(e)}`)
  }
  return new Response(`ok`)
}

async function checkBan(key: string) {
  try {
    const res = await fetchWithTimeout(
      `https://${baseURL}/v1/chat/completions`,
      {
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
      }
    ).then((res: any) => res.json())
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
