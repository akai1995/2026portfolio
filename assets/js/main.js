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
          '<li class="contact-modal__row"><span>邮箱</span><b><a href="mailto:1471519969@qq.com">1471519969@qq.com</a></b></li>' +
          '<li class="contact-modal__row"><span>电话</span><b><a href="tel:18213064387">182 1306 4387</a></b></li>' +
          '<li class="contact-modal__row"><span>微信</span><b>nfmeiliyou</b></li>' +
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

/* ---------- hero banner: boot sequence + interactive circuit field ---------- */
(function () {
  var hero = document.getElementById("heroStage");
  var title = document.querySelector(".hero__title--display");
  var canvas = document.getElementById("heroCanvas");
  if (!hero || !title) return;

  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(pointer: fine)");
  var reduced = motionQuery.matches;
  var lines = title.querySelectorAll(".line");
  var lineLabels = [];
  var charIndex = 0;

  lines.forEach(function (line) {
    var target = line.querySelector("span");
    if (!target) return;

    var text = target.textContent;
    lineLabels.push(text.replace(/\s+/g, " ").trim());
    target.textContent = "";

    text.split("").forEach(function (char) {
      var span = document.createElement("span");
      span.className = "hero-char";
      span.textContent = char;
      span.setAttribute("data-char", char);
      span.style.setProperty("--char-delay", charIndex * 34 + "ms");
      target.appendChild(span);
      charIndex += 1;
    });

    line.setAttribute("aria-hidden", "true");
  });

  if (!charIndex) return;
  title.setAttribute("aria-label", lineLabels.join(" "));
  title.classList.add("has-boot");

  if (!canvas) return;
  var ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  var width = 0;
  var height = 0;
  var dpr = 1;
  var nodes = [];
  var links = [];
  var pulses = [];
  var pointer = { x: 0.5, y: 0.46, tx: 0.5, ty: 0.46 };
  var isVisible = true;
  var raf = null;
  var lastFrame = 0;

  function density() {
    if (width < 640) return 28;
    if (width < 1100) return 42;
    return 64;
  }

  function buildNodes() {
    nodes = [];
    links = [];
    pulses = [];

    var count = density();
    for (var i = 0; i < count; i += 1) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.13,
        vy: (Math.random() - 0.5) * 0.11,
        size: 0.75 + Math.random() * 1.45,
        phase: Math.random() * Math.PI * 2
      });
    }

    for (var n = 0; n < nodes.length; n += 1) {
      var nearest = [];
      for (var m = 0; m < nodes.length; m += 1) {
        if (n === m) continue;
        var dx = nodes[n].x - nodes[m].x;
        var dy = nodes[n].y - nodes[m].y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 176) nearest.push({ index: m, distance: distance });
      }

      nearest.sort(function (a, b) { return a.distance - b.distance; });
      nearest.slice(0, 2).forEach(function (item) {
        if (n < item.index) links.push([n, item.index]);
      });
    }

    for (var p = 0; p < 7; p += 1) {
      pulses.push({
        link: Math.floor(Math.random() * Math.max(1, links.length)),
        offset: Math.random(),
        speed: 0.000075 + Math.random() * 0.000075,
        reverse: Math.random() > 0.5
      });
    }
  }

  function resize() {
    var rect = hero.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildNodes();
    draw(performance.now(), true);
  }

  function draw(time, staticFrame) {
    ctx.clearRect(0, 0, width, height);
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;

    var pointerX = pointer.x * width;
    var pointerY = pointer.y * height;
    var pointerGlow = ctx.createRadialGradient(pointerX, pointerY, 0, pointerX, pointerY, Math.min(width, height) * 0.42);
    pointerGlow.addColorStop(0, "rgba(83,196,255,.105)");
    pointerGlow.addColorStop(0.34, "rgba(58,120,255,.035)");
    pointerGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = pointerGlow;
    ctx.fillRect(0, 0, width, height);

    if (!staticFrame) {
      var dt = lastFrame ? Math.min(32, time - lastFrame) : 16;
      nodes.forEach(function (node) {
        node.x += node.vx * dt * 0.06;
        node.y += node.vy * dt * 0.06;

        var dx = node.x - pointerX;
        var dy = node.y - pointerY;
        var pull = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 240);
        node.x += (dx / Math.max(1, Math.sqrt(dx * dx + dy * dy))) * pull * 0.035;
        node.y += (dy / Math.max(1, Math.sqrt(dx * dx + dy * dy))) * pull * 0.035;

        if (node.x < -20) node.x = width + 20;
        if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        if (node.y > height + 20) node.y = -20;
      });
      lastFrame = time;
    }

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    links.forEach(function (link, linkIndex) {
      var a = nodes[link[0]];
      var b = nodes[link[1]];
      if (!a || !b) return;
      var distance = Math.hypot(a.x - b.x, a.y - b.y);
      var alpha = Math.max(0, 1 - distance / 210) * 0.16;
      var focusX = (a.x + b.x) * 0.5;
      var focusY = (a.y + b.y) * 0.5;
      var focus = Math.max(0, 1 - Math.hypot(focusX - pointerX, focusY - pointerY) / 300);
      alpha += focus * 0.12;

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = "rgba(86,173,255," + alpha.toFixed(3) + ")";
      ctx.lineWidth = 0.65;
      ctx.stroke();

      if (linkIndex % 11 === 0) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = "rgba(137,229,255,.025)";
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
    });

    pulses.forEach(function (pulse) {
      if (!links.length || staticFrame) return;
      var link = links[pulse.link % links.length];
      var a = nodes[link[0]];
      var b = nodes[link[1]];
      if (!a || !b) return;
      var progress = (time * pulse.speed + pulse.offset) % 1;
      if (pulse.reverse) progress = 1 - progress;
      var x = a.x + (b.x - a.x) * progress;
      var y = a.y + (b.y - a.y) * progress;
      var trail = ctx.createRadialGradient(x, y, 0, x, y, 12);
      trail.addColorStop(0, "rgba(205,249,255,.88)");
      trail.addColorStop(0.18, "rgba(84,211,255,.66)");
      trail.addColorStop(1, "rgba(47,125,255,0)");
      ctx.fillStyle = trail;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
    });

    nodes.forEach(function (node) {
      var wave = staticFrame ? 1 : 0.66 + Math.sin(time * 0.0019 + node.phase) * 0.34;
      var glow = Math.max(0, 1 - Math.hypot(node.x - pointerX, node.y - pointerY) / 300);
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size + glow * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(165,225,255," + (0.34 * wave + glow * 0.32).toFixed(3) + ")";
      ctx.fill();

      if (glow > 0.18) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8 + glow * 7, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(93,191,255," + (glow * 0.16).toFixed(3) + ")";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  function frame(time) {
    raf = null;
    if (!isVisible || document.hidden) return;
    draw(time, false);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (reduced || raf || !isVisible || document.hidden) return;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  resize();

  hero.addEventListener("pointermove", function (event) {
    if (!finePointer.matches) return;
    var rect = hero.getBoundingClientRect();
    var mx = (event.clientX - rect.left) / rect.width;
    var my = (event.clientY - rect.top) / rect.height;
    pointer.tx = Math.max(0, Math.min(1, mx));
    pointer.ty = Math.max(0, Math.min(1, my));
    hero.style.setProperty("--mx", (pointer.tx * 100).toFixed(2) + "%");
    hero.style.setProperty("--my", (pointer.ty * 100).toFixed(2) + "%");
    var spot = hero.querySelector(".hero__spot");
    if (spot) spot.classList.add("is-on");
    start();
  }, { passive: true });

  hero.addEventListener("pointerleave", function () {
    pointer.tx = 0.5;
    pointer.ty = 0.46;
    var spot = hero.querySelector(".hero__spot");
    if (spot) spot.classList.remove("is-on");
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      isVisible = entries[0] ? entries[0].isIntersecting : true;
      if (isVisible) start();
      else stop();
    }, { threshold: 0.02 }).observe(hero);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else start();
  });

  var resizeTimer = 0;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 120);
  });

  if (motionQuery.addEventListener) {
    motionQuery.addEventListener("change", function (event) {
      reduced = event.matches;
      if (reduced) {
        stop();
        draw(performance.now(), true);
      } else {
        start();
      }
    });
  }

  if (!reduced) start();
})();
