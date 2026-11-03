# Spec 2150: algorithm

**All human knowledge about algorithms in one place.** Each concept, definition, problem, algorithm, data structure, technique and theorem has a page. Each algorithm has a full human proof, a Lean proof, implementations with tests in every popular language, and a visualization that explains it. Everything is published at https://algorithm.tamnd.com, with a mirror on GitHub Pages.

- Repositories: `tamnd/algorithm` (content) and `tamnd/algorithm-agent` (the Go toolchain and the agents, binary `algo`). This follows the pattern of math2 and math2-agent (spec 2148) and of olymmath (spec 2149).
- Date: 2026-11-03. Status: draft, research complete.

## Documents

| # | Document | What it settles |
|---|---|---|
| 00 | README | this index, the settled decisions, the conventions |
| 01 | [research](01-research.md) | the state of the field in November 2026: sources, formal tools, languages, visualization, sites, licences, and the numbers behind the design |
| 02 | [the goal](02-the-goal.md) | the one sentence, the scope, the quality promise, the scale (about 10,000 nodes, capacity 50,000), the users, the non-goals |
| 03 | [architecture](03-architecture.md) | the two repositories, the stores, the `algo` packages, the five flows, deployment |
| 04 | [object model](04-object-model.md) | the 12 node kinds, tags and slugs, the node directory, the front matter, the edges, the computed ladders |
| 05 | [taxonomy](05-taxonomy.md) | how the knowledge is organized: the area tree, the problem–algorithm–technique axes, facets, paths and courses |
| 06 | [content standard](06-content-standard.md) | the sections of each kind of page, pseudocode, the human proof standard, complexity analysis, the writing levels W0–W5 |
| 07 | [formal proofs](07-formal-proofs.md) | the `Algo` Lean package, the pins, specs, the cost model, correctness and complexity theorems, refinement, the formal ladder L0–L4 |
| 08 | [implementations](08-implementations.md) | the language register and tiers, the conventions of each language, the canonical signature, generated build trees, the ladder I0–I4 |
| 09 | [testing](09-testing.md) | problem contracts, shared cases, checkers, generators, oracles, property, differential and mutation tests, complexity checks, the CI matrix |
| 10 | [visualization](10-visualization.md) | the trace protocol, the scene primitives, the player, code sync, explorables, static frames, accessibility, the ladder V0–V3 |
| 11 | [sources and harvest](11-sources-and-harvest.md) | the source register, adapters on the \*-cli tools, the inventory, licence classes, the no-copy rule |
| 12 | [agents](12-agents.md) | the roles, the common loop, models, budgets, the work queue, provenance, labelling, cost |
| 13 | [quality and audit](13-quality-and-audit.md) | badges, the audit rules (families T S E G P L I V W A C X U), human review, sampling |
| 14 | [site](14-site.md) | the UI/UX: information architecture, URLs, page layouts, the algorithm page, comparison pages, paths, themes, performance, hosting and deploy |
| 15 | [search](15-search.md) | the index, the fields, the Cmd-K palette, facets, "I need to…" search, ranking, evaluation |
| 16 | [coverage](16-coverage.md) | how "no missing" is measured: the closed universe register, the levels C0–C6 |
| 17 | [legal and licensing](17-legal-and-licensing.md) | the licence zones, source classes, AI labels, takedown |
| 18 | [repository layout](18-repository-layout.md) | the trees of both repositories, the `algo` command tree, the workflows |
| 19 | [milestones](19-milestones.md) | M0 to M5 with exit criteria and costs |
| 20 | [open questions](20-open-questions.md) | the decisions still to make, each with a default |

Reading order: start with 02, 03 and 04. Then read 05 and 06 (what a page is and where it sits), 07, 08, 09 and 10 (the four kinds of evidence: proof, code, tests and pictures), 11, 12 and 16 (how the corpus gets complete), 13 (how it stays correct), 14 and 15 (how people use it), and 18 and 19 (how to build it).

## Settled decisions

1. **One idea, one page.** Each algorithm, data structure, problem, technique, concept, definition, model and theorem is one node. A node is a directory in `tamnd/algorithm`. It has a permanent tag and a unique slug.
2. **The problem is the contract.** A problem node defines the input, the output and a checker. Each algorithm that solves the problem uses the same contract, so all of its implementations share one set of test cases (09.1).
3. **Four kinds of evidence, each with a ladder.** The build computes a human proof level (H0–H3), a formal level (L0–L4), an implementation level for each language (I0–I4) and a visualization level (V0–V3), plus the writing level (W0–W5). Nobody writes these levels by hand (04.8).
4. **Lean v4.35.0 and Mathlib v4.35.0 are pinned, as in math2.** CSLib is pinned to a commit that builds with them. The cost model is CSLib's `TimeM` (07.4).
5. **The Lean model is the oracle.** Each algorithm with a Lean model compiles it to an executable. It is the reference output in differential tests, so the tests of every language are checked against a proved program (09.5).
6. **Implementations live with their algorithm.** `nodes/.../merge-sort/impl/<lang>/` holds the code and its native tests. `algo gen` makes the build tree of each language (a Cargo workspace, a Go module, a Gradle project, …) from these files. Nobody edits the generated trees (08.5).
7. **Tier 1 is 10 languages, tier 2 is 13, Lean is always there.** Tier 1: Python, C++, Java, C, C#, JavaScript, TypeScript, Go, Rust, Kotlin. Tier 2: Swift, Ruby, PHP, Dart, Scala, Haskell, OCaml, F#, Elixir, Julia, R, Zig, Lua. Tier 3 is open to contributors with the same harness (08.2).
8. **One visualization protocol.** A scene is a TypeScript file that runs the algorithm and emits events. It uses a fixed library of primitives (array, grid, graph, tree, table, …). The same scene drives the interactive player, the static frames and the social images (10.2).
9. **Human text first, AI text labelled.** Agents write most of the code and much of the prose. Each file has a provenance record. A page shows what an agent wrote and what a person checked. The badge "reviewed" needs a person (12.7, 13.1).
10. **No copying.** Prose and code are written fresh and cite their sources. The copy check compares each change with the source corpora. Rosetta Code (GFDL 1.2) and textbooks are only cited and linked (11.5, 17.2).
11. **"No missing" is measured.** The universe register lists each item that a source in the source register names. Each item maps to a node or to an outcome (alias, merged, out of scope). The coverage report shows each gap (document 16).
12. **One Go binary, one renderer.** `algo` builds, checks, tests, renders and deploys. The site is static HTML with small scripts. It is served by a Cloudflare Worker with static assets and R2. The GitHub Pages mirror has the core pages (14.9).

## Conventions

- Section references look like 07.4 (document 07, section 4). Audit rules look like 13.3 I05.
- Tags have 6 characters of Crockford base32, as in math2, for example `4MRG7S`. URIs look like `al://4MRG7S`. Slugs look like `merge-sort`.
- "Estimate" marks a number from research that M0 to M1 must measure. "Default" marks a decision of document 20 that can still change.
- The words are simple English, one sentence on each line in Markdown source, as in math2 and olymmath.
