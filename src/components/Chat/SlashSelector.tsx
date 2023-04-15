import { makeEventListener } from "@solid-primitives/event-listener"
import {
  For,
  createEffect,
  createSignal,
  onMount,
  type JSXElement,
  Show
} from "solid-js"
import type { Option } from "~/types"

export default function PromptList(props: {
  options: Option[]
  select(k?: Option): void
}) {
  let containerRef: HTMLUListElement
  const [hoverIndex, setHoverIndex] = createSignal(0)
  const [maxHeight, setMaxHeight] = createSignal("320px")

  onMount(() => {
    makeEventListener(
      window,
      "keydown",
      e => {
        if (e.key === "ArrowDown") {
          setHoverIndex(hoverIndex() + 1)
        } else if (e.key === "ArrowUp") {
          setHoverIndex(hoverIndex() - 1)
        } else if (e.keyCode === 13) {
          props.select(props.options[hoverIndex()])
        } else if (e.key === "Escape") {
          props.select()
        }
      },
      { passive: true }
    )
  })

  createEffect(() => {
    if (hoverIndex() < 0) {
      setHoverIndex(0)
    } else if (hoverIndex() && hoverIndex() >= props.options.length) {
      setHoverIndex(props.options.length - 1)
    }
  })

  createEffect(() => {
    if (containerRef && props.options.length)
      setMaxHeight(
        `${
          window.innerHeight - containerRef.clientHeight > 112
            ? 320
            : window.innerHeight - 112
        }px`
      )
  })

  return (
    <Show when={props.options.length}>
      <ul
        ref={containerRef!}
        class="bg-slate bg-op-20 dark:text-slate text-slate-7 overflow-y-auto rounded-t"
        style={{
          "max-height": maxHeight()
        }}
      >
        <For each={props.options}>
          {(item, i) => (
            <Item
              option={item}
              select={props.select}
              hover={hoverIndex() === i()}
            />
          )}
        </For>
      </ul>
    </Show>
  )
}

function Item(props: {
  option: Option
  select(k?: Option): void
  hover: boolean
}) {
  let ref: HTMLLIElement
  createEffect(() => {
    if (props.hover) {
      ref.focus()
      ref.scrollIntoView({ block: "center" })
    }
  })
  let DescComponent: JSXElement = props.option.title
  let PromptComponent: JSXElement = props.option.desc
  if (props.option.positions?.size) {
    const descLen = props.option.desc.length
    const descRange = [0, descLen - 1]
    const promptRange = [descLen + 1, props.option.desc.length - 1]
    const { desc, prompt } = Array.from(props.option.positions).reduce(
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
      DescComponent = props.option.desc.split("").map((c, i) => {
        if (desc.includes(i)) {
          return <b class="dark:text-slate-2 text-black">{c}</b>
        }
        return c
      })
    }
    if (prompt) {
      PromptComponent = props.option.desc.split("").map((c, i) => {
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
        props.select(props.option)
      }}
    >
      <p>{DescComponent}</p>
      <p class="text-0.5em">{PromptComponent}</p>
    </li>
  )
}
