document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = new Audio();
    const videoPlayer = document.getElementById('videoPlayer');
    const nowPlayingText = document.getElementById('nowPlayingText');
    const playButton = document.getElementById('playButton');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const volumeControl = document.getElementById('volumeControl');
    const songProgressBar = document.getElementById('songProgressBar');
    const songCurrentTime = document.getElementById('songCurrentTime');
    const songDurationTime = document.getElementById('songDurationTime');
    const songImage = document.getElementById('songImage');

    let currentAudioIndex = 0;
    let audioQueue = [];
    let isPlaying = false;

    const songs = [
        {
            "title": "YELLOW",
            "artist": "Coldplay",
            "path": "New folder/Coldplay - Yellow (Official Video).mp3"
        },
        {
            "title": "REDRUM",
            "artist": "21 Savage",
            "path": "New folder/21 Savage - redrum (Official Music Video).mp3"
        },
        // ... (more songs)
    ];

    function loadLocalSongs() {
        const songsContainer = document.querySelector('.local-songs-list');
        songs.forEach((song, index) => {
            const songElement = document.createElement('div');
            songElement.classList.add('song-item');
            songElement.textContent = `${song.artist} - ${song.title}`;
            songElement.addEventListener('click', () => {
                playSong(index);
            });
            songsContainer.appendChild(songElement);
        });
    }

    function playSong(index) {
        currentAudioIndex = index;
        const song = songs[index];
        audioPlayer.src = song.path;
        videoPlayer.src = song.path;  // Assuming video and audio are the same
        nowPlayingText.textContent = `${song.artist} - ${song.title}`;
        songImage.src = 'path_to_image'; // Replace with actual image path
        audioPlayer.play();
        videoPlayer.play();
        isPlaying = true;
        updateProgress();
        updateSongDuration();
    }

    function updateProgress() {
        audioPlayer.addEventListener('timeupdate', () => {
            const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            songProgressBar.style.width = `${progress}%`;
            songCurrentTime.textContent = formatTime(audioPlayer.currentTime);
        });
    }

    function updateSongDuration() {
        audioPlayer.addEventListener('loadedmetadata', () => {
            songDurationTime.textContent = formatTime(audioPlayer.duration);
        });
    }

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    playButton.addEventListener('click', () => {
        if (isPlaying) {
            audioPlayer.pause();
            videoPlayer.pause();
            isPlaying = false;
        } else {
            audioPlayer.play();
            videoPlayer.play();
            isPlaying = true;
        }
    });

    prevButton.addEventListener('click', () => {
        if (currentAudioIndex > 0) {
            playSong(currentAudioIndex - 1);
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentAudioIndex < songs.length - 1) {
            playSong(currentAudioIndex + 1);
        }
    });

    volumeControl.addEventListener('input', (event) => {
        audioPlayer.volume = event.target.value;
        videoPlayer.volume = event.target.value;
    });

    loadLocalSongs();
    playSong(currentAudioIndex);
});
