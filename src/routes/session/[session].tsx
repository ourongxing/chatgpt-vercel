import Chat from "~/components/Chat"
import Layout from "~/layout"
import { useParams, useNavigate } from "solid-start"
import { Show } from "solid-js"
import { RootStore, getSession } from "~/store"
import PrefixTitle from "~/components/PrefixTitle"

export default function () {
  const params = useParams<{ session: string }>()
  const { store } = RootStore
  const navigate = useNavigate()
  const redirect = () =>
    !params.session || params.session === "index" || !getSession(params.session)
  if (redirect()) navigate("/", { replace: true })
  return (
    <Show when={!redirect()}>
      <PrefixTitle>{store.sessionSettings.title}</PrefixTitle>
      <Layout>
        <Chat sessionID={params.session} />
      </Layout>
    </Show>
  )
}
