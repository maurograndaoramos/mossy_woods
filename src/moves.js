import { esc } from './util.js'

const MOVES_DATA = {
  Adventure: [
    {
      name: 'Face Danger',
      trigger: 'When you <strong>do something risky or react to a peril</strong>, decide how you approach it and roll the matching stat.',
      outcomes: [
        { kind: 'strong', desc: 'You do what you set out to do. Take +1 momentum.' },
        { kind: 'weak',   desc: 'You succeed, but at a cost. The fiction bends. Pay the price.' },
        { kind: 'miss',   desc: 'You fail or fall short. Pay the price.' },
      ],
    },
    {
      name: 'Secure an Advantage',
      trigger: 'When you <strong>assess a situation, prepare, or attempt to gain leverage</strong>, decide your approach and roll +stat.',
      outcomes: [
        { kind: 'strong', desc: 'Take +2 momentum, or +1 and prepare for what comes next.' },
        { kind: 'weak',   desc: 'The advantage is fragile or fleeting. +1 momentum.' },
        { kind: 'miss',   desc: 'You overreach or miscalculate. Pay the price.' },
      ],
    },
    {
      name: 'Gather Information',
      trigger: 'When you <strong>search for clues, follow a trail, or get the truth from someone</strong>, roll +wits.',
      outcomes: [
        { kind: 'strong', desc: 'You learn something useful and may ask the GM a question.' },
        { kind: 'weak',   desc: 'You learn something, but it is partial or complicates things.' },
        { kind: 'miss',   desc: 'The trail goes cold or leads you astray. Pay the price.' },
      ],
    },
    {
      name: 'Heal',
      trigger: 'When you <strong>treat a wound, sickness, or affliction</strong>, roll +wits (with herblore) or +heart (with care).',
      outcomes: [
        { kind: 'strong', desc: 'They recover +2 health.' },
        { kind: 'weak',   desc: 'They recover +1 health; the trouble lingers.' },
        { kind: 'miss',   desc: 'You misread the harm. Pay the price.' },
      ],
    },
    {
      name: 'Make Camp',
      trigger: 'When you <strong>settle in for a night\'s rest in the wild</strong>, choose two: prepare, rest, relax, recoup, or partake.',
      outcomes: [
        { kind: 'strong', desc: 'Take both effects fully.' },
        { kind: 'weak',   desc: 'Take one effect fully; the second is diminished.' },
        { kind: 'miss',   desc: 'The night is interrupted. Pay the price.' },
      ],
    },
  ],
  Relationship: [
    {
      name: 'Forge a Bond',
      trigger: 'When you <strong>commit to a relationship with a person, community, or place</strong>, roll +heart.',
      outcomes: [
        { kind: 'strong', desc: 'They accept. Mark the bond. +1 spirit.' },
        { kind: 'weak',   desc: 'They accept, but on a condition.' },
        { kind: 'miss',   desc: 'They turn from you. Pay the price.' },
      ],
    },
    {
      name: 'Compel',
      trigger: 'When you <strong>try to influence someone to act</strong>, decide your tactic: charm, bargain, threaten — then roll +stat.',
      outcomes: [
        { kind: 'strong', desc: 'They agree, and mean it.' },
        { kind: 'weak',   desc: 'They agree, but want something in return.' },
        { kind: 'miss',   desc: 'They refuse, and remember.' },
      ],
    },
    {
      name: 'Sojourn',
      trigger: 'When you <strong>spend time recovering in a community where you have a bond</strong>, roll +heart and choose a recovery: clear a condition, recover health, spirit, or supply, or hear a rumor.',
      outcomes: [
        { kind: 'strong', desc: 'Take two recoveries.' },
        { kind: 'weak',   desc: 'Take one recovery.' },
        { kind: 'miss',   desc: 'The town turns cold. Pay the price.' },
      ],
    },
  ],
  Combat: [
    {
      name: 'Enter the Fray',
      trigger: 'When you <strong>engage an enemy in combat</strong>, decide your initial stance — controlled or in the thick — and roll +stat.',
      outcomes: [
        { kind: 'strong', desc: 'You seize initiative. Take +2 momentum.' },
        { kind: 'weak',   desc: 'You are pressed. +1 momentum, but the fight starts hard.' },
        { kind: 'miss',   desc: 'You are caught flat-footed. Pay the price.' },
      ],
    },
    {
      name: 'Strike',
      trigger: 'When you <strong>attack with deadly intent while in control</strong>, roll +iron or another stat that fits.',
      outcomes: [
        { kind: 'strong', desc: 'You harm your foe and may inflict +1 progress.' },
        { kind: 'weak',   desc: 'You connect, but they answer. Pay the price.' },
        { kind: 'miss',   desc: 'You miss. They retaliate. Pay the price.' },
      ],
    },
  ],
  Suffer: [
    {
      name: 'Endure Harm',
      trigger: 'When you <strong>suffer physical injury</strong>, lose 1 health per harm and roll +iron (or +health if dying).',
      outcomes: [
        { kind: 'strong', desc: 'You shrug it off. +1 momentum.' },
        { kind: 'weak',   desc: 'You press on, shaken.' },
        { kind: 'miss',   desc: 'It is worse than it looked. Pay the price.' },
      ],
    },
    {
      name: 'Endure Stress',
      trigger: 'When you <strong>face a shock to your sense of self</strong>, lose 1 spirit per stress and roll +heart (or +spirit if despairing).',
      outcomes: [
        { kind: 'strong', desc: 'You hold yourself together.' },
        { kind: 'weak',   desc: 'You carry on, but something stays cracked.' },
        { kind: 'miss',   desc: 'You are unmoored. Pay the price.' },
      ],
    },
  ],
  Quest: [
    {
      name: 'Swear an Iron Vow',
      trigger: 'When you <strong>swear upon iron to undertake a quest</strong>, name the vow and the rank, and roll +heart.',
      outcomes: [
        { kind: 'strong', desc: 'You are emboldened. +2 momentum, and the path is clear (for now).' },
        { kind: 'weak',   desc: 'You are emboldened, but the road is uncertain. +1 momentum.' },
        { kind: 'miss',   desc: 'Doubt walks with you. Pay the price.' },
      ],
    },
    {
      name: 'Reach a Milestone',
      trigger: 'When you <strong>make meaningful progress on a vow</strong>, mark progress on its track per its rank.',
      outcomes: [
        { kind: 'strong', desc: 'Mark progress and continue forward.' },
        { kind: 'weak',   desc: '—' },
        { kind: 'miss',   desc: '—' },
      ],
    },
    {
      name: 'Fulfill Your Vow',
      trigger: 'When you <strong>have reached the end of your quest</strong>, roll the progress dice against the challenge dice.',
      outcomes: [
        { kind: 'strong', desc: 'The vow is fulfilled. Mark the deed.' },
        { kind: 'weak',   desc: 'It is fulfilled, but at a cost or with loose ends.' },
        { kind: 'miss',   desc: 'You have not yet earned this ending. Press on, or set it aside.' },
      ],
    },
  ],
  Fate: [
    {
      name: 'Pay the Price',
      trigger: 'When you <strong>suffer a consequence</strong>, the GM (or the oracle) chooses or rolls. The price is paid in the fiction.',
      outcomes: [
        { kind: 'strong', desc: '—' },
        { kind: 'weak',   desc: '—' },
        { kind: 'miss',   desc: '—' },
      ],
    },
    {
      name: 'Ask the Oracle',
      trigger: 'When you <strong>want to know what is true in the moment of uncertainty</strong>, frame a yes-or-no question and roll the oracle.',
      outcomes: [
        { kind: 'strong', desc: 'Yes (or an unequivocal answer).' },
        { kind: 'weak',   desc: 'Yes, but / No, but — the answer comes with a twist.' },
        { kind: 'miss',   desc: 'No (or a hard reversal).' },
      ],
    },
  ],
}

function renderMoveCard(m) {
  const outcomes = m.outcomes.filter(o => o.desc && o.desc !== '—')
  return `
    <article class="move-card">
      <div class="move-head">
        <h3 class="move-name">${esc(m.name)}</h3>
        <span class="move-cat">${esc(m.cat)}</span>
      </div>
      <p class="move-trigger">${m.trigger}</p>
      <div class="move-outcomes">
        ${outcomes.map(o => `
          <div class="move-outcome ${o.kind}">
            <span class="lab">${o.kind === 'strong' ? 'Strong Hit' : o.kind === 'weak' ? 'Weak Hit' : 'Miss'}</span>
            <span class="desc">${esc(o.desc)}</span>
          </div>
        `).join('')}
      </div>
    </article>
  `
}

function renderGrid(container, moves) {
  container.innerHTML = moves.map(m => renderMoveCard(m)).join('')
}

export function initMoves() {
  const page = document.getElementById('page-moves')
  const cats = ['All', ...Object.keys(MOVES_DATA)]
  const allMoves = Object.entries(MOVES_DATA).flatMap(([cat, list]) =>
    list.map(m => ({ ...m, cat }))
  )
  let activeCat = 'All'

  page.innerHTML = `
    <div class="scroll-wrap">
      <div class="page-eyebrow">A Quick Reference</div>
      <h1 class="page-title">The Moves</h1>
      <div class="page-sub">what she can do</div>

      <div class="bot-divider"><span class="bot-divider-glyph">✦ ☾ ✦</span></div>

      <div class="moves-search">
        <span class="search-glyph">⌕</span>
        <input id="movesSearch" type="text" placeholder="search moves — face danger, heal, swear…" />
      </div>

      <div class="moves-tabs">
        ${cats.map(c => `<button class="move-tab ${c === activeCat ? 'active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}
      </div>

      <div class="moves-grid" id="movesGrid"></div>
    </div>
  `

  const grid = document.getElementById('movesGrid')
  const searchInput = document.getElementById('movesSearch')

  renderGrid(grid, allMoves)

  page.querySelectorAll('.move-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCat = btn.dataset.cat
      page.querySelectorAll('.move-tab').forEach(b => b.classList.toggle('active', b === btn))
      searchInput.value = ''
      const filtered = activeCat === 'All' ? allMoves : allMoves.filter(m => m.cat === activeCat)
      renderGrid(grid, filtered)
    })
  })

  searchInput.addEventListener('input', e => {
    const q = e.target.value.toLowerCase().trim()
    if (q) {
      const list = allMoves.filter(m =>
        m.name.toLowerCase().includes(q) || m.trigger.toLowerCase().includes(q)
      )
      renderGrid(grid, list)
    } else {
      const filtered = activeCat === 'All' ? allMoves : allMoves.filter(m => m.cat === activeCat)
      renderGrid(grid, filtered)
    }
  })
}
