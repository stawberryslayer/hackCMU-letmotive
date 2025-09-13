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

function startDomWatcher() {
  // 1. Find the "Submit" button once it's in the DOM
  const observer = new MutationObserver(() => {
    const submitBtn = [...document.querySelectorAll('button, [role="button"], a[role="button"]')]
      .find(el => /submit/i.test(
        (el.getAttribute('aria-label') || el.title || el.innerText || el.textContent || '')
          .replace(/\s+/g, ' ').trim()
      ));

    if (submitBtn && !submitBtn.dataset._cbBound) {
      submitBtn.dataset._cbBound = "1";

      // 2. Attach click listener to "Submit"
      submitBtn.addEventListener("click", () => {
        // 3. After clicking, watch for "Solution" button
        const solObserver = new MutationObserver(() => {
          const solutionBtn = [...document.querySelectorAll('button, [role="button"], a[role="button"]')]
            .find(el => /^solution$/i.test(
              (el.getAttribute('aria-label') || el.title || el.innerText || el.textContent || '')
                .replace(/\s+/g, ' ').trim()
            ));
          if (solutionBtn) {
            solObserver.disconnect(); // stop once found
            celebrate();
          }
        });
        solObserver.observe(document.body, { childList: true, subtree: true });
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// kick off
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startDomWatcher);
} else {
  startDomWatcher();
}
