(() => {
  'use strict';
  document.getElementById('studio-form').addEventListener('submit', e => {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    document.getElementById('studio-form-note').textContent = 'Looks good. Validation passed locally; no data was sent or saved.';
    window.Q.toast('Validation passed. This component does not submit data.');
  });
})();
