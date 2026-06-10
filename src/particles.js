export function initParticles() {
  const host = document.getElementById('particles')
  const count = 18

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div')
    p.className = 'particle'
    p.style.left = `${Math.random() * 100}%`
    p.style.bottom = `${-10 - Math.random() * 20}px`
    p.style.setProperty('--dx', `${(Math.random() - 0.5) * 80}px`)
    const dur = 12 + Math.random() * 14
    p.style.animationDuration = `${dur}s`
    p.style.animationDelay = `${Math.random() * dur}s`
    p.style.opacity = (0.3 + Math.random() * 0.5).toString()
    host.appendChild(p)
  }
}
