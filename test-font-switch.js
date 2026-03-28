// Test font switching functionality
console.log('Start testing font switch functionality...');

// Font list and paths
const fonts = [
    { family: 'LXGWWenKaiGB-Regular', url: 'LXGWWenKaiGB-Regular.woff2' },
    { family: 'LXGWWenKaiTC-Regular', url: 'LXGWWenKaiTC-Regular.woff2' },
    { family: 'KleeOne-Regular', url: 'KleeOne-Regular.woff2' }
];

// Mock font mapping
const fontMap = {
    'zh_CN': 'LXGWWenKaiGB-Regular',
    'zh_TW': 'LXGWWenKaiTC-Regular',
    'ko': 'LXGWWenKaiGB-Regular',
    'ja': 'KleeOne-Regular',
    'en': 'KleeOne-Regular'
};

// Load font function
function loadFonts() {
    const fontPromises = fonts.map(font => {
        return new Promise((resolve, reject) => {
            const fontFace = new FontFace(font.family, `url(${font.url})`);
            fontFace.load()
                .then(() => {
                    document.fonts.add(fontFace);
                    console.log(`✓ Font ${font.family} loaded successfully`);
                    resolve();
                })
                .catch(error => {
                    console.error(`✗ Font ${font.family} loading failed:`, error);
                    reject(error);
                });
        });
    });

    return Promise.allSettled(fontPromises);
}

// Test function
function testFontSwitch() {
    // Use document.body instead of creating a new element
    const body = document.body;
    
    // Test font switching for different languages
    Object.keys(fontMap).forEach(language => {
        // Apply the language
        updateFontFamily(language);
        
        // Check if the font is applied correctly
        const computedFont = window.getComputedStyle(body).fontFamily;
        const expectedFont = fontMap[language];
        
        // Since font fallback is possible, we check if the expected font is in the computed font list
        if (computedFont.includes(expectedFont)) {
            console.log(`✓ Font switch test passed for language ${language}: ${computedFont}`);
        } else {
            console.error(`✗ Font switch test failed for language ${language}: Expected ${expectedFont}, got ${computedFont}`);
        }
    });
}

// Mock updateFontFamily function
function updateFontFamily(language) {
    const body = document.body;
    
    // Get the font for the current language
    const font = fontMap[language] || 'KleeOne-Regular';
    
    // Set the body font
    body.style.fontFamily = `${font}, sans-serif`;
}

// Load fonts and run tests after loading
loadFonts().then(results => {
    // Check if any fonts failed to load
    const failedFonts = results.filter(result => result.status === 'rejected');
    if (failedFonts.length > 0) {
        console.warn(`There are ${failedFonts.length} fonts that failed to load, tests may be inaccurate`);
    }
    
    // Delay running tests to ensure fonts are fully applied
    setTimeout(testFontSwitch, 500);
});