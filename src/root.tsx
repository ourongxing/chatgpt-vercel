// @refresh reload
import { Suspense } from "solid-js"
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Link,
  Meta,
  Routes,
  Scripts,
  Title
} from "solid-start"
// @ts-ignore
import { pwaInfo } from "virtual:pwa-info"
import "@unocss/reset/tailwind.css"
import "~/styles/global.css"
import "uno.css"

export default function Root() {
  return (
    <Html lang="zh-cn">
      <Head>
        <Title>ChatGPT</Title>
        <Meta charset="utf-8" />
        <Link rel="icon" type="image/svg+xml" href="favicon.svg" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
        <Link
          rel="apple-touch-icon"
          href="/apple-touch-icon.png"
          sizes="192x192"
        />
        <Meta name="theme-color" content="#f6f8fa" />
        {pwaInfo && <Link href={pwaInfo.webManifest.href} />}
      </Head>
      <Body>
        <Suspense>
          <ErrorBoundary>
            <Routes>
              <FileRoutes />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  )
}
