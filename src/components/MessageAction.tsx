import { createSignal, Show, Switch } from "solid-js"
import type { Role } from "~/types"
export default function MessageAction(props: {
  role: Role
  hidden: boolean
  edit: () => void
  del: () => void
  copy: () => void
  reAnswer: () => void
}) {
  const [copied, setCopied] = createSignal(false)
  return (
    <Show when={!props.hidden}>
      <div class="flex absolute items-center justify-between <sm:top--4 <sm:right-0 top-2 right-2 text-sm text-slate-7 dark:text-slate group-hover:opacity-100 group-focus:opacity-100 opacity-0 dark:bg-#292B32 bg-#E7EBF0 rounded">
        <Show when={props.role === "assistant"}>
          <ActionItem
            label="复制"
            onClick={() => {
              setCopied(true)
              props.copy()
              setTimeout(() => setCopied(false), 2000)
            }}
            icon={copied() ? "i-un:copied" : "i-un:copy"}
          />
        </Show>
        <Show when={props.role === "user"}>
          <ActionItem
            label="编辑"
            onClick={props.edit}
            icon={"i-carbon:edit"}
          />
        </Show>
        <ActionItem
          label="重新回答"
          onClick={props.reAnswer}
          icon={"i-carbon:reset"}
        />
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
      class="flex items-center cursor-pointer p-2 hover:bg-slate/10 rounded text-1.2em"
      onClick={props.onClick}
    >
      <button class={props.icon} title={props.label} />
    </div>
  )
}
