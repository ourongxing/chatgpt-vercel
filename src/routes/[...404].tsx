import { useNavigate } from "solid-start"

export default function NotFound() {
  const navigator = useNavigate()
  console.log("404")
  navigator("/", { replace: true })
  return <></>
}
