import { createEffect, createSignal, onMount, Show } from "solid-js"

export default function Setting() {
  const [key, setKey] = createSignal("xxxxxxxxxx")
  const [on, setON] = createSignal("false")
  const [range, setRange] = createSignal("60")
  onMount(() => {
    const key = localStorage.getItem("openai-api-key")
    key && setKey(key)
    const range = localStorage.getItem("openai-api-range")
    range && setRange(range)
    localStorage.removeItem("continuous-dialogue")
  })

  return (
    <div class="text-sm text-slate">
      <div class="flex items-center hover:text-slate-3 justify-between">
        <div class="flex items-center">
          <button class="i-carbon:api" />
          <span ml-1>OpenAI API Key</span>
        </div>
        <input
          type="password"
          value={key()}
          class="max-w-150px ml-1em px-2 text-slate rounded-sm bg-slate bg-op-15 focus:bg-op-20 focus:ring-0 focus:outline-none placeholder:text-slate-400 placeholder:op-30"
          onInput={e => {
            setKey((e.target as HTMLInputElement).value)
            localStorage.setItem("openai-api-key", key())
          }}
        />
      </div>
      <div class="flex items-center hover:text-slate-3 mt-2 justify-between">
        <div class="flex items-center">
          <button class="i-carbon:data-enrichment" />
          <span ml-1>思维发散程度</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={range()}
          class="max-w-150px w-full h-2 bg-slate bg-op-15 rounded-lg appearance-none cursor-pointer accent-slate-3"
          onInput={e => {
            const range = (e.target as HTMLInputElement).value
            setRange(range)
            localStorage.setItem("openai-api-range", range)
          }}
        />
      </div>
      <div class="flex items-center hover:text-slate-3 mt-2 justify-between">
        <div class="flex items-center">
          <button class="i-carbon:3d-curve-auto-colon" />
          <span ml-1>开启连续对话，将加速消耗</span>
        </div>
        <label class="relative inline-flex items-center cursor-pointer ml-1">
          <input
            type="checkbox"
            value={on()}
            class="sr-only peer"
            onChange={e => {
              const status =
                (e.currentTarget as HTMLInputElement).value === "true"
                  ? "false"
                  : "true"
              setON(status)
              localStorage.setItem("continuous-dialogue", status)
            }}
          />
          <div class="w-9 h-5 bg-slate bg-op-15 peer-focus:outline-none peer-focus:ring-0  rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate"></div>
        </label>
      </div>
    </div>
  )
}
