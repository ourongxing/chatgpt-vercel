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
  Scripts
} from "solid-start"
import "@unocss/reset/tailwind.css"
import "~/styles/main.css"
import "uno.css"
import "katex/dist/katex.min.css"
import "highlight.js/styles/atom-one-dark.css"
import PrefixTitle from "./components/PrefixTitle"
import { useRegisterSW } from "virtual:pwa-register/solid"
// @ts-ignore
import { pwaInfo } from "virtual:pwa-info"

export default function Root() {
  useRegisterSW({ immediate: true })
  return (
    <Html lang="zh-cn">
      <Head>
        <PrefixTitle />
        <Meta charset="utf-8" />
        <Link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
        <Link
          rel="apple-touch-icon"
          href="/apple-touch-icon.png"
          sizes="192x192"
        />
        {pwaInfo?.webManifest?.href ? (
          <Link rel="manifest" href={pwaInfo.webManifest.href} />
        ) : (
          ""
        )}
        <Meta name="theme-color" content="#f6f8fa" />
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
