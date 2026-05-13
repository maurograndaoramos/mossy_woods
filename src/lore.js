import { getLore } from './api.js'

export async function initLore() {
  const container = document.getElementById('page-lore')
  container.innerHTML = `<div class="page-loading">Loading…</div>`

  const entries = await getLore()

  container.innerHTML = `
    <div class="lore-wrap">
      <h1 class="lore-title">World Lore</h1>
      <p class="lore-subtitle">Truths of Doskvol — as settled at the start of the chronicle.</p>
      <div class="lore-entries">
        ${entries.map(e => `
          <article class="lore-entry">
            <span class="lore-category">${e.category}</span>
            <h2 class="lore-heading">${e.title}</h2>
            <p class="lore-text">${e.text}</p>
          </article>
        `).join('')}
      </div>
    </div>
  `
}
