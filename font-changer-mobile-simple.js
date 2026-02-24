// ==UserScript==
// @name         网页字体更换 - 霞鹜文楷
// @namespace    http://tampermonkey.net/
// @version      1.2.0
// @description  强制网页使用霞鹜文楷字体显示
// @author       Font Changer Team
// @match        *://*/*
// @grant        none
// @run-at       document-start
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    const FONT_CSS = '@import url("https://fontsapi.zeoseven.com/292/main/result.css");';
    const CHECK_INTERVAL = 3000;

    let styleElement = null;
    let checkIntervalId = null;

    function applyFont() {
        if (styleElement) {
            styleElement.remove();
        }

        styleElement = document.createElement('style');
        styleElement.id = 'force-font-style';
        styleElement.textContent = `
            ${FONT_CSS}
            * {
                font-family: 'LXGW WenKai', system-ui, sans-serif !important;
            }
            [class*="fa-"], .fa, .fas, .far, .fab {
                font-family: 'Font Awesome 6 Free', 'Font Awesome 5 Free', FontAwesome, inherit !important;
            }
            [class*="material-"], .mat-icon {
                font-family: 'Material Icons', inherit !important;
            }
            .mdi, [class*="mdi-"] {
                font-family: 'Material Design Icons', inherit !important;
            }
            .iconfont, .nc_iconfont {
                font-family: "iconfont", "nc-iconfont" !important;
            }
        `;

        if (document.head) {
            document.head.appendChild(styleElement);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                if (document.head) {
                    document.head.appendChild(styleElement);
                }
            });
        }
    }

    function ensureFontApplied() {
        if (!document.getElementById('force-font-style')) {
            applyFont();
        }
    }

    function init() {
        applyFont();

        checkIntervalId = setInterval(ensureFontApplied, CHECK_INTERVAL);

        const observer = new MutationObserver((mutations) => {
            let shouldReapply = false;
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const tag = node.tagName.toLowerCase();
                            if (tag === 'style' || (tag === 'link' && node.getAttribute('rel') === 'stylesheet')) {
                                shouldReapply = true;
                            }
                        }
                    });
                }
            });
            if (shouldReapply) {
                setTimeout(applyFont, 100);
            }
        });

        if (document.head) {
            observer.observe(document.head, { childList: true, subtree: true });
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                if (document.head) {
                    observer.observe(document.head, { childList: true, subtree: true });
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
