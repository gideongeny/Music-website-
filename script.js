/**
 * Gideo Music - Core Logic (SPA Unified)
 * Integrated with Deezer Public API
 */

const CONFIG = {
    API_BASE: 'https://api.deezer.com',
    PROXY: 'https://api.allorigins.win/raw?url=',
    DEFAULT_QUERY: 'afrobeat'
};

// UI Elements
const mainContent = document.querySelector('.main-content');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const mainAudio = document.getElementById('mainAudio');
const navLinks = document.querySelectorAll('.nav-link');

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
    // Default Page
    navigate('home');
}

/**
 * Handle Navigation (SPA)
 */
async function navigate(page) {
    // Update Active Link UI
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });

    // Clear and Render View
    switch (page) {
        case 'home':
            await renderHome();
            break;
        case 'playlists':
            renderPlaylists();
            break;
        case 'favourites':
            renderFavourites();
            break;
        case 'discover':
            await renderSearch('Amapiano'); // Default discover theme
            break;
        case 'history':
            renderMessage('Listening History coming soon to Gideo Premium.');
            break;
        default:
            await renderHome();
    }
}

/**
 * View: Home
 */
async function renderHome() {
    mainContent.innerHTML = `
        <header class="header-search">
            <div class="search-box">
                <button id="searchButton"><i class="fas fa-search"></i></button>
                <input type="text" id="searchInput" placeholder="Search for tracks, artists, or albums...">
            </div>
            <div class="user-profile">
                <img src="https://ui-avatars.com/api/?name=Mukhtar&background=38bdf8&color=fff" alt="Profile" style="width: 40px; border-radius: 50%;">
            </div>
        </header>
        <section class="hero">
            <div class="hero-content">
                <p>EXCLUSIVE PLAYLIST</p>
                <h2>Editor's Choice: Global Hits</h2>
                <p>Discover the biggest tracks from around the world, updated daily.</p>
                <button class="play-pause-btn" style="width: 120px; border-radius: 100px; height: 48px; border: none; font-weight: 700; cursor: pointer;">
                    <i class="fas fa-play"></i> PLAY NOW
                </button>
            </div>
        </section>
        <section class="top-tracks">
            <div class="section-header">
                <h3>Trending Tracks</h3>
            </div>
            <div class="songs-grid" id="songsGrid">
                <div class="loading">Warming up the speakers...</div>
            </div>
        </section>
    `;

    // Re-attach Search Event (since we replaced the HTML)
    const newSearchBtn = document.getElementById('searchButton');
    const newSearchInput = document.getElementById('searchInput');
    newSearchBtn.onclick = () => renderSearch(newSearchInput.value);
    newSearchInput.onkeypress = (e) => { if (e.key === 'Enter') renderSearch(newSearchInput.value); };

    await fetchChartTracks();
}

/**
 * View: Playlists
 */
function renderPlaylists() {
    mainContent.innerHTML = `
        <div style="padding: 20px;">
            <h2 style="font-size: 2rem; margin-bottom: 2rem;">Your Playlists</h2>
            <div class="songs-grid">
                ${['Chill Vibes', 'Gym Flow', 'Late Night', 'Afrobeat 2024'].map(p => `
                    <div class="song-card">
                        <img src="https://via.placeholder.com/300/1e293b/38bdf8?text=${p.replace(' ', '+')}" alt="${p}">
                        <div class="title">${p}</div>
                        <div class="artist">Personal Collection</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * View: Favourites
 */
function renderFavourites() {
    mainContent.innerHTML = `
        <div style="padding: 20px;">
            <h2 style="font-size: 2rem; margin-bottom: 2rem;">Favourite Songs</h2>
            <div id="songsGrid" class="songs-grid">
                <p style="color: var(--text-muted);">You haven't liked any songs yet. Start exploring!</p>
            </div>
        </div>
    `;
}

/**
 * Generic Message View
 */
function renderMessage(msg) {
    mainContent.innerHTML = `
        <div style="padding: 20px; text-align: center; margin-top: 100px;">
            <h3 style="color: var(--text-secondary);">${msg}</h3>
        </div>
    `;
}

/**
 * API Fetch: Chart Tracks
 */
async function fetchChartTracks() {
    const grid = document.getElementById('songsGrid');
    try {
        const response = await fetch(`${CONFIG.PROXY}${encodeURIComponent(CONFIG.API_BASE + '/chart/0/tracks?limit=50')}`);
        const data = await response.json();
        currentTrackList = data.data;
        renderSongCards(currentTrackList, grid);
    } catch (error) {
        grid.innerHTML = '<p style="color: red;">Failed to load music. Check your connection.</p>';
    }
}

/**
 * View: Search Result
 */
async function renderSearch(query) {
    if (!query) return;

    mainContent.innerHTML = `
        <header class="header-search">
            <div class="search-box">
                <button id="searchButton"><i class="fas fa-search"></i></button>
                <input type="text" id="searchInput" placeholder="Search for tracks..." value="${query}">
            </div>
        </header>
        <h3 style="margin: 20px 0;">Results for "${query}"</h3>
        <div class="songs-grid" id="songsGrid">
            <div class="loading">Searching the global database...</div>
        </div>
    `;

    const newSearchBtn = document.getElementById('searchButton');
    const newSearchInput = document.getElementById('searchInput');
    newSearchBtn.onclick = () => renderSearch(newSearchInput.value);
    newSearchInput.onkeypress = (e) => { if (e.key === 'Enter') renderSearch(newSearchInput.value); };

    const grid = document.getElementById('songsGrid');
    try {
        const response = await fetch(`${CONFIG.PROXY}${encodeURIComponent(CONFIG.API_BASE + '/search?q=' + query + '&limit=100')}`);
        const data = await response.json();
        currentTrackList = data.data;
        renderSongCards(currentTrackList, grid);
    } catch (error) {
        console.error(error);
    }
}

/**
 * Utility: Render Song Cards
 */
function renderSongCards(tracks, container) {
    container.innerHTML = '';
    tracks.forEach((track, index) => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
            <img src="${track.album.cover_medium}" alt="${track.title}">
            <div class="play-button-overlay">
                <i class="fas fa-play"></i>
            </div>
            <div class="title">${track.title}</div>
            <div class="artist">${track.artist.name}</div>
        `;
        card.onclick = () => {
            currentIndex = index;
            playTrack(track);
        };
        container.appendChild(card);
    });
}

/**
 * Player Logic
 */
function playTrack(track) {
    if (!track) return;
    mainAudio.src = track.preview;
    mainAudio.play();
    playerTrackName.textContent = track.title;
    playerArtistName.textContent = track.artist.name;
    playerAlbumArt.src = track.album.cover_medium;
    isPlaying = true;
    updatePlayPauseUI();
}

function togglePlay() {
    if (!mainAudio.src) return;
    isPlaying ? mainAudio.pause() : mainAudio.play();
    isPlaying = !isPlaying;
    updatePlayPauseUI();
}

function updatePlayPauseUI() {
    const icon = playBtn.querySelector('i');
    icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
}

function updateProgress() {
    const { duration, currentTime } = mainAudio;
    const percent = (currentTime / duration) * 100 || 0;
    progressFill.style.width = `${percent}%`;
    currentTimeEl.textContent = formatTime(currentTime);
    totalTimeEl.textContent = formatTime(duration);
}

function formatTime(time) {
    if (isNaN(time)) return '0:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigate(link.dataset.page);
        });
    });

    // Player
    playBtn.onclick = togglePlay;
    nextBtn.onclick = () => {
        currentIndex = (currentIndex + 1) % currentTrackList.length;
        playTrack(currentTrackList[currentIndex]);
    };
    prevBtn.onclick = () => {
        currentIndex = (currentIndex - 1 + currentTrackList.length) % currentTrackList.length;
        playTrack(currentTrackList[currentIndex]);
    };

    mainAudio.addEventListener('timeupdate', updateProgress);
    mainAudio.addEventListener('ended', () => nextBtn.click());

    progressBar.onclick = (e) => {
        const width = progressBar.clientWidth;
        const clickX = e.offsetX;
        const duration = mainAudio.duration;
        mainAudio.currentTime = (clickX / width) * duration;
    };
}

init();
