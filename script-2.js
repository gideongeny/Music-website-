let songs = [
    {
        "title": "YELLOW",
        "artist": "Coldplay",
        "path": "New folder/Coldplay - Yellow (Official Video).mp3",
        "image": "download.webp"
    },
    {
        "title": "REDRUM",
        "artist": "21 Savage",
        "path": "New folder/21 Savage - redrum (Official Music Video).mp3",
        "image": "21 savage.jpeg"
    },
    {
        "title": "MONEY",
        "artist": "Cardi B",
        "path": "New folder/Cardi B _ Money (Lyrics).mp3",
        "image": "cardi b 2.jpeg"
    },
    {
        "title": "CALM DOWN",
        "artist": "Rema",
        "path": "New folder/Rema - Calm Down (Official Music Video).mp3",
        "image": "rema.jpg"
    },
    {
        "title": "SMOOTH CRIMINAL",
        "artist": "Michael Jackson",
        "path": "New folder/Michael Jackson - Smooth Criminal (Official Video).mp3",
        "image": "mj.jpeg"
    },
    {
        "title": "VIVA LA VIDA",
        "artist": "Coldplay",
        "path": "New folder/Coldplay - Viva La Vida (Official Video).mp3",
        "image": "coldplay 2.jpeg"
    },
    {
        "title": "LIKE WHAT",
        "artist": "Cardi B",
        "path": "New folder/Cardi B - Like What (Freestyle)  [Official Music Video] (1).mp3",
        "image": "cardi b.webp"
    },
    {
        "title": "NOT LIKE US",
        "artist": "Kendrick Lamar",
        "path": "New folder/Not Like Us.mp3",
        "image": "kendrick.webp"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const sliderImages = document.querySelectorAll('.slider-image');
    let currentIndex = 0;

    const showNextImage = () => {
        sliderImages[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % sliderImages.length;
        sliderImages[currentIndex].classList.add('active');
    };

    
    setInterval(showNextImage, 3000);

    displaysongs();
    loadSong(currentsongindex);
});

let nowPlayingText = document.querySelector("#nowPlayingText");
let footerSongImage = document.querySelector("#footerSongImage");
let songProgressBar = document.querySelector("#songProgressBar");
let currentTimeElement = document.querySelector("#currentTime");
let totalTimeElement = document.querySelector("#totalTime");

let audio = new Audio();
let isPlaying = false;
let currentsongindex = 0;

let prevButton = document.querySelector("#prevButton");
let pauseButton = document.querySelector("#pauseButton");
let nextButton = document.querySelector("#nextButton");
let playButton = document.querySelector("#playButton");
let volumeControl = document.querySelector("#volumeControl");

let songsContainer = document.querySelector(".popular-songs");

function displaysongs() {
    for (let i = 0; i < songs.length; i++) {
        songsContainer.innerHTML += `<div onclick="play(${i})" class="popular-song">
            <img src="${songs[i].image}" alt="${songs[i].title}">
            <p>${songs[i].artist}</p>
        </div>`;
    }
}

function loadSong(index) {
    audio.src = songs[index].path;
    nowPlayingText.innerHTML = `${songs[index].title} - ${songs[index].artist}`;
    footerSongImage.src = songs[index].image;

    audio.addEventListener('loadedmetadata', () => {
        totalTimeElement.textContent = formatTime(audio.duration);
    });
};
function play(index) {
    currentsongindex = index;
    loadSong(index);

    audio.currentTime = 0; 
    isPlaying = true;

    audio.playbackRate = 1;

    audio.onloadedmetadata = function () {
        audio.play(); 
    }

    audio.addEventListener('timeupdate', updateProgressBar);
}

function next() {
    currentsongindex = (currentsongindex + 1) % songs.length; 
    play(currentsongindex); 
}

audio.addEventListener("ended", function () {
    next(); 
});

function previous() {
    if (currentsongindex > 0) {
        currentsongindex--;
    } else {
        currentsongindex = songs.length - 1; 
    }
    play(currentsongindex);
}

function pause() {
    audio.pause();
    isPlaying = false;
    audio.currentTime = 0; 
}


function updateProgressBar() {
    const progress = (audio.currentTime / audio.duration) * 100;
    songProgressBar.value = progress;
    currentTimeElement.textContent = formatTime(audio.currentTime);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

volumeControl.addEventListener('input', () => {
    audio.volume = volumeControl.value / 100;
});

prevButton.addEventListener("click", previous);
nextButton.addEventListener("click", next);
pauseButton.addEventListener("click", pause);
playButton.addEventListener("click", function () {
    play(currentsongindex);
});

songProgressBar.addEventListener('input', () => {
    audio.currentTime = (songProgressBar.value / 100) * audio.duration;
});
