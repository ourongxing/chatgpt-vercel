import type { Accessor, Setter } from "solid-js"
import type { Setting } from "./Generator"

export default function Setting(props: {
  setting: Accessor<Setting>
  setSetting: Setter<Setting>
}) {
  return (
    <div class="text-sm text-slate">
      <div class="flex items-center hover:text-slate-3 justify-between">
        <div class="flex items-center">
          <button class="i-carbon:api" />
          <span ml-1>OpenAI API Key</span>
        </div>
        <input
          type="password"
          value={props.setting().openaiAPIKey}
          class="max-w-150px ml-1em px-2 text-slate rounded-sm bg-slate bg-op-15 focus:bg-op-20 focus:ring-0 focus:outline-none placeholder:text-slate-400 placeholder:op-30"
          onInput={e => {
            props.setSetting({
              ...props.setting(),
              openaiAPIKey: (e.target as HTMLInputElement).value
            })
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
          value={String(props.setting().openaiAPITemperature)}
          class="max-w-150px w-full h-2 bg-slate bg-op-15 rounded-lg appearance-none cursor-pointer accent-slate-3"
          onInput={e => {
            props.setSetting({
              ...props.setting(),
              openaiAPITemperature: Number((e.target as HTMLInputElement).value)
            })
          }}
        />
      </div>
      <div class="flex items-center hover:text-slate-3 mt-2 justify-between">
        <div class="flex items-center">
          <button class="i-carbon:save-image" />
          <span ml-1>记录对话内容，刷新不会消失</span>
        </div>
        <label class="relative inline-flex items-center cursor-pointer ml-1">
          <input
            type="checkbox"
            checked={props.setting().archiveSession}
            class="sr-only peer"
            onChange={e => {
              props.setSetting({
                ...props.setting(),
                archiveSession: (e.target as HTMLInputElement).checked
              })
            }}
          />
          <div class="w-9 h-5 bg-slate bg-op-15 peer-focus:outline-none peer-focus:ring-0  rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate"></div>
        </label>
      </div>
      <div class="flex items-center hover:text-slate-3 mt-2 justify-between">
        <div class="flex items-center">
          <button class="i-carbon:3d-curve-auto-colon" />
          <span ml-1>开启连续对话，将加倍消耗 Token</span>
        </div>
        <label class="relative inline-flex items-center cursor-pointer ml-1">
          <input
            type="checkbox"
            checked={props.setting().continuousDialogue}
            class="sr-only peer"
            onChange={e => {
              props.setSetting({
                ...props.setting(),
                continuousDialogue: (e.target as HTMLInputElement).checked
              })
            }}
          />
          <div class="w-9 h-5 bg-slate bg-op-15 peer-focus:outline-none peer-focus:ring-0  rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate"></div>
        </label>
      </div>
    </div>
  )
}
