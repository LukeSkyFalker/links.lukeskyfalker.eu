(function () {
    'use strict';

    // ============================================
    // INIZIALIZZAZIONE BASE
    // ============================================

    const root = document.documentElement;
    const themeBtn = document.getElementById('themeToggle');
    const shareBtn = document.getElementById('shareBtn');

    // Mostra il body quando il JavaScript è pronto
    document.body.classList.add('loaded');

    // Abilita le animazioni JS
    document
        .querySelectorAll('.link-card, .section-divider')
        .forEach((element) => {
            element.classList.add('js-enhanced');
        });


    // ============================================
    // ANIMAZIONI IN ENTRATA
    // ============================================

    const animateIn = (element) => {
        element.classList.add('visible');
    };

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        animateIn(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.05,
                rootMargin: '0px 0px -10px 0px'
            }
        );

        document
            .querySelectorAll('.link-card, .section-divider')
            .forEach((element) => {
                observer.observe(element);
            });
    } else {
        document
            .querySelectorAll('.link-card, .section-divider')
            .forEach(animateIn);
    }


    // ============================================
    // TEMA CHIARO / SCURO
    // ============================================

    let savedTheme = null;

    try {
        savedTheme = localStorage.getItem('theme');
    } catch (error) {
        console.warn('Impossibile leggere il tema salvato:', error);
    }

    const systemPrefersLight = window.matchMedia(
        '(prefers-color-scheme: light)'
    ).matches;

    const applyTheme = (isLight) => {
        const theme = isLight ? 'light' : 'dark';

        root.setAttribute('data-theme', theme);

        if (themeBtn) {
            themeBtn.innerHTML = isLight
                ? '<i class="ph ph-moon"></i>'
                : '<i class="ph ph-sun"></i>';

            themeBtn.setAttribute(
                'aria-label',
                isLight
                    ? 'Passa al tema scuro'
                    : 'Passa al tema chiaro'
            );

            themeBtn.setAttribute(
                'title',
                isLight
                    ? 'Tema scuro'
                    : 'Tema chiaro'
            );
        }

        try {
            localStorage.setItem('theme', theme);
        } catch (error) {
            console.warn('Impossibile salvare il tema:', error);
        }
    };

    if (savedTheme === 'light') {
        applyTheme(true);
    } else if (savedTheme === 'dark') {
        applyTheme(false);
    } else {
        applyTheme(systemPrefersLight);
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isCurrentlyLight =
                root.getAttribute('data-theme') === 'light';

            applyTheme(!isCurrentlyLight);
        });
    }


    // ============================================
    // MESSAGGI
    // ============================================

    const showToast = (message) => {
        alert(message);
    };


    // ============================================
    // COPIA NEGLI APPUNTI
    // ============================================

    const copyToClipboard = async (text) => {
        if (!text) {
            return false;
        }

        // Metodo moderno
        if (
            navigator.clipboard &&
            typeof navigator.clipboard.writeText === 'function'
        ) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (error) {
                console.warn(
                    'Clipboard API non disponibile, uso il fallback.',
                    error
                );
            }
        }

        // Fallback per browser o ambienti che non supportano Clipboard API
        const textarea = document.createElement('textarea');

        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.pointerEvents = 'none';

        document.body.appendChild(textarea);

        textarea.focus();
        textarea.select();

        let copied = false;

        try {
            copied = document.execCommand('copy');
        } catch (error) {
            console.warn('Errore durante la copia:', error);
        }

        textarea.remove();

        return copied;
    };


    // ============================================
    // PULSANTE CONDIVIDI
    // ============================================

    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const shareData = {
                title: 'Luca Smaldone - Link Ufficiali',
                text: 'Scopri tutti i link ufficiali di Luca Smaldone!',
                url: window.location.href
            };

            try {
                if (
                    navigator.share &&
                    typeof navigator.share === 'function'
                ) {
                    await navigator.share(shareData);
                    return;
                }

                const copied = await copyToClipboard(
                    window.location.href
                );

                if (copied) {
                    showToast('🔗 Link copiato negli appunti!');
                } else {
                    showToast('⚠️ Impossibile copiare il link.');
                }
            } catch (error) {
                // Ignora l'annullamento volontario della condivisione
                if (error && error.name !== 'AbortError') {
                    console.warn(
                        'Errore durante la condivisione:',
                        error
                    );
                }
            }
        });
    }


    // ============================================
    // RECUPERA IL LINK DI UNA CARD
    // ============================================

    const getCardUrl = (card) => {
        // Card normale <a>
        if (card instanceof HTMLAnchorElement) {
            return card.href;
        }

        // Card Cal.com
        if (card.hasAttribute('data-cal-link')) {
            const calLink = card.getAttribute('data-cal-link');

            if (calLink) {
                return `https://cal.com/${calLink}`;
            }
        }

        return null;
    };


    // ============================================
    // COPIA LINK DAI TRE PUNTINI
    // ============================================

    const copyCardLink = async (card) => {
        const url = getCardUrl(card);

        if (!url) {
            showToast('⚠️ Nessun link disponibile.');
            return;
        }

        const copied = await copyToClipboard(url);

        if (copied) {
            showToast('🔗 Link copiato!');
        } else {
            showToast('⚠️ Errore durante la copia.');
        }
    };


    // ============================================
    // LINK CARD
    // ============================================

    document.querySelectorAll('.link-card').forEach((card) => {

        card.addEventListener('click', async function (event) {

            const arrow = event.target.closest('.link-arrow');

            // --------------------------------------------
            // CLICK SUI TRE PUNTINI → COPIA IL LINK
            // --------------------------------------------

            if (arrow) {
                event.preventDefault();
                event.stopPropagation();

                await copyCardLink(this);

                return;
            }


            // --------------------------------------------
            // CARD CAL.COM
            // Il popup viene gestito dallo script Cal.com
            // --------------------------------------------

            if (this.hasAttribute('data-cal-link')) {
                return;
            }


            // --------------------------------------------
            // RIPPLE EFFECT
            // --------------------------------------------

            const rect = this.getBoundingClientRect();

            const ripple = document.createElement('span');

            const size = Math.max(
                rect.width,
                rect.height
            );

            ripple.className = 'ripple';

            ripple.style.width = `${size}px`;
            ripple.style.height = `${size}px`;

            ripple.style.left =
                `${event.clientX - rect.left - size / 2}px`;

            ripple.style.top =
                `${event.clientY - rect.top - size / 2}px`;

            this.appendChild(ripple);

            window.setTimeout(() => {
                ripple.remove();
            }, 600);
        });


        // ============================================
        // ACCESSIBILITÀ DEI TRE PUNTINI
        // ============================================

        const arrow = card.querySelector('.link-arrow');

        if (arrow) {
            arrow.addEventListener(
                'keydown',
                async (event) => {
                    if (
                        event.key !== 'Enter' &&
                        event.key !== ' '
                    ) {
                        return;
                    }

                    event.preventDefault();
                    event.stopPropagation();

                    await copyCardLink(card);
                }
            );
        }
    });


    // ============================================
    // TRACKING ANALYTICS
    // ============================================

    document
        .querySelectorAll('[data-track]')
        .forEach((link) => {

            link.addEventListener('click', function () {
                const label = this.dataset.track;

                if (typeof window.gtag === 'function') {
                    window.gtag('event', 'click', {
                        event_category: 'link',
                        event_label: label,
                        transport_type: 'beacon'
                    });
                }
            });

        });


    // ============================================
    // CAL.COM EMBED
    // ============================================

    (function (C, A, L) {

        const pushToQueue = function (api, args) {
            api.q.push(args);
        };

        const documentRef = C.document;

        C.Cal =
            C.Cal ||
            function () {

                const cal = C.Cal;
                const args = arguments;

                if (!cal.loaded) {
                    cal.ns = {};
                    cal.q = cal.q || [];

                    const script =
                        documentRef.createElement('script');

                    script.src = A;

                    documentRef.head.appendChild(script);

                    cal.loaded = true;
                }

                if (args[0] === L) {

                    const api = function () {
                        pushToQueue(api, arguments);
                    };

                    const namespace = args[1];

                    api.q = api.q || [];

                    if (typeof namespace === 'string') {

                        cal.ns[namespace] =
                            cal.ns[namespace] || api;

                        pushToQueue(
                            cal.ns[namespace],
                            args
                        );

                        pushToQueue(
                            cal,
                            ['initNamespace', namespace]
                        );

                    } else {
                        pushToQueue(cal, args);
                    }

                    return;
                }

                pushToQueue(cal, args);
            };

    })(
        window,
        'https://app.cal.eu/embed/embed.js',
        'init'
    );


    // ============================================
    // CONFIGURAZIONE CAL.COM
    // ============================================

    if (typeof Cal === 'function') {

        Cal(
            'init',
            '30min',
            {
                origin: 'https://app.cal.eu'
            }
        );

        Cal.config = Cal.config || {};

        Cal.config.forwardQueryParams = true;

        if (
            Cal.ns &&
            typeof Cal.ns['30min'] === 'function'
        ) {
            Cal.ns['30min'](
                'ui',
                {
                    hideEventTypeDetails: false,
                    layout: 'month_view'
                }
            );
        }
    }

})();