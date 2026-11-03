# 19. Milestones

Six milestones, M0 to M5, from November 2026 to the end of 2028. Each one has a goal, the work, the exit criteria that the reports prove, and an estimate of cost. The GitHub milestones of `tamnd/algorithm-agent` follow this document, and each issue names its section.

The costs are model API spend at the prices of November 2026. People's time is not counted. Each estimate is measured on the gold set in M0 and corrected at the end of each milestone (12.6).

## 19.1 Overview

| Milestone | Dates | Goal | Nodes at W3 or more | Core complete (C6) |
|---|---|---|---|---|
| M0 | Nov–Dec 2026 | the standard: the toolchain and 12 gold nodes complete on every ladder | 30 | 12 |
| M1 | Jan–Mar 2027 | the universe and the site v1 | 200 | 12 |
| M2 | Apr–Jun 2027 | the core in text and in tier-1 code | 1,200 | 100 |
| M3 | Jul–Dec 2027 | proofs, Lean and tier 2 | 3,000 | 500 |
| M4 | Jan–Jun 2028 | the core complete, the long tail written | 8,000 | 1,000 |
| M5 | Jul–Dec 2028 | no missing: the universe closed, review at scale | all of the universe | all of the core, with listed exceptions |

## 19.2 M0, the standard (November–December 2026)

**Goal.** Make 12 nodes perfect, and make the toolchain that proves they are. These nodes are the gold set. They define what "complete" looks like for agents and for people.

**The gold set.** `binary-search`, `insertion-sort`, `merge-sort`, `quicksort`, `binary-heap`, `disjoint-set-forest`, `breadth-first-search`, `dijkstra`, `knuth-morris-pratt`, `euclidean-algorithm`, `longest-common-subsequence` and `hash-table-chaining`, with the problems, abstract types, techniques, concepts and models that they need (about 18 more nodes, at W3).

**Work.**

- Repositories `tamnd/algorithm` and `tamnd/algorithm-agent`, with licences, REUSE, CONTRIBUTING and the schemas of 04 and 09.
- `algo new`, `fmt`, `check`, `mint`, `mv`, `gen`, `test`, `lean build`, `viz build`, `status`, `site build`, `site serve`, `site deploy`.
- The `Algo` Lean package with the pins and CSLib, and `AlgoExtract`.
- The runner images of the 10 tier-1 languages and Lean.
- `@algo/viz` with the primitives that the gold set needs: array, graph, tree, table, heap view, string with pointers.
- The site with the layouts of 14: home, area, problem, algorithm, language, proof, Lean and visualize pages. Live at https://algorithm.tamnd.com.
- The audit rules of the families T, S, E, G, L, I.

**Exit criteria.**

1. Each gold node has H3, L3, I3 in each tier-1 language, I2 in each tier-2 language, V2 and W4. Two reviews are by people other than the author.
2. `algo audit` reports 0 findings on `main`.
3. A change to one implementation runs only its tests, and CI finishes in under 10 minutes.
4. The cost of each agent role per gold item is measured and written into 12.6.
5. Three teachers review the gold set pages and the pseudocode style (Q-12).

**Cost (estimate).** $1,500 of agent spend, most of it on the Lean proofs and on the measurement runs.

## 19.3 M1, the universe and the site v1 (January–March 2027)

**Goal.** Know what is missing, and publish what exists.

**Work.**

- The adapters and the first harvest of each source of 11.2. The inventory and the universe register.
- The canon tables of contents of 11.8, checked by a person.
- The core list `topics/core.yaml` (16.3), reviewed.
- The queue and the agent loop (12) for the roles writer, implementer and tester.
- Search v1: the Cmd-K palette, full-text search, facets (15).
- The coverage page and the reports (16).
- The first release, 2027.03, with its archive.

**Exit criteria.**

1. Every row from the sources of 11.2 has an outcome other than `open` (C0 at 100%).
2. 200 nodes at W3 or more, each with tier-1 implementations at I2.
3. The search evaluation set (15) passes its gate.
4. The site passes the performance and accessibility budgets of 14 on the gold set and on 50 sampled pages.

**Cost (estimate).** $3,000.

## 19.4 M2, the core in text and code (April–June 2027)

**Goal.** Each core item has a good page and tier-1 code.

**Work.** The writer, implementer, tester and visualizer agents at scale on the core. Every primitive of 10.2. The comparison tables (14.5) and the cheat sheets. The courses "Algorithms I and II", "Data structures" and "Interview essentials" (05.6).

**Exit criteria.**

1. All about 1,200 core items at W3 or more.
2. Each core algorithm and data structure at I2 in each tier-1 language.
3. 50% of the core at H2, and 300 scenes at V2.
4. 200 nodes at L2.
5. Human sampling (13.4) finds defects in under 2% of the sampled implementations and under 5% of the sampled pages.

**Cost (estimate).** $20,000: the prose of about 1,200 pages ($2,000–4,000), about 9,000 tier-1 implementations with their tests ($5,000–9,000), scenes ($2,000), juries and retries.

## 19.5 M3, proofs, Lean and tier 2 (July–December 2027)

**Goal.** Prove the core twice and reach every popular language.

**Work.** The proof writer, formalizer and Lean prover agents at scale. The tier-2 runners and implementers. The L4 work on Rust through Aeneas for the gold set and then the core sorting, searching and data structures. The courses "Competitive programming", "Theory of computation" and "Algorithms in Lean". The register of reviewers (Q-18).

**Exit criteria.**

1. 100% of the core at H2 and 30% at H3.
2. 600 core nodes at L2 and 300 at L3. 50 at L4.
3. The core at I2 in each tier-2 language.
4. 700 scenes at V2.
5. 3,000 nodes at W3 or more.

**Cost (estimate).** $35,000: Lean proofs ($5–50 each, about $15,000–20,000), tier-2 code (about 15,000 implementations, $6,000–10,000), human-style proofs ($3,000).

## 19.6 M4, the core complete and the long tail written (January–June 2028)

**Goal.** The core is complete. Every item of the universe has a page.

**Exit criteria.**

1. 1,000 core nodes at C6 (complete, 04.8). Each other core node has a written reason in its gap list (16.6).
2. Every universe item with the outcome `node` has a page at W2 or more and tier-1 implementations at I1 or more, when it has implementations.
3. 900 core nodes at L3.
4. The human sampling defect rates stay under the M2 limits.

**Cost (estimate).** $25,000.

## 19.7 M5, no missing (July–December 2028)

**Goal.** The universe is closed and the gaps are explained.

**Exit criteria.**

1. The coverage report shows C6 for each core item, or a listed exception: a proof that needs a model that CSLib does not have yet (Q-19, Q-20), an algorithm that cannot be written in a language without a dependency, a scene that does not help.
2. Each long-tail item at W3 or more and at H2 where the literature has a proof.
3. Reviews by the register of reviewers keep up with the changes: under 500 items wait for a review (Q-18).
4. The monthly releases and archives are on Zenodo with DOIs.

**Cost (estimate).** $15,000, then about $2,000 a month for maintenance: new items from the weekly harvest, the bumps of Lean and of the language toolchains, and re-runs after changes of contracts.

## 19.8 Risks

| Risk | Sign | Response |
|---|---|---|
| Lean proofs cost much more than the estimate | the M0 gold set costs over $100 per L3 node | prioritize L2 for the whole core and L3 for the intro and core levels; use more of the upstream CSLib work |
| agent code passes tests but reads badly | the human sampling finds style defects in over 10% of files | add style examples per language to the prompts, add lint rules, raise the I3 bar |
| the universe is much larger than 12,000 | the first Wikidata and Wikipedia harvest gives over 30,000 rows in scope | split the long tail by level, and set the target of M4 to the `core` and `advanced` levels |
| the file budget of the site is exceeded | the build reports over 90,000 files in the assets | move language pages and machine copies of the long tail to R2 (14.9) |
| the reviewers do not keep up | the review queue grows for three months | invite reviewers by area, and lower the reviewed share of H3 targets to the intro and core levels |
