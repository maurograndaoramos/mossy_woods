export function esc(s = '') {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

export function progressTrack(ticks, maxCells = 10) {
  const cells = []
  for (let i = 0; i < maxCells; i++) {
    const t = Math.max(0, Math.min(4, ticks - i * 4))
    cells.push(t)
  }
  return `<div class="track" aria-label="progress ${ticks} ticks of ${maxCells * 4}">
    ${cells.map(t => {
      const cls = t === 0 ? '' : `t${t}`
      const inner = t >= 3 ? '<i></i>' : ''
      const inner2 = t >= 4 ? '<b></b>' : ''
      return `<div class="track-cell ${cls}">${inner}${inner2}</div>`
    }).join('')}
  </div>`
}

export function meterPips(meter) {
  const { value, max, key } = meter
  const filled = Math.max(0, value)
  return `<div class="meter-pips">
    ${Array.from({ length: max }, (_, i) => {
      return `<div class="pip ${i < filled ? 'filled' : ''} ${key}"></div>`
    }).join('')}
  </div>`
}
