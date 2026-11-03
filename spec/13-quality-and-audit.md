# 13. Quality and audit

This document says how the corpus stays correct after it is written.
It has four parts: the badges a reader sees (13.1), the review records that people sign (13.2), the audit rules that the build runs (13.3), and the human sampling that measures what the machine checks miss (13.4).
It ends with findings and incidents (13.5), the reports (13.6) and who decides (13.7).

The principle is the same as in math2: a level or a badge is a claim, and each claim has evidence that a program can check.
The build computes every level from evidence (04.8).
A person's judgement enters only through a signed review record bound to the hashes of what they read.

## 13.1 Badges

A badge is a short summary of the ladders for a reader.
The build computes it at each deploy.
Nobody writes a badge, and rule T05 rejects one in front matter.

| Badge | Shown when | Words on the page | Evidence it links to |
|---|---|---|---|
| **Proved in Lean** | L2 or more | "correctness" at L2, "correctness and cost" at L3, "and the Rust code" at L4 | the `/lean/` page with the theorems and the axiom report (07) |
| **Full proof** | H2 | "Full proof", in the neutral colour | the `/proof/` page |
| **Proof reviewed** | H3 | "Proof reviewed", with the tick colour | the proof and its review record (13.2) |
| **Tested in N languages** | at least one language at I2 or more | N counts the languages at I2 or more; the hover lists each with its level | the `/tests/` page of the problem and `/matrix/` (14.19) |
| **Tested everywhere** | each tier-1 language at I3 and each tier-2 language at I2 (08.8) | "Tested everywhere" in place of the count | the same |
| **Visual** | V2 or more | "Visual", and "Visual · reviewed" at V3 | the `/visualize/` page |
| **Reviewed** | every part of the page is in state `human-reviewed` or `agent-reviewed` (12.7.2) for its current hash, and W5 | "Reviewed" in the head of the page, with the reviewers' names on hover | the list of review records of the node |
| **Complete** | C6 (16.2): H3, L3, I3 in each tier-1 language, I2 in each tier-2 language, V2 and W4 | "Complete" in the "About this page" table and on area pages | the ladder table of the node |

Rules for badges:

1. **No red crosses.** A missing badge is not shown. The "About this page" table (14.4) shows every ladder with its level and the first reason it is not higher.
2. **Hashes, not dates.** A badge that needs a review holds only while the reviewed hashes are current. A change to a reviewed file drops the badge at the next build, and the page shows "Changed since review" on that part until a person reviews the new hash.
3. **Kinds that do not apply.** A badge that cannot apply to a kind is not counted against it. A concept has no "Tested" badge, and a person page has no badge at all. `schema/levels.v1.yaml` lists the ladders of each kind, from 04.8.
4. **The same badges everywhere.** The page, the `.md` and `.json` copies (14.8), the search results (15) and the MCP tools show the same badges from the same data.
5. **Agents cannot give a badge that needs a person.** "Proof reviewed", "Visual · reviewed", "Reviewed" and W5 need a review record that a person signed (rule A11).

## 13.2 Review records

### 13.2.1 The record

A review is a YAML file in `reviews/<tag>/<part>.yaml`, committed in a signed commit by the reviewer.
The schema is `schema/review.v1.json`.

| Part | File name | Hashes it binds | Raises |
|---|---|---|---|
| the text of the page | `text.yaml` | `node.md` | W5 |
| a human proof | `proof-<id>.yaml` | `proofs/<id>.md`, and the claim lines of `node.md` that it proves | H3 |
| the Lean spec | `lean-spec.yaml` | the Definition section of the problem, the elaborated type of the spec, the human proof when it covers it (07.7) | L1 on the core, and L2 to count on the core |
| a problem contract | `contract.yaml` | `contract.yaml`, `checker.py`, the Definition section | S06, and auto-merge of its implementations (12.9) |
| an implementation | `impl-<lang>.yaml` | each file of `impl/<lang>/` | I4 |
| a scene | `scene.yaml` | `viz/scene.ts` (or `explorable.ts`) and `viz/presets.yaml` | V3 |
| a sample (13.4) | `sample-<date>-<n>.yaml` | the sampled files | none; it records a defect or a pass |

An example, for the proof of merge sort:

```yaml
reviewer: alice                          # a login in registers/reviewers.reg
date: 2027-05-02
part: proof-invariant
hashes:
  proofs/invariant.md: blake3:d2f7…
  node.md#claims: blake3:71b0…           # the hash of the claim lines only
checklist: proof/v2                      # the checklist of 13.4 that was used
verdict: pass                            # pass | changes | fail
items:                                   # only for changes or fail
  - {check: 3, where: "proofs/invariant.md:L18", note: "the case k = r is not covered"}
time_spent_min: 25
conflicts: none                          # or a short statement
```

`algo review <slug> <part>` writes the record with the current hashes, opens the checklist, and leaves the file for the reviewer to fill and commit.
A record with the verdict `changes` or `fail` opens an issue on the node with its items.

### 13.2.2 What makes a record count

The build counts a record only when all of these hold:

1. The commit that adds it is signed (SSH or GPG) by a key listed for the reviewer in `registers/reviewers.reg`, and GitHub shows it as verified.
2. Every hash in `hashes` is the current hash of its file (rules L04, S06 and A11 use the same check).
3. The reviewer is not an author of any of the reviewed hashes, by the provenance log (04.7, 12.7). A person who changed one line of a proof cannot review that proof.
4. The reviewer's areas in the register include the node's area, or the reviewer is a maintainer. For a Lean spec the reviewer also has the `lean` skill.
5. The verdict is `pass`.

A record that fails a condition stays in the repository and is shown in the review history, but it raises no level.
When a file changes, its old records stay, marked stale.
A reviewer can renew a stale record with `algo review -renew`, which shows the diff since the reviewed hash and writes a new record.

### 13.2.3 The register of reviewers

`registers/reviewers.reg` has one line per reviewer, as in math2:

```
alice  "Alice Nguyen"  areas=sorting,graphs,strings  skills=proof,lean,code:rust,code:go  affiliation="Example University"  keys=ssh:SHA256:Xc3…  since=2027-04
```

- **Who adds a reviewer.** A maintainer, after the person has five reviews that a maintainer checked and found right. The line comes in a pull request that the reviewer signs too.
- **Skills.** `proof`, `lean`, `text`, `scene`, `contract` and `code:<lang>`. A record counts only for a part that matches one of the reviewer's skills.
- **Conflicts.** A reviewer states a conflict in the record (the author is a student, a co-author or an employer). A maintainer may let the record count with a note.
- **Leaving.** A reviewer who leaves keeps their past records. Their line gets `until=<date>`.
- **Errors.** When a reviewed part later turns out to be wrong (13.5), the record is marked `overturned` with a link to the finding. A reviewer with two overturned records in a year has their next ten reviews checked by a second person.

The register is public on `/reviewers/` (14.19), with the counts of each person.

### 13.2.4 The review queue

`algo queue` (12.4) has review items as well as writing items.
Their order is: contracts of the core first (they unblock auto-merge), then Lean specs of the core, then proofs of `intro` and `core` nodes, then the text of the gold set and of courses, then implementations and scenes.
Within each group, nodes with more readers come first.
The weekly report (13.6) shows the length of each group, and Q-18 sets the response when it grows.

## 13.3 The audit

### 13.3.1 How it runs

`algo audit` runs every rule of this section.
`algo check -changed` runs the rules of the nodes that a pull request touches, and of the nodes whose edges point to them.
`audit.yml` runs the full audit daily, and the release runs it before the tag (18.4).

Each rule has an id: a letter for its family and two digits.
Each finding has the rule id, the node or file, a line when there is one, and a message that says what to do.
The findings go to `reports/audit/<date>.jsonl` and to `reports/audit/latest.md`.

### 13.3.2 Severities

| Severity | Meaning |
|---|---|
| **block** | the pull request cannot merge, and on `main` the deploy stops |
| **level** | the part stays below the level that needs the rule; the finding is the reason that `algo status` and the "About this page" table show |
| **warn** | reported, counted in the weekly report, no effect on merges or levels |
| **sample** | the rule picks items for a person to check (13.4); a defect found becomes a finding of the rule |

A rule can have two severities, by scope: block on the core and level on the long tail, for example.
The table says so with "block (core)".

### 13.3.3 Waivers

A waiver turns one finding off for one node.
It lives in `registers/waivers.yaml`:

```yaml
- rule: I13
  node: fibonacci-heap
  lang: c
  reason: "the reference needs its own allocator in C; 260 lines"
  by: alice
  until: 2027-12-31
```

- A waiver has a person, a reason and an end date at most one year away. It ends by itself.
- These rules cannot be waived: T01, T02, T05, L03, I07, I18, S06, A03, A04, A06, A11, C01, C02, C06. They protect correctness, the sandbox, the review rules and the licences.
- Waivers of coverage are a separate list (16.2) with rule U02.
- `/coverage/` and the weekly report count the waivers of each rule. A rule with more than 20 waivers is reviewed: either it is wrong or the corpus is.

### 13.3.4 The rules

Each document that adds rules describes them in place.
This is the full list.
The column "Spec" names the section that explains the rule.

**T: tags, identity and front matter**

| Rule | Checks | Severity | Spec |
|---|---|---|---|
| T01 | `node.md` front matter is valid against `schema/node.v1.json` for its kind | block | 04.4 |
| T02 | each tag is in `registers/tags.reg`, once, with its slug; a retired tag is never reused | block | 04.2 |
| T03 | each slug is unique, lowercase kebab-case, at most 60 characters, and not an old slug in `aliases.reg` | block | 04.2 |
| T04 | the path of the node matches its `area` and kind (18.1) | block | 04.3 |
| T05 | no status, level or badge is written in front matter | block | 04.8 |
| T06 | no provisional id is left on `main` | block | 04.2 |
| T07 | a new node's name and aliases do not match an existing node's name or alias, unless the pull request links a disambiguation entry | block | 15.10 |

**G: the graph**

| Rule | Checks | Severity | Spec |
|---|---|---|---|
| G01 | `prereqs` edges form a DAG | block | 04.6, 05.6 |
| G02 | `variant_of` and `generalizes` edges have no cycle | block | 04.6 |
| G03 | each `solves` target is a problem node | block | 04.6 |
| G04 | each `implements` target is an abstract type | block | 04.6 |
| G05 | each edge target exists and is not retired; an edge to an alias slug is rewritten by `algo fmt` | block | 04.6 |
| G06 | each node of the core has a `prereqs` path back to the `foundations` area | level (W3) | 05.6 |
| G07 | no edge points to its own node; `see_also` has at most 8 targets | warn | 04.6 |
| G08 | each `model` and `lower_bound` edge names a model node, and each `uses_math` edge names a math2 tag that exists in the pinned math2 release | block | 04.6 |
| G09 | a core algorithm whose `solves` edge has no `requires` does not mention, in its text, a key of the problem's `constraints` as a condition | level (W4) | 04.4, 15.4 |

**E: complexity claims**

| Rule | Checks | Severity | Spec |
|---|---|---|---|
| E01 | each complexity string parses in the grammar of 04.4 | block | 06.6 |
| E02 | each claim of the front matter appears in the Complexity section | level (W2) | 06.6 |
| E03 | the comparison tables and the front matter agree | block | 06.6, 14.5 |
| E04 | each variable of a claim is defined in `vars`, and the model exists | block | 04.4, 06.6 |

**W: writing**

| Rule | Checks | Severity | Spec |
|---|---|---|---|
| W01 | the section headings of the kind, in order, with no empty section | level (W1) | 06.3 |
| W02 | one sentence per line in Markdown source | warn; `algo fmt` fixes it | 06.2 |
| W03 | pseudocode line ids are stable and unique; every `@line` marker and `v.line` call names an existing id | block | 06.4 |
| W04 | In plain words has at most 150 words and no undefined symbol | level (W2) | 06.3 |
| W05 | the example of the page matches a scene preset or a figure | level (W3) | 06.7 |
| W06 | each pitfall names a test case that exists | level (W4) | 06.7 |
| W07 | no formula fails to render in KaTeX | block (core), level (W2) elsewhere | 14.10 |
| W08 | axe-core finds nothing "serious" or "critical" on the sampled pages | block | 14.14 |

**P: human proofs**

| Rule | Checks | Severity | Spec |
|---|---|---|---|
| P01 | proof front matter is valid; `proves` names claims that exist in the front matter | block | 06.5 |
| P02 | at H2, each correctness and complexity claim has a full proof | level (H2) | 06.5 |
| P03 | a proof marked `sketch` is shown as a sketch; a full proof has a statement, steps and an end | level (H2) | 06.5 |
| P04 | each `uses` of a proof names an existing proof or theorem | block | 06.5 |
| P05 | a Θ claim has a proof of the lower bound | level (H2) | 06.5 |
| P06 | a proof with `lean:` names an existing theorem (with L01) | block | 06.5 |

**L: Lean**

| Rule | Checks | Severity | Spec |
|---|---|---|---|
| L01 | each Lean name in the front matter exists in `build/lean/decls.jsonl` with the expected kind | block | 07.12 |
| L02 | the correctness theorem mentions the bound spec and model | level (L2) | 07.3 |
| L03 | cited theorems use only `propext`, `Classical.choice` and `Quot.sound`; no `sorryAx`, `ofReduceBool`, package axioms or `implemented_by` | block | 07.5 |
| L04 | the fidelity review of a core node is current for all its hashes | level (L1 on the core) | 07.7 |
| L05 | at L3, each time and count claim has an explicit bound and a class lemma that matches the front matter | level (L3) | 07.4 |
| L06 | the spec accepts the expected outputs of the cases and rejects the mutated ones; it is not vacuous | block | 07.7, 09.5 |
| L07 | the model is total (no `partial`) and computable (no `noncomputable`) | level (L2) | 07.13 |
| L08 | at L4, the refinement theorem is proved against a fresh extraction of the current Rust file | level (L4) | 07.6 |
| L09 | the module path mirrors the node path | block | 07.2 |
| L10 | each module builds in at most 60 seconds on the CI runner | warn; block above 300 seconds | 07.18 |

**I: implementations** (08.13)

| Rule | Checks | Severity |
|---|---|---|
| I01 | it builds with no warnings under the flags of the register | level (I1) |
| I02 | it passes each shared case of the contract | level (I1) |
| I03 | it passes the random and adversarial differential tests against the oracle | level (I2) |
| I04 | its tests kill at least 85% of the mutants | level (I2) |
| I05 | the formatter makes no change and the linter reports nothing | level (I3) |
| I06 | the complexity check passes | level (I3); a gross mismatch blocks (Q-13) |
| I07 | standard library only | block |
| I08 | no overflow inside the contract bounds; the extreme cases pass | level (I2) |
| I09 | the deep-input case passes | level (I2) |
| I10 | the licence header is present | block; `algo fmt` adds it |
| I11 | the `@line` markers cover the pseudocode line ids and name only existing ids | level (I3) |
| I12 | the language is in the register, and the file names and the package line follow its conventions | block |
| I13 | a reference version is longer than 200 lines | warn |
| I14 | the entry point has the canonical signature of the contract | level (I1) |
| I15 | no generated file under `build/` is committed | block |
| I16 | an `optimized` version is at least 1.3× faster on the largest benchmark size | level: the file is shown as a second reference, not as optimized |
| I17 | the results are the same on amd64 and arm64 | level (I2) |
| I18 | tests of a pull request run only in the sandbox | block |

**S: contracts and tests** (09.13)

| Rule | Checks | Severity |
|---|---|---|
| S01 | `contract.yaml` is valid against its schema; each complexity variable of each solving algorithm is a size parameter or is defined | block |
| S02 | each case validates against the contract and meets `pre`; when `expect` is given, the oracle agrees | block |
| S03 | the checker gives the right verdict on every checker case, with a reason for each rejection | block |
| S04 | `edge.jsonl` has at least one case for each class of `edge_classes` | level (I2 for every implementation of the problem) |
| S05 | each generator is deterministic for its seed and meets `pre` | block |
| S06 | the contract of each core problem is reviewed by a person, bound to its hash | level: no auto-merge of its implementations, and no I2 on the core |
| S07 | the Lean oracle, the reference and the brute force agree on all tiny and small inputs | block |
| S08 | at most 5% of mutants are marked equivalent, each with a reason; the oracle meets each metamorphic relation | level (I2) |
| S09 | a flaky case is marked, counts as a failure and has an open issue | block |

**V: visualization** (10.8.2)

| Rule | Checks | Severity |
|---|---|---|
| V01 | the scene builds, imports only `@algo/viz`, and uses no DOM, network, timer or unseeded random | block |
| V02 | the trace is deterministic: the same input gives the same trace hash twice | block |
| V03 | the result agrees with the oracle under the checker, on each preset and on 50 random inputs within the limits of the scene | block |
| V04 | each `line` id of the trace is a line id of the pseudocode of the page | block |
| V05 | the presets together reach every line id of the pseudocode | level (V2) |
| V06 | line-trace agreement with the TypeScript reference (10.5) | level (V2) |
| V07 | the counters respect the complexity claims of the front matter | level (V2) |
| V08 | the budgets of 10.8.3 hold | level (V2) |
| V09 | each phase has a note of at most 140 characters; every state used is in the vocabulary; the text view renders each step | level (V2) |
| V10 | the presets are valid under the contract and the limits of the scene, and there are at least 3 | level (V2) |
| V11 | the filmstrip and the social image render | level (V1) |
| V12 | each control of an explorable has a label and a range, and each value of the range draws without error | level (V2) |
| V13 | the scene uses only the primitives of `@algo/viz` | block |

**A: agents and provenance** (12.13)

| Rule | Checks | Severity |
|---|---|---|
| A01 | each file of a node directory has a provenance line for its current hash | block |
| A02 | each agent provenance line names a run record that exists, with a model and a prompt version that are in `models.yaml` history | block |
| A03 | an agent change writes only files of its role's allow list, and never `registers/`, `manifests/`, `schema/`, `prompts/` or `.github/` | block |
| A04 | an agent change does not weaken a check: it deletes no case, skips no test, adds no `sorry`, axiom or `native_decide`, and changes no threshold or spec | block |
| A05 | a part in state `agent-checked` carries the label on the page and in the `.md` and `.json` copies | block |
| A06 | contracts, checkers, Lean specs and statements are merged only with a person's approval | block |
| A07 | an auto-merged change passed every gate of 12.9 for its kind, and its jury vote is in the run record | block; a finding on `main` reverts the change |
| A08 | no run started after its role's monthly budget was spent, and no run passed its cap by more than one model call | warn; the role is paused |
| A09 | the author model did not vote on its own jury, and each prose or proof jury had a voter of another family | block |
| A10 | each prompt version used by a merged run exists in `prompts/` and has an eval result (12.11) | block |
| A11 | no badge "reviewed", H3, V3 or W5 rests on a review record that an agent signed | block |
| A12 | an agent's new external links are sources of the register | block |

**C: copying and licences** (11.5, 17.8)

| Rule | Checks | Severity |
|---|---|---|
| C01 | the copy check finds no overlap over the thresholds of 11.5 with a class B or D source; for class A and C sources it asks for attribution | block (B, D); warn (A, C) |
| C02 | `reuse lint` passes: every file has a licence from `REUSE.toml` | block |
| C03 | every source with `adapted: true` has a licence of class A, B or C, and the page footer carries the attribution | block |
| C04 | a person page's photo has a Commons licence of CC0, CC BY or CC BY-SA and a credit line | block |
| C05 | an exercise body has no run of more than 12 words that matches the captured statement of its judge | block |
| C06 | no file in the MIT zone has its origin in a class B or D source in `prov/` | block |

**X: site, search, taxonomy and links**

| Rule | Checks | Severity | Spec |
|---|---|---|---|
| X01 | every internal link and anchor resolves | block | 14.16 |
| X02 | external links answer, checked weekly; a link dead for 3 weeks is replaced by its archive copy | warn | 14.16 |
| X03 | each entry of `sources` names a source of the register, and each book has a locator | block | 11.1 |
| X04 | a sub-area has at most 150 nodes, and after M3 at least 5 | warn | 05.2 |
| X05 | the `level` field of a sample of nodes is checked by a person | sample | 05.5 |
| X06 | no node slug is a reserved word or a language id | block | 14.2 |
| X07 | a core node has at least two aliases when its universe items list more names | level (W3) | 15.2 |
| X08 | `registers/search-pins.yaml` has at most 200 entries, each with a reason | block | 15.7 |
| X09 | search success at 5 is at least 95% and drops at most 1 point from the last release | block (release) | 15.8 |
| X10 | the `practice_for` links of exercises are checked by a person on a sample | sample | 11.4 |

**U: the universe and coverage** (16.8)

| Rule | Checks | Severity |
|---|---|---|
| U01 | an item with outcome `section` points to an anchor that exists in its node | block |
| U02 | waivers of 16.2 are at most 15% of the nodes of an area, and each has a reason from the fixed list | block |
| U03 | every node of a course is in the core or is a definition or concept that a core node needs | block |
| U04 | every concept of a crosswalk file has a decision | block (release) |
| U05 | every universe item with outcome `node`, `alias`, `section` or `merged` points to a tag that exists and is not retired | block |
| U06 | an alias outcome has its name in the node's `aliases` | block; `algo fmt` adds it |
| U07 | `pending` items older than 30 days are listed in the weekly report with their source | warn |
| U08 | each canon table of contents (11.8) has been checked against the book by a person | sample; until then its rows count as `pending` |

### 13.3.5 Adding or changing a rule

A new rule comes in a pull request on `tamnd/algorithm-agent` and on this document together.
It lands as `warn` for one release, so the corpus can be fixed before it blocks.
The release notes list new and changed rules.
A threshold change (85% of mutants, 150 words, 60 seconds) is a rule change, and agents cannot make it (A04).

## 13.4 Human sampling and checklists

The machine checks prove that code agrees with a proved model and that a proof compiles.
They cannot prove that the prose is clear, that a pitfall is real, that the code is idiomatic, or that the Lean spec says what the page says.
Juries of models (12.10) catch some of this.
Sampling by people measures how much they miss.

### 13.4.1 The sample

Each Monday, `algo queue` draws a sample of the parts merged in the last 7 days whose state is `agent-checked`, and adds them as review items with the label `sample`.

| Stratum | Sample each week |
|---|---|
| implementations, per role and tier | 2% of merged files, at least 10 and at most 60 |
| prose sections (text, human proofs) | 5% of merged pages, at least 10 |
| scenes | 5%, at least 5 |
| shared cases and generators | 2%, at least 5 |
| Lean proofs | none: the kernel checks them; the statements are always reviewed (A06) |
| levels of nodes (X05), `practice_for` links (X10) | 20 of each |

- The draw is random, with a seed written in `reports/sampling/<date>.yaml`, so anyone can redo it.
- Strata are by role, language, area and model, so a defect that one model makes in one language shows up.
- A person who is not the author takes a sample item, uses the checklist of its part, and writes a record `reviews/<tag>/sample-<date>-<n>.yaml` (13.2.1). A pass of a sample also counts as a review of that hash, so sampled parts gain their badge.

### 13.4.2 Defects

| Class | Examples | Effect |
|---|---|---|
| **critical** | a wrong result on a valid input that the tests missed; a false statement in a proof; a Lean spec that does not mean the page's claim; copied text or code; a security hole in a runner path | the part is quarantined at once (12.7.2), a regression case is added (09.11), and 13.5 applies |
| **major** | a misleading explanation; a wrong complexity in prose; a pitfall that is not real; code that ignores the conventions of its language (08.3); a scene whose narration contradicts the proof | the part is fixed in the work queue with a high weight |
| **minor** | style, wording, a weak example, a name | an issue; counted but not in the rate |

The **defect rate** of a stratum is the number of sampled parts with a critical or major defect, divided by the number sampled, over the last 30 days.

### 13.4.3 Limits

| Limit | Effect |
|---|---|
| defect rate above **1%** of auto-merged files of a role, over 30 days, with at least 100 samples | auto-merge stops for that role (Q-09, 12.9); it starts again after a person accepts a fix and two clean weeks |
| any critical defect in an auto-merged file | the 30 days of that role's merges in the same language get a second sample at 10% |
| M2 exit: defect rate under **2%** of sampled implementations and **5%** of sampled pages (19.4) | the milestone is not done until both hold |
| M4 and after: the M2 limits hold every month (19.6) | a month over the limits makes the next month's queue fix-first for that stratum |
| a jury passed a part that sampling found critical or major | counted against the jury (12.10); a jury model above 5% loses its seat for that part kind |

The rates are estimates until the first 1,000 samples, so the report shows each rate with its 95% interval (Wilson) and the number of samples.

### 13.4.4 Checklists

Each part kind has a checklist in `REVIEWING.md`, versioned (`proof/v2`), and the record names the version.
The checklists are short on purpose.

**Text (W5).**
1. The Idea and In plain words are right and can be followed by a reader at the node's level.
2. Every claim of the page has its proof, its test or its source.
3. The example is right, and it matches the preset or figure.
4. Each pitfall is real and names its test case.
5. When to use it gives a real reason against the alternatives.
6. History has a source and names people correctly.
7. No sentence reads as copied from a known book (a suspicion becomes a C01 hand check).

**Human proof (H3).** The list of 06.5: the statement is the page's claim with the same hypotheses and model; every step follows; every case is covered; the invariant is initialized, maintained and used; termination has a measure; the complexity derivation counts the right operations; each cited lemma says what it is used for.

**Lean spec (L1, L2 on the core).** The list of 07.7: the input domain, the output relation, the model of cost, the counted operations, and that the spec is not vacuous.

**Contract (S06).** The input and output types match the Definition; `pre` and `post` are complete; the checker accepts every right answer when the answer is not unique; the edge classes cover the known failure modes of the problem; the size limits are realistic.

**Implementation (I4).** It follows the page's pseudocode and names the line ids; it reads as idiomatic code of its language (08.3); names are clear; comments explain why, not what; no dead code; no clever trick that the page does not explain; errors and empty inputs follow the contract.

**Scene (V3).** Each step teaches something; the narration is true to the proof; the colours have the meanings of the vocabulary and pass contrast; the text view says the same as the picture; the presets show the interesting cases (the worst case, a tie, the empty input).

### 13.4.5 People's time

At the M2 rate (about 9,000 implementations and 1,200 pages in 3 months), the sample is about 60 implementations and 25 pages a week.
At 5 minutes a file and 20 minutes a page, that is about 13 hours a week of reviewer time (estimate).
This is the budget that makes "agents at scale" honest.
When the register of reviewers cannot cover it, the agents' merge rate is lowered to what the sample can cover, not the sample to what the agents produce.

## 13.5 Findings and incidents

### 13.5.1 Where findings come from

| Source | Example | Goes to |
|---|---|---|
| the audit | E03: a table says Θ(n²), the front matter Θ(n log n) | the pull request or `reports/audit/` |
| sampling | a critical defect in a Kotlin file | 13.4.2 |
| a reader | "Report a problem" (14.4, 17.7) with the choice wrong, unclear, copied, rights or other | an issue with the label of the choice |
| a reviewer | a review with the verdict `fail` | an issue on the node |
| upstream | a bug fixed in Lean, Mathlib or CSLib; a language toolchain bug | the bump pull request (18.5) |
| the differential tests | a new random case where two languages disagree | a regression case and an issue (09.11) |

### 13.5.2 Severity of incidents

An incident is a finding about something already on the site.

| Level | Meaning | Examples | Response time |
|---|---|---|---|
| **S1** | a reader can be harmed or misled in a way that matters, or the project is exposed | a wrong algorithm or a false proof on a core page; copied content; a security issue in the toolchain or the runners; a Lean proof that rests on a soundness bug | quarantine within 1 day; the fix and a note within 7 days |
| **S2** | wrong but limited | a wrong bound on a long-tail page; a failing implementation in one language that the tests missed | fixed within 14 days, through the work queue |
| **S3** | a defect of quality | an unclear proof; a weak scene | the work queue |

### 13.5.3 The response to an S1

1. **Quarantine.** `algo quarantine <slug> <part> -reason "…"` sets the state `quarantined` (12.7.2). The part leaves the site at the next deploy, at most 20 minutes later (14.9), and the page says "This part was withdrawn on <date> while we check it", with a link to the issue.
2. **Lower the levels.** The quarantined part counts as missing, so the ladders fall and the badges with them. Review records of the part are marked `overturned` when they passed something wrong.
3. **Find the cause.** The run records, prompt versions and juries of the part are in the provenance. The question is "why did the checks pass?", and the answer is a missing case, a weak spec, a weak checker, a rule that was off, or a review that missed it.
4. **Fix the check first.** A regression case, a stronger property, a new mutation operator, a new audit rule or a checklist item lands before or with the fix. The aim is that the same defect cannot pass again anywhere.
5. **Look for siblings.** The same model, prompt version and role in the same 30 days get a targeted sample at 10% (13.4.3). The same mistake in other languages of the same node is checked by hand.
6. **Write the note.** `reports/incidents/<date>-<slug>.md`: what was wrong, how long it was public, how it was found, why the checks passed, what changed. S1 notes are linked on `/latest/` (14.19).

Special cases:

- **Copying.** 17.7 sets the steps and the deadlines.
- **A Lean soundness issue.** When a Lean, Mathlib or CSLib release reports a soundness bug, `algo lean status` lists the theorems whose axiom reports or tactics touch it, the levels of those nodes are held at L1 until the pin moves to the fixed release, and the badges say "re-checking".
- **A runner escape.** SECURITY.md of `tamnd/algorithm-agent` has the private address. The images are rebuilt, the build server's keys are rotated, and the runs since the last known good image are re-run.
- **A wrong contract.** All implementations of the problem are re-tested against the fixed contract, and their I levels are recomputed. A wrong contract is S1 for a core problem.

## 13.6 Reports

| Report | Path | Every | Shows |
|---|---|---|---|
| audit | `reports/audit/latest.md` | day | findings by rule and severity, new and fixed since yesterday, waivers by rule |
| quality | `reports/sampling/<week>.md` | week | samples drawn and done, defect rates per stratum with intervals, juries against people, roles with auto-merge stopped |
| reviews | `reports/reviews/<week>.md` | week | the review queue by group, records added, stale records, overturned records, reviewers' counts |
| incidents | `reports/incidents/` | each incident | 13.5.3 |
| release | `manifests/releases/<YYYY.MM>.yaml` and the release notes | month | ladder counts, coverage, rule changes, open S1 and S2 incidents (an open S1 holds the release) |

The weekly quality report is joined with the agent report of 12.11, so cost and quality are read together.
`/coverage/` and `/reviewers/` show the public parts of these reports.

## 13.7 Who decides

- **The maintainer** sets the rules and the thresholds, approves waivers, merges rule changes, and declares S1 incidents.
- **Area editors** (from the register of reviewers, Default: from M3) review contracts and Lean specs of their area, decide `level` disputes (X05), and take the sample items of their area first.
- **Any reviewer** may quarantine a part for an S1 suspicion. The maintainer confirms or lifts it within 1 day.
- **Agents** draft review records, open findings and propose fixes. They never sign a review, change a rule, add a waiver or lift a quarantine (A03, A04, A11).
