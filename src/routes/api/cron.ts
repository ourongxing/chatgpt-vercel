import { splitKeys } from "~/utils"
import { localKey, genBillingsTable, fetchBilling } from "."
import { defaultEnv } from "~/env"
const sendKey = process.env.SEND_KEY
const channel = isNaN(+process.env.SEND_CHANNEL!)
  ? defaultEnv.SEND_KEY
  : +process.env.SEND_CHANNEL!

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

export async function GET() {
  try {
    const keys = Array.from(new Set(splitKeys(localKey)))
    if (keys.length === 0) return new Response("")
    if (!sendKey) return new Response("")
    const billings = await Promise.all(keys.map(k => fetchBilling(k)))
    const bannedKeyBillings = billings.filter(k => k.totalGranted === 0)
    const unBanKeyBillings = billings.filter(k => k.totalGranted > 0)
    const table = await genBillingsTable(billings)
    const titles = ["帐号余额充足", "没有帐号不可用"]
    if (unBanKeyBillings.some(k => k.rate < 0.05))
      titles[0] = "有帐号余额已少于 5%"
    if (bannedKeyBillings.length) {
      titles[1] = "有帐号不可用"
    }
    await push(titles.join("，"), table)
  } catch (e) {
    await push(`运行错误\n${String(e)}`)
  }
  return new Response("")
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
        channel
      })
    })
}
