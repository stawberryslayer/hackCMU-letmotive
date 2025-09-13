// --- tiny toast ---
function showToast(msg = "Accepted! Blooming skills 🌱") {
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
  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx; 
      p.y += p.vy; 
      p.r += 0.05;
      ctx.save();
      ctx.translate(p.x, p.y); 
      ctx.rotate(p.r);
      ctx.fillStyle = `hsl(${(t + p.x) % 360}, 80%, 60%)`;
      ctx.fillRect(-p.s/2, -p.s/2, p.s, p.s);
      ctx.restore();
    });
    t += 2;
    if (t < 180) requestAnimationFrame(frame); 
    else ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  frame();
}

// --- trigger once per accepted result ---
let lastAcceptedStamp = 0;
function celebrate() {
  const now = Date.now();
  if (now - lastAcceptedStamp < 3000) return; // debounce
  lastAcceptedStamp = now;
  confetti();
}

// --- strategy 1: DOM-based verdict detection ---
function startDomWatcher() {
  const observer = new MutationObserver(() => {
    // Look for any node whose text includes "Accepted" (robust to UI class changes)
    const hit = [...document.querySelectorAll("body *")].some(el => {
      const txt = el.textContent || "";
      return /(^|\s)Accepted(\s|$)/i.test(txt);
    });
    if (hit) celebrate();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// --- strategy 2: network-based detection (optional, sturdier) ---
(function hookFetch() {
  const orig = window.fetch;
  window.fetch = async function(input, init) {
    const res = await orig(input, init);
    try {
      const url = typeof input === "string" ? input : input.url;
      if (url.includes("/graphql")) {
        const cloned = res.clone();
        const data = await cloned.json().catch(() => null);
        const s = JSON.stringify(data);
        // Heuristics: Accepted can appear as status "ACCEPTED" or display "Accepted"
        if (/\"status\"\s*:\s*\"ACCEPTED\"/i.test(s) || /\"statusDisplay\"\s*:\s*\"Accepted\"/i.test(s)) {
          celebrate();
        }
      }
    } catch { /* ignore */ }
    return res;
  };
})();

// --- floating sidebar icon ---
// --- floating sidebar icon ---
function injectSideIcon() {
  let icon = document.getElementById("codebloom-sideicon");
  if (!icon) {
    icon = document.createElement("img");
    icon.id = "codebloom-sideicon";
    icon.src = chrome.runtime.getURL("icons/dog.png");
    icon.style.userSelect = "none"; // Prevent text selection during drag
    document.body.appendChild(icon);

    // Make it draggable AFTER adding to DOM
    makeDraggable(icon);

    // Click handler (now handled inside makeDraggable for better click/drag detection)
    // Removed separate click handler to avoid conflicts
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

function makeDraggable(el) {
  let isDragging = false;
  let hasMovedWhileDragging = false;
  let offsetX = 0, offsetY = 0;
  let startX = 0, startY = 0;
  
  // Threshold for distinguishing click vs drag (in pixels)
  const DRAG_THRESHOLD = 5;

  function handleMouseDown(e) {
    // Prevent default to avoid text selection and other browser behaviors
    e.preventDefault();
    
    isDragging = true;
    hasMovedWhileDragging = false;
    
    // Store initial positions
    startX = e.clientX;
    startY = e.clientY;
    
    // Calculate offset from mouse to element's top-left corner
    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    // Visual feedback
    el.style.cursor = "grabbing";
    el.style.zIndex = "10000"; // Bring to front while dragging
    el.style.transition = "none"; // Disable transitions during drag
    
    // Add temporary class for styling during drag
    el.classList.add("dragging");
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    
    // Check if we've moved enough to consider this a drag
    const deltaX = Math.abs(e.clientX - startX);
    const deltaY = Math.abs(e.clientY - startY);
    
    if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
      hasMovedWhileDragging = true;
    }
    
    if (hasMovedWhileDragging) {
      // Calculate new position
      let newX = e.clientX - offsetX;
      let newY = e.clientY - offsetY;
      
      // Keep element within viewport bounds
      const rect = el.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;
      
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));
      
      // Apply position
      el.style.left = `${newX}px`;
      el.style.top = `${newY}px`;
      el.style.position = "fixed"; // Ensure it's positioned correctly
    }
  }

  function handleMouseUp(e) {
    if (!isDragging) return;
    
    isDragging = false;
    
    // Reset visual state
    el.style.cursor = "grab";
    el.style.zIndex = ""; // Reset z-index
    el.classList.remove("dragging");
    
    // Re-enable transitions after a brief delay
    setTimeout(() => {
      el.style.transition = "";
    }, 50);
    
    // Handle click vs drag
    if (!hasMovedWhileDragging) {
      // This was a click, not a drag - trigger your click handler here
      handleIconClick(e);
    }
    
    // Save position to localStorage for persistence
    const rect = el.getBoundingClientRect();
    localStorage.setItem('codebloom-icon-position', JSON.stringify({
      x: rect.left,
      y: rect.top
    }));
  }

  // Touch support for mobile devices
  function handleTouchStart(e) {
    // Convert touch to mouse event format
    const touch = e.touches[0];
    handleMouseDown({
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => e.preventDefault()
    });
  }

  function handleTouchMove(e) {
    if (!isDragging) return;
    e.preventDefault(); // Prevent scrolling
    
    const touch = e.touches[0];
    handleMouseMove({
      clientX: touch.clientX,
      clientY: touch.clientY
    });
  }

  function handleTouchEnd(e) {
    const touch = e.changedTouches[0];
    handleMouseUp({
      clientX: touch.clientX,
      clientY: touch.clientY
    });
  }

  // Attach event listeners
  el.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
  
  // Touch events for mobile
  el.addEventListener("touchstart", handleTouchStart, { passive: false });
  document.addEventListener("touchmove", handleTouchMove, { passive: false });
  document.addEventListener("touchend", handleTouchEnd);
  
  // Cleanup function (call this if you need to remove the draggable behavior)
  return function cleanup() {
    el.removeEventListener("mousedown", handleMouseDown);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    el.removeEventListener("touchstart", handleTouchStart);
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
  };
}

// Your click handler function
function handleIconClick(e) {
  const messages = [
    "Woof! Keep coding! 🐕",
    "You've got this! 🌟",
    "Debug like a champion! 🏆", 
    "Code with confidence! 💪",
    "Think, code, repeat! 🔄",
    "Every bug is a learning opportunity! 🐛➡️✨",
    "Stay pawsitive! 🐾",
    "Coding buddy reporting for duty! 🫡"
  ];
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  showToast(randomMessage);
  bounceIcon();
}

// Updated injectSideIcon function with position restoration
function injectSideIcon() {
  let icon = document.getElementById("codebloom-sideicon");
  if (!icon) {
    icon = document.createElement("img");
    icon.id = "codebloom-sideicon";
    icon.src = chrome.runtime.getURL("icons/dog.png");
    icon.style.userSelect = "none";
    icon.style.cursor = "grab";
    icon.style.position = "fixed";
    
    // Restore saved position or use default
    const savedPos = localStorage.getItem('codebloom-icon-position');
    if (savedPos) {
      const pos = JSON.parse(savedPos);
      icon.style.left = `${pos.x}px`;
      icon.style.top = `${pos.y}px`;
    } else {
      // Default position
      icon.style.right = "20px";
      icon.style.bottom = "20px";
    }
    
    document.body.appendChild(icon);
    
    // Make it draggable and store cleanup function if needed
    const cleanupDrag = makeDraggable(icon);
    
    // Store cleanup function on the element for later use if needed
    icon._dragCleanup = cleanupDrag;
  }
}

function bounceIcon() {
  const icon = document.getElementById("codebloom-sideicon");
  if (icon) {
    icon.style.transition = "transform 0.15s ease";
    icon.style.transform = "scale(1.2)";
    setTimeout(() => {
      icon.style.transform = "scale(1)";
      setTimeout(() => {
        icon.style.transition = ""; // Reset transition
      }, 150);
    }, 150);
  }
}