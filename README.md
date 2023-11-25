# ChatGPT-Vercel

![](assets/preview-light.png#gh-light-mode-only)
![](assets/preview-dark.png#gh-dark-mode-only)

> 本项目基于 [chatgpt-demo](https://github.com/ddiu8081/chatgpt-demo) 开发。

在线预览:

1. [chatsverse.xyz](https://www.chatsverse.xyz)，由 [@Airyland](https://m.okjike.com/users/C6C8DE3A-E89D-4978-9E7D-B2E167D835A9) 免费提供。
2. ~~[aitoolgpt.com](https://www.aitoolgpt.com)，由 [@AUDI_GUZZ](https://m.okjike.com/users/4af3cfb4-1291-4a8b-b210-f515c86934a9) 免费提供~~。（2022.03.22 壮烈牺牲，提醒大家不要过度分享自己的站点出去，指不定 ChatGPT 说出什么违禁词出来）。
3. [vercel.app](https://vercel-chatgpt-github.vercel.app) 被墙。

API Key 由我自己免费提供，请不要滥用，不提供长期服务，请自行部署。默认 key 不支持 `gpt-4`。演示站点密码为 `ourongxing`，每次刷新会关闭 `连续对话`。

## 使用方法

- 设置

  - 系统角色指令：会在每次提问时添加。主要用于对 ChatGPT 的语气，口头禅这些进行定制。

  - 思维发散程度：越高 ChatGPT 思维就越发散，开始乱答。根据不同的问题可以调节这个选项，创意性的就可以调高一点。

  - 开启连续对话：OpenAI 并没有提供 ChatGPT 那样的上下文功能，只能每次都把全部对话传过去，并且都要算 token，而且仍然有最大 4096 token 的限制。
  - OpenAI 模型：需要注意的是, 只有获得了 GPT4 API 内测资格的用户才可以使用您的 API KEY 调用 GPT4。不同的模型对应的 token 最大值不同，比如 `gpt-3.5-turbo` 的最大 token 为 4k(4096)，`gpt-4` 的最大 token 为 8k(8192)，`gpt-4-32k`  的最大 token 为 32k(32768)。不同模型的价格也不同，具体可以查看 [OpenAI 价格](https://openai.com/pricing/)。
- token 是怎么算的：OpenAI 有它自己的算法，大多数时候是一个单词 1 token，一个汉字 2 token。
- Open AI Key 要怎么获得：注册 OpenAI 的帐号，然后 [生成 Key](https://platform.openai.com/account/api-keys) 就行了。现在注册就送 5 美元，可以用一两个月。嫌注册麻烦，可以直接去买号，自行搜索。注意不要被骗，一般 5 元以下可以入手，看到有 120 美元的 key，这种属于是绑了虚拟信用卡，可以透支 120 美元，只能用一个月，而且容易封号。
- 输入框右边的四个按钮：
  - 对话生成图片，电脑上是复制到剪贴板，手机上是直接下载。
  - 对话生成 Markdown，复制到剪贴板。
  - 清空对话。
- 消息：
  - 点击每条消息前的头像可以锁定对话，清空对话时不会清除。
  - 对于提问，可以修改，重新回答，删除。修改是填入输入框。重新回答和删除会自动删除提问和回答。
  - 对于回答，可以复制，重新回答，删除。重新回答也会自动删除提问和回答。删除只会删除回答。

- 输入框
  - <kbd>Enter</kbd>发送，<kbd>Shift</kbd>+<kbd>Enter</kbd>换行。
  - <kbd>空格</kbd> 或者 <kbd>/</kbd> 搜索 Prompt 预设，现在只显示 20 个。所有 Prompt 可以查看 [prompts.md](prompts.md) 。
  - <kbd>↑</kbd> 将最近的一次提问填到输入框里。
- 点击顶部标题滚动到顶部，点击输入框滚动到底部。
- 发送 sk- 开头的 key，可以直接查询余额。可以换行查询多个。也可以发送 `查询填写的 Key 的余额` 来直接查询你填的 key 的余额，这个 Prompt 预设第一个就是，直接用。作为站长，你可以通过设置环境变量来定时查询所有内置 key 的余额，并发送到微信上。
- url 里使用 `url?q=你好啊` 这种方式可以打开网页直接回答 `你好啊`，当作搜索引擎使用。

## 部署一个你自己的 ChatGPT 网站（免费）

[![](assets/powered-by-vercel.svg)](http://vercel.com/?utm_source=busiyi&utm_campaign=oss)

如果你只需要部署一个你自己用的网站，而不需要定制，那么你完全不需要在本地跑起来，你可以直接点击下面的按钮，然后按照提示操作，然后在 Vercel 中填入环境变量即可。vercel.app 域名已经被墙，但 vercel 本身没有被墙，所以你绑定自己的域名就可以了。如果广泛分享，域名有被墙的风险。

[![Deploy with Vercel](https://vercel.com/button?utm_source=busiyi&utm_campaign=oss)](https://vercel.com/new/clone?utm_source=busiyi&utm_campaign=oss&repository-url=https://github.com/ourongxing/chatgpt-vercel&env=OPENAI_API_KEY)

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
| `DEFAULT_SETTING`                  | 默认设置                                                     | {<br/>  "continuousDialogue": true,<br/>  "archiveSession": false,<br/>  "openaiAPIKey": "",<br/>"openaiAPITemperature": 60,<br/>  "password": "",<br/>  "systemRule": "",<br/>  "model": "gpt-3.5-turbo"<br/>} |
 | `重置CONTINUOUS_DIALOGUE_OPTION ` | Reset on Refresh ` Open continuous conversation ` Option can effectively avoid large consumption when sharing with many people. |虚假的 |
 | ` OPENAI_API_BASE_URL ` | The proxy server of OpenAI can be filled in during local development, but Vercel does not need it. | api.openai.com网站 |
 | `密码 ` | Site Password | nothing |
 | `最大输入次数 ` | The maximum value of the token entered, if enabled ` Continuous dialogue ` , all previous conversation contents will be calculated. OpenAI limits the maximum token value to 4096, but this is the sum of input and output, so you can set this value to 3072, leaving 1024 as the output. If you don&#39;t want to be abused, you can set this value a little lower. | {<br个 /&#62;“gpt-3.5-涡轮”：3072，<br个 /&#62;“gpt-4”：6144，<br个 /&#62;“gpt-4-32k”：24576<br个 /&#62; } |
 | ` SENDKEY公司 ` | use [ Server sauce ] ( https://sct.ftqq.com/sendkey（发送密钥） ) Push the account balance and available status to WeChat, if you need to get it yourself. The push time is 8:00 a.m. and 8:00 p.m., which is modified in the vercel.json file. If there are too many keys, more than 20, it may fail. | nothing |
 | ` 发送通道 ` | [ Server sauce ] ( https://sct.ftqq.com/sendkey（发送密钥） ) The default WeChat service number. | nine |

 There are two settings

 one take `.env.example（.env示例） ` The file is modified to ` .env（英语） ` , on ` .env（英语） ` Set in.
 two Set in Vercel `环境变量 ` 。 Try to use this method, which is more convenient. It will take effect at the next deployment.
 ! [ ] (资产/环境.png )

 #### default setting

 &#62; Remember to delete the notes, or copy them directly from the table above.

 ```日本5
 {
 &#34;ContinuousDialogue&#34;: true,//To enable continuous dialogue, you need to transfer the context to the API every time. It is expensive, and there is also a 4096 token limit
 &#34;ArchiveSession&#34;: false,//Record the dialog content, and the dialog will not be cleared after refreshing
 &#34;OpenaiAPIKey&#34;: &#34;&#34;,//The key filled in by default is not required, otherwise others can see it.
 &#34;Password&#34;: &#34;&#34;,//The password is entered by default, which is unnecessary, otherwise others can see it.
 &#34;OpenaiAPITemperature&#34;: 60,//The higher the 0-100, the more divergent the ChatGPT thinking will be, and the disorderly answers will begin
 &#34;SystemRule&#34;: &#34;&#34;,//The system role instruction will be added at each question. It is mainly used to customize the tone and mantra of ChatGPT.
“型号”：“gpt-3.5-turbo”
 }
 ```

 ## Submit your Prompts

 one Fork this project.
 two modify `提示.md ` 
 three Pull Request.

 If you don&#39;t understand this operation, you can also submit your Prompts directly in Issues. At present, most Prompts come from [ 棒极了-chatgpt-prompts-zh ] ( https://github.com/PlexPt/awesome-chatgpt-prompts-zh ) Of course, most of the warehouses are also translated [ 令人惊叹的语音提示 ] ( https://github.com/f/awesome-chatgpt提示 ) Thank you all.

 #### requirement

 - Put the content that needs to be input at the end, and you can prompt ChatGPT to start input, such as &#34;My first sentence is:&#34;.
 - Try to optimize existing Prompts instead of adding them repeatedly.
 - Add it to the end, and I will organize it regularly.

 ## appreciate

 If this project is helpful to you, you can buy some snacks for kittens, but you will not accept any paid function requests.

 ###! [ ] (./assets/reward.gif )
 ! [ ] (./hh (1).jpg )

 ##许可证

 [麻省理工学院 ] (./许可证 )
