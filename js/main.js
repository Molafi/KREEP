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

  /* ---- Vote Up buttons (community cards) -------------------------------- */
  document.querySelectorAll(".community-card .btn").forEach(function (btn) {
    if (btn.textContent.indexOf("Vote Up") === -1) return;
    btn.addEventListener("click", function () {
      var card = btn.closest(".community-card");
      if (!card) return;
      var voteSection = card.querySelector(".vote");
      if (!voteSection) return;
      var row = voteSection.querySelector(".row");
      if (!row) return;
      var spans = row.querySelectorAll("span");
      if (spans.length < 2) return;

      // Parse vote count (e.g., "2.7k votes", "410 votes")
      var voteText = spans[1].textContent.trim();
      var countMatch = voteText.match(/([\d.]+)(k?)\s*votes/i);
      if (!countMatch) return;
      var count = parseFloat(countMatch[1]);
      if (countMatch[2].toLowerCase() === "k") count = count * 1000;

      // Increment by 1
      count = Math.round(count) + 1;

      // Format back
      var formatted;
      if (count >= 1000) {
        formatted = (count / 1000).toFixed(1).replace(/\.0$/, "") + "k votes";
      } else {
        formatted = count + " votes";
      }
      spans[1].textContent = formatted;

      // Update approval percentage (increment slightly)
      var approvalText = spans[0].textContent.trim();
      var pctMatch = approvalText.match(/([\d]+)%/);
      if (pctMatch) {
        var pct = parseInt(pctMatch[1], 10);
        if (pct < 99) pct += 1;
        spans[0].textContent = pct + "% approval";

        // Update the vote-bar width
        var bar = voteSection.querySelector(".vote-bar span");
        if (bar) bar.style.width = pct + "%";
      }
    });
  });

  /* ---- Cart dropdown toggle -------------------------------------------- */
  document.querySelectorAll(".cart-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const dropdown = btn.parentElement.querySelector(".cart-dropdown");
      if (!dropdown) return;
      // Close all other dropdowns first
      document.querySelectorAll(".cart-dropdown.open").forEach((d) => {
        if (d !== dropdown) d.classList.remove("open");
      });
      dropdown.classList.toggle("open");
    });
  });

  // Close cart dropdown on outside click
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".cart-dropdown") && !e.target.closest(".cart-btn")) {
      document.querySelectorAll(".cart-dropdown.open").forEach((d) => d.classList.remove("open"));
    }
  });

  /* ---- Cart quantity buttons --------------------------------------------- */
  function updateCartSubtotal(dropdown) {
    const items = dropdown.querySelectorAll(".cart-dropdown__item");
    let subtotal = 0;
    let totalQty = 0;
    items.forEach((item) => {
      const priceEl = item.querySelector(".cart-dropdown__item-price");
      const qtyEl = item.querySelector(".cart-dropdown__qty-val");
      if (!priceEl || !qtyEl) return;
      const price = parseFloat(priceEl.textContent.replace("$", "")) || 0;
      const qty = parseInt(qtyEl.textContent, 10) || 1;
      subtotal += price * qty;
      totalQty += qty;
    });
    const totalEl = dropdown.querySelector(".cart-dropdown__total-val");
    if (totalEl) totalEl.textContent = "$" + subtotal;
    // Update the cart count in the header
    const navRight = dropdown.closest(".nav-right");
    if (navRight) {
      const countEl = navRight.querySelector(".cart-btn .count");
      if (countEl) countEl.textContent = totalQty;
    }
  }

  document.querySelectorAll(".cart-dropdown__qty-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const valEl = btn.parentElement.querySelector(".cart-dropdown__qty-val");
      if (!valEl) return;
      let val = parseInt(valEl.textContent, 10) || 1;
      if (btn.dataset.action === "plus") val++;
      else if (btn.dataset.action === "minus" && val > 1) val--;
      valEl.textContent = val;
      // Recalculate subtotal
      const dropdown = btn.closest(".cart-dropdown");
      if (dropdown) updateCartSubtotal(dropdown);
    });
  });

  /* ====================================================================
     STUDIO: Multi-step wizard
     ==================================================================== */
  const stepIndicator = document.getElementById("stepIndicator");
  const step1 = document.getElementById("step1");
  const step2 = document.getElementById("step2");
  const step3 = document.getElementById("step3");

  if (step1 && step2 && step3) {
    let currentStep = 1;
    let selectedGarment = null;
    const garmentData = {
      hoodie: { name: "Hoodie", weight: "380gsm", price: 88 },
      tshirt: { name: "T-Shirt", weight: "220gsm", price: 54 },
      polo:   { name: "Polo Shirt", weight: "260gsm", price: 72 }
    };

    const steps = [step1, step2, step3];
    const indicators = stepIndicator.querySelectorAll(".step-indicator__step");

    function showStep(num) {
      currentStep = num;
      steps.forEach((s, i) => {
        s.classList.toggle("wizard-step--active", i === num - 1);
      });
      indicators.forEach((ind, i) => {
        ind.classList.remove("active", "completed");
        if (i < num - 1) ind.classList.add("completed");
        else if (i === num - 1) ind.classList.add("active");
      });
    }

    /* -- Garment card selection -- */
    const garmentCards = document.getElementById("garmentCards");
    const btnNext1 = document.getElementById("btnNext1");

    if (garmentCards && btnNext1) {
      garmentCards.addEventListener("click", (e) => {
        const card = e.target.closest(".garment-card");
        if (!card) return;
        garmentCards.querySelectorAll(".garment-card").forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        selectedGarment = card.dataset.garment;
        btnNext1.disabled = false;
      });

      btnNext1.addEventListener("click", () => {
        if (!selectedGarment) return;
        showStep(2);
      });
    }

    /* -- Step navigation buttons -- */
    const btnBack2 = document.getElementById("btnBack2");
    const btnNext2 = document.getElementById("btnNext2");
    const btnBack3 = document.getElementById("btnBack3");

    if (btnBack2) btnBack2.addEventListener("click", () => showStep(1));
    if (btnNext2) btnNext2.addEventListener("click", () => {
      updatePreview();
      showStep(3);
    });
    if (btnBack3) btnBack3.addEventListener("click", () => showStep(2));

    /* -- Update preview in Step 3 -- */
    function updatePreview() {
      const previewText = document.getElementById("previewText");
      const previewGarment = document.getElementById("previewGarment");
      const priceBaseName = document.getElementById("priceBaseName");
      const priceBaseVal = document.getElementById("priceBaseVal");
      const priceTotalVal = document.getElementById("priceTotalVal");
      const orderPrice = document.getElementById("orderPrice");

      const txtInput = document.getElementById("txt");
      if (previewText && txtInput) {
        const textVal = txtInput.value || "VISION";
        previewText.textContent = textVal;
        previewText.setAttribute("data-text", textVal);
      }

      if (selectedGarment && garmentData[selectedGarment]) {
        const g = garmentData[selectedGarment];
        if (previewGarment) previewGarment.textContent = g.name;
        if (priceBaseName) priceBaseName.textContent = "Base \u2014 " + g.name + " (" + g.weight + ")";
        if (priceBaseVal) priceBaseVal.textContent = "$" + g.price.toFixed(2);
        const total = g.price + 18 + 6;
        if (priceTotalVal) priceTotalVal.textContent = "$" + total;
        if (orderPrice) orderPrice.textContent = "$" + total;
      }
    }

    /* -- Logo upload + drag on stage -- */
    const logoDropZone = document.getElementById("logoDropZone");
    const logoFileInput = document.getElementById("logoFileInput");
    const logoPreview = document.getElementById("logoPreview");
    const logoPreviewImg = document.getElementById("logoPreviewImg");
    const logoRemoveBtn = document.getElementById("logoRemoveBtn");
    const stageEl = document.getElementById("stage");

    let dragLogoEl = null;
    let logoAbortController = null;

    function handleLogoFile(file) {
      if (!file || !file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Please upload an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = function (ev) {
        // Show preview thumbnail
        if (logoPreview && logoPreviewImg) {
          logoPreviewImg.src = ev.target.result;
          logoPreview.style.display = "flex";
          logoDropZone.style.display = "none";
        }
        // Add draggable logo to stage
        addLogoToStage(ev.target.result);
      };
      reader.readAsDataURL(file);
    }

    function addLogoToStage(src) {
      // Remove existing logo and clean up old listeners
      if (dragLogoEl && dragLogoEl.parentElement) {
        dragLogoEl.parentElement.removeChild(dragLogoEl);
      }
      if (logoAbortController) {
        logoAbortController.abort();
      }
      logoAbortController = new AbortController();
      var signal = logoAbortController.signal;

      dragLogoEl = document.createElement("div");
      dragLogoEl.className = "draggable-logo selected";
      dragLogoEl.id = "dragLogo";
      const img = document.createElement("img");
      img.src = src;
      img.alt = "Uploaded logo";
      dragLogoEl.appendChild(img);
      dragLogoEl.style.position = "absolute";
      dragLogoEl.style.left = "20%";
      dragLogoEl.style.top = "20%";
      if (stageEl) stageEl.appendChild(dragLogoEl);

      // Make it draggable
      let logoDragging = false, lox = 0, loy = 0;
      const logoStart = (x, y) => {
        logoDragging = true;
        dragLogoEl.classList.add("selected");
        const r = dragLogoEl.getBoundingClientRect();
        lox = x - r.left; loy = y - r.top;
      };
      const logoMove = (x, y) => {
        if (!logoDragging) return;
        const s = stageEl.getBoundingClientRect();
        let nx = x - s.left - lox;
        let ny = y - s.top - loy;
        nx = Math.max(0, Math.min(nx, s.width - dragLogoEl.offsetWidth));
        ny = Math.max(0, Math.min(ny, s.height - dragLogoEl.offsetHeight));
        dragLogoEl.style.left = nx + "px";
        dragLogoEl.style.top = ny + "px";
      };
      const logoEnd = () => { logoDragging = false; };

      dragLogoEl.addEventListener("mousedown", (e) => { e.preventDefault(); logoStart(e.clientX, e.clientY); }, { signal: signal });
      window.addEventListener("mousemove", (e) => logoMove(e.clientX, e.clientY), { signal: signal });
      window.addEventListener("mouseup", logoEnd, { signal: signal });
      dragLogoEl.addEventListener("touchstart", (e) => logoStart(e.touches[0].clientX, e.touches[0].clientY), { passive: true, signal: signal });
      window.addEventListener("touchmove", (e) => { if (logoDragging) logoMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true, signal: signal });
      window.addEventListener("touchend", logoEnd, { signal: signal });
    }

    if (logoFileInput) {
      logoFileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) handleLogoFile(e.target.files[0]);
      });
    }

    if (logoDropZone) {
      logoDropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        logoDropZone.classList.add("dragover");
      });
      logoDropZone.addEventListener("dragleave", () => {
        logoDropZone.classList.remove("dragover");
      });
      logoDropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        logoDropZone.classList.remove("dragover");
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleLogoFile(e.dataTransfer.files[0]);
        }
      });
    }

    if (logoRemoveBtn) {
      logoRemoveBtn.addEventListener("click", () => {
        if (logoAbortController) {
          logoAbortController.abort();
          logoAbortController = null;
        }
        if (dragLogoEl && dragLogoEl.parentElement) {
          dragLogoEl.parentElement.removeChild(dragLogoEl);
          dragLogoEl = null;
        }
        if (logoPreview) logoPreview.style.display = "none";
        if (logoDropZone) logoDropZone.style.display = "";
        if (logoFileInput) logoFileInput.value = "";
      });
    }
  }
})();
