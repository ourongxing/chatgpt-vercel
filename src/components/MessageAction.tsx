import { createSignal, Show } from "solid-js"
export default function MessageAction(props: {
  hidden: boolean
  edit: () => void
  del: () => void
  copy: () => void
}) {
  const [copied, setCopied] = createSignal(false)
  return (
    <Show when={!props.hidden}>
      <div class="flex absolute items-center justify-between md:top-2 md:right-2 top--2 right--2 text-sm text-slate-7 dark:text-slate group-hover:opacity-100 group-focus:opacity-100 opacity-0 bg-slate bg-op-10 rounded">
        <ActionItem
          label="复制"
          onClick={() => {
            setCopied(true)
            props.copy()
            setTimeout(() => setCopied(false), 2000)
          }}
          icon={copied() ? "i-un:copied" : "i-un:copy"}
        />
        <ActionItem label="编辑" onClick={props.edit} icon={"i-carbon:edit"} />
        <ActionItem
          label="删除"
          onClick={props.del}
          icon={"i-carbon:trash-can"}
        />
      </div>
    </Show>
  )
}

function ActionItem(props: { onClick: any; icon: string; label?: string }) {
  return (
    <div
      class="flex items-center cursor-pointer p-2 hover:bg-slate hover:bg-op-20 rounded text-1.2em"
      onClick={props.onClick}
    >
      <button class={props.icon} title={props.label} />
    </div>
  )
}
