# 10. Visualization

A visualization shows an algorithm run. The reader can step forward and back, change the input, and see the line of code that runs and the values of the variables. One protocol and one library of primitives serve every algorithm. Each scene is checked against the proved oracle, so the picture shows the real algorithm and the right answer.

## 10.1 Principles

1. **The picture follows the proof.** A scene shows the state that the proof talks about: the sorted prefix of insertion sort, the frontier of BFS, the settled set of Dijkstra, the invariant of binary search. The narration uses the words of the proof (06.5).
2. **The reader drives.** Step, step back, scrub, change the input, try the worst case. Autoplay is the second mode, not the first.
3. **One step, one idea.** A step is one line of the pseudocode. A step changes few things, and the change is highlighted.
4. **Trace, then draw.** A scene runs the algorithm to completion and records a trace of events. The player draws the trace. The two parts never mix, so the same trace drives the player, the static frames and the checks (10.7, 10.8).
5. **Same primitives everywhere.** An array looks the same in every sort, a graph the same in every graph algorithm. A reader learns the visual language once.
6. **Readable without colour, without motion and without script.** Each state has a shape or a pattern as well as a colour. Reduced motion turns tweens off. With no script, the page shows a filmstrip of static frames (10.7).

What we learn from others, without copying their code or assets (17.2): VisuAlgo shows that narration for each step (its "e-lecture" mode) teaches better than motion alone; Algorithm Visualizer shows that a trace of tracer calls, apart from the drawing, scales to hundreds of algorithms; the USFCA visualizations by David Galles show that a reader wants to type the input; Red Blob Games and Distill show what direct manipulation, small multiples and careful prose can do. VisuAlgo's licence restricts reuse, so it is only linked (11.2).

## 10.2 The trace protocol and the scene primitives

### 10.2.1 A scene

A scene is `viz/scene.ts` in the node directory (04.3). It imports only `@algo/viz`, the runtime library of `tamnd/algorithm-agent` (MIT, 03.1). It exports one scene object:

```ts
import { scene } from "@algo/viz";

export default scene({
  slug: "merge-sort",
  input: { type: "list<int>", length: [0, 32], values: [-99, 99] },  // the limits of the player
  run(v, input) {
    // create structures, run the algorithm, emit events, return the result
  },
});
```

- `input.type` is a type of the contract (08.3.3). The limits are smaller than the contract bounds, so the picture stays readable.
- `run` gets a `Viz` handle `v` and the input. It creates structures with `v.array`, `v.graph` and the others, runs the algorithm on them and returns the output.
- The scene is pure. It has no access to the DOM, the network, timers or `Math.random`. Randomness comes from `v.random()`, which is seeded by the input (rule V01).

### 10.2.2 Steps and events

The trace is a list of **steps**. A call to `v.line(id)` starts a new step. Each step has:

| Field | Meaning |
|---|---|
| `line` | the pseudocode line id of the step, for example `L9` |
| `note` | the narration: one sentence, at most 140 characters, optional |
| `ev` | the events of the step, in order |
| `vars` | the values of the watched variables after the step |
| `phase` | the phase that the step belongs to, for the timeline chapters |

The events, by group:

| Group | Events | Example |
|---|---|---|
| meta | `line(id, note?)`, `note(text)`, `phase(title)`, `vars({...})`, `count(name, delta = 1)`, `result(value)` | `v.count("compare")` |
| structure | `create`, `destroy`, `show`, `hide`, `label(text)` | `v.array("aux", ...)` creates |
| array and string | `get(i)`, `set(i, value, {from})`, `swap(i, j)`, `compare(i, j)`, `mark(range, state)`, `unmark(range)`, `ptr(name, i)`, `bracket(lo, mid, hi)`, `copy(src, i, dst, j)` | `a.swap(2, 5)` |
| graph | `addNode`, `addEdge`, `removeEdge`, `visit(u)`, `edge(u, v, state)`, `relax(u, v, before, after)`, `nodeLabel(u, text)`, `path([u, …])` | `g.relax(1, 4, Infinity, 7)` |
| tree | `insert(parent, child, side)`, `remove(node)`, `rotate(node, dir)`, `replace(node, value)`, `nodeLabel(node, text)` | `t.rotate(x, "left")` |
| stack, queue, deque | `push`, `pop`, `pushFront`, `pushBack`, `popFront`, `popBack`, `peek` | `q.pushBack(3)` |
| table | `fill(r, c, value, {from: cells})`, `mark(cell, state)` | `dp.fill(3, 4, 2, {from: [[2, 3]]})` |
| hash table | `hash(key, slot)`, `probe(slot)`, `insert(slot, key)`, `chain(slot, key)`, `resize(m)` | `h.probe(5)` |
| plane | `point`, `segment`, `polygon`, `circle`, `sweep(x)`, `mark(id, state)` | `p.sweep(3.5)` |
| bits | `setBit`, `clearBit`, `flip`, `mask(range)` | `b.setBit(6)` |

A read with `get` or `compare` is an event too. The counters (`count`) are what the complexity check of a visualization reads (10.8). For example, every call of `compare` adds 1 to the counter `compare`.

### 10.2.3 The trace file

The runtime writes the trace as JSON. The player keeps it in memory. `algo viz trace <slug>` writes it to a file for checks and for debugging.

```json
{
  "v": 1,
  "scene": "merge-sort",
  "input": [38, 27, 43, 3],
  "steps": [
    {"line": "L1", "note": "Sort a[0..3].", "phase": "split", "vars": {"lo": 0, "hi": 4},
     "ev": [["array.create", "a", [38, 27, 43, 3], {"view": "bars"}]]},
    {"line": "L2", "vars": {"lo": 0, "mid": 2, "hi": 4},
     "ev": [["array.bracket", "a", 0, 2, 4]]}
  ],
  "result": [3, 27, 38, 43],
  "counters": {"compare": 4, "write": 8}
}
```

### 10.2.4 The primitives

`@algo/viz` has these primitives. A scene uses only these. A new primitive is a change to `@algo/viz` with its own review, not a change in one scene (rule V13).

| Primitive | Draws | Views | Used by (examples) |
|---|---|---|---|
| `array` | a sequence of values | `bars` (height = value), `cells` (boxes with numbers), `dots` | sorts, binary search, two pointers, prefix sums |
| `str` | a string as cells, with pointers and match ranges | `cells`, `ribbon` | KMP, Z-function, suffix arrays, Manacher |
| `grid` | a 2-D board of cells | `cells`, `heat` | BFS on grids, flood fill, maze generation, Lee's algorithm |
| `graph` | nodes and edges, weighted or not, directed or not | `fixed` (coordinates from the input), `layered`, `circle`, `force` (precomputed, deterministic) | traversal, shortest paths, spanning trees, flows, matching |
| `tree` | a rooted tree | `tidy` (Reingold–Tilford layout), `radial`, `indented` | BSTs, AVL and red–black trees, tries, segment trees, recursion trees |
| `heap` | a heap as an array and as a tree at once, linked | `dual` | binary heap, heapsort, priority queues |
| `table` | a matrix with row and column headers and dependency arrows | `cells`, `heat` | dynamic programming (LCS, knapsack, edit distance), Floyd–Warshall |
| `hash` | buckets with chains, or slots with probes | `chained`, `open` | hash tables, Bloom filters, cuckoo hashing |
| `linked` | nodes with pointer arrows | `list`, `skip`, `free` | linked lists, skip lists, persistent structures |
| `stack`, `queue`, `deque` | a stack or a queue as a column or a row | `column`, `row` | DFS, BFS, monotonic stacks, the call stack of a recursion |
| `plane` | points, segments, polygons and circles on a 2-D plane, with a sweep line | `plane` | convex hull, closest pair, segment intersection, Voronoi |
| `bits` | a bit vector or a machine word | `cells` | bit tricks, Fenwick trees (`i & -i`), bitset DP, Bloom filters |
| `line1d` | a number line with points and intervals | `axis` | interval scheduling, binary search on the answer, sweep in 1-D |
| `chart` | a line or scatter chart | `line`, `scatter`, `bars` | growth of functions, measured cost, explorables (10.6) |
| `callstack` | the frames of a recursion with their arguments | `column` | recursive algorithms, shown next to the main view |

### 10.2.5 States and the palette

Each element of a primitive has a **state** from one fixed vocabulary. The state, not a colour, is what the scene names:

| State | Meaning | Mark (besides colour) |
|---|---|---|
| `default` | not involved now | plain |
| `active` | read or written in this step | thick outline |
| `compare` | compared in this step | dashed outline |
| `swap` | moved in this step | arrow |
| `pivot` | the pivot, the root, the source | diamond marker |
| `frontier` | in the queue, in the open set | hollow circle marker |
| `visited` | done with, settled, sorted into place | diagonal hatch |
| `path` | on the answer path or in the answer set | double outline |
| `rejected` | ruled out, pruned, a mismatch | cross marker |
| `invariant` | the part of the state that the invariant is about (the sorted prefix, the settled set) | tinted band behind it |

The palette is part of the site style (14.10). It is built on a colour-blind-safe base (Okabe–Ito hues), with one value for the light theme and one for the dark theme, and a contrast of at least 3:1 against the background for each mark (WCAG 1.4.11). The hue of the area of the page (05.1) tints only the frame of the player, never the states.

## 10.3 The player

The player draws a trace and lets the reader move through it.

```
┌─ Merge sort ─────────────────────────────────────────────────── ⤢ ─┐
│                                                                    │
│      ▇                     │                                       │
│      ▇     ▇               │          a                            │
│   ▇  ▇  ▇  ▇     ▇         │                                       │
│   ▇  ▇  ▇  ▇  ▇  ▇  ▇      │                                       │
│   27 38 43 3  9  82 10                                             │
│   └──lo────┘└─mid──hi┘          aux: 27 38 43 · · · ·              │
├─────────────────────────────────┬──────────────────────────────────┤
│ Pseudocode        Code: Python ▾│ lo 0  mid 3  hi 7   i 1  j 3     │
│ L6 copy a[lo..hi) to aux        │                                  │
│ L7 i ← lo; j ← mid              │ comparisons 6   writes 10        │
│▶L9 if i < mid and (j ≥ hi or …  │                                  │
│ L10    a[k] ← aux[i]; i ← i + 1 │                                  │
├─────────────────────────────────┴──────────────────────────────────┤
│ Step 23 of 61 · Merge: aux[1] = 38 is larger than aux[3] = 3,      │
│ so take 3.                                                          │
│ ⏮  ◀  ▶ Play  ▶  ⏭   ━━━━━━━●──────────────  1× ▾   Input ▾  Text │
│        split ▏ merge 0–2 ▏ merge 3–6 ▏ merge 0–6                    │
└────────────────────────────────────────────────────────────────────┘
```

The parts:

- **Stage.** The primitives of the scene. The main structure is large; helpers (the `aux` array, the call stack, the queue) sit beside it or below it.
- **Pseudocode panel.** The pseudocode of the page, with the line of the current step highlighted (10.5).
- **Code panel.** A tab beside the pseudocode: the reference implementation in the reader's language, with the lines of the current step highlighted (10.5).
- **Watch panel.** The variables of `vars` and the counters, with the changed values in bold for one step.
- **Narration.** The note of the step, under the stage.
- **Controls.** First, back, play/pause, forward, last; a timeline scrubber with the phases as chapters; speed (0.25× to 8×); the input menu (10.4); the text view (10.8.1); full screen.

Keyboard, when the player has focus: `Space` play or pause, `←` and `→` one step, `Shift+←` and `Shift+→` one phase, `Home` and `End`, `+` and `−` speed, `i` edit the input, `r` a random input, `t` the text view, `f` full screen. The keys are listed under a `?` button.

**Stepping back.** The state of the stage is plain data. The player keeps a snapshot every 64 steps and replays forward from the nearest snapshot, so a step back is instant even for 20,000 steps.

**Tweens.** A step animates for 250 ms at 1×: bars slide on a swap, a node fades into `visited`, an edge thickens on a relax. With reduced motion (the system setting or the player toggle), there is no tween; the step changes at once.

**Where it lives.** The algorithm page shows the player in the section "See it run", just after the summary (14.4). The page `/<slug>/visualize/` shows a larger stage with all panels open. The page `/<slug>/visualize/embed` is the player alone, for an `iframe` on a teacher's slides or another site. A "projector" toggle doubles the font size and the line widths.

## 10.4 Input and presets

- **Presets.** `viz/presets.yaml` lists named inputs. The player shows them in the input menu.

```yaml
# nodes/sorting/comparison/merge-sort/viz/presets.yaml
default: {input: [38, 27, 43, 3, 9, 82, 10]}
presets:
  - {name: "Random", gen: random, size: 16, seed: 7}
  - {name: "Already sorted", input: [1, 2, 3, 4, 5, 6, 7, 8]}
  - {name: "Reversed", input: [8, 7, 6, 5, 4, 3, 2, 1]}
  - {name: "Many equal keys", input: [3, 1, 3, 1, 3, 1, 2, 2]}
  - {name: "Most comparisons", gen: "contract:worst-comparisons", size: 16}
```

`gen` names a generator of the contract (09.4). The generator runs in the browser from a small JavaScript build of it, or the build writes its output into the presets file of the site when it has no JavaScript form.

- **Edit.** The input box takes the short syntax of the contract type: `5 2 4 6 1 3` for a list, `a b 4` lines for a weighted edge list, a grid as rows of `.` and `#`. It shows an error under the box when the input breaks the schema or the limits of the scene, and the stage does not change until the input is valid.
- **Direct editing.** Graph and plane scenes let the reader add a node or a point with a click and an edge with a drag. Array scenes let the reader drag a bar to change its value. The edited input appears in the input box, so it can be copied.
- **Share.** The URL keeps the input and the step (`?in=5,2,4,6,1,3&step=23`), so a reader can send a link to an exact moment.
- **Random.** `r` draws a random input from the generator with a new seed, within the limits.

## 10.5 Code sync

The pseudocode of the page has line ids (06.4). Each implementation marks its lines with `@line` comments (08.3.1). The player uses both:

- The pseudocode panel highlights the line id of the current step.
- The code panel shows the reference version in the reader's chosen language. The choice is the same one as the code tabs of the page, kept in the browser (14.4). The panel highlights each code line whose marker names the current line id. The marker comments are hidden in the display.
- When a language has no marker for the current id, the panel shows the code with no highlight and a note: "This step has no single line in Rust." This happens when one line of code does two pseudocode lines.
- The watch panel shows the variables under the names of the pseudocode, which are the names in the code too (08.3.1 rule 2). A reader who steps through the scene and reads the code sees the same names.
- The TypeScript reference is the one that the line-trace check compares with the scene (10.8.2), so the highlighted TypeScript lines are known to be the ones that run.

## 10.6 Explorables for concepts

Concepts, models and theorems get **explorables**: pictures with controls, not traces. An explorable is `viz/explorable.ts`. It has controls and a pure `draw` function from the values of the controls to primitives:

```ts
import { explorable } from "@algo/viz";

export default explorable({
  slug: "master-theorem",
  controls: {
    a: { slider: [1, 8], value: 2, label: "a, the number of subproblems" },
    b: { slider: [2, 4], value: 2, label: "b, the shrink factor" },
    d: { slider: [0, 3], step: 0.5, value: 1, label: "d, the exponent of f(n) = n^d" },
  },
  draw(v, { a, b, d }) {
    // a recursion tree of depth log_b n, with the cost of each level beside it,
    // and the case of the theorem that applies, in words
  },
});
```

The first explorables:

| Node | Explorable |
|---|---|
| `asymptotic-notation` | the curves of 1, log n, n, n log n, n², 2ⁿ on one chart; a slider for n; a toggle for log scale; "what fits in one second" at 10⁸ simple steps per second |
| `master-theorem` | the recursion tree with the cost of each level; the case that applies, and why |
| `amortized-analysis` | a dynamic array that doubles; the cost of each append as a bar and the potential as a line; the total stays under 3n |
| `hash-table-load-factor` | the expected probe length of linear probing and of chaining as the load factor grows, next to a live simulation |
| `birthday-problem` | the chance of a collision against the number of keys, with a simulation |
| `comparison-sort-lower-bound` | the decision tree of a sort of 3 and 4 elements; its height against lg n! |
| `loop-invariant` | binary search with the invariant shown as two shaded bands that close in |
| `quicksort-pivot-choice` | the recursion tree for first-element, median-of-three and random pivots on a sorted input |

An explorable has no trace. Its checks are the budget and accessibility checks of 10.8 and rule V12.

## 10.7 Static frames, filmstrips and social images

`algo viz frames <slug>` makes pictures with no browser:

1. It bundles the scene with esbuild, as the site does.
2. It runs the bundle on the default preset in goja, the Go JavaScript engine that math2-agent already uses for KaTeX, and gets the trace.
3. It picks the frames: the first step, the last step and the first step of each phase, at most 8.
4. It draws each frame with the SVG back end of the renderer, which runs in goja too.

The outputs:

- **Filmstrip.** The frames as inline SVG in the page, under the player, each with its narration as a caption. A reader with no script sees the filmstrip in place of the player. Print uses the filmstrip.
- **Social image.** One frame, the one the scene marks with `v.cover()` or else the middle phase, at 1200×630, in the page's `og:image` (14.15). The raster back end draws the same primitives with `golang.org/x/image`, as math2 draws its social images.
- **Thumbnails.** A 320×180 frame for the cards of the area and problem pages (14.3).

Frames are cached under the hash of the scene, the presets and `@algo/viz`.

## 10.8 Quality: accessibility, performance and checks

### 10.8.1 Accessibility

- The player is a region with a label ("Visualization of merge sort"). Each control is a button with a text label.
- The narration is in an `aria-live="polite"` region. It speaks each step during manual stepping and slow play, and only the phase titles at 2× and faster, so a screen reader is not flooded.
- The **text view** (`t`) shows the stage as text: the array as a table of index, value and state; the graph as a list of nodes with their labels and states; the table as an HTML table. It updates at each step.
- States have marks as well as colours (10.2.5), and the marks are visible in the high-contrast mode of the operating system.
- Reduced motion turns tweens off. No element flashes more than three times a second at any speed (WCAG 2.3.1); at high speed, highlights change only at phase boundaries.
- Focus is visible on every control. The player traps no focus; `Esc` leaves full screen.

### 10.8.2 Checks

`algo viz check <slug>` runs these checks in CI for each changed scene, and the nightly build runs them for every scene. They are rules of the audit, listed in 13.3.

| Rule | Check |
|---|---|
| V01 | the scene builds, imports only `@algo/viz`, and uses no DOM, network, timer or unseeded random |
| V02 | the trace is deterministic: the same input gives the same trace hash twice |
| V03 | the result agrees with the oracle (09.5), under the checker of the contract, on each preset and on 50 random inputs within the limits of the scene |
| V04 | each `line` id of the trace is a line id of the pseudocode of the page |
| V05 | the presets together reach every line id of the pseudocode |
| V06 | **line-trace agreement**: the sequence of line ids of the scene equals the sequence of line ids that the TypeScript reference runs on the same input, with repeats of the same id merged. `algo viz check` gets the second sequence by turning each `// @line` marker of the TypeScript reference into a probe call and running it in goja |
| V07 | the counters respect the complexity claims of the front matter: an exact count (for example the comparisons of merge sort) is met exactly, and an asymptotic claim is checked by the fit of 09.7 over the sizes of the presets and the random inputs |
| V08 | the budgets of 10.8.3 hold |
| V09 | each phase has a note; notes are at most 140 characters; every state used is in the vocabulary; the text view renders each step |
| V10 | the presets are valid under the contract schema and the limits of the scene, and there are at least 3 |
| V11 | the filmstrip and the social image render |
| V12 | each control of an explorable has a label and a range, and each value of the range draws without error |
| V13 | the scene uses only the primitives of `@algo/viz` (no drawing code of its own) |

V06 is the check that matters most. It is what makes a scene a picture of the real code and not a cartoon of it.

### 10.8.3 Performance budgets

| Budget | Value |
|---|---|
| `@algo/viz` runtime, gzip | at most 60 KB, loaded once and cached for the whole site |
| one scene bundle, gzip | at most 15 KB |
| steps on any preset | at most 20,000; the player refuses a custom input that would pass this, and says why |
| trace of the default preset | at most 50 ms in goja on the build server, which the build takes as a stand-in for a mid-range phone |
| playback | 60 frames per second; SVG up to 600 elements, Canvas 2D above that (for example a sort of 2,000 bars or a graph of 1,000 nodes), chosen by the runtime |
| first draw | at most 100 ms after the scene loads; the scripts load only when the player scrolls into view |
| layout shift | none: the page reserves the height of the player from the filmstrip |

## 10.9 The visualization ladder V0–V3

The build computes one level for each node, from its scene or explorable and its checks.

| Level | It needs |
|---|---|
| V0 | no scene, no explorable and no figure |
| V1 | static figures in `figures/`, or a scene whose frames render (V11) but that fails a check needed for V2 |
| V2 | an interactive scene that passes V01 to V11 and V13, with step back, custom input, at least 3 presets, code sync in the pseudocode panel and in each tier-1 language that has markers, the text view and narration for each phase; or, for a concept, model or theorem, an explorable that passes V08, V09, V11 and V12 |
| V3 | V2, and a person who is not the author reviewed the scene for clarity and accessibility, with the checklist of 13.4, for this exact hash of `scene.ts` (or `explorable.ts`) and `presets.yaml` |

Which nodes need which level:

| Kind | Needs, for a node of the core |
|---|---|
| `algorithm`, `data-structure` | V2 (and V3 for "complete", 04.8) |
| `problem`, `abstract-type` | V1: a figure of an input and its output; a scene is optional |
| `technique` | V1; the examples it links have their own scenes |
| `concept`, `model`, `theorem` | optional; the list of 10.6 is the first target |
| `area`, `exercise`, `person` | none |

## 10.10 Authoring

The steps for a person or the visualizer agent (12.2):

1. `algo new viz <slug>` writes `viz/scene.ts` and `viz/presets.yaml`. It picks the main primitive from the input type of the contract (a list gives `array`, a graph gives `graph`, a string gives `str`) and writes one `v.line` call for each pseudocode line id, as a skeleton.
2. Copy the steps of the TypeScript reference into `run`, and add the events. Keep the structure of the reference, so that V06 passes.
3. `algo viz serve <slug>` opens the player on a local server with reload on save, and a trace inspector: a table of the steps, their events, vars and counters.
4. `algo viz check <slug>` runs the checks of 10.8.2. `algo viz frames <slug>` shows the filmstrip.
5. Open a pull request. The check prints the level before and after.

## 10.11 A full example: the scene of merge sort

The pseudocode of the page `merge-sort`:

```
MERGE-SORT(a, lo, hi)
L1  if hi − lo ≤ 1 then return
L2  mid ← lo + ⌊(hi − lo) / 2⌋
L3  MERGE-SORT(a, lo, mid)
L4  MERGE-SORT(a, mid, hi)
L5  MERGE(a, lo, mid, hi)

MERGE(a, lo, mid, hi)
L6  copy a[lo..hi) into aux[lo..hi)
L7  i ← lo; j ← mid
L8  for k ← lo to hi − 1
L9      if i < mid and (j ≥ hi or aux[i] ≤ aux[j])
L10         a[k] ← aux[i]; i ← i + 1
L11     else a[k] ← aux[j]; j ← j + 1
```

`viz/scene.ts`:

```ts
// SPDX-License-Identifier: MIT
// Part of https://algorithm.tamnd.com/merge-sort/. The authors are listed in prov/4MRG7S.jsonl.
import { scene, type Viz, type VArray } from "@algo/viz";

export default scene({
  slug: "merge-sort",
  input: { type: "list<int>", length: [0, 32], values: [-99, 99] },
  run(v: Viz, input: number[]): number[] {
    const a = v.array("a", input, { view: "bars", label: "a" });
    const aux = v.array("aux", input.map(() => null), { view: "cells", label: "aux" });
    const calls = v.callstack("calls");
    v.phase("Split and merge");
    sort(v, a, aux, calls, 0, input.length);
    a.mark([0, input.length], "visited");
    v.note("The whole list is sorted.");
    return a.values();
  },
});

function sort(v: Viz, a: VArray, aux: VArray, calls: any, lo: number, hi: number): void {
  calls.push(`MERGE-SORT(${lo}, ${hi})`);
  v.line("L1", `Sort a[${lo}..${hi - 1}].`);
  v.vars({ lo, hi });
  if (hi - lo <= 1) {
    a.mark([lo, hi], "invariant");
    v.note(hi - lo === 1 ? "One element is already sorted." : "Nothing to sort.");
    calls.pop();
    return;
  }
  const mid = lo + Math.floor((hi - lo) / 2);
  v.line("L2", `Split at ${mid}.`);
  v.vars({ lo, mid, hi });
  a.bracket(lo, mid, hi);
  v.line("L3", `Sort the left half a[${lo}..${mid - 1}].`);
  sort(v, a, aux, calls, lo, mid);
  v.line("L4", `Sort the right half a[${mid}..${hi - 1}].`);
  sort(v, a, aux, calls, mid, hi);
  v.line("L5", `Both halves are sorted. Merge them.`);
  merge(v, a, aux, lo, mid, hi);
  calls.pop();
}

function merge(v: Viz, a: VArray, aux: VArray, lo: number, mid: number, hi: number): void {
  v.phase(`Merge ${lo}–${mid - 1} with ${mid}–${hi - 1}`);
  v.line("L6", "Copy the range into aux.");
  for (let k = lo; k < hi; k++) aux.copyFrom(a, k, k);
  v.line("L7");
  let i = lo;
  let j = mid;
  aux.ptr("i", i);
  aux.ptr("j", j);
  for (let k = lo; k < hi; k++) {
    v.line("L8");
    v.vars({ lo, mid, hi, i, j, k });
    a.ptr("k", k);
    v.line("L9");
    let takeLeft: boolean;
    if (i >= mid) takeLeft = false;
    else if (j >= hi) takeLeft = true;
    else {
      v.count("compare");
      takeLeft = aux.compare(i, j) <= 0;   // emits a compare event with the result
    }
    if (takeLeft) {
      v.line("L10", `aux[${i}] is not larger, so take it. Equal keys keep their order.`);
      a.set(k, aux.get(i), { from: ["aux", i] });
      i++;
      aux.ptr("i", i);
    } else {
      v.line("L11", `aux[${j}] is smaller, so take it.`);
      a.set(k, aux.get(j), { from: ["aux", j] });
      j++;
      aux.ptr("j", j);
    }
    v.count("write");
    a.mark([lo, k + 1], "invariant");
  }
  aux.clear([lo, hi]);
}
```

What the checks do with it:

- V03 runs it on the 5 presets and 50 random lists and compares the result with `algo-oracle merge-sort`, the Lean model of 07.3.
- V06 runs the TypeScript reference `impl/typescript/merge-sort.ts` on the same inputs with its `@line` markers turned into probes, and compares the two sequences of line ids.
- V07 reads the counter `compare` and checks it against the exact bound of the front matter, `n⌈lg n⌉ − 2^⌈lg n⌉ + 1` (04.4), on each input, and checks that the preset "Most comparisons" meets it with equality.
- V09 checks that each of the phases has a note and that the states used (`invariant`, `visited`) are in the vocabulary.
