# 🤖 Nexus Gaming — Automatización con Claude AI

## ¿Qué hace este script?

Genera artículos completos con Claude AI y los publica automáticamente en tu web de Netlify sin que tengas que hacer nada manualmente.

Cada vez que lo ejecutás:
1. Claude AI escribe un artículo completo en español argentino
2. Lo agrega a `articles.json` (aparece en la home)
3. Crea una página HTML individual del artículo con AdSense integrado
4. Sube todo a GitHub → Netlify lo publica automáticamente

---

## ⚙️ Instalación (solo la primera vez)

### Paso 1 — Instalar Node.js
Bajá Node.js desde: https://nodejs.org (versión LTS)

### Paso 2 — Instalar dependencias
Abrí una terminal en la carpeta del proyecto y ejecutá:
```
npm install @anthropic-ai/sdk @octokit/rest dotenv
```

### Paso 3 — Crear archivo .env
Copiá el archivo `.env.example` y renombralo a `.env`:
```
cp .env.example .env
```

Luego editá `.env` con tus claves:

**ANTHROPIC_API_KEY:**
1. Entrá a https://console.anthropic.com
2. Andá a "API Keys"
3. Creá una nueva key y copiala

**GITHUB_TOKEN:**
1. Entrá a GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
2. Generá un nuevo token
3. Tildá el permiso: `repo` (acceso completo)
4. Copiá el token

---

## 🚀 Uso

### Generar artículo sobre tema específico:
```
node generate-article.js "mejores juegos RPG 2025"
```

### Generar artículo con tema automático:
```
node generate-article.js
```

---

## ⏰ Automatizar completamente (publicar solo)

### En Windows (Programador de tareas):
1. Abrí "Programador de tareas"
2. Creá una tarea nueva
3. Acción: `node C:\ruta\generate-article.js`
4. Configurá cada 2 días o 3 veces por semana

### En Mac/Linux (cron):
Abrí la terminal y ejecutá `crontab -e`, luego agregá:
```
# Publica un artículo los lunes, miércoles y viernes a las 10am
0 10 * * 1,3,5 cd /ruta/a/tu/proyecto && node generate-article.js
```

---

## 📁 Estructura de archivos

```
nexus-gaming/
├── index.html          ← Página principal (carga articles.json)
├── articles.json       ← Base de datos de artículos
├── articles/
│   ├── slug-del-articulo.html   ← Páginas individuales
│   └── ...
├── generate-article.js ← Script de automatización
├── .env               ← Tus claves secretas (NO subir a GitHub)
└── .env.example       ← Ejemplo de variables
```

---

## ⚠️ Importante

- NUNCA subas el archivo `.env` a GitHub (tiene tus claves secretas)
- Agregá `.env` a tu `.gitignore`
- Cada artículo generado cuesta aproximadamente $0.01-0.03 USD en API de Claude
- 3 artículos por semana = aprox $0.15-0.45 USD/mes en costos de API

---

## 💰 Costos estimados

| Servicio | Costo |
|----------|-------|
| Claude API (3 art/semana) | ~$0.30/mes |
| Netlify | Gratis |
| GitHub | Gratis |
| **Total** | **~$0.30/mes** |

Ingresos estimados a 6 meses: $200-500 USD/mes (AdSense + afiliados)
