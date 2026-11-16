const SESSION_KEY = "laprida.panel.session"
const PASSWORD = "123"

let unlockedInMemory = false

export function isAdminUnlocked() {
  if (unlockedInMemory) return true
  try {
    return sessionStorage.getItem(SESSION_KEY) === "ok"
  } catch {
    return false
  }
}

export function unlockAdmin(password) {
  if (password !== PASSWORD) return false
  unlockedInMemory = true
  try {
    sessionStorage.setItem(SESSION_KEY, "ok")
  } catch {
    // The session still holds for this page load.
  }
  return true
}
