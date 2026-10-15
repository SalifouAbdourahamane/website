// @ts-nocheck — ported verbatim from ~/Desktop/Namu/lab-web-mastery/studies/strict-folded.js (tested there).
// Client-only: call these from useEffect. TODO: add types.
const global: any = typeof window !== "undefined" ? window : {};

/* Strict and folded — a worked example of why Namu reports two WERs.
 *
 * Strict keeps the hooked letters (ɓ ɗ ƙ ƴ) and the glottal apostrophe ʼ;
 * folded maps them to plain letters. The page aligns a reference and a
 * hypothesis word by word (real Levenshtein, computed in the browser) and
 * shows how the score moves when the scorer stops caring about hooks.
 */

  // Text normaliser shared by both modes: case, punctuation, apostrophe variants.
  function normalise(s) {
    return s
      .toLowerCase()
      .replace(/[’‘ʻ'`´]/g, "ʼ")       // every apostrophe → ʼ (U+02BC)
      .replace(/[.,;:!?…“”"()]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  const FOLD = { "ɓ": "b", "ɗ": "d", "ƙ": "k", "ƴ": "y", "ʼ": "" };
  const fold = w => w.replace(/[ɓɗƙƴʼ]/g, c => FOLD[c]);

  // Word-level alignment with backtrace: returns ops [{op, ref, hyp}].
  function align(ref, hyp) {
    const n = ref.length, m = hyp.length;
    const d = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i ? (j ? 0 : i) : j)));
    for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
      const sub = d[i - 1][j - 1] + (ref[i - 1] === hyp[j - 1] ? 0 : 1);
      d[i][j] = Math.min(sub, d[i - 1][j] + 1, d[i][j - 1] + 1);
    }
    const ops = [];
    let i = n, j = m;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (ref[i - 1] === hyp[j - 1] ? 0 : 1)) {
        ops.unshift({ op: ref[i - 1] === hyp[j - 1] ? "ok" : "sub", ref: ref[i - 1], hyp: hyp[j - 1] }); i--; j--;
      } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
        ops.unshift({ op: "del", ref: ref[i - 1], hyp: "" }); i--;
      } else {
        ops.unshift({ op: "ins", ref: "", hyp: hyp[j - 1] }); j--;
      }
    }
    return ops;
  }

  function score(refText, hypText, mode) {
    let ref = normalise(refText).split(" "), hyp = normalise(hypText).split(" ");
    const shown = { ref: ref.slice(), hyp: hyp.slice() };
    if (mode === "folded") { ref = ref.map(fold); hyp = hyp.map(fold); }
    const ops = align(ref, hyp);
    // Map back to the unfolded words for display.
    let ri = 0, hi = 0;
    ops.forEach(o => {
      if (o.op !== "ins") o.refShown = shown.ref[ri++];
      if (o.op !== "del") o.hypShown = shown.hyp[hi++];
    });
    // A hook error: wrong in strict scoring, right once hooks are folded.
    ops.forEach(o => { if (o.op === "sub" && fold(o.refShown) === fold(o.hypShown)) o.hook = true; });
    const errors = ops.filter(o => o.op !== "ok").length;
    return { ops, errors, words: ref.length, wer: errors / ref.length };
  }

  function hookedLoss(refText, hypText) {
    // Hooked letters in the reference that the hypothesis rendered plain.
    const ref = normalise(refText).split(" "), hyp = normalise(hypText).split(" ");
    const ops = align(ref.map(fold), hyp.map(fold));
    let ri = 0, hi = 0, total = 0, lost = 0;
    ops.forEach(o => {
      const r = o.op !== "ins" ? ref[ri++] : "", h = o.op !== "del" ? hyp[hi++] : "";
      const hooks = (r.match(/[ɓɗƙƴ]/g) || []).length;
      total += hooks;
      if (o.op === "ok" && hooks) lost += hooks - (h.match(/[ɓɗƙƴ]/g) || []).length;
    });
    return { total, lost };
  }

  /* Every word the engine writes. English is the default; pass `strings` (any subset) to localise.
   * Values go into innerHTML, so they must be plain text without < or &. */
  const STRICT_FOLDED_STRINGS = {
    modes: "Scoring mode",                 // radiogroup aria-label
    strict: "Strict",
    folded: "Folded",
    reference: "Reference",                // row label
    hypothesis: "Model heard",             // row label
    wer: "Word error rate",                // stat label
    count: "Errors / words",               // stat label
    hooks: "Hooked letters lost",          // stat label
    ruleStrict: "Strict keeps ɓ ɗ ƙ ƴ and ʼ. A word with a missing hook is a different word.",
    ruleFolded: "Folded maps ɓ ɗ ƙ ƴ to b d k y and drops ʼ before scoring. Hook errors disappear.",
    lostOf: (lost, total) => `${lost} of ${total}`,
    decimal: ".",                          // decimal separator in the WER
    percent: "%",                          // percent sign, with any space before it
  };

  function createStrictFolded(root, { reference, hypothesis, strings = STRICT_FOLDED_STRINGS }) {
    const S = { ...STRICT_FOLDED_STRINGS, ...strings };
    root.classList.add("sf");
    root.innerHTML = `
      <div class="sf-controls" role="radiogroup" aria-label="${S.modes}">
        <button type="button" role="radio" class="sf-mode" data-mode="strict" aria-checked="true">${S.strict}</button>
        <button type="button" role="radio" class="sf-mode" data-mode="folded" aria-checked="false">${S.folded}</button>
        <span class="sf-thumb" aria-hidden="true"></span>
      </div>
      <p class="sf-rule"></p>
      <div class="sf-rows">
        <div class="sf-row"><span class="sf-label">${S.reference}</span><p class="sf-words sf-ref" lang="ha"></p></div>
        <div class="sf-row"><span class="sf-label">${S.hypothesis}</span><p class="sf-words sf-hyp" lang="ha"></p></div>
      </div>
      <dl class="sf-stats">
        <div><dt>${S.wer}</dt><dd class="sf-wer"></dd></div>
        <div><dt>${S.count}</dt><dd class="sf-count"></dd></div>
        <div><dt>${S.hooks}</dt><dd class="sf-hook"></dd></div>
      </dl>`;
    const $ = s => root.querySelector(s);
    const rules = {
      strict: S.ruleStrict,
      folded: S.ruleFolded,
    };
    const loss = hookedLoss(reference, hypothesis);
    $(".sf-hook").textContent = S.lostOf(loss.lost, loss.total);

    function render(mode) {
      const r = score(reference, hypothesis, mode);
      root.dataset.mode = mode;
      root.querySelectorAll(".sf-mode").forEach(b => b.setAttribute("aria-checked", String(b.dataset.mode === mode)));
      $(".sf-rule").textContent = rules[mode];
      const word = (text, o) => `<span class="sf-w is-${o.op}${o.hook ? " is-hook" : ""}">${text || "∅"}</span>`;
      $(".sf-ref").innerHTML = r.ops.map(o => word(o.op === "ins" ? "" : o.refShown, o)).join(" ");
      $(".sf-hyp").innerHTML = r.ops.map(o => word(o.op === "del" ? "" : o.hypShown, o)).join(" ");
      $(".sf-wer").textContent = (100 * r.wer).toFixed(1).replace(".", S.decimal) + S.percent;
      $(".sf-count").textContent = `${r.errors} / ${r.words}`;
    }
    root.querySelectorAll(".sf-mode").forEach(b => b.addEventListener("click", () => render(b.dataset.mode)));
    root.querySelector(".sf-controls").addEventListener("keydown", e => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const next = root.dataset.mode === "strict" ? "folded" : "strict";
      render(next); root.querySelector(`.sf-mode[data-mode="${next}"]`).focus();
    });
    render("strict");
    return { render };
  }

export { createStrictFolded, score as scoreWER, STRICT_FOLDED_STRINGS };
