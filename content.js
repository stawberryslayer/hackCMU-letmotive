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
function confetti() {
  let canvas = document.getElementById("codebloom-confetti");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "codebloom-confetti";
    document.body.appendChild(canvas);
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    addEventListener("resize", () => {
      canvas.width = innerWidth;
      canvas.height = innerHeight;
    });
  }
  const ctx = canvas.getContext("2d");
  const pieces = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 40,
    s: 4 + Math.random() * 6,
    vy: 2 + Math.random() * 3,
    vx: -1 + Math.random() * 2,
    r: Math.random() * Math.PI
  }));
  let t = 0;
  (function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.r += 0.05;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = `hsl(${(t + p.x) % 360}, 80%, 60%)`;
      ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s);
      ctx.restore();
    });
    t += 2;
    if (t < 180) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  })();
}

// --- trigger once per accepted result ---
let lastAcceptedStamp = 0;
function celebrate() {
  const now = Date.now();
  if (now - lastAcceptedStamp < 3000) return; // debounce
  lastAcceptedStamp = now;
  showToast("Woof accepted! Keep coding! 🐕");
  confetti();
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
