/**
 * Robotvergelijk.nl — statische sitegenerator
 *
 * Draaien:  node build.js
 * Resultaat: /public  (dit is wat er naar de webserver gaat)
 *
 * Structuur:
 *   content/    alle tekst en data  — hier pas je dingen aan
 *   templates/  de opmaak           — los van de content
 *   assets/     css, js, beeld
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'public');

const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/site.json'), 'utf8'));
const producten = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/producten.json'), 'utf8'));
const wizard = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/wizard.json'), 'utf8'));

/* ---------------------------------------------------------------- helpers */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Bouwt een link naar bol.
 * Zodra site.bol_site_id is ingevuld wordt automatisch de affiliate-link gebruikt.
 * Zo hoef je maar op één plek iets te wijzigen na goedkeuring.
 */
function bolLink(zoekterm) {
  const target = 'https://www.bol.com/nl/nl/s/?searchtext=' + encodeURIComponent(zoekterm);
  if (!site.bol_site_id) return target;
  return 'https://partner.bol.com/click/click?p=2&t=url&s=' + encodeURIComponent(site.bol_site_id) +
         '&url=' + encodeURIComponent(target) + '&f=TXL&name=' + encodeURIComponent(zoekterm);
}

/** Gereserveerde ruimte voor beeld dat we later maken. */
function beeldplek(ratio, titel, uitleg) {
  return `<figure class="mediaplek" style="--ratio:${ratio}">
  <div class="mediaplek-body">
    <span class="mediaplek-label">Beeld volgt</span>
    <b>${esc(titel)}</b>
    <span class="mediaplek-uitleg">${esc(uitleg)}</span>
  </div>
</figure>`;
}

/* ------------------------------------------------------- mini-markdown */
/* Bewust klein gehouden: koppen, alinea's, lijsten, tabellen, links, vet,
   plus twee eigen blokken:  :::let / :::tip  en  ::beeld[ratio|titel|uitleg] */

function inline(s) {
  return s
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])_([^_]+)_/g, '$1<em>$2</em>');
}

function markdown(src) {
  const lines = src.split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    let line = lines[i];

    // placeholders zoals <!--VERGELIJKER--> ongewijzigd doorlaten
    if (/^<!--[A-Z]+-->\s*$/.test(line)) { out.push(line.trim()); i++; continue; }

    // beeldplek
    const beeld = line.match(/^::beeld\[(.+?)\|(.+?)\|(.+?)\]\s*$/);
    if (beeld) { out.push(beeldplek(beeld[1], beeld[2], beeld[3])); i++; continue; }

    // callout
    const call = line.match(/^:::(let|tip)\s*(.*)$/);
    if (call) {
      const kop = call[2].trim();
      const body = [];
      i++;
      while (i < lines.length && !/^:::\s*$/.test(lines[i])) { body.push(lines[i]); i++; }
      i++;
      out.push(`<div class="callout ${call[1] === 'let' ? 'warn' : ''}">` +
        (kop ? `<strong>${inline(esc(kop))}</strong>` : '') +
        markdown(body.join('\n')) + '</div>');
      continue;
    }

    // tabel
    if (/^\|/.test(line) && /^\|[\s:|-]+\|\s*$/.test(lines[i + 1] || '')) {
      const head = line.split('|').slice(1, -1).map((c) => c.trim());
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        rows.push(lines[i].split('|').slice(1, -1).map((c) => c.trim()));
        i++;
      }
      out.push('<div class="table-scroll"><table><thead><tr>' +
        head.map((h) => `<th>${inline(esc(h))}</th>`).join('') +
        '</tr></thead><tbody>' +
        rows.map((r) => '<tr>' + r.map((c) => `<td>${inline(esc(c))}</td>`).join('') + '</tr>').join('') +
        '</tbody></table></div>');
      continue;
    }

    // kop
    const h = line.match(/^(#{2,4})\s+(.*)$/);
    if (h) { const n = h[1].length; out.push(`<h${n} id="${slug(h[2])}">${inline(esc(h[2]))}</h${n}>`); i++; continue; }

    // lijst
    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^[-*]\s+/, '')); i++; }
      out.push('<ul>' + items.map((t) => `<li>${inline(esc(t))}</li>`).join('') + '</ul>');
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\d+\.\s+/, '')); i++; }
      out.push('<ol>' + items.map((t) => `<li>${inline(esc(t))}</li>`).join('') + '</ol>');
      continue;
    }

    // alinea
    if (line.trim() === '') { i++; continue; }
    const buf = [];
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{2,4}\s|[-*]\s|\d+\.\s|\||:::|::beeld)/.test(lines[i])) {
      buf.push(lines[i]); i++;
    }
    out.push(`<p>${inline(esc(buf.join(' ')))}</p>`);
  }

  return out.join('\n');
}

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* ------------------------------------------------------------ templates */

const T = {};
for (const f of fs.readdirSync(path.join(ROOT, 'templates'))) {
  if (f.endsWith('.html')) T[f.replace('.html', '')] = fs.readFileSync(path.join(ROOT, 'templates', f), 'utf8');
}
const P = {};
const partialDir = path.join(ROOT, 'templates/partials');
if (fs.existsSync(partialDir)) {
  for (const f of fs.readdirSync(partialDir)) {
    if (f.endsWith('.html')) P[f.replace('.html', '')] = fs.readFileSync(path.join(partialDir, f), 'utf8');
  }
}

function render(tpl, vars) {
  return tpl
    .replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => render(P[name] || '', vars))
    .replace(/\{\{\{\s*([\w.]+)\s*\}\}\}/g, (_, k) => pick(vars, k) ?? '')
    .replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => esc(pick(vars, k) ?? ''));
}
const pick = (o, k) => k.split('.').reduce((a, b) => (a == null ? a : a[b]), o);

/* ------------------------------------------------------------ onderdelen */

function navHtml(active) {
  return site.nav.map((n) =>
    `<a href="${n.url}"${n.cta ? ' class="nav-cta"' : ''}${n.url === active ? ' aria-current="page"' : ''}>${esc(n.titel)}</a>`
  ).join('\n');
}

function footerHtml() {
  return site.footer.map((kol) =>
    `<div><h4>${esc(kol.kop)}</h4><ul>` +
    kol.links.map((l) => `<li><a href="${l.url}">${esc(l.titel)}</a></li>`).join('') +
    '</ul></div>'
  ).join('\n');
}

/** Fotogalerij met bronvermelding. */
function galerijHtml(p) {
  const m = p.media;
  if (!m || !m.fotos || !m.fotos.length) {
    return beeldplek('4/3', 'Productfoto', 'Officiële productafbeelding via de bol-productfeed (volgt na goedkeuring affiliate-account).');
  }
  const hoofd = `<img class="gal-hoofd" src="${m.fotos[0]}" alt="${esc(p.naam)}" loading="lazy">`;
  const thumbs = m.fotos.length > 1
    ? `<div class="gal-thumbs">` + m.fotos.map((f, i) =>
        `<button class="gal-thumb${i === 0 ? ' actief' : ''}" data-foto="${f}" aria-label="Foto ${i + 1} van ${esc(p.naam)}"><img src="${f}" alt="" loading="lazy"></button>`
      ).join('') + `</div>`
    : '';
  return `<figure class="galerij" data-galerij>${hoofd}${thumbs}<figcaption class="gal-bron">${esc(m.bron)}</figcaption></figure>`;
}

/** Video-embed (YouTube, klikt pas bij afspelen — geen cookies vooraf). */
function videoHtml(p) {
  const v = p.media && p.media.video;
  if (!v) return '';
  return `<div class="video-blok">
  <a class="video-start" href="https://www.youtube.com/watch?v=${v.id}" data-video="${v.id}" rel="noopener" target="_blank">
    <img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="Video: ${esc(p.naam)}" loading="lazy">
    <span class="video-play" aria-hidden="true"></span>
  </a>
  <p class="gal-bron">${esc(v.bron)}</p>
</div>`;
}

/** Productblok met galerij, video en CTA. */
function productHtml(p) {
  return `<article class="pick${p.best ? ' best' : ''}" id="${p.id}">
  <div>
    <span class="tag${p.best ? '' : ' alt'}">${esc(p.tag)}</span>
    <h3>${esc(p.naam)}</h3>
    <p>${esc(p.kort)}</p>
    <div class="pros-cons">
      <div><h4>Sterk</h4><ul>${p.voor.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div><h4>Let op</h4><ul>${p.tegen.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    </div>
    ${videoHtml(p)}
  </div>
  <div class="pick-cta">
    ${galerijHtml(p)}
    <a class="btn" href="${bolLink(p.zoek)}" rel="sponsored nofollow noopener" target="_blank">Bekijk prijs bij bol</a>
    <small>Prijsklasse ${esc(p.prijsklasse)}<br>Actuele prijs zie je bij de winkel</small>
  </div>
</article>`;
}

/** Vergelijkingstabel voor 2 tot 5 producten. */
function vergelijkHtml(categorie) {
  const cat = producten.categorieen[categorie];
  const lijst = producten[categorie];
  const labels = producten.spec_labels;

  const kolommen = lijst.map((p) => `
    <th scope="col" class="vgl-kop">
      <label class="vgl-toggle"><input type="checkbox" data-vgl="${p.id}" checked> <span>tonen</span></label>
      <b>${esc(p.naam)}</b>
      <span class="vgl-merk">${esc(p.merk)}</span>
      <a class="btn btn-klein" href="${bolLink(p.zoek)}" rel="sponsored nofollow noopener" target="_blank">Prijs bekijken</a>
    </th>`).join('');

  const rijen = cat.specs.map((s) => `
    <tr>
      <th scope="row">${esc(labels[s] || s)}</th>
      ${lijst.map((p) => `<td data-col="${p.id}">${esc(p.specs?.[s] ?? p[s] ?? '—')}</td>`).join('')}
    </tr>`).join('');

  return `<div class="vergelijker" data-vergelijker>
  <div class="vgl-intro">
    <h2 id="vergelijken">${esc(cat.titel)} naast elkaar</h2>
    <p>Vink uit wat je niet wilt zien. Je kunt er twee tot vijf tegelijk vergelijken.</p>
  </div>
  <div class="table-scroll">
    <table class="vgl-tabel">
      <thead><tr><th scope="col" class="vgl-hoek">Model</th>${kolommen}</tr></thead>
      <tbody>${rijen}</tbody>
    </table>
  </div>
  <p class="vgl-voet">Specificaties komen uit opgaven van de fabrikanten en kunnen wijzigen. We testen deze modellen (nog) niet zelf — zie <a href="/over-ons.html">hoe wij werken</a>.</p>
</div>`;
}

/* ------------------------------------------------------------ pagina's */

/* ---- structured data (JSON-LD) voor Google en AI-zoekmachines ---- */

function jsonld(obj) {
  return '<script type="application/ld+json">' + JSON.stringify(obj) + '</script>';
}

function basisSchema(url) {
  const abs = 'https://' + site.domein;
  const blokken = [{
    '@context': 'https://schema.org', '@type': 'WebSite',
    name: site.naam, url: abs + '/', inLanguage: 'nl',
    publisher: { '@type': 'Organization', name: site.naam, url: abs + '/', logo: abs + '/assets/logo.svg' }
  }];
  if (url !== '/') {
    blokken.push({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: abs + '/' },
        { '@type': 'ListItem', position: 2, name: url.replace('/', '').replace('.html', '') }
      ]
    });
  }
  return blokken.map(jsonld).join('\n');
}

function artikelSchema(meta, url, bodyMd) {
  const abs = 'https://' + site.domein;
  const blokken = [{
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.titel,
    description: meta.beschrijving,
    inLanguage: 'nl',
    author: { '@type': 'Organization', name: site.naam },
    publisher: { '@type': 'Organization', name: site.naam, logo: { '@type': 'ImageObject', url: abs + '/assets/logo.svg' } },
    mainEntityOfPage: abs + url
  }];

  // FAQ-schema: haal vraag/antwoord-paren uit de sectie "Veelgestelde vragen"
  const faqDeel = bodyMd.split(/##\s+Veelgestelde vragen/)[1];
  if (faqDeel) {
    const paren = [...faqDeel.matchAll(/\*\*(.+?)\*\*\n([^*#]+)/g)]
      .map((m) => ({ v: m[1].trim(), a: m[2].trim().replace(/\n/g, ' ') }))
      .filter((p) => p.v.endsWith('?'));
    if (paren.length) {
      blokken.push({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: paren.map((p) => ({
          '@type': 'Question', name: p.v,
          acceptedAnswer: { '@type': 'Answer', text: p.a }
        }))
      });
    }
  }
  return blokken.map(jsonld).join('\n');
}

function pagina({ titel, beschrijving, url, body, klasse = '', schema = '' }) {
  return render(T.base, {
    site, titel, beschrijving, url,
    nav: navHtml(url), footer: footerHtml(), body, klasse,
    schema: schema || basisSchema(url),
    jaar: new Date().getFullYear()
  });
}

function schrijf(bestand, html) {
  fs.mkdirSync(path.dirname(path.join(OUT, bestand)), { recursive: true });
  fs.writeFileSync(path.join(OUT, bestand), html);
  console.log('  ✓', bestand);
}

/* ---- markdown-pagina's ---- */

function leesPagina(bestand) {
  const raw = fs.readFileSync(path.join(ROOT, 'content/pages', bestand), 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const meta = {};
  if (m) {
    for (const r of m[1].split('\n')) {
      const k = r.indexOf(':');
      if (k > 0) meta[r.slice(0, k).trim()] = r.slice(k + 1).trim();
    }
  }
  return { meta, body: m ? m[2] : raw };
}

/* ------------------------------------------------------------ bouwen */

console.log('Robotvergelijk bouwen…');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// assets kopiëren
fs.cpSync(path.join(ROOT, 'assets'), path.join(OUT, 'assets'), { recursive: true });

// wizard-data meegeven aan de browser
fs.writeFileSync(path.join(OUT, 'assets/wizard-data.js'),
  'window.WIZARD = ' + JSON.stringify(wizard) + ';\n' +
  'window.PRODUCTEN = ' + JSON.stringify(
    Object.fromEntries(Object.keys(producten.categorieen).map((c) => [c,
      producten[c].map((p) => ({ id: p.id, naam: p.naam, merk: p.merk, tag: p.tag, kort: p.kort,
        prijsklasse: p.prijsklasse, voor: p.voor, tegen: p.tegen, link: bolLink(p.zoek),
      img: p.media && p.media.fotos ? p.media.fotos[0] : '' }))]))
  ) + ';\n');

const paginas = fs.readdirSync(path.join(ROOT, 'content/pages')).filter((f) => f.endsWith('.md'));
const gidsen = [];
const uitleg = [];

for (const bestand of paginas) {
  const { meta, body } = leesPagina(bestand);
  const url = '/' + bestand.replace('.md', '.html');
  let inhoud = markdown(body);

  if (meta.vergelijker) inhoud = inhoud.replace('<!--VERGELIJKER-->', vergelijkHtml(meta.vergelijker));
  if (meta.producten) {
    inhoud = inhoud.replace('<!--PRODUCTEN-->',
      producten[meta.producten].map(productHtml).join('\n'));
  }

  const html = pagina({
    titel: meta.titel, beschrijving: meta.beschrijving, url,
    schema: basisSchema(url) + '\n' + artikelSchema(meta, url, body),
    body: render(T.artikel, {
      titel: meta.titel, intro: meta.intro || '', inhoud,
      disclosure_blok: meta.affiliate
        ? '<div class="disclosure"><p>' + esc(site.disclosure_kort) + '</p></div>'
        : '',
      bijgewerkt: meta.bijgewerkt || '',
      soort: meta.soort || ''
    })
  });
  schrijf(bestand.replace('.md', '.html'), html);

  if (meta.soort === 'gids') gidsen.push({ titel: meta.titel, url, intro: meta.intro });
  if (meta.soort === 'uitleg') uitleg.push({ titel: meta.titel, url, intro: meta.intro });
}

// home
schrijf('index.html', pagina({
  titel: site.naam + ' — ' + site.tagline,
  beschrijving: site.beschrijving,
  url: '/',
  body: render(T.home, {
    site,
    gidsen: gidsen.map((g) => `<a class="card" href="${g.url}"><h3>${esc(g.titel)}</h3><p>${esc(g.intro)}</p></a>`).join(''),
    uitleg: uitleg.map((u) => `<a class="card" href="${u.url}"><h3>${esc(u.titel)}</h3><p>${esc(u.intro)}</p></a>`).join(''),
    hero_beeld: beeldplek('16/10', 'Hero-illustratie',
      'Rustige lijnillustratie of render van vier robots (stofzuiger, raam, maaier, zwembad) in één huis-doorsnede. Geen fotomontage — een schematische tekening die meteen duidelijk maakt dat het over álle huishoudrobots gaat.')
  })
}));

// wizard-pagina
schrijf('keuzehulp.html', pagina({
  titel: 'Keuzehulp: welke robot past bij jou?',
  beschrijving: 'Beantwoord vier vragen en zie welke robot bij je situatie past — inclusief eerlijk advies wanneer je er beter geen koopt.',
  url: '/keuzehulp.html',
  body: render(T.keuzehulp, { site })
}));

// uitleg-overzicht
schrijf('uitleg.html', pagina({
  titel: 'Uitleg: hoe werken deze robots eigenlijk?',
  beschrijving: 'De techniek achter huishoudrobots in gewone mensentaal. Navigatie, dweilen, obstakelherkenning en basisstations uitgelegd.',
  url: '/uitleg.html',
  body: `<div class="wrap narrow article">
    <h1>Hoe werken deze robots eigenlijk?</h1>
    <p class="lead">Voordat je iets koopt is het handig om te snappen wát je koopt. Hieronder leggen we de techniek uit zonder marketingtaal — zodat je zelf kunt beoordelen of die dure functie jouw probleem oplost.</p>
  </div>
  <div class="wrap"><div class="grid grid-3">${uitleg.map((u) => `<a class="card" href="${u.url}"><h3>${esc(u.titel)}</h3><p>${esc(u.intro)}</p></a>`).join('')}</div></div>`
}));

// sitemap + robots
const urls = ['/', '/keuzehulp.html', '/uitleg.html'].concat(paginas.map((f) => '/' + f.replace('.md', '.html')));
schrijf('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u) => `  <url><loc>https://${site.domein}${u}</loc></url>`).join('\n') + '\n</urlset>\n');
schrijf('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: https://${site.domein}/sitemap.xml\n`);

console.log('Klaar. Upload de inhoud van /public naar de webserver.');
