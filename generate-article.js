// ══════════════════════════════════════════════════════════════
// NEXUS GAMING — Generador Automático de Artículos con Claude AI
// ══════════════════════════════════════════════════════════════
//
// USO:
//   node generate-article.js "mejores juegos RPG 2025"
//   node generate-article.js  (elige tema automáticamente)
//
// REQUISITOS:
//   npm install @anthropic-ai/sdk @octokit/rest dotenv
//
// VARIABLES DE ENTORNO (.env):
//   ANTHROPIC_API_KEY=sk-ant-...
//   GITHUB_TOKEN=ghp_...
//   GITHUB_OWNER=silvafranco444-code
//   GITHUB_REPO=nexus-gaming
// ══════════════════════════════════════════════════════════════

require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const { Octokit } = require('@octokit/rest');

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const github = new Octokit({ auth: process.env.GITHUB_TOKEN });

const OWNER = process.env.GITHUB_OWNER;
const REPO  = process.env.GITHUB_REPO;

// Temas predefinidos para rotación automática
const TEMAS_AUTO = [
  "mejores juegos gratis PC 2025",
  "build PC gamer barata Argentina 2025",
  "como comprar juegos baratos PS5 Argentina",
  "mejores auriculares gaming baratos menos de 50 dolares",
  "review Elden Ring vale la pena en 2025",
  "comparativa Steam Deck vs ROG Ally",
  "mejores juegos indie 2025",
  "guia para empezar en PC gaming desde cero Argentina",
  "mejores monitores gaming baratos 2025",
  "como mejorar FPS en juegos sin gastar plata",
  "Xbox Game Pass vs PlayStation Plus comparativa",
  "mejores juegos cooperativos para jugar con amigos",
];

const EMOJI_MAP = {
  'GUIAS':       '📖',
  'REVIEWS':     '⭐',
  'HARDWARE':    '🖥️',
  'DEALS':       '💸',
  'TIPS':        '💡',
  'COMPARATIVAS':'⚔️',
  'NOTICIAS':    '📰',
  'ESPORTS':     '🏆',
};

// ════════════════════════════════════════
// 1 — Generar artículo con Claude AI
// ════════════════════════════════════════
async function generarArticulo(tema) {
  console.log('\n🤖 Generando artículo sobre: "' + tema + '"\n');

  const hoy = new Date().toLocaleDateString('es-AR', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const prompt = `Sos el redactor principal de NEXUS GAMING, un blog de videojuegos para el mercado argentino.

Genera un artículo en formato JSON con esta estructura EXACTA (solo el JSON, sin texto extra):

{
  "titulo": "titulo maximo 60 caracteres con keyword",
  "slug": "url-amigable-minusculas-guiones",
  "categoria": "una de: GUIAS, REVIEWS, HARDWARE, DEALS, TIPS, COMPARATIVAS, NOTICIAS, ESPORTS",
  "excerpt": "descripcion 150-180 caracteres para la card del blog",
  "emoji": "emoji relevante",
  "fecha": "${hoy}",
  "lectura": "X min",
  "badge": "HOT o NUEVO o TRENDING o DEAL o GOTY o null",
  "afiliado": {
    "texto": "texto del boton",
    "url": "url de afiliado (Amazon con tag=nexusgamingar-21 o Humble Bundle con partner=nexusgaming)",
    "rel": "noopener sponsored"
  },
  "contenido": {
    "intro": "2 parrafos de introduccion separados por doble salto de linea",
    "secciones": [
      { "subtitulo": "subtitulo H2", "texto": "contenido minimo 200 palabras" },
      { "subtitulo": "subtitulo H2", "texto": "contenido minimo 200 palabras" },
      { "subtitulo": "subtitulo H2", "texto": "contenido minimo 200 palabras" },
      { "subtitulo": "subtitulo H2", "texto": "contenido minimo 200 palabras" }
    ],
    "conclusion": "parrafo de conclusion con llamado a la accion"
  }
}

TEMA: ${tema}

REGLAS:
- Escribi en espanol argentino (usa vos, pila, grosso naturalmente)
- Contexto economico argentino (precios en dolares/pesos, disponibilidad local)
- Contenido util, honesto y original
- Link de afiliado relevante al tema`;

  const response = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }]
  });

  const texto = response.content[0].text.trim();
  const jsonLimpio = texto.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  const articulo = JSON.parse(jsonLimpio);

  console.log('✅ Artículo generado: "' + articulo.titulo + '"');
  return articulo;
}

// ════════════════════════════════════════
// 2 — Leer articles.json desde GitHub
// ════════════════════════════════════════
async function leerArticlesJson() {
  try {
    const { data } = await github.repos.getContent({
      owner: OWNER, repo: REPO, path: 'articles.json'
    });
    const contenido = Buffer.from(data.content, 'base64').toString('utf8');
    return { articles: JSON.parse(contenido), sha: data.sha };
  } catch (err) {
    if (err.status === 404) {
      console.log('⚠ articles.json no encontrado, creando nuevo...');
      return { articles: [], sha: null };
    }
    throw err;
  }
}

// ════════════════════════════════════════
// 3 — Agregar al JSON
// ════════════════════════════════════════
function agregarAlJson(articles, nuevo) {
  const maxId = articles.reduce((max, a) => Math.max(max, parseInt(a.id) || 0), 0);
  const id = String(maxId + 1).padStart(3, '0');

  const entrada = {
    id,
    slug:      nuevo.slug,
    titulo:    nuevo.titulo,
    categoria: nuevo.categoria,
    excerpt:   nuevo.excerpt,
    emoji:     nuevo.emoji || EMOJI_MAP[nuevo.categoria] || '🎮',
    fecha:     nuevo.fecha,
    lectura:   nuevo.lectura,
    badge:     nuevo.badge || null,
    afiliado:  nuevo.afiliado
  };

  return [entrada, ...articles];
}

// ════════════════════════════════════════
// 4 — Publicar articles.json en GitHub
// ════════════════════════════════════════
async function publicarJson(articles, sha) {
  const contenido = JSON.stringify(articles, null, 2);
  const encoded   = Buffer.from(contenido).toString('base64');

  const params = {
    owner:   OWNER,
    repo:    REPO,
    path:    'articles.json',
    message: 'AUTO: Nuevo articulo - ' + articles[0].titulo,
    content: encoded,
  };
  if (sha) params.sha = sha;

  await github.repos.createOrUpdateFileContents(params);
  console.log('📤 articles.json actualizado en GitHub');
}

// ════════════════════════════════════════
// 5 — Publicar HTML del artículo
// ════════════════════════════════════════
async function publicarHtmlArticulo(articulo) {
  const secciones = articulo.contenido.secciones
    .map(function(s) {
      return '<h2>' + s.subtitulo + '</h2>\n<p>' + s.texto.replace(/\n\n/g, '</p><p>') + '</p>';
    })
    .join('\n\n');

  const afiliadoHtml = articulo.afiliado
    ? '<div class="afiliado-box"><p>* Link de afiliado — si compras a traves de este link, Nexus Gaming recibe una comision sin costo extra para vos.</p><a class="afiliado-btn" href="' + articulo.afiliado.url + '" rel="' + articulo.afiliado.rel + '" target="_blank">🛒 ' + articulo.afiliado.texto + '</a></div>'
    : '';

  const html = '<!DOCTYPE html>\n<html lang="es">\n<head>\n' +
    '<meta charset="UTF-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '<meta name="description" content="' + articulo.excerpt + '">\n' +
    '<title>' + articulo.titulo + ' — Nexus Gaming</title>\n' +
    '<link rel="canonical" href="https://nexus-gaming-ar.netlify.app/articles/' + articulo.slug + '.html">\n' +
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
    '<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Barlow:wght@300;400;600&display=swap" rel="stylesheet">\n' +
    '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5951124570509449" crossorigin="anonymous"></script>\n' +
    '<style>\n' +
    ':root{--cyan:#00e5ff;--pink:#ff1744;--gold:#ffd600;--bg:#04060e;--bg-card:#080d1a;--text:#e8edf8;--muted:#5c6e8a;}\n' +
    '*{box-sizing:border-box;margin:0;padding:0;}\n' +
    'body{background:var(--bg);color:var(--text);font-family:Barlow,sans-serif;}\n' +
    'body::before{content:"";position:fixed;inset:0;background-image:linear-gradient(rgba(0,229,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.03) 1px,transparent 1px);background-size:48px 48px;pointer-events:none;z-index:0;}\n' +
    'nav{position:sticky;top:0;z-index:500;background:rgba(4,6,14,0.9);backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,229,255,0.12);padding:0 1.5rem;display:flex;align-items:center;height:60px;}\n' +
    '.nav-logo{font-family:Orbitron,monospace;font-weight:900;font-size:1.2rem;color:var(--cyan);text-shadow:0 0 18px var(--cyan);letter-spacing:4px;text-decoration:none;}\n' +
    '.wrap{max-width:780px;margin:0 auto;padding:3rem 1.5rem 5rem;position:relative;z-index:1;}\n' +
    '.cat{font-size:0.65rem;letter-spacing:4px;text-transform:uppercase;color:var(--pink);margin-bottom:0.75rem;display:block;}\n' +
    'h1{font-family:Orbitron,monospace;font-size:clamp(1.5rem,4vw,2.4rem);font-weight:900;line-height:1.2;margin-bottom:1.25rem;}\n' +
    '.meta{font-size:0.75rem;color:var(--muted);letter-spacing:1px;margin-bottom:2.5rem;display:flex;gap:1.5rem;flex-wrap:wrap;}\n' +
    '.body h2{font-family:Orbitron,monospace;font-size:1.15rem;font-weight:700;color:var(--cyan);margin:2.5rem 0 1rem;}\n' +
    '.body p{font-size:0.97rem;line-height:1.85;color:#c8d3e8;margin-bottom:1.25rem;}\n' +
    '.afiliado-box{background:rgba(0,229,255,0.05);border:1px solid rgba(0,229,255,0.2);border-radius:8px;padding:1.5rem;margin:2.5rem 0;text-align:center;}\n' +
    '.afiliado-box p{font-size:0.85rem;color:var(--muted);margin-bottom:1rem;}\n' +
    '.afiliado-btn{display:inline-block;background:var(--cyan);color:var(--bg);padding:0.8rem 2rem;border-radius:4px;font-family:Orbitron,monospace;font-size:0.75rem;font-weight:700;letter-spacing:2px;text-decoration:none;}\n' +
    '.afiliado-btn:hover{box-shadow:0 0 20px var(--cyan);}\n' +
    '.back{display:inline-block;margin-bottom:2rem;font-size:0.8rem;color:var(--cyan);letter-spacing:2px;text-decoration:none;}\n' +
    '.ad{margin:2rem 0;text-align:center;}\n' +
    '</style>\n</head>\n<body>\n' +
    '<nav><a href="/" class="nav-logo">NEXUS</a></nav>\n' +
    '<div class="wrap">\n' +
    '<a href="/" class="back">← VOLVER AL INICIO</a>\n' +
    '<span class="cat">' + articulo.categoria + '</span>\n' +
    '<h1>' + articulo.titulo + '</h1>\n' +
    '<div class="meta"><span>📅 ' + articulo.fecha + '</span><span>⏱ ' + articulo.lectura + '</span><span style="color:var(--pink)">NEXUS GAMING</span></div>\n' +
    '<div class="ad"><ins class="adsbygoogle" style="display:block;width:100%;height:90px;" data-ad-client="ca-pub-5951124570509449" data-ad-slot="auto" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>\n' +
    '<div class="body">\n' +
    '<p>' + articulo.contenido.intro.replace(/\n\n/g, '</p><p>') + '</p>\n' +
    secciones + '\n' +
    '<div class="ad"><ins class="adsbygoogle" style="display:block;width:100%;height:250px;" data-ad-client="ca-pub-5951124570509449" data-ad-slot="auto" data-ad-format="auto"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>\n' +
    '<p>' + articulo.contenido.conclusion + '</p>\n' +
    '</div>\n' +
    afiliadoHtml + '\n' +
    '</div>\n</body>\n</html>';

  const encoded = Buffer.from(html).toString('base64');
  const path    = 'articles/' + articulo.slug + '.html';

  let existingSha = null;
  try {
    const { data } = await github.repos.getContent({ owner: OWNER, repo: REPO, path });
    existingSha = data.sha;
  } catch(e) {}

  const params = {
    owner: OWNER, repo: REPO, path,
    message: 'AUTO: Pagina articulo - ' + articulo.titulo,
    content: encoded,
  };
  if (existingSha) params.sha = existingSha;

  await github.repos.createOrUpdateFileContents(params);
  console.log('📄 HTML publicado: articles/' + articulo.slug + '.html');
}

// ════════════════════════════════════════
// MAIN
// ════════════════════════════════════════
async function main() {
  const requeridas = ['ANTHROPIC_API_KEY', 'GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO'];
  const faltantes  = requeridas.filter(function(k) { return !process.env[k]; });

  if (faltantes.length) {
    console.error('❌ Faltan variables de entorno: ' + faltantes.join(', '));
    console.error('   Creá un archivo .env con esas variables.');
    process.exit(1);
  }

  const tema = process.argv[2] || TEMAS_AUTO[Math.floor(Math.random() * TEMAS_AUTO.length)];

  try {
    const articulo      = await generarArticulo(tema);
    const { articles, sha } = await leerArticlesJson();
    const actualizados  = agregarAlJson(articles, articulo);

    await publicarJson(actualizados, sha);
    await publicarHtmlArticulo(articulo);

    console.log('\n🎉 Artículo publicado exitosamente!');
    console.log('🌐 URL: https://nexus-gaming-ar.netlify.app/articles/' + articulo.slug + '.html');
    console.log('📊 Total artículos: ' + actualizados.length + '\n');

  } catch (err) {
    console.error('\n❌ Error: ' + err.message);
    process.exit(1);
  }
}

main();
