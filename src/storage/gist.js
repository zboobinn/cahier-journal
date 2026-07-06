// Synchro optionnelle via un Gist GitHub privé (jalon 6).
// Token et id du Gist restent uniquement en localStorage (usage strictement personnel).

const TOKEN_KEY = 'cahier-journal:gist-token'
const GIST_ID_KEY = 'cahier-journal:gist-id'
const FILE_NAME = 'cahier-journal.json'
const API_BASE = 'https://api.github.com/gists'

export function getGistConfig() {
  return {
    token: localStorage.getItem(TOKEN_KEY) || '',
    gistId: localStorage.getItem(GIST_ID_KEY) || '',
  }
}

export function isSyncConfigured() {
  const { token, gistId } = getGistConfig()
  return Boolean(token && gistId)
}

export function saveGistConfig({ token, gistId }) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(GIST_ID_KEY, gistId)
}

export function clearGistConfig() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(GIST_ID_KEY)
}

function authHeaders(token) {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json',
  }
}

async function readErrorMessage(res) {
  try {
    const body = await res.json()
    return body?.message || `Erreur ${res.status}`
  } catch {
    return `Erreur ${res.status}`
  }
}

// Active la synchro : réutilise gistIdInput si fourni, sinon crée un gist privé
// contenant `initialData`. Mémorise token + id en localStorage.
export async function activateSync(token, gistIdInput, initialData) {
  let gistId = gistIdInput?.trim()
  if (!gistId) {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'Cahier journal — données de synchro',
        public: false,
        files: { [FILE_NAME]: { content: JSON.stringify(initialData, null, 2) } },
      }),
    })
    if (!res.ok) throw new Error(await readErrorMessage(res))
    const json = await res.json()
    gistId = json.id
  }
  saveGistConfig({ token, gistId })
  return gistId
}

// Lit le contenu JSON du gist, ou `null` si le fichier n'existe pas encore.
export async function pull() {
  const { token, gistId } = getGistConfig()
  if (!token || !gistId) return null
  const res = await fetch(`${API_BASE}/${gistId}`, { headers: authHeaders(token) })
  if (!res.ok) throw new Error(await readErrorMessage(res))
  const json = await res.json()
  const file = json.files?.[FILE_NAME]
  if (!file) return null
  const content = file.truncated ? await (await fetch(file.raw_url)).text() : file.content
  try {
    return JSON.parse(content)
  } catch {
    return null
  }
}

export async function push(data) {
  const { token, gistId } = getGistConfig()
  if (!token || !gistId) return
  const res = await fetch(`${API_BASE}/${gistId}`, {
    method: 'PATCH',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: { [FILE_NAME]: { content: JSON.stringify(data, null, 2) } } }),
  })
  if (!res.ok) throw new Error(await readErrorMessage(res))
}
