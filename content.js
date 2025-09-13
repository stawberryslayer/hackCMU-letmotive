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
    canvas.width = innerWidth; canvas.height = innerHeight;
    addEventListener("resize", () => { canvas.width = innerWidth; canvas.height = innerHeight; });
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
      p.x += p.vx; p.y += p.vy; p.r += 0.05;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = `hsl(${(t + p.x) % 360}, 80%, 60%)`;
      ctx.fillRect(-p.s/2, -p.s/2, p.s, p.s);
      ctx.restore();
    });
    t += 2;
    if (t < 180) requestAnimationFrame(frame); else ctx.clearRect(0,0,canvas.width,canvas.height);
  })();
}

// --- trigger once per accepted result ---
let lastAcceptedStamp = 0;
function celebrate() {
  const now = Date.now();
  if (now - lastAcceptedStamp < 3000) return; // debounce
  lastAcceptedStamp = now;
  showToast("Accepted! Keep growing 🌿");
  confetti();
}

// --- utilities ---
function isVisible(el) {
  if (!(el instanceof Element)) return false;
  const r = el.getBoundingClientRect();
  if (!r || r.width === 0 || r.height === 0) return false;
  const cs = getComputedStyle(el);
  return cs.display !== "none" && cs.visibility !== "hidden";
}
function getName(el) {
  return (
    el.getAttribute("aria-label") ||
    el.title ||
    el.innerText ||
    el.textContent ||
    ""
  ).replace(/\s+/g, " ").trim();
}

function findSolutionButtonByText() {
  const candidates = document.querySelectorAll('button, [role="button"], a[role="button"]');
  for (const el of candidates) {
    const name = (el.getAttribute('aria-label') || el.title || el.innerText || el.textContent || '')
      .replace(/\s+/g, ' ').trim();
    if (/^solution$/i.test(name)) return el;
  }
  return null;
}


function myDomwatcher(){
  const btn = findSolutionButtonByText();
  if (btn){
    celebrate()
  }
}

// kick off
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startDomWatcher);
} else {
  startDomWatcher();
}
