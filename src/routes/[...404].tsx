import { onMount } from "solid-js"
import { Title } from "solid-start"
import { HttpStatusCode } from "solid-start/server"
import Layout from "~/layout"

export default function NotFound() {
  onMount(() => {
    // @ts-ignore
    window.location = "/"
  })
  return (
    <Layout>
      <Title>Not Found</Title>
      <HttpStatusCode code={404} />
    </Layout>
  )
}
