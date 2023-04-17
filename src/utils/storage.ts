import { type Session, LocalStorageKey } from "~/types"

export function getSession(id: string) {
  try {
    const _ = localStorage.getItem(LocalStorageKey.PREFIXSESSION + id)
    if (_) return JSON.parse(_) as Session
  } catch (e) {
    console.error("Error parsing session:", e)
  }
  return undefined
}

export function setSession(id: string, data: Session) {
  localStorage.setItem(LocalStorageKey.PREFIXSESSION + id, JSON.stringify(data))
}

export function delSession(id: string) {
  localStorage.removeItem(LocalStorageKey.PREFIXSESSION + id)
}

export function fetchAllSessions() {
  const sessions: Session[] = []
  Object.keys(localStorage).forEach(key => {
    const id = key.replace(LocalStorageKey.PREFIXSESSION, "")
    if (id !== key) {
      const session = getSession(id)
      if (session) sessions.push(session)
    }
  })
  return sessions
}
