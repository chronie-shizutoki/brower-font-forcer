// Font forcing script
(function() {
    'use strict';
    
    let isEnabled = true;
    let observer = null;
    let checkInterval = null;
    let currentLanguage = 'zh_CN'; // Default language is Simplified Chinese
    let fontsLoaded = false;
    
    // Font mapping table
    const fontMap = {
        'zh_CN': 'LXGWWenKaiGB-Regular', // Simplified Chinese
        'zh_TW': 'LXGWWenKaiTC-Regular', // Traditional Chinese
        'ko': 'LXGWWenKaiGB-Regular',    // Korean
        'ja': 'KleeOne-Regular',         // Japanese
        'en': 'KleeOne-Regular',         // English
        'ms': 'KleeOne-Regular'          // Malay
    };
    
    // Font list
    const fonts = [
        {
            family: 'LXGWWenKaiGB-Regular',
            url: 'LXGWWenKaiGB-Regular.woff2'
        },
        {
            family: 'LXGWWenKaiTC-Regular',
            url: 'LXGWWenKaiTC-Regular.woff2'
        },
        {
            family: 'KleeOne-Regular',
            url: 'KleeOne-Regular.woff2'
        }
    ];
    
    // Load fonts
    function loadFonts() {
        if (fontsLoaded) return Promise.resolve(true);
        
        // Determine base URL for font files
        let baseUrl = '';
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
            baseUrl = chrome.runtime.getURL('');
        } else {
            // Fallback to relative path
            baseUrl = './';
        }
        
        const fontPromises = fonts.map(font => {
            return new Promise((resolve, reject) => {
                const fontFace = new FontFace(font.family, `url(${baseUrl}${font.url})`);
                fontFace.load()
                    .then(loadedFont => {
                        document.fonts.add(loadedFont);
                        resolve(true);
                    })
                    .catch(error => {
                        console.error(`Failed to load font ${font.family}:`, error);
                        resolve(false); // Continue trying other fonts even if this one fails
                    });
            });
        });
        
        return Promise.all(fontPromises).then(results => {
            fontsLoaded = results.some(result => result); // If at least one font loads successfully
            return fontsLoaded;
        });
    }
    
    // Check if extension is enabled and language settings
    function checkEnabled() {
        // First load fonts
        loadFonts().then(() => {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.sync.get(['fontForceEnabled', 'selectedLanguage'], function(result) {
                    isEnabled = result.fontForceEnabled !== false; // Default to enabled
                    currentLanguage = result.selectedLanguage || 'zh_CN'; // If no language setting, use default
                    if (isEnabled) {
                        applyFontForce();
                        startObserving();
                    } else {
                        removeFontForce();
                        stopObserving();
                    }
                });
            } else {
                // If chrome API is not available, enable by default
                applyFontForce();
                startObserving();
            }
        });
    }
    
    // Apply font forcing
    function applyFontForce() {
        if (!isEnabled) return;
        
        // Ensure fonts are loaded
        loadFonts().then(() => {
            // Get font corresponding to current language, use default if not exists
            const font = fontMap[currentLanguage] || fontMap['zh_CN'];
            
            // Create style element
            let style = document.getElementById('force-font-style');
            if (!style) {
                style = document.createElement('style');
                style.id = 'force-font-style';
            }
            
            // Check if browser supports @layer
            const supportsCssLayers = CSS && CSS.supports && CSS.supports('@layer force-font');
            
            // Add corresponding font class based on current language
            const fontRules = `
                /* Core text elements with high specificity */
                html body, html html, html p, html span, 
                /* Headings */
                html h1, html h2, html h3, html h4, html h5, html h6, 
                /* Links */
                html a,
                /* List elements */
                html li, html ul, html ol, html dl, html dt, html dd,
                /* Table elements */
                html table, html tbody, html thead, html tfoot, html tr, html td, html th,
                /* Form elements */
                html input, html textarea, html select, html option, html label, html button,
                /* Structural elements */
                html article, html section, html main, html footer, html header, html nav, html aside, html figure, html figcaption,
                /* Other text elements */
                html blockquote, html pre, html code, html em, html strong, html u, html i, html b, html sup, html sub, html mark, html del, html ins,
                /* Additional text elements */
                html small, html big, html address, html cite, html dfn, html q, html samp, html var, html abbr, html acronym, html kbd, html strike,
                /* div elements with text content (exclude icon containers) */
                html div:not([class*="fa-"]):not(.fa):not(.fas):not(.far):not(.fab):not([class*="icon-"]):not([class*="btn-"]):not([class*="material-"]):not(.mat-):not(.glyph-icon):not(.mdi):not(.ion-):not(.icon):not(.feather):not(.bi):not(.zmdi):not(.google-symbols):not(.gds-icon-):not(.nc_iconfont):not(.iconfont) {
                    font-family: '${font}', sans-serif !important;
                }
                
                /* apply font force to language-specific elements with high specificity */
                html.font-zh_CN .font-zh_CN, html.font-ko .font-ko , 
                /* fix for website geshin-cloud */
                html.lang-zh-cn.font-full, html.lang-zh-cn.font-full *, html.lang-zh-cn.font-full :after, html.lang-zh-cn.font-full :before, html.useCloudFont {
                    font-family: 'LXGWWenKaiGB-Regular', sans-serif !important;
                }
                html.font-zh_TW .font-zh_TW {
                    font-family: 'LXGWWenKaiTC-Regular', sans-serif !important;
                }
                html.font-ja .font-ja, html.font-en .font-en, html.font-ms .font-ms {
                    font-family: 'KleeOne-Regular', sans-serif !important;
                }
                
                /* ensure icon fonts remain unchanged */
                [class*="fa-"] {
                    font-family: 'Font Awesome 7 Free', 'Font Awesome 6 Free', 'Font Awesome 5 Free', 'Font Awesome 4.7.0', FontAwesome, inherit !important;
                }
                .fa, .fas, .far, .fab, .fal, .fa-classic, .fa-regular, .fa-solid, .fa-globe {
                    font-family: 'Font Awesome 7 Free', 'Font Awesome 6 Free', 'Font Awesome 5 Free', 'Font Awesome 4.7.0', FontAwesome, inherit !important;
                }
                /* 其他常见图标库 */
                [class*="material-"] {
                    font-family: 'Material Icons', inherit !important;
                }
                .mdi, [class*="mdi-"] {
                    font-family: 'Material Design Icons', inherit !important;
                }
                .ion-, [class*="ion-"] {
                    font-family: 'Ionicons', inherit !important;
                }
                .feather, [class*="feather-"] {
                    font-family: 'Feather', inherit !important;
                }
                .bi, [class*="bi-"] {
                    font-family: 'Bootstrap Icons', inherit !important;
                }
                .zmdi, [class*="zmdi-"] {
                    font-family: 'Material-Design-Iconic-Font', inherit !important;
                }
                .mat-, [class*="mat-icon"] {
                    font-family: 'Material Icons', inherit !important;
                }
                .nc_iconfont {
                    font-family: "nc-iconfont" !important;
                }
                .iconfont {
                    font-family: "iconfont" !important;
                }
                /* protect fucking unqiue Google Symbols */
                .google-symbols,
                [class*="google-symbols"],
                .mat-icon.google-symbols,
                .mat-icon[class*="google-symbols"],
                /* Also protect elements with gds-icon prefix which might be Google Design System icons */
                [class*="gds-icon-"] {
                    font-family: 'Google Symbols', inherit !important;
                }
                [class*="icon-"]:not([class*="fa-"]) {
                    font-family: inherit !important;
                }
                .glyph-icon {
                    font-family: inherit !important;
                }
            `;
            
            // Wrap in @layer if supported, otherwise use regular style
            if (supportsCssLayers) {
                style.textContent = `
                /* apply font force to text content elements, avoid affecting icons */
                @layer force-font {
                    ${fontRules}
                }
                
                /* Ensure our layer has highest priority */
                @layer {
                    /* Empty layer to make it highest priority */
                }
                `;
            } else {
                style.textContent = `
                /* apply font force to text content elements, avoid affecting icons */
                ${fontRules}
                `;
            }
            
            // Add to head
            if (document.head) {
                document.head.appendChild(style);
            } else {
                // If head is not loaded yet, wait
                document.addEventListener('DOMContentLoaded', function() {
                    if (document.head && isEnabled) {
                        document.head.appendChild(style);
                    }
                });
            }

            // Add corresponding language font class to html element
            if (document.documentElement && isEnabled) {
                // Remove all language font classes
                Object.keys(fontMap).forEach(lang => {
                    document.documentElement.classList.remove(`font-${lang}`);
                });
                // Add current language font class
                document.documentElement.classList.add(`font-${currentLanguage}`);
            }
        });
    }
    
    // Remove font forcing
    function removeFontForce() {
        const style = document.getElementById('force-font-style');
        if (style) {
            style.remove();
        }
        
        // Also remove language font class from html element
        if (document.documentElement) {
            Object.keys(fontMap).forEach(lang => {
                document.documentElement.classList.remove(`font-${lang}`);
            });
        }
    }
    
    // Start observing dynamic changes
    function startObserving() {
        if (!isEnabled || observer) return;
        
        // Monitor body for new elements
        observer = new MutationObserver(function(mutations) {
            if (!isEnabled) return;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Apply language font class to newly added elements
                            node.classList.add(`font-${currentLanguage}`);
                            // Also apply language font class to their children
                            const children = node.querySelectorAll('*');
                            children.forEach(function(child) {
                                child.classList.add(`font-${currentLanguage}`);
                            });
                        }
                    });
                }
            });
        });
        
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                if (isEnabled && observer && document.body) {
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                }
            });
        }
        
        // Throttle function to limit applyFontForce calls
        function throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            }
        }
        
        // Throttled version of applyFontForce (max once per 500ms)
        const throttledApplyFontForce = throttle(function() {
            applyFontForce();
        }, 500);
        
        // Monitor head for CSS changes (new style or link elements)
        let headObserver = new MutationObserver(function(mutations) {
            if (!isEnabled) return;
            
            let cssChanged = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE && 
                            (node.tagName.toLowerCase() === 'style' || 
                             (node.tagName.toLowerCase() === 'link' && node.getAttribute('rel') === 'stylesheet'))) {
                            cssChanged = true;
                        }
                    });
                } else if (mutation.type === 'characterData' || mutation.type === 'attributes') {
                    // Check if style element content or link element href changed
                    if (mutation.target.tagName.toLowerCase() === 'style' || 
                        (mutation.target.tagName.toLowerCase() === 'link' && 
                         mutation.target.getAttribute('rel') === 'stylesheet' && 
                         mutation.attributeName === 'href')) {
                        cssChanged = true;
                    }
                }
            });
            
            if (cssChanged) {
                // Reapply font force after a short delay to ensure new CSS is loaded
                setTimeout(function() {
                    throttledApplyFontForce();
                }, 100);
            }
        });
        
        if (document.head) {
            headObserver.observe(document.head, {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true,
                attributeFilter: ['href', 'rel']
            });
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                if (isEnabled && document.head) {
                    headObserver.observe(document.head, {
                        childList: true,
                        subtree: true,
                        characterData: true,
                        attributes: true,
                        attributeFilter: ['href', 'rel']
                    });
                }
            });
        }
        
        // Regularly check and reapply fonts (to prevent being overwritten by other scripts)
        if (!checkInterval) {
            checkInterval = setInterval(function() {
                if (isEnabled) {
                    // Reapply the entire font force to ensure all elements are covered
                    applyFontForce();
                }
            }, 3000); // Reduced frequency further to minimize performance impact
        }
        
        // Store observers for cleanup
        window.__forceFontObservers = window.__forceFontObservers || [];
        window.__forceFontObservers.push(observer, headObserver);
    }
    
    // Stop observing
    function stopObserving() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        
        // Clean up all observers stored in the global array
        if (window.__forceFontObservers) {
            window.__forceFontObservers.forEach(function(obs) {
                obs.disconnect();
            });
            window.__forceFontObservers = [];
        }
        
        if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
        }
    }
    
    // Listen for messages from popup
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            if (request.action === 'toggleFontForce') {
                isEnabled = request.enabled;
                if (isEnabled) {
                    applyFontForce();
                    startObserving();
                } else {
                    removeFontForce();
                    stopObserving();
                }
                sendResponse({success: true});
            } else if (request.action === 'changeLanguage') {
                currentLanguage = request.language;
                if (isEnabled) {
                    applyFontForce();
                }
                sendResponse({success: true});
            }
        });
    }
    
    // Expose global methods for testing
    window.__forceFontScript = {
        changeLanguage: function(language) {
            currentLanguage = language;
            if (isEnabled) {
                applyFontForce();
            }
        },
        toggleEnabled: function(enabled) {
            isEnabled = enabled;
            if (isEnabled) {
                applyFontForce();
                startObserving();
            } else {
                removeFontForce();
                stopObserving();
            }
        }
    }

    // Initialize
    checkEnabled();
})();