import { getApiKey } from './editmode.js'

const BASE_URL = import.meta.env.VITE_API_URL

const STUB = {
  sheet: {
    character: {
      name: 'Wren',
      epithet: 'of the Hollow Beck',
      where: 'A traveling witch · presently in Coddlemere',
      stats: [
        { name: 'Edge',   value: 1 },
        { name: 'Heart',  value: 3 },
        { name: 'Iron',   value: 1 },
        { name: 'Shadow', value: 2 },
        { name: 'Wits',   value: 3 },
      ],
      meters: [
        { name: 'Health',   key: 'health',   value: 4, max: 5 },
        { name: 'Spirit',   key: 'spirit',   value: 5, max: 5 },
        { name: 'Supply',   key: 'supply',   value: 3, max: 5 },
        { name: 'Momentum', key: 'momentum', value: 7, max: 10, min: -6 },
      ],
    },
    currentQuest: {
      text: 'Bring word of the missing miller back to Coddlemere.',
      rank: 'Dangerous',
      progress: 14,
    },
    hand: [
      {
        id: 'witch', type: 'Path', name: 'Witch',
        sub: 'A path of moon and threshold', glyph: '☾',
        abilities: [
          { text: 'When you <strong>channel the moon\'s quiet attention</strong>, you may ask a small truth of a person or place near you. Pay the price: the truth always costs you a little of what you brought.', unlocked: true },
          { text: 'When you <strong>offer a small thing of yours in trade</strong> — a name, a memory, a hank of hair — you may bind a working to it. The thing is no longer yours.', unlocked: true },
          { text: 'When you <strong>stand inside another\'s grief</strong> and do not look away, you may roll +heart instead of any other stat for the next move. Once per scene.', unlocked: false },
        ],
      },
      {
        id: 'moonwater', type: 'Ritual', name: 'Moonwater',
        sub: 'A working drawn from still water', glyph: '◌',
        abilities: [
          { text: 'When you <strong>leave a bowl of water under open sky for one full night</strong>, it becomes moonwater. Carry it in a stoppered vessel. It will not spoil for one moon.', unlocked: true },
          { text: 'When you <strong>wash a wound, a doorway, or a sleeping face</strong> with moonwater and roll +wits, on a strong hit you may set aside one harm or stress as if it were never taken.', unlocked: true },
        ],
      },
      {
        id: 'smoke-salt', type: 'Ritual', name: 'Smoke & Salt',
        sub: 'A working of warding', glyph: '✦',
        abilities: [
          { text: 'When you <strong>burn dried herbs and scatter salt at the four corners of a room</strong>, you may make it a refuge for one night. Roll +shadow: on a hit, nothing crosses the salt that does not say its name first.', unlocked: true },
          { text: 'When you <strong>break the working before sunrise</strong>, take +1 momentum. Otherwise, the room remembers, and asks something of you.', unlocked: false },
        ],
      },
      {
        id: 'cinder', type: 'Companion', name: 'Cinder',
        sub: 'A crow who chose her', glyph: '✧',
        abilities: [
          { text: '<strong>Quick.</strong> When you secure an advantage by sending Cinder ahead to scout, you may roll +wits.', unlocked: true },
          { text: '<strong>Disquieting.</strong> When you face a person who has not seen Cinder before, she may unsettle them. Roll +heart on compel.', unlocked: true },
          { text: '<strong>Endurant.</strong> Cinder takes harm on your behalf, +1 each scene. If she would die, swear a vow to find her again.', unlocked: false },
        ],
      },
      {
        id: 'hearthtender', type: 'Path', name: 'Hearthtender',
        sub: 'She who keeps the fire', glyph: '❀',
        abilities: [
          { text: 'When you <strong>cook a shared meal from what is at hand</strong>, you and any allies who eat regain +1 spirit and may forge a bond if it feels right.', unlocked: true },
          { text: 'When you <strong>tend another\'s hearth as if it were your own</strong>, you may resupply without rolling. Once per settlement.', unlocked: false },
        ],
      },
      {
        id: 'herblore', type: 'Talent', name: 'Herblore',
        sub: 'Knowledge in green things', glyph: '❋',
        abilities: [
          { text: 'When you <strong>spend an hour gathering in the right place</strong>, take +1 supply, or set aside one dose of a remedy. The land must be willing.', unlocked: true },
          { text: 'When you <strong>brew a tisane for someone in trouble</strong>, they may share a worry with you. Roll +heart on the next move you make on their behalf.', unlocked: true },
        ],
      },
    ],
  },

  vows: {
    vows: [
      { id: 'wood-witch', title: 'Find the wood-witch who left me my name.', rank: 'Extreme', meta: 'Background vow · sworn beneath the hawthorn at Mother Brake\'s hearth.', progress: 6, kind: 'background' },
      { id: 'miller', title: 'Bring word of the missing miller back to Coddlemere.', rank: 'Dangerous', meta: 'Sworn to Maud Brake on the second night of reeds.', progress: 14, kind: 'active' },
      { id: 'boundary', title: 'Set the boundary stone right by the river crossing.', rank: 'Troublesome', meta: 'A small thing, but the old stone has been turned. Someone meant it.', progress: 9, kind: 'active' },
      { id: 'aldred-letter', title: 'Carry Brother Aldred\'s letter to the chapel at Greythorn.', rank: 'Formidable', meta: 'Marked, sealed in beeswax — he would not say what it contained.', progress: 24, kind: 'completed_partial' },
    ],
    journeys: [
      { id: 'greythorn-road', title: 'From Coddlemere to the Greythorn Hollow.', rank: 'Dangerous', meta: 'Three days along the old pilgrim road. The road is hollow now.', progress: 16 },
    ],
    bonds: [
      { id: 'maud', name: 'Maud Brake', detail: 'Village healer, plainspoken, knows what the river says.' },
      { id: 'coddlemere', name: 'Coddlemere', detail: 'A riverside village under the bend of the Long Drought\'s recovery.' },
      { id: 'cinder', name: 'Cinder', detail: 'A crow who decided.' },
    ],
  },

  lore: [
    { id: 'fractured-mirror', category: 'The Heartland', title: 'The Fractured Mirror', text: 'Scouts and messengers still return from the imperial core, sometimes. But what they bring back conflicts wildly — one reports the capital besieged, another says it thrives under a new emperor, a third came back speaking of famine. The provincial administration closed the formal border and called the situation "under observation." Trade still moves through, because it has to. The border is real enough to be bureaucratic and porous enough to be useless.' },
    { id: 'slow-rot', category: 'The Collapse', title: 'The Slow Rot', text: 'No single cause. Corruption, overreach, bad harvests, small wars that never stopped. The Collapse wasn\'t an event — it was a realization. One day people looked around and understood it was already over.' },
    { id: 'quiet-recovery', category: 'The Provinces', title: 'The Quiet Recovery', text: 'The worst is over. Villages that were abandoned are being resettled. Old orchards are being replanted. People are cautious, still scarred, but there is genuine hope threading through the hardship. The land is generous if you work it right, and the communities that survived came out knowing exactly what matters.' },
    { id: 'village', category: 'Communities', title: 'The Village is Everything', text: 'The meaningful unit of society is the village. Not the region, not the province, not any lord\'s domain. The village council, the village elder, the village healer. Outsiders are welcome enough but always slightly guests. Loyalty runs hyperlocal — and that is not a flaw, that is how people survived.' },
    { id: 'old-contract', category: 'The Vows', title: 'The Old Contract', text: 'Vows predate the Empire and will outlast it. When you swear on iron, on salt, on your blood or your name, something in the fabric of things takes notice. Nobody can explain it theologically; it simply is. Breaking a vow doesn\'t just damage your reputation. People say you can see it in an oathbreaker\'s eyes afterward.' },
    { id: 'old-and-new', category: 'Faith', title: 'The Old and the New', text: 'The Imperial faith never fully replaced what came before. In the Provinces especially, old shrines sit at crossroads, old names are whispered for old things, old calendars mark old feast days. People layer belief practically — church on the official days, the old prayers when the harvest is bad or a child is sick. The priests pretend not to notice. Mostly.' },
    { id: 'magic', category: 'Magic', title: 'A Thing That Asks Back', text: 'It is not common, and those who have it rarely advertise. It is closer to a relationship than a power — the woods, the water, the moon will lend you a moment of their attention if you have earned it, or if you have a name they have learned. There is always a small price. Witches who pretend otherwise become something else.' },
  ],

  wiki: [
    { id: 'coddlemere', category: 'Settlement', title: 'Coddlemere', sub: 'a riverside village', tags: ['River-Bend', 'Mill', 'Hawthorn Lane'], body: ['A village of perhaps two hundred souls at the slow bend of the river, half a day downstream of the old pilgrim road. The mill is the centre of everything — it grinds the wheat, it powers the press, and the miller\'s family has been the de facto council for three generations.', 'The Long Drought stripped Coddlemere of nearly a fifth of its households, but the recovery has been kind. The orchards are bearing again, and there is even talk of repairing the upstream weir before midsummer.', '<em>Wren keeps a small upstairs room over Mother Brake\'s herb-house, by the kindness of the village.</em>'] },
    { id: 'maud-brake', category: 'Person', title: 'Maud Brake', sub: 'the village healer', tags: ['Coddlemere', 'Herbalist', 'Bond'], body: ['Plainspoken, gray-eyed, in her sixties and apparently unmoved by weather. The village healer at Coddlemere, the keeper of the herb-house on Hawthorn Lane, and the only person in town who didn\'t look surprised when Wren\'s working caught the first time.', 'Knows what the river says. Will not say how.', '<em>Bond sworn the night after the river fever broke.</em>'] },
    { id: 'greythorn', category: 'Place', title: 'The Greythorn Hollow', sub: 'a forest, not a friendly one', tags: ['Forest', 'Old Roads', 'Dangerous'], body: ['Three days inland along the old pilgrim road. The woods there are old — older than the Empire, older than the road. The pilgrims used to walk through them with bells.', 'No one walks there with bells anymore. The road still runs through it, but it is hollowed out: the waystations are roofless, the hostel at its centre is empty, and the people who do still travel that road do so quickly and in daylight.', 'Something has been turning the boundary stones.'] },
    { id: 'aldred', category: 'Person', title: 'Brother Aldred', sub: 'a wandering priest, of the older order', tags: ['Itinerant', 'Old Faith', 'Knows things'], body: ['A wandering priest of the old order — the one that layers the new faith over the older shrines and pretends the distinction is doctrinal. Carries a satchel of letters and a worn calendar that disagrees with the official one by about three days.', 'Asked Wren to carry a sealed letter to the chapel at Greythorn. Would not say what it contained, but paid for the working in advance with two silver and a kind of nod that meant <em>I know what you are.</em>'] },
    { id: 'long-drought', category: 'Event', title: 'The Long Drought', sub: 'four summers, six years ago', tags: ['Recent History', 'Recovery'], body: ['Four summers without proper rain, ending six years ago. The river ran shallow enough that the bend at Coddlemere was wadable in places. The Empire sent grain twice — both shipments were stolen by the time they arrived. The villages organised what they could and lost what they had to.', 'The recovery has been the slow, methodical kind. People who lived through the Drought speak of it the way they speak of weather: a thing that happened, that is no longer happening, but that remembers them.'] },
    { id: 'lantern-path', category: 'Lore', title: 'The Lantern Path', sub: 'an old pilgrim road, marked in stone', tags: ['Old Empire', 'Pilgrimage', 'Boundary'], body: ['The old pilgrim route that runs from the coast inland through Coddlemere and onward into the Greythorn Hollow. Named for the small stone lanterns that mark every league — most are broken now, but a few still hold their candles, kept lit by no one anyone can name.', 'The path predates the Imperial faith. The new chapels were built on the old shrine stones. The lanterns were lit before either.'] },
    { id: 'mill-family', category: 'Person', title: 'The Miller, Garron Hask', sub: 'missing as of the second night of reeds', tags: ['Coddlemere', 'Mill', 'Active Vow'], body: ['Garron Hask, fourth-generation miller, head of the Hask family that has been the de facto council of Coddlemere for as long as anyone remembers. Solid, slow to speak, devoted to his daughters.', 'Went out on the second night of reeds to check the upstream weir and did not return. The dogs would not follow.'] },
  ],
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API ${path} returned ${res.status}`)
  return res.json()
}

export async function getSheet() {
  if (!BASE_URL) return STUB.sheet
  return apiFetch('/sheet')
}

export async function getVows() {
  if (!BASE_URL) return STUB.vows
  return apiFetch('/vows')
}

export async function getMoves() {
  if (!BASE_URL) return null
  return apiFetch('/moves')
}

export async function getCalendar() {
  if (!BASE_URL) return null
  return apiFetch('/calendar')
}

export async function getLore() {
  if (!BASE_URL) return STUB.lore
  return apiFetch('/lore')
}

export async function getWiki() {
  if (!BASE_URL) return STUB.wiki
  return apiFetch('/wiki')
}

// ── Write helpers ────────────────────────────────────────────
async function apiWrite(method, path, body = null) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': getApiKey(),
    },
    ...(body !== null ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) throw new Error(`API ${path} returned ${res.status}`)
  if (method === 'DELETE') return { ok: true }
  return res.json()
}

// Sheet
export const patchCharacter  = (b)     => apiWrite('PATCH', '/sheet/character', b)
export const patchStat       = (name, b) => apiWrite('PATCH', `/sheet/stats/${encodeURIComponent(name)}`, b)
export const patchMeter      = (key, b)  => apiWrite('PATCH', `/sheet/meters/${key}`, b)
export const patchQuest      = (b)     => apiWrite('PATCH', '/sheet/quest', b)
export const postHandAsset   = (b)     => apiWrite('POST',  '/sheet/hand', b)
export const patchHandAsset  = (id, b) => apiWrite('PATCH', `/sheet/hand/${id}`, b)
export const deleteHandAsset = (id)    => apiWrite('DELETE',`/sheet/hand/${id}`)

// Vows
export const postVow         = (b)     => apiWrite('POST',  '/vows', b)
export const patchVow        = (id, b) => apiWrite('PATCH', `/vows/${id}`, b)
export const deleteVow       = (id)    => apiWrite('DELETE',`/vows/${id}`)
export const postJourney     = (b)     => apiWrite('POST',  '/vows/journeys', b)
export const patchJourney    = (id, b) => apiWrite('PATCH', `/vows/journeys/${id}`, b)
export const deleteJourney   = (id)    => apiWrite('DELETE',`/vows/journeys/${id}`)
export const postBond        = (b)     => apiWrite('POST',  '/vows/bonds', b)
export const patchBond       = (id, b) => apiWrite('PATCH', `/vows/bonds/${id}`, b)
export const deleteBond      = (id)    => apiWrite('DELETE',`/vows/bonds/${id}`)

// Lore
export const postLore        = (b)     => apiWrite('POST',  '/lore', b)
export const patchLore       = (id, b) => apiWrite('PATCH', `/lore/${id}`, b)
export const deleteLore      = (id)    => apiWrite('DELETE',`/lore/${id}`)

// Wiki
export const postWiki        = (b)     => apiWrite('POST',  '/wiki', b)
export const patchWiki       = (id, b) => apiWrite('PATCH', `/wiki/${id}`, b)
export const deleteWiki      = (id)    => apiWrite('DELETE',`/wiki/${id}`)

// Calendar
export const patchCalendar   = (b)     => apiWrite('PATCH', '/calendar', b)

export async function selectTruths(token, lore) {
  if (!BASE_URL) return
  return apiFetch('/truths/select', {
    method: 'POST',
    body: JSON.stringify({ token, lore }),
  })
}
