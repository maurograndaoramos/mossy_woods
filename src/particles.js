export function initParticles() {
  const container = document.getElementById('particles')
  const count = 28

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div')
    p.className = 'particle'
    const x = Math.random() * 100
    const duration = 12 + Math.random() * 20
    const delay = Math.random() * -30
    const drift = (Math.random() - 0.5) * 80

    p.style.cssText = `
      left: ${x}%;
      bottom: ${Math.random() * 30}%;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      --drift: ${drift}px;
      opacity: ${0.3 + Math.random() * 0.5};
      width: ${1 + Math.random() * 2}px;
      height: ${1 + Math.random() * 2}px;
    `
    container.appendChild(p)
  }
}
