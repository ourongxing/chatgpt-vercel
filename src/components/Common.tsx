import { For } from "solid-js"

export function Switch(props: {
  checked: boolean
  onChange?: (e: Event) => void
  class?: string
}) {
  return (
    <label class="relative inline-flex items-center cursor-pointer ml-1">
      <input
        type="checkbox"
        checked={props.checked}
        class={`sr-only peer ${props.class}`}
        onChange={props.onChange}
      />
      <div class="w-9 h-5 bg-slate bg-op-15 peer-focus:outline-none peer-focus:ring-0  rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate" />
    </label>
  )
}

export function Selector(props: {
  onChange?: (e: Event) => void
  options: { value: string; label: string }[]
  value: string
  class?: string
}) {
  return (
    <select
      name="model"
      class={`w-full bg-slate bg-op-15 rounded-sm appearance-none accent-slate text-center focus:(bg-op-20 ring-0 outline-none) ${
        props.class ?? ""
      }`}
      value={props.value}
      onChange={props.onChange}
    >
      {
        <For each={props.options}>
          {option => <option value={option.value}>{option.label}</option>}
        </For>
      }
    </select>
  )
}
