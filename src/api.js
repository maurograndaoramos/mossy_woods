const BASE_URL = import.meta.env.VITE_API_URL  // e.g. https://mossy-api.up.railway.app

// ── Stub data (used when VITE_API_URL is not set) ────────────
const STUB = {
  cards: [
    { id: 'whisper',  name: 'The Whisper',   icon: '🕯️', body: 'An informant who trades in secrets. Reliable, expensive, and never meets in the same place twice.' },
    { id: 'ward',     name: 'Ghost Ward',     icon: '🌿', body: 'A ward against spectral intrusion. Lasts one score. The moss grows where it is drawn.' },
    { id: 'crow',     name: 'Crow Bond',      icon: '🪶', body: 'A favoured crow messenger. Knows three routes out of the city and will not be intercepted.' },
    { id: 'debt',     name: 'Old Debt',       icon: '⚖️', body: 'A marker owed by a Bluecoat sergeant. Usable once — carefully.' },
    { id: 'key',      name: 'Hollow Key',     icon: '🗝️', body: 'Opens any lock built before the Unification. The lock will not remember being opened.' },
  ],

  factions: {
    season: { filled: 0, label: 'Season of Ash', note: 'The city holds its breath. Something stirs beneath the canals.' },
    factions: [
      { id: 'silvers',  name: 'The Silver Nails',   desc: 'Mercenary crew with a stranglehold on the docks. Professional, brutal, unaffiliated.',          segments: 6, filled: 2, status: 'neutral'  },
      { id: 'hollow',   name: 'The Hollow Court',   desc: 'Ghost-touched nobles who trade favours with the dead. Old money, older debts.',                  segments: 8, filled: 5, status: 'hostile'  },
      { id: 'verdant',  name: 'The Verdant Circle', desc: 'Alchemists and herbalists. They know what grows in the forgotten gardens.',                       segments: 4, filled: 1, status: 'friendly' },
      { id: 'wardens',  name: 'The Gray Wardens',   desc: "Unofficial peacekeepers of the Crow's Foot. Blind to what they choose not to see.",               segments: 6, filled: 0, status: 'unknown'  },
    ]
  },

  lore: [
    { id: 'city',    category: 'The City',    title: 'What is this place?',        text: 'Doskvol — a city built on lightning rails and leviathan blood, hemmed in by an eternal darkness. The sun died long ago. Only the electroplasmic barriers keep the hungry ghosts at bay.' },
    { id: 'streets', category: 'The Streets', title: 'Who holds power here?',      text: "The Bluecoats keep order, but order is a product for sale. The noble houses move the city's real levers from behind lacquered doors. Everyone else pays tribute or bleeds." },
    { id: 'beyond',  category: 'The Beyond',  title: 'What lies past the barriers?', text: 'The Deathlands. Endless dark, endless cold, and the whispers of things that were never quite alive. Leviathan hunters sail those waters. Not all return. None return unchanged.' },
    { id: 'crew',    category: 'The Crew',    title: 'What are we?',               text: "Scoundrels with a code, which is the closest thing to virtue this city allows. We take the jobs others won't. We go the places others fear. We do not, as a rule, die quietly." },
    { id: 'ghosts',  category: 'The Ghosts',  title: 'What becomes of the dead?',  text: 'They linger. The electroplasmic field traps them, hungry and confused. Some are bound into service. Some escape into the dark. All of them remember what they lost.' },
    { id: 'score',   category: 'The Score',   title: 'Why are we here?',           text: "Debt, ambition, and a name written in a dead man's ledger. The details change. The reason stays the same: survival, and maybe, on a good night, something worth surviving for." },
  ],

  wiki: [],
}

// ── Helpers ──────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API ${path} returned ${res.status}`)
  return res.json()
}

// ── Cards ─────────────────────────────────────────────────────
export async function getCards() {
  if (!BASE_URL) return STUB.cards
  return apiFetch('/cards')
}

// ── Factions ──────────────────────────────────────────────────
export async function getFactions() {
  if (!BASE_URL) return STUB.factions
  return apiFetch('/factions')
}

export async function saveFactions(state) {
  if (!BASE_URL) return
  return apiFetch('/factions', { method: 'POST', body: JSON.stringify(state) })
}

// ── Lore ──────────────────────────────────────────────────────
export async function getLore() {
  if (!BASE_URL) return STUB.lore
  return apiFetch('/lore')
}

// ── Wiki ──────────────────────────────────────────────────────
export async function getWiki() {
  if (!BASE_URL) return STUB.wiki
  return apiFetch('/wiki')
}

export async function saveWiki(entries) {
  if (!BASE_URL) return
  return apiFetch('/wiki', { method: 'POST', body: JSON.stringify(entries) })
}

// ── Truths selection (token-authenticated) ────────────────────
export async function selectTruths(token, lore) {
  if (!BASE_URL) return
  return apiFetch('/truths/select', {
    method: 'POST',
    body: JSON.stringify({ token, lore }),
  })
}
