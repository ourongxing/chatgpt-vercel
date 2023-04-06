import type { AttributifyAttributes } from "@unocss/preset-attributify"

// declare module 'solid-js' {
//   namespace JSX {
//     interface HTMLAttributes<T> extends AttributifyAttributes {}
//   }
// }

declare global {
  namespace astroHTML.JSX {
    type HTMLAttributes = AttributifyAttributes
  }
  namespace JSX {
    type HTMLAttributes<T> = AttributifyAttributes
  }
}

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      clickOutside: any
    }
  }
}
