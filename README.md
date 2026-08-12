# IceYT — prueba OneDrive ❄

Esta versión no necesita Node.js ni npm.

## Vídeo de prueba

La carpeta:

`videos/Portal test gameplay/`

contiene `info.txt` con el enlace de inserción de OneDrive. El MP4 de 742 MB permanece en OneDrive y NO se sube a GitHub.

## Estructura para futuros vídeos

```text
videos/
└── Nombre del video/
    ├── thumbnail.jpg
    └── info.txt
```

Ejemplo de `info.txt`:

```text
description=Descripción del vídeo
duration=01:15:00
author=Vapy
date=2026-08-12
category=Gaming
onedrive=https://1drv.ms/...
```

También se acepta pegar el `<iframe ...>` completo después de `onedrive=`.

## Publicación

El repositorio ya está configurado para `Vapyrestrepo/IceYT`. En Netlify no debe haber Build command; es una página estática.

## Privacidad

IceYT no muestra el correo de la cuenta en su propia interfaz. El reproductor es el embed de OneDrive, por lo que cualquier identidad que Microsoft decida mostrar dentro de su propio reproductor/interfaz depende de OneDrive.
