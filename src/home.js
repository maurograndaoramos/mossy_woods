import { getSheet } from './api.js'
import { patchCharacter, patchStat, patchMeter, patchQuest, postHandAsset, patchHandAsset, deleteHandAsset } from './api.js'
import { esc, progressTrack, meterPips } from './util.js'
import { isEditMode } from './editmode.js'

const RANKS = ['Troublesome','Dangerous','Formidable','Extreme','Epic']

function pen(cls) {
  return `<button class="edit-pen" data-pen="${cls}" title="Edit">✎</button>`
}

function openAssetModal(a, editMode, onSaved, onDeleted) {
  const modal = document.getElementById('modalContent')
  modal.innerHTML = `
    <div class="modal-type">${esc(a.type)}</div>
    <h2 class="modal-name">${esc(a.name)}</h2>
    <div class="modal-sub">${esc(a.sub)}</div>
    <div class="modal-abilities">
      ${a.abilities.map((ab, i) => `
        <div class="modal-ability ${ab.unlocked ? '' : 'locked'}" data-ab="${i}">
          <span class="diamond">${ab.unlocked ? '◆' : '◇'}</span>
          <span class="ability-text">${ab.text}</span>
          ${editMode ? `<button class="ab-toggle-btn" data-ab="${i}" title="Toggle">${ab.unlocked ? 'Lock' : 'Unlock'}</button>` : ''}
        </div>
      `).join('')}
    </div>
    ${editMode ? `
      <div class="modal-edit-zone">
        <div class="modal-edit-label">Edit card (JSON)</div>
        <textarea class="modal-json-edit" id="assetJsonEdit" rows="12">${JSON.stringify(a, null, 2)}</textarea>
        <div class="modal-edit-actions">
          <button class="ekm-btn ekm-primary" id="assetSaveBtn">Save</button>
          <button class="ekm-btn ekm-danger" id="assetDeleteBtn">Delete card</button>
        </div>
        <div class="modal-edit-error" id="assetEditError"></div>
      </div>
    ` : ''}
  `
  document.getElementById('modalOverlay').classList.add('active')

  if (!editMode) return

  modal.querySelectorAll('.ab-toggle-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.dataset.ab)
      const updated = a.abilities.map((ab, i) => i === idx ? { ...ab, unlocked: !ab.unlocked } : ab)
      await patchHandAsset(a.id, { abilities: updated })
      a.abilities = updated
      openAssetModal(a, editMode, onSaved, onDeleted)
      if (onSaved) onSaved()
    })
  })

  document.getElementById('assetSaveBtn').addEventListener('click', async () => {
    const errEl = document.getElementById('assetEditError')
    try {
      const parsed = JSON.parse(document.getElementById('assetJsonEdit').value)
      await patchHandAsset(a.id, parsed)
      document.getElementById('modalOverlay').classList.remove('active')
      if (onSaved) onSaved()
    } catch (e) {
      errEl.textContent = e.message
    }
  })

  document.getElementById('assetDeleteBtn').addEventListener('click', async () => {
    if (!confirm(`Remove "${a.name}" from her hand?`)) return
    await deleteHandAsset(a.id)
    document.getElementById('modalOverlay').classList.remove('active')
    if (onDeleted) onDeleted()
  })
}

function makeInlineEditor(el, currentValue, onSave, opts = {}) {
  const { multiline = false, type = 'text', selectOptions = null } = opts
  let input

  if (selectOptions) {
    input = document.createElement('select')
    input.className = 'edit-inline-input'
    selectOptions.forEach(o => {
      const opt = document.createElement('option')
      opt.value = o
      opt.textContent = o
      if (o === currentValue) opt.selected = true
      input.appendChild(opt)
    })
  } else if (multiline) {
    input = document.createElement('textarea')
    input.className = 'edit-inline-input edit-inline-textarea'
    input.value = currentValue
    input.rows = 3
  } else {
    input = document.createElement('input')
    input.className = 'edit-inline-input'
    input.type = type
    input.value = currentValue
  }

  el.replaceWith(input)
  input.focus()
  if (input.select) input.select()

  const save = async () => {
    const val = type === 'number' ? Number(input.value) : input.value.trim()
    try {
      await onSave(val)
    } catch(e) {
      console.error(e)
    }
  }

  input.addEventListener('blur', save)
  if (!multiline) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur() }
      if (e.key === 'Escape') { input.replaceWith(el) }
    })
  }
}

export async function initHome() {
  const container = document.getElementById('page-home')
  container.innerHTML = `<div class="page-loading">Loading…</div>`

  const { character: c, currentQuest: q, hand } = await getSheet()
  const em = isEditMode()

  render(container, c, q, hand, em)
}

function render(container, c, q, hand, em) {
  container.innerHTML = `
    <div class="sheet">
      <header class="sheet-header">
        <div class="sheet-eyebrow">The Witch's Sheet</div>
        <h1 class="sheet-name">
          <span class="editable-text" data-field="name">${esc(c.name)}</span>
          ${em ? pen('name') : ''}
        </h1>
        <div class="sheet-epithet">
          <span class="editable-text" data-field="epithet">${esc(c.epithet)}</span>
          ${em ? pen('epithet') : ''}
        </div>
        <div class="sheet-where">
          <span class="editable-text" data-field="where">${esc(c.where)}</span>
          ${em ? pen('where') : ''}
        </div>
      </header>

      <div class="bot-divider">
        <span class="bot-divider-glyph">❋ ☾ ❋</span>
      </div>

      <div class="sheet-vitals">
        <div class="vitals-card">
          <div class="vitals-label">Stats</div>
          <div class="stats-row">
            ${c.stats.map(s => `
              <div class="stat" data-stat="${esc(s.name)}">
                <div class="stat-orb ${em ? 'editable-orb' : ''}" data-field="statval">${s.value}</div>
                <div class="stat-name">${esc(s.name)}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="vitals-card">
          <div class="vitals-label">Condition</div>
          <div class="meters">
            ${c.meters.filter(m => m.key !== 'momentum').map(m => `
              <div class="meter" data-meter="${m.key}">
                <div class="meter-name">${esc(m.name)}</div>
                ${meterPips(m)}
                <div class="meter-val ${em ? 'editable-orb' : ''}" data-field="meterval">${m.value}/${m.max}</div>
              </div>
            `).join('')}
            <div class="meter momentum-block" data-meter="momentum">
              ${(() => {
                const m = c.meters.find(x => x.key === 'momentum')
                return `
                  <div class="meter-name">Momentum</div>
                  ${meterPips(m)}
                  <div class="meter-val ${em ? 'editable-orb' : ''}" data-field="meterval">${m.value >= 0 ? '+' : ''}${m.value}</div>
                `
              })()}
            </div>
          </div>
        </div>
      </div>

      <div class="current-quest">
        <div class="quest-kicker">The Current Vow</div>
        <div class="quest-rank-row">
          <span class="quest-rank editable-text ${em ? 'editable-orb' : ''}" data-field="qrank">${esc(q.rank)}</span>
          ${em ? pen('qrank') : ''}
        </div>
        <p class="quest-text">
          "<span class="editable-text" data-field="qtext">${esc(q.text)}</span>"
          ${em ? pen('qtext') : ''}
        </p>
        <div class="quest-progress-row">
          ${progressTrack(q.progress)}
          ${em ? `<button class="edit-pen" data-pen="qprogress" title="Edit progress">✎ ${q.progress}</button>` : ''}
        </div>
      </div>

      <div class="hand-section">
        <div class="hand-label">— Her Hand —</div>
        ${em ? `<button class="edit-add-btn" id="addAssetBtn">+ Add card</button>` : ''}
        <div class="hand-bar">
          <div class="hand-inner" id="handInner"></div>
        </div>
      </div>
    </div>
  `

  const handInner = document.getElementById('handInner')
  const reload = () => initHome()

  hand.forEach((a, i) => {
    const el = document.createElement('div')
    el.className = 'card'
    el.dataset.i = i
    el.innerHTML = `
      <span class="card-corner tl"></span><span class="card-corner tr"></span>
      <span class="card-corner bl"></span><span class="card-corner br"></span>
      <div class="card-type">${esc(a.type)}</div>
      <div class="card-name">${esc(a.name)}</div>
      <div class="card-sub">${esc(a.sub)}</div>
      <div class="card-glyph">${a.glyph}</div>
      <div class="card-abilities">
        ${a.abilities.map(ab => `<div class="ab ${ab.unlocked ? 'unlocked' : ''}"></div>`).join('')}
      </div>
    `
    el.addEventListener('click', () => openAssetModal(a, em, reload, reload))
    handInner.appendChild(el)
  })

  if (!em) return

  // Character identity fields
  container.querySelectorAll('.edit-pen[data-pen]').forEach(btn => {
    const field = btn.dataset.pen
    btn.addEventListener('click', () => {
      if (['name','epithet','where'].includes(field)) {
        const span = container.querySelector(`.editable-text[data-field="${field}"]`)
        const cur = field === 'name' ? c.name : field === 'epithet' ? c.epithet : c.where
        makeInlineEditor(span, cur, async val => {
          await patchCharacter({ [field]: val })
          c[field] = val
          render(container, c, q, hand, em)
        })
      } else if (field === 'qrank') {
        const span = container.querySelector('.editable-text[data-field="qrank"]')
        makeInlineEditor(span, q.rank, async val => {
          await patchQuest({ rank: val })
          q.rank = val
          render(container, c, q, hand, em)
        }, { selectOptions: RANKS })
      } else if (field === 'qtext') {
        const span = container.querySelector('.editable-text[data-field="qtext"]')
        makeInlineEditor(span, q.text, async val => {
          await patchQuest({ text: val })
          q.text = val
          render(container, c, q, hand, em)
        }, { multiline: true })
      } else if (field === 'qprogress') {
        makeInlineEditor(btn, q.progress, async val => {
          await patchQuest({ progress: val })
          q.progress = val
          render(container, c, q, hand, em)
        }, { type: 'number' })
      }
    })
  })

  // Stat orbs — click directly
  container.querySelectorAll('.stat[data-stat]').forEach(statEl => {
    const orb = statEl.querySelector('.stat-orb')
    const statName = statEl.dataset.stat
    const stat = c.stats.find(s => s.name === statName)
    orb.addEventListener('click', () => {
      makeInlineEditor(orb, stat.value, async val => {
        await patchStat(statName, { value: val })
        stat.value = val
        render(container, c, q, hand, em)
      }, { type: 'number' })
    })
  })

  // Meter values — click directly
  container.querySelectorAll('.meter[data-meter]').forEach(meterEl => {
    const valEl = meterEl.querySelector('.meter-val')
    const key = meterEl.dataset.meter
    const meter = c.meters.find(m => m.key === key)
    valEl.addEventListener('click', () => {
      makeInlineEditor(valEl, meter.value, async val => {
        await patchMeter(key, { value: val })
        meter.value = val
        render(container, c, q, hand, em)
      }, { type: 'number' })
    })
  })

  // Add asset card
  document.getElementById('addAssetBtn')?.addEventListener('click', () => {
    const blank = {
      id: `asset-${Date.now()}`,
      type: 'Path', name: 'New Card',
      sub: '', glyph: '✦',
      abilities: [{ text: 'Ability text.', unlocked: false }]
    }
    openAssetModal(blank, true, async () => {
      await postHandAsset(blank)
      reload()
    }, reload)
  })
}
