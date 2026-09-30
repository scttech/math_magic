// A small popover, mounted once site-wide (like the calculator widget), that
// shows a glossary definition when any .glossary-term button is clicked.
// Uses one shared DOM node positioned near whichever term was clicked, rather
// than a per-term tooltip, since only one can be open at a time anyway.
import { getGlossaryEntry } from './glossary.js';

const WIDGET_ID = 'glossary-popover';

function positionPopover(popover, anchorEl) {
  const anchorRect = anchorEl.getBoundingClientRect();
  const popoverRect = popover.getBoundingClientRect();
  const margin = 8;

  let left = anchorRect.left + window.scrollX;
  const maxLeft = window.scrollX + document.documentElement.clientWidth - popoverRect.width - margin;
  left = Math.max(window.scrollX + margin, Math.min(left, maxLeft));

  const spaceBelow = window.innerHeight - anchorRect.bottom;
  const openAbove = spaceBelow < popoverRect.height + margin && anchorRect.top > popoverRect.height + margin;
  const top = openAbove ? anchorRect.top + window.scrollY - popoverRect.height - margin : anchorRect.bottom + window.scrollY + margin;

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}

export function mountGlossaryPopover() {
  if (document.getElementById(WIDGET_ID)) return;

  let openAnchor = null;

  const popover = document.createElement('div');
  popover.id = WIDGET_ID;
  popover.className = 'glossary-popover screen-only';
  popover.hidden = true;
  popover.setAttribute('role', 'dialog');
  popover.innerHTML = `
    <div class="glossary-popover-header">
      <span id="glossary-popover-term"></span>
      <button type="button" class="glossary-popover-close" aria-label="Close definition">&times;</button>
    </div>
    <p id="glossary-popover-definition"></p>
  `;
  document.body.appendChild(popover);

  const termEl = popover.querySelector('#glossary-popover-term');
  const definitionEl = popover.querySelector('#glossary-popover-definition');

  function closePopover() {
    popover.hidden = true;
    openAnchor = null;
  }

  function openPopover(anchorEl, key) {
    const entry = getGlossaryEntry(key);
    if (!entry) return;
    termEl.textContent = entry.term;
    definitionEl.textContent = entry.definition;
    popover.hidden = false;
    positionPopover(popover, anchorEl);
    openAnchor = anchorEl;
  }

  document.addEventListener('click', (event) => {
    const termBtn = event.target.closest('.glossary-term');
    if (termBtn) {
      if (openAnchor === termBtn) {
        closePopover();
      } else {
        openPopover(termBtn, termBtn.dataset.glossaryTerm);
      }
      return;
    }
    if (!popover.hidden && !popover.contains(event.target)) {
      closePopover();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !popover.hidden) closePopover();
  });

  window.addEventListener('resize', () => {
    if (!popover.hidden && openAnchor) positionPopover(popover, openAnchor);
  });

  popover.querySelector('.glossary-popover-close').addEventListener('click', closePopover);
}
