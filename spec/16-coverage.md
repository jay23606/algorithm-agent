# 16. Coverage: how "no missing" is measured

"All human knowledge about algorithms, no missing" is not a promise anyone can check by reading the site. This document turns it into numbers. The method is the one of math2 and olymmath: a closed list of everything that the sources name (the universe register), an outcome for each item, and levels that say how far each node has got. The coverage report is the work list of the agents (12.4) and the honest answer to "what is missing?".

## 16.1 The universe register

**What it is.** The universe register is the list of every algorithmic item that a source of the source register (11.1) names: each algorithm, data structure, problem, technique, concept, theorem, model and person that a list, an index, a catalogue or a table of contents names. It lives in `registers/universe/`, one JSONL file per source, plus `registers/universe/items.jsonl`, the merged list.

**An inventory row** (written by `algo ingest`, 11.3):

```json
{"source": "nist-dads", "key": "dads/HTML/dijkstraalgo", "name": "Dijkstra's algorithm",
 "kind_hint": "algorithm", "aliases": [], "url": "https://xlinux.nist.gov/dads/HTML/dijkstraalgo.html",
 "context": ["graphs"], "seen": "2026-11-20", "raw": "blake3:9f2c…"}
```

**A universe item** (written by `algo universe merge`, reviewed in a pull request):

```json
{"id": "U-01J9ZK", "name": "Dijkstra's algorithm", "kind": "algorithm",
 "rows": ["nist-dads:dads/HTML/dijkstraalgo", "wikipedia:Dijkstra's_algorithm", "clrs4:22.3",
          "cpalgo:graph/dijkstra", "wikidata:Q8556", "rosetta:Dijkstra's_algorithm"],
 "outcome": "node", "node": "4MRG7S", "decided": "agent:curator@run-2026-11-21-03", "reviewed": "tamnd"}
```

Each item has one **outcome**:

| Outcome | Means | Needs |
|---|---|---|
| `node` | the item is a node | `node: <tag>` |
| `alias` | the item is another name of a node | `node`; the name is added to the node's `aliases` |
| `section` | the item is covered by a section of a node, not a page of its own (a small variant, a named lemma, a trick) | `node` and `anchor`; the section must exist (rule U01) |
| `merged` | two items are the same thing under one node | `node` |
| `disambiguation` | the name means several things | an entry in `registers/disambiguation.yaml` |
| `out-of-scope` | not an algorithmic item under 02.3 (a product, a programming-language feature, a pure mathematics result with no algorithmic content, a company) | `reason`, from a fixed list |
| `not-an-item` | noise from the harvest: a list heading, a stub, a broken row | `reason` |
| `pending` | no decision yet | nothing; it counts as a gap |

Items are never deleted. An item whose rows all disappear from their sources is kept with `gone: <date>`.

**The sources of the universe.** Each source has a type of list that `algo ingest` can read. The counts are estimates from 01 and are measured at M0.

| Source | What it lists | Items (estimate) | Licence class (17.2) |
|---|---|---|---|
| Wikidata | items that are instances or subclasses of algorithm (Q8366), data structure (Q175263), computational problem (Q1331926) and their subclasses, with labels in many languages | 6,000–9,000 | A (CC0) |
| Wikipedia | "List of algorithms", "List of data structures", the lists of each area, and the categories under "Category:Algorithms" and "Category:Data structures" to depth 4 | 5,000–7,000 | B (CC BY-SA) |
| NIST DADS | the Dictionary of Algorithms and Data Structures, about 1,600 terms | 1,600 | D (names and facts only) |
| CLRS 4th ed. | the table of contents and the index | 1,500 | D |
| Sedgewick–Wayne 4th ed. and its site | the contents, the algorithm list | 400 | D |
| Kleinberg–Tardos, Dasgupta–Papadimitriou–Vazirani, Skiena (the catalogue of 75 problems), Erickson (CC BY 4.0) | contents and indexes | 1,800 | D, and C for Erickson |
| Knuth, *The Art of Computer Programming*, vols. 1–4B | the indexes | 3,000 | D |
| *Encyclopedia of Algorithms* (Kao, ed., 2nd ed.) | the entry titles | 600 | D |
| CP-Algorithms | the articles | 300 | B (CC BY-SA 4.0) |
| USACO Guide | the modules | 250 | B |
| Codeforces, AtCoder, LeetCode, Kattis | the problem tags | 150 tags | D |
| Rosetta Code | the task names | 1,300 | D (GFDL 1.2; names only) |
| TheAlgorithms (GitHub) | the file names of its main repositories | 3,000 | C (MIT; names only) |
| Complexity Zoo | the complexity classes | 550 | D |
| Garey–Johnson and the Compendium of NP optimization problems | the problems | 600 | D |
| ACM CCS 2012, MSC2020 | the concepts of 16.4 | 400 | A, D |

After merging, the universe is expected to hold **12,000 to 18,000 items** that reduce to **8,000 to 12,000 nodes** (02.4). Most of the reduction is aliases and merges.

**Is the universe complete?** No list is. Two checks say how close it is:

1. **Saturation.** Each weekly ingest records how many new universe items it creates. When a new source adds under 2% new items with outcome `node`, the universe is close to saturation for the kinds that source lists. The report plots this by source and by area.
2. **Capture–recapture.** For each area, the items that two independent sources list are used to estimate how many items neither lists (the Lincoln–Petersen estimate N ≈ n₁·n₂ / m, with Chapman's correction). This is a rough number with stated assumptions (the sources are not independent), shown with its interval. A large estimate for an area means the area needs another source, not that it needs more pages now.

**The universe page** `/universe/` (14.19) lists every item with its outcome and its sources, so a reader can check that something is there and see why it is not.

## 16.2 Coverage levels

Each universe item with outcome `node` gets a coverage level from the computed ladders of its node (04.8). Nobody writes it.

| Level | Name | Needs |
|---|---|---|
| C0 | registered | a universe item with outcome `node`, `section` or `alias`, and a tag minted for the node |
| C1 | page | the node has a page at W2 or more: all sections of its kind (06.2) present, a summary, the front matter valid, sources cited |
| C2 | proved by hand | H2: a full human proof of each correctness and complexity claim (06.5) |
| C3 | implemented | I2 in every tier-1 language: the code passes the shared cases and the oracle (08.8) |
| C4 | visual | V2: a scene with presets, code sync and narration that passes its checks (10.9) |
| C5 | formal | L2: the Lean spec is reviewed and correctness is proved with no `sorry` (07.8) |
| C6 | complete | the full bar of 00: H3, L3, I3 in all tier-1 languages, I2 in tier 2, V2, W4 |

**Rules of the levels.**

- Levels are cumulative: C3 needs C2, and so on. A node with a Lean proof but no human proof is C1, and the report shows it as "C1, has L2", because the human proof is the part readers read.
- **Kinds that do not have every part** skip the parts they do not have. A definition has no implementation and no proof of its own, so it goes C0, C1, then C6 when it reaches W4 and its Lean definition is bound (L1). A problem's C3 is its contract with shared cases, checker and generators (09.1); its C4 is a scene of an instance. A theorem has no implementation; its C3 is skipped. A person has C0, C1 and C6 (W4). Table `schema/coverage-parts.v1.yaml` lists the parts of each kind.
- **Research-level nodes** (`level: research`) may stop at C2 for their Lean part and tier-2 code with no gap counted, if their page says so and the reason is one of: no practical implementation (galactic algorithms), needs a model the Lean package lacks (quantum before CSLib has one, 07.9), or the proof is a paper of many pages (the reader gets the outline, H1, and the citation). Their "complete" is C6 with these parts marked waived. Rule U02 caps waivers at 15% of the nodes of an area.
- **Sections.** An item with outcome `section` counts as covered at the level of its node, but never above C1 unless the section has its own proof and code.

**Weighted coverage.** The plain percentage of nodes at each level treats an obscure variant like quicksort. The report also gives a weighted percentage, where each node weighs `w = 1 + 2·[core] + log2(1 + in-links) + log2(1 + sources)`, the count of sources being the number of independent universe rows. It is the number the milestones use (19).

## 16.3 The core

**The core** is the set of items that every serious reader expects: the algorithms, data structures, problems, techniques and theorems of the standard courses and the competitive programming canon. It is `topics/core.yaml`, about 1,200 items (estimate; measured at M0).

**Membership rule.** An item is in the core when it is in at least two of these eight references, or an editor adds it with a reason:

| Reference | Why |
|---|---|
| Cormen, Leiserson, Rivest, Stein, *Introduction to Algorithms*, 4th ed. (2022) | the standard text |
| Sedgewick and Wayne, *Algorithms*, 4th ed. (2011) | the practical canon, with code |
| Kleinberg and Tardos, *Algorithm Design* (2005) | design techniques, reductions |
| Erickson, *Algorithms* (2019, CC BY 4.0) | a modern free text with full proofs |
| Dasgupta, Papadimitriou and Vazirani, *Algorithms* (2006) | the short canon |
| Skiena, *The Algorithm Design Manual*, 3rd ed. (2020) | the problem catalogue |
| CP-Algorithms | the competitive canon |
| USACO Guide | the competitive learning path |

The rule is computed by `algo coverage core` from the universe rows of the eight sources. Each row in `topics/core.yaml` carries the sources that put it there:

```yaml
- node: 4MRG7S            # dijkstra
  refs: [clrs4, sw4, kt, erickson, dpv, skiena3, cpalgo, usaco]
- node: 7QH2MB            # link-cut-tree
  refs: [cpalgo]
  added: tamnd
  reason: "standard in competitive programming; needed for dynamic trees"
```

**The core comes first.** The milestones (19) set the core's targets ahead of the rest: every core item at C1 by M2, at C3 by M3, and at C6 by M5. The work queue (12.4) gives core gaps a weight of 3.

**Courses inside the core.** Every node of a course of 05.6 is in the core or is a definition or concept that a core node needs. Rule U03 fails a course that lists a node outside this set.

## 16.4 Crosswalk review

Lists of what sources name catch items. Classifications of the field catch whole areas that no list happens to name. Each top area and sub-area of `topics/areas.yaml` (05.2) maps to the concepts of four classifications, and each concept is reviewed.

| Classification | What is mapped | Size |
|---|---|---|
| ACM CCS 2012 | the concepts under "Theory of computation" (Design and analysis of algorithms, Models of computation, Computational complexity and cryptography, Randomness, geometry and discrete structures, Logic), "Mathematics of computing" (Discrete mathematics, Mathematical analysis → Numerical analysis, Probability), and "Computing methodologies" (Symbolic and algebraic manipulation, Machine learning algorithms) | about 300 concepts |
| MSC2020 | 68Wxx (algorithms), 68Pxx (data structures), 68Qxx (theory of computing), 68Rxx (discrete math in CS), 05C85 (graph algorithms), 11Yxx (computational number theory), 65 (numerical analysis), 90C (mathematical programming), 94A (information and coding), 52B55 and 68U05 (computational geometry) | about 250 codes |
| Wikipedia categories | the category tree under "Algorithms" and "Data structures" to depth 4 | about 1,500 categories |
| NIST DADS | its area index | about 30 areas |

**The review.** For each concept, the crosswalk file `topics/crosswalk/<scheme>.yaml` says one of:

- `area: <id>`: the concept is an area or sub-area of ours;
- `nodes: [<tag>, …]`: the concept is covered by these nodes;
- `out-of-scope: <reason>`;
- `gap: <note>`: we lack it; this makes universe items with outcome `pending`.

```yaml
# topics/crosswalk/acm-ccs-2012.yaml
- id: "10003752.10003809.10003635"
  label: "Theory of computation → Design and analysis of algorithms → Graph algorithms analysis"
  area: graphs
- id: "10003752.10003809.10010170.10010171"
  label: "… → Parallel algorithms → Shared memory algorithms"
  area: parallel/shared-memory
- id: "10003752.10003809.10010055.10010057"
  label: "… → Streaming, sublinear and near linear time algorithms → Sketching and sampling"
  nodes: [count-min-sketch, hyperloglog, reservoir-sampling]
  gap: "no page for the AMS sketch yet"
```

Rule U04 fails the build when a concept in a crosswalk file has no decision. The coverage report has one table per scheme: concepts mapped, concepts with gaps, and the areas with no concept (which may be fine, but are listed).

The review runs once at M0 for all four schemes, then again when a scheme gets a new version.

## 16.5 Reports

`algo coverage report` writes `reports/coverage/` in F3 and the site shows it on `/coverage/`.

| Report | Content |
|---|---|
| `summary.md` | the counts and weighted percentages at each level, overall, for the core, and per top area; the change since the last release |
| `by-area.parquet` | each area × level, plain and weighted |
| `by-kind.md` | each kind × level |
| `by-language.md` | each language: nodes at I1, I2, I3, I4, and the share of the algorithms and data structures at I2 |
| `universe.md` | items by outcome and by source; `pending` items, oldest first; the saturation plot data; the capture–recapture estimates |
| `crosswalk.md` | the four tables of 16.4 |
| `gaps.jsonl` | every gap: the node or item, the missing part, the level it blocks, its weight (16.6) |
| `waivers.md` | every waiver of 16.2 with its reason |
| `regressions.md` | nodes whose level dropped since the last build, and why (a test that started failing, a Lean break, a scene check) |

A sample of the summary:

```
Coverage, build 2027-03-01 (main @ 1e4c0a2)
                         nodes    C1     C2     C3     C4     C5     C6    weighted C6
 all                     9,842   88%    61%    52%    34%    29%    18%       31%
 core                    1,214  100%    97%    91%    80%    74%    58%       63%
 sorting                   212   99%    83%    80%    66%    61%    44%       59%
 graphs                  1,140   92%    66%    55%    38%    31%    19%       33%
 quantum                    96   71%    22%     9%     4%     0%     0%        0%
 universe                14,610 items: node 9,842 · alias 3,107 · section 611 · merged 402 ·
                         out-of-scope 431 · not-an-item 160 · pending 57
```

## 16.6 Gaps and the work queue

A **gap** is a missing part that keeps a node or an item below the level it could reach next. `algo coverage gaps` lists each gap with:

- the target (`node: 4MRG7S` or `item: U-01J9ZK`);
- the part (`page`, `proof:correctness`, `proof:time`, `impl:kotlin`, `scene`, `lean:spec`, `lean:correct`, `lean:cost`, `review:proof`, `review:spec`, `aliases`, `decide-outcome`);
- the level it blocks;
- the weight: the node weight of 16.2 × the level factor (C1 gaps ×4, C2 ×3, C3 ×2, others ×1) × the core factor of 16.3, divided by the estimated cost of the part from the cost table of 12.6;
- the blocker, when the gap cannot be worked yet ("needs the contract of the problem first", "needs CSLib's graph model").

`algo queue` (12.4) turns the gaps into work items in weight order, respecting blockers. Readers see the same list on `/gaps/` with "Help write it" links (14.19). Each "Tell us it is missing" from the search palette (15.3) makes a `pending` universe item with the source `reader`, which a curator decides.

**Gaps that need a person** (review of a proof, of a spec, of an agent's text) are listed separately on `/reviewers/`, because no agent can close them.

## 16.7 Targets

The milestone exit criteria of document 19 use these numbers. They are Defaults.

| Milestone | Universe | Core | All nodes |
|---|---|---|---|
| M0 | all sources of 16.1 ingested; crosswalk review done; `pending` under 10% | the list in `topics/core.yaml` | |
| M1 | `pending` under 3% | 100% C1 in sorting, searching and graphs | |
| M2 | `pending` under 1% | 100% C1; 80% C3 | 60% C1 |
| M3 | saturation under 2% for every source | 100% C3; 70% C5 | 90% C1; 50% C3 |
| M4 | | 90% C6 | 100% C1; 70% C3; 40% C5 |
| M5 | | 100% C6 | 60% C6 (weighted) |

"No missing" at M5 means: every universe item has an outcome other than `pending`, every node is at C1 or more, every core node is complete, and each gap that remains is on `/gaps/` with its weight.

## 16.8 Rules

The coverage checks are audit rules (listed in 13.3):

| Rule | Checks |
|---|---|
| U01 | an item with outcome `section` points to an anchor that exists in its node |
| U02 | waivers of 16.2 are at most 15% of the nodes of an area, and each has a reason from the fixed list |
| U03 | every node of a course is in the core or is a definition or concept that a core node needs |
| U04 | every concept of a crosswalk file has a decision |
| U05 | every universe item with outcome `node`, `alias`, `section` or `merged` points to a tag that exists and is not retired |
| U06 | an alias outcome has its name in the node's `aliases` |
| U07 | `pending` items older than 30 days are listed in the weekly report with their source |
