/* Portfolio 2026 — interactions */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var veil = document.getElementById("veil");

  /* ---------- page transition in ---------- */
  if (veil && document.documentElement.classList.contains("from-nav")) {
    var revealPage = function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          veil.classList.add("is-out");
          window.setTimeout(function () {
            document.documentElement.classList.remove("from-nav");
            veil.classList.remove("is-out");
          }, prefersReduced ? 0 : 700);
        });
      });
    };
    revealPage();
  }

  /* ---------- page transition out ---------- */
  document.addEventListener("click", function (e) {
    var link = e.target.closest("a");
    if (!link || !veil) return;

    var href = link.getAttribute("href");
    if (!href || link.target === "_blank" || link.hasAttribute("download")) return;
    if (href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
    if (href.charAt(0) === "#") return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    var url;
    try {
      url = new URL(href, window.location.href);
    } catch (err) {
      return;
    }

    if (url.href.split("#")[0] === window.location.href.split("#")[0]) return;

    if (prefersReduced) {
      try { sessionStorage.setItem("pv-nav", "1"); } catch (err) {}
      return;
    }

    e.preventDefault();
    try { sessionStorage.setItem("pv-nav", "1"); } catch (err) {}
    veil.classList.add("is-active");
    window.setTimeout(function () {
      window.location.href = href;
    }, 460);
  });

  /* ---------- nav ---------- */
  var nav = document.getElementById("nav");
  var onScroll = function () {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var toggle = document.getElementById("navToggle");
  var drawer = document.getElementById("drawer");

  function setMenu(open) {
    if (!toggle || !drawer) return;
    document.body.classList.toggle("nav-open", open);
    drawer.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(!document.body.classList.contains("nav-open"));
    });
  }

  if (drawer) {
    drawer.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      setMenu(false);
      closeLightbox();
    }
  });

  /* ---------- scroll reveal ---------- */
  var revealItems = document.querySelectorAll("[data-reveal], .index-item");
  if ("IntersectionObserver" in window && revealItems.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealItems.forEach(function (el) { io.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- hero parallax ---------- */
  var stage = document.getElementById("heroStage");
  if (stage && !prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    var targetX = 0, targetY = 0, currentX = 0, currentY = 0, raf = null;

    var tick = function () {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      stage.style.setProperty("--px", currentX.toFixed(3));
      stage.style.setProperty("--py", currentY.toFixed(3));
      if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    };

    var move = function (e) {
      var rect = stage.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerleave", function () {
      targetX = 0;
      targetY = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    });
  }

  /* ---------- screen switcher ---------- */
  var tabs = document.querySelectorAll(".screen-tab");
  if (tabs.length) {
    var stageImg = document.getElementById("screenImage");
    var screenTitle = document.getElementById("screenTitle");
    var screenDesc = document.getElementById("screenDesc");
    var screenCount = document.getElementById("screenCount");
    var phoneWrap = document.getElementById("screenPhone");

    var selectScreen = function (tab) {
      if (!stageImg || tab.classList.contains("is-active")) return;
      tabs.forEach(function (t) {
        t.classList.toggle("is-active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
        t.setAttribute("tabindex", t === tab ? "0" : "-1");
      });

      if (!prefersReduced && phoneWrap) phoneWrap.classList.add("switching");

      window.setTimeout(function () {
        stageImg.src = tab.getAttribute("data-img");
        stageImg.alt = tab.getAttribute("data-alt") || "";
        if (screenTitle) screenTitle.textContent = tab.getAttribute("data-title") || "";
        if (screenDesc) screenDesc.textContent = tab.getAttribute("data-desc") || "";
        if (screenCount) screenCount.textContent = tab.getAttribute("data-count") || "";
        if (!prefersReduced && phoneWrap) phoneWrap.classList.remove("switching");
      }, prefersReduced ? 0 : 260);
    };

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () { selectScreen(tab); });
      tab.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        var next = tabs[index + (e.key === "ArrowRight" ? 1 : -1)];
        if (!next) next = tabs[e.key === "ArrowRight" ? 0 : tabs.length - 1];
        selectScreen(next);
        next.focus();
      });
    });
  }

  /* ---------- lightbox ---------- */
  var lightbox = document.getElementById("lightbox");

  function openLightbox(src, alt) {
    if (!lightbox) return;
    var img = lightbox.querySelector("img");
    var cap = lightbox.querySelector(".lightbox__cap");
    if (img) { img.src = src; img.alt = alt || ""; }
    if (cap) cap.textContent = alt || "";
    lightbox.classList.remove("is-long", "is-narrow");
    if (img) {
      var setLong = function () {
        var ratio = img.naturalHeight / img.naturalWidth;
        var isLong = ratio > 1.2 && (img.naturalWidth >= 1600 || ratio > 3);
        var isNarrow = img.naturalWidth < 1600 && ratio > 3;
        lightbox.classList.toggle("is-long", isLong);
        lightbox.classList.toggle("is-narrow", isNarrow);
        var frame = lightbox.querySelector(".lightbox__frame");
        if (frame) frame.scrollTop = 0;
      };
      if (img.complete && img.naturalWidth) setLong();
      img.addEventListener("load", setLong, { once: true });
    }
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    var close = lightbox.querySelector(".lightbox__close");
    if (close) close.focus();
  }

  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains("is-open")) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-lightbox]").forEach(function (shot) {
    shot.setAttribute("role", "button");
    shot.setAttribute("tabindex", "0");
    shot.addEventListener("click", function () {
      var img = shot.querySelector("img");
      openLightbox(shot.getAttribute("data-lightbox") || (img ? img.src : ""), img ? img.alt : "");
    });
    shot.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        shot.click();
      }
    });
  });

  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    var lightboxClose = lightbox.querySelector(".lightbox__close");
    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  }

  /* ---------- copy email ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      var done = function () {
        var old = btn.textContent;
        btn.textContent = "已复制";
        window.setTimeout(function () { btn.textContent = old; }, 1600);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done, done);
      } else {
        var input = document.createElement("textarea");
        input.value = value;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        try { document.execCommand("copy"); } catch (err) {}
        document.body.removeChild(input);
        done();
      }
    });
  });

  /* ---------- print ---------- */
  document.querySelectorAll("[data-print]").forEach(function (btn) {
    btn.addEventListener("click", function () { window.print(); });
  });

  /* ---------- year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();

/* ---------- work gallery: arc / grid toggle ---------- */
(function () {
  var grid = document.querySelector(".work-grid");
  var toggle = document.getElementById("viewToggle");
  if (!grid || !toggle) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll(".work-card"));
  var active = Math.min(1, cards.length - 1);
  var isArc = true;
  var mq = window.matchMedia("(max-width: 860px)");

  function layout() {
    if (!isArc || mq.matches || !cards.length) return;
    var cw = grid.clientWidth;
    var gap = 32;
    var activeW = Math.round(cw * 0.66);
    var sideW = Math.round(activeW * 2 / 3);
    var sideX = Math.round(activeW / 2 + sideW / 2 - 160);
    grid.style.height = (Math.round(activeW * 9 / 16) + 10) + "px";
    cards.forEach(function (card, i) {
      var offset = i - active;
      var dist = Math.abs(offset);
      card.style.width = (dist === 0 ? activeW : sideW) + "px";
      card.style.transform =
        "translate(-50%,-50%) translateX(" + (dist === 0 ? 0 : (offset > 0 ? sideX : -sideX)) + "px)";
      card.style.opacity = dist <= 1 ? "1" : "0";
      card.style.filter = "brightness(" + (dist === 0 ? 1 : 0.72) + ") saturate(" + (dist === 0 ? 1 : 0.9) + ")";
      card.style.pointerEvents = dist <= 1 ? "auto" : "none";
      card.style.zIndex = String(10 - dist);
      card.classList.toggle("is-active", dist === 0);
    });
  }

  function setActive(i) {
    active = Math.max(0, Math.min(cards.length - 1, i));
    layout();
  }

  function enableArc() {
    isArc = true;
    grid.classList.add("is-arc");
    toggle.setAttribute("aria-pressed", "true");
    toggle.setAttribute("aria-label", "切换为平铺展示");
    layout();
  }

  function enableGrid() {
    isArc = false;
    grid.classList.remove("is-arc");
    cards.forEach(function (card) {
      card.style.transform = "";
      card.style.filter = "";
      card.style.zIndex = "";
      card.style.width = "";
      card.style.opacity = "";
      card.style.pointerEvents = "";
      card.classList.remove("is-active");
    });
    grid.style.height = "";
    toggle.setAttribute("aria-pressed", "false");
    toggle.setAttribute("aria-label", "切换为弧形展示");
  }

  var hoverTimer = 0;
  var lockUntil = 0;
  cards.forEach(function (card, i) {
    card.addEventListener("mouseenter", function () {
      if (!isArc || Date.now() < lockUntil) return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(function () {
        if (!isArc || active === i) return;
        setActive(i);
        lockUntil = Date.now() + 1400;
      }, 650);
    });
    card.addEventListener("mouseleave", function () { clearTimeout(hoverTimer); });
    card.addEventListener("focus", function () { if (isArc) setActive(i); });
  });

  toggle.addEventListener("click", function () {
    if (mq.matches) return;
    if (isArc) enableGrid(); else enableArc();
  });

  if (mq.matches) enableGrid(); else enableArc();

  window.addEventListener("resize", function () {
    if (mq.matches) { if (isArc) enableGrid(); }
    else if (isArc) layout();
  });
})();