document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = new Audio();
    const nowPlayingText = document.getElementById('nowPlayingText');
    const playButton = document.getElementById('playButton');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const volumeControl = document.getElementById('volumeControl');
    const songProgressBar = document.getElementById('songProgressBar');
    const songCurrentTime = document.getElementById('songCurrentTime');
    const songDuration = document.getElementById('songDuration');
    const shuffleButton = document.getElementById('shuffleButton');
    const repeatButton = document.getElementById('repeatButton');
    const queueList = document.getElementById('queueList');
    const songPopup = document.getElementById('songPopup');
    const songImage = document.getElementById('songImage');
    const lyricsDisplay = document.getElementById('lyricsDisplay');
    const favoriteButton = document.getElementById('favoriteButton');
    const miniPlayer = document.getElementById('miniPlayer');
    const videoElement = document.getElementById('videoElement');  // Video element reference

    let audioQueue = [];
    let currentAudioIndex = -1;
    let isShuffling = false;
    let repeatMode = 'none'; 
    let isFavorite = false;
    let playCounts = JSON.parse(localStorage.getItem('playCounts')) || {};
    let favoriteSongs = JSON.parse(localStorage.getItem('favoriteSongs')) || [];

    const saveData = () => {
        localStorage.setItem('playCounts', JSON.stringify(playCounts));
        localStorage.setItem('favoriteSongs', JSON.stringify(favoriteSongs));
    };

    const updateNowPlaying = () => {
        if (audioQueue.length > 0 && currentAudioIndex >= 0 && currentAudioIndex < audioQueue.length) {
            nowPlayingText.textContent = audioQueue[currentAudioIndex].text;
        } else {
            nowPlayingText.textContent = 'No song selected';
        }
    };

    const playAudio = () => {
        if (currentAudioIndex >= 0 && currentAudioIndex < audioQueue.length) {
            const currentTrack = audioQueue[currentAudioIndex];
            audioPlayer.src = currentTrack.audioSrc;
            audioPlayer.play();
            updateNowPlaying();
            showSongPopup(currentTrack);
            playCounts[currentTrack.audioSrc] = (playCounts[currentTrack.audioSrc] || 0) + 1;
            updateStatistics();
            saveData();
            updateProgress(); 
            updateSongDetails(currentTrack); 
        }
    };

    const updateSongDetails = (track) => {
        songImage.src = track.imageSrc;
        songDuration.textContent = formatTime(audioPlayer.duration);
    };

    const playNextAudio = () => {
        if (repeatMode === 'one') {
            playAudio();
        } else if (isShuffling) {
            currentAudioIndex = Math.floor(Math.random() * audioQueue.length);
            playAudio();
        } else if (currentAudioIndex < audioQueue.length - 1) {
            currentAudioIndex++;
            playAudio();
        } else if (repeatMode === 'all' || currentAudioIndex === audioQueue.length - 1) {
            currentAudioIndex = 0;
            playAudio();
        }
    };

    const playPreviousAudio = () => {
        if (currentAudioIndex > 0) {
            currentAudioIndex--;
            playAudio();
        } else if (currentAudioIndex === 0) {
            currentAudioIndex = 0;
            playAudio();
        }
    };

    const showSongPopup = (track) => {
        songPopup.style.display = 'block';
    };

    const updateProgress = () => {
        audioPlayer.addEventListener('timeupdate', () => {
            const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            songProgressBar.style.width = `${progress}%`;
            songCurrentTime.textContent = formatTime(audioPlayer.currentTime);
            songDuration.textContent = formatTime(audioPlayer.duration);
        });
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    document.querySelectorAll('a[data-audio]').forEach((audioLink) => {
        audioLink.addEventListener('click', (event) => {
            event.preventDefault();
            const audioSrc = audioLink.getAttribute('data-audio');
            const text = audioLink.textContent;
            const imageSrc = audioLink.getAttribute('data-image'); 
            audioQueue.push({ audioSrc, text, imageSrc });
            currentAudioIndex = audioQueue.length - 1;
            playAudio();
            saveData();
            updateQueueUI();
        });
    });

    playButton.addEventListener('click', () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
        } else {
            audioPlayer.pause();
        }
    });

    prevButton.addEventListener('click', playPreviousAudio);
    nextButton.addEventListener('click', playNextAudio);

    audioPlayer.addEventListener('ended', playNextAudio);

    volumeControl.addEventListener('input', (event) => {
        audioPlayer.volume = event.target.value;
    });

    shuffleButton.addEventListener('click', () => {
        isShuffling = !isShuffling;
        shuffleButton.classList.toggle('active', isShuffling);
    });

    repeatButton.addEventListener('click', () => {
        if (repeatMode === 'none') {
            repeatMode = 'one';
        } else if (repeatMode === 'one') {
            repeatMode = 'all';
        } else {
            repeatMode = 'none';
        }
        repeatButton.classList.toggle('repeat-one', repeatMode === 'one');
        repeatButton.classList.toggle('repeat-all', repeatMode === 'all');
    });

    favoriteButton.addEventListener('click', () => {
        const currentTrack = audioQueue[currentAudioIndex];
        isFavorite = !isFavorite;
        favoriteButton.classList.toggle('active', isFavorite);
        if (isFavorite) {
            favoriteSongs.push(currentTrack);
        } else {
            favoriteSongs = favoriteSongs.filter(song => song.audioSrc !== currentTrack.audioSrc);
        }
        saveData();
    });

    const updateQueueUI = () => {
        queueList.innerHTML = '';
        audioQueue.forEach((track, index) => {
            const li = document.createElement('li');
            li.textContent = `${track.text} ${index === currentAudioIndex ? '(Playing)' : ''}`;
            queueList.appendChild(li);
        });
    };

    const updateStatistics = () => {
        const sortedPlayCounts = Object.entries(playCounts).sort((a, b) => b[1] - a[1]);
        favoriteSongs = sortedPlayCounts.map(entry => entry[0]).slice(0, 3);
        saveData();
    };

    const toggleMiniPlayer = () => {
        miniPlayer.classList.toggle('active');
    };

    document.getElementById('miniPlayerToggle').addEventListener('click', toggleMiniPlayer);

    const lyrics = [
        { time: 10, text: "This is the first line of the lyrics." },
        { time: 20, text: "This is the second line of the lyrics." },
        { time: 30, text: "This is the third line of the lyrics." }
    ];

    audioPlayer.addEventListener('timeupdate', () => {
        const currentTime = audioPlayer.currentTime;
        const currentLyric = lyrics.find(lyric => lyric.time === Math.floor(currentTime));
        if (currentLyric) {
            lyricsDisplay.textContent = currentLyric.text;
        }
    });

    // Video Correction
    const adjustVideoSize = () => {
        const videoContainer = document.querySelector('.video-container');
        videoContainer.style.height = `${window.innerHeight - 200}px`;
    };

    window.addEventListener('resize', adjustVideoSize);
    adjustVideoSize(); // Initial adjustment to ensure the video is properly sized on load

    updateNowPlaying();
    updateQueueUI();
});
