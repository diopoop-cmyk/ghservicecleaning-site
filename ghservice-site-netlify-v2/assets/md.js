// Minimal Markdown + YAML-like frontmatter parser.
// This keeps the site fully static (no build step) while still allowing
// Netlify/Decap CMS to edit markdown content.

export function parseFrontmatter(raw){
  const text = String(raw ?? '');
  if(!text.startsWith('---')) return { data: {}, body: text };
  const end = text.indexOf('\n---', 3);
  if(end === -1) return { data: {}, body: text };

  const fm = text.slice(3, end).trim();
  const body = text.slice(end + 4).replace(/^\n+/, '');

  const data = {};
  fm.split(/\r?\n/).forEach(line => {
    const m = line.match(/^([A-Za-z0-9_\-]+):\s*(.*)$/);
    if(!m) return;
    const key = m[1].trim();
    let val = (m[2] ?? '').trim();
    // Strip surrounding quotes
    val = val.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
    data[key] = val;
  });

  return { data, body };
}

// Very small markdown renderer (headings, paragraphs, lists, bold, links).
export function renderMarkdown(md){
  const src = String(md ?? '').replace(/\r\n/g, '\n');
  const lines = src.split('\n');

  const esc = (s) => String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;');

  const inline = (s) => {
    let out = esc(s);
    // links [text](url)
    out = out.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, (m, t, u) => {
      const safeU = u.replace(/"/g,'');
      return `<a href="${safeU}" rel="nofollow">${t}</a>`;
    });
    // bold **text**
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return out;
  };

  let html = '';
  let inList = false;

  const closeList = () => {
    if(inList){
      html += '</ul>';
      inList = false;
    }
  };

  for(const line of lines){
    const l = line.trimEnd();
    if(l.trim() === ''){
      closeList();
      continue;
    }

    const h3 = l.match(/^###\s+(.+)$/);
    const h2 = l.match(/^##\s+(.+)$/);
    const h1 = l.match(/^#\s+(.+)$/);
    if(h1){ closeList(); html += `<h1>${inline(h1[1])}</h1>`; continue; }
    if(h2){ closeList(); html += `<h2>${inline(h2[1])}</h2>`; continue; }
    if(h3){ closeList(); html += `<h3>${inline(h3[1])}</h3>`; continue; }

    const li = l.match(/^\s*[-*]\s+(.+)$/);
    if(li){
      if(!inList){ html += '<ul>'; inList = true; }
      html += `<li>${inline(li[1])}</li>`;
      continue;
    }

    closeList();
    html += `<p>${inline(l)}</p>`;
  }
  closeList();

  return html;
}
