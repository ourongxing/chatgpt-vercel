import { defaultEnv } from "~/env"
import fs from "node:fs/promises"
const env = Object.entries(defaultEnv).reduce((acc, [key, value]) => {
  let v = String(value)
  if (v === "[object Object]") v = JSON.stringify(value)
  if (v.includes("\n")) v = `'${v}'`
  acc.push(`${key}=${v || ""}`)
  return acc
}, [] as string[])
await fs.writeFile(".env.example", env.join("\n"))

const envDTS = `interface ImportMetaEnv {
${Object.keys(defaultEnv)
  .map(key => `  ${key}?: string`)
  .join("\n")}
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
`
await fs.writeFile("env.d.ts", envDTS)
