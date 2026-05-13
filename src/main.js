import './style.css'
import { initParticles } from './particles.js'
import { initNav } from './nav.js'
import { initHand } from './hand.js'
import { initFactions } from './factions.js'
import { initLore } from './lore.js'
import { initWiki } from './wiki.js'
import { initTruths } from './truths.js'

document.querySelector('.bg-layer').style.backgroundImage = `url('${import.meta.env.BASE_URL}bg.webp')`

initParticles()
initNav()
initHand()
initFactions()
initLore()
initWiki()

const token = new URLSearchParams(window.location.search).get('token')
if (token) initTruths(token)
