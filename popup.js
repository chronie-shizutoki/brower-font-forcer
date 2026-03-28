// Global variables
let toggleBtn, statusDot, statusText, languageSelect;
let languageSelectButton, languageSelectLabel, languageOptionsContainer, languageOptions;

function updateUI(isEnabled) { 
    // Update toggle switch status
    if (isEnabled) { 
        toggleBtn.classList.add('active'); 
        toggleBtn.setAttribute('aria-checked', 'true'); 
    } else { 
        toggleBtn.classList.remove('active'); 
        toggleBtn.setAttribute('aria-checked', 'false'); 
    } 
    
    // Update status indicator
    if (statusDot) { 
        if (isEnabled) { 
            statusDot.classList.remove('inactive'); 
        } else { 
            statusDot.classList.add('inactive'); 
        } 
    } 
    
    // Add accessibility attributes 
    toggleBtn.setAttribute('role', 'switch'); 
    toggleBtn.setAttribute('tabindex', '0'); 
    toggleBtn.setAttribute('aria-label', isEnabled ? (chrome.i18n.getMessage('disableFontForce') || 'Disable font force') : (chrome.i18n.getMessage('enableFontForce') || 'Enable font force')); 
    
    // Update status text 
    updateStatusText(); 
}

function toggleLanguageDropdown() {
    const expanded = languageSelectButton.getAttribute('aria-expanded') === 'true';
    languageSelectButton.setAttribute('aria-expanded', String(!expanded));
    languageOptionsContainer.setAttribute('aria-hidden', String(expanded));
    languageOptionsContainer.classList.toggle('open', !expanded);
}

function closeLanguageDropdown() {
    if (!languageSelectButton) return;
    languageSelectButton.setAttribute('aria-expanded', 'false');
    languageOptionsContainer.setAttribute('aria-hidden', 'true');
    languageOptionsContainer.classList.remove('open');
}
function setLanguageOption(value) {
    if (!languageSelect) return;
    languageSelect.value = value;
    const option = languageOptions.find(item => item.dataset.value === value);
    if (option) {
        languageOptions.forEach(item => item.classList.remove('active'));
        option.classList.add('active');
        languageSelectLabel.textContent = option.textContent;
    }
    closeLanguageDropdown();
    changeLanguage();
}

function syncLanguageUI(language) {
    if (!languageSelect || !languageSelectLabel) return;
    const option = languageOptions.find(item => item.dataset.value === language);
    if (option) {
        option.classList.add('active');
        languageSelectLabel.textContent = option.textContent;
    }
    languageSelect.value = language;
}

// Add smooth animation effect 
function addRippleEffect(element, event) { 
    const ripple = document.createElement('span'); 
    const rect = element.getBoundingClientRect(); 
    const size = Math.max(rect.width, rect.height); 
    const x = event.clientX - rect.left - size / 2; 
    const y = event.clientY - rect.top - size / 2; 
    
    ripple.style.cssText = ` 
        position: absolute; 
        width: ${size}px; 
        height: ${size}px; 
        left: ${x}px; 
        top: ${y}px; 
        background: rgba(255, 255, 255, 0.3); 
        border-radius: 50%; 
        transform: scale(0); 
        animation: ripple 0.6s ease-out; 
        pointer-events: none; 
    `; 
    
    // Add ripple animation style 
    if (!document.getElementById('ripple-style')) { 
        const style = document.createElement('style'); 
        style.id = 'ripple-style'; 
        style.textContent = ` 
            @keyframes ripple { 
                to { 
                    transform: scale(2); 
                    opacity: 0; 
                } 
            } 
        `; 
        document.head.appendChild(style); 
    } 
    
    element.style.position = 'relative'; 
    element.style.overflow = 'hidden'; 
    element.appendChild(ripple); 
    
    setTimeout(() => { 
        ripple.remove(); 
    }, 600); 
} 

document.addEventListener('DOMContentLoaded', function() { 
    toggleBtn = document.getElementById('toggleBtn'); 
    statusDot = document.getElementById('statusDot'); 
    statusText = document.getElementById('statusText'); 
    languageSelect = document.getElementById('languageSelect'); 
    languageSelectButton = document.getElementById('languageSelectButton');
    languageSelectLabel = document.getElementById('languageSelectLabel');
    languageOptionsContainer = document.getElementById('languageOptions');
    languageOptions = Array.from(document.querySelectorAll('.custom-option'));
    
    // Initialize internationalization
    initializeI18n(); 
    
    // Load current state 
    loadCurrentState(); 
    
    // Bind toggle button event 
    toggleBtn.addEventListener('click', toggleFontForce); 
    
    // Bind language selector event 
    languageSelectButton.addEventListener('click', toggleLanguageDropdown);
    languageOptions.forEach(option => {
        option.addEventListener('click', () => setLanguageOption(option.dataset.value));
        option.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setLanguageOption(option.dataset.value);
            }
        });
    });

    document.addEventListener('click', (event) => {
        const isInside = event.target.closest('#languageSelectWrapper');
        if (!isInside) {
            closeLanguageDropdown();
        }
    });

    
    // Add keyboard support 
    toggleBtn.addEventListener('keydown', function(e) { 
        if (e.key === 'Enter' || e.key === ' ') { 
            e.preventDefault(); 
            toggleFontForce(); 
        } 
    }); 
    
    // Detect system theme change 
    if (window.matchMedia) { 
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)'); 
        mediaQuery.addListener(function(e) { 
            // Additional processing logic can be added when the theme changes
            console.log('Theme changed to:', e.matches ? 'dark' : 'light'); 
        }); 
    } 
    
    // Add page load animation 
    setTimeout(() => { 
        document.body.style.opacity = '1'; 
    }, 100); 
 });

// Internationalization related functions
// Translation cache
let translations = {};

// Load translation file
function loadTranslations(language, callback) {
    // If the translation for the language has already been loaded, call the callback directly
    if (translations[language]) {
        callback();
        return;
    }
    
    // Load the translation file
    fetch(`_locales/${language}/messages.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load translation file: ${language}`);
            }
            return response.json();
        })
        .then(data => {
            translations[language] = data;
            callback();
        })
        .catch(error => {
            console.error(error);
            // If loading fails, use the default language
            if (language !== 'en') {
                loadTranslations('en', callback);
            } else {
                // If loading fails and the default language is also not available, use the original message key
                callback(messageKey);
            }
        });
}

// Get translation text
function getMessage(messageKey, language) {
    if (!translations[language] || !translations[language][messageKey]) {
        // If the translation is not found, try using the default language
        if (language !== 'en' && translations['en'] && translations['en'][messageKey]) {
            return translations['en'][messageKey].message;
        }
        // If the translation is not found in the default language, return the original message key
        return messageKey;
    }
    return translations[language][messageKey].message;
}

function initializeI18n() {
    // Load the saved language setting
    chrome.storage.sync.get(['selectedLanguage'], function(result) {
        const savedLanguage = result.selectedLanguage || chrome.i18n.getUILanguage().replace('-', '_');
        const languageSelect = document.getElementById('languageSelect');
        
        // Set the value of the language selector
        if (languageSelect) {
            languageSelect.value = savedLanguage;
        }
        syncLanguageUI(savedLanguage);
        
        // Immediately update the font (no need to wait for translation loading)
        updateFontFamily(savedLanguage);
        
        // Load translations
        loadTranslations(savedLanguage, function() {
            // Apply translations
            applyTranslations(savedLanguage);
        });
    });
}

// Update font family based on language
function updateFontFamily(language) {
    const body = document.body;
    
    // Font mapping relationship
    const fontMap = {
        'zh_CN': 'LXGWWenKaiGB-Regular',
        'zh_TW': 'LXGWWenKaiTC-Regular',
        'ko': 'LXGWWenKaiGB-Regular',
        'ja': 'KleeOne-Regular',
        'en': 'KleeOne-Regular'
    };
    
    // Get the font corresponding to the current language
    const font = fontMap[language] || 'KleeOne-Regular';
    
    // Set the font of the body
    body.style.fontFamily = `${font}, sans-serif`;
}

function applyTranslations(language) {
    // Get all elements with the data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
        const messageKey = element.getAttribute('data-i18n');
        const message = getMessage(messageKey, language);
        
        if (message) {
            element.textContent = message;
        }
    });
    
    // Update status text
    updateStatusText(language);
    
    // Update font
    updateFontFamily(language);
}

function changeLanguage() {
    const languageSelect = document.getElementById('languageSelect');
    const selectedLanguage = languageSelect.value;
    
    // Save language settings
    chrome.storage.sync.set({selectedLanguage: selectedLanguage}, function() {
        // Load translations for the new language and apply
        loadTranslations(selectedLanguage, function() {
            applyTranslations(selectedLanguage);
        });
        
        // Notify the content script of the language change
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'changeLanguage',
                    language: selectedLanguage
                }).catch(() => {
                    // Ignore errors, may be the content script has not been loaded yet
                });
            }
        });
    });
}

function updateStatusText(language) {
    const statusText = document.getElementById('statusText');
    const toggleBtn = document.getElementById('toggleBtn');
    
    if (statusText && toggleBtn) {
        const isEnabled = toggleBtn.classList.contains('active');
        const messageKey = isEnabled ? 'statusEnabled' : 'statusDisabled';
        const message = getMessage(messageKey, language);
        
        if (message) {
            statusText.textContent = message;
        }
    }
}

// Load current state function
function loadCurrentState() {
    chrome.storage.sync.get(['fontForceEnabled'], function(result) {
        const isEnabled = result.fontForceEnabled !== false; // Default is enabled
        updateUI(isEnabled);
    });
}

// Toggle font force function
function toggleFontForce() {
    const toggleBtn = document.getElementById('toggleBtn');
    
    // Add click ripple effect
    addRippleEffect(toggleBtn, event);
    
    // Add haptic feedback (if supported)
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
    
    chrome.storage.sync.get(['fontForceEnabled'], function(result) {
        const currentState = result.fontForceEnabled !== false;
        const newState = !currentState;
        
        // Save new state
        chrome.storage.sync.set({fontForceEnabled: newState}, function() {
            updateUI(newState);
            
            // Notify the content script of the state change
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'toggleFontForce',
                        enabled: newState
                    }).catch(() => {
                        // Ignore errors, may be the content script has not been loaded yet
                    });
                }
            });
        });
    });
}