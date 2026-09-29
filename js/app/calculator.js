// A small floating basic calculator, available on every page (mounted once by
// nav.js). Deliberately not a full-screen overlay — it's a compact panel
// anchored to a toggle button in the corner, so students can check their work
// without losing their place on the page.
const WIDGET_ID = 'calculator-widget';

const KEY_ROWS = [
  [
    { label: 'C', action: 'clear', variant: 'op' },
    { label: '⌫', action: 'backspace', variant: 'op', ariaLabel: 'Backspace' },
    { label: '%', action: 'percent', variant: 'op' },
    { label: '÷', op: 'divide', variant: 'op' },
  ],
  [
    { label: '7', digit: '7' },
    { label: '8', digit: '8' },
    { label: '9', digit: '9' },
    { label: '×', op: 'multiply', variant: 'op' },
  ],
  [
    { label: '4', digit: '4' },
    { label: '5', digit: '5' },
    { label: '6', digit: '6' },
    { label: '−', op: 'subtract', variant: 'op' },
  ],
  [
    { label: '1', digit: '1' },
    { label: '2', digit: '2' },
    { label: '3', digit: '3' },
    { label: '+', op: 'add', variant: 'op' },
  ],
  [
    { label: '±', action: 'toggleSign', variant: 'op', ariaLabel: 'Toggle sign' },
    { label: '0', digit: '0' },
    { label: '.', action: 'decimal' },
    { label: '=', action: 'equals', variant: 'equals' },
  ],
];

function formatDisplay(value) {
  if (!Number.isFinite(value)) return 'Error';
  // Round away long floating-point tails (e.g. 0.1 + 0.2) without truncating real precision.
  const rounded = Math.round(value * 1e9) / 1e9;
  return String(rounded);
}

function compute(a, b, op) {
  switch (op) {
    case 'add':
      return a + b;
    case 'subtract':
      return a - b;
    case 'multiply':
      return a * b;
    case 'divide':
      return b === 0 ? NaN : a / b;
    default:
      return b;
  }
}

function buildKeysHtml() {
  return KEY_ROWS.map((row) =>
    row
      .map((key) => {
        const classes = ['calculator-key'];
        if (key.variant === 'op') classes.push('calculator-key-op');
        if (key.variant === 'equals') classes.push('calculator-key-equals');
        const attrs = [
          key.digit !== undefined ? `data-digit="${key.digit}"` : '',
          key.op ? `data-op="${key.op}"` : '',
          key.action ? `data-action="${key.action}"` : '',
          key.ariaLabel ? `aria-label="${key.ariaLabel}"` : '',
        ]
          .filter(Boolean)
          .join(' ');
        return `<button type="button" class="${classes.join(' ')}" ${attrs}>${key.label}</button>`;
      })
      .join('')
  ).join('');
}

export function mountCalculator() {
  if (document.getElementById(WIDGET_ID)) return;

  const state = { display: '0', pending: null, operator: null, overwrite: true };

  const root = document.createElement('div');
  root.id = WIDGET_ID;
  root.className = 'calculator-widget screen-only';

  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'calculator-toggle';
  toggleBtn.setAttribute('aria-label', 'Open calculator');
  toggleBtn.setAttribute('aria-expanded', 'false');
  toggleBtn.textContent = '\u{1F9EE}';

  const panel = document.createElement('div');
  panel.className = 'calculator-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <div class="calculator-header">
      <span>Calculator</span>
      <button type="button" class="calculator-close" aria-label="Close calculator">&times;</button>
    </div>
    <div class="calculator-display" aria-live="polite">0</div>
    <div class="calculator-keys">${buildKeysHtml()}</div>
  `;

  root.append(toggleBtn, panel);
  document.body.appendChild(root);

  const displayEl = panel.querySelector('.calculator-display');

  function render() {
    displayEl.textContent = state.display;
  }

  function inputDigit(digit) {
    if (state.overwrite) {
      state.display = digit === '.' ? '0.' : digit;
      state.overwrite = false;
    } else if (digit === '.') {
      if (!state.display.includes('.')) state.display += '.';
    } else {
      state.display = state.display === '0' ? digit : state.display + digit;
    }
    render();
  }

  function applyOperator(op) {
    const current = parseFloat(state.display);
    if (state.operator && !state.overwrite) {
      state.pending = compute(state.pending, current, state.operator);
      state.display = formatDisplay(state.pending);
    } else {
      state.pending = current;
    }
    state.operator = op;
    state.overwrite = true;
    render();
  }

  function equals() {
    if (state.operator == null) return;
    const current = parseFloat(state.display);
    state.pending = compute(state.pending, current, state.operator);
    state.display = formatDisplay(state.pending);
    state.operator = null;
    state.overwrite = true;
    render();
  }

  function clear() {
    state.display = '0';
    state.pending = null;
    state.operator = null;
    state.overwrite = true;
    render();
  }

  function backspace() {
    if (state.overwrite) return;
    state.display = state.display.length > 1 ? state.display.slice(0, -1) : '0';
    if (state.display === '-') state.display = '0';
    render();
  }

  function percent() {
    state.display = formatDisplay(parseFloat(state.display) / 100);
    state.overwrite = true;
    render();
  }

  function toggleSign() {
    if (state.display === '0') return;
    state.display = state.display.startsWith('-') ? state.display.slice(1) : `-${state.display}`;
    render();
  }

  function openPanel() {
    panel.hidden = false;
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.classList.add('open');
  }

  function closePanel() {
    panel.hidden = true;
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.classList.remove('open');
  }

  toggleBtn.addEventListener('click', () => (panel.hidden ? openPanel() : closePanel()));
  panel.querySelector('.calculator-close').addEventListener('click', closePanel);

  panel.addEventListener('click', (event) => {
    const btn = event.target.closest('button');
    if (!btn) return;
    if (btn.dataset.digit !== undefined) {
      inputDigit(btn.dataset.digit);
    } else if (btn.dataset.op) {
      applyOperator(btn.dataset.op);
    } else if (btn.dataset.action === 'equals') {
      equals();
    } else if (btn.dataset.action === 'clear') {
      clear();
    } else if (btn.dataset.action === 'backspace') {
      backspace();
    } else if (btn.dataset.action === 'percent') {
      percent();
    } else if (btn.dataset.action === 'decimal') {
      inputDigit('.');
    } else if (btn.dataset.action === 'toggleSign') {
      toggleSign();
    }
  });

  render();
}
