// Wisma Apollo - Global Lead Generation Form for WhatsApp
(function () {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('fbclid')) {
            sessionStorage.setItem('wa_source', 'Meta');
            sessionStorage.setItem('wa_click_id', urlParams.get('fbclid'));
        } else if (urlParams.has('gclid') || urlParams.get('utm_source') === 'google') {
            sessionStorage.setItem('wa_source', 'Google');
            sessionStorage.setItem('wa_click_id', urlParams.get('gclid') || '');
        }
    } catch(e) {
        // Ignore sessionStorage exceptions in Strict Incognito Mode
    }

    // 2. Inject Modal CSS dynamically
    const css = `
        .booking-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6); z-index: 10000;
            display: none; align-items: center; justify-content: center;
            opacity: 0; transition: opacity 0.3s ease; padding: 20px;
        }
        .booking-modal-overlay.show { display: flex; opacity: 1; }
        .booking-modal {
            background: #fff; width: 100%; max-width: 400px;
            border-radius: 16px; padding: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            position: relative; transform: translateY(20px); transition: transform 0.3s ease;
            font-family: Inter, system-ui, sans-serif;
        }
        .booking-modal-overlay.show .booking-modal { transform: translateY(0); }
        .bm-close {
            position: absolute; top: 16px; right: 16px; width: 32px; height: 32px;
            background: #f0f0f0; border-radius: 50%; display: flex; align-items: center;
            justify-content: center; font-size: 20px; font-weight: bold; color: #666;
            cursor: pointer; border: none;
        }
        .bm-close:hover { background: #e0e0e0; }
        .bm-title { font-size: 1.2rem; font-weight: 700; color: #1B4332; margin-bottom: 8px; margin-top:0; }
        .bm-desc { font-size: 0.85rem; color: #666; margin-bottom: 20px; line-height: 1.5; }
        .bm-group { margin-bottom: 16px; text-align: left; }
        .bm-group label { display: block; font-size: 0.8rem; font-weight: 600; color: #444; margin-bottom: 6px; }
        .bm-group input { 
            width: 100%; padding: 12px 14px; border: 1px solid #ddd;
            border-radius: 8px; font-size: 0.95rem; font-family: inherit;
            outline: none; transition: border-color 0.2s; box-sizing: border-box;
        }
        .bm-group input:focus { border-color: #25D366; }
        .bm-btn {
            width: 100%; padding: 14px; background: #25D366; color: #fff;
            border: none; border-radius: 50px; font-weight: 700; font-size: 0.95rem;
            cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
            margin-top: 20px; transition: opacity 0.2s, transform 0.1s; font-family: inherit;
        }
        .bm-btn:active { transform: scale(0.98); }
        .bm-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .bm-loading { display: none; width: 18px; height: 18px; border: 2px solid #fff; border-bottom-color: transparent; border-radius: 50%; box-sizing: border-box; animation: rotation 1s linear infinite; }
        @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `;
    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    // 3. Inject Modal HTML globally
    const modalHtml = `
        <div class="booking-modal">
            <button class="bm-close" id="bmClose">&times;</button>
            <h3 class="bm-title">Lanjut ke WhatsApp</h3>
            <p class="bm-desc">Silakan masukkan Nama dan No WhatsApp Anda untuk terhubung dengan Admin kami.</p>
            <form id="bmForm">
                <div class="bm-group">
                    <label for="bmName">Nama Lengkap</label>
                    <input type="text" id="bmName" placeholder="Contoh: Budi Santoso" required>
                </div>
                <div class="bm-group">
                    <label for="bmPhone">No WhatsApp (Aktif)</label>
                    <input type="tel" id="bmPhone" placeholder="Contoh: 081234567890" required>
                </div>
                <button type="submit" class="bm-btn" id="bmSubmit">
                    <svg id="bmIcon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span class="bm-loading" id="bmLoading"></span>
                    <span id="bmBtnText">Kirim & Lanjut ke WhatsApp</span>
                </button>
            </form>
        </div>
    `;
    
    // Defer execution until body is ready
    window.addEventListener('DOMContentLoaded', () => {
        const overlay = document.createElement('div');
        overlay.className = 'booking-modal-overlay';
        overlay.id = 'bmOverlay';
        overlay.innerHTML = modalHtml;
        document.body.appendChild(overlay);

        // 4. Logic Modal and Form Submit
        const bmOverlay = document.getElementById('bmOverlay');
        const bmClose = document.getElementById('bmClose');
        const bmForm = document.getElementById('bmForm');
        const bmName = document.getElementById('bmName');
        const bmPhone = document.getElementById('bmPhone');
        const bmSubmit = document.getElementById('bmSubmit');
        const bmIcon = document.getElementById('bmIcon');
        const bmLoading = document.getElementById('bmLoading');
        const bmBtnText = document.getElementById('bmBtnText');

        let currentWaUrl = 'https://wa.me/62818232021'; // Default Fallback
        let isSubmitting = false;

        function openModal(url) {
            currentWaUrl = url;
            bmOverlay.style.display = 'flex';
            // Trigger reflow
            void bmOverlay.offsetWidth;
            bmOverlay.classList.add('show');
        }

        function closeModal() {
            bmOverlay.classList.remove('show');
            setTimeout(() => {
                bmOverlay.style.display = 'none';
            }, 300);
        }

        bmClose.addEventListener('click', closeModal);
        bmOverlay.addEventListener('click', (e) => {
            if (e.target === bmOverlay) closeModal();
        });

        // 5. Global Interception of WhatsApp Buttons
        document.addEventListener('click', function(e) {
            // Find closest A tag up the DOM tree
            let target = e.target.closest('a');
            if (!target) return;
            
            let href = target.getAttribute('href');
            if (href && (href.includes('wa.me') || href.includes('api.whatsapp.com') || href.includes('whatsapp.com/send'))) {
                e.preventDefault();
                openModal(href);
            }
        });

        // 6. Handle Form Submission
        bmForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (isSubmitting) return;

            const name = bmName.value.trim();
            const phone = bmPhone.value.trim();

            if (!name || !phone) return;

            isSubmitting = true;
            bmSubmit.disabled = true;
            bmIcon.style.display = 'none';
            bmLoading.style.display = 'inline-block';
            bmBtnText.innerText = 'Mengirim...';

            let source = 'Organic';
            let clickId = '';
            try {
                source = sessionStorage.getItem('wa_source') || 'Organic';
                clickId = sessionStorage.getItem('wa_click_id') || '';
            } catch(e) {}

            const payload = {
                name: name,
                phone: phone,
                source: source,
                clickId: clickId
            };

            const GOOGLE_APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz2g1_ZDFhthbNDepnazQJu3hze_Cz24odh0Yjj8nf9xppSCQisS3ZK233EQW2s0wflOw/exec';

            // Fire Meta Pixel & Google Ads Lead Event - Wrapped in Try-Catch for AdBlockers
            try {
                if (typeof dataLayer !== 'undefined') {
                    dataLayer.push({
                        'event': 'generate_lead',
                        'lead_source': source
                    });
                }
                if (typeof fbq !== 'undefined') {
                    fbq('track', 'Lead');
                } 
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'conversion', {
                        'send_to': 'AW-11473033484/YOUR_CONVERSION_LABEL',
                        'event_category': 'engagement',
                        'event_label': 'WhatsApp Form'
                    });
                }
            } catch(e) {
                // Tracking blocked by browser, ignoring safely
            }

            // Submit data via hidden iframe + form POST
            // Iframe has its own browsing context — Google Script processes the request
            // We redirect ONLY after iframe loads (meaning server responded) or after safety timeout
            const iframeId = 'wa_data_frame';
            let iframe = document.getElementById(iframeId);
            if (iframe) iframe.remove();
            
            iframe = document.createElement('iframe');
            iframe.id = iframeId;
            iframe.name = iframeId;
            iframe.style.display = 'none';
            
            let hasRedirected = false;
            const doRedirect = () => {
                if (hasRedirected) return;
                hasRedirected = true;
                window.location.href = currentWaUrl;
                setTimeout(() => {
                    isSubmitting = false;
                    bmSubmit.disabled = false;
                    bmIcon.style.display = 'block';
                    bmLoading.style.display = 'none';
                    bmBtnText.innerText = 'Kirim & Lanjut ke WhatsApp';
                    closeModal();
                }, 1000);
            };

            // When iframe finishes loading = Google Script has responded = data is saved
            iframe.onload = () => {
                // Small delay to ensure everything is flushed
                setTimeout(doRedirect, 300);
            };

            document.body.appendChild(iframe);

            const hiddenForm = document.createElement('form');
            hiddenForm.method = 'POST';
            hiddenForm.action = GOOGLE_APP_SCRIPT_URL;
            hiddenForm.target = iframeId;
            hiddenForm.style.display = 'none';

            // Add form fields (Google Apps Script reads via e.parameter)
            const fields = { name: name, phone: phone, source: source, clickId: clickId };
            Object.keys(fields).forEach(key => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = fields[key];
                hiddenForm.appendChild(input);
            });

            document.body.appendChild(hiddenForm);
            hiddenForm.submit();
            
            // Safety: redirect after 3.5s even if iframe onload doesn't fire
            setTimeout(doRedirect, 3500);
        });

        // 7. High-Performance Google Ads Global Tag Integration
        // Loads gtag only after user interaction to protect PageSpeed scores
        let googLoaded = false;
        function loadGoogleAds() {
            if (googLoaded) return;
            googLoaded = true;
            
            // Inject Google Tag Manager strictly for Google Ads AW-11473033484
            const script = document.createElement('script');
            script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-11473033484';
            script.async = true;
            document.head.appendChild(script);

            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag; // Export globally
            
            gtag('js', new Date());
            gtag('config', 'AW-11473033484'); // PageView is automatically sent here

            // If it's a specific page like hotel rooms, fire ViewContent
            if (window.location.pathname.includes('/hotel') || window.location.pathname.includes('/penginapan')) {
                gtag('event', 'view_item', {
                    'send_to': 'AW-11473033484',
                    'value': 200000,
                    'currency': 'IDR',
                    'items': [{
                        'id': 'wisma-apollo-room',
                        'name': 'Kamar Wisma Apollo',
                        'category': 'Accomodation'
                    }]
                });
            }
        }

        ['scroll', 'mousemove', 'touchstart', 'click'].forEach(e => {
            window.addEventListener(e, loadGoogleAds, { once: true, passive: true });
        });
        setTimeout(loadGoogleAds, 3500); // Fallback

    });
})();
