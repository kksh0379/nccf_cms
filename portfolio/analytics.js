(function () {
  'use strict';
  var API_BASE = 'https://nccf-portfolio-analytics.onrender.com';
  if (!location.pathname.startsWith('/nccf_cms/portfolio/')) return;
  fetch(API_BASE + '/api/pageviews', {
    method: 'POST',
    mode: 'cors',
    cache: 'no-store',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: location.pathname })
  }).catch(function () {});
})();

