import { getFactions } from './api.js'

function makeClock(segments, filled, isSeason = false) {
  const size = isSeason ? 110 : 72
  const cx = size / 2, cy = size / 2
  const r  = size / 2 - 5
  const gap = 0.06
  const step = (2 * Math.PI) / segments
  const offset = -Math.PI / 2

  let paths = ''
  for (let i = 0; i < segments; i++) {
    const a1 = offset + i * step + gap / 2
    const a2 = offset + (i + 1) * step - gap / 2
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1)
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2)
    const large = step - gap > Math.PI ? 1 : 0
    const cls = i < filled ? 'seg filled' : 'seg'
    paths += `<path class="${cls}" d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z" />`
  }

  return `<svg class="clock-svg${isSeason ? ' season' : ''}" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${paths}<circle cx="${cx}" cy="${cy}" r="${r * 0.28}" class="clock-hub"/></svg>`
}

function statusBadge(status) {
  return `<span class="status-tag status-${status}">${status}</span>`
}

export async function initFactions() {
  const container = document.getElementById('page-factions')
  container.innerHTML = `<div class="page-loading">Loading…</div>`

  const state = await getFactions()

  container.innerHTML = `
    <div class="factions-wrap">
      <div class="season-block">
        <div class="season-clock-wrap">
          ${makeClock(8, state.season.filled, true)}
          <div class="season-info">
            <h2 class="season-label">${state.season.label}</h2>
            <p class="season-note">${state.season.note}</p>
          </div>
        </div>
      </div>

      <div class="faction-grid">
        ${state.factions.map(f => `
          <div class="faction-card">
            <div class="faction-header">
              <h3 class="faction-name">${f.name}</h3>
              ${statusBadge(f.status)}
            </div>
            <p class="faction-desc">${f.desc}</p>
            <div class="clock-row">
              ${makeClock(f.segments, f.filled)}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `
}
