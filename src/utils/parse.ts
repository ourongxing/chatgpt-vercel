import md from "/prompts.md?raw"

export function parsePrompts() {
  return md
    .split(/^## (.+)$/m)
    .filter(k => k.trim())
    .reduce(
      (acc, cur, i) => {
        if (i % 2 === 0)
          acc.push({
            desc: cur.trim(),
            prompt: ""
          })
        else acc[acc.length - 1].prompt = cur.trim()
        return acc
      },
      [] as {
        desc: string
        prompt: string
      }[]
    )
}
