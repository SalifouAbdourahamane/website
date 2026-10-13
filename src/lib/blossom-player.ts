// @ts-nocheck — ported verbatim from ~/Desktop/Namu/lab-web-mastery/studies/blossom-player.js (tested there).
// Client-only: call these from useEffect. TODO: add types.
const global: any = typeof window !== "undefined" ? window : {};

/* Blossom player — the sample player whose progress draws the Namu mark.
 *
 * At rest the button shows the Blossom faintly, its Sahel dot where the logo
 * keeps it. On play the dot moves to the start of the arc and rides its tip
 * as the arc fills in; when the clip ends the arc is whole and the dot rests
 * where it belongs, so every listen ends on the mark. The transcript beside
 * it lights word by word from alignment times.
 *
 * Silent study: no consented recording exists yet, so the clock runs without
 * sound and the page says so. On the site the clock is audio.currentTime.
 */

  const ARC = "M 104 60 A 44 44 0 1 0 60 104"; // the Blossom's arc, from the icon file

  function createBlossomPlayer(root, { words, duration, label, gloss, note }) {
    const reduce = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.add("bp");
    root.innerHTML = `
      <button class="bp-button" type="button" aria-label="Play ${label}">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <path class="bp-track" d="${ARC}"/>
          <path class="bp-fill" d="${ARC}" pathLength="1"/>
          <circle class="bp-dot" r="7.5" cx="60" cy="104"/>
          <path class="bp-glyph bp-play" d="M50 44v32l26-16z"/>
          <g class="bp-glyph bp-pause"><path d="M51 45v30M69 45v30"/></g>
        </svg>
      </button>
      <div class="bp-body">
        <div class="bp-meta"><span class="bp-label">${label}</span><span class="bp-time">0:00 / ${fmt(duration)}</span></div>
        <p class="bp-words" lang="ha" aria-hidden="true"></p>
        <p class="sr-only" lang="ha">${words.map(w => w.w).join(" ")}</p>
        <p class="bp-gloss" lang="en">${gloss}</p>
        ${note ? `<p class="bp-note">${note}</p>` : ""}
      </div>`;
    const btn = root.querySelector(".bp-button");
    const fill = root.querySelector(".bp-fill");
    const dot = root.querySelector(".bp-dot");
    const time = root.querySelector(".bp-time");
    const wordsEl = root.querySelector(".bp-words");
    const spans = words.map(({ w }) => {
      const s = document.createElement("span");
      s.textContent = w;
      wordsEl.append(s, " ");
      return s;
    });
    const total = fill.getTotalLength();

    let t = 0, playing = false, last = 0, raf = 0, started = false;
    function fmt(s) { return Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0"); }
    function render() {
      const p = Math.min(1, t / duration);
      fill.style.strokeDashoffset = String(1 - p);
      const pt = fill.getPointAtLength((started ? p : 1) * total);
      dot.setAttribute("cx", pt.x.toFixed(2));
      dot.setAttribute("cy", pt.y.toFixed(2));
      time.textContent = `${fmt(t)} / ${fmt(duration)}`;
      // Binary search for the current word by start time.
      let lo = 0, hi = words.length - 1, cur = -1;
      while (lo <= hi) { const mid = (lo + hi) >> 1; if (words[mid].start <= t) { cur = mid; lo = mid + 1; } else hi = mid - 1; }
      if (cur >= 0 && t > words[cur].end) cur = started && playing ? -1 : cur;
      spans.forEach((s, i) => {
        s.className = !started ? "" : i === cur && playing ? "is-current" : words[i].end <= t ? "is-spoken" : "is-unspoken";
      });
    }
    function frame(now) {
      t = Math.min(duration, t + (now - last) / 1000); last = now;
      render();
      if (t >= duration) { stop(true); return; }
      raf = requestAnimationFrame(frame);
    }
    function play() {
      if (t >= duration) t = 0;
      started = true; playing = true; root.classList.add("is-playing");
      btn.setAttribute("aria-label", "Pause " + label);
      if (reduce) { t = duration; render(); stop(true); return; }
      last = performance.now(); raf = requestAnimationFrame(frame);
    }
    function stop(ended) {
      playing = false; root.classList.remove("is-playing");
      btn.setAttribute("aria-label", (ended ? "Replay " : "Play ") + label);
      cancelAnimationFrame(raf);
      if (ended) { root.classList.add("is-ended"); render(); setTimeout(() => root.classList.remove("is-ended"), 1200); }
    }
    btn.addEventListener("click", () => (playing ? stop(false) : play()));
    render();
    return { play, pause: () => stop(false) };
  }

export { createBlossomPlayer };
