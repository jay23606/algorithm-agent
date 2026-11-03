// SPDX-License-Identifier: MIT
// @algo/viz core: the trace protocol of spec 10.2. A scene records steps and events here. The player of the site draws them.

export type Value = number | string | boolean | null | Value[] | { [k: string]: Value };
export type Event = [string, ...unknown[]];

export type State =
  | "default" | "active" | "compare" | "swap" | "pivot"
  | "frontier" | "visited" | "path" | "rejected" | "invariant";

export interface Step {
  line: string;
  note?: string;
  phase?: string;
  vars?: Record<string, unknown>;
  ev: Event[];
}

export interface Trace {
  v: 1;
  scene: string;
  input: unknown;
  steps: Step[];
  result?: unknown;
  counters: Record<string, number>;
}

export interface InputSpec {
  type: string;
  length?: [number, number];
  values?: [number, number];
  [k: string]: unknown;
}

export interface Scene<I = any, R = any> {
  slug: string;
  input: InputSpec;
  run(v: Viz, input: I): R;
}

export function scene<I, R>(s: Scene<I, R>): Scene<I, R> {
  return s;
}

// mulberry32, seeded from the input, so that a scene is pure (rule V01).
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type Range = number | [number, number];

export class ArrayView {
  constructor(private v: Viz, readonly name: string, private data: Value[]) {}
  get length(): number { return this.data.length; }
  get(i: number): Value {
    this.v.emit(["array.get", this.name, i]);
    return this.data[i];
  }
  // peek reads a value with no event, for the logic of the scene.
  peek(i: number): Value { return this.data[i]; }
  set(i: number, value: Value, opts?: { from?: [string, number] }): void {
    this.data[i] = value;
    this.v.count("write");
    this.v.emit(["array.set", this.name, i, value, opts?.from ?? null]);
  }
  swap(i: number, j: number): void {
    const t = this.data[i];
    this.data[i] = this.data[j];
    this.data[j] = t;
    this.v.count("swap");
    this.v.emit(["array.swap", this.name, i, j]);
  }
  compare(i: number, j: number): number {
    this.v.count("compare");
    this.v.emit(["array.compare", this.name, i, j]);
    const a = this.data[i] as number, b = this.data[j] as number;
    return a < b ? -1 : a > b ? 1 : 0;
  }
  // compareWith compares the cell i with a value that is not in the array, such as a key.
  compareWith(i: number, x: Value): number {
    this.v.count("compare");
    this.v.emit(["array.compare", this.name, i, -1]);
    const a = this.data[i] as number, b = x as number;
    return a < b ? -1 : a > b ? 1 : 0;
  }
  mark(range: Range, state: State): void { this.v.emit(["array.mark", this.name, range, state]); }
  unmark(range: Range): void { this.v.emit(["array.unmark", this.name, range]); }
  ptr(name: string, i: number | null): void { this.v.emit(["array.ptr", this.name, name, i]); }
  bracket(lo: number | null, mid?: number | null, hi?: number | null): void {
    this.v.emit(["array.bracket", this.name, lo, mid ?? null, hi ?? null]);
  }
  label(text: string): void { this.v.emit(["array.label", this.name, text]); }
  values(): Value[] { return this.data.slice(); }
}

export class Viz {
  steps: Step[] = [];
  counters: Record<string, number> = {};
  private pending: Event[] = [];
  private phaseName: string | undefined;
  result: unknown;
  readonly random: () => number;

  constructor(input: unknown) {
    this.random = rng(hashString(JSON.stringify(input) ?? ""));
  }

  private cur(): Step | undefined { return this.steps[this.steps.length - 1]; }

  emit(e: Event): void {
    const s = this.cur();
    if (s) s.ev.push(e); else this.pending.push(e);
  }

  // line starts a new step at the pseudocode line id.
  line(id: string, note?: string): void {
    const s: Step = { line: id, ev: this.pending };
    this.pending = [];
    if (note) s.note = note;
    if (this.phaseName) s.phase = this.phaseName;
    this.steps.push(s);
  }
  note(text: string): void {
    const s = this.cur();
    if (s) s.note = text;
  }
  phase(title: string): void { this.phaseName = title; }
  vars(o: Record<string, unknown>): void {
    const s = this.cur();
    if (s) s.vars = { ...(s.vars ?? {}), ...o };
  }
  count(name: string, delta = 1): void { this.counters[name] = (this.counters[name] ?? 0) + delta; }
  array(name: string, values: Value[], opts: { view?: "bars" | "cells"; label?: string } = {}): ArrayView {
    this.emit(["array.create", name, values.slice(), { view: opts.view ?? "bars", label: opts.label ?? null }]);
    return new ArrayView(this, name, values.slice());
  }
  destroy(name: string): void { this.emit(["destroy", name]); }
}

// trace runs a scene on an input and returns the trace.
export function trace(s: Scene, input: unknown): Trace {
  const v = new Viz(input);
  const copy = JSON.parse(JSON.stringify(input));
  const result = s.run(v, copy);
  return { v: 1, scene: s.slug, input, steps: v.steps, result, counters: v.counters };
}
