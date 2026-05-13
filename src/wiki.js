import { getWiki } from './api.js'

function escHtml(str = '') {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function renderWiki(container, entries, activeId) {
  const active = entries.find(e => e.id === activeId)

  container.innerHTML = `
    <div class="wiki-wrap">
      <aside class="wiki-sidebar">
        <div class="wiki-list">
          ${entries.length === 0
            ? '<p class="wiki-empty">No entries yet.</p>'
            : entries.map(e => `
              <div class="wiki-list-item${e.id === activeId ? ' active' : ''}" data-id="${e.id}">
                <span class="wiki-item-title">${e.title || 'Untitled'}</span>
                <span class="wiki-item-cat cat-${e.category.toLowerCase()}">${e.category}</span>
              </div>
            `).join('')
          }
        </div>
      </aside>

      <div class="wiki-main">
        ${!active
          ? `<div class="wiki-empty-state"><p>Select an entry to read.</p></div>`
          : `<div class="wiki-reader">
              <div class="wiki-reader-header">
                <span class="wiki-item-cat cat-${active.category.toLowerCase()}">${active.category}</span>
              </div>
              <h2 class="wiki-reader-title">${escHtml(active.title) || 'Untitled'}</h2>
              <div class="wiki-reader-body">${escHtml(active.body).replace(/\n/g, '<br/>')}</div>
            </div>`
        }
      </div>
    </div>
  `

  container.querySelectorAll('.wiki-list-item').forEach(el => {
    el.addEventListener('click', () => renderWiki(container, entries, el.dataset.id))
  })
}

export async function initWiki() {
  const container = document.getElementById('page-wiki')
  container.innerHTML = `<div class="page-loading">Loading…</div>`
  const entries = await getWiki()
  renderWiki(container, entries, entries[0]?.id || null)
}
