# Chrome Browser Font Force Plugin

This is a Chrome browser extension that can force all web pages to use the custom font.

## Features

- 🎨 Force all web pages to use the custom font
- 🔄 Real-time monitoring of page changes to ensure that dynamically loaded content also uses the specified font
- 🎛️ Enable/disable the font forcing function via the extension icon
- 💪 Use the `!important` rule to ensure the highest font priority
- 🚀 Support all websites, including form elements such as input boxes and buttons

## Installation Methods

### Method 1: Install in Developer Mode (Recommended)

1. Open the Chrome browser
2. Enter `chrome://extensions/` in the address bar and press Enter
3. Turn on the "Developer mode" switch in the upper-right corner
4. Click "Load unpacked"
5. Select the folder containing the extension files (i.e., the current folder)
6. Once the installation is complete, the extension will be displayed in the extensions list

### Method 2: Install via Packaged File

1. Click "Pack extension" on the Chrome extensions page
2. Select the extension folder to generate a `.crx` file
3. Drag and drop the `.crx` file onto the Chrome extensions page to install

## Usage

1. After installing the extension, an icon will appear in the browser toolbar
2. Visit any web page, and the font will be automatically forced to the custom font
3. Click the extension icon to open the control panel
4. You can enable or disable the font forcing function in the control panel

## File Structure

```
├── _locales                  # Localization files
│   ├── en                    # English localization
│   │   └── messages.json     # English messages
│   ├── zh_CN                 # Simplified Chinese localization
│   │   └── messages.json     # Simplified Chinese messages
│   ├── zh_TW                 # Traditional Chinese localization
│   │   └── messages.json     # Traditional Chinese messages
│   ├── ja                    # Japanese localization
│   │   └── messages.json     # Japanese messages
│   ├── ko                    # Korean localization
│   │   └── messages.json     # Korean messages
├── manifest.json             # Plugin configuration file
├── content.css               # Font style file
├── content.js                # Content script
├── popup.html                # Popup window interface
├── popup.js                  # Popup window logic
├── LXGWWenKaiGB-Regular.woff2 # Font file (GB,KO)
├── LXGWWenKaiTC-Regular.woff2 # Font file (TC)
├── KleeOne-Regular.woff2     # Font file (JP,others)
├── OFL_GB.txt                # Derived font license (GB,KO)
├── OFL_TC.txt                # Derived font license (TC)
├── OFL_origin_JP.txt         # Original font license (JP,others)
└── README.md                 # Documentation
```

## Technical Implementation

- Uses Manifest V3 specification
- Injects CSS and JavaScript through content scripts
- Uses MutationObserver to monitor DOM changes
- Supports dynamic enable/disable functionality
- Uses Chrome Storage API to save settings

## Notes

- The plugin will forcibly override the font settings of all web pages.
- Some special websites may require a page refresh to take full effect.
- If you encounter font display issues, you can disable the function via the plugin icon.

## Compatibility

- Supports Chrome version 88+.
- Supports Chromium-based browsers (e.g., Edge, Opera, etc.).

## License

This project is for learning and personal use only.
