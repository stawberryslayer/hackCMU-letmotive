// constants
let messageDisplay = "";  // global

const foodMessages = {
  "🍋": [
    "Eww… a lemon? 🍋 Try again, I want something sweeter!",
    "Not my favorite… let’s code more for better snacks 😅",
    "Woof… too sour! 🐶 Bring me a cookie next time 🍪",
    "Sour power? Hmm… let’s aim for something tastier 🍎"
  ],
  "🍎": [
    "Yum! An apple a day keeps the bugs away 🍎",
    "Fresh and sweet! Thanks, buddy 🐾",
    "Mmm… crisp coding energy 😋",
    "Great start! Keep feeding me those apples 🍏"
  ],
  "🍔": [
    "Woof! A burger boost for my coding brain 🍔",
    "Juicy and delicious — I can solve anything now 🐶",
    "That hit the spot! Let’s tackle the next challenge 💪",
    "Mmm… coding with extra flavor 😋"
  ],
  "🥘": [
    "Wow… a whole meal! You crushed that hard problem 🥘",
    "That was a feast — you’re unstoppable 🏆",
    "I’m stuffed with victory! 🐾",
    "Hard problem, hearty meal. Well done chef-coder 👨‍🍳"
  ],
  "🍾": [
    "POP! A surprise treat 🍾 — cheers to your success!",
    "Woof woof! You unlocked a special snack 🎉",
    "Surprise feast! Coding party time 🐶",
    "Legendary drop! You deserve this celebration 🏅"
  ]
};

// --- tiny toast ---
function showToast(msg = "Woof accepted! Keep coding! 🐕") {
  let toast = document.getElementById("codebloom-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "codebloom-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

// --- micro confetti (canvas) ---
function getOverlayCanvas() {
  let canvas = document.getElementById("codebloom-confetti");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "codebloom-confetti";
    Object.assign(canvas.style, { position: "fixed", inset: "0", zIndex: "999998", pointerEvents: "none" });
    document.body.appendChild(canvas);
    const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
    resize(); addEventListener("resize", resize);
  }
  return canvas;
}

function confettiBottom(opts = {}) {
  const canvas = getOverlayCanvas();
  const ctx = canvas.getContext("2d");
  const {
    count = 120, gravity = 0.18, airDrag = 0.985,
    spread = Math.PI / 2, speedMin = 6, speedMax = 12,
    sizeMin = 4, sizeMax = 8, colors = null, duration = 1800
  } = opts;

  const parts = Array.from({ length: count }, () => {
    const angle = (-Math.PI/2) + (Math.random() - 0.5) * spread;
    const speed = speedMin + Math.random() * (speedMax - speedMin);
    return {
      x: Math.random() * canvas.width,
      y: canvas.height - 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      s: sizeMin + Math.random() * (sizeMax - sizeMin),
      r: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.25,
      color: colors ? colors[(Math.random()*colors.length)|0] : null,
      hue: (Math.random()*360)|0
    };
  });

  const t0 = performance.now();
  return new Promise(resolve => {
    (function frame(now){
      const dt = Math.min(32, (now - (frame._last||now))) / 16.67; frame._last = now;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      let alive = false;
      for (const p of parts) {
        p.vy += gravity*dt; p.vx *= airDrag; p.vy *= airDrag;
        p.x += p.vx*dt; p.y += p.vy*dt; p.r += p.vr*dt;
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.color || `hsl(${p.hue},80%,55%)`;
        ctx.fillRect(-p.s/2, -p.s/2, p.s, p.s);
        ctx.restore();
        if (p.y < canvas.height + 40) alive = true;
      }
      if ((now - t0) < duration && alive) requestAnimationFrame(frame);
      else { ctx.clearRect(0,0,canvas.width,canvas.height); resolve(); }
    })(performance.now());
  });
}

const __cbAssetCache = new Map();
async function loadTreatAsset(treat) {
  if (treat instanceof HTMLImageElement) return treat;
  const key = typeof treat === "string" ? treat : JSON.stringify(treat);
  if (__cbAssetCache.has(key)) return __cbAssetCache.get(key);

  // emoji?
  if (typeof treat === "string" && /\p{Extended_Pictographic}/u.test(treat)) {
    const marker = { __emoji__: true, emoji: treat };
    __cbAssetCache.set(key, marker); return marker;
  }
  // url or inline svg
  let url = treat;
  if (typeof treat === "string" && treat.trim().startsWith("<svg")) {
    url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(treat.trim());
  }
  const img = new Image(); img.decoding = "async"; img.loading = "eager"; img.src = url;
  await img.decode().catch(()=>{});
  __cbAssetCache.set(key, img); return img;
}

async function dropTreats(treats, options = {}) {
  const canvas = getOverlayCanvas();
  const ctx = canvas.getContext("2d");
  const { count = 20, size = 48, gravity = 0.35, airDrag = 0.992, wind = 0, spin = true, jitter = 0.15, duration = 2200 } = options;
  const assets = await Promise.all((Array.isArray(treats) ? treats : [treats]).map(loadTreatAsset));
  if (!assets.length) return;
  const sprites = Array.from({ length: count }, () => {
    const a = assets[(Math.random()*assets.length)|0];
    return {
      x: Math.random()*canvas.width,
      y: -20 - Math.random()*80,
      vx: (Math.random()-0.5)*(1.5 + jitter*4) + wind,
      vy: 1 + Math.random()*2 + jitter*2,
      r: Math.random()*Math.PI*2,
      vr: spin ? (Math.random()-0.5)*0.08 : 0,
      scale: 0.85 + Math.random()*0.5,
      asset: a
    };
  });
  const t0 = performance.now();
  return new Promise(resolve => {
    (function frame(now){
      const dt = Math.min(32, (now - (frame._last||now))) / 16.67; frame._last = now;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      let alive = false;
      for (const s of sprites) {
        s.vy += gravity*dt; s.vx = (s.vx + wind) * airDrag; s.vy *= airDrag;
        s.x += s.vx*dt; s.y += s.vy*dt; s.r += s.vr*dt;
        ctx.save(); ctx.translate(s.x,s.y); ctx.rotate(s.r);
        const drawSize = size * s.scale;
        if (s.asset.__emoji__) {
          ctx.font = `${drawSize}px system-ui, Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(s.asset.emoji, 0, 0);
        } else {
          const w = s.asset.naturalWidth || drawSize, h = s.asset.naturalHeight || drawSize;
          const ratio = w && h ? w/h : 1;
          ctx.drawImage(s.asset, -drawSize/2, -drawSize/(2*ratio), drawSize, drawSize/ratio);
        }
        ctx.restore();
        if (s.y < canvas.height + size) alive = true;
      }
      if ((now - t0) < duration && alive) requestAnimationFrame(frame);
      else { ctx.clearRect(0,0,canvas.width,canvas.height); resolve(); }
    })(performance.now());
  });
}

// --- celebration popup window ---
async function showCelebrationPopup() {
  // Remove existing popup if any
  const existingPopup = document.getElementById("codebloom-celebration-popup");
  if (existingPopup) {
    existingPopup.remove();
  }

  try {
    // Load HTML content from file
    const htmlResponse = await fetch(chrome.runtime.getURL("celebration-popup.html"));
    const htmlContent = await htmlResponse.text();

    // Create popup container
    const popup = document.createElement("div");
    popup.id = "codebloom-celebration-popup";
    popup.className = "celebration-popup";
    popup.innerHTML = htmlContent;

    // Get saved name or use default
    const savedName = localStorage.getItem('codebloom-pet-name') || 'CodePup';
    
    // Set the pet name and dog image
    const nameInput = popup.querySelector('.pet-name-input');
    const dogImage = popup.querySelector('.sit-dog-image');
    
    nameInput.value = savedName;
    dogImage.src = chrome.runtime.getURL("icons/sitdog.png");

    document.body.appendChild(popup);

    // Handle name input changes
    nameInput.addEventListener('blur', () => {
      const newName = nameInput.value.trim() || 'CodePup';
      localStorage.setItem('codebloom-pet-name', newName);
      nameInput.value = newName;
    });

    nameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        nameInput.blur();
      }
    });

    // Handle close button
    const closeBtn = popup.querySelector('.popup-close');
    closeBtn.addEventListener('click', () => {
      popup.classList.add('popup-closing');
      setTimeout(() => {
        if (popup.parentNode) {
          popup.remove();
        }
      }, 300);
    });

    // Animate in
    setTimeout(() => {
      popup.classList.add('popup-show');
    }, 10);

  } catch (error) {
    console.error('Failed to load celebration popup:', error);
    // Fallback to inline HTML if file loading fails
    showCelebrationPopupFallback();
  }
}

// Fallback function with inline HTML (removed - using HTML file only)
function showCelebrationPopupFallback() {
  console.error('Failed to load celebration-popup.html file. Please ensure the file exists.');
}

// Function to detect difficulty from the page
function detectDifficulty() {
  const diffEl = document.querySelector("div[class*='text-difficulty']");
  if (diffEl) {
    const text = diffEl.textContent.trim().toLowerCase();
    if (text.includes('easy')) return 'easy';
    if (text.includes('medium')) return 'medium';
    if (text.includes('hard')) return 'hard';
  }
  return 'unknown';
}

// --- treat selection based on difficulty ---
function sampleTreat(difficulty) {
  const treatMap = {
    bum: ["🍋"],
    easy: ["🍎"],
    medium: ["🍔"],
    hard: ["🥘"],
    surprise: ["🍾"]
  };
  
  const treatOptionsMap = {
    bum: { count: 8, size: 32, gravity: 0.20 },
    easy: { count: 14, size: 42, gravity: 0.28 },
    medium: { count: 20, size: 48, gravity: 0.33 },
    hard: { count: 28, size: 56, gravity: 0.38, wind: 0.01 },
    surprise: { count: 35, size: 64, gravity: 0.45, wind: 0.02 }
  };
  
  const confettiOptionsMap = {
    bum: { count: 40, speedMin: 3, speedMax: 6 },
    easy: { count: 80, speedMin: 5, speedMax: 9 },
    medium: { count: 120, speedMin: 6, speedMax: 12 },
    hard: { count: 160, speedMin: 7, speedMax: 14 },
    surprise: { count: 200, speedMin: 8, speedMax: 16 }
  };
  
  // Normalize difficulty to lowercase
  const normalizedDifficulty = difficulty?.toLowerCase() || 'medium';
  
  // Define probability distributions for each difficulty
  const probabilityMaps = {
    easy: [
      { difficulty: 'easy', probability: 0.5 },
      { difficulty: 'medium', probability: 0.3 },
      { difficulty: 'bum', probability: 0.1 }
    ],
    medium: [
      { difficulty: 'medium', probability: 0.5 },
      { difficulty: 'hard', probability: 0.3 },
      { difficulty: 'easy', probability: 0.1 }
    ],
    hard: [
      { difficulty: 'hard', probability: 0.5 },
      { difficulty: 'surprise', probability: 0.3 },
      { difficulty: 'medium', probability: 0.1 }
    ]
  };
  
  // Get the probability map for the current difficulty, fallback to medium
  const probabilityMap = probabilityMaps[normalizedDifficulty] || probabilityMaps.medium;
  
  // Select treat difficulty based on weighted random selection
  const random = Math.random();
  let cumulativeProbability = 0;
  let selectedDifficulty = 'medium'; // fallback
  
  for (const option of probabilityMap) {
    cumulativeProbability += option.probability;
    if (random <= cumulativeProbability) {
      selectedDifficulty = option.difficulty;
      break;
    }
  }
  
  // Get treats and options for the selected difficulty
  const treats = treatMap[selectedDifficulty] || treatMap.medium;
  const treatOptions = treatOptionsMap[selectedDifficulty] || treatOptionsMap.medium;
  const confettiOptions = confettiOptionsMap[selectedDifficulty] || confettiOptionsMap.medium;
  
  return { treats, treatOptions, confettiOptions };
}

// --- treat selection based on difficulty ---
function sampleTreat(difficulty) {
  const treatMap = {
    bum: ["🍋"],
    easy: ["🍎"],
    medium: ["🍔"],
    hard: ["🥘"],
    surprise: ["🍾"]
  };
  
  const treatOptionsMap = {
    bum: { count: 8, size: 32, gravity: 0.20 },
    easy: { count: 14, size: 42, gravity: 0.28 },
    medium: { count: 20, size: 48, gravity: 0.33 },
    hard: { count: 28, size: 56, gravity: 0.38, wind: 0.01 },
    surprise: { count: 35, size: 64, gravity: 0.45, wind: 0.02 }
  };
  
  const confettiOptionsMap = {
    bum: { count: 40, speedMin: 3, speedMax: 6 },
    easy: { count: 80, speedMin: 5, speedMax: 9 },
    medium: { count: 120, speedMin: 6, speedMax: 12 },
    hard: { count: 160, speedMin: 7, speedMax: 14 },
    surprise: { count: 200, speedMin: 8, speedMax: 16 }
  };
  
  // Normalize difficulty to lowercase
  const normalizedDifficulty = difficulty?.toLowerCase() || 'medium';
  
  // Define probability distributions for each difficulty
  const probabilityMaps = {
    easy: [
      { difficulty: 'easy', probability: 0.5 },
      { difficulty: 'medium', probability: 0.3 },
      { difficulty: 'bum', probability: 0.1 }
    ],
    medium: [
      { difficulty: 'medium', probability: 0.5 },
      { difficulty: 'hard', probability: 0.3 },
      { difficulty: 'easy', probability: 0.1 }
    ],
    hard: [
      { difficulty: 'hard', probability: 0.5 },
      { difficulty: 'surprise', probability: 0.3 },
      { difficulty: 'medium', probability: 0.1 }
    ]
  };
  
  // Get the probability map for the current difficulty, fallback to medium
  const probabilityMap = probabilityMaps[normalizedDifficulty] || probabilityMaps.medium;
  
  // Select treat difficulty based on weighted random selection
  const random = Math.random();
  let cumulativeProbability = 0;
  let selectedDifficulty = 'medium'; // fallback
  
  for (const option of probabilityMap) {
    cumulativeProbability += option.probability;
    if (random <= cumulativeProbability) {
      selectedDifficulty = option.difficulty;
      break;
    }
  }
  
  // Get treats and options for the selected difficulty
  const treats = treatMap[selectedDifficulty] || treatMap.medium;
  const treatOptions = treatOptionsMap[selectedDifficulty] || treatOptionsMap.medium;
  const confettiOptions = confettiOptionsMap[selectedDifficulty] || confettiOptionsMap.medium;
  
  return { treats, treatOptions, confettiOptions };
}

// --- trigger once per accepted result ---
const CELEBRATIONS = {
  easy: () => celebrate("easy"),
  medium: () => celebrate("medium"),
  hard: () => celebrate("hard")
};

let lastAcceptedStamp = 0;
async function celebrate() {
  const now = Date.now();
  if (now - lastAcceptedStamp < 1500) return; // debounce
  lastAcceptedStamp = now;

  // Detect difficulty and get appropriate celebration
  const difficulty = detectDifficulty();
  
  // Get treats and options based on difficulty
  const { treats, treatOptions, confettiOptions } = sampleTreat(difficulty);

  // Show toast based on difficulty
  const difficultyMessages = {
    easy: "Easy peasy! Keep it up! 🍪",
    medium: "Nice work on that medium! 🍣", 
    hard: "Hard problem conquered! 🥩",
    unknown: "Woof accepted! Keep coding! 🐕"
  };
  
  showToast(difficultyMessages[difficulty]);

  // Show popup window and run animations simultaneously
  await Promise.all([
    dropTreats(treats, treatOptions),
    confettiBottom(confettiOptions),
    showCelebrationPopup() // Now runs at the same time
  ]);
  spawnClickableTreats(treats);
}

function startDomWatcher() {
  const observer = new MutationObserver(() => {
    const submitBtn = [...document.querySelectorAll('button, [role="button"], a[role="button"]')]
      .find(el => /submit/i.test(
        (el.getAttribute('aria-label') || el.title || el.innerText || el.textContent || '')
          .replace(/\s+/g, ' ').trim()
      ));

    if (submitBtn && !submitBtn.dataset._cbBound) {
      submitBtn.dataset._cbBound = "1";
      submitBtn.addEventListener("click", () => {
        const solObserver = new MutationObserver(() => {
          const solutionBtn = [...document.querySelectorAll('button, [role="button"], a[role="button"]')]
            .find(el => /^solution$/i.test(
              (el.getAttribute('aria-label') || el.title || el.innerText || el.textContent || '')
                .replace(/\s+/g, ' ').trim()
            ));
          if (solutionBtn) {
            solObserver.disconnect();
            celebrate();
          }
        });
        solObserver.observe(document.body, { childList: true, subtree: true });
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Global state to track dragging
let globalDragState = {
  isDragging: false,
  currentElement: null
};

// --- floating sidebar icon with hover gif ---
function injectSideIcon() {
  let icon = document.getElementById("codebloom-sideicon");
  if (!icon) {
    icon = document.createElement("img");
    icon.id = "codebloom-sideicon";
    icon.src = chrome.runtime.getURL("icons/dog.png");
    icon.style.userSelect = "none";
    icon.style.cursor = "grab";
    icon.style.position = "fixed";
    icon.style.width = "64px";
    icon.style.height = "64px";
    icon.style.transition = "transform 0.2s ease";

    // Restore saved position
    const savedPos = localStorage.getItem('codebloom-icon-position');
    if (savedPos) {
      const pos = JSON.parse(savedPos);
      icon.style.left = `${pos.x}px`;
      icon.style.top = `${pos.y}px`;
    } else {
      icon.style.left = "90%";
      icon.style.top = "20%";
    }

    document.body.appendChild(icon);

    // Make draggable and set up hover
    setupIconBehavior(icon);
  }
}

function setupIconBehavior(icon) {
  // Clean up any existing listeners
  if (icon._dragCleanup) {
    icon._dragCleanup();
  }
  
  // Set up dragging
  const cleanupDrag = makeDraggable(icon);
  icon._dragCleanup = cleanupDrag;

  // Set up hover (remove any existing listeners first)
  icon.removeEventListener("mouseenter", icon._mouseEnterHandler);
  icon.removeEventListener("mouseleave", icon._mouseLeaveHandler);

  icon._mouseEnterHandler = () => {
    if (globalDragState.isDragging) return;
    const hoverTimeout = setTimeout(() => {
      if (globalDragState.isDragging) return;
      createGifElement(icon);
    }, 100);
    icon._hoverTimeout = hoverTimeout;
  };

  icon._mouseLeaveHandler = () => {
    if (icon._hoverTimeout) {
      clearTimeout(icon._hoverTimeout);
      icon._hoverTimeout = null;
    }
  };

  icon.addEventListener("mouseenter", icon._mouseEnterHandler);
  icon.addEventListener("mouseleave", icon._mouseLeaveHandler);
}

function createGifElement(icon, isHappy=false) {
  if (globalDragState.isDragging || !icon.parentNode) return;

  const gif = document.createElement("img");
  gif.id = "codebloom-sideicon-gif";
  if (isHappy) {
    gif.src = chrome.runtime.getURL("icons/happydog.gif");
  } else {
    gif.src = chrome.runtime.getURL("icons/saddog.gif");
  }

  // Copy styles from the original icon
  gif.style.width = icon.style.width;
  gif.style.height = icon.style.height;
  gif.style.position = icon.style.position;
  gif.style.left = icon.style.left;
  gif.style.top = icon.style.top;
  gif.style.right = icon.style.right;
  gif.style.bottom = icon.style.bottom;
  gif.style.zIndex = icon.style.zIndex;
  gif.style.cursor = icon.style.cursor;
  gif.style.borderRadius = icon.style.borderRadius;
  gif.style.transition = icon.style.transition;
  gif.style.userSelect = "none";

  // Handle GIF load error
  gif.addEventListener("error", () => {
    console.log("GIF file not found, keeping static image");
    return;
  });

  // Only replace when GIF loads successfully
  gif.addEventListener("load", () => {
    if (globalDragState.isDragging || !icon.parentNode) return;
    
    document.body.replaceChild(gif, icon);

    // Make GIF draggable
    const cleanupDrag = makeDraggable(gif);
    gif._dragCleanup = cleanupDrag;

    // Set up mouseleave to swap back
    gif.addEventListener("mouseleave", () => {
      swapGifToImage(gif, icon);
    });
  });
}

function swapGifToImage(gif, icon) {
  if (!gif.parentNode) return;
  
  if (gif._dragCleanup) gif._dragCleanup();

  // Copy position back to icon
  icon.style.left = gif.style.left;
  icon.style.top = gif.style.top;
  icon.style.right = gif.style.right;
  icon.style.bottom = gif.style.bottom;

  document.body.replaceChild(icon, gif);
  
  // Re-setup icon behavior
  setupIconBehavior(icon);
}

function makeDraggable(el) {
  let isDragging = false;
  let hasMovedWhileDragging = false;
  let offsetX = 0, offsetY = 0;
  let startX = 0, startY = 0;

  const DRAG_THRESHOLD = 5;

  function handleMouseDown(e) {
    e.preventDefault();
    isDragging = true;
    hasMovedWhileDragging = false;
    globalDragState.isDragging = true;
    globalDragState.currentElement = el;
    
    // If this is a GIF element, immediately swap to static image for dragging
    if (el.id === 'codebloom-sideicon-gif') {
      const icon = createImageElement();
      // Copy GIF position to image
      icon.style.left = el.style.left;
      icon.style.top = el.style.top;
      icon.style.right = el.style.right;
      icon.style.bottom = el.style.bottom;
      
      // Clean up GIF
      if (el._dragCleanup) el._dragCleanup();
      
      // Replace GIF with image
      document.body.replaceChild(icon, el);
      
      // Update element reference and make new image draggable
      el = icon;
      globalDragState.currentElement = el;
      
      // Set up the new icon with full behavior
      setupIconBehavior(el);
      
      // Re-trigger the mousedown on the new image element
      handleMouseDown(e);
      return;
    }

    // Clear any pending hover timeouts
    if (el._hoverTimeout) {
      clearTimeout(el._hoverTimeout);
      el._hoverTimeout = null;
    }

    startX = e.clientX;
    startY = e.clientY;

    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    el.style.cursor = "grabbing";
    el.style.zIndex = "10000";
    el.style.transition = "none";
    el.classList.add("dragging");
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    const deltaX = Math.abs(e.clientX - startX);
    const deltaY = Math.abs(e.clientY - startY);
    if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
      hasMovedWhileDragging = true;
    }
    if (hasMovedWhileDragging) {
      let newX = e.clientX - offsetX;
      let newY = e.clientY - offsetY;
      const rect = el.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));
      el.style.left = `${newX}px`;
      el.style.top = `${newY}px`;
      el.style.position = "fixed";
      el.style.right = "";
      el.style.bottom = "";
    }
  }

  function handleMouseUp(e) {
    if (!isDragging) return;
    isDragging = false;
    globalDragState.isDragging = false;
    globalDragState.currentElement = null;
    
    el.style.cursor = "grab";
    el.style.zIndex = "";
    el.classList.remove("dragging");

    setTimeout(() => {
      el.style.transition = "transform 0.2s ease";
    }, 50);

    if (!hasMovedWhileDragging) {
      handleIconClick(e);
    }

    const rect = el.getBoundingClientRect();
    localStorage.setItem('codebloom-icon-position', JSON.stringify({
      x: rect.left,
      y: rect.top
    }));
  }

  el.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);

  return function cleanup() {
    el.removeEventListener("mousedown", handleMouseDown);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };
}

function createImageElement() {
  const icon = document.createElement("img");
  icon.id = "codebloom-sideicon";
  icon.src = chrome.runtime.getURL("icons/dog.png");
  icon.style.userSelect = "none";
  icon.style.cursor = "grab";
  icon.style.position = "fixed";
  icon.style.width = "64px";
  icon.style.height = "64px";
  icon.style.transition = "transform 0.2s ease";
  return icon;
}

function handleIconClick(e) {
  const diffEl = document.querySelector("div[class*='text-difficulty']");
  const difficulty = diffEl ? diffEl.textContent.trim() : "Unknown";
  showToast(`Difficulty: ${difficulty}`);
  bounceIcon();
}

function bounceIcon() {
  const icon = document.getElementById("codebloom-sideicon") || document.getElementById("codebloom-sideicon-gif");
  if (icon) {
    icon.style.transition = "transform 0.15s ease";
    icon.style.transform = "scale(1.2)";
    setTimeout(() => {
      icon.style.transform = "scale(1)";
      setTimeout(() => {
        icon.style.transition = "transform 0.2s ease";
      }, 150);
    }, 150);
  }
}

function spawnClickableTreats(treats) {
  const popup = document.querySelector("#codebloom-celebration-popup");
  const footer = popup?.querySelector(".popup-footer");
  const dogImg = footer?.querySelector(".sit-dog-image");
  if (!popup || !footer || !dogImg) return;

  // Get dog position relative to popup
  const popupRect = popup.getBoundingClientRect();
  const dogRect = dogImg.getBoundingClientRect();

  const dogCenterX = dogRect.left - popupRect.left + dogRect.width / 2;
  const dogCenterY = dogRect.top - popupRect.top + dogRect.height / 2;

  // Hardcoded positions around the dog
  const positions = [
    { x: -80, y: -60 }, { x: 80, y: -60 },
    { x: -100, y: 0 },  { x: 100, y: 0 },
    { x: -80, y: 60 },  { x: 80, y: 60 },
    { x: 0, y: -80 },   { x: 0, y: 80 }
  ];

  // For each treat, place 3 instances
  treats.forEach((emoji) => {
    // pick and store a random message for this emoji
    if (foodMessages[emoji]) {
      const msgs = foodMessages[emoji];
      messageDisplay = msgs[Math.floor(Math.random() * msgs.length)];
    }

    for (let i = 0; i < 3; i++) {
      const pos = positions[(Math.floor(Math.random() * positions.length))];
      const span = document.createElement("span");
      span.textContent = emoji;
      span.className = "food-emoji";

      const x = dogCenterX + pos.x + (Math.random() * 20 - 10);
      const y = dogCenterY + pos.y + (Math.random() * 20 - 10);

      Object.assign(span.style, {
        position: "absolute",
        left: `${x - 16}px`,
        top: `${y - 16}px`,
        fontSize: "36px",
        cursor: "pointer",
        zIndex: 1000002
      });

      span.addEventListener("click", () => {
        span.remove();
        dogImg.src = chrome.runtime.getURL("icons/eat.gif");

        const chatMsg = document.querySelector("#codebloom-celebration-popup .chat-message");
        if (chatMsg) {
          chatMsg.textContent = messageDisplay; // use the stored message
        }

        setTimeout(() => {
          dogImg.src = chrome.runtime.getURL("icons/sitdog.png");
        }, 5000);
      });

      footer.appendChild(span);
    }
  });
}

// --- kick off ---
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    startDomWatcher();
    injectSideIcon();
  });
} else {
  startDomWatcher();
  injectSideIcon();
}