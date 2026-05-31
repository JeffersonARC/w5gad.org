/* ============================================================
   JEFFERSON ARC – W5GAD  |  main.js
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     Announcement Bar – dismiss for session only
     ---------------------------------------------------------- */
  const bar = document.getElementById('announcement-bar');
  const barClose = document.getElementById('bar-close');

  if (bar && barClose) {
    // Already dismissed this session?
    if (sessionStorage.getItem('barDismissed') === '1') {
      bar.classList.add('hidden');
    }

    barClose.addEventListener('click', function () {
      bar.classList.add('hidden');
      sessionStorage.setItem('barDismissed', '1');
    });
  }

  /* ----------------------------------------------------------
     Active Nav Link – based on current page filename
     ---------------------------------------------------------- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Desktop nav
  document.querySelectorAll('#nav-links a').forEach(function (link) {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Mobile nav
  document.querySelectorAll('#mobile-menu a').forEach(function (link) {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ----------------------------------------------------------
     Mobile Menu Toggle
     ---------------------------------------------------------- */
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileClose = document.getElementById('mobile-menu-close');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    function closeMobileMenu() {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (mobileClose) {
      mobileClose.addEventListener('click', closeMobileMenu);
    }

    // Close when a link is tapped
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  /* ----------------------------------------------------------
     Carousel
     Each .carousel-wrapper can work independently.
     Expects: .carousel-track > .carousel-slide (each with img)
              .carousel-btn.prev, .carousel-btn.next
              .carousel-dots > .carousel-dot buttons
     ---------------------------------------------------------- */
  document.querySelectorAll('.carousel-wrapper').forEach(function (wrapper) {
    const track = wrapper.querySelector('.carousel-track');
    const slides = wrapper.querySelectorAll('.carousel-slide');
    const prevBtn = wrapper.querySelector('.carousel-btn.prev');
    const nextBtn = wrapper.querySelector('.carousel-btn.next');
    const dots = wrapper.querySelectorAll('.carousel-dot');

    if (!track || slides.length === 0) return;

    let current = 0;
    let autoTimer = null;

    function goTo(index) {
      // Wrap around
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
      autoTimer = setInterval(function () {
        goTo(current + 1);
      }, 5000);
    }

    function stopAuto() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goTo(current - 1);
        stopAuto();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goTo(current + 1);
        stopAuto();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        goTo(i);
        stopAuto();
      });
    });

    // Touch/swipe support
    var touchStartX = 0;
    var touchEndX = 0;

    wrapper.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    wrapper.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) goTo(current + 1);
        else goTo(current - 1);
        stopAuto();
      }
    }, { passive: true });

    // Init
    goTo(0);
    startAuto();
  });

  /* ----------------------------------------------------------
     Accordion
     ---------------------------------------------------------- */
  document.querySelectorAll('.accordion-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      const item = this.closest('.accordion-item');
      const isOpen = item.classList.contains('open');

      // Close all siblings
      const accordion = item.closest('.accordion');
      if (accordion) {
        accordion.querySelectorAll('.accordion-item.open').forEach(function (openItem) {
          if (openItem !== item) {
            openItem.classList.remove('open');
          }
        });
      }

      item.classList.toggle('open', !isOpen);
    });
  });

})();
