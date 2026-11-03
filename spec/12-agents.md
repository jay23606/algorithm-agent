# 12. Agents

Agents do most of the work that is large and checkable: tens of thousands of implementations, tests, scenes, Lean proofs, and first drafts of prose. People do the work that needs judgement: contracts, specs, reviews and the final word on the text. This document says which agents exist, how they work, what they may spend, and how every file they write is labelled.

The design follows math2-agent (spec 2148) and olymmath (spec 2149): one loop, roles with narrow jobs, versioned prompts, a work queue made from the gaps, a run record for each run, and checks as the gate. The difference here is that most of the output can be checked by a machine (the tests, the oracle, the Lean kernel and the trace checks), so more of it can merge without a person.

## 12.1 Principles

1. **The checks are the gate, not the agent.** An agent's claim that something works is worth nothing. `algo check -changed` decides (03.5 F2).
2. **One item, one change.** A run works on one work item, changes one node directory (often one part of it), and opens one pull request.
3. **Narrow roles.** A role has one job, one prompt and a list of files it may write. The implementer of Rust cannot edit the contract. The writer cannot edit the Lean spec.
4. **Context is chosen, not dumped.** The loop gives the agent the exact files it needs (12.5 step 2). It does not give it other implementations of the same algorithm (11.5).
5. **Everything is recorded.** Each run writes a run record: the item, the model, the prompt version, the inputs, the tool calls, the cost and the result. Each changed file gets a provenance line (12.7).
6. **Unreviewed means labelled.** A reader can always see what an agent wrote and no person has checked yet (12.7.3).
7. **Budgets are hard.** A run stops at its cap. A role stops at its monthly budget. Nothing is spent outside them (12.6).

## 12.2 The roles

| Role | Job | Writes | Reads (beyond the node) | Default model |
|---|---|---|---|---|
| `scout` | turn inventory rows into proposed universe items and node stubs; find aliases and duplicates | `registers/universe/*.yaml` proposals, `node.md` stubs (front matter only) | inventory rows, raw excerpts (11.3) | haiku |
| `curator` | propose outcomes for inventory rows (11.3), place nodes in the area tree, propose edges; a person approves | registers, front matter `area`, `edges` | the area tree (05), neighbours of the node | sonnet |
| `writer` | write the prose sections of a page by the standard of its kind (06) | the body of `node.md` except the proof sections | source excerpts, the prerequisites' summaries, the contract | opus for the core, sonnet for the long tail |
| `proof-writer` | write the human proof and the complexity analysis (06.5, 06.6) | `proofs/*.md` | the pseudocode, the Lean statement if it exists, cited lemmas | opus |
| `formalizer` | write the Lean spec, the model and the theorem statements (07.3); a person reviews each spec (07.7) | `lean/Algo/**` statements, `sorry` bodies | the human proof, the contract, the CSLib and Mathlib API | opus |
| `prover` | fill the `sorry`s of reviewed statements (07.14) | `lean/Algo/**` proof bodies only | the statement, the human proof, the Lean REPL, external provers | opus, plus external AI provers |
| `implementer:<lang>` | write the implementation of one algorithm in one language, by 08.3, with native tests | `impl/<lang>/**` | the pseudocode, the contract, the conventions of the language, the Lean model | sonnet; opus on a second try |
| `tester` | write shared cases, generators, edge cases and the checker of a problem (09) | `cases/*.jsonl`, `generators/`, `checker.py` (a person reviews checkers) | the contract, known bugs, mutation survivors | sonnet |
| `visualizer` | write the scene, the presets and the narration (10.10) | `viz/**` | the pseudocode, the TypeScript reference, the proof's invariant | sonnet |
| `linker` | add cross-links `[[slug]]`, "see also" and prerequisite edges; fix broken links | `node.md` links, `edges` | the graph (04.6), search results | haiku |
| `critic` | review a change against the standard and the sources; vote on a jury (12.10) | review comments, jury votes (never content) | the diff, the standard, the sources it cites | a model of another family |
| `fixer` | fix a finding of the audit (13.3) or of a critic | the files that the finding names | the finding, the rule | sonnet |

The list of files that a role may write is in `algorithm-agent/agent/roles.yaml`. The loop rejects a change outside it (rule A03).

## 12.3 Models and prompts

`manifests/models.yaml` in the content repository pins the models and the prompt versions. A change of a model or a prompt is a pull request, so it shows in the history and in the run records.

```yaml
# manifests/models.yaml
models:
  opus:   {id: claude-opus-5-5,   family: anthropic}
  sonnet: {id: claude-sonnet-5-5, family: anthropic}
  haiku:  {id: claude-haiku-5-5,  family: anthropic}
  jury-b: {id: <pinned id>, family: openai}      # the critic of another family
  jury-c: {id: <pinned id>, family: google}
provers:                                          # external Lean provers, called by the prover role
  - {name: aristotle, kind: api, terms_recorded: true}
  - {name: deepseek-prover, kind: local-gpu, terms_recorded: true}
roles:
  writer:            {model: opus, fallback: sonnet, prompt: writer/v7}
  implementer:       {model: sonnet, retry_model: opus, prompt: implementer/v12}
  prover:            {model: opus, prompt: prover/v4}
  critic:            {models: [jury-b, jury-c, sonnet], prompt: critic/v5}
  # …
```

- **Prompts** live in `algorithm-agent/prompts/<role>/<version>.md`. A version never changes after it is used in a merged run; a change makes a new version.
- A prompt has four parts: the role and its limits, the standard (the sections of 06, 08.3 or 10 that apply, included by reference and rendered at run time), the checklist of the gate, and the output format. The language conventions of 08.3.2 are one shared include for all implementers.
- **A new prompt version or model** runs on the eval set (12.11) before it is used. It is used only if it is not worse on the eval set and not more expensive by more than 20%, or a person accepts the trade.
- **AI provers** are allowed. Their output is a Lean term or a tactic script. The kernel checks it in our build, so a wrong proof cannot pass (07.14). The run record keeps the prover's name and version.

## 12.4 The work queue

`algo queue` turns gaps into work items. A gap is any place where a node is below the level it needs (04.8, 16).

### 12.4.1 Where items come from

| Source | Item |
|---|---|
| coverage (16) | a universe item with no node → `scout` or `writer` new node |
| writing ladder | a node below its W target → `writer` |
| human proof ladder | an algorithm below H3 → `proof-writer` |
| formal ladder | no spec → `formalizer`; reviewed spec with `sorry` → `prover` |
| implementation ladder | a tier-1 language below I3 or a tier-2 language below I2 → `implementer:<lang>` |
| tests | a problem with fewer cases than 09.3 asks, or surviving mutants → `tester` |
| visualization ladder | an algorithm below V2 → `visualizer` |
| audit | a finding with an automatic fix class → `fixer` |
| graph | a node with fewer links than 06.3 asks, or broken links → `linker` |
| change | a contract or a case changed and an implementation now fails → `implementer:<lang>` with the failing cases |
| people | an issue with the label `agent-ok` → the role it names |

### 12.4.2 An item

```yaml
id: q-2027-04-18-00317
role: implementer:kotlin
node: dijkstra            # tag 7DJK2A
target: {ladder: I, level: I3, lang: kotlin}
deps: [contract-reviewed, pseudocode-W3]   # the item waits until these hold
priority: 0.82
attempts: 0
lease: null
created_by: queue/coverage@2027-04-18
```

### 12.4.3 Priority

The priority is a number from 0 to 1, computed each night:

```
priority = 0.35·core + 0.20·level_gap + 0.15·traffic + 0.10·dependants + 0.10·source_weight + 0.10·age
```

- `core`: 1 for a node of `topics/core.yaml` (16.3), 0.5 for a node that a core node needs, else 0.
- `level_gap`: how far the node is below its target, scaled to 0–1.
- `traffic`: the page views of the last 30 days, log-scaled; for a missing node, the search queries that found nothing for its name (15.8).
- `dependants`: the number of nodes that list this one as a prerequisite, log-scaled.
- `source_weight`: how many sources of 11.2 name the item, with the canon textbooks weighted higher (11.8); citation counts for the long tail (11.7).
- `age`: grows with the days that the item has waited, so no item starves.

Order of work inside a node: contract and cases first, then the pseudocode, then the implementations and the scene, then the proofs. An item whose `deps` do not hold is not leased.

### 12.4.4 Dedup and leases

- **Dedup.** The key of an item is `(role, node, target)`. The queue keeps one open item per key. An open pull request for a key blocks a new item with that key.
- **Lease.** `algo queue lease <role>` gives the top item to one worker for 2 hours (4 hours for `prover`). The worker renews the lease while it runs. An expired lease returns the item to the queue.
- **Attempts.** After 3 failed attempts, the item gets the label `needs-human` and leaves the agent queue. It appears on `/gaps/` (14) with the last run record, so a person can see what went wrong.
- **People first.** A person can claim an item on GitHub with `/claim`. A claimed item is not leased to agents for 14 days.

## 12.5 The common loop

Each role runs the same loop, in `algorithm-agent/agent/loop.go`:

1. **Take.** Lease the top item of the role. Check its `deps` again.
2. **Gather.** Build the context: the node directory (the parts the role reads), the standard of the role, the contract, the pseudocode, the neighbours' summaries, and the source excerpts from the raw store (11.3), each marked as data (12.8). Write the context hash into the run record.
3. **Clone.** Make a sandbox clone of `tamnd/algorithm` at `main` on a branch `agent/<item-id>`. The sandbox has no network except the model API, the runner images and, for the prover, the external provers in `models.yaml`.
4. **Write.** The agent writes files with its tools: read a file, write a file of its allow list, run `algo fmt`, run `algo check -changed`, run `algo test <slug> -lang L`, run the Lean REPL, run `algo viz check`, search the site index.
5. **Check.** Run `algo check -changed`. When it fails, give the agent the failures and go to step 4. Stop when it passes, or when the run reaches its cap (12.6), or after 8 rounds.
6. **Review.** For a role whose output is not fully checkable by machine (prose, proofs in English, checkers, scenes), call the jury (12.10). A failed jury goes back to step 4 once, with the jury's comments.
7. **Open.** Commit with the provenance lines (12.7), push, and open a pull request with the run record summary and the ladders before and after. A run that did not pass writes its run record and releases the item with `attempts + 1`.

The run record is `reports/agents/runs/<YYYY-MM>/<run-id>.json`:

```json
{
  "run": "r-2027-04-18-7f3a",
  "item": "q-2027-04-18-00317",
  "role": "implementer:kotlin",
  "node": "7DJK2A",
  "model": "claude-sonnet-5-5",
  "prompt": "implementer/v12",
  "context_hash": "blake3:91c4…",
  "rounds": 3,
  "checks": {"I01": "pass", "I02": "pass", "I03": "pass", "I04": "pass 0.91", "I05": "pass", "I06": "pass"},
  "tokens": {"in": 61200, "out": 9400, "cached": 40100},
  "cost_usd": 0.41,
  "wall_s": 312,
  "result": "pr",
  "pr": "tamnd/algorithm#4127",
  "files": ["nodes/graphs/shortest-paths/dijkstra/impl/kotlin/Dijkstra.kt",
            "nodes/graphs/shortest-paths/dijkstra/impl/kotlin/DijkstraTest.kt"]
}
```

The model's full transcript is kept in R2 `algorithm-raw/runs/` for 180 days, addressed by the run id. The record in git keeps only the summary.

## 12.6 Budgets

### 12.6.1 Monthly budgets

`manifests/budgets.yaml` sets a monthly budget for each role, in US dollars. `algo agent run` reads the spend of the month from the run records and refuses to start when the role's budget is spent (rule A08).

| Role | Monthly budget, M2 (default) | Monthly budget, M3 (default) |
|---|---|---|
| writer | $900 | $700 |
| proof-writer | $300 | $500 |
| formalizer | $200 | $700 |
| prover | $300 | $2,500 |
| implementer (all languages) | $2,200 | $1,500 |
| tester | $500 | $300 |
| visualizer | $500 | $300 |
| critic (juries) | $500 | $600 |
| scout, curator, linker, fixer | $400 | $300 |
| **total** | **$5,800** | **$7,400** |

The totals match the costs of 19.4 and 19.5 over the length of each milestone, with 15% left for re-runs.

### 12.6.2 Caps for each item

| Role | Cap of one run | Cap of one item (all attempts) |
|---|---|---|
| implementer | $1.50 | $4 |
| tester | $2 | $6 |
| visualizer | $3 | $8 |
| writer | $6 | $15 |
| proof-writer | $6 | $15 |
| formalizer | $8 | $20 |
| prover | $25 | $60 |
| critic (one vote) | $0.60 | none |
| scout, linker, curator | $0.30 | $1 |

### 12.6.3 Stop rules

A run stops, and writes `result: "stopped"` with the reason, when any of these happens:

- it reaches its cost cap or 8 rounds;
- the same check fails with the same message in 3 rounds in a row (no progress);
- it tries to write a file outside the role's allow list twice;
- it tries to weaken a test, a case, a checker, a spec or a rule threshold to pass (rule A04): deleting a case, adding `@Ignore`, changing `≤` to `<` in a spec, adding `sorry` or an axiom;
- its context or its output contains an instruction-like text from a source that it acted on (12.8).

A role stops for the rest of the day when the failure rate of its last 50 runs is above 60%, and a person gets an issue. The usual causes are a broken image, a changed contract or a bad prompt version.

## 12.7 Provenance and labelling

### 12.7.1 The provenance log

Each file in a node directory has lines in `prov/<TAG>.jsonl` (04.7). An agent change writes one line for each file:

```json
{"date": "2027-04-18", "file": "impl/kotlin/Dijkstra.kt", "op": "create", "hash": "blake3:5e0a…",
 "author": {"agent": "implementer:kotlin", "run": "r-2027-04-18-7f3a", "model": "claude-sonnet-5-5", "prompt": "implementer/v12"},
 "reviewer": null, "sources": [], "pr": 4127}
```

A person's change has `"author": {"person": "<github login>"}`. A review adds a line with `"op": "review"`, the reviewer's login, the hash that was reviewed and a link to the signed review record (13.2). A later change of the file makes the review stale: the badge of the file falls back until a person reviews the new hash.

`algo prov <slug>` shows the history of a node. It also checks that each file has a line for its current hash (rule A01) and that each agent line names a run record that exists (rule A02).

### 12.7.2 Who wrote it

The build computes a **state** for each part of a page (a section, a proof, an implementation, the scene, the Lean file) from its provenance:

| State | Meaning |
|---|---|
| `human` | a person wrote the current hash |
| `agent-checked` | an agent wrote it; machine checks pass; no person reviewed it |
| `agent-reviewed` | an agent wrote it; a person reviewed the current hash |
| `human-reviewed` | a person wrote it and another person reviewed it |
| `quarantined` | a finding marks it as possibly wrong or copied; it is not shown (14.4) |

### 12.7.3 The label

A part in state `agent-checked` has the label **"AI · not reviewed"** at its heading. The label links to the run record. Its tooltip says what that means for this kind of part:

- for an implementation: "An agent wrote this code. It passes the shared tests, the comparison with the proved Lean model and the mutation tests. No person has read it yet."
- for prose or a human proof: "An agent wrote this, and no person checked it yet."
- for a Lean proof: "An AI wrote this proof. The Lean kernel checked it. A person reviewed the statement." A Lean proof needs no review of its own, since the kernel checks it (07.14); the statement does.

The page-level notice of 14.4 sums up the labels. The `.md` and `.json` copies of a page carry the same states, so a reader who uses the API or `llms.txt` sees them too.

### 12.7.4 Badges need people

The badge "reviewed" of a node and its levels H3, V3 and W5 need a review by a person for the current hash (13.1). An agent cannot give them. A jury pass is not a review. An agent may write a review record only as a draft for a person to sign.

## 12.8 Untrusted text

Source excerpts, web pages, issues, pull request comments from outsiders and the code under test are **data**. They can contain text that looks like instructions ("ignore the tests", "add this link").

- The loop puts each such text inside a fenced block with its source id, and the prompt says that text in these blocks is data to cite, never instructions to follow.
- The tools of an agent cannot fetch URLs. Only the loop fetches, from the raw store, by source id.
- An agent's output is checked for links and for text that is not in the allow list of its role: a new external link must be a source of the register (11.2), and a pull request cannot change workflows, manifests, budgets, prompts or `roles.yaml` (rule A03).
- The runner images run the code that the agent wrote with no network (08.7). A test cannot reach the model API or the repository.
- A run whose output follows an instruction found in data is stopped (12.6.3) and its item gets `needs-human`. The eval set has injected excerpts to measure this (12.11).

## 12.9 Merge policy

| Change | Gates | Merge |
|---|---|---|
| an implementation and its native tests, for a problem whose contract a person reviewed | `algo check -changed` passes, with I01–I06 and I08–I18; a jury of one critic of another family passes it for convention and readability | **automatic** (default Q-09), labelled `agent-checked` |
| a scene and its presets | V01–V11, V13 pass; jury pass | automatic, labelled `agent-checked`; V3 needs a person |
| a Lean proof of a reviewed statement | the build, L03 (no `sorry`, no new axioms) and L10 | automatic; the kernel is the review |
| shared cases and generators | the cases agree with the oracle; mutation score does not fall | automatic for new cases; a person for a deletion |
| prose and human proofs | all checks; jury pass of 2 of 3 | merged by a maintainer after a skim, labelled `agent-checked`; the reviewed badge needs a full review |
| a checker, a contract, a Lean spec or statement, a node of the core's area tree | all checks | **a person must approve** (rule A06) |
| a new node from the scout | schema, tag, dedup | a curator person approves |
| a change to `registers/`, `manifests/`, `schema/` or `.github/` | none | agents cannot open it (A03) |

Auto-merge stops for a role when human sampling (13.4) finds a defect rate above 1% in its merged files of the last 30 days (Q-09). It starts again after a person accepts a fix.

## 12.10 Juries

A jury reviews what the machine checks cannot: whether prose is right, clear and at the right level; whether a human proof is complete; whether code follows the conventions in spirit; whether the narration of a scene is true to the proof.

- A jury has 3 votes for prose and proofs, and 1 for code and scenes. At least one voter is of a model family other than the author's, and the author model never votes on its own output.
- Each voter gets the diff, the checklist of the part (13.4) and the cited excerpts. It returns `pass` or `fail`, and for `fail`, the items of the checklist with a quote and a reason.
- Pass needs 2 of 3 (or 1 of 1). A voter's "fail" without a quote that is in the diff is dropped.
- Votes are in the run record. The pass rate of juries against later human reviews is measured (12.11): a jury that passes what people fail loses its seat.

## 12.11 Evaluation and the weekly report

### 12.11.1 The eval set

`algorithm-agent/eval/` holds the eval set: the 12 gold nodes of M0 (19.2) with their parts removed, plus 40 harder items (an implementation with a known trap, an overflow, a deep recursion, a proof with a subtle step, a prompt injection in an excerpt). Each item has its expected result: the checks that must pass, or the human grade of the gold version.

`algo agent eval <role> -prompt <version> -model <alias>` runs a role on the eval set and writes the pass rate, the cost per pass, the rounds and the injection score. A model or prompt change needs it (12.3).

### 12.11.2 The weekly report

Each Monday, `algo agent report` writes `reports/agents/<YYYY-Www>.md` and posts its summary on the repository's discussion board:

| Part | Content |
|---|---|
| throughput | items done by role and by ladder; levels gained (for example "+412 I3 in Kotlin, +38 H3") |
| cost | spend by role against the budget; cost per merged item; the 10 most expensive items |
| quality | pass rate of runs; jury pass rate; defects found by human sampling, per role and per model; reverts |
| stuck | items at `needs-human`, with the top reasons |
| safety | runs stopped by rule A04 or by 12.8, with links |
| next | the top 20 items of the queue |

## 12.12 Cost

### 12.12.1 Cost of one item (estimates; M0 measures them)

| Item | Cost each | Notes |
|---|---|---|
| implementation with native tests, one language | $0.30–1.00 | 1 to 3 rounds; tier-2 languages and generic code at the high end |
| shared cases and generators of a problem | $1–3 | |
| scene with presets and narration | $1–4 | V06 is the usual cause of extra rounds |
| prose of a page at W3 | $1.50–4 | core pages with opus at the high end; plus jury $0.50–1.50 |
| human proof and complexity analysis | $2–6 | plus jury |
| Lean spec and statements | $3–10 | a person reviews them |
| Lean proof | $5–50 | the long tail of hard proofs can be higher; above the item cap, it goes to `needs-human` |
| scout, linker, curator item | $0.02–0.30 | |

### 12.12.2 Totals

At 10,000 nodes (02.4), about 3,000 algorithms and data structures, with 10 tier-1 and 13 tier-2 languages, there are about 35,000 implementations that agents write (08.7). The core (about 1,000 nodes) gets Lean proofs.

| Work | Count (estimate) | Cost (estimate) |
|---|---|---|
| implementations (tier 1 and tier 2) | 35,000 | $15,000–25,000 |
| cases, generators, mutation follow-ups | 2,500 problems | $4,000–6,000 |
| scenes | 2,000 | $3,000–6,000 |
| prose of pages | 10,000 | $15,000–25,000 |
| human proofs | 3,000 | $8,000–15,000 |
| Lean specs and proofs | 1,000 core nodes, about 3,000 theorems | $20,000–35,000 |
| juries, retries, scouting, linking | none | $8,000–12,000 |
| **total, M0 to M5** | | **about $75,000–125,000**, against the $99,500 of 19 |

After M5, maintenance is about $2,000 a month (19.7): new items from the weekly harvest, re-runs after toolchain bumps and contract changes.

## 12.13 Rules

These rules are part of the audit, listed in 13.3.

| Rule | Check |
|---|---|
| A01 | each file of a node directory has a provenance line for its current hash |
| A02 | each agent provenance line names a run record that exists, with a model and a prompt version that are in `models.yaml` history |
| A03 | an agent change writes only files of its role's allow list, and never `registers/`, `manifests/`, `schema/`, `prompts/` or `.github/` |
| A04 | an agent change does not weaken a check: it deletes no case, skips no test, adds no `sorry`, axiom or `native_decide`, and changes no threshold or spec |
| A05 | a part in state `agent-checked` carries the label on the page and in the `.md` and `.json` copies |
| A06 | contracts, checkers, Lean specs and statements are merged only with a person's approval |
| A07 | an auto-merged change passed every gate of 12.9 for its kind, and its jury vote is in the run record |
| A08 | no run started after its role's monthly budget was spent, and no run passed its cap by more than one model call |
| A09 | the author model did not vote on its own jury, and each prose or proof jury had a voter of another family |
| A10 | each prompt version used by a merged run exists in `prompts/` and has an eval result (12.11) |
| A11 | no badge "reviewed", H3, V3 or W5 rests on a review record that an agent signed |
| A12 | an agent's new external links are sources of the register (11.2) |
