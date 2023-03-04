# ChatGPT-API Vercel

A demo repo based on [OpenAI GPT-3.5 Turbo API](https://platform.openai.com/docs/guides/chat).

More powerful than [diu8081/chatgpt-demo](https://github.com/ddiu8081/chatgpt-demo)

Demo: [https://chatgpt.busiyi.world](https://chatgpt.busiyi.world)
## How to build

1. Setup & Install dependencies

    > First, you need [Node.js](https://nodejs.org/) (v18+) installed.

    ```shell
    pnpm i
    ```

2. Make a copy of `.env.example`, then rename it to `.env`
3. Add your [OpenAI API key](https://platform.openai.com/account/api-keys) to `.env`
    ```
    OPENAI_API_KEY=sk-xxx...
    // also you can set muiltiple keys
    OPENAI_API_KEY=sk-xxx|sk-yyy
    ```
4. Run the app
    ```shell
    pnpm dev
    ```
5. Deploy to Vercel
    ```shell
    vercel deploy --prod
    ```

## API

### POST /api

```ts
await fetch("https://chatgpt.busiyi.world/api", {
    method: "POST",
    body: JSON.stringify({
        message: "xxx",
        key: "xxxx"
    })
})
```
## License

MIT
