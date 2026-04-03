// BACKGROUND MUSIC

window.addEventListener('load', function () {
    const music = document.getElementById('bg-music');
    const btn = document.querySelector('.music-btn');
    const icon = document.getElementById('music-icon');

    if (!music || !btn || !icon) return;

    music.volume = 0.4;

    const isMuted = localStorage.getItem('musicMuted') === 'true';
    const savedTime = parseFloat(localStorage.getItem('musicTime') || '0');

    /* Set correct icon state on load */
    if (isMuted) {
        icon.className = 'bx bx-volume-mute';
        btn.classList.remove('playing');
        return; /* ← stop here if muted */
    }

    /* Try autoplay first */
    music.currentTime = savedTime;
    music.play().then(() => {
        /* Autoplay worked */
        btn.classList.add('playing');
        icon.className = 'bx bx-volume-full';

    }).catch(() => {
        /* Autoplay blocked by browser (happens on pages with videos) */
        /* Show the icon as muted until user clicks */
        icon.className = 'bx bx-volume-mute';
        btn.classList.remove('playing');

        /* Listen for ANY click on the page */
        document.addEventListener('click', function startMusic() {
            const stillMuted = localStorage.getItem('musicMuted') === 'true';
            if (!stillMuted) {
                music.currentTime = savedTime;
                music.play().then(() => {
                    btn.classList.add('playing');
                    icon.className = 'bx bx-volume-full';
                });
            }
            /* Remove listener so it only fires once */
            document.removeEventListener('click', startMusic);
        });
    });

    /* Save playback position every second */
    setInterval(() => {
        if (!music.paused) {
            localStorage.setItem('musicTime', music.currentTime);
        }
    }, 1000);
});

function toggleMusic() {
    const music = document.getElementById('bg-music');
    const btn = document.querySelector('.music-btn');
    const icon = document.getElementById('music-icon');

    if (music.paused) {
        music.play();
        btn.classList.add('playing');
        icon.className = 'bx bx-volume-full';
        localStorage.setItem('musicMuted', 'false');
    } else {
        music.pause();
        btn.classList.remove('playing');
        icon.className = 'bx bx-volume-mute';
        localStorage.setItem('musicMuted', 'true');
    }
}

// --- Play voice button ---
function playVoice() {
    const audio = document.getElementById('char-voice');
    if (audio) {
        audio.currentTime = 0;
        audio.play();
    }
}

// --- Character selector ---
function selectChar(el, name, artSrc, va, desc, audioSrc, videoSrc) {

    /* Remove active from all thumbnails */
    document.querySelectorAll('.char-thumb').forEach(t => t.classList.remove('active'));
    el.classList.add('active');

    /* Update character name */
    document.querySelector('.char-name').textContent = name;

    /* Update character art — this is the key fix */
    const artImg = document.querySelector('.char-art img');
    artImg.src = artSrc;        /* ← swaps the image */
    artImg.alt = name;

    /* Update VA label */
    document.querySelector('.char-va-label').textContent = va;

    /* Update description */
    document.querySelector('.char-desc-box p').textContent = desc;

    /* Update audio source */
    const audio = document.getElementById('char-voice');
    audio.src = audioSrc;
    audio.load();

    /* Update video source */
    const video = document.querySelector('.char-video-panel video');
    video.src = videoSrc;       /* ← swaps the video */
    video.load();               /* ← reloads with new source */
    video.play();               /* ← starts playing immediately */
    
}