import { getCards } from './api.js'

function openModal(data) {
  const content = document.getElementById('modalContent')
  const overlay = document.getElementById('modalOverlay')
  content.innerHTML = `<h2>${data.name}</h2><p>${data.body}</p>`
  overlay.classList.add('active')
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active')
}

export async function initHand() {
  const bar    = document.getElementById('handBar')
  const overlay = document.getElementById('modalOverlay')

  const cards = await getCards()

  cards.forEach(data => {
    const card = document.createElement('div')
    card.className = 'card'
    card.innerHTML = `<div class="card-icon">${data.icon}</div><div class="card-name">${data.name}</div>`
    card.addEventListener('click', () => openModal(data))
    bar.appendChild(card)
  })

  document.getElementById('modalClose').addEventListener('click', closeModal)
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal() })
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal() })
}
