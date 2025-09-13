// ===== Inject minimal CSS for the toast (.show) =====
(function ensureStyles(){
  if (document.getElementById("codebloom-styles")) return;
  const style = document.createElement("style");
  style.id = "codebloom-styles";
  style.textContent = `
    #codebloom-toast {
      position: fixed; right: 20px; bottom: 24px;
      padding: 12px 16px; background: #111; color: #fff;
      border-radius: 10px; font: 600 14px system-ui, -apple-system, "Segoe UI";
      box-shadow: 0 10px 30px rgba(0,0,0,.25);
      opacity: 0; transform: translateY(10px);
      transition: opacity .25s ease, transform .25s ease;
      z-index: 999999;
    }
    #codebloom-toast.show { opacity: 1; transform: translateY(0); }
  `;
  document.head.appendChild(style);
})();

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
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
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

// ----- success keywords (extend if needed) -----
const SUCCESS_RE = /\bAccepted\b/i; // add more: /(Accepted|All test cases passed|通过)/i

let submitInFlight = false;
let domObserver = null;
let guardTimer = null;

// Take a baseline map: element -> its textContent at submit time
function takeBaseline() {
  const baseline = new WeakMap();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) {
    const el = walker.currentNode;
    const txt = el.textContent || "";
    if (txt) baseline.set(el, txt);
  }
  return baseline;
}

// Arm a short-lived DOM watcher that fires only on NEW "Accepted"
function armAcceptedWatcher() {
  cleanupWatcher();
  submitInFlight = true;

  const baseline = takeBaseline();

  domObserver = new MutationObserver((records) => {
    if (!submitInFlight) return;
    let hit = false;

    for (const rec of records) {
      // Added nodes
      rec.addedNodes && rec.addedNodes.forEach(node => {
        if (hit) return;
        if (node.nodeType === 1) {
          if (SUCCESS_RE.test(node.textContent || "")) hit = true;
        } else if (node.nodeType === 3) {
          if (SUCCESS_RE.test(node.nodeValue || "")) hit = true;
        }
      });
      if (hit) break;

      // Existing node changed from not-accepted -> accepted
      const el = rec.target.nodeType === 3 ? rec.target.parentElement : rec.target;
      if (el && el.nodeType === 1) {
        const before = baseline.get(el) || "";
        const now = el.textContent || "";
        if (!SUCCESS_RE.test(before) && SUCCESS_RE.test(now)) {
          hit = true;
        }
        baseline.set(el, now); // keep baseline in sync
      }

      if (hit) break;
    }

    if (hit) {
      submitInFlight = false;
      cleanupWatcher();
      celebrate();
    }
  });

  domObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
  // Stop after 20s if no verdict appears
  guardTimer = setTimeout(() => { submitInFlight = false; cleanupWatcher(); }, 20000);
}

function cleanupWatcher() {
  if (domObserver) { try { domObserver.disconnect(); } catch {} domObserver = null; }
  if (guardTimer) { clearTimeout(guardTimer); guardTimer = null; }
}

// Bind to any button whose text CONTAINS "submit" (handles icons/whitespace)
function bindSubmitButtons() {
  const tryBind = () => {
    const btns = [...document.querySelectorAll('button, [role="button"]')];
    const submitBtn = btns.find(
      b => /submit/i.test((b.textContent || '').replace(/\s+/g, ' ').trim())
    );
    if (submitBtn && !submitBtn.__cbBound) {
      submitBtn.__cbBound = true;
      submitBtn.addEventListener('click', armAcceptedWatcher, { capture: true });
    }
  };
  tryBind();
  new MutationObserver(tryBind).observe(document.body, { childList: true, subtree: true });
}

// Kick off (DOM-only approach)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindSubmitButtons);
} else {
  bindSubmitButtons();
}
