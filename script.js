/**
 * Gideo Music - Core Logic
 * Integrated with Deezer Public API
 */

const CONFIG = {
    API_BASE: 'https://api.deezer.com',
    PROXY: 'https://api.allorigins.win/raw?url=',
    DEFAULT_QUERY: 'afrobeat',
    CHART_LIMIT: 50
};

// UI Elements
const songsGrid = document.getElementById('songsGrid');
const recommendedGrid = document.getElementById('recommendedGrid');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const mainAudio = document.getElementById('mainAudio');

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
const volumeFill = document.getElementById('volumeFill');

// State
let currentTrackList = [];
let currentIndex = 0;
let isPlaying = false;

/**
 * Initialize Application
 */
async function init() {
    await fetchChartTracks();
    setupEventListeners();
}

/**
 * Fetch Top Tracks for Homepage
 */
async function fetchChartTracks() {
    try {
        const response = await fetch(`${CONFIG.PROXY}${encodeURIComponent(CONFIG.API_BASE + '/chart/0/tracks?limit=50')}`);
        const data = await response.json();
        currentTrackList = data.data;
        renderSongs(currentTrackList, songsGrid);
        
        // Load some recommendations too
        renderSongs(currentTrackList.slice().reverse().slice(0, 10), recommendedGrid);
    } catch (error) {
        console.error('Error fetching tracks:', error);
        songsGrid.innerHTML = '<p style="color: red;">Failed to load music. Please check your connection.</p>';
    }
}

/**
 * Search Tracks
 */
async function searchTracks(query) {
    if (!query) return;
    
    songsGrid.innerHTML = '<div class="loading">Searching for hits...</div>';
    
    try {
        const response = await fetch(`${CONFIG.PROXY}${encodeURIComponent(CONFIG.API_BASE + '/search?q=' + query + '&limit=100')}`);
        const data = await response.json();
        currentTrackList = data.data;
        renderSongs(currentTrackList, songsGrid);
    } catch (error) {
        console.error('Error searching tracks:', error);
    }
}

/**
 * Render Song Cards to Grid
 */
function renderSongs(tracks, container) {
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
        
        card.addEventListener('click', () => {
            currentIndex = index;
            playTrack(track);
        });
        
        container.appendChild(card);
    });
}

/**
 * Play Selected Track
 */
function playTrack(track) {
    if (!track) return;
    
    mainAudio.src = track.preview; // Preview is a 30s clip from Deezer
    mainAudio.play();
    
    // Update UI
    playerTrackName.textContent = track.title;
    playerArtistName.textContent = track.artist.name;
    playerAlbumArt.src = track.album.cover_medium;
    
    isPlaying = true;
    updatePlayPauseUI();
}

/**
 * Toggle Play/Pause
 */
function togglePlay() {
    if (!mainAudio.src) return;
    
    if (isPlaying) {
        mainAudio.pause();
    } else {
        mainAudio.play();
    }
    
    isPlaying = !isPlaying;
    updatePlayPauseUI();
}

function updatePlayPauseUI() {
    const icon = playBtn.querySelector('i');
    if (isPlaying) {
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
    } else {
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
    }
}

/**
 * Update Progress Bar
 */
function updateProgress() {
    const { duration, currentTime } = mainAudio;
    const percent = (currentTime / duration) * 100;
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
 * Seek Logic
 */
function seek(e) {
    const width = progressBar.clientWidth;
    const clickX = e.offsetX;
    const duration = mainAudio.duration;
    
    mainAudio.currentTime = (clickX / width) * duration;
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
    // Search
    searchButton.addEventListener('click', () => searchTracks(searchInput.value));
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchTracks(searchInput.value);
    });
    
    // Player Controls
    playBtn.addEventListener('click', togglePlay);
    
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % currentTrackList.length;
        playTrack(currentTrackList[currentIndex]);
    });
    
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + currentTrackList.length) % currentTrackList.length;
        playTrack(currentTrackList[currentIndex]);
    });
    
    // Audio Events
    mainAudio.addEventListener('timeupdate', updateProgress);
    mainAudio.addEventListener('ended', () => nextBtn.click());
    
    // Progress Bar Click
    progressBar.addEventListener('click', seek);
}

// Start App
init();
