/* שלום כיתה א׳ – accessibility button and menu. One file for the entry page, the info pages and the course.
   The choices are kept on this device (localStorage) and applied on every page. */
(function () {
  'use strict';
  const KEY = 'kita-a11y';
  const inCourse = /\/app\//.test(location.pathname);
  const base = inCourse ? '../' : '';
  let st = {};
  try { st = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { st = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };

  const OPTS = [
    { k: 'big', t: 'הגדלת טקסט', page: true },
    { k: 'contrast', t: 'ניגודיות גבוהה' },
    { k: 'mono', t: 'גווני אפור' },
    { k: 'links', t: 'הדגשת קישורים וכפתורים' },
    { k: 'font', t: 'גופן קריא' },
    { k: 'still', t: 'עצירת אנימציות' },
    { k: 'cursor', t: 'סמן עכבר גדול' },
    { k: 'quiet', t: 'השתקת מוזיקת רקע', course: true },
  ].filter(o => (inCourse ? !o.page : !o.course));

  const css = `
#a11yBtn{position:fixed;z-index:2147483000;bottom:14px;${inCourse ? 'left' : 'right'}:14px;width:56px;height:56px;border-radius:50%;border:3px solid #fff;background:#1a4fd6;color:#fff;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.3);display:grid;place-items:center;padding:0}
#a11yBtn svg{width:34px;height:34px}
#a11yBtn:focus-visible,#a11yMenu button:focus-visible,#a11yMenu a:focus-visible{outline:4px solid #ffb300;outline-offset:3px}
#a11yMenu{position:fixed;z-index:2147483001;bottom:80px;${inCourse ? 'left' : 'right'}:14px;width:min(300px,calc(100vw - 28px));max-height:calc(100vh - 100px);overflow:auto;background:#fff;color:#1d1a26;border-radius:18px;box-shadow:0 10px 40px rgba(0,0,0,.35);padding:14px;font:16px/1.4 Rubik,Arial,sans-serif;direction:rtl;text-align:right}
#a11yMenu[hidden]{display:none}
#a11yMenu h2{margin:0 0 10px;font-size:19px}
#a11yMenu .row{display:flex;justify-content:space-between;align-items:center;gap:10px;width:100%;margin:0 0 6px;padding:10px 12px;border:2px solid #d5d0e0;border-radius:12px;background:#f7f5fb;color:#1d1a26;font:inherit;cursor:pointer;text-align:right}
#a11yMenu .row[aria-pressed="true"]{border-color:#1a4fd6;background:#e6edff;font-weight:700}
#a11yMenu .row span:last-child{font-size:14px}
#a11yMenu .foot{display:flex;justify-content:space-between;gap:10px;margin-top:10px;align-items:center}
#a11yMenu .foot a{color:#1a4fd6}
#a11yMenu .foot button{border:0;background:none;color:#a00;font:inherit;text-decoration:underline;cursor:pointer}
html.a11y-course #a11yBtn{top:6px;bottom:auto;left:10px;width:40px;height:40px;border-width:2px;box-shadow:0 2px 0 #e7d6bd}
html.a11y-course #a11yBtn svg{width:27px;height:27px}
html.a11y-course #a11yMenu{top:56px;bottom:auto;left:10px}
html.a11y-course #top{padding-left:60px!important}
html.a11y-big{font-size:118%}
html.a11y-big body{zoom:1.15}
html.a11y-page.a11y-contrast body{background:#000!important;color:#fff!important}
html.a11y-page.a11y-contrast body *:not(#a11yMenu):not(#a11yMenu *):not(#a11yBtn):not(#a11yBtn *):not(img):not(svg):not(svg *){background-color:#000!important;color:#fff!important;border-color:#fff!important;text-shadow:none!important;box-shadow:none!important}
html.a11y-page.a11y-contrast a{color:#ffeb3b!important}
html.a11y-course.a11y-contrast body>*:not(#a11yMenu):not(#a11yBtn){filter:contrast(1.5) saturate(1.25)}
html.a11y-course.a11y-contrast.a11y-mono body>*:not(#a11yMenu):not(#a11yBtn){filter:grayscale(1) contrast(1.5)}
html.a11y-mono body>*:not(#a11yMenu):not(#a11yBtn){filter:grayscale(1)}
html.a11y-links a,html.a11y-links button:not(#a11yBtn):not(#a11yMenu button){text-decoration:underline!important;outline:3px solid #ffb300!important;outline-offset:2px}
html.a11y-font body,html.a11y-font body *:not(#a11yBtn *){font-family:Arial,"Arial Hebrew",sans-serif!important;letter-spacing:.02em}
html.a11y-still *,html.a11y-still *::before,html.a11y-still *::after{animation:none!important;transition:none!important}
html.a11y-cursor,html.a11y-cursor *{cursor:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Cpath d='M4 2l0 38 10-9 7 15 7-3-7-15 14 0z' fill='%23000' stroke='%23fff' stroke-width='2.5'/%3E%3C/svg%3E") 4 2,auto!important}`;

  function apply() {
    const h = document.documentElement;
    h.classList.add(inCourse ? 'a11y-course' : 'a11y-page');
    OPTS.forEach(o => h.classList.toggle('a11y-' + o.k, !!st[o.k]));
    if (inCourse) {
      const m = document.getElementById('music');
      if (m) m.muted = !!st.quiet;
    }
  }

  function build() {
    if (document.getElementById('a11yBtn')) return;
    const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
    const btn = document.createElement('button');
    btn.id = 'a11yBtn'; btn.type = 'button';
    btn.setAttribute('aria-label', 'תפריט נגישות'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'a11yMenu');
    btn.title = 'נגישות';
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4" r="2.2" fill="currentColor"/><path d="M4 8.2c2.6.8 5.3 1.2 8 1.2s5.4-.4 8-1.2l.6 1.9c-2 .7-4.1 1.1-6.3 1.3v3.4l2.4 7.2-1.9.6-2.5-6.6h-.6l-2.5 6.6-1.9-.6 2.4-7.2v-3.4c-2.2-.2-4.3-.6-6.3-1.3z" fill="currentColor"/></svg>';
    const menu = document.createElement('div');
    menu.id = 'a11yMenu'; menu.hidden = true; menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-label', 'תפריט נגישות');
    menu.innerHTML = '<h2>נגישות</h2>' +
      OPTS.map(o => `<button type="button" class="row" data-k="${o.k}" aria-pressed="${st[o.k] ? 'true' : 'false'}"><span>${o.t}</span><span aria-hidden="true">${st[o.k] ? 'פעיל ✓' : ''}</span></button>`).join('') +
      `<div class="foot"><a href="${base}accessibility.html">הצהרת נגישות</a><button type="button" id="a11yReset">איפוס</button></div>`;
    document.body.appendChild(menu); document.body.appendChild(btn);
    const open = on => { menu.hidden = !on; btn.setAttribute('aria-expanded', on ? 'true' : 'false'); if (on) { const f = menu.querySelector('.row'); f && f.focus(); } };
    btn.addEventListener('click', e => { e.stopPropagation(); open(menu.hidden); });
    menu.addEventListener('click', e => {
      e.stopPropagation();
      const b = e.target.closest('.row');
      if (b) { const k = b.dataset.k; st[k] = !st[k]; save(); apply(); b.setAttribute('aria-pressed', st[k] ? 'true' : 'false'); b.lastElementChild.textContent = st[k] ? 'פעיל ✓' : ''; }
      if (e.target.id === 'a11yReset') { st = {}; save(); apply(); menu.querySelectorAll('.row').forEach(r => { r.setAttribute('aria-pressed', 'false'); r.lastElementChild.textContent = ''; }); }
    });
    ['pointerdown', 'touchstart', 'mousedown'].forEach(ev => [btn, menu].forEach(el => el.addEventListener(ev, e => e.stopPropagation())));
    document.addEventListener('click', () => { if (!menu.hidden) open(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { open(false); btn.focus(); } });
  }

  apply();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { build(); apply(); });
  else { build(); apply(); }
  if (inCourse) setInterval(apply, 2000);   // the course may restart the music
})();
