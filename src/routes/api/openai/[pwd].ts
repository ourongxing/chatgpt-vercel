import { type APIEvent } from "solid-start"
import { defaultEnv } from "~/env"
import { baseURL } from ".."

const passwordSet = process.env.PASSWORD || defaultEnv.PASSWORD

export async function POST({ request, params }: APIEvent) {
  try {
    if (passwordSet && params.pwd !== passwordSet) {
      throw new Error("error password")
    }
    const body = await request.text()
    const rawRes = await fetch(`https://${baseURL}/v1/chat/completions`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") ?? ""
      },
      method: "POST",
      body
    })

    return new Response(rawRes.body)
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
}
