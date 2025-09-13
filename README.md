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
├── content.js        # Content script injected into pages
├── styles.css        # Styles for popup and toast
└── README.md        

```

## Files Description

content.js： 
    Detects accepted submissions on LeetCode.
    Triggers celebrations (temoji snacks, popup).
    Injects floating dog icon with drag-and-drop support.
    Manages icon interactions (bounce, hover animations).
    Provides difficulty detection logic and score calculation: 
        each problem’s difficulty adds different points;
        dog is happy if score > 10, otherwise sad.

manifest.json： 
    Defines the extension: name (myPlugin), version (1.0.0), description.
    Content scripts: inject JS/CSS into LeetCode.
    Web resources: icons and celebration popup.
    Permissions: minimal for functionality.

styles.css： 
    Toasts: elegant success messages.
    Confetti: canvas-based animations.
    Draggable pet icon: user can move.
    Celebration popup: gradient background, animations, pet naming, chat bubbles, bouncing dog, responsive design.

## Features

1. Celebrations on Accepted Submissions

    The dropped "snacks" (emoji snacks) randomly drop according to the difficulty level (easy/medium/hard).

2. A popup window with Scotty cheering the user on:

    After treats fall, they are collected inside the popup alongside Scotty.
    Each treat appears as a clickable emoji snack.
    When the user clicks a snack, Scotty “eats” it: The snack disappears.
    A playful message appears (“Yum! Thanks for the treat!”).
    After a short moment, Scotty returns to his sitting pose, ready for more.

3. Floating Dog Icon

    Draggable companion that stays on screen/
    Clicking the extension icon triggers animations, also displays problem difficulty and your progress score.
    Hover animations to display Scotty’s mood:
        If your score is high / improving, Scotty shows a happily.
        If your score has dropped due to inactivity, Scotty shows sadly.
    This turns Scotty into a visual indicator of your coding health, nudging you to keep practicing regularly.

4. Progress Tracking

    Users earn points when solving problems.
    Score decays linearly or exponentially if users skip days.
    Helps motivate consistent daily practice.

