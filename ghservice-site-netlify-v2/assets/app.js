
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

const money = (n) => n.toLocaleString(undefined, {style:'currency', currency:'USD'});

async function loadSite(){
  const res = await fetch('/content/site.json', {cache:'no-store'});
  const site = await res.json();

  // Helpers for multi-page support
  const setText = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = v; };
  const setHref = (id, v) => { const el = document.getElementById(id); if(el) el.href = v; };

  document.title = document.title || `${site.brand.name} | Cleaning`;
  setText('brandName', site.brand.name);
  setText('tagline', site.brand.tagline);
  setHref('phoneLink', `tel:${site.brand.phone_raw}`);
  setText('phoneLink', site.brand.phone);
  setHref('emailLink', `mailto:${site.brand.email}`);
  setText('emailLink', site.brand.email);
  setHref('waLink', `https://wa.me/1${site.brand.whatsapp}`);
  setHref('waLink2', `https://wa.me/1${site.brand.whatsapp}`);

  setText('heroHeadline', site.hero.headline);
  setText('heroSub', site.hero.subheadline);
  setText('ctaPrimary', site.hero.cta_primary);
  setText('ctaSecondary', site.hero.cta_secondary);

  // Booking links
  const cal = site.booking?.calendly_url || '';
  if(cal){
    setHref('bookNow', '/book/');
    setHref('bookNow2', '/book/');
    setText('bookCtaLabel', 'View available times');
  }

  // Hours
  const hoursEl = document.getElementById('hours');
  if(hoursEl){
    hoursEl.innerHTML = site.hours.map(h => {
      const isClosed = (h.open || '').toLowerCase() === 'closed';
      return `<div class="badge"><span>•</span> ${h.day}: ${isClosed ? 'Closed' : `${h.open}–${h.close}`}</div>`;
    }).join('');
  }

  // Areas
  const areasEl = document.getElementById('areas');
  if(areasEl) areasEl.innerHTML = site.areas.map(a => `<span class="pill">${escapeHtml(a.area || a.name || a)}</span>`).join('');

  setText('guaranteeTitle', site.guarantee.title);
  setText('guaranteeText', site.guarantee.text);

  // Services
  const grid = document.getElementById('servicesGrid');
  if(grid){
    const svcRes = await fetch('/content/services/index.json', {cache:'no-store'});
    const svcs = await svcRes.json();
    grid.innerHTML = svcs.map(s => `
      <article class="card" data-anim>
        <h3>${escapeHtml(s.title)}</h3>
        <p>${escapeHtml(s.summary)}</p>
        <div class="badges">
          <a class="btn ghost" href="/services/${encodeURIComponent(s.slug)}/" aria-label="Learn about ${escapeHtml(s.title)}">Learn more</a>
          <a class="btn" href="#quote" aria-label="Quote for ${escapeHtml(s.title)}">Get quote</a>
        </div>
      </article>
    `).join('');
  }

  // Quote defaults
  const st = document.getElementById('serviceType');
  if(st){
    st.value = 'standard';
    computeQuote();
  }

  return site;
}

function escapeHtml(str){
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

function computeQuote(){
  const beds = parseInt($('#bedrooms').value || '1', 10);
  const baths = parseInt($('#bathrooms').value || '1', 10);
  const sqft = parseInt($('#sqft').value || '1200', 10);
  const type = $('#serviceType').value;
  const freq = $('#frequency').value;

  // Simple transparent pricing model (editable in admin/content later)
  let base = 110;
  base += beds * 18;
  base += baths * 22;
  base += Math.max(0, (sqft - 1000)) / 200 * 8;

  const typeMult = ({
    standard: 1.00,
    deep: 1.35,
    move: 1.45,
    airbnb: 1.15,
    custom: 1.00,
  })[type] ?? 1.00;

  const freqDisc = ({
    onetime: 1.00,
    weekly: 0.82,
    biweekly: 0.88,
    monthly: 0.94,
  })[freq] ?? 1.00;

  const addons = $$('input[name="addon"]:checked').reduce((sum, el) => sum + parseInt(el.value, 10), 0);

  const price = Math.round((base * typeMult * freqDisc) + addons);

  $('#price').textContent = money(price);

  // Put into hidden fields for Netlify form submission
  $('#quotePrice').value = price;
  $('#quoteSummary').value = `${beds} bed / ${baths} bath, ~${sqft} sqft, ${type}, ${freq}, addons $${addons}`;
}

function initFaq(){
  $$('.faq .item button').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.item');
      item.classList.toggle('open');
    });
  });
}

function initAnimations(){
  const els = $$('[data-anim]');
  if(els.length === 0) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, {threshold: 0.12});
  els.forEach(el=>io.observe(el));
}

async function loadReviews(){
  const wrap = $('#reviewsWrap');
  wrap.innerHTML = `<div class="card"><p class="small">Loading reviews…</p></div>`;
  try{
    const res = await fetch('/.netlify/functions/google-reviews', {cache:'no-store'});
    if(!res.ok) throw new Error('no reviews');
    const data = await res.json();

    if(!data || !data.reviews || data.reviews.length === 0){
      throw new Error('empty reviews');
    }
    const items = data.reviews.slice(0, 6).map(r => `
      <article class="card">
        <h3 style="margin:0 0 6px">${escapeHtml(r.author_name || 'Customer')}</h3>
        <p class="small" style="margin:0 0 8px">⭐ ${r.rating ?? ''} • ${escapeHtml(r.relative_time_description || '')}</p>
        <p>${escapeHtml(r.text || '')}</p>
      </article>
    `).join('');
    wrap.innerHTML = `<div class="cards" style="grid-template-columns:repeat(3,1fr)">${items}</div>`;
  }catch(e){
    wrap.innerHTML = `
      <div class="card">
        <h3 style="margin:0 0 8px">Reviews will appear here</h3>
        <p class="small">To show live Google reviews automatically, add your Google Place ID + API key in Netlify environment variables (instructions in README). Until then, this block stays empty — no copied reviews.</p>
      </div>
    `;
  }
}

function smoothScroll(){
  $$('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const id = a.getAttribute('href');
      if(id.length <= 1) return;
      const el = document.querySelector(id);
      if(!el) return;
      e.preventDefault();
      el.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });
}

function initQuote(){
  ['bedrooms','bathrooms','sqft','serviceType','frequency'].forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener('input', computeQuote);
    el.addEventListener('change', computeQuote);
  });
  $$('input[name="addon"]').forEach(el=>{
    el.addEventListener('change', computeQuote);
  });
}

function prefillContact(){
  // Put phone/email for quick copy in footer
  const y = document.getElementById('year');
  if(y) y.textContent = new Date().getFullYear();
}

window.addEventListener('DOMContentLoaded', async ()=>{
  const site = await loadSite();
  initFaq();
  initQuote();
  smoothScroll();
  prefillContact();
  initAnimations();
  if(document.getElementById('reviewsWrap')) loadReviews();

  // Set hidden "referrer" field
  const ref = document.referrer || '';
  const rf = document.getElementById('referrer');
  if(rf) rf.value = ref;
});
