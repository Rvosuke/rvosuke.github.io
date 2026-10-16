(function () {
  "use strict";
  var canvas = document.getElementById("orbit-canvas");
  if (!canvas || !canvas.getContext) return;
  var ctx;
  try { ctx = canvas.getContext("2d", { alpha: true }); } catch (error) { return; }
  if (!ctx) return;

  var motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = motionPreference.matches;
  var finePointer = window.matchMedia("(pointer:fine)").matches;
  var state = {
    width: 1, height: 1, dpr: 1, time: 0, chapter: 0,
    pointerX: 0, pointerY: 0, targetX: 0, targetY: 0,
    running: !document.hidden, frame: 0, lastFrame: 0,
    previousChapter: 0, transitionStart: -2000
  };
  var pointCount = window.innerWidth < 760 ? 220 : window.innerWidth < 1100 ? 420 : 680;
  var points = [];
  var comet = document.createElement("div");
  comet.className = "chapter-comet";
  comet.setAttribute("aria-hidden", "true");
  document.body.appendChild(comet);
  comet.addEventListener("animationend", function () { comet.classList.remove("is-crossing"); });

  function ease(value) { return value * value * (3 - 2 * value); }
  function transitionProgress(now) {
    return reduced ? 1 : Math.max(0, Math.min(1, (now - state.transitionStart) / 1350));
  }

  function seeded(index) {
    var value = Math.sin(index * 127.1 + 311.7) * 43758.5453123;
    return value - Math.floor(value);
  }

  function createPoints() {
    points = [];
    var golden = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < pointCount; i += 1) {
      var y = 1 - (i / Math.max(1, pointCount - 1)) * 2;
      var radius = Math.sqrt(Math.max(0, 1 - y * y));
      var theta = golden * i;
      points.push({
        x: Math.cos(theta) * radius,
        y: y,
        z: Math.sin(theta) * radius,
        phase: seeded(i) * Math.PI * 2,
        size: 0.45 + seeded(i + 91) * 1.2,
        group: i % 3,
        jitterX: seeded(i + 317) * 2 - 1,
        jitterY: seeded(i + 521) * 2 - 1,
        jitterZ: seeded(i + 719) * 2 - 1,
        from: null
      });
    }
  }

  function resize() {
    var desiredCount = window.innerWidth < 760 ? 220 : window.innerWidth < 1100 ? 420 : 680;
    if (desiredCount !== pointCount) { pointCount = desiredCount; createPoints(); }
    state.width = Math.max(1, window.innerWidth);
    state.height = Math.max(1, window.innerHeight);
    state.dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.25 : 1.75);
    canvas.width = Math.round(state.width * state.dpr);
    canvas.height = Math.round(state.height * state.dpr);
    canvas.style.width = state.width + "px";
    canvas.style.height = state.height + "px";
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    draw();
  }

  function rotate(point, yaw, pitch) {
    var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    var x1 = point.x * cy - point.z * sy;
    var z1 = point.x * sy + point.z * cy;
    return { x: x1, y: point.y * cp - z1 * sp, z: point.y * sp + z1 * cp };
  }

  function scenePoint(point, chapter, time) {
    var p = { x: point.x, y: point.y, z: point.z };
    if (chapter === 1) {
      var latitude = Math.atan2(p.y, Math.sqrt(p.x * p.x + p.z * p.z));
      p.x *= 1.08 + 0.24 * Math.cos(latitude * 4);
      p.z *= 0.56;
      p.y *= 1.18;
    } else if (chapter === 2) {
      var side = point.group === 0 ? -1 : 1;
      p.x = p.x * 0.57 + side * 0.72;
      p.y *= 0.73;
      p.z = p.z * 0.48 + Math.sin(point.phase + time * 0.15) * 0.05;
    } else if (chapter === 3) {
      var t = (point.phase / (Math.PI * 2)) * 2 - 1;
      p.x = t * 1.55;
      p.y = Math.sin(t * 4.7 + point.group) * 0.36 + (point.group - 1) * 0.19;
      p.z = Math.cos(t * 3.1 + point.phase) * 0.32;
    } else if (chapter === 4) {
      var ring = point.phase;
      var band = (point.group - 1) * 0.22;
      p.x = Math.cos(ring) * (1.08 + band);
      p.y = Math.sin(ring) * (0.42 + Math.abs(band));
      p.z = Math.sin(ring * 2 + point.group) * 0.28;
    }
    return p;
  }

  function drawOrbit(cx, cy, rx, ry, rotation, alpha) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(109,231,242," + alpha + ")";
    ctx.lineWidth = 0.7;
    ctx.stroke();
    ctx.restore();
  }

  function formedPoint(point, time, progress) {
    var target = scenePoint(point, state.chapter, time);
    if (progress >= 1 || !point.from) return target;
    var weight = ease(progress);
    var spread = Math.sin(Math.PI * progress) * 0.2;
    return {
      x: point.from.x + (target.x - point.from.x) * weight + point.jitterX * spread,
      y: point.from.y + (target.y - point.from.y) * weight + point.jitterY * spread,
      z: point.from.z + (target.z - point.from.z) * weight + point.jitterZ * spread
    };
  }

  function draw() {
    var w = state.width, h = state.height;
    ctx.clearRect(0, 0, w, h);
    var mobile = w < 760;
    var progress = transitionProgress(performance.now());
    var chapterMix = state.previousChapter + (state.chapter - state.previousChapter) * ease(progress);
    var softness = Math.sin(Math.PI * progress);
    var cx = mobile ? w * 0.72 : w * 0.73;
    var heroY = Math.max(660, h * 0.79);
    var previousY = state.previousChapter === 0 ? heroY : h * 0.5;
    var nextY = state.chapter === 0 ? heroY : h * 0.5;
    var cy = mobile ? previousY + (nextY - previousY) * ease(progress) : h * 0.49;
    var scale = Math.min(w, h) * (mobile ? 0.42 : 0.34);
    var time = reduced ? 0.8 : state.time;
    state.pointerX += (state.targetX - state.pointerX) * 0.055;
    state.pointerY += (state.targetY - state.pointerY) * 0.055;
    var yaw = time * 0.055 + state.pointerX * 0.24;
    var pitch = -0.15 + state.pointerY * 0.14;

    drawOrbit(cx, cy, scale * 1.12, scale * 0.34, -0.42 + chapterMix * 0.06, 0.16);
    drawOrbit(cx, cy, scale * 0.94, scale * 0.2, 0.62 - chapterMix * 0.04, 0.12);
    drawOrbit(cx, cy, scale * 0.68, scale * 0.12, 1.04, 0.08);

    var projected = points.map(function (point) {
      var formed = formedPoint(point, time, progress);
      var rotated = rotate(formed, yaw, pitch);
      var depth = 3.5 + rotated.z;
      var perspective = 3.35 / depth;
      return {
        x: cx + rotated.x * scale * perspective,
        y: cy + rotated.y * scale * perspective,
        z: rotated.z,
        alpha: Math.max(0.08, Math.min(0.92, 0.28 + (rotated.z + 1.2) * 0.26)),
        size: point.size * perspective,
        group: point.group
      };
    }).sort(function (a, b) { return a.z - b.z; });

    projected.forEach(function (point, index) {
      if (index % 3 === 0) {
        for (var next = index + 1; next < Math.min(index + 7, projected.length); next += 1) {
          var neighbor = projected[next];
          var distance = Math.hypot(point.x - neighbor.x, point.y - neighbor.y);
          if (distance > 12 && distance < (mobile ? 30 : 52)) {
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(neighbor.x, neighbor.y);
            ctx.strokeStyle = "rgba(109,231,242,0.08)";
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      var tint = point.group === 0 ? "109,231,242" : point.group === 1 ? "93,159,255" : "237,246,248";
      if (softness > 0.02) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, Math.max(1, point.size) * (1 + softness * 3), 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + tint + "," + (point.alpha * softness * 0.12) + ")";
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(point.x, point.y, Math.max(0.45, point.size), 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + tint + "," + point.alpha + ")";
      ctx.fill();
    });

    var glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.55);
    glow.addColorStop(0, "rgba(109,231,242,0.055)");
    glow.addColorStop(1, "rgba(109,231,242,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, scale * 0.55, 0, Math.PI * 2);
    ctx.fill();

    if (!document.documentElement.classList.contains("canvas-ready")) {
      document.documentElement.classList.add("canvas-ready");
      canvas.dataset.rendered = "true";
    }
  }

  function frame(now) {
    if (!state.running) return;
    if (now - state.lastFrame >= 1000 / 30) {
      state.time = now * 0.001;
      state.lastFrame = now;
      draw();
    }
    state.frame = window.requestAnimationFrame(frame);
  }

  function start() {
    if (reduced || state.frame) { draw(); return; }
    state.running = true;
    state.frame = window.requestAnimationFrame(frame);
  }

  function stop() {
    state.running = false;
    if (state.frame) window.cancelAnimationFrame(state.frame);
    state.frame = 0;
    comet.classList.remove("is-crossing");
  }

  createPoints();
  resize();
  if (finePointer) {
    window.addEventListener("pointermove", function (event) {
      state.targetX = (event.clientX / Math.max(1, state.width) - 0.5) * 2;
      state.targetY = (event.clientY / Math.max(1, state.height) - 0.5) * 2;
    }, { passive: true });
  }
  window.addEventListener("orbit:chapter", function (event) {
    var next = Math.max(0, Math.min(4, Number(event.detail.chapter) || 0));
    if (next === state.chapter) return;
    var now = performance.now();
    var progress = transitionProgress(now);
    points.forEach(function (point) { point.from = formedPoint(point, state.time, progress); });
    var movingDown = next > state.chapter;
    state.previousChapter = state.chapter;
    state.chapter = next;
    state.transitionStart = now;
    if (!reduced && !document.hidden && movingDown && window.scrollY > 0) {
      comet.classList.remove("is-crossing");
      void comet.offsetWidth;
      comet.classList.add("is-crossing");
    }
    if (reduced) draw();
  });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });
  motionPreference.addEventListener("change", function (event) {
    reduced = event.matches;
    stop();
    if (reduced) draw();
    else if (!document.hidden) start();
  });
  start();
}());
