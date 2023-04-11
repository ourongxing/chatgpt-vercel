import Chat from "~/components/Chat"
import Layout from "~/layout"
import { useParams } from "solid-start"

export default function () {
  const param = useParams()
  return (
    <Layout>
      <Chat sessionID={param.session} />
    </Layout>
  )
}
