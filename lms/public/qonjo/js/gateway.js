/* Identity handoff UI. Does not implement or pretend to complete authentication. */
(() => {
  'use strict';
  const { config, icon, esc, modal, safeStartURL, demoURL } = window.Q;
  const id = document.body.dataset.serviceId;
  const service = config.services[id];
  const isDemo = config.mode === 'demo';
  const labels = { microsoft: 'Continue with Microsoft', google: 'Continue with Google', portal: 'Sign in on the portal', passkey: 'Use a passkey', emailLink: 'Email sign-in link' };
  const names = { microsoft: 'Microsoft work account', google: 'Google account', portal: 'Portal account', passkey: 'Passkey', emailLink: 'Email sign-in link', organization: 'Organization SSO' };
  const glyphs = { portal:'key', passkey:'fingerprint', emailLink:'mail', organization:'building' };
  const methodIcon = key => key === 'microsoft' ? '<span class="ms-logo" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' : key === 'google' ? '<span class="google-logo" aria-hidden="true">G</span>' : icon(glyphs[key] || 'key');
  const available = key => isDemo || Boolean(safeStartURL(service.login[key]));
  function button(key) { return `<button class="provider-button" data-auth="${key}">${methodIcon(key)}<span>${labels[key]}</span>${icon('arrow')}</button>`; }
  document.getElementById('provider-list').innerHTML = ['microsoft','google'].filter(available).map(button).join('');
  document.getElementById('alternate-auth').innerHTML = available('portal') ? button('portal') : '';
  const extra = ['passkey','emailLink'].filter(available);
  document.getElementById('passwordless-methods').innerHTML = extra.map(button).join('');
  document.getElementById('more-signin').hidden = extra.length === 0;
  const canDemo = isDemo || config.allowDemoInConnectedMode;
  document.getElementById('demo-entry').hidden = !canDemo;
  const organizationForm = document.getElementById('organization-form');
  const orgs = Array.isArray(service.organizations) ? service.organizations : [];
  const activeOrgs = orgs.filter(org => safeStartURL(org.loginStartUrl));
  if (!isDemo) {
    const any = ['microsoft','google','portal','passkey','emailLink'].some(available) || activeOrgs.length > 0;
    document.getElementById('auth-mode').innerHTML = icon(any ? 'shield' : 'info') + (any ? 'Sign-in continues on your configured provider.' : 'Sign-in is not configured. Please contact your administrator.');
    document.getElementById('org-hint').textContent = 'Use the organization code supplied by your administrator.';
    document.getElementById('organization-code').placeholder = 'Your organization code';
    if (!activeOrgs.length) { organizationForm.hidden = true; document.querySelector('.or-divider').hidden = true; }
  }
  if (!document.querySelector('#provider-list button') && !organizationForm.hidden) document.querySelector('.or-divider span').textContent = 'Use your organization';
  function start(key, org = null) {
    if (isDemo) {
      const method = names[key] || 'Organization SSO';
      modal(`<div class="eyebrow">Sign-in design preview</div><h2 id="dialog-title">Your way in.<br>Your ${id === 'assets' ? 'assets' : 'learning'} space.</h2><p>You selected <strong>${esc(method)}</strong>${org ? ` for <strong>${esc(org.name)}</strong>` : ''}. In a connected deployment, the next step opens your configured sign-in provider.</p><div class="handoff-steps"><span><b>1</b> ${esc(service.name)}</span>${icon('arrow')}<span><b>2</b> Identity provider</span>${icon('arrow')}<span><b>3</b> Your portal</span></div><div class="inline-note">No sign-in has happened. No password, one-time code, fingerprint or email address is collected. The next link opens fictional demo data only.</div><div class="dialog-actions"><a class="btn btn-primary" href="${demoURL(id)}">Explore sample workspace ${icon('arrow')}</a><button class="btn btn-outline" id="choose-method-again">Choose another method</button></div>`);
      document.getElementById('choose-method-again').addEventListener('click', window.Q.closeModal);
      return;
    }
    const destination = safeStartURL(org ? org.loginStartUrl : service.login[key]);
    if (!destination) {
      modal(`<div class="eyebrow">Configuration needed</div><h2 id="dialog-title">This way in isn’t connected yet.</h2><p>An administrator must configure and allowlist the approved application login-start URL. No redirect was performed.</p><button class="btn btn-primary" data-help>Contact &amp; support ${icon('arrow')}</button>`); return;
    }
    // Fixed configuration only. User input and URL returnTo/next values never alter this URL.
    location.assign(destination);
  }
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-auth]'); if (btn) start(btn.dataset.auth);
  });
  organizationForm.addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('organization-code');
    const code = input.value.trim().toLowerCase();
    const error = document.getElementById('org-error'); error.hidden = true; input.removeAttribute('aria-invalid');
    const org = isDemo && code === 'demo' ? { code:'demo', name:'Qonjo demo organization' } : activeOrgs.find(org => String(org.code).toLowerCase() === code);
    if (!org || (isDemo && code !== 'demo')) {
      error.textContent = isDemo ? 'Use “demo” to preview the organization handoff.' : 'This code does not have a configured sign-in route. Check the code with your administrator.';
      error.hidden = false; input.setAttribute('aria-invalid','true'); input.focus(); return;
    }
    start('organization', org);
  });
})();
