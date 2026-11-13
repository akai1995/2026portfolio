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

/* ---------- hero title: characters deform toward the cursor movement */
(function () {
  var title = document.querySelector(".hero__title--display");
  if (!title || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  var lines = [].slice.call(title.querySelectorAll(".line > span"));
  if (!lines.length) return;
  var grads = [
    "linear-gradient(96deg,#2f6bff 0%,#54d6ff 52%,#eaf4ff 100%)",
    "linear-gradient(96deg,#eef4ff 0%,#c6d9f5 60%,#8fb0d8 100%)"
  ];
  var chars = [];

  lines.forEach(function (line, li) {
    var text = line.textContent;
    line.textContent = "";
    Array.prototype.forEach.call(text, function (c) {
      var el = document.createElement("span");
      el.className = "ch";
      el.textContent = c;
      line.appendChild(el);
      chars.push({ el: el, line: line, li: li, bx: 0, by: 0, w: 0, tx: 0, ty: 0, sk: 0, sc: 1 });
    });
  });

  function reset() {
    chars.forEach(function (c) { c.el.style.transform = ""; });
  }

  function paint() {
    var titleRect = title.getBoundingClientRect();
    lines.forEach(function (line, li) {
      var lr = line.getBoundingClientRect();
      var lLeft = line.offsetLeft;
      var items = line.querySelectorAll(".ch");
      for (var i = 0; i < items.length; i++) {
        items[i].style.backgroundImage = grads[li] || grads[0];
        items[i].style.backgroundSize = lr.width + "px 100%";
        items[i].style.backgroundPosition = -(items[i].offsetLeft - lLeft) + "px 0";
      }
    });
    chars.forEach(function (c) {
      c.bx = titleRect.left + c.el.offsetLeft + c.el.offsetWidth / 2;
      c.by = titleRect.top + c.el.offsetTop + c.el.offsetHeight / 2;
      c.w = c.el.offsetWidth;
    });
  }

  var mx = -9999, my = -9999, vx = 0, vy = 0, px = 0, py = 0, pt = 0;

  title.addEventListener("mousemove", function (e) {
    var now = performance.now();
    if (pt) {
      var dt = Math.max(12, now - pt);
      vx = vx * 0.72 + ((e.clientX - px) / dt) * 1000 * 0.28;
      vy = vy * 0.72 + ((e.clientY - py) / dt) * 1000 * 0.28;
    }
    px = e.clientX; py = e.clientY; pt = now;
    mx = e.clientX; my = e.clientY;
  });

  title.addEventListener("mouseleave", function () {
    mx = my = -9999; vx = vy = 0; pt = 0;
  });

  function frame() {
    vx *= 0.9; vy *= 0.9;
    var skew = Math.max(-14, Math.min(14, -vx * 0.016));
    chars.forEach(function (c) {
      var dx = c.bx - mx, dy = c.by - my;
      var d = Math.sqrt(dx * dx + dy * dy);
      var radius = Math.max(240, c.w * 4 + 150);
      var t = d < radius ? Math.pow(1 - d / radius, 1.5) : 0;
      var tx = 0, ty = 0;
      if (d > 0.01 && t > 0) {
        tx = (dx / d) * 20 * t;
        ty = (dy / d) * 13 * t;
      }
      c.tx += (tx - c.tx) * 0.12;
      c.ty += (ty - c.ty) * 0.12;
      c.sk += (skew * (0.35 + 0.65 * t) - c.sk) * 0.12;
      c.sc += ((1 + 0.05 * t) - c.sc) * 0.12;
      c.el.style.transform = "translate3d(" + c.tx.toFixed(2) + "px," + c.ty.toFixed(2) + "px,0) skewX(" + c.sk.toFixed(2) + "deg) scale(" + c.sc.toFixed(3) + ")";
    });
    requestAnimationFrame(frame);
  }

  function rebuild() {
    reset();
    requestAnimationFrame(paint);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(rebuild);
  } else {
    rebuild();
  }
  window.addEventListener("resize", rebuild);
  requestAnimationFrame(frame);
})();

/* ---------- contact modal ---------- */
(function () {
  var triggers = document.querySelectorAll("[data-contact]");
  if (!triggers.length) return;

  var modal = null;
  var lastFocus = null;

  function build() {
    if (modal) return modal;
    modal = document.createElement("div");
    modal.className = "contact-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "contactTitle");
    modal.innerHTML =
      '<div class="contact-modal__panel">' +
        '<button class="contact-modal__close" type="button" aria-label="关闭">✕</button>' +
        '<h3 class="contact-modal__title" id="contactTitle">联系方式</h3>' +
        '<ul class="contact-modal__list">' +
          '<li class="contact-modal__row"><span>邮箱</span><b><a href="mailto:hello@example.com">hello@example.com</a></b></li>' +
          '<li class="contact-modal__row"><span>电话</span><b><a href="tel:13800000000">138 0000 0000</a></b></li>' +
          '<li class="contact-modal__row"><span>微信</span><b>liuyongzhu</b></li>' +
        '</ul>' +
      '</div>';
    document.body.appendChild(modal);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) close();
    });
    modal.querySelector(".contact-modal__close").addEventListener("click", close);
    return modal;
  }

  function open(trigger) {
    build();
    lastFocus = trigger;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modal.querySelector(".contact-modal__close").focus();
  }

  function close() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  triggers.forEach(function (btn) {
    btn.addEventListener("click", function () { open(btn); });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && modal.classList.contains("is-open")) close();
  });
})();

/* ---------- nav: 关于我 by default, 作品集 once work section is reached ---------- */
(function () {
  var work = document.getElementById("work");
  var links = document.querySelectorAll(".nav__links a");
  if (!work || !links.length) return;

  var workLink = null;
  var aboutLink = null;
  links.forEach(function (a) {
    var href = a.getAttribute("href") || "";
    if (href.indexOf("#work") !== -1) workLink = a;
    else if (href.indexOf("index.html") !== -1) aboutLink = a;
  });
  if (!workLink || !aboutLink) return;

  function update() {
    var top = work.getBoundingClientRect().top + window.scrollY;
    var onWork = window.scrollY + 140 >= top;
    workLink.classList.toggle("is-active", onWork);
    aboutLink.classList.toggle("is-active", !onWork);
  }

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
})();
