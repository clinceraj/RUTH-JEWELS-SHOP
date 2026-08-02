(() => {
  let installPrompt = null;
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  function installButton() {
    return document.querySelector('[data-install-owner-app]');
  }

  function updateInstallButton() {
    const button = installButton();
    if (!button) return;
    if (isStandalone()) {
      if (!button.hidden) button.hidden = true;
      return;
    }
    if (button.hidden) button.hidden = false;
    const label = isIos ? 'Add to home screen' : 'Install app';
    if (button.textContent !== label) button.textContent = label;
  }

  async function installOwnerApp() {
    if (isStandalone()) return;
    if (installPrompt) {
      installPrompt.prompt();
      const result = await installPrompt.userChoice;
      installPrompt = null;
      window.RuthJewelsStore?.showToast(result.outcome === 'accepted' ? 'The owner app is installing.' : 'You can install it whenever you are ready.');
      updateInstallButton();
      return;
    }
    const help = isIos
      ? 'Tap Share, then choose Add to Home Screen.'
      : 'Open your browser menu and choose Install app or Add to Home screen.';
    window.RuthJewelsStore?.showToast(help);
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    updateInstallButton();
  });

  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    updateInstallButton();
  });

  document.addEventListener('click', event => {
    if (event.target.closest('[data-install-owner-app]')) installOwnerApp();
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./owner-app-sw.js').catch(() => {}));
  }

  const dashboardRoot = document.querySelector('[data-admin-root]');
  if (dashboardRoot) new MutationObserver(updateInstallButton).observe(dashboardRoot, { childList:true, subtree:true });
  updateInstallButton();
})();

