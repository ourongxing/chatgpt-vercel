# ChatGPT-Local

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



#### 环境变量

| 环境变量                           | 说明                                                                                                                                                                                                           | 默认值                                                                                                                                                                       |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `OPENAI_API_KEY`                   | OpenAI API Key，可以填写多个，用 \| 或者 换行 隔开，随机调用。最好是多填几个，API 有并发上的限制。如果用户不填自己的 key，那么就会使用你的 key。                                                                       | 无                                                                                                                                                                           |
| `DEFAULT_MESSAGE`                  | 默认提示信息                                                                                                                                                                                                   | - xx xx                                                                                                                                                                      |
| `DEFAULT_SETTING`                  | 默认设置                                                                                                                                                                                                       | {<br/> "continuousDialogue": true,<br/> "archiveSession": false,<br/> "openaiAPIKey": "",<br /> "openaiAPITemperature": 60,<br/> "systemRule": ""<br/> "password": ""<br />} |
| `RESET_CONTINUOUS_DIALOGUE_OPTION` | 刷新时重置 `开启连续对话` 选项，在分享给很多人用的时候可以有效避免大量消耗。                                                                                                                                     | false                                                                                                                                                                        |
| `OPENAI_API_BASE_URL`              | 本地开发时可以填写 OpenAI 的代理服务器，但是 Vercel 不需要。                                                                                                                                                     | api.openai.com                                                                                                                                                               |
| `PASSWORD`                         | 网站密码                                                                                                                                                                                                       | 无                                                                                                                                                                           |
| `MAX_INPUT_TOKENS`                 | 输入的 token 最大值，如果开启 `连续对话`，将计算之前的所有对话内容。OpenAI 限制 token 最大值为 4096，但这是输入和输出之和，所以可以将这个值设置为 3072， 留 1024 作为输出。如果不想被滥用，可以将这个值设置的再小一点。 | 3072                                                                                                                                                                         |
| `SENDKEY`                          | 使用 [Server 酱](https://sct.ftqq.com/sendkey) 推送帐号余额以及可用状态到微信，如果需要自行获取。推送时间为早上 8 点和晚上 8 点，在 vercel.json 文件中修改。如果 key 太多，超过 20 个，有可能失败。                   | 无                                                                                                                                                                           |
| `SENDCHANNEL`                      | [Server 酱](https://sct.ftqq.com/sendkey) 的推送通道，默认微信服务号。                                                                                                                                           | 9                                                                                                                                                                            |

有两种设置方式

1. 将 `.env.example` 文件修改为 `.env`，在 `.env` 中设置。
2. Vercel 中设置 `Environment Variables`。尽量使用这种方式，比较方便。会在下次部署时生效。
   ![](assets/environment.png)

#### 默认设置


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
