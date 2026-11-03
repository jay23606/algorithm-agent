// SPDX-License-Identifier: Apache-2.0
// The player of the scenes (spec 10.6). A scene bundle sets window.AlgoScenes[slug] and window.AlgoViz. The player runs the scene on an input, computes the state after each step and draws it. It needs no server and sends nothing.
(function () {
  "use strict";
  var d = document;
  var MAX_STEPS = 20000;
  var STATES = ["active", "compare", "swap", "pivot", "frontier", "visited", "path", "rejected", "invariant"];
  var NAMES = { active: "read", compare: "compare", swap: "write or swap", pivot: "pivot", frontier: "frontier", visited: "visited", path: "result", rejected: "out of range", invariant: "invariant holds" };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function el(tag, cls, text) { var e = d.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function fmt(v) {
    if (v === null || v === undefined) return "nil";
    if (typeof v === "number") return Number.isInteger(v) ? String(v) : String(Math.round(v * 1000) / 1000);
    if (typeof v === "string") return v;
    return JSON.stringify(v);
  }
  // A range is an index or [lo, hi], with both ends included.
  function each(range, f) {
    if (typeof range === "number") { f(range); return; }
    if (Array.isArray(range)) for (var i = range[0]; i <= range[1]; i++) f(i);
  }

  // frames turns a trace into one state for each step.
  function frames(trace) {
    var st = { arrays: {}, order: [], vars: {}, counters: { compare: 0, write: 0, swap: 0 }, seen: {} };
    var out = [];
    trace.steps.forEach(function (step) {
      var hot = {};
      step.ev.forEach(function (e) {
        var a = st.arrays[e[1]];
        switch (e[0]) {
          case "array.create":
            st.arrays[e[1]] = { values: e[2].slice(), view: (e[3] && e[3].view) || "bars", label: (e[3] && e[3].label) || e[1], marks: {}, ptrs: {}, br: null };
            if (st.order.indexOf(e[1]) < 0) st.order.push(e[1]);
            break;
          case "destroy":
            delete st.arrays[e[1]];
            st.order = st.order.filter(function (n) { return n !== e[1]; });
            break;
          case "array.get":
            if (a) (hot[e[1]] = hot[e[1]] || {})[e[2]] = "active";
            break;
          case "array.set":
            if (a) { a.values[e[2]] = e[3]; (hot[e[1]] = hot[e[1]] || {})[e[2]] = "swap"; }
            st.counters.write++;
            break;
          case "array.swap":
            if (a) {
              var t = a.values[e[2]]; a.values[e[2]] = a.values[e[3]]; a.values[e[3]] = t;
              var h = (hot[e[1]] = hot[e[1]] || {}); h[e[2]] = h[e[3]] = "swap";
            }
            st.counters.swap++;
            break;
          case "array.compare":
            if (a) { var c = (hot[e[1]] = hot[e[1]] || {}); c[e[2]] = "compare"; if (e[3] >= 0) c[e[3]] = "compare"; }
            st.counters.compare++;
            break;
          case "array.mark":
            if (a) each(e[2], function (i) { a.marks[i] = e[3]; });
            st.seen[e[3]] = true;
            break;
          case "array.unmark":
            if (a) each(e[2], function (i) { delete a.marks[i]; });
            break;
          case "array.ptr":
            if (a) { if (e[3] === null || e[3] === undefined) delete a.ptrs[e[2]]; else a.ptrs[e[2]] = e[3]; }
            break;
          case "array.bracket":
            if (a) a.br = e[2] === null ? null : [e[2], e[3], e[4]];
            break;
          case "array.label":
            if (a) a.label = e[2];
            break;
        }
      });
      Object.keys(hot).forEach(function (n) { Object.keys(hot[n]).forEach(function (i) { st.seen[hot[n][i]] = true; }); });
      if (step.vars) Object.keys(step.vars).forEach(function (k) { st.vars[k] = step.vars[k]; });
      var f = clone(st);
      f.hot = hot; f.line = step.line; f.note = step.note || ""; f.phase = step.phase || "";
      delete f.seen;
      out.push(f);
    });
    return { frames: out, seen: Object.keys(st.seen) };
  }

  function Player(root) {
    this.root = root;
    this.slug = root.dataset.scene;
    this.scene = (window.AlgoScenes || {})[this.slug];
    this.stage = root.querySelector(".pl-stage");
    this.noteEl = root.querySelector(".pl-note");
    this.varsEl = root.querySelector(".pl-vars");
    this.countEl = root.querySelector(".pl-counters");
    this.scrub = root.querySelector(".pl-scrub");
    this.pos = root.querySelector(".pl-pos");
    this.playBtn = root.querySelector('[data-act="play"]');
    this.speed = root.querySelector(".pl-speed");
    this.presetSel = root.querySelector(".pl-preset");
    this.text = root.querySelector(".pl-custom textarea");
    this.err = root.querySelector(".pl-err");
    this.code = root.querySelector(".player-code");
    this.lines = {};
    var self = this;
    if (this.code) this.code.querySelectorAll("li[data-line]").forEach(function (li) { self.lines[li.dataset.line] = li; });
    try { this.presets = JSON.parse(root.dataset.presets || "[]") || []; } catch (e) { this.presets = []; }
    if (!this.scene || !window.AlgoViz) { this.stage.textContent = "The scene did not load."; return; }
    this.presets.forEach(function (p, i) { var o = el("option", null, p.name); o.value = String(i); self.presetSel.appendChild(o); });
    this.bind();
    this.load(this.presets.length ? this.presets[0].input : {});
  }

  Player.prototype.bind = function () {
    var self = this, r = this.root;
    r.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]");
      if (!b) return;
      var act = b.dataset.act;
      if (act === "start") self.go(0);
      else if (act === "prev") self.go(self.k - 1);
      else if (act === "next") self.go(self.k + 1);
      else if (act === "end") self.go(self.f.length - 1);
      else if (act === "play") self.toggle();
      else if (act === "run") self.custom();
    });
    this.scrub.addEventListener("input", function () { self.stop(); self.go(+self.scrub.value); });
    this.presetSel.addEventListener("change", function () { self.stop(); self.load(self.presets[+self.presetSel.value].input); });
    r.tabIndex = -1;
    var keyTarget = d.querySelectorAll(".player").length === 1 ? d : r;
    keyTarget.addEventListener("keydown", function (e) {
      var t = e.target;
      if (t && (t.tagName === "INPUT" && t.type !== "range" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
      if (keyTarget === d && !self.visible()) return;
      var k = e.key, done = true;
      if (k === " ") self.toggle();
      else if (k === "ArrowRight") { self.stop(); self.go(self.k + 1); }
      else if (k === "ArrowLeft") { self.stop(); self.go(self.k - 1); }
      else if (k === "Home") { self.stop(); self.go(0); }
      else if (k === "End") { self.stop(); self.go(self.f.length - 1); }
      else if (k === "+" || k === "=") self.faster(1);
      else if (k === "-" || k === "_") self.faster(-1);
      else done = false;
      if (done) e.preventDefault();
    });
  };

  Player.prototype.visible = function () {
    var b = this.root.getBoundingClientRect();
    return b.bottom > 0 && b.top < innerHeight;
  };

  Player.prototype.faster = function (dir) {
    var i = this.speed.selectedIndex + dir;
    if (i >= 0 && i < this.speed.options.length) this.speed.selectedIndex = i;
  };

  Player.prototype.load = function (input) {
    var trace;
    this.err.textContent = "";
    try {
      trace = window.AlgoViz.trace(this.scene, input);
    } catch (e) {
      this.err.textContent = "The scene cannot run on this input: " + (e && e.message ? e.message : e);
      return false;
    }
    if (!trace.steps.length) { this.err.textContent = "The scene made no steps for this input."; return false; }
    if (trace.steps.length > MAX_STEPS) { this.err.textContent = "This input makes too many steps for the player. Use a smaller input."; return false; }
    var r = frames(trace);
    this.trace = trace; this.f = r.frames; this.seen = r.seen;
    this.text.value = JSON.stringify(input);
    this.scrub.max = String(this.f.length - 1);
    this.max = {};
    var self = this;
    this.f.forEach(function (fr) {
      fr.order.forEach(function (n) {
        fr.arrays[n].values.forEach(function (v) { if (typeof v === "number") self.max[n] = Math.max(self.max[n] || 0, Math.abs(v)); });
      });
    });
    // All arrays use one scale, so equal values have equal bars.
    this.top = Object.keys(this.max).reduce(function (t, n) { return Math.max(t, self.max[n]); }, 0);
    this.build();
    this.go(0);
    return true;
  };

  Player.prototype.custom = function () {
    var v;
    try { v = JSON.parse(this.text.value); } catch (e) { this.err.textContent = "This is not valid JSON: " + e.message; return; }
    var spec = this.scene.input || {};
    var msg = check(spec, v);
    if (msg) { this.err.textContent = msg; return; }
    this.stop();
    this.load(v);
  };

  // check tests a custom input against the input spec of the scene, for the common case of an array of numbers.
  function check(spec, v) {
    if (typeof v !== "object" || v === null || Array.isArray(v)) return "The input must be a JSON object, in the same form as a preset.";
    var arr = null;
    Object.keys(v).forEach(function (k) { if (Array.isArray(v[k]) && !arr) arr = v[k]; });
    if (arr && spec.length) {
      if (arr.length < spec.length[0] || arr.length > spec.length[1]) return "The array must have from " + spec.length[0] + " to " + spec.length[1] + " items.";
    }
    if (arr && spec.values) {
      for (var i = 0; i < arr.length; i++) {
        if (typeof arr[i] !== "number" || arr[i] < spec.values[0] || arr[i] > spec.values[1]) return "Each item must be a number from " + spec.values[0] + " to " + spec.values[1] + ".";
      }
    }
    return "";
  }

  // build makes the elements of the stage for the arrays of the trace. go then only changes classes and sizes.
  Player.prototype.build = function () {
    var self = this;
    this.stage.textContent = "";
    this.views = {};
    var names = [];
    this.f.forEach(function (fr) { fr.order.forEach(function (n) { if (names.indexOf(n) < 0) names.push(n); }); });
    names.forEach(function (n) {
      var w = el("div", "arr"), lab = el("div", "arr-label"), cells = el("div", "arr-cells");
      w.appendChild(lab); w.appendChild(cells);
      self.stage.appendChild(w);
      self.views[n] = { w: w, lab: lab, cells: cells, list: [] };
    });
    if (this.seen.length) {
      var lg = el("div", "legend");
      STATES.forEach(function (s) {
        if (self.seen.indexOf(s) < 0) return;
        var x = el("span", null, NAMES[s]);
        x.style.setProperty("--c", "var(--st-" + s + ")");
        lg.appendChild(x);
      });
      this.stage.appendChild(lg);
    }
  };

  Player.prototype.go = function (k) {
    if (!this.f) return;
    k = Math.max(0, Math.min(this.f.length - 1, k));
    this.k = k;
    var fr = this.f[k], self = this;
    Object.keys(this.views).forEach(function (n) {
      var v = self.views[n], a = fr.arrays[n];
      v.w.hidden = !a;
      if (!a) return;
      v.w.className = "arr " + a.view + (a.values.length > 14 ? " dense" : "");
      v.lab.textContent = a.label;
      while (v.list.length < a.values.length) {
        var c = el("div", "cell"), p = el("div", "ptrs"), bar = el("div", "blk"), val = el("div", "v"), idx = el("div", "i", String(v.list.length));
        if (a.view === "cells") { bar.appendChild(val); c.appendChild(p); c.appendChild(bar); c.appendChild(idx); }
        else { c.appendChild(p); c.appendChild(bar); c.appendChild(val); c.appendChild(idx); }
        v.cells.appendChild(c);
        v.list.push({ c: c, p: p, bar: bar, val: val });
      }
      var ptrAt = {};
      Object.keys(a.ptrs).forEach(function (name) { var i = a.ptrs[name]; (ptrAt[i] = ptrAt[i] || []).push(name); });
      var hot = fr.hot[n] || {}, m = self.top || 1;
      v.list.forEach(function (x, i) {
        x.c.hidden = i >= a.values.length;
        if (i >= a.values.length) return;
        var val = a.values[i];
        x.val.textContent = fmt(val);
        if (a.view === "bars") x.bar.style.height = (typeof val === "number" ? Math.max(0.2, Math.abs(val) / m * 6.4) : 3.2).toFixed(2) + "rem";
        var s = hot[i] || a.marks[i] || "";
        if (s) x.c.dataset.st = s; else delete x.c.dataset.st;
        var out = a.br && (i < a.br[0] || (a.br[2] !== null && i > a.br[2]));
        x.c.classList.toggle("out", !!out);
        x.p.textContent = (ptrAt[i] || []).join(" ");
      });
      if (a.view === "bars") v.cells.style.height = "";
    });
    var note = fr.note;
    this.noteEl.textContent = note || fr.phase || "";
    this.vars(fr);
    Object.keys(this.lines).forEach(function (id) { self.lines[id].classList.toggle("cur", id === fr.line); });
    var cur = this.lines[fr.line];
    if (cur && this.code) {
      var box = this.code.parentElement, top = cur.offsetTop - box.offsetTop;
      if (box.scrollHeight > box.clientHeight && (top < box.scrollTop || top > box.scrollTop + box.clientHeight - 30)) box.scrollTop = top - 40;
    }
    if (window.AlgoMark) window.AlgoMark(fr.line);
    this.scrub.value = String(k);
    this.pos.textContent = (k + 1) + " / " + this.f.length;
  };

  Player.prototype.vars = function (fr) {
    var self = this;
    function dl(box, obj) {
      box.textContent = "";
      Object.keys(obj).forEach(function (k) {
        var w = el("div"); w.appendChild(el("dt", null, k)); w.appendChild(el("dd", null, fmt(obj[k])));
        box.appendChild(w);
      });
    }
    dl(this.varsEl, fr.vars);
    dl(this.countEl, fr.counters);
    void self;
  };

  Player.prototype.toggle = function () { if (this.timer) this.stop(); else this.play(); };
  Player.prototype.play = function () {
    var self = this;
    if (this.k >= this.f.length - 1) this.go(0);
    this.playBtn.textContent = "❚❚"; this.playBtn.setAttribute("aria-label", "Pause");
    var tick = function () {
      if (self.k >= self.f.length - 1) { self.stop(); return; }
      self.go(self.k + 1);
      self.timer = setTimeout(tick, 700 / (+self.speed.value || 1));
    };
    this.timer = setTimeout(tick, 350 / (+self.speed.value || 1));
  };
  Player.prototype.stop = function () {
    clearTimeout(this.timer); this.timer = null;
    if (this.playBtn) { this.playBtn.textContent = "▶"; this.playBtn.setAttribute("aria-label", "Play"); }
  };

  function start() { d.querySelectorAll(".player[data-scene]").forEach(function (p) { new Player(p); }); }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", start); else start();
})();
