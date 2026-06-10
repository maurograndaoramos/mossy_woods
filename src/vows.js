import { getVows } from './api.js'
import { esc, progressTrack } from './util.js'

function renderVowCard(v, dim = false) {
  return `
    <div class="vow-card ${dim ? 'dimmed' : ''}">
      <div class="vow-head">
        <h3 class="vow-title">"${esc(v.title)}"</h3>
        <span class="vow-rank">${esc(v.rank)}</span>
      </div>
      <p class="vow-meta"><span class="lead">↳</span>${esc(v.meta)}</p>
      <div class="vow-progress-row">
        ${progressTrack(v.progress)}
        <span class="progress-note">${Math.floor(v.progress / 4)} of 10 marked</span>
      </div>
    </div>
  `
}

export async function initVows() {
  const container = document.getElementById('page-vows')
  container.innerHTML = `<div class="page-loading">Loading…</div>`

  const { vows, journeys, bonds } = await getVows()
  const active  = vows.filter(v => v.kind === 'active')
  const bg      = vows.filter(v => v.kind === 'background')
  const partial = vows.filter(v => v.kind === 'completed_partial')

  container.innerHTML = `
    <div class="scroll-wrap">
      <div class="page-eyebrow">Sworn upon Iron</div>
      <h1 class="page-title">Vows &amp; Journeys</h1>
      <div class="page-sub">what she carries</div>

      <div class="bot-divider"><span class="bot-divider-glyph">☾ ❋ ☾</span></div>

      <div class="vow-group">
        <div class="vow-group-label">Active</div>
        ${active.map(v => renderVowCard(v)).join('')}
      </div>

      <div class="vow-group">
        <div class="vow-group-label">Journey</div>
        ${journeys.map(j => renderVowCard(j)).join('')}
      </div>

      <div class="vow-group">
        <div class="vow-group-label">Background</div>
        ${bg.map(v => renderVowCard(v)).join('')}
      </div>

      <div class="vow-group">
        <div class="vow-group-label">Held in Abeyance</div>
        ${partial.map(v => renderVowCard(v, true)).join('')}
      </div>

      <div class="bot-divider"><span class="bot-divider-glyph">❀ ◐ ❀</span></div>

      <div class="vow-group">
        <div class="vow-group-label">Bonds</div>
        ${bonds.map(b => `
          <div class="vow-card">
            <div class="vow-head">
              <h3 class="vow-title">${esc(b.name)}</h3>
              <span class="vow-rank">Bond</span>
            </div>
            <p class="vow-meta"><span class="lead">↳</span>${esc(b.detail)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `
}
