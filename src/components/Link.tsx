import type { JSXElement } from "solid-js"
export default function Link(props: { href: string; children: JSXElement }) {
  return (
    <a
      border-b
      border-slate
      border-none
      hover:border-dashed
      href={props.href}
      target="_blank"
    >
      {props.children}
    </a>
  )
}
