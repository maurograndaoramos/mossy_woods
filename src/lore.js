import { getLore } from './api.js'
import { patchLore, deleteLore, postLore } from './api.js'
import { esc } from './util.js'
import { isEditMode } from './editmode.js'

function inlineEdit(el, currentValue, onSave, multiline = false) {
  let input
  if (multiline) {
    input = document.createElement('textarea')
    input.className = 'edit-inline-input edit-inline-textarea'
    input.value = currentValue
    input.rows = 5
  } else {
    input = document.createElement('input')
    input.className = 'edit-inline-input'
    input.value = currentValue
  }
  el.replaceWith(input)
  input.focus()
  if (input.select) input.select()

  const save = async () => {
    try { await onSave(input.value.trim()) } catch(e) { console.error(e) }
  }
  input.addEventListener('blur', save)
  if (!multiline) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur() }
      if (e.key === 'Escape') input.replaceWith(el)
    })
  }
}

export async function initLore() {
  const container = document.getElementById('page-lore')
  container.innerHTML = `<div class="page-loading">Loading…</div>`
  const entries = await getLore()
  renderLore(container, entries)
}

function renderLore(container, entries) {
  const em = isEditMode()
  const reload = () => renderLore(container, entries)

  container.innerHTML = `
    <div class="scroll-wrap">
      <div class="page-eyebrow">Truths of this World</div>
      <h1 class="page-title">World Lore</h1>
      <div class="page-sub">as it stands</div>

      <div class="bot-divider"><span class="bot-divider-glyph">❀ ☾ ❀</span></div>

      <p style="text-align:center; font-style:italic; color:var(--mist); font-family:var(--font-body); margin-bottom:1.5rem; max-width:520px; margin-left:auto; margin-right:auto; line-height:1.65;">
        Settled at the start of the chronicle. The world is as the witch was told it was —
        until something gives her reason to think otherwise.
      </p>

      ${em ? `<div style="text-align:center;margin-bottom:1.5rem"><button class="edit-add-btn" id="addLoreBtn">+ Add entry</button></div>` : ''}

      <div class="lore-entries">
        ${entries.map(e => `
          <article class="lore-entry" data-id="${esc(e.id)}">
            ${em ? `<button class="edit-delete-btn lore-delete" title="Remove">✕</button>` : ''}
            <div class="lore-category">
              <span class="editable-text" data-field="category">${esc(e.category)}</span>
              ${em ? `<button class="edit-pen" data-pen="category" title="Edit">✎</button>` : ''}
            </div>
            <h2 class="lore-heading">
              <span class="editable-text" data-field="title">${esc(e.title)}</span>
              ${em ? `<button class="edit-pen" data-pen="title" title="Edit">✎</button>` : ''}
            </h2>
            <p class="lore-text">
              <span class="editable-text" data-field="text">${esc(e.text)}</span>
              ${em ? `<button class="edit-pen" data-pen="text" title="Edit">✎</button>` : ''}
            </p>
          </article>
        `).join('')}
      </div>
    </div>
  `

  if (!em) return

  entries.forEach(e => {
    const el = container.querySelector(`.lore-entry[data-id="${e.id}"]`)
    if (!el) return

    el.querySelectorAll('.edit-pen[data-pen]').forEach(btn => {
      btn.addEventListener('click', () => {
        const field = btn.dataset.pen
        const span = el.querySelector(`.editable-text[data-field="${field}"]`)
        inlineEdit(span, e[field], async val => {
          await patchLore(e.id, { [field]: val })
          e[field] = val
          reload()
        }, field === 'text')
      })
    })

    el.querySelector('.lore-delete')?.addEventListener('click', async () => {
      if (!confirm(`Remove lore entry "${e.title}"?`)) return
      await deleteLore(e.id)
      entries.splice(entries.indexOf(e), 1)
      reload()
    })
  })

  document.getElementById('addLoreBtn')?.addEventListener('click', async () => {
    const entry = { id: `lore-${Date.now()}`, category: 'New', title: 'New Entry', text: '' }
    await postLore(entry)
    entries.push(entry)
    reload()
  })
}
