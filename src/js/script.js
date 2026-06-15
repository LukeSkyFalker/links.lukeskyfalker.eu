(function() {
  'use strict';

  const themeBtn = document.getElementById('themeToggle');
  const shareBtn = document.getElementById('shareBtn');

  document.body.classList.add('loaded');

  document.querySelectorAll('.link-card, .section-divider').forEach(el => {
    el.classList.add('js-enhanced');
  });

  const animateIn = (el) => {
    el.classList.add('visible');
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateIn(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -10px 0px' });

    document.querySelectorAll('.link-card, .section-divider').forEach(el => observer.observe(el));
  } else {
    document.querySelectorAll('.link-card, .section-divider').forEach(animateIn);
  }

  const root = document.documentElement;
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

  const applyTheme = (isLight) => {
    root.setAttribute('data-theme', isLight ? 'light' : 'dark');

    if (themeBtn) {
      themeBtn.innerHTML = isLight
        ? '<i class="fas fa-moon"></i>'
        : '<i class="fas fa-sun"></i>';

      themeBtn.setAttribute(
        'aria-label',
        isLight ? 'Passa a tema scuro' : 'Passa a tema chiaro'
      );
    }

    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  };

  if (savedTheme) {
    applyTheme(savedTheme === 'light');
  } else if (systemPrefersLight) {
    applyTheme(true);
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isCurrentlyLight = root.getAttribute('data-theme') === 'light';
      applyTheme(!isCurrentlyLight);
    });
  }

  const showToast = (msg) => {
    alert(msg);
  };

  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const data = {
        title: 'Luca Smaldone - Link Ufficiali',
        text: 'Scopri tutti i link di Luca Smaldone!',
        url: window.location.href
      };

      try {
        if (navigator.share) {
          await navigator.share(data);
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(window.location.href);
          showToast('🔗 Link copiato negli appunti!');
        }
      } catch (err) {
        console.warn(err);
      }
    });
  }

  document.querySelectorAll('.link-card').forEach(card => {

    card.addEventListener('click', function(e) {

      const arrow = e.target.closest('.link-arrow');

      if (arrow) {
        e.preventDefault();
        e.stopPropagation();

        const url = this.href;

        navigator.clipboard.writeText(url)
          .then(() => {
            showToast('🔗 Link copiato!');
          })
          .catch(() => {
            showToast('⚠️ Errore durante la copia');
          });

        return false;
      }

      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);

      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      this.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });

  });

  document.querySelectorAll('[data-track]').forEach(link => {
    link.addEventListener('click', function() {
      const label = this.dataset.track;

      if (typeof gtag === 'function') {
        gtag('event', 'click', {
          event_category: 'link',
          event_label: label,
          transport_type: 'beacon'
        });
      }
    });
  });

})();