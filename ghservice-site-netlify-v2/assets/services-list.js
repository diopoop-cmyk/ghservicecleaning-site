async function main(){
  const grid = document.getElementById('servicesList');
  if(!grid) return;
  const res = await fetch('/content/services/index.json', {cache:'no-store'});
  const items = await res.json();
  grid.innerHTML = items.map(s => `
    <article class="card" data-anim>
      <h3>${escapeHtml(s.title)}</h3>
      <p>${escapeHtml(s.summary)}</p>
      <div class="badges">
        <a class="btn primary" href="/services/${encodeURIComponent(s.slug)}/">View details</a>
        <a class="btn ghost" href="/book/">Book now</a>
      </div>
    </article>
  `).join('');
}

function escapeHtml(str){
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

window.addEventListener('DOMContentLoaded', main);