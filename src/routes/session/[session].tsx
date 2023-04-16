import Chat from "~/components/Chat"
import Layout from "~/layout"
import { useNavigate, useParams } from "solid-start"
import { Show } from "solid-js"
import { RootStore } from "~/store"
import PrefixTitle from "~/components/PrefixTitle"
import { getSession } from "~/utils"

export default function () {
  const { store, setStore } = RootStore
  const params = useParams<{ session?: string }>()
  const redirect = () =>
    !params.session || params.session === "index" || !getSession(params.session)
  if (redirect()) useNavigate()("/", { replace: true })
  else setStore("sessionId", params.session ?? "index")
  return (
    <Show when={!redirect()}>
      <PrefixTitle>{store.sessionSettings.title}</PrefixTitle>
      <Layout>
        <Chat />
      </Layout>
    </Show>
  )
}
