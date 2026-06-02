/* ============================================================
   carousel-github.js
   Dynamically builds carousels from a GitHub repo folder.
   Drop this file into your js/ folder and add a <script> tag
   for it AFTER main.js on any page that has a carousel.
   ============================================================

   SETUP — two things to configure:
   1. Set GITHUB_USER and GITHUB_REPO below.
   2. In your HTML, change each .carousel-wrapper to use the
      simplified markup shown at the bottom of this file.

   The script finds every .carousel-wrapper that has a
   data-image-folder attribute, fetches the file list from
   the GitHub API, builds the slides and dots, then hands
   off to the existing carousel logic in main.js.
   ============================================================ */

/* ---- YOUR REPO DETAILS — edit these two lines ---- */
const GITHUB_USER = 'YOUR_GITHUB_USERNAME';
const GITHUB_REPO = 'YOUR_REPO_NAME';
/* -------------------------------------------------- */

(function () {
  'use strict';

  /* Supported image extensions */
  const IMAGE_EXTS = /\.(jpe?g|png|webp|gif)$/i;

  /* Build the GitHub Contents API URL for a folder path */
  function apiUrl(folder) {
    return 'https://api.github.com/repos/'
      + GITHUB_USER + '/' + GITHUB_REPO
      + '/contents/' + folder.replace(/^\/|\/$/g, '');
  }

  /* Natural-sort so slide-2 comes before slide-10 */
  function naturalSort(a, b) {
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  }

  /* Build slide + dot HTML and inject into a wrapper, then init */
  function buildCarousel(wrapper, imageFiles) {
    if (imageFiles.length === 0) {
      wrapper.innerHTML = '<p style="color:#fff;padding:20px;">No images found in folder.</p>';
      return;
    }

    /* --- Track --- */
    const track = document.createElement('div');
    track.className = 'carousel-track';

    imageFiles.forEach(function (file, i) {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      const img = document.createElement('img');
      img.src = file.download_url;
      img.alt = file.name.replace(/[-_]/g, ' ').replace(IMAGE_EXTS, '');
      img.loading = i === 0 ? 'eager' : 'lazy';
      slide.appendChild(img);
      track.appendChild(slide);
    });

    /* --- Prev/Next buttons --- */
    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-btn prev';
    prevBtn.setAttribute('aria-label', 'Previous slide');
    prevBtn.innerHTML = '&#8249;';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-btn next';
    nextBtn.setAttribute('aria-label', 'Next slide');
    nextBtn.innerHTML = '&#8250;';

    /* --- Dots --- */
    const dotsDiv = document.createElement('div');
    dotsDiv.className = 'carousel-dots';
    dotsDiv.setAttribute('role', 'tablist');
    dotsDiv.setAttribute('aria-label', 'Slide navigation');

    imageFiles.forEach(function (_, i) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      dotsDiv.appendChild(dot);
    });

    /* Clear loading state and inject */
    wrapper.innerHTML = '';
    wrapper.appendChild(track);
    wrapper.appendChild(prevBtn);
    wrapper.appendChild(nextBtn);
    wrapper.appendChild(dotsDiv);

    /* Hand off to the carousel logic from main.js */
    initCarouselBehavior(wrapper);
  }

  /* Carousel behaviour — mirrors main.js logic so both code paths
     work the same way. Extracted here so dynamically-built carousels
     get initialised at the right time (after the DOM is injected). */
  function initCarouselBehavior(wrapper) {
    const track   = wrapper.querySelector('.carousel-track');
    const slides  = wrapper.querySelectorAll('.carousel-slide');
    const prevBtn = wrapper.querySelector('.carousel-btn.prev');
    const nextBtn = wrapper.querySelector('.carousel-btn.next');
    const dots    = wrapper.querySelectorAll('.carousel-dot');

    if (!track || slides.length === 0) return;

    let current = 0;
    let autoTimer = null;

    function goTo(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      current = index;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(function () { goTo(current + 1); }, 5000);
    }

    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }

    prevBtn.addEventListener('click', function () { goTo(current - 1); stopAuto(); });
    nextBtn.addEventListener('click', function () { goTo(current + 1); stopAuto(); });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goTo(i); stopAuto(); });
    });

    /* Touch/swipe */
    var touchStartX = 0;
    wrapper.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    wrapper.addEventListener('touchend', function (e) {
      var diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 40) {
        goTo(diff > 0 ? current + 1 : current - 1);
        stopAuto();
      }
    }, { passive: true });

    goTo(0);
    startAuto();
  }

  /* Show a loading indicator while we wait for the API */
  function setLoading(wrapper) {
    wrapper.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;'
      + 'height:100%;min-height:200px;color:rgba(255,255,255,0.6);font-size:0.9rem;">'
      + 'Loading photos&hellip;</div>';
  }

  /* Fetch and build each carousel wrapper that has data-image-folder */
  function initAll() {
    document.querySelectorAll('.carousel-wrapper[data-image-folder]').forEach(function (wrapper) {
      const folder = wrapper.getAttribute('data-image-folder');
      setLoading(wrapper);

      fetch(apiUrl(folder))
        .then(function (res) {
          if (!res.ok) throw new Error('GitHub API error: ' + res.status);
          return res.json();
        })
        .then(function (files) {
          const images = files
            .filter(function (f) { return f.type === 'file' && IMAGE_EXTS.test(f.name); })
            .sort(naturalSort);
          buildCarousel(wrapper, images);
        })
        .catch(function (err) {
          console.error('Carousel failed for folder "' + folder + '":', err);
          wrapper.innerHTML =
            '<div style="display:flex;align-items:center;justify-content:center;'
            + 'height:100%;min-height:200px;color:rgba(255,255,255,0.6);font-size:0.9rem;">'
            + 'Photos unavailable.</div>';
        });
    });
  }

  /* Run after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();

/* ============================================================
   HTML CHANGES NEEDED IN YOUR PAGES
   ============================================================

   Replace each full .carousel-wrapper block with this
   simplified version. The only thing that changes between
   pages is the data-image-folder value.

   COMMUNITY (community.html):
   ----------------------------
   <div class="carousel-wrapper"
        data-image-folder="images/community"
        aria-label="Community photo slideshow">
   </div>

   OUR CLUB (ourclub.html):
   -------------------------
   <div class="carousel-wrapper"
        data-image-folder="images/ourclub"
        aria-label="Club photo slideshow"
        style="min-height:380px;">
   </div>

   EQUIPMENT (equipment.html):
   ----------------------------
   <div class="carousel-wrapper"
        data-image-folder="images/equipment"
        aria-label="Equipment photo slideshow"
        style="min-height:360px;">
   </div>

   SCRIPT TAG — add this AFTER the main.js script tag on each
   carousel page:
   ----------------------------
   <script src="js/carousel-github.js"></script>

   ============================================================
   GITHUB API RATE LIMITS
   ============================================================
   The API allows 60 requests/hour for unauthenticated users
   per IP address. For a club site with normal traffic this
   is fine — the file LIST is one API call per carousel per
   page load. The actual images load directly from GitHub's
   CDN (raw.githubusercontent.com), not through the API.

   If you ever need more headroom (e.g. the site gets heavy
   traffic), add a GitHub personal access token:

     const GITHUB_TOKEN = 'ghp_yourtoken';
     // then add to fetch():
     fetch(apiUrl(folder), {
       headers: { 'Authorization': 'token ' + GITHUB_TOKEN }
     })

   A read-only public-repo token raises the limit to
   5,000 requests/hour.
   ============================================================ */
