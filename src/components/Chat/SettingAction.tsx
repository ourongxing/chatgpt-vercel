import { toBlob, toJpeg } from "html-to-image"
import { Show, Switch, Match, type JSXElement, createMemo } from "solid-js"
import { clickOutside } from "~/hooks"
import { RootStore, delSession, getSession, setSession } from "~/store"
import type { ChatMessage, Model } from "~/types"
import { copyToClipboard, dateFormat, generateId, isMobile } from "~/utils"
import { Switch as SwitchButton } from "../Common"
import { createStore } from "solid-js/store"
import { useNavigate, useParams } from "solid-start"
import { defaultEnv } from "~/env"

export const [state, setState] = createStore({
  showSetting: "none" as "none" | "global" | "session",
  success: false as false | "markdown" | "link",
  genImg: "normal" as ImgStatusUnion,
  fakeRole: "normal" as FakeRoleUnion,
  clearSessionConfirm: false,
  deleteSessionConfirm: false
})

type ImgStatusUnion = "normal" | "loading" | "success" | "error"
const imgIcons: Record<ImgStatusUnion, string> = {
  success: "i-carbon:status-resolved dark:text-yellow text-yellow-6",
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
  const navigator = useNavigate()
  const params = useParams<{ session?: string }>()
  const sessionId = createMemo(() => params.session)
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
      use:clickOutside={() => {
        setState("showSetting", "none")
      }}
    >
      <Switch>
        <Match when={state.showSetting === "global"}>
          <div class="<sm:max-h-10em max-h-14em overflow-y-auto">
            <SettingItem icon="i-ri:lock-password-line" label="网站访问密码">
              <input
                type="password"
                value={store.globalSettings.password}
                class="input-box"
                onInput={e => {
                  setStore(
                    "globalSettings",
                    "password",
                    (e.target as HTMLInputElement).value
                  )
                }}
              />
            </SettingItem>
            <SettingItem icon="i-carbon:api" label="OpenAI Key">
              <input
                type="password"
                value={store.globalSettings.APIKey}
                class="input-box"
                onInput={e => {
                  setStore(
                    "globalSettings",
                    "APIKey",
                    (e.target as HTMLInputElement).value
                  )
                }}
              />
            </SettingItem>
          </div>
          <hr class="my-1 bg-slate-5 bg-op-15 border-none h-1px"></hr>
        </Match>
        <Match when={state.showSetting === "session"}>
          <div class="<sm:max-h-10em max-h-14em overflow-y-auto">
            <Show when={sessionId()}>
              <SettingItem
                icon="i-carbon:text-annotation-toggle"
                label="会话标题"
              >
                <input
                  type="text"
                  value={store.sessionSettings.title}
                  class="input-box text-ellipsis"
                  onInput={e => {
                    setStore(
                      "sessionSettings",
                      "title",
                      (e.target as HTMLInputElement).value
                    )
                  }}
                />
              </SettingItem>
            </Show>
            <SettingItem
              icon="i-carbon:machine-learning-model"
              label="OpenAI 模型"
            >
              <select
                name="model"
                class="max-w-150px w-full bg-slate bg-op-15 rounded-sm appearance-none accent-slate text-center focus:(bg-op-20 ring-0 outline-none)"
                value={store.sessionSettings.APIModel}
                onChange={e => {
                  setStore(
                    "sessionSettings",
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
                  value={String(store.sessionSettings.APITemperature * 50)}
                  class="bg-slate max-w-100px w-full h-2 bg-op-15 rounded-lg appearance-none cursor-pointer accent-slate"
                  onInput={e => {
                    setStore(
                      "sessionSettings",
                      "APITemperature",
                      Number((e.target as HTMLInputElement).value) / 50
                    )
                  }}
                />
                <span class="bg-slate bg-op-15 rounded-sm px-1 text-10px">
                  {store.sessionSettings.APITemperature.toFixed(2)}
                </span>
              </div>
            </SettingItem>
            <SettingItem icon="i-carbon:save-image" label="保存对话内容">
              <SwitchButton
                checked={store.sessionSettings.saveSession}
                onChange={e => {
                  setStore(
                    "sessionSettings",
                    "saveSession",
                    (e.target as HTMLInputElement).checked
                  )
                }}
              />
            </SettingItem>
            <SettingItem
              icon="i-carbon:3d-curve-auto-colon"
              label="开启连续对话"
            >
              <SwitchButton
                checked={store.sessionSettings.continuousDialogue}
                onChange={e => {
                  setStore(
                    "sessionSettings",
                    "continuousDialogue",
                    (e.target as HTMLInputElement).checked
                  )
                }}
              />
            </SettingItem>
          </div>
          <hr class="my-1 bg-slate-5 bg-op-15 border-none h-1px"></hr>
        </Match>
      </Switch>
      <div class="flex items-center justify-between">
        <div class="flex">
          <ActionItem
            onClick={() => {
              setState("showSetting", k => (k !== "global" ? "global" : "none"))
            }}
            icon="i-carbon:settings"
            label="全局设置"
          />
          <ActionItem
            onClick={() => {
              setState("showSetting", k =>
                k !== "session" ? "session" : "none"
              )
            }}
            icon="i-carbon:settings-services"
            label="会话设置"
          />
        </div>
        <Switch
          fallback={
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
                  setState("success", "markdown")
                  setTimeout(() => setState("success", false), 1000)
                }}
                icon={
                  state.success === "markdown"
                    ? "i-carbon:status-resolved dark:text-yellow text-yellow-6"
                    : "i-ri:markdown-line"
                }
              />
              <ActionItem
                onClick={() => {
                  if (state.clearSessionConfirm) {
                    clearSession()
                    setState("clearSessionConfirm", false)
                  } else {
                    setState("clearSessionConfirm", true)
                    setTimeout(
                      () => setState("clearSessionConfirm", false),
                      3000
                    )
                  }
                }}
                icon={
                  state.clearSessionConfirm
                    ? "i-carbon:checkmark animate-bounce text-red-6 dark:text-red"
                    : "i-carbon:trash-can"
                }
                label={state.clearSessionConfirm ? "确定" : "清空对话"}
              />
            </div>
          }
        >
          <Match when={state.showSetting === "global"}>
            <div class="flex">
              <ActionItem
                label="导出"
                onClick={exportData}
                icon="i-carbon:export"
              />
              <ActionItem
                label="导入"
                onClick={importData}
                icon="i-carbon:download"
              />
            </div>
          </Match>
          <Match when={state.showSetting === "session"}>
            <div class="flex">
              <ActionItem
                onClick={() => {
                  let sessionID: string
                  do {
                    sessionID = generateId()
                  } while (getSession(sessionID))
                  setSession(sessionID, {
                    lastVisit: Date.now(),
                    title: "",
                    settings: defaultEnv.CLIENT_SESSION_SETTINGS,
                    messages: []
                  })
                  // 如果是在同一层路由下，不会触发 onMount
                  navigator("/", { replace: true })
                  navigator("/session/" + sessionID, { replace: true })
                }}
                icon="i-carbon:add-alt"
                label="新建会话"
              />
              <Show when={sessionId()}>
                <ActionItem
                  onClick={async () => {
                    await copyToClipboard(
                      window.location.origin + window.location.pathname
                    )
                    setState("success", "link")
                    setTimeout(() => setState("success", false), 1000)
                  }}
                  icon={
                    state.success === "link"
                      ? "i-carbon:status-resolved dark:text-yellow text-yellow-6"
                      : "i-carbon:link"
                  }
                  label="复制链接"
                />
                <ActionItem
                  onClick={() => {
                    if (state.deleteSessionConfirm) {
                      setState("deleteSessionConfirm", false)
                      delSession(sessionId() ?? "index")
                      navigator("/", { replace: true })
                    } else {
                      setState("deleteSessionConfirm", true)
                      setTimeout(
                        () => setState("deleteSessionConfirm", false),
                        3000
                      )
                    }
                  }}
                  icon={
                    state.deleteSessionConfirm
                      ? "i-carbon:checkmark animate-bounce text-red-6 dark:text-red"
                      : "i-carbon:trash-can"
                  }
                  label={state.deleteSessionConfirm ? "确定" : "删除会话"}
                />
              </Show>
            </div>
          </Match>
        </Switch>
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
      class="flex items-center cursor-pointer mx-1 p-2 hover:(dark:bg-#23252A bg-#ECF0F4) rounded text-1.2em"
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

async function exportData() {
  const a = document.createElement("a")
  a.href = URL.createObjectURL(
    new Blob([JSON.stringify(localStorage)], { type: "application/json" })
  )
  a.download = `ChatGPT-${dateFormat(new Date(), "HH-MM-SS")}.json`
  a.click()
}

async function importData() {
  const input = document.createElement("input")
  input.type = "file"
  input.accept = "application/json"
  input.click()
  input.onchange = async () => {
    const file = input.files?.[0]
    if (file) {
      const text = await file.text()
      const data = JSON.parse(text)
      Object.keys(data).forEach(k => {
        localStorage.setItem(k, data[k])
      })
      location.reload()
    }
  }
}
