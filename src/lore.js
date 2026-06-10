import { getLore } from './api.js'
import { esc } from './util.js'

export async function initLore() {
  const container = document.getElementById('page-lore')
  container.innerHTML = `<div class="page-loading">Loading…</div>`

  const entries = await getLore()

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

      <div class="lore-entries">
        ${entries.map(e => `
          <article class="lore-entry">
            <div class="lore-category">${esc(e.category)}</div>
            <h2 class="lore-heading">${esc(e.title)}</h2>
            <p class="lore-text">${esc(e.text)}</p>
          </article>
        `).join('')}
      </div>
    </div>
  `
}
