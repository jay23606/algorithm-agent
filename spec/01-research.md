# 01. Research: the state of the field, November 2026

This document is the evidence for the design. Each section ends with what it means for algorithm. A number marked "estimate" is to be measured in M0–M1 (document 19). The research was done on 2026-11-03.

## 1.1 What exists, in one paragraph

The knowledge about algorithms is spread over a few great textbooks under copyright, a few open books, Wikipedia, a handful of open reference sites (CP-Algorithms, the USACO Guide, OI Wiki, NIST DADS), large code collections (TheAlgorithms, Rosetta Code), visualization sites (VisuAlgo, Algorithm Visualizer, the USFCA visualizations) and formal libraries (CSLib and Mathlib in Lean, the Isabelle AFP, Rocq's Verified Functional Algorithms). No one place has all of: one page per idea, a full proof, a machine-checked proof, tested code in many languages and an interactive picture. Each source has one or two of these. The gap is the joining, the checking and the completeness.

## 1.2 Reference books

| Work | Edition, year | Licence | Scale (estimate) | Use here |
|---|---|---|---|---|
| Cormen, Leiserson, Rivest, Stein, *Introduction to Algorithms* (CLRS) | 4th, 2022 | all rights reserved | 35 chapters, about 200 named algorithms and data structures | names and locators for the universe and the core (11.3); cited as a source |
| Knuth, *The Art of Computer Programming* | Vol. 1–3, 4A (2011), 4B (2022), fascicles of 4C | all rights reserved | about 400 numbered algorithms ("Algorithm 5.2.4M") | names and locators; history |
| Sedgewick and Wayne, *Algorithms* | 4th, 2011 | all rights reserved | about 150 algorithms | names and locators |
| Kleinberg and Tardos, *Algorithm Design* | 2005 | all rights reserved | design techniques, flows, NP-completeness | names and locators |
| Dasgupta, Papadimitriou, Vazirani, *Algorithms* | 2006 | all rights reserved | short and proof-centred | names and locators |
| Skiena, *The Algorithm Design Manual* | 3rd, 2020 | all rights reserved | a catalogue of 75 problem families | the model of the problem index (05.3) |
| Erickson, *Algorithms* | 1st, 2019 | CC BY 4.0 | 12 chapters and many notes | adaptable with attribution (17.2) |
| Morin, *Open Data Structures* | 2013 and later | CC BY 2.5 | about 30 structures with code | adaptable with attribution |
| Nipkow et al., *Functional Data Structures and Algorithms: A Proof Assistant Approach* | 2025 | book under copyright; the Isabelle theories are open in the AFP | verified sorting, search trees, heaps, tries, amortized analysis | the model of the formal standard (07); the theories are cited |
| Okasaki, *Purely Functional Data Structures* | 1998 | all rights reserved | persistent structures and amortization | names and locators |
| Garey and Johnson, *Computers and Intractability* | 1979 | all rights reserved | about 300 NP-complete problems | names and locators for `complexity` |
| Williamson and Shmoys, *The Design of Approximation Algorithms* | 2011 | free electronic copy, all rights reserved | approximation | names and locators |
| Sipser; Arora and Barak | 3rd, 2012; 2009 | all rights reserved | theory of computation and complexity | names and locators |

**What it means.** The canon is defined by books that cannot be copied. Their tables of contents and indices are facts that we can list with locators, and that is enough to define the universe and the core (16.3). The text must be our own. Two good open books (Erickson, Morin) can be adapted, but the default is still to write fresh and cite (17.2).

## 1.3 Reference sites and code collections

| Source | Licence | Scale (estimate) | Strength | Use here |
|---|---|---|---|---|
| Wikipedia, "List of algorithms" and "List of data structures" | CC BY-SA 4.0 | about 700 and 350 entries; the category tree under "Algorithms" has thousands of articles | breadth, names, history | universe items, aliases, history; adaptable with attribution |
| Wikidata | CC0 1.0 | 3,000–4,000 items that are an instance or a subclass of algorithm (Q8366) or data structure (Q175263) | identifiers that join other sources | the join key of the inventory (11.3) |
| NIST Dictionary of Algorithms and Data Structures (DADS) | a work of the US government, with some entries by outside authors | about 1,700 terms of all kinds | definitions and short notes | universe items; links |
| CP-Algorithms (translation of e-maxx.ru) | CC BY-SA 4.0 | about 170 articles | competitive programming depth, with proofs | universe items, locators, adaptable with attribution |
| OI Wiki | CC BY-SA 4.0 with extra terms | about 500 pages, in Chinese | the widest competitive programming wiki | universe items, aliases in Chinese |
| USACO Guide | open source; text licence to confirm | about 200 modules, Bronze to Advanced | a well-tested learning order | the order of the competitive programming course (05.6) |
| TheAlgorithms (GitHub organization) | MIT | thousands of files per language repository; the Python repository is one of the most starred on GitHub | breadth of code | universe items; not a code source (quality varies, and our code is written fresh) |
| Rosetta Code | GFDL 1.2 only, with no "later version" clause, so it cannot move to CC BY-SA | about 1,300 tasks in hundreds of languages | breadth of languages | names of tasks; link only (17.2) |
| GeeksforGeeks, Programiz, Brilliant and similar | all rights reserved | large | popular explanations | link only, not in the universe by default |
| Complexity Zoo | wiki | about 550 complexity classes | the reference of classes | universe items for `complexity` |
| KACTL and other team notebooks | various, often CC0 | about 100 compact implementations | the competitive programming canon | universe items |
| Judges: LeetCode, Codeforces, CSES, Kattis, AtCoder, SPOJ, UVa, USACO, Timus, DMOJ | terms of each site | from about 300 (CSES) to over 10,000 problems per judge | practice | exercises, as links with metadata (11.4) |

**What it means.** The sources overlap a lot, and the overlap is how we find each item (11.3). Wikidata joins them. No code source is clean or licensed well enough to copy, so every implementation is written fresh and tested against a proved oracle. That rule also keeps the code uniform.

## 1.4 Formal verification of algorithms

| Work | State in November 2026 | What it means for us |
|---|---|---|
| **Lean 4 and Mathlib** | math2 pins Lean v4.35.0 and Mathlib v4.35.0. Core Lean has a verified `List.mergeSort` with theorems on sortedness, stability and permutation. Batteries and Mathlib have lists, arrays, red–black maps, binary heaps, `Nat.gcd` and graph theory (`SimpleGraph`), but little on cost. | We build on Mathlib for the mathematics and on core Lean for the data types. |
| **CSLib, the Lean Computer Science Library** (leanprover/cslib; white paper arXiv:2602.04846, February 2026, by Barrett, Chaudhuri, Montesi, Grundy, Kohli, de Moura, Rademaker and Yingchareonthawornchai) | It aims to be for computer science what Mathlib is for mathematics. It has a `TimeM` monad that counts ticks, a verified mergesort with correctness and an O(n log n) bound, and results in models of computation and in distributed computing. Its roadmap puts "many undergraduate algorithms and data structures" at the end of 2026 and complexity, concurrency, randomized and quantum algorithms in 2027. | We use `TimeM` as the cost model (07.4), so that our proofs compose with CSLib's. We upstream general lemmas and algorithms to CSLib, and we keep the encyclopedic breadth and the bindings to pages in our own package `Algo` (07.15). |
| **Isabelle AFP and "Functional Algorithms, Verified"** (Nipkow and others) | Many textbook algorithms and data structures with correctness and running-time proofs, for functional programs with a time function per definition. | It is the best model of what a complete formal treatment looks like. Our human proofs and our Lean proofs follow its structure (spec, model, invariant, cost), but in Lean. |
| **Rocq: Software Foundations Vol. 3, Verified Functional Algorithms** | Teaching material for sorting, search trees, priority queues and graph colouring. | A cross-check of the proofs that teachers expect. |
| **Why3, Dafny, Verus** | Verified imperative algorithms with loop invariants, in galleries of hundreds of examples. | The style of our loop-invariant proofs (06.5). We do not use these tools in the build. |
| **Aeneas** (Rust to Lean through Charon) | It translates safe Rust to a pure Lean model. In September 2026 (arXiv:2609.15648) a team proved safety, panic freedom and functional correctness of 16.7 thousand lines of SymCrypt Rust with 237 thousand lines of Lean, with help from AI. A May 2026 report (arXiv:2605.30106) combines Aeneas or Hax with AI provers. Aeneas is tied to a Lean version. | Proving the Rust implementation equal to the Lean model is possible for the core. It is the level L4 (07.6). The Lean version of Aeneas must match our pin, or the L4 work runs in a separate pinned workspace. |
| **AI provers** (Aristotle of Harmonic, Aleph, the Seed-Prover and DeepSeek-Prover lines, and general models with Lean tools) | By 2026 they prove many undergraduate-level Lean goals and help in large verification projects (the SymCrypt work above). | Agents can write most Lean proofs (12.2). The kernel is the judge, so a wrong proof cannot pass. The risk is a wrong spec, so people review the specs (07.7). |

**What it means.** A Lean proof of correctness is feasible for most of the core. A proof of cost needs an explicit cost model, and CSLib now gives one. A proof about real code is feasible for Rust. For the other 22 languages, the link between code and proof is differential testing against the compiled Lean model (09.5). The design says so on each page and does not claim more.

## 1.5 Languages

| Evidence | What it shows |
|---|---|
| TIOBE index, October 2026 | 1 Python 19.23%, 2 C 11.33%, 3 C++ 8.87%, 4 Java 8.41%, 5 C# 3.79%, 6 JavaScript 2.77%, 7 Visual Basic 2.20%, 8 R 2.06%, 9 SQL 1.97%, 10 Rust 1.44%, 11 Go 1.39%. Julia is back in the top 20 at 18. Dart and OCaml are close to the top 20. TypeScript is far down, because TIOBE counts search queries. |
| GitHub Octoverse 2025 | TypeScript became the most used language on GitHub by contributors in 2025, ahead of Python and JavaScript. |
| Stack Overflow developer survey 2025 | JavaScript, Python, SQL, TypeScript, Java, C#, C++, C, Go, Rust, Kotlin, PHP are the most used general-purpose languages; Rust is the most admired. |
| Teaching | Python, Java, C++ and C dominate first courses and algorithms courses. Haskell, OCaml and Scala are used in functional courses. |
| Competitive programming | C++ is dominant on Codeforces and AtCoder. Python, Java and Kotlin follow. Rust is growing. |

**What it means.** The ten languages of tier 1 cover each list above: Python, C++, Java, C, C#, JavaScript, TypeScript, Go, Rust and Kotlin. Tier 2 adds the languages that are popular in some community (Swift, Ruby, PHP, Dart, Scala, Haskell, OCaml, F#, Elixir, Julia, R, Zig, Lua), for 23 languages, plus Lean. Visual Basic and SQL are not tier 1. VB is legacy, and SQL does not express most algorithms. Both are in tier 3, with SQL for the database algorithms where it fits (08.2).

## 1.6 Visualization

| Work | Licence | What to learn |
|---|---|---|
| VisuAlgo (Steven Halim, NUS) | free to use, not open source | the breadth of the visualized canon; e-lecture mode; quiz mode. Link only. |
| Algorithm Visualizer | MIT | the tracer idea: the code calls a tracer API (`Array1DTracer`, `GraphTracer`, `LogTracer`) and a player renders the events. This is the model of our trace protocol (10.2). |
| USFCA Data Structure Visualizations (David Galles) | free to use | dense coverage of data structures with operation-by-operation animation |
| Python Tutor (Philip Guo) | free to use | execution-level visualization of real code, with step back |
| Distill and "explorable explanations" | various | interactive figures for concepts, where the reader moves a slider and the figure explains |
| Research on algorithm visualization: Hundhausen, Douglas and Stasko, a meta-study (2002); Naps et al., the engagement taxonomy (2002) | papers | what matters is the engagement of the learner, not the quality of the graphics. Viewing alone helps little. Responding (predicting the next step), changing (editing the input) and constructing help. |

**What it means.** One protocol for all scenes, with primitives that a scene composes, gives a uniform look and lets agents write scenes. The player must let the reader edit the input, step back and predict the next step (10.4). A picture without interaction is the level V1, not V2.

## 1.7 Sites, hosting and rendering

| Fact | Source | What it means |
|---|---|---|
| Cloudflare Workers static assets allow 20,000 files per version on Free and 100,000 on paid plans, at most 25 MiB per file. Cloudflare recommends Workers static assets for new projects. | Cloudflare documentation, as used in spec 2149, 10 | The site has about 10,000 nodes and up to 24 language pages for each core algorithm, so it needs the paid plan and R2 for the long tail (14.9). |
| GitHub Pages: 1 GB per site, 10-minute deploy, soft limit of 100 GB per month | GitHub documentation | The mirror holds the core pages only. |
| math2.tamnd.com is a static site from one Go renderer, with server-side KaTeX through goja, a small script, `.md` and `.json` copies, and `llms.txt` | math2-agent/site | We reuse the renderer pattern and the style: Inter, one reading column, a hue for each area, light and dark themes. |
| Verso is the documentation tool of Lean. It renders Lean code with hovers and links from the elaborated information. The Lean reference manual uses it. | Lean FRO | The Lean tab of a page can show the proof with hovers, from build data, with no Lean server at reading time (07.16). |
| A client-side search index of 10,000 small records is about 1–3 MB raw and a few hundred KB compressed | estimate | The Cmd-K palette loads a small names index first and the full-text shards on demand (15.3). |

## 1.8 Scale

| Quantity | Estimate | Basis |
|---|---|---|
| distinct items in the universe after dedup | 8,000–12,000 | the union of 1.2 and 1.3, joined by Wikidata and names; the overlap of Wikipedia, DADS and the CLRS index is large |
| items in the core | about 1,200 | the union of the canon books, CP-Algorithms and the USACO Guide (16.3) |
| problem contracts | 800–1,500, of which about 400 in the core | algorithms per problem is about 3 in the core |
| implementations in the core | 1,200 × 23 ≈ 28,000, about 1.5 million lines with tests | 30–80 lines per implementation, as much again for its native tests |
| Lean | about 1,000 modules for the core, 100–300 lines each | CSLib's mergesort and the Isabelle theories as a guide |
| scenes | about 900 algorithms and data structures in the core; concepts add about 100 explorables | the techniques and problems reuse the scenes of their algorithms |
| site pages | about 10,000 node pages, about 28,000 language pages, about 2,000 proof, Lean and visualize pages | 14.9 |

## 1.9 What the research decides

1. Write all text and code fresh. Use books for names and locators, open sources for facts with attribution, and code collections only as a list of what exists (1.2, 1.3).
2. Use Wikidata as the join key of the inventory, and the union of the canon as the core (1.3, 1.8).
3. Use Lean with CSLib's `TimeM` for cost, upstream to CSLib, and keep the pages' bindings in `Algo` (1.4).
4. Prove Rust implementations through Aeneas at L4. Link the other languages to the proof by differential tests against the compiled model, and say so (1.4).
5. Tier 1 has ten languages and tier 2 has thirteen (1.5).
6. Use one trace protocol with fixed primitives, in the style of Algorithm Visualizer's tracers, and a player built for engagement: edit the input, step back, predict (1.6).
7. Host on Workers Paid with R2, mirror the core on GitHub Pages, and reuse the math2 renderer and style (1.7).

## Sources

- CSLib white paper: https://arxiv.org/abs/2602.04846; repository: https://github.com/leanprover/cslib
- Aeneas at scale (SymCrypt): https://arxiv.org/abs/2609.15648; Rust-to-Lean with AI provers: https://arxiv.org/abs/2605.30106; a case study with Aeneas and jxl-rs: https://jonathan.protzenko.fr/2026/05/05/jxl-rs.html
- TIOBE index: https://www.tiobe.com/tiobe-index/; October 2026 summary: https://www.techrepublic.com/article/news-tiobe-october-2026-java-closes-cpp-gap/
- CP-Algorithms repository and licence: https://github.com/cp-algorithms/cp-algorithms
- Rosetta Code copyright discussion: https://rosettacode.org/wiki/Rosetta_Code_talk:Copyrights
- math2 site and renderer: https://math2.tamnd.com, `tamnd/math2-agent/site`
- Spec 2148 (Math 2.0) and spec 2149 (olymmath) for the hosting facts and the patterns
