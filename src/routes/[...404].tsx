import { useNavigate } from "solid-start"

export default function NotFound() {
  useNavigate()("/", { replace: true })
  return <></>
}
