// Live estimate calculator
const PRICE_PER_ITEM = 5;

const panesInput  = document.getElementById('windowPanes');
const screensInput = document.getElementById('screens');
const totalEl     = document.getElementById('totalAmount');
const breakdownEl = document.getElementById('breakdown');
const bookLink    = document.getElementById('bookFromEstimate');

function calcTotal() {
  const p = Math.max(0, parseInt(panesInput.value)   || 0);
  const s = Math.max(0, parseInt(screensInput.value) || 0);
  const total = (p + s) * PRICE_PER_ITEM;
  totalEl.textContent = `$${total}`;
  const parts = [];
  if (p) parts.push(`${p} pane${p !== 1 ? 's' : ''} ($${p * PRICE_PER_ITEM})`);
  if (s) parts.push(`${s} screen${s !== 1 ? 's' : ''} ($${s * PRICE_PER_ITEM})`);
  breakdownEl.textContent = parts.length ? parts.join(' + ') : '\u00a0';

  // Pass estimate to booking page via sessionStorage
  sessionStorage.setItem('summershine_estimate', JSON.stringify({ panes: p, screens: s, total }));
}

[panesInput, screensInput].forEach(el => el.addEventListener('input', calcTotal));

// Qty buttons
document.querySelectorAll('.qty-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    const val = parseInt(target.value) || 0;
    target.value = btn.dataset.action === 'inc' ? val + 1 : Math.max(0, val - 1);
    calcTotal();
  });
});

calcTotal();
