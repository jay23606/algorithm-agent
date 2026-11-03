# 15. Search

Search is how most readers arrive at a page. They type a name ("dijkstra"), an abbreviation ("kmp", "lca", "bfs"), a misspelling ("djikstra"), a problem in their own words ("shortest path with negative edges"), a bound ("O(n log n) stable sort") or a language ("union find rust"). Search must answer each of these from the first keystroke, on a static site, with no server to query at M0 to M3.

The design follows math2: a client-side index built by `algo search build`, read by a small script, and the same index in the offline archive. It adds three things that algorithms need: aliases in many languages, a constraint search over the problem graph ("I need to…", 15.4), and facets over the computed ladders.

## 15.1 What search must do

| # | Query | Must return first |
|---|---|---|
| 1 | `dijkstra`, `Dijkstra's algorithm`, `djikstra`, `dijkstras` | `dijkstra` |
| 2 | `kmp`, `knuth morris pratt` | `knuth-morris-pratt` |
| 3 | `lca` | the disambiguation of "LCA": lowest common ancestor first (05.7) |
| 4 | `union find`, `disjoint set`, `dsu` | `disjoint-set-union` |
| 5 | `shortest path negative weights` | `bellman-ford`, then `johnson`, then the problem `single-source-shortest-paths` |
| 6 | `stable sort in place` | the sorting comparison table filtered to stable and in place (14.5) |
| 7 | `O(n log n) sort` | the sorting algorithms with that worst-case bound |
| 8 | `segment tree rust` | `/segment-tree/rust/` |
| 9 | `Алгоритм Дейкстры`, `迪杰斯特拉算法`, `Dijkstra-Algorithmus` | `dijkstra` |
| 10 | `al://4MRG7S`, `4MRG7S` | the node with that tag |
| 11 | `master theorem` | the theorem node, not each page that cites it |
| 12 | `dp on trees` | the technique `tree-dynamic-programming` |

These queries and about 400 more are the evaluation set of 15.8.

## 15.2 Indexed fields

Each node gives one search document. Language pages give one small document each (15.5). The fields and their weights:

| Field | From | Weight | Notes |
|---|---|---|---|
| `name` | front matter `name` | 10 | the main title |
| `aliases` | `aliases`, in all languages, with `lang` | 8 | abbreviations (`KMP`, `BFS`, `DSU`), other names (`Disjoint-set forest`), other scripts. Folded for case and accents (15.6) |
| `slug` | `slug` | 6 | split at hyphens |
| `tag` | `tag` and `al://` URI | exact only | a match goes straight to the node |
| `summary` | `summary` | 4 | one line |
| `kind` | `kind` | facet and 1 | "algorithm", "data structure", … |
| `area` | `area`, `areas`, and the names of their ancestors | 2 | so "graph" finds every node in `graphs` |
| `problem` | the names and aliases of `solves` targets | 3 | so "shortest path" finds Dijkstra |
| `technique` | the names of `techniques` targets | 2 | so "greedy" finds Kruskal |
| `properties` | `properties` keys that are true, as words ("stable", "in place", "online") | 2 | also facets |
| `complexity` | each bound of `complexity`, normalized (15.6) | 2 | so "n log n" and "nlogn" match |
| `people` | `history.people` names and aliases | 2 | so "tarjan" finds Tarjan's algorithms |
| `year` | `history.year` | facet | the era facet |
| `headings` | the `h2` and `h3` headings of the body | 2 | |
| `body` | the first 300 words of the body, without code and math | 1 | |
| `languages` | the language ids with an implementation at I2 or better | facet and 1 | so "rust" boosts nodes with Rust code |
| `levels` | H, L, V, W and the best I level | facet | for "proved" and "visual" filters |
| `courses` | the courses that list the node | facet | |
| `same_as` | Wikipedia titles in English (the article name, not the text) | 3 | "Dijkstra's algorithm" is the English Wikipedia title |
| `popularity` | 15.7 | rank prior | not text |

Things that are **not** indexed as text: code, Lean, the full proofs, and the bodies past 300 words. They make the index large and the matches noisy. The full-text search of 15.9 covers them later.

**Aliases come first in the design.** At M0, each core node gets its aliases from four places: the names in the universe register for that node (16.1) from every source, the Wikidata labels and aliases in the 12 languages of 15.6, the abbreviation list `registers/abbreviations.yaml` (05.7), and the misspellings that the evaluation of 15.8 finds. Audit rule X07 (13.3) fails a core node with fewer than two aliases when its universe items list more names.

## 15.3 The search palette

The palette opens with `/`, `⌘K` or `Ctrl K` from any page, or by a click in the search box of the top bar. It is a modal dialog with a list of results that updates on each keystroke.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🔍 shortest path neg                                                          │
├──────────────────────────────────────────────────────────────────────────────┤
│ PROBLEMS                                                                     │
│ ▸ Single-source shortest paths       Graphs · Problem · 14 algorithms        │
│   Shortest path with negative weights  → variant of the above                │
│ ALGORITHMS                                                                   │
│   Bellman–Ford                       Θ(nm) · negative weights · L3 · 23 lang │
│   Johnson's algorithm                O(nm + n² log n) · all pairs · L1       │
│   SPFA                               O(nm) worst · L0 · 10 lang              │
│ I NEED TO…                                                                   │
│   find shortest paths, weighted, negative weights  → 4 algorithms (15.4)     │
│ IN CODE                                                                      │
│   Bellman–Ford in Rust, in Python, in C++ …                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ ↑↓ move  ↵ open  ⌘↵ new tab  Tab filters  Esc close            Advanced →    │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Groups.** Results are grouped by kind in a fixed order that depends on the query (15.7): Problems, Algorithms, Data structures, Techniques, Concepts and definitions, Theorems, People, In code. Each group shows at most 5 results, and "more" opens `/search/` with the same query.
- **Each row** shows the name, the area, the kind, and for algorithms and structures the main bound, one property, the best L level and the count of languages. The matching text is in bold.
- **Language intent.** When the query names a language ("trie python", "in go"), the row opens the language page, and the "In code" group comes first.
- **Commands.** A query that starts with `>` is a command: `>theme dark`, `>lang rust` (sets the code language), `>random graphs`, `>course algorithms-i`. A query that starts with `#` is a tag.
- **Recent.** With an empty query, the palette shows the last 8 pages the reader opened (in `localStorage`, `al-recent`) and the popular problems.
- **Filters.** `Tab` moves to a row of facet chips for the open query (kind, area, proved, has visual, language). Facets can be typed: `kind:algorithm area:graphs lang:rust proved:yes`.
- **No results.** The palette suggests a spelling ("Did you mean dijkstra?"), shows the closest names, and offers "Tell us it is missing": a prefilled issue that adds the query to the gap list (16.6).

Without script, the search box is a form that goes to `/search/?q=…`. That page runs the same code when script is on. With script off, it says that search needs script and links the area tree and the problem index.

## 15.4 "I need to…": the constraint search

The question "I have this problem with these conditions; what should I use?" is the most valuable query on an algorithms site, and plain text search answers it badly. The site answers it with a search over the problem nodes and their `constraints` (04.4).

**The form** at `/search/need/` and in the palette under "I need to…":

```
I need to…  [ find shortest paths                 ▾ ]       (a problem, from the problem index)

 Input         [x] weighted   [x] negative weights   [ ] directed acyclic   n up to [ 10^5 ] m up to [ 10^6 ]
 Answer        (•) exact   ( ) approximate within [ ] ( ) any
 Setting       [ ] online   [ ] dynamic (updates)   [ ] parallel   [ ] external memory
 Model         (•) any   ( ) comparison   ( ) word RAM

 Results
  1. Bellman–Ford        Θ(nm)            fits: n·m = 10^11 operations; too slow for 1 s      [why]
  2. Johnson             O(nm + n² log n) all pairs; use only for many sources              [why]
  3. SPFA                O(nm) worst      often fast in practice; worst case as Bellman–Ford [why]
  4. Goldberg's scaling  O(m √n log N)    integer weights only                              [why]
  Not shown: Dijkstra (needs non-negative weights), DAG shortest paths (needs acyclic).
```

**How it works.**

1. The problem picker searches problem nodes only, by name and alias, so "shortest path", "sssp" and "single source" all find `single-source-shortest-paths`.
2. The constraint boxes come from the problem's `constraints` schema (04.4): `weighted`, `negative_weights`, `directed`, `acyclic`, `dynamic`, `online`, `exact`, `approximate`, `n_max`, and the keys that a problem family adds (`alphabet_size` for strings, `dimension` for geometry). The form shows only the keys of the chosen problem and its variants.
3. Each candidate is an algorithm with a `solves` edge to the problem or to a variant of it. Each `solves` edge carries the conditions under which the algorithm is correct (`requires: {negative_weights: false}`) and the bound under them. The search keeps the candidates whose conditions hold for the reader's answers, and lists the others under "Not shown" with the first condition that failed. This is what makes the answer trustworthy: Dijkstra is ruled out by a stated condition, not by a word match.
4. **Fits.** When the reader gives sizes, the search evaluates the worst-case bound with the sizes and shows the operation count. A count over 10^9 is marked "likely too slow for 1 second" (Default: 10^8 to 10^9 simple operations per second, as competitive programmers estimate). The note says the estimate ignores constants and links the measured benchmarks of the node (09.7) when there are some.
5. **Order.** Candidates that fit come first, then by the worst-case bound at the given sizes, then by evidence (L level, then the count of languages), then by popularity.
6. **Why.** Each result has a "why" fold: the conditions that held, the bound and its model, and the "Which algorithm should I use?" text of the problem page.

**In the palette**, a query such as "shortest path negative weights" is parsed into a problem and constraints when it can be: a problem name or alias, then words that are constraint keys or their aliases in `registers/constraint-words.yaml` (`negative` → `negative_weights: true`, `dag` → `acyclic: true`, `online` → `online: true`, `approximate` and `approx` → `approximate: true`). The parse is shown as the "I need to…" row, and opening it fills the form.

**The data.** `algo search build` writes `api/search/need.json`: each problem with its constraint schema and, for each algorithm that solves it, the conditions and the bound as a parsed expression (E04). The browser evaluates bounds with a small evaluator of the expression language of 06.6. The file is about 2 MB at 10,000 nodes (estimate), loaded only when the form or the row is used.

**Coverage of the data.** The constraint search is only as good as the `requires` of the `solves` edges. Audit rule G09 (13.3) fails an algorithm in the core whose `solves` edge has no `requires` when the problem's constraint schema has keys that the algorithm's text mentions as conditions.

## 15.5 The index

**Format.** The index is a set of static JSON shards, built by `algo search build` and served as assets, as in math2's `api/search.json`, but sharded because the corpus is larger.

| File | Holds | Size (estimate at 10k nodes, gzip) |
|---|---|---|
| `api/search/head.json` | the core and the most popular 2,000 nodes: tag, slug, name, aliases, kind, area, summary, main bound, levels, language count, popularity | 250 KB |
| `api/search/names.json` | every node and every language page: id, the folded name and aliases, a prefix trie in a compact form | 600 KB |
| `api/search/shard-<k>.json` | the full documents of 15.2, split into 32 shards by a hash of the tag | 100 KB each |
| `api/search/need.json` | the constraint data of 15.4 | 2 MB, on demand |
| `api/search/facets.json` | the facet values and their counts | 30 KB |

**The flow in the browser.** On the first open of the palette, the script loads `head.json` and `names.json` (about 850 KB gzip). The first keystrokes search the head with the full ranking and the names with prefix and fuzzy matching. When a name match is outside the head, the script fetches its shard to rank and show it. Most queries are names, so most answers come from the first two files. Files are cached by the browser with a content hash in their name.

**The engine.** A small purpose-built matcher (about 6 KB gzip) in the site script, not a general library: prefix match on folded tokens, a trigram index for fuzzy match with a maximum edit distance of 1 for words of 4 to 7 letters and 2 for longer words, BM25F scoring over the fields of 15.2, then the rank priors of 15.7. Default: write the matcher. The fallback, if its evaluation (15.8) is worse, is MiniSearch with custom fields. Pagefind is not used for the palette because its index is page-text first and has no notion of aliases, facets over ladders or the constraint data, but it is a candidate for the full-text search of 15.9.

**The offline archive** embeds `head.json` and `names.json` as `window.algoSearch` (14.18), as math2's archive embeds `window.m2Search`. The shards of the core are embedded too, so the archive's search covers the archive.

**Build.** `algo search build` reads the graph and the ladders from `build/`, writes the shards with stable ordering, and runs the evaluation of 15.8. It takes under a minute. It runs in F3 after the ladders.

## 15.6 Normalization

Both the index and the query go through the same steps:

1. **Unicode.** NFKC, then case folding, then the removal of combining marks, so "Dijkstra", "DIJKSTRA" and "Dijkštra" match, and "Erdős" matches "erdos".
2. **Punctuation.** Apostrophes and possessives go: "Dijkstra's" → "dijkstra". Hyphens and en dashes split words, and the joined form is also indexed: "Bellman–Ford" → "bellman ford", "bellmanford".
3. **Stop words.** "algorithm", "algorithms", "problem", "data structure", "the", "of", "a", "in", "for", "with" have a weight of 0.1 in the query, not 0, so "the algorithm" still finds a page with that name.
4. **Stemming.** A light English stemmer (plural and "-ing") on the `summary`, `headings` and `body` fields only. Names and aliases are not stemmed.
5. **Complexity.** Bounds in queries are parsed with the expression parser of 06.6: "O(n log n)", "n log n", "nlogn", "O(N*logN)" and "n lg n" all become `n·log(n)`. "Linear", "quadratic", "logarithmic", "constant" and "polynomial" are aliases of their time classes (05.5). A parsed bound in a query becomes a filter on the time class, not text.
6. **Other scripts.** Aliases in Chinese and Japanese are split into character bigrams for matching. Aliases in Cyrillic, Greek, Arabic, Hebrew, Korean and Vietnamese use the steps above. The 12 alias languages at M2 are: English, Chinese (simplified and traditional), Spanish, Russian, Japanese, Portuguese, German, French, Korean, Vietnamese, Hindi and Turkish (Default; 20). The search UI stays in English (14.17).
7. **Transliteration.** Russian aliases are also indexed in their Latin transliteration, because readers often type "algoritm deikstry".

## 15.7 Ranking

The score of a node for a query is the text score times the priors.

**Text score.** BM25F over the fields of 15.2 with their weights. An exact match of the whole query with the `name` or an alias gets a bonus that puts it first unless another node matches exactly too. A prefix match of the name is next. A tag match is absolute.

**Priors.**

| Prior | Value | Why |
|---|---|---|
| kind intent | ×2 when the query has a kind word ("problem", "tree", "heap", "sort", "theorem"), on that kind | "heap" should find heaps, not heapsort first |
| problem intent | ×1.5 for problems when the query has a verb ("find", "count", "check", "sort a", "match") | "find a cycle" should find the problem |
| core | ×1.3 for nodes in `topics/core.yaml` (16.3) | the core is what most people want |
| level | ×1.2 for `intro` and `core`, ×0.9 for `research` | a learner's query rarely means the research variant |
| popularity | `1 + 0.3·log10(1 + views30)`, from the last 30 days of page views (14.9, no tracking), plus the in-link count of the graph at M0 to M2 before view data exist | |
| evidence | ×1.1 for W4 and more | well-written pages first among equals |
| retired | ×0.1 and a "retired" label | they stay findable |

**Disambiguation.** When a query matches the alias of more than one node (05.7), the palette shows the disambiguation entry first, with its targets in the order of `registers/disambiguation.yaml`.

**Boost by language.** When the reader has a language chosen (`al-lang`), nodes with an implementation in it get ×1.05. This only breaks ties.

**Pinned results.** `registers/search-pins.yaml` can pin a node for an exact query. It is for the few cases the evaluation finds and the ranking cannot fix, each with a reason, and audit rule X08 caps it at 200 entries.

## 15.8 Evaluation

Search quality is measured, not judged by feel.

- **The query set** is `registers/search-eval.yaml`: about 400 queries at M2 and 1,500 at M4, each with the node or nodes that must rank first or in the top 5. Sources of queries: the 12 of 15.1; the names, abbreviations and misspellings of every core node; the task titles of the courses; real queries from the "no results" log of the palette (counted in the browser, sent only as anonymous counts of the folded query string when the reader allows it; Default: off); and the problem phrases of the exercise judges' tags ("shortest paths", "dsu", "bitmasks").
- **Metrics.** Success at 1, success at 5 and mean reciprocal rank, overall and by query class (name, abbreviation, misspelling, problem phrase, constraint, bound, language, other script).
- **Gates.** `algo search eval` runs in F3. The build fails when success at 5 falls under 95% or when it drops more than 1 point from the last release (rule X09, 13.3). The report is in `reports/search-eval.md` and on `/coverage/`.
- **Latency.** The palette must show the first results within 50 ms of a keystroke after the first load on a mid-range phone, and load the first files in under 500 ms on "Fast 4G". `algo site check` measures it on the evaluation queries in a headless browser.

## 15.9 Full-text and later stages

| Stage | When | What |
|---|---|---|
| S1 | M0 to M3 | the static index of 15.5; the "I need to…" search of 15.4; the evaluation of 15.8 |
| S2 | M3 | full-text search of the bodies, proofs and code comments with Pagefind's sharded index, on `/search/?full=1`, as a second tab "Search every word" |
| S3 | when the index passes 2 MB gzip for the first two files, or at 25,000 nodes | a search Worker on Cloudflare with D1 FTS5 for the text and the same ranking, as in olymmath. The palette calls it; the static index stays as the offline fallback |
| S4 | after M4, Default: not before | semantic search: an embedding for each node (summary, headings, the first 300 words), served from a Worker with Vectorize, to answer descriptions such as "find the two numbers in a sorted array that add up to k". Results are mixed with the text results, never alone, and labelled "related by meaning" |

**Code search.** "Show me every Rust implementation that uses `BinaryHeap`" is a different job. It is served from GitHub's code search over `tamnd/algorithm`, linked from the "In code" group, not built into the site.

## 15.10 Search for agents

The MCP tool `search(query, filters)` (14.8) runs the same matcher and ranking in Go, over the same shards, so an agent and a reader get the same results. `find_algorithm(problem, constraints)` runs 15.4. Agents of document 12 use `search` before they create a node, so they find an existing node and its aliases first; rule T07 (13.3) blocks a new node whose name or alias matches an existing node's name or alias, unless the pull request links a disambiguation entry.
