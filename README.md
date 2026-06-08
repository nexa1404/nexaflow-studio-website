# NexaFlow Studio — Web Oficial

Sitio web estático de NexaFlow Studio. Diseño premium con GSAP, canvas interactivo y animaciones scroll.

## Stack

- HTML5 + CSS3 + Vanilla JS (sin frameworks, sin npm)
- GSAP 3 + ScrollTrigger (local, en `/lib`)
- Fuentes: Space Grotesk + Syne vía Google Fonts

## Estructura

```
nexaflow-website/
├── index.html          ← página principal
├── styles.css          ← todos los estilos
├── main.js             ← toda la lógica JS
├── vercel.json         ← cabeceras de caché para Vercel
├── .gitignore
├── assets/
│   └── img/
│       └── tech-abstract.jpg
└── lib/
    ├── gsap.min.js
    └── ScrollTrigger.min.js
```

## Deploy en Vercel

1. Sube este repo a GitHub
2. En [vercel.com](https://vercel.com) → **Add New Project**
3. Importa el repositorio de GitHub
4. Framework Preset: **Other**
5. Build Command: *(vacío)*
6. Output Directory: *(vacío / raíz)*
7. Pulsa **Deploy**

El `vercel.json` ya gestiona las cabeceras de caché automáticamente.

## Deploy en Hostinger (FTP)

Sube toda la carpeta al directorio `public_html` de tu hosting vía FTP.

## Actualizar la web

Después de editar archivos, cambia la versión en `index.html`:
```html
<link rel="stylesheet" href="styles.css?v=YYYYMMDD">
<script defer src="main.js?v=YYYYMMDD"></script>
```

---

**Contacto:** hola@nexaflowestudio.com
