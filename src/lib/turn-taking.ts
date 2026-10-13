// @ts-nocheck — ported verbatim from ~/Desktop/Namu/lab-web-mastery/studies/turn-taking.js (tested there).
// Client-only: call these from useEffect. TODO: add types.
const global: any = typeof window !== "undefined" ? window : {};

/* Turn-taking timeline — the signature figure for full-duplex research.
 *
 * Two lanes share one clock: the caller and Aïr. Speech is drawn as bars of
 * energy, overlap is shaded, and the moment Aïr yields is marked. A playhead
 * walks the clock and the transcript beneath follows it.
 *
 * Timings here are illustrative, not measured. On the site the same component
 * takes segment times from an eval run and says where they came from.
 */

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  // Deterministic bar heights for a segment so the figure never flickers.
  function bars(seed, count) {
    let s = seed * 9301 + 49297;
    const out = [];
    for (let i = 0; i < count; i++) {
      s = (s * 9301 + 49297) % 233280;
      const r = s / 233280;
      const env = Math.sin(Math.PI * ((i + 0.5) / count)) ** 0.5;
      out.push(0.18 + 0.82 * env * (0.35 + 0.65 * r));
    }
    return out;
  }

  function createTurnTaking(root, spec) {
    const { duration, lanes, segments, events = [], caption } = spec;
    const reduce = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.add("tt");
    root.innerHTML = "";

    const head = el("div", "tt-head");
    const play = el("button", "tt-play");
    play.type = "button";
    play.setAttribute("aria-label", "Play the exchange");
    play.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="i-play" d="M8 5.5v13l10-6.5z"/><g class="i-pause"><path d="M8.5 5.5v13M15.5 5.5v13"/></g></svg>';
    const clock = el("span", "tt-clock", "0.0 s");
    clock.setAttribute("aria-hidden", "true");
    head.append(play, clock);
    if (caption) head.append(el("span", "tt-caption", caption));
    root.append(head);

    const stage = el("div", "tt-stage");
    const tracks = el("div", "tt-tracks");
    const laneEls = {};
    lanes.forEach(l => {
      const row = el("div", "tt-lane");
      row.dataset.lane = l.id;
      row.append(el("span", "tt-lane-label", l.label));
      const track = el("div", "tt-track");
      row.append(track);
      tracks.append(row);
      laneEls[l.id] = track;
    });
    stage.append(tracks);

    // Overlap: any window where both lanes speak at once.
    const a = segments.filter(s => s.lane === lanes[0].id);
    const b = segments.filter(s => s.lane === lanes[1].id);
    const overlaps = [];
    a.forEach(x => b.forEach(y => {
      const s = Math.max(x.start, y.start), e = Math.min(x.end, y.end);
      if (e > s) overlaps.push([s, e]);
    }));
    const pct = t => (100 * t) / duration + "%";
    overlaps.forEach(([s, e]) => {
      const o = el("div", "tt-overlap");
      o.style.left = pct(s); o.style.width = pct(e - s);
      o.append(el("span", "tt-overlap-label", "overlap"));
      tracks.append(o);
    });

    const segEls = segments.map((s, i) => {
      const seg = el("div", "tt-seg" + (s.kind ? " is-" + s.kind : ""));
      seg.style.left = pct(s.start); seg.style.width = pct(s.end - s.start);
      const n = Math.max(3, Math.round((s.end - s.start) * 11));
      seg._bars = bars(i + 3, n).map(h => { const bar = el("i"); bar.style.setProperty("--h", h.toFixed(3)); seg.append(bar); return bar; });
      seg._on = -1;
      if (s.cut) seg.append(el("span", "tt-cut"));
      laneEls[s.lane].append(seg);
      return seg;
    });

    events.forEach(ev => {
      const m = el("div", "tt-event");
      m.style.left = pct(ev.at);
      m.append(el("span", "tt-event-label", ev.label));
      tracks.append(m);
    });

    // Axis: one tick per second, labelled every other second.
    const axis = el("div", "tt-axis");
    for (let t = 0; t <= duration; t++) {
      const tick = el("span", "tt-tick" + (t % 2 ? "" : " is-major"));
      tick.style.left = pct(t);
      if (t % 2 === 0) tick.textContent = t + " s";
      axis.append(tick);
    }
    stage.append(axis);
    const playhead = el("div", "tt-playhead");
    playhead.setAttribute("aria-hidden", "true");
    tracks.append(playhead);
    root.append(stage);

    // Transcript: one row per segment that has words, in time order.
    const list = el("ol", "tt-transcript");
    const rows = segments
      .map((s, i) => ({ s, i }))
      .filter(r => r.s.text)
      .sort((x, y) => x.s.start - y.s.start)
      .map(({ s, i }) => {
        const li = el("li", "tt-line");
        li.dataset.lane = s.lane;
        const who = el("span", "tt-who", lanes.find(l => l.id === s.lane).label);
        const t = el("span", "tt-time", s.start.toFixed(1) + " s");
        const said = el("p", "tt-said", s.text);
        said.lang = s.lang || "ha";
        const gloss = el("p", "tt-gloss", s.gloss || "");
        gloss.lang = "en";
        li.append(t, who, said, gloss);
        if (s.note) li.append(el("p", "tt-note", s.note));
        list.append(li);
        return { li, s, i };
      });
    root.append(list);

    let t = reduce ? duration : 0, last = 0, raf = 0, playing = false;
    function render() {
      playhead.style.left = pct(t);
      clock.textContent = t.toFixed(1) + " s";
      segEls.forEach((e, i) => {
        const s = segments[i];
        const p = Math.max(0, Math.min(1, (t - s.start) / (s.end - s.start)));
        const on = Math.ceil(p * e._bars.length);
        if (on !== e._on) { e._bars.forEach((bar, j) => bar.classList.toggle("on", j < on)); e._on = on; }
        e.classList.toggle("is-live", t >= s.start && t < s.end);
      });
      rows.forEach(({ li, s }) => {
        li.classList.toggle("is-heard", t >= s.start);
        li.classList.toggle("is-live", t >= s.start && t < s.end);
      });
    }
    function frame(now) {
      t = Math.min(duration, t + (now - last) / 1000);
      last = now;
      render();
      if (t >= duration) return stop();
      raf = requestAnimationFrame(frame);
    }
    function start() {
      if (t >= duration) t = 0;
      playing = true; root.classList.add("is-playing");
      play.setAttribute("aria-label", "Pause");
      last = performance.now(); raf = requestAnimationFrame(frame);
    }
    function stop() {
      playing = false; root.classList.remove("is-playing");
      play.setAttribute("aria-label", "Play the exchange");
      cancelAnimationFrame(raf);
    }
    play.addEventListener("click", () => (playing ? stop() : start()));
    render();
    return { play: start, pause: stop, seek(v) { t = v; render(); } };
  }

export { createTurnTaking };
