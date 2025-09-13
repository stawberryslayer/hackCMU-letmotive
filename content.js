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
    function frame() {
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
    }
    frame();
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
  
  // kick off
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startDomWatcher);
  } else {
    startDomWatcher();
  }
  