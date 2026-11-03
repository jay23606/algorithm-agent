# 11. Sources and harvest

The sources do two jobs. They tell us **what exists**, so that the universe register (document 16) is complete. And they give **facts with locators**, so that each page can cite where a result comes from. They never give us text or code to paste (11.5).

## 11.1 The source register

`registers/sources.yaml` lists each source. The schema is `schema/source.v1.json`.

```yaml
- id: cpalgorithms
  name: CP-Algorithms
  url: https://cp-algorithms.com
  kind: site                 # book | site | wiki | dataset | code | judge | papers | course
  licence: CC-BY-SA-4.0
  class: A                   # A to E (11.2, 17.2)
  takes: [names, locators, structure, links, facts]
  adapter: cpalgorithms-cli  # a tamnd/*-cli library, or `manual`
  cadence: monthly
  robots: respected
  notes: "Translation of e-maxx.ru. The articles have proofs; we cite them."
```

`takes` says what we keep from the source:

| Take | Meaning |
|---|---|
| `names` | the names and aliases of items |
| `locators` | where an item is in the source: a section, a page, a URL with an anchor |
| `structure` | the grouping and order: a table of contents, a module order |
| `links` | links between items, and links to other sources (Wikidata ids, Wikipedia titles) |
| `facts` | complexity bounds, dates, inventors, first publications: facts are not protected, and each one is cited |
| `metadata` | for exercises: id, title, URL, tags, difficulty, statistics |

No source has the take `text` or `code`.

## 11.2 Classes

Each source has one of the five classes of 17.2. The class is a field of the source entry, and a person sets it from the source's licence and terms.

| Class | Licences | What the harvest takes | Examples |
|---|---|---|---|
| **A** | public domain, CC0 | everything it needs | Wikidata, NIST DADS facts, ACM CCS 2012 identifiers |
| **B** | share-alike, compatible with CC BY-SA 4.0 | names, locators, structure, facts, and prose that a writer may adapt with attribution; never code | Wikipedia, CP-Algorithms, USACO Guide |
| **C** | permissive: CC BY, MIT, Apache-2.0, BSD | names, locators, structure, facts, short quotes; code ideas with a citation | Erickson, Open Data Structures, TheAlgorithms, KACTL, CSLib, Mathlib, the AFP |
| **D** | all rights reserved, or not compatible | names, locators, structure (a table of contents is a list of facts) and facts only | CLRS, TAOCP, Sedgewick–Wayne, Kleinberg–Tardos, Skiena, papers, Rosetta Code (GFDL 1.2), GeeksforGeeks, VisuAlgo, judge statements |
| **E** | terms forbid automated access | nothing by machine; a person may cite it | a site that asked us to stop |

OI Wiki is class B with its extra terms recorded in the source entry.

The class sets what the copy check (11.5) does: for class A and C sources it reports and asks for attribution, for class B and D sources it blocks.

## 11.3 The inventory

The inventory is the list of each item that a source names, before we decide what it is. It follows math2's inventory (`records/mentions`, `records/inventory`).

**Steps.**

1. **Harvest.** `algo ingest <source>` uses the adapter to read the lists of the source: the index of CP-Algorithms, the "List of algorithms" and its categories on Wikipedia, the Wikidata query below, the DADS index, the module list of the USACO Guide, the task list of Rosetta Code, the directory tree of each TheAlgorithms repository, the tables of contents of the canon books (typed in once from the books, 11.8). Each fetched file goes to the raw store with its BLAKE3 hash and the time.
2. **Mentions.** Each item of each source becomes one mention line in `records/mentions/<source>/<shard>.jsonl`: the source id, the source's own id or URL, the name, the aliases, the locator, the links to other sources, the facts and a short description in our words, if the adapter can make one.
3. **Join.** `algo universe merge` groups the mentions into inventory rows in `records/inventory/<shard>.jsonl`. Each row has a 10-character tag (as in math2's inventory), the mentions, a proposed kind, a proposed area and a proposed outcome. The signals, in order:
   - the same Wikidata id, directly or through a Wikipedia title;
   - an explicit link between the two sources (a DADS entry that links a Wikipedia article);
   - the same normalized name or alias (lowercase, no accents, no punctuation, "algorithm" and "method" removed, and eponyms normalized: "Knuth–Morris–Pratt" = "KMP");
   - the similarity of the descriptions (embeddings), only to propose, never to merge alone.
4. **Outcome.** A curator, a person or the curator agent with a person's approval (12.2), gives each row one outcome:

| Outcome | Meaning |
|---|---|
| `node` | the row is a node, and the field names its tag |
| `alias` | the row is another name of a node |
| `section` | the row is a part of a node: a one-line variant, a lemma, an optimization |
| `merged` | the row was a duplicate of another row |
| `out-of-scope` | not knowledge about algorithms (2.2), with the reason |
| `deferred` | in scope, but not now, with the milestone |
| `open` | not decided yet |

The universe register (16.1) is the rows with the outcomes `node`, `section` and `deferred`, plus the open rows. Each open row is a gap until it has an outcome.

**The Wikidata query** (CC0, the join key):

```sparql
SELECT ?item ?label ?enwiki WHERE {
  VALUES ?class { wd:Q8366 wd:Q175263 wd:Q1868524 }   # algorithm, data structure, computational problem
  ?item wdt:P31/wdt:P279* ?class .
  OPTIONAL { ?item rdfs:label ?label FILTER(lang(?label) = "en") }
  OPTIONAL { ?enwiki schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> }
}
```

The class ids are checked in M0. The query result is filtered by hand rules in `schema/outcomes.v1.yaml`: Wikidata has many items that are software products or instances of algorithms in a product, and those are `out-of-scope` by rule.

## 11.4 Exercises

Exercises come from judges and from open texts. Each one is an `exercise` node with metadata only:

```yaml
---
tag: 7H2KQ1
kind: exercise
slug: cses-1671
name: "Shortest Routes I"
judge: cses
judge_id: "1671"
url: https://cses.fi/problemset/task/1671
difficulty: {scale: cses-section, value: "Graph Algorithms"}
practice_for: [dijkstra]
techniques: []
---
```

| Judge | Adapter | What it gives |
|---|---|---|
| LeetCode | `leetcode-cli` | id, title, URL, tags, difficulty, acceptance rate |
| Codeforces | `codeforces-cli` | contest and index, title, tags, rating, solved count |
| CSES | `cses-cli` | id, title, section |
| Kattis | `kattis-cli` | id, title, difficulty |
| AtCoder | `atcoder-cli` | contest, task, title, difficulty (from the public estimates) |
| SPOJ, UVa, Timus, DMOJ, CodeChef, USACO | `spoj-cli`, `uva-cli`, `timus-cli`, `dmoj-cli`, `codechef-cli`, `usaco-cli` | id, title, URL, tags where they exist |

Rules:

- No statement, no test data and no solution of a judge problem is copied. The page shows the title, the judge, the difficulty and the link.
- `practice_for` links an exercise to the algorithms or techniques that solve it. The judge's tags propose links. An agent proposes the rest from the title and tags only (it does not read the statement for this), and a person checks a sample (rule X10, 13.3).
- Each algorithm and technique of the core lists 3 to 10 exercises, from easy to hard. The list is sorted by the judge's difficulty, mapped to one scale (`registers/difficulty.yaml`).

## 11.5 The no-copy rule and the copy check

**The rule.** A writer, a person or an agent, can read sources to learn the facts. What they write is their own. Code is written from the pseudocode of our page, not from another implementation.

**How agents follow it.** An agent gets sources as excerpts for facts, and the prompt says that the excerpts are data (12.8). The writer agent of prose and the implementer agent of code do not get another implementation of the same algorithm as context, except the reference model in Lean and the page's own pseudocode.

**The copy check** (package `copycheck`, from math2-agent):

| Check | Prose | Code |
|---|---|---|
| normalization | lowercase, no markup, no math, stop words kept | tokens with identifiers, literals and comments abstracted (`ID`, `NUM`), whitespace removed |
| fingerprints | 8-word shingles, winnowed | 12-token k-grams, winnowed (the method of MOSS) |
| corpus | the raw store of class A to D sources, and the canon excerpts we hold for citation checks | the raw store of code sources: TheAlgorithms, Rosetta Code, KACTL, CP-Algorithms code blocks |
| threshold | an overlap of more than 15% of the fingerprints of a section with one source, or one run of 40 words | an overlap of more than 30% of a file's fingerprints with one file, after the abstraction |
| action | classes A and C: a finding that asks for a rewrite or an attribution; classes B and D: a blocking finding (rule C01) | the same |

Short code has little room for difference (a binary search is a binary search). The code threshold is raised for files under 25 lines, and a match there is a warning, not a block, unless the match keeps the source's comments or names.

## 11.6 Polite fetching

- Each adapter respects `robots.txt` and the terms of the site. It sends a user agent with a contact URL. It waits at least one second between requests to one host, and it uses the APIs and dumps where they exist (Wikipedia and Wikidata dumps, the GitHub API, the CP-Algorithms repository).
- No adapter circumvents a bot challenge, a login wall or a paywall. A source that needs one is `manual` or link only.
- Each fetch goes to the raw store. A second harvest asks with `If-None-Match` or `If-Modified-Since`, and an unchanged page is not stored again.

## 11.7 Papers and first publications

The history of an item (`history.first`) cites the first publication, found through `dblp-cli`, `crossref-cli`, `openalex-cli`, `semanticscholar-cli` and `arxiv-cli`. These give the DOI, the venue, the year and the citation count. A citation count also ranks the long tail for the queue (12.4). Paper text is never copied. For an open access paper, the page links the open copy (`unpaywall-cli`).

## 11.8 The canon tables of contents

The tables of contents of the class D books are typed in once, by hand or by an agent from a copy that the maintainer owns, as `registers/canon/<book>.yaml`: the chapter and section numbers, the section titles and the names of the algorithms, data structures and theorems in each section, with page numbers when known. This is a list of facts. It is the base of the core (16.3) and of the locators of the pages. A person checks each file against the book once (rule U08, 13.3).

## 11.9 Cadence and flow

| Source group | Cadence | Flow |
|---|---|---|
| Wikidata, Wikipedia | weekly | the import workflow, a pull request with the new mentions and rows |
| CP-Algorithms, OI Wiki, USACO Guide, TheAlgorithms, Rosetta Code | monthly | the same |
| judges | monthly | the same, with the exercise nodes for new links |
| papers | on demand, when a node is written | the writer agent asks for the first publication |
| canon books | once, then for a new edition | a pull request by hand |

The import workflow runs `algo ingest`, then `algo universe merge`, then `algo coverage`. The pull request shows the new rows, the proposed outcomes and the change of the coverage numbers. A curator merges it.
