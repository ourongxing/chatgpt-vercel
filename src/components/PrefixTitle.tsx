import type { JSXElement } from "solid-js"
import { Title } from "solid-start"

export default function (props: { children?: JSXElement }) {
  return <Title>星宝@星赞互动{props.children ? " | " + props.children : ""}</Title>
}
