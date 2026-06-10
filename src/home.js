import { getSheet } from './api.js'
import { esc, progressTrack, meterPips } from './util.js'

function openAssetModal(a) {
  document.getElementById('modalContent').innerHTML = `
    <div class="modal-type">${esc(a.type)}</div>
    <h2 class="modal-name">${esc(a.name)}</h2>
    <div class="modal-sub">${esc(a.sub)}</div>
    <div class="modal-abilities">
      ${a.abilities.map(ab => `
        <div class="modal-ability ${ab.unlocked ? '' : 'locked'}">
          <span class="diamond">${ab.unlocked ? '◆' : '◇'}</span>
          <span class="ability-text">${ab.text}</span>
        </div>
      `).join('')}
    </div>
  `
  document.getElementById('modalOverlay').classList.add('active')
}

export async function initHome() {
  const container = document.getElementById('page-home')
  container.innerHTML = `<div class="page-loading">Loading…</div>`

  const { character: c, currentQuest: q, hand } = await getSheet()

  container.innerHTML = `
    <div class="sheet">
      <header class="sheet-header">
        <div class="sheet-eyebrow">The Witch's Sheet</div>
        <h1 class="sheet-name">${esc(c.name)}</h1>
        <div class="sheet-epithet">${esc(c.epithet)}</div>
        <div class="sheet-where">${esc(c.where)}</div>
      </header>

      <div class="bot-divider">
        <span class="bot-divider-glyph">❋ ☾ ❋</span>
      </div>

      <div class="sheet-vitals">
        <div class="vitals-card">
          <div class="vitals-label">Stats</div>
          <div class="stats-row">
            ${c.stats.map(s => `
              <div class="stat">
                <div class="stat-orb">${s.value}</div>
                <div class="stat-name">${esc(s.name)}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="vitals-card">
          <div class="vitals-label">Condition</div>
          <div class="meters">
            ${c.meters.filter(m => m.key !== 'momentum').map(m => `
              <div class="meter">
                <div class="meter-name">${esc(m.name)}</div>
                ${meterPips(m)}
                <div class="meter-val">${m.value}/${m.max}</div>
              </div>
            `).join('')}
            <div class="meter momentum-block">
              ${(() => {
                const m = c.meters.find(x => x.key === 'momentum')
                return `
                  <div class="meter-name">Momentum</div>
                  ${meterPips(m)}
                  <div class="meter-val">${m.value >= 0 ? '+' : ''}${m.value}</div>
                `
              })()}
            </div>
          </div>
        </div>
      </div>

      <div class="current-quest">
        <div class="quest-kicker">The Current Vow</div>
        <div class="quest-rank">${esc(q.rank)}</div>
        <p class="quest-text">"${esc(q.text)}"</p>
        ${progressTrack(q.progress)}
      </div>

      <div class="hand-section">
        <div class="hand-label">— Her Hand —</div>
        <div class="hand-bar">
          <div class="hand-inner" id="handInner"></div>
        </div>
      </div>
    </div>
  `

  const handInner = document.getElementById('handInner')
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
    el.addEventListener('click', () => openAssetModal(a))
    handInner.appendChild(el)
  })
}
