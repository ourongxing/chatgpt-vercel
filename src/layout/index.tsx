import Header from "~/components/Header"
import type { JSXElement } from "solid-js"

export default function ({ children }: { children: JSXElement }) {
  return (
    <div id="root" class="sm:pt-8em py-2em before">
      <Header />
      {children}
    </div>
  )
}
