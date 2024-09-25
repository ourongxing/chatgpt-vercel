/* @refresh reload */
import { render } from "solid-js/web"
import { Router } from "@solidjs/router"
import { lazy } from "solid-js"
import App from "./App"

const routes = [
  {
    path: "/session/:id",
    component: lazy(() => import("./pages/session/[id]"))
  },
  {
    path: "/",
    component: lazy(() => import("./pages/index"))
  },
  {
    path: "*404",
    component: lazy(() => import("./pages/404"))
  }
]

render(
  () => <Router root={App}>{routes}</Router>,
  document.getElementById("root")!
)
