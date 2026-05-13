export function initNav() {
  const hamburger = document.getElementById('hamburger')
  const navPanel  = document.getElementById('navPanel')
  const overlay   = document.getElementById('navOverlay')
  const links     = navPanel.querySelectorAll('a[data-page]')

  function openNav()  { navPanel.classList.add('open'); overlay.classList.add('active'); hamburger.classList.add('open') }
  function closeNav() { navPanel.classList.remove('open'); overlay.classList.remove('active'); hamburger.classList.remove('open') }

  hamburger.addEventListener('click', () => navPanel.classList.contains('open') ? closeNav() : openNav())
  overlay.addEventListener('click', closeNav)

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault()
      const page = link.dataset.page
      links.forEach(l => l.classList.remove('active'))
      link.classList.add('active')
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'))
      document.getElementById(`page-${page}`).classList.add('active')
      closeNav()
    })
  })
}
