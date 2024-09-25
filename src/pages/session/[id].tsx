import Chat from "~/components/Chat"
import { useNavigate, useParams } from "@solidjs/router"
import { Show } from "solid-js"
import { RootStore } from "~/store"
import PrefixTitle from "~/components/PrefixTitle"
import { getSession } from "~/utils"
import Main from "~/layout/Main"

export default function () {
  const { store, setStore } = RootStore
  const params = useParams<{ id?: string }>()
  const redirect = () =>
    !params.id || params.id === "index" || !getSession(params.id)
  if (redirect()) useNavigate()("/", { replace: true })
  else setStore("sessionId", params.id ?? "index")
  return (
    <Show when={!redirect() && store.sessionId}>
      <PrefixTitle>{store.sessionSettings.title}</PrefixTitle>
      <Main>
        <Chat />
      </Main>
    </Show>
  )
}
