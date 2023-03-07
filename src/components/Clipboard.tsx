import { createSignal } from "solid-js"
import { copyToClipboard } from "../utils"
import "../styles/clipboard.css"
export default function Clipboard(props: { message: string }) {
  const [copied, setCopied] = createSignal(false)
  return (
    <button
      title="复制"
      classList={{
        copied: copied(),
        copy: true,
        "message-copy": true
      }}
      onClick={() => {
        setCopied(true)
        copyToClipboard(props.message)
        setTimeout(() => setCopied(false), 2000)
      }}
    />
  )
}
