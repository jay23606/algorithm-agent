# 05. Taxonomy: how the knowledge is organized

A reader comes to the site with one of four questions:

1. "What is X?": they know the name. Search answers it (document 15).
2. "How do I solve this?": they know the problem, not the algorithm. The problem index answers it (5.3).
3. "What is in this field?": they want a map. The area tree answers it (5.2).
4. "What should I learn next?": they want an order. Paths and courses answer it (5.6).

The taxonomy has one tree and several axes. The tree gives each node one home, a breadcrumb and a directory. The axes give the other ways in.

## 5.1 The principles

- **One primary area for each node.** The primary area gives the directory (04.3), the breadcrumb and the hue of the page. Other areas are secondary and list the node too.
- **Problems are first-class.** Each algorithm solves at least one problem, or it is not an algorithm page. The problem page lists every algorithm that solves it, in one comparison table (14.5).
- **Techniques cut across areas.** Dynamic programming has examples in strings, graphs, sequences and optimization. A technique page links them, and the area pages do not repeat it.
- **Depth is bounded.** The tree has 3 levels: top area, sub-area, node. A fourth level would make the breadcrumb long and the pages thin. A finer split is a facet or a section of the sub-area page.
- **Crosswalks, not adoption.** The tree is our own. Each area maps to the ACM Computing Classification System 2012, to MSC2020 (68W, 68P, 68Q, 68R, 68U, 65, 90, 94A) and to the Wikipedia categories, so that each source can be compared with it (16.4). No outside scheme fits both teaching and reference use, so none is adopted as is.

## 5.2 The area tree

`topics/areas.yaml` defines the tree. Each area is also an `area` node with a page. The first draft has 30 top areas. Each sub-area slug is unique over all nodes.

| Top area | Sub-areas (first draft) | Crosswalk |
|---|---|---|
| `foundations` | models-of-computation, asymptotic-analysis, recurrences, correctness-and-invariants, amortized-analysis, probabilistic-analysis, lower-bounds | CCS F.2, MSC 68W40, 68Q |
| `techniques` | divide-and-conquer, dynamic-programming, greedy, backtracking, branch-and-bound, search-strategies, two-pointers-and-windows, sweep-line, meet-in-the-middle, randomization-techniques, reductions-and-transforms, bit-tricks | CCS "Design and analysis of algorithms" |
| `data-structures` | linear-structures, hashing, search-trees, balanced-trees, heaps, disjoint-sets, range-query-structures, string-structures, spatial-structures, probabilistic-structures, persistent-structures, succinct-structures, external-memory-structures, concurrent-structures | MSC 68P05 |
| `sorting` | comparison-sorts, distribution-sorts, selection-and-order-statistics, sorting-networks, external-sorting, parallel-sorting | MSC 68P10 |
| `searching` | sequential-and-binary-search, search-on-answers, hashing-search, fractional-cascading, similarity-search | MSC 68P10 |
| `sequences` | prefix-sums-and-differences, subarray-problems, subsequence-problems, inversions-and-permutations, interval-problems | |
| `graphs` | graph-representation, traversal, shortest-paths, spanning-trees, connectivity, flows-and-cuts, matching, coloring-and-cliques, paths-and-cycles, tree-algorithms, planar-graphs, dynamic-graphs, graph-isomorphism, network-analysis | MSC 05C85, 68R10 |
| `strings` | exact-matching, multiple-pattern-matching, suffix-structures, approximate-matching, palindromes, string-hashing, string-combinatorics | MSC 68W32 |
| `automata-and-parsing` | finite-automata, regular-expressions, context-free-parsing, parser-generators, term-rewriting | MSC 68Q45 |
| `number-theory` | divisibility-and-gcd, modular-arithmetic, primality, factorization, sieves, discrete-logarithm, lattice-reduction | MSC 11Y |
| `algebra` | integer-arithmetic, polynomial-arithmetic, fast-transforms, matrix-multiplication, exact-linear-algebra, computer-algebra | MSC 68W30 |
| `numerical` | floating-point, root-finding, linear-systems, eigenproblems, interpolation-and-approximation, quadrature, differential-equations, random-number-generation | MSC 65 |
| `geometry` | convex-hulls, intersections, triangulations, voronoi-and-delaunay, point-location, range-searching, proximity, polygons, geometric-optimization | MSC 68U05 |
| `combinatorics` | generating-permutations, generating-combinations, generating-partitions-and-trees, gray-codes, counting-algorithms, exhaustive-search | TAOCP 4A–4B |
| `optimization` | linear-programming, integer-programming, convex-optimization, gradient-methods, combinatorial-optimization, metaheuristics, multi-objective | MSC 90 |
| `logic-and-constraints` | sat-solving, smt, constraint-satisfaction, binary-decision-diagrams, unification-and-resolution, model-checking | MSC 68V, 03B35 |
| `randomized` | sampling, shuffling, random-hashing, monte-carlo-and-las-vegas, markov-chain-monte-carlo, derandomization | MSC 68W20 |
| `approximation` | covering-and-packing, scheduling-approximation, tsp-approximation, lp-rounding, approximation-schemes, hardness-of-approximation | MSC 68W25 |
| `online-and-streaming` | paging-and-caching-online, online-scheduling, competitive-analysis, streaming-sketches, sliding-windows | MSC 68W27 |
| `parallel` | work-span-models, parallel-primitives, parallel-graph-algorithms, gpu-algorithms, mapreduce-and-bsp | MSC 68W10 |
| `distributed` | consensus, leader-election, clocks-and-ordering, replication-and-crdts, distributed-graph-algorithms, byzantine-agreement, gossip | MSC 68W15 |
| `concurrency` | mutual-exclusion, lock-free-structures, memory-reclamation, transactional-memory | MSC 68Q85 |
| `cryptography` | symmetric-ciphers, hash-functions, public-key, signatures, key-exchange, post-quantum, protocols | MSC 94A60 |
| `compression-and-coding` | entropy-coding, dictionary-compression, transforms-for-compression, error-correcting-codes, checksums | MSC 94A, 94B |
| `machine-learning` | supervised-learning, clustering, dimensionality-reduction, neural-network-training, probabilistic-inference, reinforcement-learning | MSC 68T05 |
| `systems` | caching-policies, scheduling, memory-allocation, garbage-collection, database-algorithms, networking-algorithms, load-balancing-and-hashing, rate-limiting | |
| `biology` | sequence-alignment, genome-assembly, phylogenetics, structure-prediction | MSC 92D20 |
| `graphics-and-signals` | rasterization, curves-and-surfaces, visibility, ray-tracing, image-processing, signal-processing | MSC 68U10, 94A12 |
| `games-and-search` | game-tree-search, heuristic-search, planning, puzzles | MSC 68T20, 91A |
| `quantum` | quantum-primitives, quantum-search, quantum-number-theory, quantum-simulation | MSC 68Q12, 81P68 |
| `complexity` | complexity-classes, np-completeness, reductions-catalogue, parameterized-complexity, fine-grained-complexity, communication-and-query-complexity, computability | MSC 68Q |

Rules:

- A top area or sub-area is a change to `topics/areas.yaml` in its own pull request, with a note on what it holds and what it does not.
- A sub-area with more than 150 nodes splits, and one with fewer than 5 nodes after M3 merges into a neighbour (rule X04 reports both).
- The tree is reviewed against the crosswalks at each release: each CCS concept of "Theory of computation" and "Mathematics of computing" that names algorithms must map to some area (16.4).

## 5.3 The problem index

The problem index is the "how do I solve this" entrance. It is the list of `problem` and `abstract-type` nodes, grouped by area, each with a one-line description in plain words and the best known bounds:

```
Graphs › Shortest paths
  Single-source shortest paths, non-negative weights   O(m + n log n)   Dijkstra (Fibonacci heap), …
  Single-source shortest paths, any weights            O(mn)           Bellman–Ford, SPFA, …
  All-pairs shortest paths                             O(n³)           Floyd–Warshall, Johnson, …
  Shortest path on a DAG                               O(m + n)        topological order DP
  k shortest paths                                     O(m + n log n + k)  Eppstein, Yen, …
```

Each problem node also has `constraints` keys that the "I need to…" search (15.4) filters on: `weighted`, `negative_weights`, `directed`, `dynamic`, `online`, `exact`, `approximate`, `n_max` (the input size that the best algorithm handles in about one second, as a rough guide), and so on. The model of Skiena's problem catalogue is followed, but the text, the grouping and the bounds are our own.

## 5.4 The technique axis

Each `technique` node has:

- the idea in plain words, and when it applies (the signals in a problem statement);
- the template: pseudocode with holes;
- the classic examples, as links to algorithm pages, ordered from simple to hard;
- the common mistakes;
- linked exercises, by difficulty (11.4).

Sub-techniques are technique nodes with `variant_of`: dynamic programming has `dp-on-subsets`, `dp-on-trees`, `digit-dp`, `dp-with-bitmasks`, `knuth-optimization`, `convex-hull-trick`, `divide-and-conquer-dp`. They live in `techniques/dynamic-programming/`.

## 5.5 Facets

Every list page (area, problem, technique, search results, "every node") can filter and sort on these facets. They come from the front matter and the build, never from a separate index.

| Facet | Values | From |
|---|---|---|
| kind | the 12 kinds | `kind` |
| area | the tree | `area`, `areas` |
| problem | problem slugs | `solves` |
| technique | technique slugs | `techniques` |
| model | model slugs | `model` |
| time class | O(1), O(log n), O(n), O(n log n), O(n²), O(n³), polynomial, quasi-polynomial, exponential, pseudo-polynomial | the parsed `complexity.time.worst`, bucketed by the leading term in the main variable (E04) |
| properties | the fixed keys of the kind, for example stable, in place | `properties` |
| level | intro, core, advanced, research | `level` |
| languages | the languages with I1 or better | build |
| evidence | Lean proved (L2+), cost proved (L3+), reviewed proof (H3), visual (V2+), complete | build |
| era | decade of `history.year` | `history` |
| people | person slugs | `history.people` |
| judge | LeetCode, Codeforces, CSES, … | exercises |

`level` is an editorial field. `intro` is taught in a first course (binary search, merge sort, BFS). `core` is in a standard algorithms course or the CLRS canon (Dijkstra, red–black trees, max flow). `advanced` is in graduate courses and competitive programming at the top level (link-cut trees, suffix automata, min-cost flow). `research` is recent or specialized (Thorup's SSSP, the Harvey–van der Hoeven multiplication). The rule X05 samples the levels for review.

## 5.6 Prerequisites, paths and courses

- **Prerequisites.** `prereqs` edges form a DAG (rule G01). Each page shows a "Read first" strip of its direct prerequisites and a full reading path on request, as in math2's reading path (14.4). A node of the core must have a path back to the `foundations` area (rule G06).
- **Paths.** A path is the topological order of the prerequisites of one target node. The site computes it.
- **Courses.** A course is a curated, ordered list of nodes with section headings, in `topics/courses/<slug>.yaml`. The first courses:

| Course | Basis | Size (estimate) |
|---|---|---|
| Algorithms I and II | the order of a standard two-semester course (CLRS and Kleinberg–Tardos as cross-checks) | 250 nodes |
| Data structures | a standard data structures course | 120 nodes |
| Competitive programming | the module order of the USACO Guide, Bronze to Advanced, and the CSES problem set sections | 300 nodes |
| Interview essentials | the patterns of the common interview lists (two pointers, sliding window, BFS, DP, …) | 80 nodes |
| Theory of computation | automata, computability, complexity | 120 nodes |
| Algorithms in Lean | the nodes with L3, in an order for learning to read and write the proofs | 60 nodes |

A course page shows progress (stored in the reader's browser only), and each node page in a course shows a step strip with the previous and the next node, as in math2.

## 5.7 Names and disambiguation

- One English `name`. When two items share a name (the "Hungarian algorithm" for assignment, "heap" the data structure and "heap" the memory region), each gets a qualified slug (`heap-data-structure`, `heap-memory`) and the bare name becomes a disambiguation entry in `registers/disambiguation.yaml`. Search shows both with their kind and area.
- Eponyms follow the common form with an en dash: Bellman–Ford, Knuth–Morris–Pratt, Edmonds–Karp. Slugs drop accents and use hyphens: `bellman-ford`, `knuth-morris-pratt`.
- Abbreviations are aliases (`kmp`, `bfs`, `lca`, `fft`), and a search for one goes straight to its page when it is unique.
