# hackCMU-CodePup
Project for HackCMU 2025

### CodePup is a Chrome extension that enhances the LeetCode coding experience with celebrations, motivational popups, and progress tracking. It aims to improve user well-being and encourage sustainable coding practice habits.

## Project Structure

```
.
├── manifest.json     # Extension manifest (permissions, popup definition)
├── popup.html        # Popup UI (if applicable)
├── popup.js          # Logic for popup window
├── content.js        # Content script injected into pages
├── styles.css        # Styles for popup and toast
└── README.md        

```

## Features

- Difficulty Detection: Reads elements like div[class*="text-difficulty"] to extract difficulty level.
- Score Display: Parses page text to show scores in a popup or toast message.
- Interactive Icon: Clicking the extension icon triggers animations (bounceIcon) and shows context-based information.
- Popup Support: The extension includes a popup for quick user interactions.