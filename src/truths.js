import truthsData from './truths_data.json'
import { selectTruths } from './api.js'

function buildLore(selections) {
  const selectedIds = Object.values(selections)
  const lore = []

  for (const truth of truthsData.truths) {
    const optionId = selections[truth.id]
    if (!optionId) continue
    const option = truth.options.find(o => o.id === optionId)
    if (!option) continue
    lore.push({
      id: truth.id,
      category: truth.category,
      title: option.label,
      text: option.text,
      historical: truth.historical || false,
    })
  }

  for (const patch of truthsData.patches) {
    if (patch.conditions.every(c => selectedIds.includes(c))) {
      lore.push({
        id: patch.id,
        category: 'Interplay',
        title: 'The Way Things Connect',
        text: patch.text,
        patch: true,
      })
    }
  }

  return lore
}

export function initTruths(token) {
  const total = truthsData.truths.length
  let index = 0
  const selections = {}

  const overlay = document.createElement('div')
  overlay.className = 'truth-overlay'
  document.getElementById('app').appendChild(overlay)

  function renderSlide() {
    if (index >= total) { renderConfirmation(); return }

    const truth = truthsData.truths[index]
    const selected = selections[truth.id]

    overlay.innerHTML = `
      <div class="truth-panel">
        <div class="truth-header">
          <span class="truth-progress">${index + 1} / ${total}</span>
          ${truth.historical ? '<span class="truth-badge">Historical</span>' : ''}
        </div>
        <h2 class="truth-title">${truth.category}</h2>
        <p class="truth-desc">${truth.description}</p>
        <div class="truth-options">
          ${truth.options.map(opt => `
            <div class="truth-option${selected === opt.id ? ' selected' : ''}" data-id="${opt.id}">
              <div class="truth-option-label">${opt.label}</div>
              <div class="truth-option-text">${opt.text}</div>
            </div>
          `).join('')}
        </div>
        <div class="truth-nav">
          <button class="truth-btn secondary" id="truthBack" ${index === 0 ? 'disabled' : ''}>← Back</button>
          <button class="truth-btn primary" id="truthNext" ${!selected ? 'disabled' : ''}>${index === total - 1 ? 'Review →' : 'Next →'}</button>
        </div>
      </div>
    `

    overlay.querySelectorAll('.truth-option').forEach(el => {
      el.addEventListener('click', () => {
        selections[truth.id] = el.dataset.id
        renderSlide()
      })
    })

    overlay.querySelector('#truthBack').addEventListener('click', () => { index--; renderSlide() })
    overlay.querySelector('#truthNext').addEventListener('click', () => {
      if (!selected) return
      index++
      renderSlide()
    })
  }

  function renderConfirmation() {
    const lore = buildLore(selections)
    const patches = lore.filter(e => e.patch)
    const main = lore.filter(e => !e.patch)

    overlay.innerHTML = `
      <div class="truth-panel truth-confirm">
        <div class="truth-header">
          <span class="truth-progress">${main.length} truths · ${patches.length} interplay${patches.length !== 1 ? 's' : ''}</span>
        </div>
        <h2 class="truth-title">Your World Is Shaped</h2>
        <p class="truth-desc">Review your selections. Confirm to write them into the lore.</p>
        <div class="truth-summary">
          ${main.map(e => `
            <div class="truth-summary-row">
              <span class="truth-summary-cat">${e.category}</span>
              <span class="truth-summary-label">${e.title}</span>
            </div>
          `).join('')}
          ${patches.length ? `<div class="truth-summary-patch">+ ${patches.length} interplay note${patches.length !== 1 ? 's' : ''} active</div>` : ''}
        </div>
        <div class="truth-nav">
          <button class="truth-btn secondary" id="truthBack">← Back</button>
          <button class="truth-btn primary" id="truthConfirm">Confirm & Save</button>
        </div>
      </div>
    `

    overlay.querySelector('#truthBack').addEventListener('click', () => { index = total - 1; renderSlide() })
    overlay.querySelector('#truthConfirm').addEventListener('click', () => submit(lore))
  }

  async function submit(lore) {
    const btn = overlay.querySelector('#truthConfirm')
    btn.textContent = 'Saving…'
    btn.disabled = true

    try {
      await selectTruths(token, lore)
      overlay.innerHTML = `
        <div class="truth-panel truth-done">
          <h2 class="truth-title">The World Remembers.</h2>
          <p class="truth-desc">Your truths have been set into the lore.</p>
        </div>
      `
      history.replaceState({}, '', window.location.pathname)
      setTimeout(() => {
        overlay.classList.add('truth-overlay-out')
        setTimeout(() => {
          overlay.remove()
          import('./lore.js').then(m => m.initLore())
        }, 600)
      }, 2000)
    } catch {
      btn.textContent = 'Failed — try again'
      btn.disabled = false
    }
  }

  renderSlide()
}
