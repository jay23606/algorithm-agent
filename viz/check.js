// SPDX-License-Identifier: MIT
// Runs a bundled scene on its presets, twice each, and prints what algo viz check needs.
// The scene must be pure (rule V01): Math.random, timers, fetch and the DOM throw here.
"use strict";
const fs = require("fs");
const slug = process.argv[2];
const deny = (name) => () => { throw new Error(`the scene calls ${name} (V01)`); };
Math.random = deny("Math.random");
globalThis.setTimeout = deny("setTimeout");
globalThis.setInterval = deny("setInterval");
globalThis.fetch = deny("fetch");
globalThis.window = globalThis;
new Function(fs.readFileSync("scene.js", "utf8"))();
const scene = globalThis.AlgoScenes && globalThis.AlgoScenes[slug];
if (!scene) {
  process.stderr.write(`the bundle registers no scene with the slug ${slug}\n`);
  process.exit(1);
}
const presets = JSON.parse(fs.readFileSync("presets.json", "utf8"));
const out = [];
for (const p of presets) {
  try {
    const a = JSON.stringify(globalThis.AlgoViz.trace(scene, p.input));
    const b = JSON.stringify(globalThis.AlgoViz.trace(scene, p.input));
    const t = JSON.parse(a);
    out.push({ name: p.name, same: a === b, steps: t.steps.length, lines: [...new Set(t.steps.map((s) => s.line))] });
  } catch (e) {
    out.push({ name: p.name, error: String(e && e.message ? e.message : e) });
  }
}
process.stdout.write(JSON.stringify({ presets: out }));
