// One-pager generator: one HTML layout, one language block per locale, one A4 PDF per profession.
//
//   node build.mjs                      every profession in blocks/pt-BR.json
//   node build.mjs --lang en            the English block (for checking the layout against the originals)
//   node build.mjs --only estate --png  one profession, plus a PNG preview beside the PDF
//
// The layout copies the October 2026 English one-pagers. Copy lives only in blocks/<lang>.json, so a
// new language is a new block and never a change here. Fonts are local (SIL OFL), so the build is offline.

import { chromium } from 'playwright';
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const LANG = opt('lang', 'pt-BR');
const ONLY = opt('only', null);
const OUT = resolve(HERE, opt('out', '..'));
const PNG = args.includes('--png');

const block = JSON.parse(readFileSync(join(HERE, 'blocks', `${LANG}.json`), 'utf8'));

const FACES = [
  ['Playfair Display', 600, 'normal', 'PlayfairDisplay-600.ttf'],
  ['Playfair Display', 700, 'normal', 'PlayfairDisplay-700.ttf'],
  ['Lora', 400, 'normal', 'Lora-400.ttf'],
  ...[400, 500, 600, 700].map((w) => ['Space Grotesk', w, 'normal', `SpaceGrotesk-${w}.ttf`]),
];
const fontFaces = FACES.map(
  ([family, weight, style, file]) =>
    `@font-face{font-family:'${family}';font-weight:${weight};font-style:${style};src:url(data:font/ttf;base64,${readFileSync(join(HERE, 'fonts', file)).toString('base64')}) format('truetype');}`,
).join('\n');

// Escapes HTML and keeps a currency sign on the same line as its amount (R$ 780.000, EUR 475,000).
const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\b(R\$|EUR|US\$) (?=\d)/g, '$1&nbsp;');

// An item is a string, or { b: bold lead, t: plain lead, m: muted rest, tag: pill }.
const item = (it) => {
  if (typeof it === 'string') return esc(it);
  let h = '';
  if (it.b) h += `<b>${esc(it.b)}</b>`;
  if (it.t) h += esc(it.t);
  if (it.m) h += `${it.b || it.t ? ' ' : ''}<span class="m">${esc(it.m)}</span>`;
  if (it.tag) h += ` <span class="tag">${esc(it.tag)}</span>`;
  return h;
};

const LOGO = (size, square) => `
  <svg class="logo${square ? ' sq' : ''}" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">
    ${square ? '<rect x="0" y="0" width="24" height="24" rx="5" fill="#1f3f28"/>' : ''}
    <text x="${square ? 5.2 : 1}" y="${square ? 17.6 : 18}" font-family="Playfair Display" font-weight="700" font-size="${square ? 13 : 17}" fill="#eef0ea">P</text>
    <path d="M${square ? 15.6 : 14.2} ${square ? 4.2 : 2.2}h5.2a1.6 1.6 0 0 1 1.6 1.6v2.6a1.6 1.6 0 0 1-1.6 1.6h-2.6l-2.1 2v-2a1.6 1.6 0 0 1-1.6-1.6v-2.6a1.6 1.6 0 0 1 1.1-1.6z" fill="#c9a84c"/>
  </svg>`;

function page(p, s) {
  const [s1, s2, s3] = p.sections;
  const n = p.note;
  return `<!doctype html>
<html lang="${esc(block.lang)}"><head><meta charset="utf-8"><title>${esc(p.docTitle)}</title>
<style>
${fontFaces}
:root{
  --green:#1f3f28; --gold:#c9a84c; --gold-ink:#b08f3a; --canvas:#eef0ea; --card:#ffffff;
  --ink:#1f3f28; --muted:#5b6b5e; --faint:#8a968c; --hair:#e2e6e4; --chip:#eff1eb; --chip-line:#d5dbd3;
  --pilot:#e8e5d3; --pilot-line:#d8cf9f; --box:#d9c181;
}
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:794px;height:1123px;background:var(--canvas);color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:'Space Grotesk',sans-serif;font-weight:400;text-wrap:pretty;font-size:11px;line-height:16px;position:relative;overflow:hidden}
b{font-weight:600}

header{height:141px;padding:21px 32px 0;color:#eef0ea;
  background:radial-gradient(130% 160% at 92% -10%,#3a5530 0%,#2a4a2c 28%,#1f3f28 62%)}
.top{display:flex;align-items:center;justify-content:space-between;height:24px}
.brand{display:flex;align-items:center;gap:5px;font-family:'Playfair Display';font-weight:600;font-size:16px}
.brand .logo{margin-left:4px}
.url{font-size:9.5px;font-weight:500;letter-spacing:.2em;color:var(--gold)}
h1{font-family:'Playfair Display';font-weight:600;font-size:34px;line-height:40px;margin-top:12px}
h1 em{font-style:normal;color:var(--gold)}
.sub{font-family:'Lora';font-size:13.85px;line-height:18px;color:#d3dacf;margin-top:1px}

main{display:grid;grid-template-columns:272px 1fr;gap:0 18px;padding:0 32px}
.col{display:flex;flex-direction:column}
.eyebrow{display:flex;align-items:center;height:18px;margin:14px 0 7px;font-size:9.5px;font-weight:500;letter-spacing:.16em;color:var(--gold-ink);text-transform:uppercase}
.left > .eyebrow:first-child{margin-top:13px}
.right > .eyebrow:first-child{margin-top:11px}
.eyebrow .n{font-family:'Playfair Display';font-weight:600;font-size:13px;letter-spacing:0;color:var(--ink);margin-right:9px;position:relative;top:3px}
.eyebrow .dot{width:5px;height:5px;border-radius:50%;background:var(--gold);margin-right:6px;flex:none}
.card{background:var(--card);border:1px solid var(--hair);border-radius:18px;box-shadow:0 8px 18px -10px rgba(31,63,40,.22),0 1px 2px rgba(31,63,40,.04)}
.left .card{padding:12px 15px 12px}
h2{font-weight:600;font-size:12.5px;line-height:16px;color:var(--ink)}
.lede{font-family:'Lora';font-size:11.9px;line-height:17px;color:var(--muted);margin-top:9px}
ul,ol{list-style:none}
.dots li{position:relative;padding-left:12px;margin-top:5.5px;line-height:15.5px;color:var(--ink)}
.dots li::before{content:'';position:absolute;left:0;top:6px;width:5px;height:5px;border-radius:50%;background:var(--gold)}
.lede + ul{margin-top:1.5px}
h2 + ul{margin-top:4px}
.steps{margin-top:4px}
.steps li{position:relative;padding-left:24px;margin-top:6px}
.steps li .k{position:absolute;left:0;top:1px;width:14px;height:14px;border-radius:50%;background:var(--gold);color:#1b1606;font-size:8px;font-weight:700;line-height:14px;text-align:center}

.note{padding:12px 15px 12px}
.note h3{font-family:'Playfair Display';font-weight:600;font-size:18px;line-height:22px;color:var(--ink)}
.meta{font-size:9.5px;line-height:13px;color:var(--muted);margin-top:1px;font-weight:400}
.tabs{display:flex;gap:21px;border-bottom:1.5px solid var(--hair);margin-top:7px;font-size:10.5px;font-weight:400;line-height:14px}
.tabs span{padding:2px 0 4px;color:var(--faint)}
.tabs span.on{color:var(--ink);font-weight:500;border-bottom:2.5px solid var(--gold);margin-bottom:-1.5px}
.summary{margin-top:10px;line-height:16.25px;color:var(--ink)}
.group{margin-top:9px}
.group h4{font-weight:500;font-size:11.5px;line-height:16px;color:var(--ink)}
.group h4 .c{color:var(--faint);font-weight:400;font-size:9.5px;margin-left:6px}
.group li{position:relative;padding-left:13px;margin-top:5px;color:var(--ink)}
.group li::before{content:'';position:absolute;left:1px;top:6px;width:5px;height:5px;border-radius:50%;background:var(--gold)}
.group h4 + ul > li:first-child{margin-top:4px}
.group.tasks li{padding-left:19px}
.group.tasks li::before{width:11px;height:11px;border-radius:3px;background:none;border:1.3px solid var(--box);top:2.5px;left:0}
.m{color:var(--muted)}
.tag{display:inline-block;margin-left:6px;padding:0 7px;height:17.5px;line-height:15.5px;border:1px solid var(--chip-line);background:var(--chip);border-radius:999px;font-size:8px;font-weight:400;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);vertical-align:1px}
.foot{display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:9px;border-top:1px dashed #d5dbd3}
.chipname{background:#e9ece4;border-radius:999px;padding:2px 10px;font-size:9.5px;line-height:14px;color:var(--muted);font-weight:400}
.ai{font-size:9px;color:var(--faint);font-weight:400}

.after{margin-top:16px;padding:12px 15px 12px}
.after ul{margin-top:2px}
.pilot{margin-top:16px;background:var(--pilot);border:1px solid var(--pilot-line);border-radius:16px;padding:10px 14px 11px}
.pilot h5{font-weight:500;font-size:11.5px;line-height:16px;color:var(--ink)}
.pilot p{font-size:10.5px;line-height:15px;color:var(--muted);margin-top:1px}

footer{position:absolute;left:32px;right:32px;bottom:10px;display:flex;justify-content:space-between;align-items:center}
footer .fine{font-size:9px;color:var(--faint);font-weight:400;position:relative;top:-3.5px}
footer .site{display:flex;align-items:center;gap:7px;font-family:'Playfair Display';font-weight:700;font-size:11px;color:var(--ink)}
</style></head>
<body>
<header>
  <div class="top"><div class="brand">${LOGO(22, false)}<span>${esc(s.brand)}</span></div><div class="url">${esc(s.url)}</div></div>
  <h1>${esc(p.title[0])}<em>${esc(p.title[1])}</em></h1>
  <p class="sub">${esc(p.subtitle)}</p>
</header>
<main>
  <div class="col left">
    <div class="eyebrow"><span class="n">${s1.num}</span><span class="dot"></span>${esc(s1.eyebrow)}</div>
    <section class="card">
      <h2>${esc(s1.heading)}</h2>
      <p class="lede">${s1.lede.map(esc).join('<br>')}</p>
      <ul class="dots">${s1.bullets.map((b) => `<li>${item(b)}</li>`).join('')}</ul>
    </section>
    <div class="eyebrow"><span class="n">${s2.num}</span><span class="dot"></span>${esc(s2.eyebrow)}</div>
    <section class="card">
      <h2>${esc(s2.heading)}</h2>
      <ol class="steps">${s2.steps.map((t, i) => `<li><span class="k">${i + 1}</span>${item(t)}</li>`).join('')}</ol>
    </section>
    <div class="eyebrow"><span class="n">${s3.num}</span><span class="dot"></span>${esc(s3.eyebrow)}</div>
    <section class="card">
      <h2>${esc(s3.heading)}</h2>
      <ul class="dots">${s3.bullets.map((b) => `<li>${item(b)}</li>`).join('')}</ul>
    </section>
  </div>
  <div class="col right">
    <div class="eyebrow"><span class="dot"></span>${esc(s.noteEyebrow)}</div>
    <section class="card note">
      <h3>${esc(n.title)}</h3>
      <div class="meta">${esc(n.meta)}</div>
      <div class="tabs"><span class="on">${esc(s.tabs[0])}</span><span>${esc(s.tabs[1])}</span></div>
      <p class="summary">${esc(n.summary)}</p>
      ${n.groups
        .map(
          (g) => `<div class="group${g.kind === 'tasks' ? ' tasks' : ''}"><h4>${esc(g.label)}<span class="c">${g.items.length}</span></h4>
        <ul>${g.items.map((it) => `<li>${item(it)}</li>`).join('')}</ul></div>`,
        )
        .join('')}
      <div class="foot"><span class="chipname">${esc(n.chip)}</span><span class="ai">${esc(s.aiLine)}</span></div>
    </section>
    <section class="card after">
      <h2>${esc(s.afterHeading)}</h2>
      <ul class="dots">${p.after.map((b) => `<li>${item(b)}</li>`).join('')}</ul>
    </section>
    <aside class="pilot"><h5>${esc(p.pilot.heading)}</h5><p>${esc(p.pilot.text)}</p></aside>
  </div>
</main>
<footer><span class="fine">${esc(s.footer)}</span><span class="site">${LOGO(18, true)}${esc(s.site)}</span></footer>
</body></html>`;
}

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
for (const [key, prof] of Object.entries(block.professions)) {
  if (ONLY && ONLY !== key) continue;
  const tab = await ctx.newPage();
  await tab.setContent(page(prof, block.shared), { waitUntil: 'load' });
  await tab.evaluate(() => document.fonts.ready);
  // Fail loudly rather than print a page whose text runs past the footer or spills a second page.
  const overflow = await tab.evaluate(() => {
    const footTop = document.querySelector('footer').getBoundingClientRect().top;
    const bottoms = [...document.querySelectorAll('.col')].map((c) => c.getBoundingClientRect().bottom);
    return Math.max(...bottoms) > footTop - 8 ? Math.round(Math.max(...bottoms) - footTop) : 0;
  });
  if (overflow) throw new Error(`${key}: content overlaps the footer by ${overflow}px`);
  const pdf = join(OUT, `${prof.file}.pdf`);
  await tab.pdf({ path: pdf, format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true });
  if (PNG) await tab.screenshot({ path: join(OUT, `${prof.file}.png`), fullPage: false });
  console.log(`wrote ${pdf}`);
  await tab.close();
}
await browser.close();
