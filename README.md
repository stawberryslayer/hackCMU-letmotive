# hackCMU-CodePup
Project for HackCMU 2025

### CodePup is a Chrome extension that enhances the LeetCode coding experience with celebrations, motivational popups, and progress tracking. It aims to improve user well-being and encourage sustainable coding practice habits.

### Installation

1. Download the CodePup Code
    Go to our repository or link where the code is hosted.
    Click Download or Clone the repository to your local machine.
    Make sure you remember the folder where the code is saved.

2. Open Chrome Extensions Management
    Open Google Chrome.
    Click on the three vertical dots (⋮) in the top-right corner of the browser window to open the menu.
    From the menu, hover over or click on "Extensions".
    From the sub-menu that appears, select "Manage extensions".
    This will take you to the Extensions page.

3. Enable Developer Mode
    In the top-right corner of the Extensions page, toggle Developer mode on.
    
4. Load the Unpacked Extension
    Click the Load unpacked button that appears in the top-left corner.
    In the dialog, navigate to the folder where you downloaded CodePup code.
    Select the folder and click Open.

5. Confirm Installation
    After loading, you should see CodePup listed in your Chrome extensions.
    Make sure it’s enabled (toggle switch is on).

6. Use CodePup on LeetCode
    Open LeetCode in a new tab.
    You should see CodePup active on the page.
    You can now enjoy all CodePup features directly on LeetCode!
   
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

1. Celebrations on Accepted Submissions

    The dropped "snacks" (emoji snacks) randomly drop according to the difficulty level (easy/medium/hard).

2. A popup window with Scotty cheering the user on:

    After treats fall, they are collected inside the popup alongside Scotty.
    Each treat appears as a clickable emoji snack.
    When the user clicks a snack, Scotty “eats” it: The snack disappears.
    A playful message appears (“Yum! Thanks for the treat!”).
    After a short moment, Scotty returns to his sitting pose, ready for more.

3. Floating Dog Icon

    Draggable companion that stays on screen.
    Click to view problem difficulty and your progress score.
    Hover animations to display Scotty’s mood:
        If your score is high / improving, Scotty shows a happily.
        If your score has dropped due to inactivity, Scotty shows sadly.
    This turns Scotty into a visual indicator of your coding health, nudging you to keep practicing regularly.

4. Progress Tracking

    Users earn points when solving problems.
    Score decays linearly or exponentially if users skip days.
    Helps motivate consistent daily practice.

