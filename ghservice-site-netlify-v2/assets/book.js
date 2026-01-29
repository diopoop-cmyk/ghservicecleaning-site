async function main(){
  const wrap = document.getElementById('calendlyWrap');
  const link = document.getElementById('calendlyLink');
  if(!wrap) return;

  try{
    const res = await fetch('/content/site.json', {cache:'no-store'});
    const site = await res.json();
    const url = site.booking?.calendly_url || '';
    if(link) link.href = url || '#';
    if(!url || url.includes('YOUR-CALENDLY')){
      wrap.innerHTML = `<div class="card"><h3 style="margin:0 0 8px">Add your Calendly link</h3><p class="small">Open <strong>/admin</strong> → Site Settings → Booking → paste your Calendly URL. Then this page will show your live available times.</p></div>`;
      return;
    }

    // Inline widget
    const d = document.createElement('div');
    d.className = 'calendly-inline-widget';
    d.style.minWidth = '320px';
    d.style.height = '760px';
    d.setAttribute('data-url', url);
    wrap.appendChild(d);

    const s = document.createElement('script');
    s.src = 'https://assets.calendly.com/assets/external/widget.js';
    s.async = true;
    document.body.appendChild(s);
  }catch(e){
    wrap.innerHTML = `<div class="card"><p class="small">Couldn't load booking. Please refresh or contact us directly.</p></div>`;
  }
}

window.addEventListener('DOMContentLoaded', main);
