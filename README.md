# IceYT — versión sin Node.js ❄

Esta versión no necesita Node.js, npm ni comandos en tu PC.

## Cómo funciona

IceYT lee automáticamente la carpeta `videos/` de un repositorio público de GitHub usando la API de GitHub. Netlify solamente aloja la página.

Cada vídeo debe tener:

```text
videos/
└── Nombre del video/
    ├── video.mp4
    ├── thumbnail.jpg
    └── info.txt
```

El nombre de la carpeta se convierte en el título.

`info.txt`:

```text
description=Descripción del video
duration=03:42
author=Vapy
date=2026-08-12
category=Gaming
```

## Configuración única

1. Crea un repositorio público en GitHub.
2. Sube todo el contenido de esta carpeta al repositorio.
3. Dentro de `app.js`, cambia:

```js
githubOwner: "TU_USUARIO",
githubRepo: "TU_REPOSITORIO",
githubBranch: "main"
```

4. Conecta ese repositorio a Netlify.
5. Cada vez que agregues una carpeta dentro de `videos/` y hagas push a GitHub, IceYT la detectará automáticamente.

No necesitas Node.js.

## Importante

GitHub tiene límites de tamaño para archivos. Para vídeos grandes, GitHub no es el almacenamiento adecuado. Podemos cambiar posteriormente el sistema para usar un CDN/storage de vídeo mientras GitHub solamente guarda el catálogo y las miniaturas.
