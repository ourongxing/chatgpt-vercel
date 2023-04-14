import { toBlob, toJpeg } from "html-to-image"
import { Show, createEffect, type JSXElement } from "solid-js"
import { clickOutside } from "~/hooks"
import { RootStore } from "~/store"
import type { ChatMessage, Model } from "~/types"
import { copyToClipboard, dateFormat, isMobile } from "~/utils"
import { Switch } from "../Common"
import { createStore } from "solid-js/store"

export const [state, setState] = createStore({
  shown: false,
  copied: false,
  genImg: "normal" as ImgStatusUnion,
  fakeRole: "normal" as FakeRoleUnion
})

type ImgStatusUnion = "normal" | "loading" | "success" | "error"
const imgIcons: Record<ImgStatusUnion, string> = {
  success: "i-ri:check-fill dark:text-yellow text-yellow-6",
  normal: "i-carbon:image",
  loading: "i-ri:loader-2-line animate-spin",
  error: "i-carbon:warning-alt text-red-6 dark:text-red"
}

export type FakeRoleUnion = "assistant" | "user" | "normal"
const roleIcons: Record<FakeRoleUnion, string> = {
  assistant: "i-ri:android-fill bg-gradient-to-r from-yellow-300 to-red-700 ",
  normal: "i-ri:user-3-line",
  user: "i-ri:user-3-fill bg-gradient-to-r from-red-300 to-blue-700 "
}

export default function SettingAction() {
  const { store, setStore } = RootStore
  createEffect(() => {
    localStorage.setItem("setting", JSON.stringify(store.setting))
  })

  function clearSession() {
    setStore("messageList", messages =>
      messages.filter(k => k.type === "locked")
    )
  }

  // tree shaking
  clickOutside
  return (
    <div
      class="text-sm text-slate-7 dark:text-slate my-2"
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
                setStore(
                  "setting",
                  "password",
                  (e.target as HTMLInputElement).value
                )
              }}
            />
          </SettingItem>
          <SettingItem icon="i-carbon:api" label="OpenAI Key">
            <input
              type="password"
              value={store.setting.APIKey}
              class="input-box"
              onInput={e => {
                setStore(
                  "setting",
                  "APIKey",
                  (e.target as HTMLInputElement).value
                )
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
              value={store.setting.APIModel}
              onChange={e => {
                setStore(
                  "setting",
                  "APIModel",
                  (e.target as HTMLSelectElement).value as Model
                )
              }}
            >
              <option value="gpt-3.5-turbo">gpt-3.5-turbo(4k)</option>
              <option value="gpt-4">gpt-4(8k)</option>
              <option value="gpt-4-32k">gpt-4(32k)</option>
            </select>
          </SettingItem>
          <SettingItem icon="i-carbon:data-enrichment" label="思维发散程度">
            <div class="flex items-center justify-between w-150px">
              <input
                type="range"
                min={0}
                max={100}
                value={String(store.setting.APITemperature * 50)}
                class="bg-slate max-w-100px w-full h-2 bg-op-15 rounded-lg appearance-none cursor-pointer accent-slate"
                onInput={e => {
                  setStore(
                    "setting",
                    "APITemperature",
                    Number((e.target as HTMLInputElement).value) / 50
                  )
                }}
              />
              <span class="bg-slate bg-op-15 rounded-sm px-1 text-10px">
                {store.setting.APITemperature.toFixed(2)}
              </span>
            </div>
          </SettingItem>
          <SettingItem icon="i-carbon:save-image" label="保存对话内容">
            <label class="relative inline-flex items-center cursor-pointer ml-1">
              <input
                type="checkbox"
                checked={store.setting.archiveSession}
                class="sr-only peer"
                onChange={e => {
                  setStore(
                    "setting",
                    "archiveSession",
                    (e.target as HTMLInputElement).checked
                  )
                }}
              />
              <div class="w-9 h-5 bg-slate bg-op-15 peer-focus:outline-none peer-focus:ring-0  rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate"></div>
            </label>
          </SettingItem>
          <SettingItem icon="i-carbon:3d-curve-auto-colon" label="开启连续对话">
            <Switch
              checked={store.setting.continuousDialogue}
              onChange={e => {
                setStore(
                  "setting",
                  "continuousDialogue",
                  (e.target as HTMLInputElement).checked
                )
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
            onClick={() => {
              setState("fakeRole", k => {
                const _ = ["normal", "user", "assistant"] as FakeRoleUnion[]
                return _[(_.indexOf(k) + 1) % _.length]
              })
            }}
            icon={roleIcons[state.fakeRole]}
            label="伪装角色"
          />
          <ActionItem
            onClick={async () => {
              setState("genImg", "loading")
              await exportJpg()
              setTimeout(() => setState("genImg", "normal"), 1000)
            }}
            icon={imgIcons[state.genImg]}
            label="导出图片"
          />
          <ActionItem
            label="导出MD"
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
            onClick={clearSession}
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
      attr:tooltip={props.label}
      attr:position="top"
    >
      <button class={props.icon} title={props.label} />
    </div>
  )
}

async function exportJpg() {
  try {
    const messageContainer = document.querySelector(
      "#message-container-img"
    ) as HTMLElement
    const header = document.querySelector("header") as HTMLElement
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
  const _ = messages.reduce((acc, k) => {
    if (k.role === "assistant" || k.role === "user") {
      if (k.role === "user") {
        acc.push([k])
      } else {
        acc[acc.length - 1].push(k)
      }
    }
    return acc
  }, [] as ChatMessage[][])
  await copyToClipboard(
    _.filter(k => k.length === 2)
      .map(k => {
        return `> ${k[0].content}\n\n${k[1].content}`
      })
      .join("\n\n---\n\n")
  )
}
