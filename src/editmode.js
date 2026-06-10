let _key = sessionStorage.getItem('moss_edit_key') || null

export function isEditMode() { return !!_key }
export function getApiKey()  { return _key }

function activate(key) {
  _key = key
  sessionStorage.setItem('moss_edit_key', key)
  document.body.classList.add('edit-mode')
  updateToggle()
}

function deactivate() {
  _key = null
  sessionStorage.removeItem('moss_edit_key')
  document.body.classList.remove('edit-mode')
  updateToggle()
}

function updateToggle() {
  const btn = document.getElementById('editModeToggle')
  if (!btn) return
  btn.title = _key ? 'Exit edit mode' : 'Enter edit mode'
  btn.classList.toggle('active', !!_key)
}

function openPrompt() {
  const existing = document.getElementById('editKeyModal')
  if (existing) { existing.remove(); return }

  const modal = document.createElement('div')
  modal.id = 'editKeyModal'
  modal.innerHTML = `
    <div class="ekm-backdrop"></div>
    <div class="ekm-box">
      <div class="ekm-title">${_key ? 'Edit Mode' : 'Enter the key'}</div>
      ${_key
        ? `<p class="ekm-note">Edit mode is active.</p>
           <button class="ekm-btn ekm-danger" id="ekmDeactivate">Leave edit mode</button>
           <button class="ekm-btn ekm-ghost" id="ekmCancel">Cancel</button>`
        : `<input class="ekm-input" id="ekmInput" type="password" placeholder="API key…" autocomplete="off" />
           <button class="ekm-btn ekm-primary" id="ekmConfirm">Unlock</button>
           <button class="ekm-btn ekm-ghost" id="ekmCancel">Cancel</button>`
      }
    </div>
  `
  document.body.appendChild(modal)

  const close = () => modal.remove()
  modal.querySelector('.ekm-backdrop').addEventListener('click', close)
  modal.querySelector('#ekmCancel').addEventListener('click', close)

  if (_key) {
    modal.querySelector('#ekmDeactivate').addEventListener('click', () => { deactivate(); close() })
  } else {
    const input = modal.querySelector('#ekmInput')
    input.focus()
    const confirm = () => {
      const val = input.value.trim()
      if (val) { activate(val); close() }
    }
    modal.querySelector('#ekmConfirm').addEventListener('click', confirm)
    input.addEventListener('keydown', e => { if (e.key === 'Enter') confirm() })
  }
}

export function initEditMode() {
  if (_key) document.body.classList.add('edit-mode')

  // Hidden toggle button in nav footer
  const btn = document.createElement('button')
  btn.id = 'editModeToggle'
  btn.className = 'edit-mode-toggle'
  btn.title = _key ? 'Exit edit mode' : 'Enter edit mode'
  btn.textContent = '⚿'
  if (_key) btn.classList.add('active')
  btn.addEventListener('click', openPrompt)
  const footer = document.querySelector('.nav-footer')
  if (footer) footer.prepend(btn)

  // Triple-click on nav title
  let clicks = 0, clickTimer = null
  const navTitle = document.querySelector('.nav-title')
  if (navTitle) {
    navTitle.addEventListener('click', () => {
      clicks++
      clearTimeout(clickTimer)
      clickTimer = setTimeout(() => {
        if (clicks >= 3) openPrompt()
        clicks = 0
      }, 400)
    })
  }

  // Shift+M anywhere
  document.addEventListener('keydown', e => {
    if (e.shiftKey && e.key === 'M' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
      openPrompt()
    }
  })
}
