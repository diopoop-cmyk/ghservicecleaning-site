import { parseFrontmatter, renderMarkdown } from './md.js';

function slugFromPath(){
  const p = window.location.pathname.replace(/\/+$/, '');
  const parts = p.split('/').filter(Boolean);
  const idx = parts.indexOf('services');
  if(idx === -1) return null;
  return parts[idx + 1] || null;
}

async function main(){
  const slug = slugFromPath();
  const titleEl = document.getElementById('serviceTitle');
  const bodyEl = document.getElementById('serviceBody');
  if(!slug || !titleEl || !bodyEl) return;

  try{
    const res = await fetch(`/content/services/${encodeURIComponent(slug)}.md`, {cache:'no-store'});
    if(!res.ok) throw new Error('missing');
    const raw = await res.text();
    const { data, body } = parseFrontmatter(raw);
    titleEl.textContent = data.title || slug;
    bodyEl.innerHTML = renderMarkdown(body);

    const crumb = document.getElementById('serviceCrumb');
    if(crumb) crumb.textContent = data.title || slug;
  }catch(e){
    titleEl.textContent = 'Service';
    bodyEl.innerHTML = `<p>We couldn't find this service page. Please go back to <a href="/services/">all services</a>.</p>`;
  }
}

window.addEventListener('DOMContentLoaded', main);
