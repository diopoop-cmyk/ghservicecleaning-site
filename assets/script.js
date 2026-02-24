// G&H Service — site helpers (WhatsApp + Netlify Forms summary + smooth scroll)
(function(){
  // Year in footer
  const yearEl = document.getElementById('year');
  if(yearEl){ yearEl.textContent = new Date().getFullYear(); }

  // Smooth scroll for anchor links
  document.addEventListener('click', (e)=>{
    const a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if(!a) return;
    const href = a.getAttribute('href');
    if(!href || href === '#') return;
    const target = document.querySelector(href);
    if(!target) return;
    e.preventDefault();
    target.scrollIntoView({behavior:'smooth', block:'start'});
  });

  // WhatsApp integration (change this number if needed)
  const WHATSAPP_NUMBER = '13475399538'; // +1 347 539 9538

  const waBtn = document.getElementById('waFloat');
  if(waBtn){
    waBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      const msg = encodeURIComponent('Hi! I would like to get a quote for house cleaning.');
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
    });
  }

  // Quote form: create a combined "summary" field so emails are never blank
  const form = document.getElementById('quoteForm');
  if(form){
    form.addEventListener('submit', ()=>{
      const get = (name)=>{
        const el = form.querySelector(`[name="${name}"]`);
        return el ? (el.value || '').trim() : '';
      };

      const bedrooms = get('bedrooms');
      const bathrooms = get('bathrooms');
      const sqft = get('square_feet');
      const service = get('service_type');
      const frequency = get('frequency');
      const addons = Array.from(form.querySelectorAll('input[name="addon"]:checked')).map(x=>x.value);
      const name = get('name');
      const phone = get('phone');
      const when = get('preferred_date_time');
      const notes = get('notes');

      const summaryLines = [
        `Name: ${name}`,
        `Phone: ${phone}`,
        `When needed: ${when}`,
        `Bedrooms: ${bedrooms}`,
        `Bathrooms: ${bathrooms}`,
        `Approx. sq ft: ${sqft}`,
        `Service type: ${service}`,
        `Frequency: ${frequency}`,
        `Add-ons: ${addons.length ? addons.join(', ') : ''}`,
        `Address/City: `,
        `Notes: ${notes}`,
      ];
      const summary = summaryLines.join('\n');

      const summaryField = document.getElementById('summaryField');
      if(summaryField) summaryField.value = summary;

      // Store for thank-you page
      try{ localStorage.setItem('gh_quote_summary', summary); }catch(_e){}
    });
  }
})();

// --- Google Reviews + Photos (pulled from Netlify Function) ---
(async function loadGoogleContent() {
  const reviewsEl = document.getElementById('gReviews');
  const reviewsMeta = document.getElementById('gReviewsMeta');
  const photosEl = document.getElementById('gPhotos');
  const photosMeta = document.getElementById('gPhotosMeta');

  if (!reviewsEl || !photosEl) return;

  try {
    const res = await fetch('/.netlify/functions/google-content');
    const payload = await res.json();

    if (!payload?.ok || !payload?.data) {
      const msg = payload?.message || 'Google content is not connected yet.';
      reviewsMeta && (reviewsMeta.textContent = msg);
      photosMeta && (photosMeta.textContent = msg);
      return;
    }

    const d = payload.data;

    // Meta
    if (reviewsMeta) {
      const rating = d.rating ? Number(d.rating).toFixed(1) : '—';
      const total = d.user_ratings_total ? Number(d.user_ratings_total).toLocaleString() : '—';
      reviewsMeta.innerHTML = `Rating <b>${rating}</b> (${total} reviews)${d.google_url ? ` · <a href="${d.google_url}" target="_blank" rel="noopener">Open on Google</a>` : ''}`;
    }

    // Reviews
    reviewsEl.innerHTML = '';
    const reviews = Array.isArray(d.reviews) ? d.reviews : [];
    if (!reviews.length) {
      reviewsEl.innerHTML = '<div class="muted">No reviews found yet.</div>';
    } else {
      for (const r of reviews) {
        const card = document.createElement('div');
        card.className = 'review-card';

        const safeText = (r.text || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const rel = r.relative_time_description || '';

        card.innerHTML = `
          <div class="review-head">
            <div class="review-name">${r.author_name || 'Google user'}</div>
            <div class="review-rating">⭐ ${r.rating || '—'}</div>
          </div>
          <div class="review-text">${safeText || '<span class="muted">(no text)</span>'}</div>
          <div class="review-time">${rel}</div>
        `;
        reviewsEl.appendChild(card);
      }
    }

    // Photos
    photosEl.innerHTML = '';
    const photos = Array.isArray(d.photos) ? d.photos : [];
    if (!photos.length) {
      photosMeta && (photosMeta.textContent = 'No photos found yet.');
    } else {
      photosMeta && (photosMeta.textContent = '');
      for (const p of photos) {
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.alt = 'G&H Service — photo';
        img.src = p.url;
        photosEl.appendChild(img);
      }
    }
  } catch (e) {
    const msg = 'Could not load Google reviews/photos.';
    reviewsMeta && (reviewsMeta.textContent = msg);
    photosMeta && (photosMeta.textContent = msg);
  }
})();
