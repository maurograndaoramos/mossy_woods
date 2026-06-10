import './style.css'
import { initParticles } from './particles.js'
import { initNav } from './nav.js'
import { initHome } from './home.js'
import { initVows } from './vows.js'
import { initMoves } from './moves.js'
import { initLore } from './lore.js'
import { initWiki } from './wiki.js'
import { initTruths } from './truths.js'

const bgEl = document.querySelector('.bg-image')
if (bgEl) bgEl.style.backgroundImage = `url('${import.meta.env.BASE_URL}bg.webp')`

function initStars() {
  const host = document.getElementById('stars')
  if (!host) return
  for (let i = 0; i < 60; i++) {
    const s = document.createElement('div')
    s.className = 'star'
    const size = Math.random() < 0.85 ? 1 : 2
    s.style.width = s.style.height = `${size}px`
    s.style.left = `${Math.random() * 100}%`
    s.style.top = `${Math.random() * 70}%`
    const dur = 2 + Math.random() * 5
    s.style.animationDuration = `${dur}s`
    s.style.animationDelay = `${Math.random() * 5}s`
    s.style.setProperty('--max-op', (0.3 + Math.random() * 0.6).toString())
    host.appendChild(s)
  }
}

function initModal() {
  const ov = document.getElementById('modalOverlay')
  document.getElementById('modalClose').addEventListener('click', () => ov.classList.remove('active'))
  ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('active') })
  document.addEventListener('keydown', e => { if (e.key === 'Escape') ov.classList.remove('active') })
}

initStars()
initParticles()
initNav()
initModal()
initHome()
initVows()
initMoves()
initLore()
initWiki()

const token = new URLSearchParams(window.location.search).get('token')
if (token) initTruths(token)
