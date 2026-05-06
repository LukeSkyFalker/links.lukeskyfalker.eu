(function() {
  'use strict';

  // Safe element selection
  const themeBtn = document.getElementById('themeToggle');
  const shareBtn = document.getElementById('shareBtn');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMessage');

  // Mark body as loaded (remove FOUC hide)
  document.body.classList.add('loaded');

  // Mark elements for JS enhancement (progressive enhancement)
  document.querySelectorAll('.link-card, .section-divider').forEach(el => {
    el.classList.add('js-enhanced');
  });

  // ===== SCROLL ANIMATIONS (with fallback) =====
  const animateIn = (el) => {
    el.classList.add('visible');
  };

  // Fallback: show all immediately if observer not supported
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateIn(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -10px 0px' }); // Less aggressive
    
    document.querySelectorAll('.link-card, .section-divider').forEach(el => observer.observe(el));
  } else {
    // Fallback: show all immediately
    document.querySelectorAll('.link-card, .section-divider').forEach(animateIn);
  }

  // ===== THEME TOGGLE (using data-theme attribute) =====
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  
  const applyTheme = (isLight) => {
    root.setAttribute('data-theme', isLight ? 'light' : 'dark');
    if (themeBtn) {
      themeBtn.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
      themeBtn.setAttribute('aria-label', isLight ? 'Passa a tema scuro' : 'Passa a tema chiaro');
    }
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  };

  // Initialize theme
  if (savedTheme) {
    applyTheme(savedTheme === 'light');
  } else if (systemPrefersLight) {
    applyTheme(true);
  } // else default is dark (already set in HTML)

  // Theme toggle click handler
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isCurrentlyLight = root.getAttribute('data-theme') === 'light';
      applyTheme(!isCurrentlyLight);
    });
  }

  // ===== SHARE & TOAST =====
  const showToast = (msg) => {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.classList.add('show');
    
    // Clear ARIA after animation to avoid repeated announcements
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.removeAttribute('role');
        toast.removeAttribute('aria-live');
      }, 400);
    }, 3000);
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
        } else {
          // Fallback: select URL in address bar hint
          showToast('📋 Seleziona e copia l\'URL dalla barra del browser');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Share error:', err);
          showToast('⚠️ Impossibile condividere. Prova a copiare manualmente.');
        }
      }
    });
  }

  // ===== RIPPLE EFFECT (using CSS class) =====
  document.querySelectorAll('.link-card').forEach(card => {
    card.addEventListener('click', function(e) {
      // Skip ripple if it's a real link being activated
      if (this.tagName === 'A' && !e.defaultPrevented) {
        // Let the link navigate normally, but still show ripple
      }
      
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      
      this.appendChild(ripple);
      
      // Clean up ripple element after animation
      setTimeout(() => ripple.remove(), 600);
    });
    
    // ✅ Keyboard accessibility: only if NOT a native <a> with href
    // Native anchors already work with Enter/Space, so we skip to avoid double-trigger
    if (card.tagName !== 'A' || !card.getAttribute('href')) {
      card.setAttribute('tabindex', '0');
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    }
  });

  // ===== OPTIONAL: Track clicks (if analytics present) =====
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
      // Add other analytics here (Plausible, Matomo, etc.)
    });
  });
})();