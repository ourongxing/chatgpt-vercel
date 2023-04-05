import type { Model } from "./types"

export const defaultSetting = {
  continuousDialogue: true,
  archiveSession: false,
  openaiAPIKey: "",
  openaiAPITemperature: 60,
  password: "",
  systemRule: "",
  model: "gpt-3.5-turbo" as Model
}

export const defaultMessage = `Powered by OpenAI
- 点击左下角齿轮自由更换 GPT 模型。
- 使用 chatgpt 并非很简单，要学会提问，好的提问才会有好的回答，可在对话框中输入 [[/]] 参考下已有的提问。
- 仅供学习和交流使用，但不能保证长期服务。
- 已经在程序环境变量内置自己的 API 了，也可以点左下角齿轮替换为你自己的使用。
- 有时候会卡死，刷新下或清除对话重新开始即可，若慢可设置换成自己Key。
- [[Shift]] + [[Enter]] 换行。开头输入 [[/]] 或者 [[空格]] Prompt 预设。[[↑]] 可编辑最近一次提问。点击顶部名称滚动到顶部，点击输入框滚动到底部。``

export type Setting = typeof defaultSetting

export const defaultResetContinuousDialogue = false

export const defaultMaxInputTokens: Record<Model, number> = {
  "gpt-3.5-turbo": 3072,
  "gpt-4": 6144,
  "gpt-4-32k": 24576
}

export const defaultModel: Model = "gpt-3.5-turbo"
