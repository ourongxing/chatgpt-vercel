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

const DefaultHeight = 350

export default function PromptList(props: {
  options: Option[]
  select(k?: Option): void
}) {
  let containerRef: HTMLUListElement
  const [hoverIndex, setHoverIndex] = createSignal(0)
  const [maxHeight, setMaxHeight] = createSignal(DefaultHeight)

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
    props.options
    if (containerRef && props.options.length) {
      setMaxHeight(
        containerRef.clientHeight > window.innerHeight - 130
          ? window.innerHeight - 130
          : DefaultHeight
      )
    }
  })

  return (
    <Show when={props.options.length}>
      <ul
        ref={containerRef!}
        class="bg-slate bg-op-20 dark:text-slate text-slate-7 overflow-y-auto rounded-t"
        style={{
          "max-height": maxHeight() + "px"
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
  let TitleComponent: JSXElement = props.option.title
  let DescComponent: JSXElement = props.option.desc
  if (props.option.positions?.size) {
    const titleLen = props.option.title.length
    const titleRange = [0, titleLen - 1]
    const descRange = [titleLen + 1, props.option.desc.length - 1]
    const { titleIndexs, descIndexs } = Array.from(props.option.positions)
      .sort((m, n) => m - n)
      .reduce(
        (acc, cur) => {
          if (cur >= titleRange[0] && cur <= titleRange[1]) {
            acc.titleIndexs.push(cur)
          } else if (cur >= descRange[0] && cur <= descRange[1]) {
            acc.descIndexs.push(cur - titleLen - 1)
          }
          return acc
        },
        {
          titleIndexs: [] as number[],
          descIndexs: [] as number[]
        }
      )
    if (titleIndexs.length) {
      TitleComponent = props.option.title.split("").map((c, i) => {
        if (titleIndexs.includes(i)) {
          return <b class="dark:text-slate-2 text-black">{c}</b>
        }
        return c
      })
    }
    if (descIndexs.length) {
      DescComponent = props.option.desc.split("").map((c, i) => {
        if (descIndexs.includes(i)) {
          return <b class="dark:text-slate-2 text-black">{c}</b>
        } else if (
          descIndexs[0] - 5 < i &&
          descIndexs[descIndexs.length - 1] + 100 > i
        ) {
          return c
        }
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
      <p class="truncate">{TitleComponent}</p>
      <p class="text-0.5em truncate">{DescComponent}</p>
    </li>
  )
}
