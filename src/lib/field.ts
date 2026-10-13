// @ts-nocheck — ported verbatim from ~/Desktop/Namu/lab-web-mastery/studies/listening-field.js (tested there).
// Client-only: call these from useEffect. TODO: add types.
const global: any = typeof window !== "undefined" ? window : {};

/* Listening Field — a spectrogram drawn as Sahel ridgelines.
 *
 * x is time (speech flows in from the right), each line is one frequency band.
 * Low bands sit in front and carry the big dunes; high bands recede into haze.
 * One line, the pitch track, is drawn in Sahel: in a tonal language the
 * contour of the voice is meaning, so it is the one thing in colour.
 *
 * The speech here is procedural (syllables, formants, fricatives, tone steps)
 * so the study needs no recordings. On the real site the same renderer takes
 * frames from a consented Hausa recording or a live AnalyserNode.
 */

  const TAU = Math.PI * 2;

  // Small seeded PRNG so every visit draws the same "sentence".
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Mel scale band centres between lo and hi Hz.
  function melBands(n, lo, hi) {
    const mel = f => 2595 * Math.log10(1 + f / 700);
    const inv = m => 700 * (Math.pow(10, m / 2595) - 1);
    const a = mel(lo), b = mel(hi), out = [];
    for (let i = 0; i < n; i++) out.push(inv(a + (b - a) * (i / (n - 1))));
    return out;
  }

  /* Build a looping "utterance": frames x bands energy in [0,1], plus a pitch
   * track (Hz, 0 when unvoiced). 20 ms frames. */
  /* Source-filter speech: a glottal source (harmonics of F0 with a −12 dB/oct
   * tilt) shaped by a vocal-tract filter (three formants that glide between
   * vowels), plus frication noise and plosive bursts. Crude, but it has the
   * texture of real speech: harmonic striations low down, smeared energy up
   * high, syllables of uneven length, tone steps, pauses that breathe. */
  function synthesise({ seconds = 24, bands = 34, seed = 7 } = {}) {
    const rnd = mulberry32(seed);
    const frameMs = 20, n = Math.round((seconds * 1000) / frameMs);
    const centres = melBands(bands, 90, 7600);
    const widths = centres.map((c, i) => (i ? c - centres[i - 1] : centres[1] - c) * 0.9 + 25);
    const E = Array.from({ length: n }, () => new Float32Array(bands));
    const F0 = new Float32Array(n);
    const vowels = [ // F1, F2, F3 for a, e, i, o, u (adult, rough)
      [760, 1320, 2500], [470, 1980, 2650], [310, 2300, 3000], [500, 900, 2450], [340, 860, 2300],
    ];
    const formantEnv = (f, F) =>
      1.0 * Math.exp(-Math.pow((f - F[0]) / 130, 2)) +
      0.62 * Math.exp(-Math.pow((f - F[1]) / 190, 2)) +
      0.32 * Math.exp(-Math.pow((f - F[2]) / 260, 2)) +
      0.08;
    let prevV = vowels[0];
    let t = 4;
    while (t < n - 60) {
      const syllables = 4 + Math.floor(rnd() * 10);
      const register = 105 + rnd() * 80;
      const loud = 0.75 + rnd() * 0.25;
      for (let s = 0; s < syllables && t < n - 40; s++) {
        const decl = 1 - 0.22 * (s / syllables);
        const tone = rnd() < 0.5 ? 1.18 : 0.88;            // H or L
        const falling = rnd() < 0.15;                       // an occasional fall
        const fric = rnd() < 0.34, plos = !fric && rnd() < 0.42;
        const onset = fric ? 3 + Math.floor(rnd() * 4) : plos ? 2 : 0;
        const nucleus = 4 + Math.floor(rnd() * 6) + (rnd() < 0.25 ? 5 : 0); // long vowels
        const V = vowels[Math.floor(rnd() * vowels.length)];
        const fricCentre = 3600 + rnd() * 3200;
        for (let k = 0; k < onset && t + k < n; k++) {
          const row = E[t + k];
          for (let b = 0; b < bands; b++) {
            const f = centres[b];
            if (fric) row[b] += 0.42 * loud * Math.exp(-Math.pow((f - fricCentre) / 1500, 2)) * (0.55 + 0.45 * rnd());
            else if (k === 0) row[b] += 0.3 * loud * (0.5 + 0.5 * rnd()) * Math.exp(-f / 5000);
          }
        }
        t += onset;
        for (let k = 0; k < nucleus && t + k < n; k++) {
          const u = (k + 0.5) / nucleus;
          const env = Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.15)), 0.7) * loud;
          const F = [0, 1, 2].map(i => prevV[i] + (V[i] - prevV[i]) * Math.min(1, u * 2.2)); // coarticulation
          const f0 = register * decl * (falling ? tone * (1.1 - 0.25 * u) : tone) * (1 + 0.012 * (rnd() - 0.5));
          F0[t + k] = f0;
          const row = E[t + k];
          for (let b = 0; b < bands; b++) {
            const f = centres[b], w = widths[b];
            let src = 0;
            for (let h = 1; h <= 28; h++) {
              const fh = h * f0;
              if (fh > f + 2 * w) break;
              if (fh < f - 2 * w) continue;
              src += Math.exp(-Math.pow((f - fh) / (w * 0.55), 2)) / Math.pow(h, 0.9);
            }
            row[b] += env * src * formantEnv(f, F) * (0.9 + 0.1 * rnd());
          }
        }
        prevV = V;
        t += nucleus + (rnd() < 0.18 ? 1 + Math.floor(rnd() * 3) : 0);
      }
      t += 10 + Math.floor(rnd() * 28);
    }
    // Normalise per band so the high bands still read, compress, add a floor.
    for (let b = 0; b < bands; b++) {
      let max = 1e-6;
      for (let i = 0; i < n; i++) max = Math.max(max, E[i][b]);
      const tilt = 0.55 + 0.45 * (1 - b / (bands - 1));       // keep a natural tilt
      const col = new Float32Array(n);
      for (let i = 0; i < n; i++) col[i] = E[i][b] / max;
      // Forward-backward smoothing: soft attacks and releases, no glitch spikes.
      for (let pass = 0; pass < 1; pass++) {
        let prev = col[0];
        for (let i = 0; i < n; i++) { prev = 0.62 * col[i] + 0.38 * prev; col[i] = prev; }
        prev = col[n - 1];
        for (let i = n - 1; i >= 0; i--) { prev = 0.62 * col[i] + 0.38 * prev; col[i] = prev; }
      }
      for (let i = 0; i < n; i++) {
        E[i][b] = Math.min(1, tilt * Math.log1p(14 * col[i]) / Math.log(15)) + 0.014 * rnd();
      }
    }
    return { E, F0, frames: n, bands, centres };
  }

  /* The Contour: each row is a different utterance's pitch melody. Silence is
   * flat ground; voiced stretches rise by the speaker's pitch (semitones above
   * their own floor), so a stack of sentences reads as a stack of dunes. */
  function synthesiseContours({ seconds = 24, bands = 30, seed = 7 } = {}) {
    const frameMs = 20, n = Math.round((seconds * 1000) / frameMs);
    const E = Array.from({ length: n }, () => new Float32Array(bands));
    let F0front = null;
    for (let r = 0; r < bands; r++) {
      const rnd = mulberry32(seed * 7919 + r * 104729);
      const f0 = new Float32Array(n), env = new Float32Array(n);
      let t = Math.floor(rnd() * 40);
      while (t < n - 30) {
        const syllables = 4 + Math.floor(rnd() * 9);
        const register = 100 + rnd() * 90;
        const start = t;
        let held = register;
        for (let s = 0; s < syllables && t < n - 20; s++) {
          const decl = 1 - 0.2 * (s / syllables);
          const tone = rnd() < 0.5 ? 1.2 : 0.86;            // H or L
          const falling = rnd() < 0.18;
          // A voiceless consonant: pitch is held, the ridge dips a little.
          const gap = rnd() < 0.35 ? 2 + Math.floor(rnd() * 2) : 0;
          for (let k = 0; k < gap && t + k < n; k++) { f0[t + k] = held; env[t + k] = 0.72; }
          t += gap;
          const len = 4 + Math.floor(rnd() * 6) + (rnd() < 0.25 ? 5 : 0);
          for (let k = 0; k < len && t + k < n; k++) {
            const u = (k + 0.5) / len;
            held = register * decl * (falling ? tone * (1.12 - 0.3 * u) : tone);
            f0[t + k] = held; env[t + k] = 1;
          }
          t += len;
        }
        // Phrase edges ease in and out; inside, the melody carries.
        const ramp = 4;
        for (let k = 0; k < ramp; k++) {
          const a = (k + 1) / (ramp + 1);
          if (start + k < n) env[start + k] *= a;
          if (t - 1 - k >= 0) env[t - 1 - k] *= a;
        }
        t += 12 + Math.floor(rnd() * 30);
      }
      // Height = semitones above this speaker's floor, scaled into 0..1 by a 14-st range.
      let lo = Infinity;
      for (let i = 0; i < n; i++) if (f0[i]) lo = Math.min(lo, f0[i]);
      let prev = 0;
      for (let i = 0; i < n; i++) {
        const st = f0[i] ? 12 * Math.log2(f0[i] / lo) : 0;
        const target = env[i] * (0.28 + 0.72 * Math.min(1, st / 14));
        prev = prev + (target - prev) * 0.45;                // glide, not steps
        E[i][r] = prev;
      }
      if (r === 0) F0front = f0;
    }
    return { E, F0: F0front, frames: n, bands, centres: [] };
  }

  function readTokens(el) {
    const s = getComputedStyle(el);
    const v = name => s.getPropertyValue(name).trim();
    return {
      ground: v("--field-ground") || "#FFFAF1",
      line: v("--field-line") || "#6B3E1E",
      haze: v("--field-haze") || "#F7F0E3",
      accent: v("--field-accent") || "#E8935A",
    };
  }

  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const mix = (a, b, t) => a.map((x, i) => Math.round(x + (b[i] - x) * t));
  const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;

  function createListeningField(canvas, opts = {}) {
    const o = Object.assign({
      seconds: 24, bands: 30, seed: 7,
      pxPerFrame: 3.2,      // horizontal resolution of time
      speed: 0.14,          // frames advanced per animation frame (slow, calm)
      relief: 0.78,          // share of line spacing a full-energy peak may rise, front line
      pitch: true,
      attention: true,      // pointer clears the haze locally
      now: 0.8,             // x of the listening point, as a share of width
      trail: 0.24,          // length of the tone contour behind the dot
      dot: 4.5,             // radius of the Sahel dot, px
      fieldTop: 0.3,        // where the back row of the field sits, share of height
      perspective: 0.14,    // how much narrower the back row is than the front
      ampBase: 2.2,         // relief of the back row, in row spacings
      ampDepth: 7.5,        // extra relief gained toward the front row
      autoplay: true,       // flow on load; false = rest still until play() (WCAG 2.2.2)
    }, opts);
    const data = o.mode === "contour" ? synthesiseContours(o) : synthesise(o);
    const ctx = canvas.getContext("2d");
    const reduce = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, dpr = 1, head = 0, raf = 0, visible = true, running = false;
    let pointer = { x: -1e4, y: -1e4, a: 0, target: 0 };
    let tokens = readTokens(canvas);
    let override = null;              // palette set from script (e.g. a day → dusk transition)
    let reliefScale = 1;              // 0 → 1 during rise()

    function resize() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(global.devicePixelRatio || 1, 2);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      tokens = override || readTokens(canvas);
      if (!running) draw();
    }

    function sample(frame, band) {
      const n = data.frames;
      const i = ((Math.floor(frame) % n) + n) % n, j = (i + 1) % n, f = frame - Math.floor(frame);
      return data.E[i][band] * (1 - f) + data.E[j][band] * f;
    }
    function pitchAt(frame) {
      const n = data.frames;
      const i = ((Math.floor(frame) % n) + n) % n, j = (i + 1) % n, f = frame - Math.floor(frame);
      const a = data.F0[i], b = data.F0[j];
      if (!a || !b) return 0;
      return a * (1 - f) + b * f;
    }

    function draw() {
      const g = hexToRgb(tokens.ground), l = hexToRgb(tokens.line), hz = hexToRgb(tokens.haze);
      ctx.fillStyle = rgb(g); ctx.fillRect(0, 0, W, H);

      const B = data.bands;
      const top = H * o.fieldTop, bottom = H * 0.97;
      const cols = Math.ceil(W / o.pxPerFrame) + 2;
      const step = W / (cols - 2);
      const nowX = W * o.now;
      // The field is born at the listening point and fades out at the left.
      const fade = x => Math.max(0, Math.min(1, x / (W * 0.1), (nowX + W * 0.035 - x) / (W * 0.05)));
      // Perspective: rows bunch together toward the back (top).
      const rowY = k => top + (bottom - top) * Math.pow(k / (B - 1), 1.35);

      const cx = W * 0.5;
      const lensW = W * 0.07;
      const ys = new Float32Array(cols);
      const xs = new Float32Array(cols);
      for (let k = 0; k < B; k++) {           // k = 0 is the back row
        const band = B - 1 - k;               // back rows are high bands
        const depth = k / (B - 1);            // 0 back … 1 front
        const y0 = rowY(k);
        const spacing = k === 0 ? rowY(1) - rowY(0) : y0 - rowY(k - 1);
        const amp = spacing * (o.ampBase + o.ampDepth * depth) * o.relief * reliefScale;
        const squeeze = 1 - o.perspective * (1 - depth); // back rows narrower: land receding
        for (let c = 0; c < cols; c++) {
          const x = c * step;
          // Attention: near the pointer the land lifts a little, as if listened to closely.
          const lens = o.attention ? 1 + 0.45 * pointer.a * Math.exp(-Math.pow((x - pointer.x) / lensW, 2)) : 1;
          const e = sample(head + c, band) * fade(x) * lens; // oldest at left, newest at right
          xs[c] = cx + (x - cx) * squeeze;
          ys[c] = y0 - e * amp;
        }
        // Occlude the rows behind with a ground-coloured fill (never stroked).
        ctx.beginPath();
        ctx.moveTo(xs[0], ys[0]);
        for (let c = 1; c < cols; c++) ctx.lineTo(xs[c], ys[c]);
        ctx.lineTo(xs[cols - 1], H); ctx.lineTo(xs[0], H); ctx.closePath();
        ctx.fillStyle = rgb(g); ctx.fill();
        // The ridge itself: haze toward the back, faded at both ends so the
        // field floats on the page instead of sitting in a box.
        const ink = mix(hz, l, 0.16 + 0.84 * Math.pow(depth, 1.3));
        const x0 = xs[0], x1 = cx + (nowX + W * 0.09 - cx) * squeeze;
        const grad = ctx.createLinearGradient(x0, 0, x1, 0);
        const span = Math.max(1, x1 - x0);
        grad.addColorStop(0, `rgba(${ink[0]},${ink[1]},${ink[2]},0)`);
        grad.addColorStop(Math.min(0.99, (W * 0.12) / span), rgb(ink));
        grad.addColorStop(Math.min(0.995, (cx + (nowX - cx) * squeeze - x0) / span), rgb(ink));
        grad.addColorStop(1, `rgba(${ink[0]},${ink[1]},${ink[2]},0)`);
        ctx.beginPath();
        ctx.moveTo(xs[0], ys[0]);
        for (let c = 1; c < cols; c++) ctx.lineTo(xs[c], ys[c]);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.55 + 0.75 * depth;
        ctx.lineJoin = "round";
        ctx.stroke();
      }

      // The listening point: one Sahel dot riding the pitch of the voice, with
      // the tone contour trailing behind it. Unvoiced frames hold the last
      // pitch, so the dot rests rather than drops.
      if (o.pitch) {
        const acc = hexToRgb(tokens.accent);
        const yTop = H * (o.fieldTop - 0.16), yBot = H * (o.fieldTop - 0.025);
        const py = p => yBot - (yBot - yTop) * Math.min(1, Math.max(0, (p - 85) / 200));
        const nowCol = Math.round(nowX / step);
        const trailCols = Math.round((W * o.trail) / step);
        // Hold the last voiced pitch through silences, then ease it so the
        // contour reads as a drawn line, not a chart.
        let held = 0;
        for (let c = nowCol - trailCols - 80; c < nowCol - trailCols; c++) held = pitchAt(head + c) || held;
        const pts = [];
        let ease = held ? py(held) : yBot;
        for (let c = nowCol - trailCols; c <= nowCol; c++) {
          const p = pitchAt(head + c);
          if (p) held = p;
          const target = held ? py(held) : yBot;
          ease += (target - ease) * 0.35;
          pts.push([c * step, ease]);
        }
        const grad = ctx.createLinearGradient(pts[0][0], 0, nowX, 0);
        grad.addColorStop(0, `rgba(${acc[0]},${acc[1]},${acc[2]},0)`);
        grad.addColorStop(1, `rgba(${acc[0]},${acc[1]},${acc[2]},0.95)`);
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.strokeStyle = grad; ctx.lineWidth = 1.2; ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.stroke();
        const target = pts[pts.length - 1][1];
        dotY = dotY == null ? target : dotY + (target - dotY) * 0.18;
        ctx.beginPath(); ctx.arc(nowX, dotY, o.dot, 0, TAU);
        ctx.fillStyle = rgb(acc); ctx.fill();
      }
    }
    let dotY = null;

    function tick() {
      pointer.a += (pointer.target - pointer.a) * 0.06;
      head += o.speed;
      draw();
      raf = running ? requestAnimationFrame(tick) : 0;
    }
    let wanted = o.autoplay;
    function start() { if (reduce || running || !visible || !wanted) return; running = true; raf = requestAnimationFrame(tick); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

    const ro = new ResizeObserver(resize); ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); });
    io.observe(canvas);
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    canvas.addEventListener("pointermove", e => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.target = 1;
    });
    canvas.addEventListener("pointerleave", () => { pointer.target = 0; });
    const mq = global.matchMedia && global.matchMedia("(prefers-color-scheme: dark)");
    mq && mq.addEventListener && mq.addEventListener("change", () => { tokens = override || readTokens(canvas); draw(); });

    // Rise once: the land grows out of the ground over `ms`, then rests.
    function rise(ms = 1600) {
      if (reduce) { reliefScale = 1; draw(); return; }
      const t0 = performance.now();
      const ease = u => 1 - Math.pow(1 - u, 3);
      const step = now => {
        const u = Math.min(1, (now - t0) / ms);
        reliefScale = ease(u);
        if (!running) draw();
        if (u < 1) requestAnimationFrame(step);
      };
      reliefScale = 0; requestAnimationFrame(step);
    }

    resize(); draw(); start();
    return {
      play() { wanted = true; start(); },
      pause() { wanted = false; stop(); },
      rise,
      setTokens(p) { override = p ? Object.assign({}, readTokens(canvas), p) : null; tokens = override || readTokens(canvas); if (!running) draw(); },
      setSpeed(v) { o.speed = v; },
      redraw: () => { tokens = override || readTokens(canvas); draw(); },
      get running() { return running; }, data,
    };
  }

export { createListeningField, synthesise, synthesiseContours };
