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

/* =============================================
   MAP SECTION JS
   ============================================= */

(function () {

  const mapSection = document.querySelector('.map-section');
  if (!mapSection) return;

  const slides = document.querySelectorAll('.map-slide');
  const totalSlides = slides.length;
  let currentSlide = 0;
  let isAnimating = false;
  let wheelLocked = false;

  // Lock page scroll on map page
  document.body.style.overflow = 'hidden';

  // ---- INJECT SCROLL DOTS ----
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'map-scroll-dots';
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('div');
    dot.className = 'map-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }
  mapSection.appendChild(dotsContainer);

  function updateDots(index) {
    dotsContainer.querySelectorAll('.map-dot').forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
  }

  // ---- FOOTER REVEAL ----
  // When on last slide and user scrolls down, unlock page scroll to show footer
  // When user scrolls back up into footer area, re-lock and go back to last slide
  function unlockForFooter() {
    document.body.style.overflow = '';
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('keydown', onKeyDown);

    // Watch for scroll back up to re-enter map
    window.addEventListener('scroll', function reEnterMap() {
      if (window.scrollY === 0) {
        document.body.style.overflow = 'hidden';
        window.removeEventListener('scroll', reEnterMap);
        window.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('keydown', onKeyDown);
      }
    });
  }

  // ---- SLIDE TRANSITION ----
  function goToSlide(next) {
    if (isAnimating || wheelLocked) return;
    if (next === currentSlide) return;

    // If past last slide going down, show footer
    if (next >= totalSlides) {
      unlockForFooter();
      return;
    }

    if (next < 0) return;

    isAnimating = true;
    wheelLocked = true;

    const current = slides[currentSlide];
    const nextSlide = slides[next];
    const goingDown = next > currentSlide;

    // Exit current slide
    current.classList.remove('active');
    current.classList.add(goingDown ? 'exit-up' : 'exit-down');

    // Prepare next slide off-screen instantly (no transition)
    nextSlide.style.transition = 'none';
    nextSlide.style.transform = goingDown ? 'translateY(60px)' : 'translateY(-60px)';
    nextSlide.style.opacity = '0';
    nextSlide.classList.remove('exit-up', 'exit-down');
    nextSlide.classList.add('active');

    // Force reflow then animate in
    void nextSlide.offsetHeight;

    nextSlide.style.transition = 'opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)';
    nextSlide.style.transform = 'translateY(0)';
    nextSlide.style.opacity = '1';

    currentSlide = next;
    updateDots(currentSlide);

    setTimeout(() => {
      current.classList.remove('exit-up', 'exit-down');
      isAnimating = false;
      wheelLocked = false;
    }, 1000);
  }

  // ---- WHEEL SCROLL ----
  function onWheel(e) {
    e.preventDefault();
    if (isAnimating || wheelLocked) return;
    if (e.deltaY > 0) {
      goToSlide(currentSlide + 1);
    } else {
      goToSlide(currentSlide - 1);
    }
  }

  window.addEventListener('wheel', onWheel, { passive: false });

  // ---- TOUCH / SWIPE ----
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const diff = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 40) {
      if (diff > 0) goToSlide(currentSlide + 1);
      else goToSlide(currentSlide - 1);
    }
  }, { passive: true });

  // ---- KEYBOARD ----
  function onKeyDown(e) {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      goToSlide(currentSlide + 1);
    }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      goToSlide(currentSlide - 1);
    }
  }

  window.addEventListener('keydown', onKeyDown);

})();