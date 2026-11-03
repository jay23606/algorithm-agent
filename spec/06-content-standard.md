# 06. The content standard

This document says what a page contains and how its text is written. Document 04 says where the files are and what the front matter holds. Document 07 covers the Lean part, 08 and 09 the code and the tests, and 10 the scene. The audit rules named here are listed in 13.3.

## 6.1 Principles

1. **Intuition, then precision, then evidence.** Each page starts with what the reader can grasp in one minute. Then it gives the exact statement, the pseudocode and the analysis. Then it gives the proofs, the code and the Lean part.
2. **One idea, one page, one order.** Each kind of page has a fixed order of sections (6.3). A reader who has read one algorithm page knows where to look on every other one.
3. **Every claim is checkable.** A complexity claim names its model and variables (6.6). A correctness claim has a proof or is marked as a sketch (6.5). A historical claim has a source (6.7).
4. **Our own words.** The text is written fresh. It cites its sources and never copies them (11.5, rule C01).
5. **Simple English.** Short sentences, common words, active voice. A term is defined or linked the first time a page uses it. In Markdown source, each sentence is on its own line, as in math2 (rule W02).

## 6.2 Markup

The body of `node.md` and of each proof file is Markdown, read by goldmark, with these additions. The `markup` package (03.4) renders them.

| Markup | Form | Renders as |
|---|---|---|
| inline math | `$O(n \log n)$` | KaTeX, rendered at build time, no script on the page |
| display math | `$$ T(n) = 2T(n/2) + n $$` | a centred KaTeX block |
| cross-link | `[[binary-heap]]`, `[[binary-heap|a heap]]`, `[[merge-sort#proof-invariant]]` | a link to the node, or to a part of it; a missing target is red, as in math2 |
| math2 link | `[[m2:7K3QX2|group]]` | a link to the math2 node |
| pseudocode | a fenced block with the info string `pseudo` | numbered, typeset pseudocode (6.4) |
| callout | `> [!pitfall]`, `> [!note]`, `> [!history]`, `> [!warning]` | a tinted box with an icon and a label |
| figure | `![caption](figures/recursion-tree.svg)` | a figure with a caption; the SVG has a text alternative |
| scene embed | `::scene{preset=worst}` | the player of the node's scene with that preset (10.5) |
| spoiler | `<details>` | a closed block, used for exercise hints |

Math notation follows `notation/conventions.yaml`, shared with math2 where it can be. The fixed choices for this site:

- $\lg n$ is $\log_2 n$, and $\log n$ is used only inside $O$, $\Theta$ and $\Omega$, where the base does not matter.
- $[n]$ is $\{1, \dots, n\}$. Arrays in pseudocode are 1-indexed, as in CLRS. Implementations use the index base of their language, and 08.3 says how they map.
- $A[i..j]$ is the subarray from $i$ to $j$, both included. $A[i..j)$ excludes $j$.
- Graphs are $G = (V, E)$ with $n = |V|$ and $m = |E|$. Weights are $w(u, v)$. The distance is $\delta(s, v)$.
- Strings are $T$ (text, length $n$) and $P$ (pattern, length $m$).

## 6.3 The sections of each kind

The headings are fixed `##` headings. `algo new` writes them. `algo fmt` keeps their order. Rule W01 checks the order and the names. A section that does not apply is left out, never left empty. The bold sections are required for W3 (6.8).

### Algorithm

| # | Heading | Holds |
|---|---|---|
| 1 | (lead, no heading) | **one paragraph**: what it does, for which problem, its main bound, and why it matters |
| 2 | In plain words | **the idea without notation**, for a reader who knows only the prerequisites; one picture or scene preset |
| 3 | The problem | **the input and the output**, linked to the problem node; any extra assumption (non-negative weights, distinct keys) |
| 4 | The algorithm | **the pseudocode** (6.4), then a walk through it in prose |
| 5 | Example | **a small worked input**, step by step, with the state after each step; it matches a scene preset |
| 6 | Correctness | **the statement of correctness** and a link to each proof in `proofs/`; the main proof is shown inline, the others are listed (6.5) |
| 7 | Complexity | **each claim of the front matter**, with its model, its case and its proof or derivation (6.6) |
| 8 | Properties | stable, in place, online and the other keys of the kind, each with one line of reason |
| 9 | Variants and improvements | named variants, with links when they have pages; a difference of one line is written here |
| 10 | When to use it | the trade-offs against the other algorithms of the same problem; links to the comparison table |
| 11 | Pitfalls | the common bugs: off-by-one, overflow, the wrong comparison, recursion depth |
| 12 | Implementations | generated: the language tabs (14.4); the text says only what is special |
| 13 | Formal proof | generated from the Lean bindings (07.12): the statements, the level, a link to the module |
| 14 | History | who, when, where first published; how the bound improved over time |
| 15 | Exercises | generated from `exercises`, grouped by difficulty |
| 16 | References | generated from `sources`, plus any note |

### Data structure

Lead; In plain words; **The abstract type** (linked, with the operations it supports); **Representation** (the fields and the invariant that they keep); **Operations** (for each operation: pseudocode, a short walk-through and its cost); Example; **Correctness** (the invariant is kept by each operation, 6.5); **Complexity** (a table of the operations, with worst, amortized or expected cost, and the space); Variants; When to use it; Pitfalls; Implementations; Formal proof; History; Exercises; References.

### Problem

Lead; In plain words; **Definition** (the input, the output and their relation, exactly, in math notation; this text is what the Lean spec must say, 07.7); **Variants** (decision, search, optimization, counting; special cases); Examples; **Known algorithms** (generated: the comparison table of every algorithm that `solves` it, 14.5); **Bounds** (the best known upper bound and the lower bounds, each in a named model, with links to the theorems); Reductions (to and from, with cost); Applications; References. The contract (09.1) is not prose; the page shows its signature and a few cases in a box.

### Abstract type

Lead; In plain words; **Operations** (signatures); **Laws** (the equations that every implementation meets; the Lean laws of 07.9 state them); Implementations (generated: the table of data structures that `implements` it, with the cost of each operation); Lower bounds; References.

### Technique

Lead; In plain words; **When it applies** (the signals in a problem); **The template** (pseudocode with named holes); **Classic examples** (links, simple to hard, each with one line on how the technique fits); Variations (the sub-techniques); Pitfalls; Exercises; References.

### Concept, definition and model

Concept: Lead; In plain words; **The idea**; Examples; Where it is used; References.
Definition: Lead; **Definition** (exact, in math notation); Examples and non-examples; Related definitions; References.
Model: Lead; **The machine** (what a step is, what costs one unit, what the memory is); **What it counts** (time, space, comparisons, probes, I/Os); Relation to other models; Known results in the model; References.

### Theorem

Lead; **Statement** (exact, with its model and hypotheses); In plain words; **Proof** (inline when short, else in `proofs/`); Consequences (which algorithm pages use it); Tightness (an example that shows the bound cannot improve); History; References.

### Exercise and person

An exercise page is a card: the judge, the problem id, the title, the link, the difficulty on the judge, the techniques and algorithms that solve it, and a hint in a spoiler block. It never holds the problem statement of the judge (17.2).

A person page: name, years, one paragraph, the items that they found or named (generated from the edges), and links to a biography (Wikipedia, MacTutor).

## 6.4 Pseudocode

Pseudocode is the shared reference of the page, the scene (10.4) and every implementation (08.3). It is a fenced block with the info string `pseudo` and an id:

````markdown
```pseudo id=main
MERGE-SORT(A, p, r)                         ▷ sort A[p..r]
L1  if p ≥ r then return
L2  q ← ⌊(p + r) / 2⌋
L3  MERGE-SORT(A, p, q)
L4  MERGE-SORT(A, q + 1, r)
L5  MERGE(A, p, q, r)

MERGE(A, p, q, r)
L6  L ← A[p..q];  R ← A[q+1..r]
L7  i ← 1;  j ← 1;  k ← p
L8  while i ≤ |L| and j ≤ |R| do
L9      if L[i] ≤ R[j] then                  ▷ ≤ keeps the sort stable
L10         A[k] ← L[i];  i ← i + 1
L11     else A[k] ← R[j];  j ← j + 1
L12     k ← k + 1
L13 copy the rest of L, then the rest of R, into A[k..r]
```
````

Rules:

- **Line ids are stable.** Each line starts with an id `L<n>`. `algo fmt` gives a new line the next unused number, so inserting a line between L4 and L5 makes it L14, not a renumbering. The site shows the lines numbered 1, 2, 3 in order and keeps the ids as anchors. A deleted id is never used again in the block (rule W03).
- **Markers point at ids.** An implementation marks the line that does the work of a pseudocode line with a comment `@line L9` (08.3). A scene calls `v.line("L9")` (10.4). Rule W03 checks that each marker names an existing id, and rule I11 that each id of the main block has a marker in each tier-1 implementation, unless the id is marked `nomap` (a comment line, for example).
- **The vocabulary is small.** `if … then … else`, `while … do`, `for … to … do`, `for each … in … do`, `repeat … until`, `return`, `←` for assignment, `▷` for a comment, `⌊⌋ ⌈⌉`, `∞`, `nil`, set and sequence notation, and calls in SMALL CAPS (rendered from upper case). No language keywords (`int`, `var`, `def`).
- **One block is `main`.** A page can have more blocks (`id=iterative`, `id=with-heap`) for variants. The `main` block is the one that scenes and markers use unless they name another.
- **Abstraction is allowed when it is named.** A line may say "extract the vertex u with the least d[u] from Q" when Q is a priority queue linked in the text. The cost of each abstract line is stated in the complexity section.

## 6.5 The human proof standard

A human proof is a proof that a student who knows the prerequisites can check line by line, with no step left as "clear". It proves the statement of correctness of the page and each complexity claim of the front matter (rule P02 at H2).

### Proof files

Each proof is a file in `proofs/`. The file name is the id of the proof. Its front matter:

```yaml
---
id: invariant                 # the anchor: merge-sort#proof-invariant
proves: [correctness]         # correctness, time.worst, time.average, space.extra,
                              #   comparisons.worst, property.stable, operation.delete_min, …
method: loop-invariant        # loop-invariant, induction, strong-induction, exchange,
                              #   potential, aggregate, accounting, recurrence,
                              #   adversary, reduction, probabilistic, contradiction
form: full                    # full or sketch
uses: [merge-two-sorted-lists#proof-invariant, master-theorem]
lean: Algo.Sorting.MergeSort.mergeSort_isSort   # the Lean theorem of the same statement, if any
sources:
  - {book: "isbn:9780262046305", locator: "CLRS 4e, Section 2.3.1"}
---
```

A node can have several proofs of the same claim, for example an induction proof and a loop-invariant proof of merge sort, or the recursion-tree and the master-theorem proofs of its running time. The first proof of each claim in `node.md` order is the main one and is shown inline. The others are listed with their method.

### The body of a proof

1. **Statement.** The exact claim, with its hypotheses, repeated even when the page states it above. The reviewer binds the review to it.
2. **Setup.** The notation, the measure of progress, and the lemmas used, each linked.
3. **The proof.** Numbered steps. Each step says what it shows and why.
4. **End.** The sentence that closes the claim, then ∎.

### Methods and what each must contain

| Method | Must state | Example |
|---|---|---|
| loop invariant | the invariant; initialization; maintenance; termination with the measure that decreases; the conclusion at exit | MERGE (L8–L13): "A[p..k−1] holds the k − p least elements of L and R, in sorted order, and L[i], R[j] are the least elements not yet copied" |
| induction | the predicate; the base case; the step, with the induction hypothesis named where it is used | merge sort correct on all arrays of length n, by strong induction on n |
| exchange argument | the greedy choice; a hypothetical optimal solution; the exchange that keeps it optimal; the conclusion by induction on the steps | Kruskal's algorithm, interval scheduling |
| cut or potential argument | the cut property or the potential function Φ; Φ ≥ 0 and Φ₀ = 0, or the shift; the amortized cost of each operation | union–find with union by rank and path compression; dynamic arrays |
| recurrence | the recurrence and why it holds (with floors and ceilings); its solution; the proof of the solution (substitution, recursion tree or a cited theorem with its hypotheses checked) | T(n) = T(⌈n/2⌉) + T(⌊n/2⌋) + n − 1 for merge sort comparisons |
| adversary or information | the model; the adversary or the counting argument; the bound | Ω(n log n) comparisons for sorting: a decision tree with n! leaves has height ≥ lg n! |
| probabilistic | the probability space (the random choices of the algorithm, or the input distribution); the random variables; linearity or the concentration bound used | randomized quicksort makes 2(n + 1)Hₙ − 4n comparisons in expectation, by indicator variables for each pair of keys |
| reduction | the map; that it is computable in the stated cost; both directions of correctness | 3-SAT ≤ₚ CLIQUE |

### Worked shape: Dijkstra's algorithm

The main proof of [[dijkstra]] is a loop invariant on the set S of settled vertices: "for each v ∈ S, d[v] = δ(s, v); for each v ∉ S, d[v] is the length of a shortest path from s to v whose inner vertices are all in S". Maintenance is the step that needs the hypothesis w ≥ 0. The proof must point to that use, and the Pitfalls section links to it: with a negative edge, the step fails, and the page shows the counterexample as a scene preset (`preset=negative-edge`).

### Worked shape: KMP

[[knuth-morris-pratt]] has two proofs. `failure-function` proves that π[q] is the length of the longest proper border of P[1..q], by induction on q, with the lemma "every border of a border is a border". `linear-time` proves at most 2n − m steps of the matching loop by a potential argument: the potential is the current value of q, each mismatch step decreases it, and each match step increases it by 1.

### Sketch and full

- A **sketch** gives the idea and the key step. It is marked `form: sketch`, and the page shows the label "Proof sketch". A sketch gives H1, never H2.
- A **full** proof meets this section. It may cite a theorem of another node or of math2 (the master theorem, Markov's inequality) and must check the theorem's hypotheses.
- A claim from the research literature (Thorup's linear-time SSSP, the Harvey–van der Hoeven bound) may have a **cited proof**: a sketch plus the exact locator of the full proof in a refereed source. This gives H1 and the flag `cited`. The node reaches H2 only with a full proof on the page. The coverage report counts these nodes apart (16.2).

### What a reviewer checks (H3)

The reviewer records a review in `reviews/<tag>/<proof-id>.yaml` with the hash of the proof file (13.2), using the checklist of 13.4. They check:

1. The statement is the claim of the page, with the same hypotheses and the same model.
2. Every step follows. No step uses an unstated hypothesis.
3. Each cited lemma exists, and its hypotheses are checked.
4. The termination measure, the potential or the recurrence is correct, including floors, ceilings and the base cases.
5. For the core, the proof states the same theorem as the Lean theorem named in `lean:` (07.7). When the two differ (the Lean theorem counts comparisons, the proof counts steps), the reviewer says so and the binding is marked `partial`.

A review by the author does not count. A change of the file drops the node to H2 until the next review.

## 6.6 Writing about complexity

- **Name the model.** "In the comparison model, merge sort makes at most $n\lceil \lg n\rceil - 2^{\lceil \lg n\rceil} + 1$ comparisons." "On the word RAM, Dijkstra's algorithm with a binary heap runs in $O((n + m)\log n)$ time." The model is the `model` field, and a claim in another model says it.
- **Name the case.** Worst, average (and over which input distribution), best, amortized (over which sequences), expected (over the algorithm's random choices), or with high probability (with the exponent).
- **Define every variable.** $n$, $m$, $k$, $\sigma$ (alphabet size), $W$ (largest weight), $U$ (universe size), $h$ (output size). Rule E04 checks that each variable in the front matter is in `vars`.
- **Use Θ when both bounds are proved, O when only the upper one is.** A Θ claim needs a proof of the lower bound on some family of inputs (rule P05).
- **Space is extra space** unless the claim says "total". The input is not counted. Recursion stack depth is counted.
- **Give the derivation, then the number.** The Complexity section derives each claim in a few lines and links the proof file. A table at the end of the section repeats the front matter.
- **Constant factors and practice.** When the bound hides a large constant or a slow memory pattern, a short paragraph says so (Fibonacci heaps, Strassen). The benchmark results of 09.7 may be shown as a chart, labelled as measurements, not as proofs.

Rules E01–E03 (listed in 13.3) check the grammar of each claim, that each claim of the front matter appears in the Complexity section, and that the comparison tables use the same strings.

## 6.7 Examples, pitfalls, variants, history and references

**Examples.** Each algorithm has one example small enough to follow by hand: 6 to 10 elements, a graph of 5 to 7 vertices, a pattern of 4 to 6 characters. It shows the state after each step in a table or a figure. The same input is a scene preset with the same name (rule W05), so the reader can replay it.

**Pitfalls.** Each pitfall names the bug, shows the wrong line and the right one, and says which test case catches it. The test case must exist in the cases of the contract (rule W06). Typical pitfalls: `(lo + hi) / 2` overflow in binary search, `<` against `≤` in the merge (breaks stability), a visited mark set on pop instead of push in BFS (duplicates in the queue), the missing path compression in union–find, recursion depth on sorted input in naive quicksort.

**Variants.** A variant is named, cited and compared in one or two sentences. If it has its own pseudocode or analysis, it gets its own node with `variant_of`, and here it is one line with a link.

**History.** Who found it, in which year, in which publication, with a source for each fact. When the attribution is disputed (the "Floyd–Warshall" or "Dijkstra" names, independent discoveries), the section says so and gives each claim with its source. Dates come from the first publication, not from a later textbook.

**References.** The sources from the front matter, rendered with their locators. At most 10 on a page. The first ones are the open sources (Erickson, CP-Algorithms, Open Data Structures, Wikipedia), then the textbooks, then the original papers. Every reference has a locator (a section, a page, a theorem number), not only a title.

**In plain words.** This section uses no symbol that the prerequisites do not define, no formula longer than one term, and at most 150 words. It says what the algorithm does to the input, as if to a friend. For binary search: "Look at the middle of the sorted list. If the target is smaller, it can only be in the left half, so throw the right half away. Repeat. Each look halves what is left, so even a million items need only 20 looks." Rule W04 checks the length and the symbol count.

## 6.8 Writing levels W0–W5

The writing level says how complete the text of a page is. It does not measure truth, which the other ladders do. The build computes it from the sections present, their sizes, and the links. The thresholds are in `schema/levels.v1.yaml`, like the cards of math2.

| Level | Name | Needs (for an algorithm) |
|---|---|---|
| W0 | stub | front matter valid; a name and a summary |
| W1 | outline | the lead; The problem; the pseudocode; complexity claims in the front matter; one source with a locator |
| W2 | basic | W1, and In plain words; Example; Correctness with at least a sketch; Complexity with each claim derived; Properties |
| W3 | standard | W2, and every bold section of 6.3; Pitfalls with at least two items; History with a source; at least three sources; all prerequisites linked; the example matches a scene preset or a figure |
| W4 | complete | W3, and every section of 6.3 that applies; Variants and When to use it; every pitfall covered by a test case; no missing link; at least one exercise for `intro` and `core` nodes |
| W5 | reviewed | W4, and a person who is not the author reviewed the text of this exact hash for clarity and correctness (13.4) |

For the other kinds the same names apply, with the required sections of their list in 6.3:

| Kind | W2 adds | W3 adds | W4 adds |
|---|---|---|---|
| data structure | Representation with the invariant; Operations with pseudocode for each | the Complexity table for all operations; Pitfalls | Variants; When to use it |
| problem | Definition in math notation; Examples | Bounds with models; Known algorithms has at least one row; the contract exists (09.1) | Reductions; Applications; the contract is reviewed (S06) |
| abstract type | Operations; Laws | Implementations has at least one row | Lower bounds |
| technique | When it applies; The template | at least three Classic examples | Variations; Pitfalls; five exercises |
| concept, definition, model | the main section | examples; links | non-examples (definitions); relations (models) |
| theorem | Statement with model; Proof or a link to one | In plain words; Tightness | Consequences; History |

W levels are shown in the "About this page" box (14.4), and each page says what it needs for the next level, as in math2.

## 6.9 Rules this document adds

These rules are listed in 13.3 with their severities.

| Rule | Checks |
|---|---|
| W01 | the section headings of the kind, in order, with no empty section |
| W02 | one sentence per line in Markdown source |
| W03 | pseudocode line ids are stable and unique; every `@line` marker and `v.line` call names an existing id |
| W04 | In plain words: at most 150 words and no undefined symbol |
| W05 | the example of the page matches a scene preset or a figure |
| W06 | each pitfall names a test case that exists |
| P01 | proof front matter is valid; `proves` names claims that exist in the front matter |
| P02 | at H2, each correctness and complexity claim has a full proof |
| P03 | a proof marked `sketch` is shown as a sketch; a full proof has statement, steps and an end |
| P04 | each `uses` of a proof names an existing proof or theorem |
| P05 | a Θ claim has a proof of the lower bound |
| P06 | a proof with `lean:` names an existing theorem (with L01) |
| E01 | each complexity string parses in the grammar of 04.4 |
| E02 | each claim of the front matter appears in the Complexity section |
| E03 | the comparison tables and the front matter agree |
| E04 | each variable of a claim is defined in `vars`, and the model exists |
