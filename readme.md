# TD-Helper
TD-Helper is a small project whose sole purpose is to help me (TD) on my day-to-day web browsing and work functions.

It currently provides the following functionality:
- Simple data conversions
  - Hex <-> Dec
  - Base64 Enc/Dec
  - URL Enc/Dec
  - JSON Beautification
  - Unix time <-> UTC date
- Display of IPv4
- Phabricator functionality to auto-copy text announcing a diff (diff title must follow a certain format)
- Highlighting module (when highlighting text on web pages)
  - "Search in Google" functionality
  - Translation to-and-from languages via Google Translate
  - "Copy to clipboard" functionality
- Link hovering module (when hovering over links while pressing a user-defined key)
  - "Open in new tab" functionality
  - "Copy to clipboard" functionality

## Installation
### Firefox
- Find the `.xpi` referenced in each [release](https://github.com/TsimpDim/TD-Helper/releases).
- Either click on it or drag & drop it into FF.
- You should get a FF popup on allowing the installation, click Allow.

### Chrome
- Navigate to `chrome://extensions`
- Expand the Developer dropdown menu and click “Load Unpacked Extension”
- Navigate to the local folder containing the extension’s code and click Ok
- Assuming there are no errors, the extension should load into your browser

## Options
### Firefox
For all extension settings either:
- Right click on its icon and select `Manage Extension`
- Or visit `about:addons` and then select TD-Helper

Afterwards click `Preferences` and you should be able to see the options menu. Make sure to click `save` for your changes to be...saved. 