# 03. Architecture

## 3.1 Two repositories

| Repository | Holds | Licence |
|---|---|---|
| `tamnd/algorithm` | the content: node directories (text, proofs, implementations, tests, scenes), the `Algo` Lean package, the registers, the schemas, the manifests, the reports | prose CC BY-SA 4.0; implementations, tests and scenes MIT; Lean Apache-2.0; metadata CC0 1.0 (17.1) |
| `tamnd/algorithm-agent` | the toolchain: the Go binary `algo` (check, build, test, gen, lean, viz, site, search, ingest, coverage, agents, mcp), the visualization runtime `@algo/viz`, the language runner images, the prompts | Apache-2.0; `@algo/viz` MIT |

The split is the one of math2. Content changes are pull requests on `tamnd/algorithm`, and the checks are the gate. Toolchain changes are releases of `tamnd/algorithm-agent`, and `manifests/releases/next.yaml` in the content repository pins the version of `algo` that CI uses, as in math2.

## 3.2 The boxes

```
                       ┌──────────────────────────────────────────┐
  sources (11) ──────▶ │ ingest: adapters on *-cli → raw store    │
                       │         → inventory → universe register  │
                       └───────────────┬──────────────────────────┘
                                       │ gaps (16)
                                       ▼
 people ──PR──▶  ┌──────────────────────────────────────────────┐  ◀──PR── agents (12)
                 │ tamnd/algorithm: nodes/, lean/, registers/   │
                 └──────┬──────────────┬─────────────┬──────────┘
                        │              │             │
                        ▼              ▼             ▼
              ┌────────────────┐ ┌───────────┐ ┌──────────────────┐
              │ check + audit  │ │ lean build│ │ test: gen trees, │
              │ (13)           │ │ extract   │ │ runners, oracle  │
              │                │ │ (07)      │ │ (08, 09)         │
              └───────┬────────┘ └─────┬─────┘ └────────┬─────────┘
                      └───────┬────────┴────────────────┘
                              ▼
                 ┌──────────────────────────────┐
                 │ build: graph, ladders,       │
                 │ coverage, search index,      │
                 │ scene bundles, frames        │
                 └──────────────┬───────────────┘
                                ▼
                 ┌──────────────────────────────┐
                 │ site: HTML, .md, .json,      │──▶ Cloudflare Worker + assets + R2
                 │ llms.txt, feeds, MCP         │──▶ GitHub Pages mirror (core)
                 └──────────────────────────────┘
```

## 3.3 The stores

| Store | Where | What | Size (estimate at 10k nodes) |
|---|---|---|---|
| content | git, `tamnd/algorithm` | node directories, Lean, registers, schemas | 1–2 GB, most of it implementations |
| raw | R2 bucket `algorithm-raw`, content addressed by BLAKE3 | each fetched page and file of each source, for provenance and the copy check | 5–20 GB |
| build | `build/` in CI, cached by input hash | the graph, the ladders, test results, Lean extraction, scene bundles, frames | 2–5 GB, not committed |
| reports | `reports/` in git | coverage, audit, test matrix, bench, inventory summaries | small, text and Parquet |
| site | R2 bucket `algorithm-site` and Workers assets | the rendered site of `main` and of each release | 3–8 GB |

The content store is the only source of truth. Each other store can be rebuilt from it and the raw store.

## 3.4 The packages of `algo`

| Package | Job | Spec |
|---|---|---|
| `node` | parse and write node directories; front matter; the body sections | 04 |
| `schema` | JSON schemas of the front matter, contracts, cases, registers | 04, 09 |
| `tag` | mint, check and retire tags; the tag register | 04.2 |
| `graph` | the typed edges, closure, the prerequisite DAG, reading paths | 04.6, 05 |
| `taxonomy` | the area tree, facets, courses | 05 |
| `markup` | Markdown with math (goldmark, KaTeX server side through goja, as in math2), pseudocode blocks, cross-links `[[slug]]` | 06 |
| `lean` | `lake build`, the extractor `AlgoExtract`, axioms, `sorry` scan, the decl–node bindings | 07 |
| `lang` | the language register, the conventions, the generators of build trees | 08 |
| `runner` | run tests of one language in its pinned image, with no network, limits and a cache | 08.7, 09.8 |
| `testkit` | contracts, cases, checkers, generators, the oracle, the differential runner, mutation | 09 |
| `bench` | the complexity checks: doubling runs and fits | 09.7 |
| `viz` | bundle scenes with esbuild, run them headless in goja for frames, check traces | 10 |
| `status` | compute the ladders H, L, I, V, W and the badges | 04.8, 13.1 |
| `audit` | the audit rules | 13.3 |
| `ingest` | source adapters on the \*-cli libraries; the raw store | 11 |
| `universe` | the inventory, the universe register, outcomes | 16 |
| `coverage` | the coverage levels and reports | 16 |
| `copycheck` | similarity of prose and code against the source corpora (reused from math2-agent) | 11.5 |
| `agent` | the roles, the loop, prompts, budgets, run records | 12 |
| `queue` | the work queue from the gaps | 12.4 |
| `prov` | provenance logs of each file | 12.7 |
| `site` | the renderer, the templates, the assets, deploy | 14 |
| `search` | the search index builder | 15 |
| `mcp` | the MCP server: read nodes, search, run cases | 14.8 |
| `release` | the monthly release, its manifest and archive | 18.4 |

The packages `markup`, `copycheck`, `prov`, `tag`, `mcp` and the site skeleton start as copies of the math2-agent packages, adapted. They do not import math2-agent, so each project can change without breaking the other.

## 3.5 The five flows

**F1. Ingest (weekly).** `algo ingest <source>` fetches the lists and pages of a source through its \*-cli adapter, stores raw captures, and writes inventory rows (11.3). `algo universe merge` maps the rows to nodes or proposes new universe items. A pull request carries the change.

**F2. Write (each change).** A person or an agent changes one node directory, often only one part of it (a language, a proof, the scene). `algo check -changed` runs the schema checks, the audit rules of the changed nodes, the Lean build of the changed modules, the tests of the changed implementations in their images, and the scene checks. The pull request shows a summary table of the ladders before and after.

**F3. Build (each push to `main`, and nightly).** `algo build` runs everything for the whole tree with a cache keyed by input hashes: the Lean package, the tests of each language, the benchmarks of the core (nightly only), the scenes and frames, the graph, the ladders and the coverage. It writes `build/` and the reports.

**F4. Publish (after F3).** `algo site build` renders the site from the tree and `build/`. `algo site check` checks links, sizes, accessibility rules and the file budget. `algo site deploy` uploads changed files to R2 and the Worker assets. A change on `main` is live in 10 to 20 minutes (14.9).

**F5. Agents (continuous, with budgets).** `algo queue` turns gaps of the coverage report into work items. `algo agent run` takes items, works in a sandbox clone, runs F2 locally until the checks pass, and opens a pull request with its run record (document 12).

## 3.6 Cross-cutting decisions

- **Determinism.** Each step of the build is a function of its inputs and the pins: toolchain images, Lean and Mathlib, model ids and prompt versions. The cache key is the hash of the inputs.
- **Sandbox.** Each runner image runs with no network, a read-only tree, a time limit and a memory limit (08.7). Code from a pull request never runs outside it.
- **Incremental by default.** A change to one implementation runs the tests of that implementation only. A change to a contract or its cases runs every implementation of every algorithm that solves the problem. A change to a Lean module rebuilds its dependants only.
- **Machine copies.** Each page has `.md` and `.json` copies, and the site has `llms.txt` and an MCP server, as in math2.
- **Offline.** Each release has a zip archive of the site that opens from disk (18.4).

## 3.7 Deployment

| Part | Where | Cost (estimate) |
|---|---|---|
| main site | Cloudflare Worker with static assets (paid plan, 100,000 files) for the shell and the hot pages, R2 for the rest | Workers Paid $5/month, R2 under $1/month |
| mirror | GitHub Pages `tamnd.github.io/algorithm`, the core pages only, under 1 GB | free |
| CI | GitHub Actions for pull requests; a self-hosted build server for the nightly full build, as for math2 | the server exists |
| raw store | R2 `algorithm-raw` | under $1/month |
| agents | model API spend under the monthly budgets of 12.6 | see 19 |
