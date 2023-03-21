# ChatGPT-Vercel
![](assets/preview-light.png#gh-light-mode-only)
![](assets/preview-dark.png#gh-dark-mode-only)

> 本项目基于 [chatgpt-demo](https://github.com/ddiu8081/chatgpt-demo) 开发。

在线预览:

1. [aitoolgpt.com](https://www.aitoolgpt.com)，由 [@AUDI_GUZZ](https://m.okjike.com/users/4af3cfb4-1291-4a8b-b210-f515c86934a9) 免费提供。
2. [chatsverse.xyz](https://www.chatsverse.xyz)，由 [@Airyland](https://m.okjike.com/users/C6C8DE3A-E89D-4978-9E7D-B2E167D835A9) 免费提供。

API Key 由我自己免费提供，请不要滥用，不提供长期服务，请自行部署。

## 使用方法

- 设置

  - 系统角色指令：会在每次提问时添加，一定用加句号。主要用于对 ChatGPT 的语气，口头禅这些进行定制。

  - 思维发散程度：越高 ChatGPT 思维就越发散，开始乱答。根据不同的问题可以调节这个选项，创意性的就可以调高一点。

  - 开启连续对话：OpenAI 并没有提供 ChatGPT 那样的上下文功能，只能每次都把全部对话传过去，并且都要算 token，而且仍然有最大 4096 token 的限制。

- token 是怎么算的：OpenAI 有它自己的算法，大多数时候是一个单词 1 token，一个汉字 2 token。
- Open AI Key 要怎么获得：注册 OpenAI 的帐号，然后 [生成 Key](https://platform.openai.com/account/api-keys) 就行了。现在注册就送 5 美元，可以用一两个月。闲注册麻烦，可以直接去买号，自行搜索。注意不要被骗，一般 5 元以下可以入手，看到有 120 美元的 key，这种属于是绑了虚拟信用卡，可以透支 120 美元，只能用一个月，而且容易封号。
- 输入框右边的四个按钮：
  - 对话生成图片，电脑上复制，手机上下载。
  - 对话生成 Markdown，复制到剪贴板。
  - 重新回答最近的一个问题。其实也可以用键盘的<kbd>↑</kbd>键，可以自动将最近的一次提问填到输入框里。
  - 清空对话。
- 输入框
  - <kbd>Enter</kbd>发送，<kbd>Shift</kbd>+<kbd>Enter</kbd>换行。
  - <kbd>空格</kbd> 或者 <kbd>/</kbd> 搜索 Prompt 预设，现在只显示 20 个。所有 Prompt 可以查看 [prompts.md](prompts.md) 。
  -  <kbd>↑</kbd> 将最近的一次提问填到输入框里。
- 点击顶部标题滚动到顶部，点击输入框滚动到底部。
- 发送 sk- 开头的 key，可以直接查询余额。可以换行查询多个。也可以发送 `查询填写的 Key 的余额` 来直接查询你填的 key 的余额，这个 Prompt 预设第一个就是，直接用。作为站长，你可以通过设置环境变量来定时查询所有内置 key 的余额，并发送到微信上。



## 部署一个你自己的 ChatGPT 网站（免费）
[![](assets/powered-by-vercel.svg)](http://vercel.com/?utm_source=busiyi&utm_campaign=oss)

如果你只需要部署一个你自己用的网站，而不需要定制，那么你完全不需要在本地跑起来，你可以直接点击下面的按钮，然后按照提示操作，然后在 Vercel 中填入环境变量即可。vercel.app 域名已经被墙，但 vercel 本身没有被墙，所以你绑定自己的域名就可以了。如果广泛分享，域名有被墙的风险。

[![Deploy with Vercel](https://vercel.com/button?utm_source=busiyi&utm_campaign=oss)](https://vercel.com/new/clone?repository-url=https://github.com/ourongxing/chatgpt-vercel&env=OPENAI_API_KEY?utm_source=busiyi&utm_campaign=oss)

不过上面这种方式不容易更新，最好还是先 fork 本仓库，然后在 [Vercel](https://vercel.com/new?utm_source=busiyi&utm_campaign=oss) 中导入你自己的仓库，之后要更新就在 Github 里点击 `Sync fork` 就可以同步更新了。

如果你需要部署给更多人用，需要修改一些代码，那么你可能需要将上面创建的你自己的仓库 `git clone` 到本地。改完了 `git commit & push` 即可重新部署，vscode 上点几下就可以了。也可以用 vercel 的 cli，`vercel deploy --prod`。

如果你需要在本地开发和调试，有点麻烦：

1. 升级到 `node18`，要用到原生的 `fetch` 和 `readableStream`。
2. API 被墙了，自己想办法开代理，不然要报错。可以设置 OpenAI 的代理 API，也可以直接 `vercel deploy` 部署到 vercel 开发环境上调试。
3. `pnpm i` 安装依赖。
4. `pnpm dev` 启动项目。

#### 更多部署方案

目前本项目除 Vercel 以外还支持

- [Netlify](https://www.netlify.com/)
- [Railway](https://railway.app/)

直接导入即可，但是不建议使用除 Vercel 以外的部署方案。 除了比较慢以外，更重要的是只有 Vercel 支持设置 Edge Function 服务器的地区，其他平台会自动使用距离最近的服务器，有可能是 OpenAI 不支持的地区，从而导致封号。

#### 环境变量

| 环境变量                           | 说明                                                         | 默认值                                                       |
| ---------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `OPENAI_API_KEY`                   | OpenAI API Key，可以填写多个，用 \| 或者 换行 隔开，随机调用。最好是多填几个，API 有并发上的限制。如果用户不填自己的 key，那么就会使用你的 key。 | 无                                                           |
| `DEFAULT_MESSAGE`                  | 默认提示信息                                                 | - xx xx                                                      |
| `DEFAULT_SETTING`                  | 默认设置                                                     | {<br/> "continuousDialogue": true,<br/> "archiveSession": false,<br/> "openaiAPIKey": "",<br /> "openaiAPITemperature": 60,<br/> "systemRule": ""<br/> "password": ""<br />} |
| `RESET_CONTINUOUS_DIALOGUE_OPTION` | 刷新时重置 `开启连续对话` 选项，在分享给很多人用的时候可以有效避免大量消耗。 | false                                                        |
| `OPENAI_API_BASE_URL`              | 本地开发时可以填写 OpenAI 的代理服务器，但是 Vercel 不需要。 | api.openai.com                                               |
| `PASSWORD`                         | 网站密码                                                     | 无                                                           |
| `MAX_INPUT_TOKENS`                 | 输入的 token 最大值，如果开启 `连续对话`，将计算之前的所有对话内容。OpenAI 限制 token 最大值为 4096，但这是输入和输出之和，所以可以将这个值设置为 3072， 留 1024 作为输出。如果不想被滥用，可以将这个值设置的再小一点。 | 3072                                                         |
| `SENDKEY`                          | 使用 [Server 酱](https://sct.ftqq.com/sendkey) 推送帐号余额以及可用状态到微信，如果需要自行获取。推送时间为早上 8 点和晚上 8 点，在 vercel.json 文件中修改。如果 key 太多，超过 20 个，有可能失败。 | 无                                                           |
| `SENDCHANNEL`                      | [Server 酱](https://sct.ftqq.com/sendkey) 的推送通道，默认微信服务号。 | 9                                                            |

有两种设置方式

1. 将 `.env.example` 文件修改为 `.env`，在 `.env` 中设置。
2. Vercel 中设置 `Environment Variables`。尽量使用这种方式，比较方便。会在下次部署时生效。
   ![](assets/environment.png)

#### 默认设置

> 记得删除注释，或者直接复制上面表格里的。

```json5
{
  continuousDialogue: true, // 开启连续对话，每次都需要将上下文传给 API，比较费钱，而且同样有 4096 token 的限制
  archiveSession: false, // 记录对话内容，刷新后不会清空对话
  openaiAPIKey: "", // 默认填写的 key，不需要填写，否则其他人看得到。
  password: "", // 默认填写的密码，不需要填写，否则其他人看得到。
  openaiAPITemperature: 60, // 0-100 越高 ChatGPT 思维就越发散，开始乱答
  systemRule: "" // 系统角色指令，会在每次提问时添加。主要用于对 ChatGPT 的语气，口头禅这些进行定制。
}
```

## 提交你的 Prompts

1. Fork 本项目。
2. 修改 `prompts.md`。
3. Pull Request 即可。

如果你不懂这个操作，也可以直接在 Issues 提交你的 Prompts。目前大部分 Prompts 来自于 [awesome-chatgpt-prompts-zh](https://github.com/PlexPt/awesome-chatgpt-prompts-zh)，当然，这个仓库大多数也是翻译的 [awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts)，一并感谢。

#### 要求

- 把需要输入的内容放在最后，可以提示 ChatGPT 开始输入了，比如 “我的第一句话是：”。
- 尽可能去优化已有的 Prompts，而不是重复添加。
- 添加到结尾，我会定期整理。

## 赞赏

如果本项目对你有所帮助，可以给小猫买点零食，但不接受任何付费功能请求。

![](./assets/reward.gif)

## License
[MIT](./LICENSE)
