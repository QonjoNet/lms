/* Shared, dependency-free UI and navigation. No credentials or session tokens. */
(() => {
  'use strict';
  const scriptURL = document.currentScript.src;
  const root = new URL('../../', scriptURL);
  const config = window.QONJO_CONFIG;
  const html = document.documentElement;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const icon = (name, cls = '') => `<svg class="icon ${esc(cls)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${window.QONJO_ICONS[name] || window.QONJO_ICONS.spark}</svg>`;
  const path = value => new URL(value, root).href;
  const production = config.productionHosts.includes(location.hostname) && config.routing !== 'local';
  const serviceURL = service => service === 'learn' ? 'https://learn.qonjo.net/login' : production ? config.services[service].origin : path(`${service}/index.html`);
  const homeURL = () => production ? config.marketingOrigin : path('index.html');
  const demoURL = service => path(`portals/${service}.html`);
  const read = (key, fallback = null) => { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch { /* private browser / file mode */ } };
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let priorFocus = null;
  let toastTimer;
  const dialog = document.getElementById('global-dialog');
  const dialogContent = document.getElementById('dialog-content');
  function toast(message) {
    const el = document.getElementById('toast');
    if (!el) return;
    clearTimeout(toastTimer); el.textContent = message; el.classList.add('show');
    toastTimer = setTimeout(() => el.classList.remove('show'), 4200);
  }
  function modal(content) {
    if (!dialog || !dialogContent) return;
    priorFocus = document.activeElement;
    dialogContent.innerHTML = content; // Callers must escape all non-static text.
    if (!dialog.open) dialog.showModal();
  }
  function closeModal() { if (dialog?.open) dialog.close(); }
  if (dialog) {
    dialog.querySelector('[data-close-dialog]').addEventListener('click', closeModal);
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeModal();
    });
    dialog.addEventListener('close', () => { if (priorFocus?.isConnected) priorFocus.focus(); });
  }
  function setTheme(theme) {
    html.dataset.theme = theme === 'dark' ? 'dark' : 'light';
    write('qonjo.theme', html.dataset.theme);
    const dark = html.dataset.theme === 'dark';
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.innerHTML = icon(dark ? 'sun' : 'moon');
      btn.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
    });
    document.querySelectorAll('[data-brand-logo]').forEach(img => {
      const reverse = img.dataset.reverse === 'true' || dark;
      img.src = path(`static/brand/${reverse ? 'logo-reverse.svg' : 'logo.svg'}`);
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#0B132B' : '#FFFFFF';
  }
  let userMotion = read('qonjo.motion', 'active');
  function paused() { return media.matches || userMotion === 'paused'; }
  function updateMotion() {
    const isPaused = paused();
    html.dataset.motion = isPaused ? 'paused' : 'active';
    document.querySelectorAll('.motion-toggle').forEach(btn => {
      btn.innerHTML = icon(isPaused ? 'play' : 'pause') + (media.matches ? 'Reduced motion' : isPaused ? 'Resume motion' : 'Pause motion');
      btn.setAttribute('aria-pressed', String(isPaused));
      if (media.matches) btn.setAttribute('title', 'Reduced motion follows your device preference.');
    });
    const status = document.getElementById('motion-preference');
    if (status) status.textContent = media.matches ? 'Your device requests reduced motion. That preference is respected.' : isPaused ? 'Non-essential movement is paused.' : 'Ambient movement is enabled. You remain in control.';
    if (isPaused) document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
  }
  function workspaces() {
    modal(`<div class="eyebrow">A good place to begin</div><h2 id="dialog-title">Where are we heading?</h2><p>Choose the space for the work you have in mind.</p>${['assets','learn'].map(s => `<a class="dialog-workspace" href="${serviceURL(s)}"><span class="square-icon ${s === 'learn' ? 'cyan' : ''}">${icon(s === 'assets' ? 'box' : 'book')}</span><div><h3>Qonjo ${s === 'assets' ? 'Assets' : 'Learn'}</h3><p>${s}.qonjo.net</p></div>${icon('arrow')}</a>`).join('')}<p class="inline-note" style="margin-top:20px">${config.mode === 'demo' ? 'Preview mode: explore each entry page and its sample workspace. Real authentication is not connected.' : 'Your organization determines the available sign-in methods.'}</p>`);
  }
  function support() {
    const email = config.supportEmail;
    const valid = typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !/[<>"']/.test(email);
    modal(`<div class="eyebrow">A little help</div><h2 id="dialog-title">Let’s find the right way in.</h2><p>Your workspace administrator can confirm your organization code, enabled sign-in method and portal access.</p>${valid ? `<a class="btn btn-primary" href="mailto:${esc(email)}">Contact the Qonjo team ${icon('mail')}</a>` : '<div class="inline-note">The team contact address has not been configured in this preview. Your administrator can add the verified address in <code>static/js/config.js</code>.</div>'}<div class="dialog-actions"><button class="btn btn-outline" data-open-workspaces>Choose another workspace ${icon('grid')}</button></div>`);
  }
  /** Public navigation validation is a guardrail, NOT access control. The target app
   * must authenticate, authorize and validate its own redirect URIs server-side. */
  function safeStartURL(value) {
    if (typeof value !== 'string' || !value) return null;
    try {
      const u = new URL(value);
      if (u.protocol !== 'https:' || u.username || u.password || u.hash) return null;
      if (!config.allowedRedirectOrigins.includes(u.origin)) return null;
      return u.href;
    } catch { return null; }
  }
  async function copy(value) {
    try {
      if (!navigator.clipboard?.writeText || !window.isSecureContext) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(value); toast(`Copied ${value.length < 50 ? value : 'to your clipboard'}`);
    } catch {
      modal(`<div class="eyebrow">Copy this value</div><h2 id="dialog-title">Ready to reuse.</h2><p>Your browser requires a secure context for automatic clipboard access. Select and copy the text below.</p><textarea readonly rows="4" aria-label="Value to copy">${esc(value)}</textarea>`);
      dialogContent.querySelector('textarea').select();
    }
  }
  window.Q = { config, root, path, serviceURL, homeURL, demoURL, icon, esc, toast, modal, closeModal, safeStartURL, copy, paused };
  setTheme(read('qonjo.theme', 'light'));
  updateMotion();
  media.addEventListener?.('change', updateMotion);
  document.querySelectorAll('[data-home]').forEach(a => a.href = homeURL());
  document.querySelectorAll('[data-service]').forEach(a => a.href = serviceURL(a.dataset.service));
  document.querySelectorAll('[data-demo]').forEach(a => a.href = demoURL(a.dataset.demo));
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = String(new Date().getFullYear()));
  document.addEventListener('click', event => {
    const el = event.target.closest('button,a'); if (!el) return;
    if (el.matches('.theme-toggle')) setTheme(html.dataset.theme === 'dark' ? 'light' : 'dark');
    if (el.matches('[data-open-workspaces]')) { event.preventDefault(); workspaces(); }
    if (el.matches('[data-help]')) { event.preventDefault(); support(); }
    if (el.matches('.motion-toggle')) {
      if (media.matches) { toast('Your device’s reduced-motion preference is active.'); return; }
      userMotion = paused() ? 'active' : 'paused'; write('qonjo.motion', userMotion); updateMotion();
    }
    if (el.hasAttribute('data-toast')) toast(el.dataset.toast);
    if (el.hasAttribute('data-copy')) copy(el.dataset.copy);
  });
  const menu = document.querySelector('.menu-toggle');
  const mobile = document.getElementById('mobile-nav');
  if (menu && mobile) {
    function closeMenu() { mobile.hidden = true; menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open navigation'); menu.innerHTML = icon('menu'); }
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') === 'true';
      mobile.hidden = open; menu.setAttribute('aria-expanded', String(!open)); menu.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation'); menu.innerHTML = icon(open ? 'menu' : 'close');
    });
    mobile.addEventListener('click', e => { if (e.target.closest('a,button')) closeMenu(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !mobile.hidden) { closeMenu(); menu.focus(); } });
  }
  const reveals = document.querySelectorAll('.reveal');
  if (!paused() && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .09 });
    reveals.forEach(el => { el.classList.add('is-ready'); observer.observe(el); });
  }
})();
