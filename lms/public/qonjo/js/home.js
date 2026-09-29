(() => {
  'use strict';
  const { icon, modal, serviceURL, config, path } = window.Q;
  // Same static folder can be served at all three hosts. Nginx/server rewrites are
  // preferred; this fallback supports static hosts without host-based rewrites.
  const hostService = location.hostname === 'assets.qonjo.net' ? 'assets' : location.hostname === 'learn.qonjo.net' ? 'learn' : null;
  if (hostService && config.routing !== 'local') { location.replace(path(`${hostService}/index.html`)); return; }
  const tabs = [...document.querySelectorAll('[data-preview-tab]')];
  function selectTab(id) {
    tabs.forEach(tab => {
      const selected = tab.dataset.previewTab === id;
      tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
      document.getElementById(`preview-${tab.dataset.previewTab}`).hidden = !selected;
    });
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab.dataset.previewTab));
    tab.addEventListener('keydown', e => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
      e.preventDefault();
      const next = e.key === 'Home' ? tabs[0] : e.key === 'End' ? tabs.at(-1) : tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      selectTab(next.dataset.previewTab); next.focus();
    });
  });
  document.querySelector('[data-walkthrough]').addEventListener('click', () => {
    modal(`<div class="eyebrow">The Qonjo flow</div><h2 id="dialog-title">From hello to getting things done.</h2><p>A familiar entry point brings the whole experience together.</p><div class="principle"><span>01</span><div><h4>Choose your workspace.</h4><p>Assets for your operations. Learn for your next step.</p></div></div><div class="principle"><span>02</span><div><h4>Use your organization’s sign-in.</h4><p>The configured identity provider handles verification.</p></div></div><div class="principle"><span>03</span><div><h4>Land where you need to be.</h4><p>Your actual application completes authentication and opens its workspace.</p></div></div><div class="dialog-actions"><a class="btn btn-primary" href="${serviceURL('assets')}">Explore Assets ${icon('arrow')}</a><a class="btn btn-outline" href="${serviceURL('learn')}">Explore Learn ${icon('arrow')}</a></div><p class="inline-note" style="margin-top:20px">This website package demonstrates the experience; no identity provider is connected by default.</p>`);
  });
  const products = {
    warehouse: ['Warehouse', 'Stock movements, locations and a clearer view of inventory.', 'warehouse'],
    fleet: ['Fleet', 'Vehicle records, assignments and everyday fleet operations.', 'fleet'],
    clearance: ['Clearance', 'A considered path through approvals and staff handovers.', 'clipboard'],
    forms: ['Forms', 'Structured data collection, surveys and useful records.', 'chart']
  };
  document.querySelectorAll('[data-product]').forEach(btn => btn.addEventListener('click', () => {
    const [name, text, glyph] = products[btn.dataset.product];
    modal(`<div class="eyebrow">The wider Qonjo portfolio</div><span class="square-icon">${icon(glyph)}</span><h2 id="dialog-title">Qonjo ${name}</h2><p>${text}</p><div class="inline-note">Portfolio direction only. This package includes interactive entry pages for Assets and Learn; a ${name.toLowerCase()} application is not supplied.</div><div class="dialog-actions"><button class="btn btn-primary" data-open-workspaces>Explore the included workspaces ${icon('arrow')}</button></div>`);
  }));
})();
