import { toBlob, toJpeg } from "html-to-image"
import { Show, createEffect, type JSXElement } from "solid-js"
import { clickOutside } from "~/hooks"
import { setStore, store } from "~/store"
import type { ChatMessage, Model } from "~/types"
import { copyToClipboard, dateFormat, isMobile } from "~/utils"
import { Switch } from "../Common"
import { createStore } from "solid-js/store"

const [state, setState] = createStore({
  shown: false,
  copied: false,
  genImg: "normal" as ImgStatusUnion
})

type ImgStatusUnion = "normal" | "loading" | "success" | "error"
const imgIcon: Record<ImgStatusUnion, string> = {
  success: "i-ri:check-fill dark:text-yellow text-yellow-6",
  normal: "i-carbon:image",
  loading: "i-ri:loader-2-line animate-spin",
  error: "i-carbon:warning-alt text-red-6 dark:text-red"
}

export default function SettingAction(props: { clear: any }) {
  createEffect(() => {
    localStorage.setItem("setting", JSON.stringify(store.setting))
  })

  // tree shaking
  clickOutside
  return (
    <div
      class="text-sm text-slate-7 dark:text-slate my-2"
      // @ts-ignore
      use:clickOutside={() => setState("shown", false)}
    >
      <Show when={state.shown}>
        <div class="<sm:max-h-10em max-h-14em overflow-y-auto">
          <SettingItem icon="i-ri:lock-password-line" label="网站访问密码">
            <input
              type="password"
              value={store.setting.password}
              class="input-box"
              onInput={e => {
                setStore("setting", t => ({
                  ...t,
                  password: (e.target as HTMLInputElement).value
                }))
              }}
            />
          </SettingItem>
          <SettingItem icon="i-carbon:api" label="OpenAI Key">
            <input
              type="password"
              value={store.setting.openaiAPIKey}
              class="input-box"
              onInput={e => {
                setStore("setting", t => ({
                  ...t,
                  openaiAPIKey: (e.target as HTMLInputElement).value
                }))
              }}
            />
          </SettingItem>
          <SettingItem
            icon="i-carbon:machine-learning-model"
            label="OpenAI 模型"
          >
            <select
              name="model"
              class="max-w-150px w-full bg-slate bg-op-15 rounded-sm appearance-none accent-slate text-center focus:(bg-op-20 ring-0 outline-none)"
              value={store.setting.model}
              onChange={e => {
                setStore("setting", t => ({
                  ...t,
                  model: (e.target as HTMLSelectElement).value as Model
                }))
              }}
            >
              <option value="gpt-3.5-turbo">gpt-3.5-turbo(4k)</option>
              <option value="gpt-4">gpt-4(8k)</option>
              <option value="gpt-4-32k">gpt-4(32k)</option>
            </select>
          </SettingItem>
          <SettingItem icon="i-carbon:user-online" label="系统角色指令">
            <input
              type="text"
              value={store.setting.systemRule}
              class="input-box"
              onInput={e => {
                setStore("setting", t => ({
                  ...t,
                  systemRule: (e.target as HTMLInputElement).value
                }))
              }}
            />
          </SettingItem>
          <SettingItem icon="i-carbon:data-enrichment" label="思维发散程度">
            <input
              type="range"
              min={0}
              max={100}
              value={String(store.setting.openaiAPITemperature)}
              class="max-w-150px w-full h-2 bg-slate bg-op-15 rounded-lg appearance-none cursor-pointer accent-slate"
              onInput={e => {
                setStore("setting", t => ({
                  ...t,
                  openaiAPITemperature: Number(
                    (e.target as HTMLInputElement).value
                  )
                }))
              }}
            />
          </SettingItem>
          <SettingItem icon="i-carbon:save-image" label="保存对话内容">
            <label class="relative inline-flex items-center cursor-pointer ml-1">
              <input
                type="checkbox"
                checked={store.setting.archiveSession}
                class="sr-only peer"
                onChange={e => {
                  setStore("setting", t => ({
                    ...t,
                    archiveSession: (e.target as HTMLInputElement).checked
                  }))
                }}
              />
              <div class="w-9 h-5 bg-slate bg-op-15 peer-focus:outline-none peer-focus:ring-0  rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate"></div>
            </label>
          </SettingItem>
          <SettingItem icon="i-carbon:3d-curve-auto-colon" label="开启连续对话">
            <Switch
              checked={store.setting.continuousDialogue}
              onChange={e => {
                setStore("setting", t => ({
                  ...t,
                  continuousDialogue: (e.target as HTMLInputElement).checked
                }))
              }}
            />
          </SettingItem>
        </div>
        <hr class="my-1 bg-slate-5 bg-op-15 border-none h-1px"></hr>
      </Show>
      <div class="flex items-center justify-between">
        <ActionItem
          onClick={() => {
            setState("shown", k => !k)
          }}
          icon="i-carbon:settings"
          label="设置"
        />
        <div class="flex">
          <ActionItem
            onClick={async () => {
              setState("genImg", "loading")
              await exportJpg()
              setTimeout(() => setState("genImg", "normal"), 1000)
            }}
            icon={imgIcon[state.genImg]}
            label="导出图片"
          />
          <ActionItem
            label="导出 Markdown"
            onClick={async () => {
              await exportMD(store.messageList)
              setState("copied", true)
              setTimeout(() => setState("copied", false), 1000)
            }}
            icon={
              state.copied
                ? "i-ri:check-fill dark:text-yellow text-yellow-6"
                : "i-ri:markdown-line"
            }
          />
          <ActionItem
            onClick={props.clear}
            icon="i-carbon:trash-can"
            label="清空对话"
          />
        </div>
      </div>
    </div>
  )
}

function SettingItem(props: {
  children: JSXElement
  icon: string
  label: string
}) {
  return (
    <div class="flex items-center p-1 justify-between hover:bg-slate hover:bg-op-10 rounded">
      <div class="flex items-center">
        <button class={props.icon} />
        <span class="ml-1">{props.label}</span>
      </div>
      {props.children}
    </div>
  )
}

function ActionItem(props: { onClick: any; icon: string; label?: string }) {
  return (
    <div
      class="flex items-center cursor-pointer mx-1 p-2 hover:bg-slate hover:bg-op-10 rounded text-1.2em"
      onClick={props.onClick}
    >
      <button class={props.icon} title={props.label} />
    </div>
  )
}

async function exportJpg() {
  try {
    const messageContainer = document.querySelector(
      "#message-container"
    ) as HTMLElement
    async function downloadIMG() {
      const url = await toJpeg(messageContainer)
      const a = document.createElement("a")
      a.href = url
      a.download = `ChatGPT-${dateFormat(new Date(), "HH-MM-SS")}.jpg`
      a.click()
    }
    if (!isMobile() && navigator.clipboard) {
      try {
        const blob = await toBlob(messageContainer)
        blob &&
          (await navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob
            })
          ]))
      } catch (e) {
        await downloadIMG()
      }
    } else {
      await downloadIMG()
    }
    setState("genImg", "success")
  } catch {
    setState("genImg", "error")
  }
}

async function exportMD(messages: ChatMessage[]) {
  const role = {
    system: "系统",
    user: "我",
    assistant: "ChatGPT",
    error: "错误"
  }
  await copyToClipboard(
    messages
      .map(k => {
        return `### ${role[k.role]}\n\n${k.content.trim()}`
      })
      .join("\n\n\n\n")
  )
}
