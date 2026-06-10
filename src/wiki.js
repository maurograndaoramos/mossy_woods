import { getWiki } from './api.js'
import { patchWiki, deleteWiki, postWiki } from './api.js'
import { esc } from './util.js'
import { isEditMode } from './editmode.js'

const WIKI_STATE = { query: '', activeId: null }
const CATEGORIES = ['Person','Settlement','Place','Event','Lore']

function wikiMatches(entry, q) {
  if (!q) return true
  const hay = [entry.title, entry.sub, entry.category, ...(entry.tags || []), ...(entry.body || [])].join(' ').toLowerCase()
  return hay.includes(q)
}

function renderWikiSidebar(entries, em) {
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
      renderWikiSidebar(entries, em)
      renderWikiReader(entries, em)
    })
  })
}

function renderWikiReader(entries, em) {
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
      ${em ? `
        <select class="edit-inline-input edit-cat-select" id="wikiCatSel">
          ${CATEGORIES.map(c => `<option value="${c}" ${c === active.category ? 'selected':''}>${c}</option>`).join('')}
        </select>
        <button class="edit-delete-btn wiki-delete" title="Delete entry">✕</button>
      ` : ''}
    </div>
    <h1 class="wiki-reader-title">
      <span class="editable-text" id="wikiTitle">${esc(active.title)}</span>
      ${em ? `<button class="edit-pen" id="wikiTitlePen" title="Edit">✎</button>` : ''}
    </h1>
    <div class="wiki-reader-sub">
      <span class="editable-text" id="wikiSub">${esc(active.sub)}</span>
      ${em ? `<button class="edit-pen" id="wikiSubPen" title="Edit">✎</button>` : ''}
    </div>
    <div class="wiki-reader-body" id="wikiBody">
      ${active.body.map((p, i) => `
        <p data-pi="${i}">
          ${p}
          ${em ? `<button class="edit-pen wiki-para-pen" data-pi="${i}" title="Edit paragraph">✎</button>
                  <button class="edit-delete-btn wiki-para-del" data-pi="${i}" title="Remove paragraph">✕</button>` : ''}
        </p>
      `).join('')}
      ${em ? `<button class="edit-add-btn" id="addParaBtn">+ paragraph</button>` : ''}
    </div>
    ${active.tags?.length || em ? `
      <div class="wiki-tags" id="wikiTags">
        ${(active.tags || []).map((t, i) => `
          <span class="wiki-tag">
            #${esc(t)}
            ${em ? `<button class="wiki-tag-del" data-ti="${i}" title="Remove tag">✕</button>` : ''}
          </span>
        `).join('')}
        ${em ? `<button class="edit-add-btn wiki-add-tag" id="addTagBtn">+ tag</button>` : ''}
      </div>
    ` : ''}
  `

  if (!em) return

  const reload = () => {
    renderWikiSidebar(entries, em)
    renderWikiReader(entries, em)
  }

  const inlineEdit = (el, val, onSave, multiline = false) => {
    let input
    if (multiline) {
      input = document.createElement('textarea')
      input.className = 'edit-inline-input edit-inline-textarea'
      input.value = val; input.rows = 4
    } else {
      input = document.createElement('input')
      input.className = 'edit-inline-input'
      input.value = val
    }
    el.replaceWith(input); input.focus()
    const save = async () => { try { await onSave(input.value) } catch(e) { console.error(e) } }
    input.addEventListener('blur', save)
    if (!multiline) {
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); input.blur() }
        if (e.key === 'Escape') input.replaceWith(el)
      })
    }
  }

  // Category select
  document.getElementById('wikiCatSel')?.addEventListener('change', async e => {
    await patchWiki(active.id, { category: e.target.value })
    active.category = e.target.value
    reload()
  })

  // Delete entry
  reader.querySelector('.wiki-delete')?.addEventListener('click', async () => {
    if (!confirm(`Delete wiki entry "${active.title}"?`)) return
    await deleteWiki(active.id)
    entries.splice(entries.indexOf(active), 1)
    WIKI_STATE.activeId = entries[0]?.id || null
    reload()
  })

  // Title
  document.getElementById('wikiTitlePen')?.addEventListener('click', () => {
    inlineEdit(document.getElementById('wikiTitle'), active.title, async val => {
      await patchWiki(active.id, { title: val })
      active.title = val; reload()
    })
  })

  // Sub
  document.getElementById('wikiSubPen')?.addEventListener('click', () => {
    inlineEdit(document.getElementById('wikiSub'), active.sub, async val => {
      await patchWiki(active.id, { sub: val })
      active.sub = val; reload()
    })
  })

  // Body paragraphs
  reader.querySelectorAll('.wiki-para-pen').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.pi)
      const p = reader.querySelector(`p[data-pi="${i}"]`)
      const textNode = p.firstChild
      inlineEdit(textNode || p, active.body[i], async val => {
        active.body[i] = val
        await patchWiki(active.id, { body: active.body })
        reload()
      }, true)
    })
  })

  reader.querySelectorAll('.wiki-para-del').forEach(btn => {
    btn.addEventListener('click', async () => {
      const i = parseInt(btn.dataset.pi)
      active.body.splice(i, 1)
      await patchWiki(active.id, { body: active.body })
      reload()
    })
  })

  document.getElementById('addParaBtn')?.addEventListener('click', async () => {
    active.body.push('New paragraph.')
    await patchWiki(active.id, { body: active.body })
    reload()
  })

  // Tags
  reader.querySelectorAll('.wiki-tag-del').forEach(btn => {
    btn.addEventListener('click', async () => {
      const i = parseInt(btn.dataset.ti)
      active.tags.splice(i, 1)
      await patchWiki(active.id, { tags: active.tags })
      reload()
    })
  })

  document.getElementById('addTagBtn')?.addEventListener('click', async () => {
    const tag = prompt('New tag:')
    if (!tag) return
    active.tags = [...(active.tags || []), tag.trim()]
    await patchWiki(active.id, { tags: active.tags })
    reload()
  })
}

export async function initWiki() {
  const container = document.getElementById('page-wiki')
  container.innerHTML = `<div class="page-loading">Loading…</div>`

  const entries = await getWiki()
  WIKI_STATE.activeId = entries[0]?.id || null

  const em = isEditMode()

  container.innerHTML = `
    <div class="wiki-container">
      <aside class="wiki-sidebar">
        <div class="wiki-search">
          <span class="search-glyph">⌕</span>
          <input id="wikiSearch" type="text" placeholder="search the wiki — name, place, tag…" value="${esc(WIKI_STATE.query)}" />
        </div>
        ${em ? `<div style="padding:0.5rem 0.5rem 0"><button class="edit-add-btn" id="addWikiBtn">+ New entry</button></div>` : ''}
        <div id="wikiSidebarList"></div>
      </aside>
      <div class="wiki-main" id="wikiReader"></div>
    </div>
  `

  renderWikiSidebar(entries, em)
  renderWikiReader(entries, em)

  document.getElementById('wikiSearch').addEventListener('input', e => {
    WIKI_STATE.query = e.target.value
    renderWikiSidebar(entries, em)
  })

  document.getElementById('addWikiBtn')?.addEventListener('click', async () => {
    const entry = {
      id: `wiki-${Date.now()}`,
      category: 'Person',
      title: 'New Entry',
      sub: '',
      tags: [],
      body: ['Write here.']
    }
    await postWiki(entry)
    entries.push(entry)
    WIKI_STATE.activeId = entry.id
    renderWikiSidebar(entries, em)
    renderWikiReader(entries, em)
  })
}
