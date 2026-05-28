// content.js

// ─── Garde contexte invalidé ─────────────────────────────────────────────────
function _isInvalidatedError(e) {
  return e?.message === "Extension context invalidated.";
}
window.addEventListener("unhandledrejection", (ev) => {
  if (_isInvalidatedError(ev.reason)) { ev.preventDefault(); _pauseForContextRecovery(); }
});
window.addEventListener("error", (ev) => {
  if (_isInvalidatedError(ev.error)) { ev.preventDefault(); _pauseForContextRecovery(); }
});

// ─── State ───────────────────────────────────────────────────────────────────
let lastPayload       = null;
let lastTitle         = null;
let cachedPoster      = null;
let currentVideo      = null;
let pollHandle        = null;
let isTabHidden       = document.visibilityState === "hidden";
let noVideoCount      = 0;
let _contextRetryTimer = null;

chrome.runtime.onMessage.addListener((msg) => {
  if (!isContextValid()) return;
  if (msg?.kind === "prefs_updated") {
    lastPayload = null;
    tick();
  }
  if (msg?.kind === "media_control") {
    if (!currentVideo) return;
    if (currentVideo.paused) currentVideo.play().catch(() => {});
    else currentVideo.pause();
  }
  if (msg?.kind === "media_prev" || msg?.kind === "media_next") {
    const dir = msg.kind === "media_next" ? "next" : "prev";
    clickEpisodeBtn(dir);
  }
});

// Aria-label cache Cinepulse
let _ariaLabel = null;
let _ariaInfo  = null;

// ─── Site détecté ─────────────────────────────────────────────────────────────
const IS_YOUTUBE     = location.hostname.includes("youtube.com");
const IS_NAKASTREAM  = location.hostname.includes("nakastream.tv");
const IS_TWITCH      = location.hostname.includes("twitch.tv");
const IS_PRIME_VIDEO = location.hostname.includes("primevideo.com");

// ─── Constants ───────────────────────────────────────────────────────────────
const GENERIC_TITLES = [
  "plateforme multimédia en ligne","plateforme multimedia en ligne",
  "cinepulse","streaming","accueil","home","watch","player","video player"
];

// ─── Nakastream info ─────────────────────────────────────────────────────────
function getNakastreamInfo() {
  const params     = new URLSearchParams(location.search);
  const title      = params.get("title")
    || document.querySelector("span.nk-title")?.textContent?.trim()
    || null;
  const posterPath = params.get("poster");
  const poster     = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;
  const type       = params.get("type"); // "movie" ou "serie"
  const season     = params.get("season") || params.get("s");
  const ep         = params.get("episode") || params.get("ep") || params.get("e");
  const episodeTitle = params.get("ep_title") || params.get("episode_title") || params.get("etitle") || null;
  const contentType  = type === "movie" ? "movie" : "series";
  return { title, poster, contentType, seasonNum: season ? Number(season) : null, episodeNum: ep ? Number(ep) : null, episodeTitle };
}

// ─── YouTube SPA tracker ──────────────────────────────────────────────────────
const YouTubeSPA = (() => {
  if (!IS_YOUTUBE) return null;

  let currentVideoId  = null;
  let onChangeCb      = null;
  let debounceTimer   = null;

  function getVideoId() {
    const v = new URLSearchParams(location.search).get("v");
    if (v) return v;
    const s = location.pathname.match(/^\/shorts\/([^/?]+)/);
    if (s) return s[1];
    return null;
  }

  function notify(reason) {
    const newId = getVideoId();
    if (newId === currentVideoId) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const finalId = getVideoId();
      if (finalId === currentVideoId) return;
      currentVideoId = finalId;
      onChangeCb?.({ newId: finalId, reason });
    }, 150);
  }

  // Source 1 : événements custom YouTube
  document.addEventListener("yt-navigate-finish",   () => notify("yt-navigate-finish"));
  document.addEventListener("yt-page-data-updated", () => notify("yt-page-data-updated"));

  // Source 2 : monkey-patch history API
  const origPush    = history.pushState;
  const origReplace = history.replaceState;
  history.pushState = function () {
    const r = origPush.apply(this, arguments);
    notify("pushState");
    return r;
  };
  history.replaceState = function () {
    const r = origReplace.apply(this, arguments);
    notify("replaceState");
    return r;
  };
  window.addEventListener("popstate", () => notify("popstate"));

  // Source 3 : MutationObserver sur <title>
  const titleEl = document.querySelector("title");
  if (titleEl) new MutationObserver(() => notify("title")).observe(titleEl, { childList: true });

  // Source 4 : poll léger 1s (filet de sécurité) — uniquement si une vidéo est active
  setInterval(() => { if (getVideoId()) notify("poll"); }, 1000);

  return {
    onChange(cb) { onChangeCb = cb; },
    init()       { currentVideoId = getVideoId(); },
    getVideoId,
    isOnWatchPage() { return !!getVideoId(); }
  };
})();

// ─── YouTube info ─────────────────────────────────────────────────────────────
function getYouTubeInfo() {
  // Titre — plusieurs sélecteurs par ordre de fiabilité
  let title = null;
  for (const sel of [
    "h1.ytd-watch-metadata yt-formatted-string",
    "h1.style-scope.ytd-watch-metadata",
    "#title h1 yt-formatted-string",
    "ytd-watch-metadata #title yt-formatted-string",
    ".ytp-title-link.yt-uix-sessionlink"
  ]) {
    const t = document.querySelector(sel)?.textContent?.trim();
    if (t) { title = t; break; }
  }
  // mediaSession en dernier recours
  if (!title && navigator.mediaSession?.metadata?.title)
    title = navigator.mediaSession.metadata.title;
  if (!title)
    title = document.title
      .replace(/^\(\d+\)\s*/, "")
      .replace(/\s*-\s*YouTube\s*$/i, "")
      .trim() || null;

  // Chaîne
  let channel = null;
  for (const sel of [
    "#top-row ytd-channel-name #text a",
    "ytd-video-owner-renderer ytd-channel-name a",
    "#owner #channel-name a",
    "#upload-info ytd-channel-name a"
  ]) {
    const t = document.querySelector(sel)?.textContent?.trim();
    if (t) { channel = t; break; }
  }

  // ID vidéo
  const videoId = new URLSearchParams(location.search).get("v");

  // Playlist
  const playlist = document.querySelector("#playlist-name")?.textContent?.trim()
    || document.querySelector("ytd-playlist-panel-renderer #title")?.textContent?.trim()
    || null;

  // Miniature
  // mqdefault = 320x180, 16:9 garanti sans bandes noires, toujours disponible
  const poster = videoId ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` : null;

  // Publicité en cours
  const isAd = !!document.querySelector(
    ".ytp-ad-player-overlay, .video-ads .ytp-ad-module:not(:empty)"
  );

  return { title, channel, videoId, playlist, poster, isAd };
}

// ─── Cinepulse : titre d'épisode depuis le DOM / document.title ──────────────
function getEpisodeTitleFromPage(seriesTitle) {
  // 1. Sélecteurs DOM courants sur les sites de streaming
  for (const sel of [
    ".episode-title", ".ep-title", ".title-episode",
    "[class*='episode'] h2", "[class*='episode'] h3",
    "[class*='episode-name']", "[class*='episodeName']",
    "h2.title", ".player-title h2", ".video-title h2",
    "[data-episode-title]"
  ]) {
    const el = document.querySelector(sel);
    const t  = (el?.getAttribute("data-episode-title") || el?.textContent)?.trim();
    if (t && t.length > 1 && t.toLowerCase() !== seriesTitle?.toLowerCase()) return t;
  }

  // 2. mediaSession (ignorer les valeurs du type "Merlin - S4:E1 \"\"")
  const ms = navigator.mediaSession?.metadata;
  if (ms?.title && ms.title !== seriesTitle && !/S\d+\s*:\s*E\d+/i.test(ms.title)) return ms.title;

  // 3. document.title : extraire la partie entre le titre de série et le suffixe plateforme
  const raw = document.title
    .replace(/\s*[-|–—]\s*Cinepulse\s*$/i, "")
    .replace(/^Cinepulse\s*[-|–—]\s*/i, "")
    .trim();
  // Enlever le nom de la série en début de chaîne puis prendre ce qui reste
  const withoutSeries = seriesTitle
    ? raw.replace(new RegExp(`^${seriesTitle.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\s*[-|–—]\\s*`,"i"), "")
    : raw;
  // Ignorer si c'est un pattern S##E## ou identique à la série
  if (withoutSeries && withoutSeries !== raw && !/^S\d+.*E\d+/i.test(withoutSeries) && withoutSeries.toLowerCase() !== seriesTitle?.toLowerCase()) {
    return withoutSeries.split(/\s*[-|–—]\s*/)[0]?.trim() || null;
  }

  return null;
}

// ─── Cinepulse aria-label (cachée) ───────────────────────────────────────────
function getPlayerAriaInfo() {
  const el = document.querySelector('[role="region"][aria-label^="Video Player"]');
  if (!el) { _ariaLabel = null; _ariaInfo = null; return null; }
  const label = el.getAttribute("aria-label");
  if (label === _ariaLabel) return _ariaInfo;
  _ariaLabel = label;
  const cleaned  = label.replace(/^Video Player\s*-\s*/i, "");
  const parts    = cleaned.split(/\s*-\s*/);
  const title    = parts[0]?.trim() || null;
  const epMatch  = cleaned.match(/S(\d+):E(\d+)/i);
  const seasonNum  = epMatch ? Number(epMatch[1]) : null;
  const episodeNum = epMatch ? Number(epMatch[2]) : null;
  // Segment entre le titre et S##:E## = titre de l'épisode
  // Le titre d'épisode est entre guillemets après S##:E## — ex: S4:E1 "The Darkest Hour"
  const quotedMatch  = cleaned.match(/S\d+\s*:\s*E\d+\s*"([^"]*)"/i);
  const episodeTitle = (quotedMatch?.[1]?.trim().length > 0) ? quotedMatch[1].trim() : null;
  _ariaInfo = title ? { title, seasonNum, episodeNum, episodeTitle } : null;
  return _ariaInfo;
}

// ─── Cinepulse titre ─────────────────────────────────────────────────────────
function isGenericTitle(t) {
  if (!t || t.length < 2 || t.length > 150) return true;
  const l = t.toLowerCase();
  return GENERIC_TITLES.some(g => l === g || l.startsWith(g));
}
function cleanTitle(t) {
  if (!t) return null;
  return t.replace(/\s*[-|–—]\s*Cinepulse.*/i, "").replace(/Cinepulse\s*[-|–—]\s*/i, "").trim() || null;
}
function isHashId(s) {
  return s.length > 15 && !/[-_]/.test(s) && /[A-Z]/.test(s) && /[0-9]/.test(s);
}
function titleFromUrl() {
  const skip = new Set([
    "film","serie","series","movie","watch","voir","streaming",
    "saison","season","episode","play","player","players","embed","vf","vostfr","vo"
  ]);
  for (const part of decodeURIComponent(location.pathname).split("/").filter(Boolean)) {
    if (!skip.has(part.toLowerCase()) && !/^\d+$/.test(part) && part.length > 2 && !isHashId(part))
      return part.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  }
  return null;
}
function getTitle(ariaInfo) {
  if (ariaInfo?.title && !isGenericTitle(ariaInfo.title)) return ariaInfo.title;
  const span = document.querySelector("span.text-pantone-400");
  if (span) {
    const t = span.textContent.trim();
    if (!isGenericTitle(t) && !t.toLowerCase().includes("cinepulse")) return t;
  }
  const fromDoc = cleanTitle(document.title);
  if (!isGenericTitle(fromDoc)) return fromDoc;
  return titleFromUrl();
}

// ─── Cinepulse poster ────────────────────────────────────────────────────────
function getPosterFromDom() {
  const og = document.querySelector('meta[property="og:image"]')?.getAttribute("content");
  if (og?.startsWith("https://") && !og.includes("logo") && !og.includes("icon")) return og;
  for (const img of document.querySelectorAll("img")) {
    const src = img.src || img.dataset?.src;
    if (!src?.startsWith("https://")) continue;
    if (src.includes("logo") || src.includes("icon") || src.includes("avatar")) continue;
    const r = img.getBoundingClientRect();
    if (r.width > 80 && r.height > 100) return src;
  }
  return null;
}

// ─── Vidéo active ────────────────────────────────────────────────────────────
function getActiveVideo() {
  if (IS_YOUTUBE) {
    // Player principal YouTube
    const main = document.querySelector("video.html5-main-video")
      || document.querySelector(".html5-video-player video");
    if (main?.duration && !isNaN(main.duration)) return main;
  }
  const videos = document.querySelectorAll("video");
  for (const v of videos) if (!v.paused && !v.ended && v.readyState >= 2) return v;
  for (const v of videos) if (v.duration > 0 && !isNaN(v.duration)) return v;
  return videos[0] || null;
}

// ─── Envoi ───────────────────────────────────────────────────────────────────
function payloadEquals(a, b) {
  if (!a || !b) return a === b;
  return a.title        === b.title        &&
         a.isPlaying    === b.isPlaying    &&
         a.episodeTitle === b.episodeTitle &&
         a.streamTitle  === b.streamTitle  &&
         a.isLive       === b.isLive       &&
         a.duration     === b.duration     &&
         a.poster       === b.poster       &&
         ((a.isLive && b.isLive) || Math.abs((a.currentTime || 0) - (b.currentTime || 0)) < 5);
}
function isContextValid() {
  try { return !!chrome.runtime?.id; } catch { return false; }
}

function sendUpdate(payload) {
  if (!isContextValid()) { _pauseForContextRecovery(); return; }
  chrome.runtime.sendMessage({ kind: "presence_update", payload }, () => {
    if (chrome.runtime.lastError) {
      if (!isContextValid()) { _pauseForContextRecovery(); return; }
      setTimeout(() => {
        if (!isContextValid()) { _pauseForContextRecovery(); return; }
        chrome.runtime.sendMessage({ kind: "presence_update", payload }, () => void chrome.runtime.lastError);
      }, 300);
    }
  });
}

// Arrêt temporaire — réessaie toutes les 2s au cas où c'est juste un redémarrage du SW.
// Après 30 tentatives (~60s) sans récupération, abandonne définitivement.
function _pauseForContextRecovery() {
  clearInterval(pollHandle);
  pollHandle = null;
  if (_contextRetryTimer) return;
  let attempts = 0;
  _contextRetryTimer = setInterval(() => {
    attempts++;
    if (isContextValid()) {
      clearInterval(_contextRetryTimer);
      _contextRetryTimer = null;
      start();
      _connectKeepalive();
    } else if (attempts >= 30) {
      clearInterval(_contextRetryTimer);
      _contextRetryTimer = null;
      detachVideo();
    }
  }, 2000);
}

function _teardown() {
  clearInterval(pollHandle);
  pollHandle = null;
  clearInterval(_contextRetryTimer);
  _contextRetryTimer = null;
  detachVideo();
}

// ─── Reset état SPA ──────────────────────────────────────────────────────────
function resetSiteState() {
  detachVideo();
  lastPayload = null; lastTitle = null; cachedPoster = null;
}

// ─── Twitch SPA tracker ───────────────────────────────────────────────────────
const TwitchSPA = (() => {
  if (!IS_TWITCH) return null;

  let currentChannel = null;
  let onChangeCb     = null;

  function getChannel() {
    return location.pathname.split("/").filter(Boolean)[0]?.toLowerCase() || null;
  }
  function notify() {
    const ch = getChannel();
    if (ch === currentChannel) return;
    currentChannel = ch;
    onChangeCb?.({ channel: ch });
  }

  const origPush    = history.pushState;
  const origReplace = history.replaceState;
  history.pushState    = function() { const r = origPush.apply(this, arguments);    setTimeout(notify, 100); return r; };
  history.replaceState = function() { const r = origReplace.apply(this, arguments); setTimeout(notify, 100); return r; };
  window.addEventListener("popstate", () => setTimeout(notify, 100));

  return {
    onChange(cb) { onChangeCb = cb; },
    init()       { currentChannel = getChannel(); },
  };
})();

// ─── Twitch info ─────────────────────────────────────────────────────────────
const TWITCH_SKIP = new Set([
  "directory","following","search","subscriptions","wallet","friends",
  "downloads","settings","store","esports","turbo","prime","bits","p","jobs"
]);

function getTwitchAvatar() {
  const streamer = location.pathname.split("/").filter(Boolean)[0]?.toLowerCase() || "";
  if (!streamer) return null;

  // Toutes les recherches filtrent sur alt === streamer pour ne jamais retourner
  // l'avatar du viewer connecté (présent dans la navbar avec son propre alt)

  for (const img of document.querySelectorAll("img.tw-image-avatar, img[class*='avatar']")) {
    if (img.alt?.toLowerCase() === streamer && img.src?.includes("jtvnw.net"))
      return normalizeTwitchAvatar(img.src);
  }

  // Fallback CDN strict : alt doit correspondre au streamer
  for (const img of document.querySelectorAll("img")) {
    if (img.src?.includes("static-cdn.jtvnw.net/jtv_user_pictures/") &&
        img.alt?.toLowerCase() === streamer)
      return normalizeTwitchAvatar(img.src);
  }

  return null;
}
function normalizeTwitchAvatar(url) {
  return url.replace(/-\d+x\d+(\.\w+)(\?.*)?$/, "-300x300$1");
}

function getTwitchInfo() {
  const streamer = location.pathname.split("/").filter(Boolean)[0] || "Twitch";

  // Titre du stream (attribut title d'abord pour avoir le texte complet non tronqué)
  const streamTitle =
    document.querySelector('[data-a-target="stream-title"]')?.getAttribute("title")?.trim()
    || document.querySelector('[data-a-target="stream-title"]')?.textContent?.trim()
    || null;

  const category =
    document.querySelector('[data-a-target="stream-game-link"]')?.textContent?.trim()
    || document.querySelector('a[href*="/directory/game/"]')?.textContent?.trim()
    || null;

  const avatar = getTwitchAvatar();
  return { streamer, streamTitle, category, avatar };
}

// ─── Prime Video SPA tracker ─────────────────────────────────────────────────
const PrimeVideoSPA = (() => {
  if (!IS_PRIME_VIDEO) return null;

  let currentPath = location.pathname;
  let onChangeCb  = null;

  function notify() {
    const newPath = location.pathname;
    if (newPath === currentPath) return;
    currentPath = newPath;
    onChangeCb?.({ path: newPath });
  }

  const origPush    = history.pushState;
  const origReplace = history.replaceState;
  history.pushState    = function() { const r = origPush.apply(this, arguments);    setTimeout(notify, 150); return r; };
  history.replaceState = function() { const r = origReplace.apply(this, arguments); setTimeout(notify, 150); return r; };
  window.addEventListener("popstate", () => setTimeout(notify, 150));

  return {
    onChange(cb) { onChangeCb = cb; },
    init()       { currentPath = location.pathname; },
  };
})();

// ─── Prime Video info ─────────────────────────────────────────────────────────
function getPrimeVideoInfo() {
  // Deux instances du player container existent dans le DOM ; querySelector renvoie
  // la première qui peut être vide. On itère pour trouver le premier texte non vide.
  let title = null;
  for (const el of document.querySelectorAll(".atvwebplayersdk-title-text")) {
    const t = el.textContent?.trim();
    if (t && t.length > 1) { title = t; break; }
  }

  let subtitle = null;
  for (const el of document.querySelectorAll(".atvwebplayersdk-subtitle-text")) {
    const t = el.textContent?.trim();
    if (t && t.length > 1) { subtitle = t; break; }
  }

  let seasonNum = null, episodeNum = null, episodeTitle = null;
  if (subtitle) {
    // Ancré sur "Saison"/"Season" pour éviter de matcher "2 h 15 min" sur un film.
    // FR "Saison 2, ép. 5 Titre"  EN "Season 2, Episode 5 · Titre"
    const m = subtitle.match(/[Ss]a?ison\s+(\d+)\D+(\d+)\s*[·•|–—-]?\s*(.*)/);
    if (m) {
      seasonNum  = Number(m[1]);
      episodeNum = Number(m[2]);
      const rawTitle = m[3]?.trim();
      if (rawTitle && rawTitle.length > 1) episodeTitle = rawTitle;
    }
  }

  const contentType = seasonNum != null ? "series" : "movie";

  // og:image renvoie le logo générique Prime Video → inutile ; TMDB prendra le relai
  // Fallback titre depuis document.title : "Prime Video: The Boys – Saison 2"
  if (!title) {
    title = document.title
      .replace(/^Prime\s*Video\s*:\s*/i, "")
      .replace(/\s*[–—-]\s*(Saison|Season)\s*\d+.*$/i, "")
      .replace(/\s*[-|–—]\s*Amazon Prime Video\s*$/i, "")
      .replace(/\s*[-|–—]\s*Prime Video\s*$/i, "")
      .trim() || null;
  }

  return { title, contentType, seasonNum, episodeNum, episodeTitle, poster: null };
}

// ─── Tick principal ───────────────────────────────────────────────────────────
async function tick() {
  try {
  if (!isContextValid()) { _teardown(); return; }
  if (isTabHidden) return;

  // Sur YouTube, n'agir que sur les pages vidéo classiques (pas les Shorts)
  if (IS_YOUTUBE && (!new URLSearchParams(location.search).get("v") || location.pathname.startsWith("/shorts/"))) {
    if (currentVideo) detachVideo();
    if (lastPayload) { lastPayload = null; sendUpdate({ type: "presence_clear" }); }
    return;
  }

  // Sur Nakastream, n'agir que sur la page /player
  if (IS_NAKASTREAM && !location.pathname.startsWith("/player")) {
    if (currentVideo) detachVideo();
    if (lastPayload) { lastPayload = null; sendUpdate({ type: "presence_clear" }); }
    return;
  }

  // Sur Twitch, ignorer les pages non-stream (directory, following, search…)
  if (IS_TWITCH) {
    const firstSeg = location.pathname.split("/").filter(Boolean)[0]?.toLowerCase();
    if (!firstSeg || TWITCH_SKIP.has(firstSeg)) {
      if (currentVideo) detachVideo();
      if (lastPayload) { lastPayload = null; sendUpdate({ type: "presence_clear" }); }
      return;
    }
  }

  // Sur Prime Video, n'agir que sur les pages de lecture (/detail/, /watch/)
  if (IS_PRIME_VIDEO && !/\/(detail|watch)\//.test(location.pathname)) {
    if (currentVideo) detachVideo();
    if (lastPayload) { lastPayload = null; sendUpdate({ type: "presence_clear" }); }
    return;
  }

  const video = getActiveVideo();

  if (!video) {
    if (currentVideo) detachVideo();
    // Twitch : on garde la présence même sans vidéo (pubs, buffers, transitions)
    // Le clear n'arrive que sur fermeture d'onglet ou changement de stream.
    if (lastPayload && !IS_TWITCH) {
      noVideoCount++;
      if (noVideoCount >= 2) {
        noVideoCount = 0;
        lastPayload = null;
        sendUpdate({ type: "presence_clear" });
      }
    }
    return;
  }
  noVideoCount = 0;

  attachVideo(video);

  let payload;

  if (IS_YOUTUBE) {
    const yt = getYouTubeInfo();

    // Pendant une pub : envoyer un payload sans timestamps (fige la barre Discord)
    if (yt.isAd) {
      if (lastPayload && !lastPayload.isAd) {
        const adPayload = { ...lastPayload, isAd: true, isPlaying: false, timestamp: Date.now() };
        lastPayload = adPayload;
        sendUpdate(adPayload);
      }
      return;
    }

// Sortie de pub : force la prochaine mise à jour à passer
    if (lastPayload?.isAd) lastPayload = null;

    const title = yt.title || "YouTube";

    if (title !== lastTitle) { lastTitle = title; cachedPoster = yt.poster; }

    const isPlaying = !video.paused && !video.ended;

    // Live YouTube : seul indicateur fiable — les streams HLS ont duration=Infinity.
    // Le badge .ytp-live-badge est présent dans le DOM de toutes les vidéos, live ou non.
    const isLive = video.duration === Infinity;
    const duration = isLive ? 0 : Math.floor(video.duration || 0);

    payload = {
      type:        "youtube_presence",
      title,
      videoTitle:  title,
      channel:     yt.channel || null,
      contentType: "video",
      poster:      cachedPoster,
      isPlaying,
      isLive,
      currentTime: Math.floor(video.currentTime || 0),
      duration,
      url:         location.href.split("&list=")[0],

      timestamp:   Date.now()
    };
  } else if (IS_NAKASTREAM) {
    const nk    = getNakastreamInfo();
    const title = nk.title || "Nakastream";

    if (title !== lastTitle) {
      lastTitle    = title;
      cachedPoster = nk.poster;
    }

    payload = {
      type:         "nakastream_presence",
      title,
      seriesTitle:  nk.contentType === "series" ? title : null,
      movieTitle:   nk.contentType === "movie"  ? title : null,
      episodeTitle: nk.episodeTitle || null,
      contentType:  nk.contentType,
      season:       nk.seasonNum,
      episodeNum:   nk.episodeNum,
      poster:       cachedPoster,
      isPlaying:    !video.paused && !video.ended,
      currentTime:  Math.floor(video.currentTime || 0),
      duration:     Math.floor(video.duration    || 0),
      url:          location.href,

      timestamp:    Date.now()
    };
  } else if (IS_PRIME_VIDEO) {
    const pv    = getPrimeVideoInfo();
    const title = pv.title || "Prime Video";

    if (title !== lastTitle) { lastTitle = title; cachedPoster = null; }

    payload = {
      type:         "primevideo_presence",
      title,
      seriesTitle:  pv.contentType === "series" ? title : null,
      movieTitle:   pv.contentType === "movie"  ? title : null,
      episodeTitle: pv.episodeTitle || null,
      contentType:  pv.contentType,
      season:       pv.seasonNum,
      episodeNum:   pv.episodeNum,
      poster:       null,
      isPlaying:    !video.paused && !video.ended,
      currentTime:  Math.floor(video.currentTime || 0),
      duration:     Math.floor(video.duration    || 0),
      isLive:       false,
      url:          location.origin + location.pathname,

      timestamp:    Date.now()
    };
  } else if (IS_TWITCH) {
    const tw = getTwitchInfo();
    const title = tw.streamer;

    if (title !== lastTitle) { lastTitle = title; cachedPoster = null; }
    // Retente à chaque tick tant que l'avatar n'est pas trouvé pour ce streamer
    if (!cachedPoster) cachedPoster = tw.avatar;

    // Live = page de chaîne directe (1 segment). VOD/clip = plusieurs segments ou "videos"
    const segments = location.pathname.split("/").filter(Boolean);
    const isLive = segments.length === 1
      || (segments.length > 1 && !["videos","v","clip","clips"].includes(segments[1]?.toLowerCase()));
    const rawDuration = video.duration;
    const duration    = isLive ? 0 : Math.floor(rawDuration || 0);

    payload = {
      type:        "twitch_presence",
      title,
      videoTitle:  title,
      streamTitle: tw.streamTitle || null,
      channel:     tw.category,
      contentType: "video",
      poster:      cachedPoster,
      isPlaying:   !video.paused && !video.ended,
      currentTime: Math.floor(video.currentTime || 0),
      duration,
      isLive,
      url:         location.href,

      timestamp:   Date.now()
    };
  } else {
    const ariaInfo     = getPlayerAriaInfo();
    const title        = getTitle(ariaInfo) || "Cinepulse";
    const episodeTitle = ariaInfo?.episodeTitle || getEpisodeTitleFromPage(title) || null;
    const isSeries     = ariaInfo?.seasonNum != null || ariaInfo?.episodeNum != null;

    if (title !== lastTitle) {
      lastTitle    = title;
      cachedPoster = getPosterFromDom();
    }

    payload = {
      type:         "cinepulse_presence",
      title,
      seriesTitle:  isSeries ? title : null,
      movieTitle:   isSeries ? null : title,
      episodeTitle,
      contentType:  isSeries ? "series" : "movie",
      season:       ariaInfo?.seasonNum ?? null,
      episodeNum:   ariaInfo?.episodeNum ?? null,
      poster:       cachedPoster,
      isPlaying:    !video.paused && !video.ended,
      currentTime:  Math.floor(video.currentTime || 0),
      duration:     Math.floor(video.duration    || 0),
      url:          location.href,

      timestamp:    Date.now()
    };
  }

  if (!payloadEquals(payload, lastPayload)) {
    lastPayload = payload;
    sendUpdate(payload);
  }
  } catch { if (!isContextValid()) _pauseForContextRecovery(); }
}


// ─── Listeners vidéo ─────────────────────────────────────────────────────────
function attachVideo(video) {
  if (currentVideo === video) return;
  detachVideo();
  currentVideo = video;
  video.addEventListener("play",   onVideoPlay);
  video.addEventListener("pause",  onVideoPause);
  video.addEventListener("seeked", onVideoSeeked);
  video.addEventListener("ended",  onVideoEnded);
}
function clickEpisodeBtn(dir) {
  let sel;
  if (IS_YOUTUBE) {
    sel = dir === "next"
      ? ".ytp-next-button, a.ytp-next-button"
      : null; // YouTube n'a pas de bouton prev standard
  } else if (IS_NAKASTREAM) {
    sel = dir === "next"
      ? "[data-testid='next-episode'], .next-episode, button[aria-label*='suivant' i], button[aria-label*='next' i], .player-next"
      : "[data-testid='prev-episode'], .prev-episode, button[aria-label*='précédent' i], button[aria-label*='previous' i], .player-prev";
  } else if (IS_PRIME_VIDEO) {
    sel = dir === "next"
      ? "[data-testid='nextButton'], .nextButton, button[aria-label*='Next' i]"
      : "[data-testid='prevButton'], .prevButton, button[aria-label*='Previous' i]";
  } else {
    // Générique — tente les aria-labels communs
    sel = dir === "next"
      ? "button[aria-label*='next' i], button[aria-label*='suivant' i], button[title*='next' i], button[title*='suivant' i]"
      : "button[aria-label*='previous' i], button[aria-label*='précédent' i], button[title*='previous' i], button[title*='précédent' i]";
  }
  if (!sel) return;
  const btn = document.querySelector(sel);
  if (btn) btn.click();
}

function detachVideo() {
  if (!currentVideo) return;
  currentVideo.removeEventListener("play",   onVideoPlay);
  currentVideo.removeEventListener("pause",  onVideoPause);
  currentVideo.removeEventListener("seeked", onVideoSeeked);
  currentVideo.removeEventListener("ended",  onVideoEnded);
  currentVideo = null;
}
function onVideoPlay()   { tick(); }
function onVideoPause()  { tick(); }
function onVideoSeeked() { tick(); }
function onVideoEnded() {
  detachVideo();
  // Sur Twitch, ne pas effacer sur 'ended' — les pubs se terminent aussi par cet événement.
  // Le poll tick() (toutes les 2s) re-détectera la vidéo du stream automatiquement.
  if (IS_TWITCH) return;
  lastPayload = null;
  sendUpdate({ type: "presence_clear" });
}

// ─── Démarrage ───────────────────────────────────────────────────────────────
function start() {
  if (pollHandle) return;
  pollHandle = setInterval(tick, 2000);

  if (IS_YOUTUBE && YouTubeSPA) {
    YouTubeSPA.init();
    YouTubeSPA.onChange(({ newId }) => {
      resetSiteState();
      if (!newId) { sendUpdate({ type: "presence_clear" }); return; }
      setTimeout(tick, 300);
      setTimeout(tick, 800);
    });
  }

  if (IS_TWITCH && TwitchSPA) {
    TwitchSPA.init();
    TwitchSPA.onChange(({ channel }) => {
      resetSiteState();
      if (!channel || TWITCH_SKIP.has(channel)) { sendUpdate({ type: "presence_clear" }); return; }
      setTimeout(tick, 300);
      setTimeout(tick, 800);
    });
  }

  if (IS_PRIME_VIDEO && PrimeVideoSPA) {
    PrimeVideoSPA.init();
    PrimeVideoSPA.onChange(() => {
      resetSiteState();
      setTimeout(tick, 300);
      setTimeout(tick, 800);
    });
  }

  tick();
}

start();
function updateTabHidden() {
  const wasHidden = isTabHidden;
  isTabHidden = document.visibilityState === "hidden";
  if (wasHidden && !isTabHidden) tick();
}
document.addEventListener("visibilitychange", updateTabHidden);

// Maintenir le service worker en vie via un port persistant.
// Sans ça, Chrome (MV3) tue le SW après ~30s d'inactivité → déco/reco WebSocket en boucle.
let _keepalivePort = null;
function _connectKeepalive() {
  if (!isContextValid()) return;
  try {
    if (_keepalivePort) { try { _keepalivePort.disconnect(); } catch {} }
    _keepalivePort = chrome.runtime.connect({ name: "keepalive" });
    _keepalivePort.onDisconnect.addListener(() => {
      _keepalivePort = null;
      setTimeout(() => { if (isContextValid()) _connectKeepalive(); }, 1000);
    });
  } catch {}
}
_connectKeepalive();
window.addEventListener("beforeunload", () => sendUpdate({ type: "presence_clear" }));
