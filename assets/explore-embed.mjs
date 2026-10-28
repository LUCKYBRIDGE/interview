import {ROUTES} from './explore-state.mjs';

if (new URLSearchParams(location.search).get('embed') === '1' && window.parent !== window) {
  document.documentElement.classList.add('embedded-explore');
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !url.pathname.endsWith('/workroom.html')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    parent.postMessage({type:'discussion-activity', kind:url.hash === '#group' ? 'group' : 'personal'}, location.origin);
  }, true);
  const note = document.createElement('p');
  note.className = 'embedded-note';
  note.textContent = '이곳은 탐구 자료입니다. 기록은 옆의 활동지에 적어요. Gemini는 새 탭이나 별도 창에서 열립니다.';
  document.querySelector('main').prepend(note);
  let restoring = false;
  let timer;
  function position(restored = false) {
    if (restoring) return;
    const route = location.hash.slice(1);
    parent.postMessage({type:'discussion-explore-position', route:ROUTES.includes(route)?route:'home', y:scrollY, restored:restored === true}, location.origin);
  }
  window.addEventListener('scroll', () => {clearTimeout(timer);timer=setTimeout(position,100);}, {passive:true});
  window.addEventListener('hashchange', position);
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== parent || event.data?.type !== 'discussion-explore-restore') return;
    if (!ROUTES.includes(event.data.route)) return;
    const y = typeof event.data.y === 'number' && Number.isFinite(event.data.y) ? Math.max(0, Math.min(10000000,event.data.y)) : 0;
    restoring = true;
    if (location.hash !== '#'+event.data.route) location.hash = event.data.route;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.scrollTo({top:y,behavior:'instant'}); restoring=false; position(true);
    }));
  });
  const seen = new WeakSet();
  function addWindowActions() {
    for (const link of document.querySelectorAll('a[href^="https://gemini.google.com/"]')) {
      if (seen.has(link)) continue;
      seen.add(link);
      const button = document.createElement('button');
      button.type = 'button';button.className = 'gem-window';button.textContent = '별도 창으로 열기';
      button.setAttribute('aria-label',`${link.getAttribute('aria-label')||link.textContent.trim()} 별도 창으로 열기`);
      button.addEventListener('click', () => window.open(link.href,'_blank','popup,width=720,height=850,noopener,noreferrer'));
      link.after(button);
    }
  }
  addWindowActions();
  new MutationObserver(addWindowActions).observe(document.querySelector('main'), {childList:true,subtree:true});
}
