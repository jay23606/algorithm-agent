# 02. The goal

## 2.1 One sentence

**algorithm is the complete, organized and checked body of knowledge about algorithms: each concept, definition, problem, algorithm, data structure, technique, model of computation and theorem, each with clear human text, a full human proof, a Lean proof of correctness and cost, tested implementations in every popular language and a visualization that explains it, published as a fast, searchable website at https://algorithm.tamnd.com and as open data.**

## 2.2 What counts as knowledge about algorithms

An item is in scope when it is one of these:

1. **An algorithm.** A finite, precise method that solves a computational problem. This includes the classical canon (sorting, searching, graphs, strings, number theory, geometry, optimization), numerical methods, randomized, approximation, online, parallel, distributed, external-memory, streaming, cryptographic, compression, learning and quantum algorithms. A named variant (bottom-up merge sort, Dijkstra with a Fibonacci heap) is an algorithm with a `variant_of` edge.
2. **A data structure or an abstract data type.** The abstract type says what the operations do (priority queue, dictionary, union–find). The data structure says how (binary heap, red–black tree, disjoint-set forest).
3. **A computational problem.** Input, output and the relation between them: sorting, single-source shortest paths, longest common subsequence, maximum flow, 3-SAT. Decision, search, optimization, counting and enumeration problems all count.
4. **A technique or paradigm.** Divide and conquer, dynamic programming, greedy, backtracking, branch and bound, two pointers, sweep line, meet in the middle, randomization, amortization.
5. **A model of computation or cost.** The RAM, the word RAM, the comparison model, the cell-probe model, the PRAM, the external-memory model, the streaming model, query complexity, the Turing machine. Every complexity claim on the site names its model.
6. **A concept, a definition or a theorem of algorithm analysis and complexity.** Asymptotic notation, loop invariants, recurrences and the master theorem, amortized analysis, lower bounds (Ω(n log n) for comparison sorting), reductions, NP-completeness, approximation hardness, max-flow min-cut, the complexity classes that algorithms live in.
7. **History and people,** as far as they explain an item: who found it, when, and in which paper or book. A person has a small page with links to their items.
8. **Exercises.** Practice problems on public judges (LeetCode, Codeforces, CSES, Kattis, AtCoder, SPOJ, UVa, USACO) are linked from the techniques and algorithms that solve them. They are links with metadata, not copies (11.4).

Out of scope:

- Pure mathematics with no algorithmic content. It belongs to math2, and the site links to the math2 node (2.7).
- Software engineering, frameworks, APIs and system design for their own sake. A systems algorithm (LRU caching, consistent hashing, Raft, two-phase commit, B-tree indexes, join algorithms) is in scope. A guide to a framework is not.
- Full textbooks and the text of other sites. The site writes its own text and links to the rest (document 17).
- Solutions to contest problems, problem by problem. A contest problem is linked as an exercise of an algorithm. Its solution is not published here.

## 2.3 The quality promise

1. **Correct before complete.** No page claims a result that its evidence does not support. Each claim of complexity names its model and its variables. Each proof is complete or is marked as a sketch.
2. **Proved twice.** Each algorithm of the core (16.3) has a human proof that a student can follow and a Lean proof that the kernel checks. The two prove the same statement, and a person checks that they do (07.7).
3. **Tested everywhere.** Each implementation passes the shared cases of its problem, random tests against the proved oracle and a mutation score threshold (document 09). The tests run on each change, in the pinned toolchain of each language.
4. **Explained.** Each algorithm of the core has a visualization in which the reader can step forward and back, change the input and see the code line that runs (document 10).
5. **One idea, one page.** An algorithm known under 5 names is one page with 5 aliases. Search finds it under each name.
6. **Traced and labelled.** Each page names its sources. Each file names its author, a person or an agent run. A page shows what an agent wrote and nobody checked yet.
7. **Complete and honest about gaps.** The coverage report (document 16) shows each item of the universe that has no page, and each page that misses a proof, a language or a visualization.

## 2.4 The reference scale

From the research (01.2 and 01.8). Each number is an estimate until M1 measures it.

| Part | Estimated distinct items | Basis |
|---|---|---|
| algorithms, with named variants | 3,000–5,000 | Wikipedia's list of algorithms (~700), NIST DADS (~1,700 entries of all kinds), TAOCP (~400 numbered algorithms), the CP-Algorithms index (~170 articles), Wikidata items that are an instance of "algorithm" (~3,000–4,000), after dedup |
| data structures and abstract types | 800–1,200 | Wikipedia's list of data structures (~350), DADS, Open Data Structures, the literature on succinct and persistent structures |
| problems | 800–1,500 | Skiena's catalogue (75 problem families, ~300 problems), Garey and Johnson (~300 NP-complete problems), the complexity zoo of problems, the DADS problem entries |
| concepts, definitions, models and theorems | 2,000–3,000 | the indices of CLRS, Kleinberg–Tardos, Erickson, Sipser and Arora–Barak (names only, 11.3) |
| techniques | 100–200 | the paradigms and the competitive programming techniques of the USACO Guide and CP-Algorithms |
| people | 500–1,000 | the inventors named by the pages above |
| **total nodes** | **~8,000–12,000** | planned at 50,000 for capacity |
| implementations | ~1,200 core items × 23 languages ≈ 28,000, plus the long tail in tier 1 | document 08 |

The **core** (16.3) is the set of about 1,200 items that standard courses and references teach: the union of CLRS, Sedgewick–Wayne, Kleinberg–Tardos, Erickson, Dasgupta–Papadimitriou–Vazirani, Skiena, CP-Algorithms and the USACO Guide. The core gets every kind of evidence. The long tail gets text, sources, a human proof where one exists in the literature, and tier-1 implementations.

## 2.5 Who it is for

- **Students**: learn an algorithm from intuition to proof, step through it, read it in the language of the course, and follow a path of prerequisites (14.6).
- **Teachers**: link a page, project a visualization, take the exercises, and trust the proofs.
- **Engineers**: find the right algorithm for a problem by its constraints (15.4), compare the options in one table, and copy a tested implementation under a permissive licence.
- **Competitive programmers and interview candidates**: browse by technique, practice with linked judge problems, and read short, fast implementations.
- **Researchers and formalizers**: a list of algorithms without Lean proofs, ranked by value; clean, licence-split data; specs that other projects can reuse.
- **AI systems**: Markdown and JSON copies of each page, `llms.txt`, an MCP server, and test suites that check generated code against proved oracles.

## 2.6 Non-goals

- algorithm is not a judge. It links to judges for practice (11.4). It runs tests in CI, not on behalf of readers.
- algorithm is not a package library. The code is for reading, learning and copying. Each implementation has no dependency outside the standard library of its language (08.4). A production library is out of scope.
- algorithm does not chase speed records. An implementation is clear first and then efficient within its stated bound. A tuned variant is a separate implementation with the label `optimized` (08.6).
- algorithm does not keep secret benchmarks. Its tests are public.
- algorithm is not a forum. Discussion happens in GitHub issues and pull requests.

## 2.7 Relation to other tamnd projects

- **math2**: a mathematical definition or theorem that an algorithm page needs (graph, matrix, prime, the pigeonhole principle) is a math2 node. The algorithm node has a `same_as.math2` link or a `uses_math` edge to it, and it does not copy the text. The two projects share the Lean and Mathlib pin, the tag alphabet, the KaTeX renderer and the style of the site.
- **olymmath**: an olympiad problem with an algorithmic solution can link to the technique that solves it.
- **The \*-cli tools**: each source adapter (document 11) imports the CLI library of its site, for example `cpalgorithms-cli`, `rosettacode-cli`, `visualgo-cli`, `algorithmvisualizer-cli`, `opendatastructures-cli`, `usacoguide-cli`, `wikipedia-cli`, `wikidata-cli`, `leetcode-cli`, `codeforces-cli`, `cses-cli`, `kattis-cli`, `atcoder-cli` and `dblp-cli`.
- **taocp and taocp-solver**: the TAOCP corpus gives the list of Knuth's numbered algorithms for the universe register (names and locators only, 11.3).
