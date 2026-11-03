# 17. Legal and licensing

This document says under which licence each part of the corpus is published, what the project may take from each kind of source, how text written by agents is labelled, and how a rights holder gets something removed. It follows math2 and olymmath, with one change that algorithms force: the corpus holds a lot of code, and code and prose need different licences.

This is a design, not legal advice. The points marked "Default" are decisions of document 20 that a lawyer's check may change.

## 17.1 Licence zones

Each file of `tamnd/algorithm` is in one zone, set by its path.

| Zone | Paths | Licence | Why |
|---|---|---|---|
| prose | `nodes/**/node.md`, `nodes/**/proofs/*.md`, `nodes/**/notes/*.md`, `topics/**/*.md`, translated text under `i18n/` | CC BY-SA 4.0 | the licence of Wikipedia and CP-Algorithms text, so text from class B sources can be adapted with attribution (17.2); as math2 |
| figures | static figures in `nodes/**/fig/`, and every image the build makes from a scene (frames, social images) | CC BY-SA 4.0 | they explain the prose and travel with it |
| implementations and tests | `nodes/**/impl/**`, `nodes/**/cases/**`, `nodes/**/contract.yaml`, checkers and generators | MIT | readers copy code into their own programs, often closed ones; MIT asks only for the notice. A share-alike licence on code would stop most of that use |
| scenes | `nodes/**/viz/**` | MIT | they are code, and `@algo/viz` is MIT |
| Lean | `lean/**` | Apache-2.0 | the licence of Mathlib and CSLib, so code can move between them in both directions |
| metadata | front matter (the YAML block of `node.md`, kept as a separate REUSE annotation), `registers/**`, `topics/*.yaml`, `topics/crosswalk/**`, `reports/**`, `prov/**`, `schema/**`, `manifests/**` | CC0 1.0 | facts about the corpus should be free to reuse with no conditions, as Wikidata's are |
| toolchain | all of `tamnd/algorithm-agent` | Apache-2.0; `@algo/viz` MIT | as math2-agent |

**The front matter** is in the same file as the prose. REUSE allows one licence per file, so the file is marked `CC BY-SA-4.0 AND CC0-1.0`, and `LICENSES/README.md` says that the YAML block between the first two `---` lines is CC0 and the rest is CC BY-SA. The `.json` copies on the site (14.8) carry the front matter fields under CC0 and the body under CC BY-SA, in a `license` object.

**REUSE.** The repository follows REUSE 3.3. Licences are set by path in `REUSE.toml`, not by a header in every file, so that implementations stay clean to copy:

```toml
version = 1

[[annotations]]
path = ["nodes/**/node.md", "nodes/**/proofs/**", "nodes/**/notes/**", "topics/**.md", "i18n/**"]
SPDX-FileCopyrightText = "The algorithm contributors <https://algorithm.tamnd.com/about/>"
SPDX-License-Identifier = "CC-BY-SA-4.0 AND CC0-1.0"

[[annotations]]
path = ["nodes/**/impl/**", "nodes/**/cases/**", "nodes/**/contract.yaml", "nodes/**/viz/**",
        "nodes/**/checker/**", "nodes/**/gen/**"]
SPDX-FileCopyrightText = "The algorithm contributors <https://algorithm.tamnd.com/about/>"
SPDX-License-Identifier = "MIT"

[[annotations]]
path = ["lean/**"]
SPDX-FileCopyrightText = "The algorithm contributors"
SPDX-License-Identifier = "Apache-2.0"

[[annotations]]
path = ["registers/**", "topics/*.yaml", "topics/crosswalk/**", "reports/**", "prov/**",
        "schema/**", "manifests/**"]
SPDX-FileCopyrightText = "The algorithm contributors"
SPDX-License-Identifier = "CC0-1.0"
```

Audit rule C02 (13.3) runs `reuse lint` and fails on any file with no licence.

**On the site.** Each node page shows the licences in its footer: "Text CC BY-SA 4.0 · Code MIT · Lean Apache-2.0". Each implementation's header line (14.7.4) has "MIT" with a link. The "Copy" button copies the code alone; the "Raw" file starts with one SPDX comment line (`// SPDX-License-Identifier: MIT` and a URL), added by the build, so a copied file keeps its notice. The MIT notice names "The algorithm contributors" and the URL of the node, so attribution is one line.

**Inbound = outbound.** A contribution is under the licence of the zone it lands in. Contributors sign off each commit with the Developer Certificate of Origin (`Signed-off-by:`), checked by the DCO app. There is no CLA, as in math2 (Default).

**Third-party parts that the site uses** are listed with their licences in `algorithm-agent/THIRD_PARTY.md`: Inter and STIX Two Math (SIL OFL 1.1), KaTeX (MIT), goldmark (MIT), Chroma (MIT), SubVerso (Apache-2.0), esbuild (MIT), Mathlib and CSLib (Apache-2.0).

## 17.2 Source classes and the no-copy stance

Each source of the source register (11.1) has a class. The class says what the project may take from it.

| Class | Licence of the source | Examples | May take |
|---|---|---|---|
| A | public domain, CC0 | Wikidata, NIST DADS facts (a US government work, though DADS asks for credit), ACM CCS identifiers | anything, with a credit line as courtesy |
| B | share-alike, compatible with CC BY-SA 4.0 | Wikipedia (CC BY-SA 4.0), CP-Algorithms (CC BY-SA 4.0), USACO Guide (CC BY-SA 4.0, Default: to be confirmed at M0) | prose may be adapted into the prose zone with attribution in `sources` and in the page footer; **code may not** be taken into the MIT zone, because CC BY-SA code is not MIT |
| C | permissive: CC BY, MIT, Apache-2.0, BSD | Erickson's *Algorithms* (CC BY 4.0), TheAlgorithms (MIT), Open Data Structures (CC BY 2.5), library source (the C++ and Rust standard libraries, Boost) | facts and structure; short quotes with attribution; code ideas with a citation. Our code is still written fresh (below) |
| D | all rights reserved, or a licence that is not compatible | textbooks (CLRS, Sedgewick–Wayne, Knuth, Kleinberg–Tardos, Skiena, DPV), papers, Rosetta Code (GFDL 1.2), GeeksforGeeks, judge statements, the *Encyclopedia of Algorithms* | facts, names, the structure of a field, page numbers and section numbers for citations, and short quotations under fair use with attribution (a theorem's original wording at most). Never text, figures, exercises or code |
| E | forbidden to harvest | a site whose terms forbid automated access, or that asked us to stop | nothing by machine; a person may cite it |

**The no-copy stance.** Decision 10 of 00 holds for every class. Prose and code are written fresh. This is a stronger rule than the licences need for classes A to C, for three reasons:

1. **One standard.** A writer, a person or an agent does not need to know a page's licence to know what they may do. They read sources, close them, and write.
2. **Code licences.** Code from class B cannot go into the MIT zone, and code from class C under Apache-2.0 or BSD would bring notices into each file. Fresh code keeps every implementation under one plain MIT notice.
3. **Agents.** A model can reproduce training text. The copy check (11.5) is the defence, and it works best when the rule is "nothing is copied".

**What "written fresh" means.** Algorithms themselves are ideas and are not protected by copyright. Pseudocode in the standard style, the usual variable names (`dist`, `parent`, `lo`, `hi`) and the usual structure of a proof are not copying. What is copying: the same sentences, the same sequence of non-obvious choices in a code file, the same figure, the same worked example with the same numbers, or the same exercise. The copy check measures this (11.5): shingled n-gram overlap for prose against the raw store, and token-level winnowing (as in MOSS) for code against the code corpora of the sources, including Rosetta Code and TheAlgorithms. A change over the threshold of 11.5 fails rule C01 and goes to a person.

**Rosetta Code** is GFDL 1.2 only. Its content cannot be moved to CC BY-SA 4.0 (the Wikipedia relicensing window of 2009 does not cover it), and the GFDL's invariant-section and cover-text conditions do not fit code. The project links each matching Rosetta task in `same_as.rosetta` and never copies from it. Its task names are facts and go into the universe register (16.1).

**Exercises from judges.** Exercise nodes link the judge's page and hold the project's own short note and tags. The statement is never copied, not even in part; the title and the judge's tags are facts. Rule C05 checks that an exercise node's body has no sentence of more than 12 words that matches the raw capture of its statement.

**Figures and images.** Every figure is drawn by the project, by hand or from a scene. A person page uses a photo only when Wikimedia Commons has one under CC0, CC BY or CC BY-SA, and shows its credit line (rule C04). Otherwise it has no photo.

**Textbook locators.** Citations like "CLRS 4th ed., §22.3, pp. 620–626" are facts and are encouraged. They help readers and they make the universe register's rows checkable (16.1).

## 17.3 Attribution

- Each node's `sources` field lists what the writer read, with locators. The page shows them as "Further reading", numbered.
- When prose adapts a class B source, the source entry has `adapted: true`, and the page footer says "Parts of this page are adapted from <source>, licensed CC BY-SA 4.0", with the link to the source page and its history, as CC BY-SA 4.0 section 3(a) asks. Rule C03 checks that each `adapted: true` source names a licence that the prose zone accepts (class A, B or C).
- The project credits NIST DADS on each page that links it ("Paul E. Black, ed., *Dictionary of Algorithms and Data Structures*"), as DADS asks, even though its facts are class A.
- The site's `/sources/` page lists every source with its class, its licence and what the project took.

## 17.4 Text and code written by agents

- **Labels.** Each file has a provenance record (12.7). The site labels what an agent wrote and no person reviewed ("AI · not reviewed", 14.4). The "reviewed" badge needs a person (13.1). The labels are about trust, and they are also the honest statement that the law about the authorship of machine output is not settled.
- **Licence of agent output.** Agent output is published under the licence of its zone, with "The algorithm contributors" as the copyright holder. Where the output has no author in law (the US Copyright Office's guidance of 2023 to 2025 says purely machine-made material is not protected), the licence notice does no harm, and the human selection, review and arrangement of the corpus is still the contributors' work. Default: keep this wording; 20 has the question whether to add a sentence that waives any rights in purely machine-made parts under CC0.
- **Model terms.** The project uses model providers whose terms give the user the rights in the output (12.5). The run record names the model id, so the terms that applied can be found later.
- **No training-data claims.** The site does not say that a page is "original" in any sense beyond what the copy check measured. The About page says what the check does and its thresholds.

## 17.5 Patents, names and other rights

- **Patents.** Some algorithms were patented (LZW until 2004, RSA until 2000, arithmetic coding variants, some hash and compression methods). An algorithm page under a patent that may still be in force says so in its History section with the patent number and its expected expiry, in neutral words, and the project does not give advice on it. The MIT licence of the code gives no patent licence; Apache-2.0 for Lean gives the contributors' patent licence only. `registers/patents.yaml` lists the known cases, with sources (Default: listed only, no other action).
- **Trademarks.** Names of judges, companies and products (LeetCode, Codeforces, Google, Java) are used only to identify them. The site does not use their logos.
- **Names of people.** Person pages hold public facts about published work, with sources: names, years, affiliations, the work and its dates. No contact details, no private life. A person who is the subject of a page can ask for a correction or for the page to be cut to the list of their items (17.7).
- **Export of cryptography.** The `cryptography` area has implementations of ciphers, hashes and signatures. They are public, open source code. Under the US Export Administration Regulations, publicly available encryption source code is not subject to the EAR (§734.3(b)(3) and §742.15(b)); the rule of March 2021 removed the e-mail notice for most such code, but kept it for "non-standard cryptography". Default: the project sends the notice once, at the M2 release, to cover any non-standard schemes in the area, and keeps its text in `docs/legal/`. The site says on each cryptography page that the code is for learning and is not hardened against side channels (08 sets this as a rule of the area).

## 17.6 Privacy

- The site sets no cookies and loads nothing from a third party (14.9).
- Preferences and course progress live in the reader's browser only (14.11, 14.6).
- Page view counts come from Cloudflare's request logs, aggregated by path, with no identifiers kept by the project.
- The search palette's "no results" counts (15.8) are off by default and send only the folded query string and a count when on.
- Contributors' names and e-mail addresses are in git history and in the provenance logs, as in any public repository. The provenance log stores the GitHub login, not the e-mail.
- The privacy page `/about/privacy/` says all of this in plain words.

## 17.7 Takedown and corrections

**How to report.** Each page has "Report a problem" (14.4), which opens a GitHub issue with the URL filled in and a choice: wrong, unclear, copied, rights, other. A rights holder who does not want a public issue can write to the address on `/about/legal/` (Default: an alias that forwards to the maintainers).

**What happens.**

| Report | Within | Action |
|---|---|---|
| a claim that text or code was copied | 2 working days | a person runs the copy check against the named source by hand. If the claim holds, the file is reverted or the part is quarantined (12.7): it leaves the site at the next deploy, which is at most 20 minutes (14.9), and a fresh version is queued with the source added to the copy check corpus. The issue records the outcome. |
| a DMCA notice or the like | 2 working days | the same, following the notice's procedure, and the file is removed from the release archives in the next release. The project keeps the notice in `docs/legal/notices/` with personal details removed |
| a source asks the project to stop harvesting | 2 working days | the source's class becomes E, its adapter is turned off, its raw captures are deleted from `algorithm-raw` unless they are needed as evidence of a dispute, and its universe rows stay (they are facts) |
| a correction about a person | 5 working days | the page is fixed or cut |
| an error in content | no deadline | it goes into the work queue with a high weight (12.4); a proof or Lean error found by a reader is credited on `/reviewers/` |

Removed content stays in git history, which is public. When a court order or a valid notice requires it, the maintainers rewrite history for that path only and publish a note that they did.

**Counter-notice.** A contributor whose work was removed may answer the notice in the same issue. The maintainers restore the work when the claim is withdrawn or when the copy check by two maintainers finds no copying.

## 17.8 Rules

Listed in 13.3:

| Rule | Checks |
|---|---|
| C02 | `reuse lint` passes: every file has a licence from `REUSE.toml` |
| C03 | every source with `adapted: true` has a licence of class A, B or C, and the page footer carries the attribution |
| C04 | a person page's photo has a Commons licence of CC0, CC BY or CC BY-SA and a credit line |
| C05 | an exercise body has no run of more than 12 words that matches the captured statement of its judge |
| C06 | no file in the MIT zone has its origin in a class B or D source in `prov/` (`op: adapt` with such a source) |
