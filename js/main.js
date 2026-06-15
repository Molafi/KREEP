/* ==========================================================================
   KREEP — interactions
   Kept dependency-free so it ports cleanly to any stack / prototype.
   ========================================================================== */
(function () {
  "use strict";

  /* ---- Periodic glitch burst on signature elements --------------------- */
  const glitches = document.querySelectorAll(".glitch");
  function burst() {
    glitches.forEach((el) => {
      if (Math.random() > 0.55) {
        el.classList.add("active");
        setTimeout(() => el.classList.remove("active"), 220 + Math.random() * 200);
      }
    });
  }
  setInterval(burst, 2600);
  // glitch on hover too
  glitches.forEach((el) => {
    el.addEventListener("mouseenter", () => el.classList.add("active"));
    el.addEventListener("mouseleave", () => el.classList.remove("active"));
  });

  /* ---- Animated stat counters (homepage) ------------------------------- */
  const counters = document.querySelectorAll(".num[data-count]");
  if (counters.length) {
    const fmt = (n) => n.toLocaleString("en-US");
    const run = (el) => {
      const target = +el.dataset.count;
      const prefix = el.dataset.prefix || "";
      const dur = 1400;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + fmt(Math.floor(target * eased));
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = prefix + fmt(target);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => io.observe(c));
  }

  /* ---- Generic single-select chip groups ------------------------------- */
  function singleSelect(selector, activeClass) {
    document.querySelectorAll(selector).forEach((group) => {
      group.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn || !group.contains(btn)) return;
        [...group.children].forEach((c) => c.classList && c.classList.remove(activeClass));
        // climb to direct child of the group
        let node = btn;
        while (node.parentElement !== group) node = node.parentElement;
        node.classList.add(activeClass);
      });
    });
  }

  /* ---- Size selector (PDP) --------------------------------------------- */
  document.querySelectorAll(".size-row").forEach((row) => {
    row.addEventListener("click", (e) => {
      const b = e.target.closest(".size");
      if (!b || b.classList.contains("soldout")) return;
      row.querySelectorAll(".size").forEach((s) => s.classList.remove("active"));
      b.classList.add("active");
    });
  });

  /* ---- PDP gallery thumb swap ------------------------------------------ */
  const mainImg = document.getElementById("mainImg");
  if (mainImg) {
    document.querySelectorAll(".thumbs .thumb").forEach((t) => {
      t.addEventListener("click", () => {
        document.querySelectorAll(".thumbs .thumb").forEach((x) => x.classList.remove("active"));
        t.classList.add("active");
        mainImg.className = "ph " + t.dataset.ph;
      });
    });
  }

  /* ---- Design chips (studio left panel) -------------------------------- */
  document.querySelectorAll(".panel .chip-row").forEach((row) => {
    row.addEventListener("click", (e) => {
      const chip = e.target.closest(".design-chip");
      if (!chip) return;
      row.querySelectorAll(".design-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
    });
  });

  /* ---- Studio toolbar / angles / font / layer toggles ------------------ */
  function toggleActiveWithin(containerSel, itemSel) {
    document.querySelectorAll(containerSel).forEach((c) => {
      c.addEventListener("click", (e) => {
        const it = e.target.closest(itemSel);
        if (!it || !c.contains(it)) return;
        c.querySelectorAll(itemSel).forEach((x) => x.classList.remove("active"));
        it.classList.add("active");
      });
    });
  }
  toggleActiveWithin(".toolbar", ".tool");
  toggleActiveWithin(".angles", ".angle");
  toggleActiveWithin(".font-grid", ".font-opt");
  toggleActiveWithin(".layers", ".layer");

  /* ---- Studio: live text + sliders ------------------------------------- */
  const dragText = document.getElementById("dragText");
  const txt = document.getElementById("txt");
  if (dragText && txt) {
    const span = dragText.querySelector("span") || dragText;
    txt.addEventListener("input", () => {
      const v = txt.value || " ";
      span.textContent = v;
      span.setAttribute("data-text", v);
    });

    const bind = (rngId, valId, unit, apply) => {
      const rng = document.getElementById(rngId);
      const val = document.getElementById(valId);
      if (!rng || !val) return;
      const update = () => { val.textContent = rng.value + unit; apply(rng.value); };
      rng.addEventListener("input", update);
      update();
    };
    let size = 72, space = 2, rot = 0;
    const render = () => {
      span.style.fontSize = size + "px";
      span.style.letterSpacing = space + "px";
      dragText.style.transform = `rotate(${rot}deg)`;
    };
    bind("rngSize", "valSize", "px", (v) => { size = +v; render(); });
    bind("rngSpace", "valSpace", "px", (v) => { space = +v; render(); });
    bind("rngRot", "valRot", "\u00b0", (v) => { rot = +v; render(); });

    /* ---- Studio: draggable text on stage ------------------------------- */
    const stage = document.getElementById("stage");
    let dragging = false, ox = 0, oy = 0;
    const start = (x, y) => {
      dragging = true;
      dragText.classList.add("selected");
      const r = dragText.getBoundingClientRect();
      ox = x - r.left; oy = y - r.top;
    };
    const move = (x, y) => {
      if (!dragging) return;
      const s = stage.getBoundingClientRect();
      let nx = x - s.left - ox;
      let ny = y - s.top - oy;
      nx = Math.max(0, Math.min(nx, s.width - dragText.offsetWidth));
      ny = Math.max(0, Math.min(ny, s.height - dragText.offsetHeight));
      dragText.style.position = "absolute";
      dragText.style.left = nx + "px";
      dragText.style.top = ny + "px";
    };
    const end = () => { dragging = false; };

    dragText.addEventListener("mousedown", (e) => { e.preventDefault(); start(e.clientX, e.clientY); });
    window.addEventListener("mousemove", (e) => move(e.clientX, e.clientY));
    window.addEventListener("mouseup", end);
    dragText.addEventListener("touchstart", (e) => start(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    window.addEventListener("touchmove", (e) => move(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    window.addEventListener("touchend", end);

    /* glitch FX tool toggles permanent glitch on the design text */
    const glitchTool = document.getElementById("glitchTool");
    if (glitchTool) {
      glitchTool.addEventListener("click", () => {
        glitchTool.classList.toggle("active");
        span.classList.toggle("active");
      });
    }
  }

  /* ---- Mobile nav burger (simple toggle) ------------------------------- */
  document.querySelectorAll(".nav-burger").forEach((b) => {
    b.addEventListener("click", () => {
      const links = b.closest(".nav").querySelector(".nav-links");
      if (!links) return;
      const open = links.style.display === "flex";
      links.style.display = open ? "" : "flex";
      links.style.position = "absolute";
      links.style.top = "var(--nav-h)";
      links.style.left = "0";
      links.style.right = "0";
      links.style.flexDirection = "column";
      links.style.background = "var(--c-ink-800)";
      links.style.padding = "1rem 1.5rem";
      links.style.borderBottom = "1px solid var(--c-line)";
    });
  });
})();
