(() => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('isOpen');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('isOpen');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();