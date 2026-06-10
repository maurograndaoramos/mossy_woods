import { getWiki } from './api.js'
import { esc } from './util.js'

const WIKI_STATE = { query: '', activeId: null }

function wikiMatches(entry, q) {
  if (!q) return true
  const hay = [entry.title, entry.sub, entry.category, ...(entry.tags || []), ...(entry.body || [])].join(' ').toLowerCase()
  return hay.includes(q)
}

function renderWikiSidebar(entries) {
  const q = WIKI_STATE.query.trim().toLowerCase()
  const filtered = entries.filter(e => wikiMatches(e, q))
  const byCat = {}
  filtered.forEach(e => { (byCat[e.category] ||= []).push(e) })
  const order = ['Person', 'Settlement', 'Place', 'Event', 'Lore']

  const sidebar = document.getElementById('wikiSidebarList')
  if (!sidebar) return

  if (filtered.length === 0) {
    sidebar.innerHTML = `<p class="wiki-empty">No entries match "${esc(WIKI_STATE.query)}".</p>`
    return
  }

  sidebar.innerHTML = order.filter(cat => byCat[cat]).map(cat => `
    <div class="wiki-section-label">${cat}s</div>
    <div class="wiki-list">
      ${byCat[cat].map(e => `
        <div class="wiki-list-item ${e.id === WIKI_STATE.activeId ? 'active' : ''}" data-id="${esc(e.id)}">
          <span class="wiki-item-title">${esc(e.title)}</span>
          <span class="cat-pill cat-${e.category.toLowerCase()}">${esc(e.category[0])}</span>
        </div>
      `).join('')}
    </div>
  `).join('')

  sidebar.querySelectorAll('.wiki-list-item').forEach(el => {
    el.addEventListener('click', () => {
      WIKI_STATE.activeId = el.dataset.id
      renderWikiSidebar(entries)
      renderWikiReader(entries)
    })
  })
}

function renderWikiReader(entries) {
  const reader = document.getElementById('wikiReader')
  if (!reader) return
  const active = entries.find(e => e.id === WIKI_STATE.activeId)
  if (!active) {
    reader.innerHTML = `<div class="wiki-empty-state"><p>Select an entry to read.</p></div>`
    return
  }
  reader.innerHTML = `
    <div class="wiki-reader-meta">
      <span class="cat-pill cat-${active.category.toLowerCase()}">${esc(active.category)}</span>
    </div>
    <h1 class="wiki-reader-title">${esc(active.title)}</h1>
    <div class="wiki-reader-sub">${esc(active.sub)}</div>
    <div class="wiki-reader-body">
      ${active.body.map(p => `<p>${p}</p>`).join('')}
    </div>
    ${active.tags?.length ? `
      <div class="wiki-tags">
        ${active.tags.map(t => `<span class="wiki-tag">#${esc(t)}</span>`).join('')}
      </div>
    ` : ''}
  `
}

export async function initWiki() {
  const container = document.getElementById('page-wiki')
  container.innerHTML = `<div class="page-loading">Loading…</div>`

  const entries = await getWiki()
  WIKI_STATE.activeId = entries[0]?.id || null

  container.innerHTML = `
    <div class="wiki-container">
      <aside class="wiki-sidebar">
        <div class="wiki-search">
          <span class="search-glyph">⌕</span>
          <input id="wikiSearch" type="text" placeholder="search the wiki — name, place, tag…" value="${esc(WIKI_STATE.query)}" />
        </div>
        <div id="wikiSidebarList"></div>
      </aside>
      <div class="wiki-main" id="wikiReader"></div>
    </div>
  `

  renderWikiSidebar(entries)
  renderWikiReader(entries)

  document.getElementById('wikiSearch').addEventListener('input', e => {
    WIKI_STATE.query = e.target.value
    renderWikiSidebar(entries)
  })
}
