/**
 * Gideo Music - Core Logic (Multi-API Unified)
 */

const CONFIG = {
    PROXY: 'https://api.allorigins.win/raw?url=',
    DEEZER_BASE: 'https://api.deezer.com',
    JAMENDO_BASE: 'https://api.jamendo.com/v3.0',
    JAMENDO_ID: '709fa152',
    MIXCLOUD_BASE: 'https://api.mixcloud.com',
    LASTFM_BASE: 'https://ws.audioscrobbler.com/2.0/',
    LASTFM_KEY: '5e0ac14dbd07bf08efd5d79d036b5f30'
};

// UI Elements
const mainContent = document.querySelector('.main-content');
const mainAudio = document.getElementById('mainAudio');
let navLinks = document.querySelectorAll('.nav-link');

// Player UI Elements
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const playerTrackName = document.getElementById('playerTrackName');
const playerArtistName = document.getElementById('playerArtistName');
const playerAlbumArt = document.getElementById('playerAlbumArt');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');

// State
let currentTrackList = [];
let currentIndex = 0;
let isPlaying = false;

/**
 * Initialize Application
 */
async function init() {
    setupEventListeners();
    navigate('home');
}

/**
 * SPA Navigation
 */
async function navigate(page) {
    navLinks.forEach(link => link.classList.toggle('active', link.dataset.page === page));

    switch (page) {
        case 'home': await renderHome(); break;
        case 'discover': await renderDiscover(); break;
        case 'playlists': renderPlaylists(); break;
        case 'favourites': renderFavourites(); break;
        default: await renderHome();
    }
}

/**
 * View: Home (Aggregated Charts)
 */
async function renderHome() {
    mainContent.innerHTML = `
        <header class="header-search">
            <div class="search-box">
                <button id="searchButton"><i class="fas fa-search"></i></button>
                <input type="text" id="extSearchInput" placeholder="Search Global Music (Deezer, Jamendo, Mixcloud)...">
            </div>
            <div class="user-profile">
               <span style="margin-right: 15px; color: var(--text-secondary); font-size: 0.8rem;">Premium Active</span>
               <img src="https://ui-avatars.com/api/?name=Mukhtar&background=38bdf8&color=fff" alt="Profile" style="width: 40px; border-radius: 50%;">
            </div>
        </header>

        <section class="hero">
            <div class="hero-content">
                <p>POWERED BY MULTI-API</p>
                <h2>Unified Music Intelligence</h2>
                <p>Streaming hits from Deezer, Indies from Jamendo, and Sets from Mixcloud.</p>
                <button class="play-pause-btn" style="width: 150px; border-radius: 100px; height: 48px; border: none; font-weight: 700; cursor: pointer;">
                    <i class="fas fa-bolt"></i> GLOBAL TOP 50
                </button>
            </div>
        </section>

        <section class="section-container">
            <div class="section-header">
                <h3>Global Trending (Deezer)</h3>
            </div>
            <div class="songs-grid" id="deezerGrid"><div class="loading">Fetching...</div></div>
        </section>

        <section class="section-container" style="margin-top: 40px;">
            <div class="section-header">
                <h3>Independent Hits (Jamendo)</h3>
            </div>
            <div class="songs-grid" id="jamendoGrid"><div class="loading">Fetching...</div></div>
        </section>

        <section class="section-container" style="margin-top: 40px;">
            <div class="section-header">
                <h3>DJ Sets & Mixes (Mixcloud)</h3>
            </div>
            <div class="songs-grid" id="mixcloudGrid"><div class="loading">Fetching...</div></div>
        </section>
    `;

    setupSearchEvents('extSearchInput');

    // Fetch from all sources in parallel
    fetchDeezerCharts();
    fetchJamendoFeatured();
    fetchMixcloudFeatured();
}

/**
 * View: Discover (Last.fm Charts)
 */
async function renderDiscover() {
    mainContent.innerHTML = `
        <div style="padding: 20px;">
            <h2 style="font-size: 2rem; margin-bottom: 1rem;">Discover Global Vibes</h2>
            <p style="color: var(--text-muted); margin-bottom: 2rem;">Real-time meta-charts powered by Last.fm</p>
            <div class="songs-grid" id="lastfmGrid"><div class="loading">Analyzing trends...</div></div>
        </div>
    `;
    fetchLastfmTopTracks();
}

/**
 * Search Logic (Unified)
 */
async function performUnifiedSearch(query) {
    if (!query) return;

    mainContent.innerHTML = `
        <h2 style="margin: 20px;">Results for "${query}"</h2>
        <div class="section-container"><h4>Deezer Results</h4><div class="songs-grid" id="sDeezer"></div></div>
        <div class="section-container"><h4>Jamendo Results</h4><div class="songs-grid" id="sJamendo"></div></div>
        <div class="section-container"><h4>Mixcloud Results</h4><div class="songs-grid" id="sMixcloud"></div></div>
    `;

    // Deezer Search
    fetch(`${CONFIG.PROXY}${encodeURIComponent(CONFIG.DEEZER_BASE + '/search?q=' + query)}`)
        .then(r => r.json()).then(d => renderSongCards(d.data, document.getElementById('sDeezer'), 'deezer'));

    // Jamendo Search
    fetch(`${CONFIG.JAMENDO_BASE}/tracks/?client_id=${CONFIG.JAMENDO_ID}&format=json&search=${query}&limit=20`)
        .then(r => r.json()).then(d => renderSongCards(d.results, document.getElementById('sJamendo'), 'jamendo'));

    // Mixcloud Search
    fetch(`${CONFIG.PROXY}${encodeURIComponent(CONFIG.MIXCLOUD_BASE + '/search/?q=' + query + '&type=cloudcast')}`)
        .then(r => r.json()).then(d => renderSongCards(d.data, document.getElementById('sMixcloud'), 'mixcloud'));
}

/**
 * Source Specific Fetchers
 */
async function fetchDeezerCharts() {
    const res = await fetch(`${CONFIG.PROXY}${encodeURIComponent(CONFIG.DEEZER_BASE + '/chart/0/tracks?limit=20')}`);
    const data = await res.json();
    renderSongCards(data.data, document.getElementById('deezerGrid'), 'deezer');
}

async function fetchJamendoFeatured() {
    const res = await fetch(`${CONFIG.JAMENDO_BASE}/tracks/?client_id=${CONFIG.JAMENDO_ID}&format=json&limit=20&order=ratingweekly_desc`);
    const data = await res.json();
    renderSongCards(data.results, document.getElementById('jamendoGrid'), 'jamendo');
}

async function fetchMixcloudFeatured() {
    const res = await fetch(`${CONFIG.PROXY}${encodeURIComponent(CONFIG.MIXCLOUD_BASE + '/search/?q=popular&type=cloudcast&limit=20')}`);
    const data = await res.json();
    renderSongCards(data.data, document.getElementById('mixcloudGrid'), 'mixcloud');
}

async function fetchLastfmTopTracks() {
    const res = await fetch(`${CONFIG.LASTFM_BASE}?method=chart.gettoptracks&api_key=${CONFIG.LASTFM_KEY}&format=json&limit=50`);
    const data = await res.json();
    // Lastfm doesn't give preview URLs directly, so we map them to Deezer search for playback
    const tracks = data.tracks.track.map(t => ({
        title: t.name,
        artist: { name: t.artist.name },
        album: { cover_medium: t.image[2]['#text'] || 'https://via.placeholder.com/300' },
        source: 'lastfm'
    }));
    renderSongCards(tracks, document.getElementById('lastfmGrid'), 'lastfm');
}

/**
 * Card Renderer Logic
 */
function renderSongCards(tracks, container, source) {
    if (!container) return;
    container.innerHTML = '';
    if (!tracks || tracks.length === 0) {
        container.innerHTML = '<p style="color: grey; padding: 10px;">No results found.</p>';
        return;
    }

    tracks.forEach((track, index) => {
        const card = document.createElement('div');
        card.className = 'song-card';

        let img = '', title = '', artist = '', stream = '';

        if (source === 'deezer') {
            img = track.album.cover_medium;
            title = track.title;
            artist = track.artist.name;
            stream = track.preview;
        } else if (source === 'jamendo') {
            img = track.album_image || track.image;
            title = track.name;
            artist = track.artist_name;
            stream = track.audio;
        } else if (source === 'mixcloud') {
            img = track.pictures.large;
            title = track.name;
            artist = track.user.name;
            stream = ''; // Mixcloud requires their widget for full playback, we use it for metadata mostly
        } else if (source === 'lastfm') {
            img = track.album.cover_medium;
            title = track.title;
            artist = track.artist.name;
        }

        card.innerHTML = `
            <img src="${img}" onerror="this.src='https://via.placeholder.com/300/1e293b/38bdf8?text=Music'" alt="${title}">
            <div class="play-button-overlay">
                <i class="fas fa-${source === 'mixcloud' ? 'external-link-alt' : 'play'}"></i>
            </div>
            <div class="title">${title}</div>
            <div class="artist">${artist} <span style="font-size: 0.6rem; opacity: 0.5;">[${source}]</span></div>
        `;

        card.onclick = () => {
            if (source === 'mixcloud') {
                window.open(track.url, '_blank');
                return;
            }
            if (source === 'lastfm') {
                // Search Deezer for the Last.fm hit to get audio
                renderSearch(track.title + ' ' + track.artist.name);
                return;
            }
            playTrack({ title, artist: { name: artist }, album: { cover_medium: img }, preview: stream });
        };

        container.appendChild(card);
    });
}

/**
 * Core Player
 */
function playTrack(track) {
    if (!track || !track.preview) return;
    mainAudio.src = track.preview;
    mainAudio.play();
    playerTrackName.textContent = track.title;
    playerArtistName.textContent = track.artist.name;
    playerAlbumArt.src = track.album.cover_medium;
    isPlaying = true;
    updatePlayPauseUI();
}

function updatePlayPauseUI() {
    const icon = playBtn.querySelector('i');
    icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
}

function formatTime(time) {
    if (isNaN(time)) return '0:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

/**
 * Event Setup
 */
function setupEventListeners() {
    navLinks.forEach(link => link.onclick = (e) => { e.preventDefault(); navigate(link.dataset.page); });

    playBtn.onclick = () => {
        if (!mainAudio.src) return;
        isPlaying ? mainAudio.pause() : mainAudio.play();
        isPlaying = !isPlaying;
        updatePlayPauseUI();
    };

    nextBtn.onclick = () => { /* Logic to skip forward in unified lists */ };

    mainAudio.ontimeupdate = () => {
        const { duration, currentTime } = mainAudio;
        const percent = (currentTime / duration) * 100 || 0;
        progressFill.style.width = `${percent}%`;
        currentTimeEl.textContent = formatTime(currentTime);
        totalTimeEl.textContent = formatTime(duration);
    };

    progressBar.onclick = (e) => {
        const width = progressBar.clientWidth;
        mainAudio.currentTime = (e.offsetX / width) * mainAudio.duration;
    };
}

function setupSearchEvents(id) {
    const input = document.getElementById(id);
    const btn = document.getElementById('searchButton');
    if (!input || !btn) return;

    const trigger = () => performUnifiedSearch(input.value);
    btn.onclick = trigger;
    input.onkeypress = (e) => { if (e.key === 'Enter') trigger(); };
}

init();
