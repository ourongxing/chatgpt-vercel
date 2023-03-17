import type { APIRoute } from "astro"
import { splitKeys } from "~/utils"
import { localKey, genBillingsTable, baseURL, fetchBilling } from "."
export const sendKey = import.meta.env.SENDKEY || process.env.SENDKEY

export const get: APIRoute = async context => {
  try {
    const keys = splitKeys(localKey)
    const billings = await Promise.all(keys.map(k => fetchBilling(k)))
    const table = await genBillingsTable(billings)
    if (billings.some(k => k.rate < 0.05)) {
      await push("有帐号余额已少于 5%", table)
    } else {
      await push("帐号余额充足", table)
    }
  } catch (e) {
    await push(`运行错误\n${String(e)}`)
  }
  return new Response(`ok`)
}

export async function push(title: string, desp?: string) {
  if (sendKey)
    fetch(`https://sctapi.ftqq.com/${sendKey}.send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        desp,
        channel: 9
      })
    })
}
