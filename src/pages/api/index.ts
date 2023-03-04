import type { APIRoute } from "astro"

export const post: APIRoute = async ({ request }) => {
  const { message, key } = (await request.json()) ?? {}
  if (!message) {
    return {
      body: JSON.stringify({
        success: false,
        message: "message is required"
      })
    }
  }
  if (!key) {
    return {
      body: JSON.stringify({
        success: false,
        message: "openapi key is required"
      })
    }
  }

  const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": `application/json`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: message
        }
      ]
    })
  })
  let result = await response.json()
  if (result?.error) {
    return {
      body: JSON.stringify({
        success: false,
        message: `${result.error?.message}`
      })
    }
  }
  return {
    body: JSON.stringify({
      success: true,
      message: "ok",
      data: result?.choices?.[0].message
    })
  }
}
