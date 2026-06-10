import { getVows } from './api.js'
import { patchVow, deleteVow, postVow, patchJourney, deleteJourney, postJourney, patchBond, deleteBond, postBond } from './api.js'
import { esc, progressTrack } from './util.js'
import { isEditMode } from './editmode.js'

const RANKS = ['Troublesome','Dangerous','Formidable','Extreme','Epic']
const KINDS = ['active','background','completed_partial']

function pen(field) {
  return `<button class="edit-pen" data-pen="${field}" title="Edit">✎</button>`
}

function deleteBtn(cls) {
  return `<button class="edit-delete-btn ${cls}" title="Remove">✕</button>`
}

function renderVowCard(v, em, onSave, onDelete, dim = false) {
  return `
    <div class="vow-card ${dim ? 'dimmed' : ''}" data-id="${esc(v.id)}">
      ${em ? deleteBtn('vow-delete') : ''}
      <div class="vow-head">
        <h3 class="vow-title">
          "<span class="editable-text" data-field="title">${esc(v.title)}</span>"
          ${em ? pen('title') : ''}
        </h3>
        <span class="vow-rank">
          <span class="editable-text" data-field="rank">${esc(v.rank)}</span>
          ${em ? pen('rank') : ''}
        </span>
      </div>
      <p class="vow-meta">
        <span class="lead">↳</span>
        <span class="editable-text" data-field="meta">${esc(v.meta)}</span>
        ${em ? pen('meta') : ''}
      </p>
      <div class="vow-progress-row">
        ${progressTrack(v.progress)}
        ${em
          ? `<button class="edit-pen" data-pen="progress" title="Edit progress">✎ ${v.progress}</button>`
          : `<span class="progress-note">${Math.floor(v.progress / 4)} of 10 marked</span>`
        }
        ${em ? `<select class="edit-kind-select" data-field="kind">
          ${KINDS.map(k => `<option value="${k}" ${k === v.kind ? 'selected' : ''}>${k}</option>`).join('')}
        </select>` : ''}
      </div>
    </div>
  `
}

function renderBondCard(b, em) {
  return `
    <div class="vow-card" data-id="${esc(b.id)}">
      ${em ? deleteBtn('bond-delete') : ''}
      <div class="vow-head">
        <h3 class="vow-title">
          <span class="editable-text" data-field="name">${esc(b.name)}</span>
          ${em ? pen('name') : ''}
        </h3>
        <span class="vow-rank">Bond</span>
      </div>
      <p class="vow-meta">
        <span class="lead">↳</span>
        <span class="editable-text" data-field="detail">${esc(b.detail)}</span>
        ${em ? pen('detail') : ''}
      </p>
    </div>
  `
}

function wireVowCard(cardEl, v, patchFn, deleteFn, onReload) {
  cardEl.querySelectorAll('.edit-pen[data-pen]').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.dataset.pen
      const span = cardEl.querySelector(`.editable-text[data-field="${field}"]`)
      const opts = field === 'rank'
        ? { selectOptions: RANKS }
        : field === 'progress'
        ? { type: 'number' }
        : field === 'meta' || field === 'title' ? { multiline: false } : {}

      inlineEdit(span || btn, v[field], async val => {
        await patchFn(v.id, { [field]: field === 'progress' ? Number(val) : val })
        v[field] = field === 'progress' ? Number(val) : val
        onReload()
      }, opts)
    })
  })

  const kindSel = cardEl.querySelector('.edit-kind-select')
  if (kindSel) {
    kindSel.addEventListener('change', async () => {
      await patchFn(v.id, { kind: kindSel.value })
      v.kind = kindSel.value
      onReload()
    })
  }

  const delBtn = cardEl.querySelector('.vow-delete')
  if (delBtn) {
    delBtn.addEventListener('click', async () => {
      if (!confirm(`Remove vow "${v.title}"?`)) return
      await deleteFn(v.id)
      onReload()
    })
  }
}

function wireBondCard(cardEl, b, onReload) {
  cardEl.querySelectorAll('.edit-pen[data-pen]').forEach(btn => {
    const field = btn.dataset.pen
    btn.addEventListener('click', () => {
      const span = cardEl.querySelector(`.editable-text[data-field="${field}"]`)
      inlineEdit(span, b[field], async val => {
        await patchBond(b.id, { [field]: val })
        b[field] = val
        onReload()
      })
    })
  })

  const delBtn = cardEl.querySelector('.bond-delete')
  if (delBtn) {
    delBtn.addEventListener('click', async () => {
      if (!confirm(`Remove bond with "${b.name}"?`)) return
      await deleteBond(b.id)
      onReload()
    })
  }
}

function inlineEdit(el, currentValue, onSave, opts = {}) {
  const { type = 'text', selectOptions = null, multiline = false } = opts
  let input

  if (selectOptions) {
    input = document.createElement('select')
    input.className = 'edit-inline-input'
    selectOptions.forEach(o => {
      const opt = document.createElement('option')
      opt.value = o; opt.textContent = o
      if (o === currentValue) opt.selected = true
      input.appendChild(opt)
    })
  } else if (multiline) {
    input = document.createElement('textarea')
    input.className = 'edit-inline-input edit-inline-textarea'
    input.value = currentValue; input.rows = 3
  } else {
    input = document.createElement('input')
    input.className = 'edit-inline-input'
    input.type = type; input.value = currentValue
  }

  el.replaceWith(input)
  input.focus()
  if (input.select) input.select()

  const save = async () => {
    const val = type === 'number' ? Number(input.value) : input.value
    try { await onSave(val) } catch(e) { console.error(e) }
  }
  input.addEventListener('blur', save)
  if (!multiline) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur() }
      if (e.key === 'Escape') input.replaceWith(el)
    })
  }
}

export async function initVows() {
  const container = document.getElementById('page-vows')
  container.innerHTML = `<div class="page-loading">Loading…</div>`
  const data = await getVows()
  renderVows(container, data)
}

function renderVows(container, data) {
  const { vows, journeys, bonds } = data
  const em = isEditMode()
  const reload = () => renderVows(container, data)

  const active   = vows.filter(v => v.kind === 'active')
  const bg       = vows.filter(v => v.kind === 'background')
  const partial  = vows.filter(v => v.kind === 'completed_partial')

  container.innerHTML = `
    <div class="scroll-wrap">
      <div class="page-eyebrow">Sworn upon Iron</div>
      <h1 class="page-title">Vows &amp; Journeys</h1>
      <div class="page-sub">what she carries</div>

      <div class="bot-divider"><span class="bot-divider-glyph">☾ ❋ ☾</span></div>

      <div class="vow-group" id="vg-active">
        <div class="vow-group-label">Active ${em ? `<button class="edit-add-btn" id="addVowBtn">+</button>` : ''}</div>
        ${active.map(v => renderVowCard(v, em)).join('')}
      </div>

      <div class="vow-group" id="vg-journeys">
        <div class="vow-group-label">Journey ${em ? `<button class="edit-add-btn" id="addJourneyBtn">+</button>` : ''}</div>
        ${journeys.map(j => renderVowCard(j, em)).join('')}
      </div>

      <div class="vow-group" id="vg-bg">
        <div class="vow-group-label">Background</div>
        ${bg.map(v => renderVowCard(v, em)).join('')}
      </div>

      <div class="vow-group" id="vg-abeyance">
        <div class="vow-group-label">Held in Abeyance</div>
        ${partial.map(v => renderVowCard(v, em, true)).join('')}
      </div>

      <div class="bot-divider"><span class="bot-divider-glyph">❀ ◐ ❀</span></div>

      <div class="vow-group" id="vg-bonds">
        <div class="vow-group-label">Bonds ${em ? `<button class="edit-add-btn" id="addBondBtn">+</button>` : ''}</div>
        ${bonds.map(b => renderBondCard(b, em)).join('')}
      </div>
    </div>
  `

  if (!em) return

  // Wire vow cards
  ;[...active, ...bg, ...partial].forEach(v => {
    const el = container.querySelector(`.vow-card[data-id="${v.id}"]`)
    if (el) wireVowCard(el, v, patchVow, deleteVow, reload)
  })

  // Wire journey cards
  journeys.forEach(j => {
    const el = container.querySelector(`#vg-journeys .vow-card[data-id="${j.id}"]`)
    if (el) wireVowCard(el, j, patchJourney, deleteJourney, reload)
  })

  // Wire bond cards
  bonds.forEach(b => {
    const el = container.querySelector(`#vg-bonds .vow-card[data-id="${b.id}"]`)
    if (el) wireBondCard(el, b, reload)
  })

  // Add buttons
  document.getElementById('addVowBtn')?.addEventListener('click', async () => {
    const v = { id: `vow-${Date.now()}`, title: 'New vow.', rank: 'Dangerous', meta: '', progress: 0, kind: 'active' }
    await postVow(v)
    vows.push(v)
    renderVows(container, data)
  })

  document.getElementById('addJourneyBtn')?.addEventListener('click', async () => {
    const j = { id: `journey-${Date.now()}`, title: 'New journey.', rank: 'Dangerous', meta: '', progress: 0 }
    await postJourney(j)
    journeys.push(j)
    renderVows(container, data)
  })

  document.getElementById('addBondBtn')?.addEventListener('click', async () => {
    const b = { id: `bond-${Date.now()}`, name: 'New Bond', detail: '' }
    await postBond(b)
    bonds.push(b)
    renderVows(container, data)
  })
}
