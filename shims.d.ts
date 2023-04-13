export {}
declare module "solid-js" {
  namespace JSX {
    interface Directives {
      clickOutside: any
    }
    interface ExplicitAttributes {
      tooltip: string
      position: "top" | "bottom" | "left" | "right"
    }

    // interface Directives {
    //   // use:____
    // }
    // interface ExplicitProperties {
    //   // prop:____
    // }
    // interface ExplicitAttributes {
    //   // attr:____
    // }
    // interface CustomEvents {
    //   // on:____
    // }
    // interface CustomCaptureEvents {
    //   // oncapture:____
    // }
  }
}
