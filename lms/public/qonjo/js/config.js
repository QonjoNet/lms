/** QONJO public website configuration. NEVER place client secrets or tokens here.
 * mode: 'demo' shows explicit previews, not successful sign-ins.
 * mode: 'connected' uses only configured, HTTPS, origin-allowlisted initiation URLs.
 * Each URL must be an APPLICATION/BROKER login-start route that owns the OIDC/SAML
 * transaction and final destination. Do not paste a raw /authorize URL here.
 * See docs/AUTHENTICATION.md before connecting production services.
 */
window.QONJO_CONFIG = {
  mode: 'demo',
  routing: 'auto', // auto = use real service subdomains on qonjo.net; local = local routes
  marketingOrigin: 'https://qonjo.net',
  productionHosts: ['qonjo.net', 'www.qonjo.net', 'assets.qonjo.net', 'learn.qonjo.net'],
  allowedRedirectOrigins: [], // e.g. https://YOUR-APP-HOST and https://YOUR-AUTH-BROKER
  supportEmail: '', // Verified team address. Blank shows a setup-aware support message.
  allowDemoInConnectedMode: false,
  services: {
    assets: {
      name: 'Qonjo Assets', origin: 'https://assets.qonjo.net',
      login: { microsoft: '', google: '', portal: '', passkey: '', emailLink: '' },
      organizations: [] // { code: 'client-code', name: 'Client name', loginStartUrl: 'https://...' }
    },
    learn: {
      name: 'Qonjo Learn', origin: 'https://learn.qonjo.net',
      login: { microsoft: '', google: '', portal: 'https://learn.qonjo.net/login?redirect-to=/lms', passkey: '', emailLink: '' },
      organizations: []
    }
  }
};
