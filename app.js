const CONFIG = {
  githubOwner: "Vapyrestrepo",
  githubRepo: "IceYT",
  githubBranch: "main",
  videosPath: "videos"
};

let videos = [];
const grid = document.querySelector("#videoGrid");
const empty = document.querySelector("#emptyState");
const search = document.querySelector("#searchInput");
const sort = document.querySelector("#sortSelect");
const modal = document.querySelector("#playerModal");
const player = document.querySelector("#player");
const embed = document.querySelector("#playerEmbed");

function safe(text="") {
  return String(text).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function rawUrl(path) {
  return `https://raw.githubusercontent.com/${CONFIG.githubOwner}/${CONFIG.githubRepo}/${CONFIG.githubBranch}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

function apiUrl(path) {
  return `https://api.github.com/repos/${encodeURIComponent(CONFIG.githubOwner)}/${encodeURIComponent(CONFIG.githubRepo)}/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(CONFIG.githubBranch)}`;
}

async function githubContents(path) {
  const res = await fetch(apiUrl(path), {
    headers: { Accept: "application/vnd.github+json" }
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${path}`);
  return res.json();
}

async function textFile(path) {
  const res = await fetch(rawUrl(path));
  if (!res.ok) return "";
  return res.text();
}

function parseInfo(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const i = line.indexOf("=");
    if (i > 0) {
      out[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
    }
  }
  return out;
}

function oneDriveSrc(value) {
  // Accept either a normal OneDrive embed URL or a full <iframe> pasted into info.txt.
  if (!value) return "";
  const match = value.match(/src=["']([^"']+)["']/i);
  return match ? match[1] : value.trim();
}

async function discoverVideos() {
  const folders = await githubContents(CONFIG.videosPath);
  const dirs = folders.filter(x => x.type === "dir");
  const result = [];

  for (const dir of dirs) {
    const folderPath = `${CONFIG.videosPath}/${dir.name}`;
    const items = await githubContents(folderPath);
    const thumb = items.find(x => /^thumbnail\.(jpg|jpeg|png|webp|svg)$/i.test(x.name));
    const infoItem = items.find(x => x.name.toLowerCase() === "info.txt");
    const info = infoItem ? parseInfo(await textFile(infoItem.path)) : {};

    // A video may live in OneDrive. A local MP4 is also supported for future use.
    const localVideo = items.find(x => /\.(mp4|webm|ogg)$/i.test(x.name));
    const drive = oneDriveSrc(info.onedrive || info.embed || "");
    if (!drive && !localVideo) continue;

    result.push({
      id: folderPath,
      title: dir.name,
      description: info.description || "",
      duration: info.duration || "",
      author: info.author || "IceYT",
      date: info.date || "",
      category: info.category || "",
      video: localVideo ? rawUrl(localVideo.path) : "",
      embed: drive,
      thumbnail: thumb ? rawUrl(thumb.path) : "./default-thumbnail.svg"
    });
  }

  return result;
}

async function loadCatalog() {
  try {
    videos = await discoverVideos();
    render();
  } catch (err) {
    grid.innerHTML = `<div class="empty">No pude leer la carpeta <code>videos/</code>.<br><br>${safe(err.message)}<br><br>❄ Revisa que el repositorio sea público y que exista <code>videos/</code>.</div>`;
    console.error(err);
  }
}

function render() {
  const q = search.value.trim().toLowerCase();
  let list = videos.filter(v =>
    (v.title + " " + (v.description || "") + " " + (v.author || "")).toLowerCase().includes(q)
  );

  list.sort((a, b) => {
    if (sort.value === "title") return a.title.localeCompare(b.title);
    return sort.value === "oldest"
      ? (a.date || "").localeCompare(b.date || "")
      : (b.date || "").localeCompare(a.date || "");
  });

  grid.innerHTML = list.map(v => `
    <article class="video-card" data-id="${safe(v.id)}">
      <div class="thumb">
        <img src="${safe(v.thumbnail)}" alt="" loading="lazy">
        <span class="duration">${safe(v.duration || "")}</span>
      </div>
      <div class="card-body">
        <h3 class="title">${safe(v.title)}</h3>
        <p class="description">${safe(v.description || "Sin descripción.")}</p>
        <div class="meta">${safe(v.author || "IceYT")} · ${safe(v.date || "")}</div>
      </div>
    </article>
  `).join("");

  empty.hidden = list.length !== 0;
  document.querySelector("#resultsTitle").textContent =
    `Videos${q ? ` para “${search.value}”` : ""}`;

  grid.querySelectorAll(".video-card").forEach(card => {
    card.addEventListener("click", () => openVideo(card.dataset.id));
  });
}

function openVideo(id) {
  const v = videos.find(x => x.id === id);
  if (!v) return;

  player.hidden = true;
  embed.hidden = true;

  if (v.embed) {
    embed.src = v.embed;
    embed.hidden = false;
  } else {
    player.src = v.video;
    player.poster = v.thumbnail;
    player.hidden = false;
  }

  document.querySelector("#playerTitle").textContent = v.title;
  document.querySelector("#playerDescription").textContent = v.description || "";
  document.querySelector("#playerMeta").textContent =
    `${v.author || "IceYT"} · ${v.duration || "Duración desconocida"}`;

  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeVideo() {
  player.pause();
  player.removeAttribute("src");
  player.load();

  embed.src = "about:blank";
  embed.hidden = true;
  player.hidden = false;

  modal.hidden = true;
  document.body.style.overflow = "";
}

document.querySelector("#closePlayer").onclick = closeVideo;

modal.addEventListener("click", e => {
  if (e.target === modal) closeVideo();
});

document.querySelector("#fullscreenBtn").onclick = () => {
  const active = !embed.hidden ? embed : player;
  active.requestFullscreen?.();
};

search.addEventListener("input", render);
document.querySelector("#searchBtn").onclick = render;
sort.addEventListener("change", render);

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !modal.hidden) closeVideo();
});

loadCatalog();
