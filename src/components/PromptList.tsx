import {
  createEffect,
  createSignal,
  For,
  type JSXElement,
  onMount
} from "solid-js"
import { makeEventListener } from "@solid-primitives/event-listener"
import type { PromptItem } from "~/types"

export default function PromptList(props: {
  prompts: PromptItem[]
  select: (k: string) => void
}) {
  let containerRef: HTMLUListElement
  const [hoverIndex, setHoverIndex] = createSignal(0)
  const [maxHeight, setMaxHeight] = createSignal("320px")

  createEffect(() => {
    if (hoverIndex() < 0) {
      setHoverIndex(0)
    } else if (hoverIndex() && hoverIndex() >= props.prompts.length) {
      setHoverIndex(props.prompts.length - 1)
    }
  })

  createEffect(() => {
    if (containerRef && props.prompts.length)
      setMaxHeight(
        `${
          window.innerHeight - containerRef.clientHeight > 112
            ? 320
            : window.innerHeight - 112
        }px`
      )
  })

  onMount(() => {
    makeEventListener(
      window,
      "keydown",
      e => {
        if (e.key === "ArrowDown") {
          setHoverIndex(hoverIndex() + 1)
        } else if (e.key === "ArrowUp") {
          setHoverIndex(hoverIndex() - 1)
        } else if (e.key === "Enter") {
          props.select(props.prompts[hoverIndex()].prompt)
        }
      },
      { passive: true }
    )
  })

  return (
    <ul
      ref={containerRef!}
      class="bg-slate bg-op-15 dark:text-slate text-slate-7 overflow-y-auto rounded-t"
      style={{
        "max-height": maxHeight()
      }}
    >
      <For each={props.prompts}>
        {(prompt, i) => (
          <Item
            prompt={prompt}
            select={props.select}
            hover={hoverIndex() === i()}
          />
        )}
      </For>
    </ul>
  )
}

function Item(props: {
  prompt: PromptItem
  select: (k: string) => void
  hover: boolean
}) {
  let ref: HTMLLIElement
  createEffect(() => {
    if (props.hover) {
      ref.focus()
      ref.scrollIntoView({ block: "center" })
    }
  })
  let DescComponent: JSXElement = props.prompt.desc
  let PromptComponent: JSXElement = props.prompt.prompt
  if (props.prompt.positions?.size) {
    const descLen = props.prompt.desc.length
    const descRange = [0, descLen - 1]
    const promptRange = [descLen + 1, props.prompt.prompt.length - 1]
    const { desc, prompt } = Array.from(props.prompt.positions).reduce(
      (acc, cur) => {
        if (cur >= descRange[0] && cur <= descRange[1]) {
          acc.desc.push(cur)
        } else if (cur >= promptRange[0] && cur <= promptRange[1]) {
          acc.prompt.push(cur)
        }
        return acc
      },
      {
        desc: [] as number[],
        prompt: [] as number[]
      }
    )
    if (desc) {
      DescComponent = props.prompt.desc.split("").map((c, i) => {
        if (desc.includes(i)) {
          return <b class="dark:text-slate-2 text-black">{c}</b>
        }
        return c
      })
    }
    if (prompt) {
      PromptComponent = props.prompt.prompt.split("").map((c, i) => {
        if (prompt.includes(i + descLen + 2)) {
          return <b class="dark:text-slate-2 text-black">{c}</b>
        }
        return c
      })
    }
  }
  return (
    <li
      ref={ref!}
      class="hover:bg-slate hover:bg-op-20 py-1 px-3"
      classList={{
        "bg-slate": props.hover,
        "bg-op-20": props.hover
      }}
      onClick={() => {
        props.select(props.prompt.prompt)
      }}
    >
      <p>{DescComponent}</p>
      <p class="text-0.4em">{PromptComponent}</p>
    </li>
  )
}
