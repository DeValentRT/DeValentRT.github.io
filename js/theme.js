// Modo oscuro: alterna el atributo data-theme en <html> (que es lo
// que css/theme-dark.css usa para redefinir las variables de color)
// y recuerda la preferencia en localStorage. También cambia el ícono
// del botón entre luna (modo claro, invita a pasar a oscuro) y sol
// (modo oscuro, invita a volver a claro).

window.App = window.App || {};

(function (App) {
  const STORAGE_KEY = 'theme';
  const themeToggleBtn = document.getElementById('themeToggle');
  const root = document.documentElement;

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      themeToggleBtn.classList.add('active');
      themeToggleBtn.innerHTML = App.icons.icon('sun');
      themeToggleBtn.title = 'Cambiar a modo claro';
    } else {
      root.removeAttribute('data-theme');
      themeToggleBtn.classList.remove('active');
      themeToggleBtn.innerHTML = App.icons.icon('moon');
      themeToggleBtn.title = 'Cambiar a modo oscuro';
    }
  }

  function getSavedTheme() {
    return localStorage.getItem(STORAGE_KEY);
  }

  function initTheme() {
    const saved = getSavedTheme();
    applyTheme(saved === 'dark' ? 'dark' : 'light');
  }

  themeToggleBtn.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  });

  initTheme();

  App.theme = { applyTheme };
})(window.App);
