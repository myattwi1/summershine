// Before/After drag slider
document.querySelectorAll('.compare-wrapper').forEach(wrapper => {
  const after = wrapper.querySelector('.compare-after');
  const handle = wrapper.querySelector('.compare-handle');
  const range = wrapper.querySelector('.compare-range');

  function setPosition(pct) {
    after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left = `${pct}%`;
  }

  setPosition(50);

  range.addEventListener('input', () => setPosition(Number(range.value)));
});
