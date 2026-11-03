# 09. Testing

Each implementation in each language is tested in the same way, against the same cases, by the same tools. The problem is the contract (00, decision 2). The Lean model is the oracle (00, decision 5). This document says how the contract, the cases, the checkers, the generators, the oracle and the other checks fit together, and how CI runs them. Document 08 says how the code is written and how the runner images are built. The rules are listed in 13.3.

## 9.1 Problem contracts

Each `problem` node and each `abstract-type` node has `contract.yaml`. Every algorithm that `solves` the problem, and every data structure that `implements` the type, is tested against it. The schema is `schema/contract.v1.json`.

### A function contract

```yaml
# nodes/sorting/sorting-problem/contract.yaml
problem: sorting-problem
entry: sort
params:
  - {name: xs, type: "list<T>", mode: in}      # mode: in, inout (in-place algorithms)
returns: {type: "list<T>"}
generic: {T: ordered}                          # test with T = int and T = string
bounds:
  len(xs): [0, 1000000]
  int: [-2^63, 2^63-1]
  string: {len: [0, 20], alphabet: "a-z"}
inplace_variant:                               # an in-place algorithm meets this form instead
  params: [{name: xs, type: "list<T>", mode: inout}]
  returns: {type: unit}
  result: xs                                   # the value of xs after the call is the output
checker: exact                                 # 9.3
oracle:
  lean: Algo.Sorting.MergeSort.mergeSort       # 9.5
  lean_max: {len(xs): 200000}                  # above this, use the reference
  reference: reference.py
edge_classes: [empty, single, all-equal, sorted, reversed, duplicates, extremes, deep]
metamorphic: [permute-input]                   # 9.10
reviewed: {by: alice, hash: "blake3:41ac…"}    # set by the review record, rule S06
```

The type language, the type map to each language and the case rule of names are in 08.3.3. A contract uses only these types: `int`, `index`, `bool`, `float`, `string`, `list<T>`, `tuple<…>`, `option<T>`, `map<K,V>`, `set<T>`, `matrix<T>`, `graph`, `wgraph`, `unit`, and records named in the contract.

Each parameter can have `pre` (a precondition in words and as a check in the generator) and the return can have `post` (in words). The Definition section of the problem page (06.3) and the Lean spec (07.7) say the same thing. Rule S06 needs a person's review of the contract of each core problem, bound to its hash, because a wrong contract makes every test wrong.

### Size parameters

`bounds` names the size parameters: `len(xs)`, `n` and `m` for graphs, `len(text)` and `len(pattern)` for strings. The generators (9.4), the size classes and the complexity checks (9.7) use these names, and they are the variables of the complexity claims (04.4). Rule S01 checks that each variable of each `complexity` claim of each algorithm that solves the problem is a size parameter of the contract or is defined in its `vars`.

### Variants of the same problem

A problem with a different signature is a different problem node: "shortest path distances" and "shortest path tree" differ in their outputs. A generalization edge (04.6) links them. When an algorithm solves both, it has one implementation per entry, and the page shows both.

### A data-structure contract

An abstract type has a contract of operations. A case is a session: a sequence of calls on one value.

```yaml
# nodes/data-structures/disjoint-sets/disjoint-sets-type/contract.yaml
type: disjoint-sets
constructor: {name: new, params: [{name: n, type: index}]}
operations:
  - {name: union, params: [{name: a, type: index}, {name: b, type: index}], returns: {type: bool}}
  - {name: same, params: [{name: a, type: index}, {name: b, type: index}], returns: {type: bool}}
  - {name: count, params: [], returns: {type: index}}
bounds: {n: [1, 1000000], ops: [0, 2000000]}
checker: exact
oracle:
  lean: Algo.DataStructures.DisjointSets.model    # the mathematical model: a partition
  reference: reference.py
edge_classes: [single-element, self-union, repeated-union, chain, star, all-merged]
```

A case of this contract:

```json
{"name": "chain-5", "class": ["chain"], "ctor": [5],
 "ops": [["union",0,1],["union",1,2],["same",0,2],["count"],["union",3,4],["same",2,3],["count"]],
 "expect": [true, true, true, 3, true, false, 2]}
```

The adapter (9.2) builds the value, calls each operation in order and returns the list of results. For a persistent structure, the adapter threads the new value through the session (08.3.5). An implementation may expose `check_invariant`, and the adapter calls it after each operation in the `debug` run.

## 9.2 Cases and the adapter protocol

### Case files

The cases of a problem are in `cases/` of the problem node, as JSON lines.

| File | Holds | Written by |
|---|---|---|
| `basic.jsonl` | small cases a reader can follow, including the example of each algorithm page | people and the writer role |
| `edge.jsonl` | at least one case for each class of `edge_classes` (rule S04) | people and the tester role |
| `regress.jsonl` | shrunk inputs that once broke an implementation (9.11) | the tester role |
| `generated.yaml` | the generator specs and size classes (9.4) | the tester role |
| `checker_cases.jsonl` | outputs that the checker must accept or reject (9.3) | the tester role |

A case line:

```json
{"name": "duplicates", "class": ["duplicates"], "args": {"xs": [3, 1, 3, 2]}, "expect": [1, 2, 3, 3]}
```

- `name` is unique in the problem. Pitfalls (06.7, rule W06) and native tests refer to it.
- `expect` is the expected output. It may be absent when the checker computes validity itself (9.3). When it is present, rule S02 checks that the oracle agrees with it.
- `class` lists the edge classes and tags that the case covers.
- `T` names the type of a generic case (`"T": "string"`), default `int`.
- Integers outside the safe range of JSON readers ($\pm 2^{53}$) are written as strings, `"9223372036854775807"`. Adapters decode them by the contract type, so a JavaScript adapter makes a `bigint`.

Rule S02 checks that each case validates against the schemas of the contract and meets its `pre`.

### The adapter protocol

`algo gen` writes one adapter per node and language (08.5). The runner starts it once and talks to it with JSON lines on standard input and output. Cases run in one process, in order, so the start-up cost of the JVM or of .NET is paid once.

```
→ {"op":"hello"}
← {"op":"hello","lang":"rust","node":"merge-sort","entry":"merge_sort","version":"impl blake3:7d0e…"}
→ {"op":"call","id":"basic/duplicates","args":{"xs":[3,1,3,2]}}
← {"id":"basic/duplicates","ok":true,"result":[1,2,3,3],"ns":1840}
→ {"op":"session","id":"edge/chain-5","ctor":[5],"ops":[["union",0,1],…]}
← {"id":"edge/chain-5","ok":true,"results":[true,true,…],"ns":5210}
→ {"op":"call","id":"edge/bad","args":{…}}
← {"id":"edge/bad","ok":false,"error":"panic: index out of bounds: the len is 3 but the index is 3"}
→ {"op":"bye"}
```

- `ns` is the time of the call alone, measured by the adapter with the monotonic clock of the language. It is a report, not a check. The complexity checks use their own runs (9.7).
- For `mode: inout`, `result` is the value of the parameter after the call.
- If the adapter dies, the runner records a crash for that case, starts a new adapter and goes on with the next case.
- The runner enforces the limits (9.8) from outside. The adapter never sets them.
- The adapter decodes and encodes with the codec that `algo` ships for the language: the standard library JSON where there is one (Python, Go, JavaScript, C#), and a small MIT codec from algorithm-agent where there is not (C, C++, Java, Rust, Lua, Zig, Haskell, …). It lives in the generated tree, not in the node directory, so rule I07 applies to the implementation only.

## 9.3 Checkers

Many problems have more than one right output: any topological order, any minimum spanning tree, any longest increasing subsequence, the shortest path tree when two paths tie. The checker decides whether an output is right. The contract names one kind:

| Kind | Accepts | Example |
|---|---|---|
| `exact` | the output equals `expect` (or the oracle output) | sorting, distances, KMP match positions |
| `unordered` | the same elements, any order | the list of bridges of a graph |
| `multiset` | the same elements with multiplicity, any order | all pairs with a given sum |
| `float` | equal within `abs` and `rel` tolerances given in the contract | numerical integration, closest pair distance |
| `any_of` | one of the outputs listed in `expect_any` | small cases with few valid answers |
| `custom` | whatever `checker.py` accepts | topological sort, MST, matching, LIS, Huffman codes |

A custom checker is a Python module with one function:

```python
# nodes/graphs/traversal/topological-sort-problem/checker.py
def check(args, output, expected=None):
    """Return None if `output` is a topological order of the DAG in `args`,
    else a short reason. `expected` is the oracle's output; it is not used
    here, because any topological order is right."""
    n, edges = args["n"], args["edges"]
    if sorted(output) != list(range(n)):
        return "not a permutation of the vertices"
    pos = {v: i for i, v in enumerate(output)}
    for u, v in edges:
        if pos[u] > pos[v]:
            return f"edge {u}->{v} goes backwards"
    return None
```

For optimization problems, the checker checks **feasibility** itself and **optimality** by comparing the value with the oracle's value: a matching is a set of disjoint edges of the graph (feasibility), and its size equals the size of the oracle's matching (optimality). The checker never trusts the implementation's claim of the value.

Rules:

- A checker is pure, deterministic and uses only the Python standard library. It runs in the Python runner image with no network.
- A checker is tested. `checker_cases.jsonl` lists outputs with `"valid": true` and `"valid": false`, including each mistake of the Pitfalls sections. Rule S03 checks that the checker gives the right verdict on each and that each reason is not empty.
- When the Lean spec is decidable, the spec is a second checker. Rule L06 (07.7) checks that it agrees with the Python checker on every case and every checker case. This is how the Python checker and the Lean spec are tied together.
- The checker also checks the kind of each value: an `int` result that is a float in JSON fails.

## 9.4 Generators

A generator makes random inputs that meet the preconditions of the contract. It is a Python module in `generators/` of the problem node:

```python
# nodes/sorting/sorting-problem/generators/few_unique.py
def generate(rng, n, k=3, T="int"):
    """n keys drawn from k distinct values."""
    values = [rng.randint(-10**9, 10**9) for _ in range(k)] if T == "int" \
        else ["".join(rng.choice("ab") for _ in range(3)) for _ in range(k)]
    return {"xs": [rng.choice(values) for _ in range(n)]}
```

`cases/generated.yaml` registers the generators and the size classes:

```yaml
size: len(xs)
classes:
  tiny:   {range: [0, 8],            count: 0, exhaustive: true}   # every input up to symmetry
  small:  {range: [9, 100],          count: 300}
  medium: {range: [101, 10000],      count: 30}
  large:  {range: [100000, 1000000], count: 2}
generators:
  - {name: uniform,     file: generators/uniform.py}
  - {name: few-unique,  file: generators/few_unique.py, params: {k: [1, 2, 3, 10]}}
  - {name: sorted,      file: generators/shapes.py, params: {shape: sorted}}
  - {name: reversed,    file: generators/shapes.py, params: {shape: reversed}}
  - {name: organ-pipe,  file: generators/shapes.py, params: {shape: organ-pipe}}
  - {name: median3-killer, file: generators/median3_killer.py, adversarial: true,
     note: "Musser's input that makes median-of-3 quicksort quadratic"}
seeds:
  pr: [1, 2, 3]
  nightly: rotate        # the seed is the date, so each night tests new inputs
```

Kinds of generators:

- **Exhaustive.** For tiny sizes, every input up to symmetry: every permutation of up to 7 keys with repeats from 3 values, every graph on up to 5 vertices, every binary string up to length 10. Exhaustive tests catch most off-by-one bugs.
- **Random.** Uniform and structured shapes: sorted, reversed, few unique, all equal, sawtooth, organ pipe for sequences; trees, paths, stars, complete graphs, grids, random sparse and dense graphs; random, periodic and Fibonacci strings.
- **Adversarial.** Inputs that hit the worst case of some algorithm of the problem: sorted input for the naive quicksort pivot, the median-of-3 killer, $a^{n}$ with the pattern $a^{m-1}b$ for naive string matching, a chain of unions for union–find without ranks, graphs that force $\Theta(m)$ decrease-key calls in Dijkstra, the edge order that makes Bellman–Ford use all $n-1$ rounds, colliding keys for a hash table whose hash function the page documents. Each algorithm page's worst case (06.6) names its generator, and the complexity check uses it (9.7).
- **Extremes.** Values at the bounds of the contract, for the overflow cases of 08.9 (rule I08), and the deepest input (a path, a sorted list at the largest size) for the deep-input case (rule I09).

Rules:

- A generator uses only the `rng` it is given (a `random.Random`). The same generator, parameters, size and seed give the same bytes on every machine (rule S05). The Python version is the one pinned in the Python image.
- A generator meets `pre`. The runner checks each generated input against the contract before it uses it, and a bad input is a generator bug, not an implementation failure.
- Generated inputs are cached in `build/cases/<problem>/<hash>.jsonl`, keyed by the generator file hash, the parameters and the seed.

## 9.5 The oracle and differential testing

### The oracle

The oracle gives the reference output for any input. The contract names it (9.1). In order of preference:

1. **The Lean model** of an algorithm that solves the problem at L2 or better, compiled into `algo-oracle` (07.13, 08.10). Its output is proved to meet the spec.
2. **A Python reference**, `reference.py`, written to be obviously correct, not fast: often brute force or the textbook algorithm in its simplest form. Until a Lean model exists, a person reviews it, as Q-10 (20) decides. When the Lean model is too slow at large sizes, the reference is used above `lean_max`.
3. **A brute force**, `brute.py`, for problems where a fast reference is itself tricky (optimization, matching, flows). It runs on tiny and small sizes only.

Before the oracle is used, rule S07 checks that the oracles agree with each other: the Lean oracle, the reference and the brute force on all tiny and small inputs of every generator. When the Lean model lands for a problem that used a Python reference, any disagreement on the past cases is a finding, as Q-10 says.

Oracle outputs are cached in `build/oracle/<problem>/<input hash>.json`. The cache key includes the oracle's hash (the Lean `type_hash` and the module's source hash, or the reference file's hash).

### Differential testing

For each implementation and each generated input, the runner calls the adapter and the oracle, and the checker compares the two outputs. For `exact` checkers this is equality. For `custom` checkers the oracle output is passed as `expected`, which the checker uses for the optimal value.

| Run | Inputs | When |
|---|---|---|
| PR | every tiny input; 300 small; 30 medium; the adversarial generators at small size; seeds `pr` | each pull request that touches the implementation, the contract, the cases or the oracle |
| nightly | the same, plus 10 times as many small and medium inputs with the rotating seed, and the large class | each night on the build server |

For data structures, the differential test is **model-based**: a generator of operation sequences (random, plus adversarial ones such as many `decrease_key` calls or a chain of unions) runs against the implementation and against the Lean model of the abstract type (the multiset of a priority queue, the partition of disjoint sets). After each operation the results must agree.

An implementation reaches I2 only when the differential run passes on every input (rule I03). One failure is enough to stay at I1, and the shrunk input becomes a regression case (9.11).

## 9.6 Mutation testing

A test suite that passes proves little if it would also pass for wrong code. Mutation testing makes many small wrong versions of the implementation (mutants) and counts how many the tests catch (kill).

- **The tool.** The runner image of each language has its mutation tool (08.7):

| Language | Tool |
|---|---|
| Python | mutmut |
| Java, Kotlin | PIT |
| JavaScript, TypeScript | StrykerJS |
| C# | Stryker.NET |
| Rust | cargo-mutants |
| Go | gremlins |
| C, C++ | Mull |
| others | `algo mutate`, a generic mutator on the tree-sitter grammar of the language, run inside the image |

- **The operators.** Whatever the tool, the mutants include at least: relational operator changes (`<` to `<=`, `>` to `>=`), arithmetic operator changes, constant changes by ±1, boolean negation of conditions, deletion of a statement, and swapping of two arguments. `algo mutate` uses exactly this set for every language, so scores are comparable when the native tool differs.
- **What kills a mutant.** The native tests (9.9), the shared cases (basic, edge, regress) and the PR-sized differential run. A mutant that does not compile, or that times out, counts as killed.
- **The score.** Killed mutants divided by all mutants minus the equivalent ones. A mutant that cannot change the output (for example `<` to `<=` where the two values are never equal) is equivalent. It is listed in `impl/<lang>/mutants.ignore` with a reason, and at most 5% of the mutants may be listed (rule S08). A person or the critic role checks each entry.
- **The threshold.** At least **85%** for I2 (rule I04). The pull request comment lists the surviving mutants with their line and the operator, and the tester role adds cases that kill them.
- **The budget.** At most 150 mutants per file, sampled with a fixed seed so that the score is stable, in PR runs. The nightly run tests all mutants of the files that changed since the last release.

Because the shared cases and the differential run are strong, most mutants die from them. The score measures the whole test system for that file, not only its native tests.

## 9.7 Complexity checks

Tests check that the output is right. The complexity check checks that the cost grows as the page claims. It cannot prove a bound, which is the job of the human proof and the Lean proof. It catches the gross mistakes: an accidental copy in a loop that makes merge sort quadratic, a missing path compression, a list used as a queue in BFS with `pop(0)`.

### What is measured

`bench.yaml` in the algorithm node (04.3) says what to measure:

```yaml
claims:
  time.worst:   {generator: median3-killer}
  time.average: {generator: uniform}
sizes: {from: 1024, factor: 2, steps: 9}      # 1024 … 262144
languages: default                             # the benchmark set, 08.8
counter: [time, instructions]
repeat: 5
```

Three counters:

1. **Wall time** on the build server: bare metal, fixed CPU frequency, isolated cores, the median of `repeat` runs, after a warm-up for JIT languages. Used for the benchmark set C++, Rust, Go and Java (08.8).
2. **Retired instructions** in user mode, from `perf stat -e instructions:u`, or from Cachegrind when hardware counters are not available. Instruction counts change by less than 1% from run to run, so they work for every language, including Python and Ruby. This is the "operation counter" of 08.8 for the languages outside the benchmark set.
3. **Lean ticks.** The oracle runs the `TimeM` model on the same inputs and reports `time`. Before a node has L3, this checks the claim of the front matter on the model itself, with the explicit bound function of 07.4 when it exists.

### How a claim is judged

For each claim, the measured points $(n_i, t_i)$ are fitted against each class of the ladder

$$1,\ \log n,\ \sqrt n,\ n,\ n\log n,\ n\log^2 n,\ n^{3/2},\ n^2,\ n^2\log n,\ n^3,\ 2^n$$

by least squares on $t \approx c\,g(n) + d$, and the class with the smallest relative residual is the **fit**. The variables come from the contract's size parameters. For two variables (graphs with $n$ and $m$), the generator fixes the ratio $m/n$ (sparse: $m = 4n$; dense: $m = n^2/4$), and the check runs once for each ratio.

| Outcome | Condition | Effect |
|---|---|---|
| pass | the fit is the claimed class or a lower one, or the claimed class's residual is within 10% of the best | none |
| warn | the fit is one step above the claim (claim $n\log n$, fit $n\log^2 n$) | a note in the report; often a constant or cache effect |
| fail | the fit is at least a factor $\sqrt n$ above the claim (claim $n\log n$, fit $n^2$) on the generator of the claim, on 3 nights in a row | the implementation drops to I2 (rule I06) and an issue is opened |

Only gross mismatches fail, as Q-13 (20) decides. Small exponents are hard to tell apart over 9 doublings, and a gate on them would be noise.

### Other cases

- **Amortized claims** are measured as the total cost of a sequence of $k$ operations, divided by $k$, for growing $k$.
- **Expected claims** use several seeds of the algorithm's own randomness and the median.
- **Space** is measured as peak resident memory at the largest sizes. It only warns, because runtimes allocate in large blocks.
- **Optimized versions** (08.6) must also be at least 1.3 times faster than the reference version on the largest size (rule I16).

The charts of these runs may be shown on the page, labelled as measurements (06.6).

## 9.8 The CI matrix, runner images, caching and flakiness

### What runs on a pull request

`algo test -changed` computes the affected set from the diff:

| Change | Runs |
|---|---|
| a file in `impl/<lang>/` of a node | that implementation: build, native tests, shared cases, differential, mutation sample |
| `contract.yaml`, `cases/`, `checker.py`, `generators/`, `reference.py` of a problem | every implementation of every algorithm that solves the problem, in every language; the checker tests; the oracle agreement |
| a Lean model or spec module | the Lean build of its dependants, L06, the oracle rebuild, and the differential runs of the problems that use it as oracle |
| `bench.yaml` | nothing on the PR; the next nightly |
| an image digest in `manifests/images.yaml` | nothing on the PR except a smoke set of 20 nodes; the nightly runs everything in that language |

GitHub Actions runs one job per pair (language, top area) of the affected set, with at most 20 jobs at once. Each job pulls the runner image by digest, runs `algo gen <lang>` for its area, and runs the tests in the sandbox of 08.7.

### Limits

| Limit | Value |
|---|---|
| CPU time per case, tiny and small | 2 s |
| CPU time per case, medium | 10 s |
| CPU time per case, large | 60 s (nightly only) |
| wall time | 3 times the CPU limit |
| memory | 1 GiB per adapter process (4 GiB for the large class) |
| network | none |
| one job | 20 minutes |

Limits are in `manifests/limits.yaml`, and the slow languages have a multiplier there (Python and Ruby 5×, R 8×), so an honest implementation in them does not time out.

### Caching

The result of a test run is cached in `build/test/<tag>/<lang>.json` with the key

`blake3(implementation files, contract directory, oracle hash, adapter template version, image digest, algo version, seed set)`.

A cache hit skips the run and reuses the result. The nightly full build starts from the cache of the last night, so it only reruns what changed, plus the rotating seeds.

### The nightly run

On the build server, each night:

1. the full matrix on `linux/amd64` and `linux/arm64` (rule I17: the same results on both);
2. the differential runs with the rotating seed and the large class;
3. mutation on every file changed since the last release;
4. the complexity checks of the core nodes, and of each node whose implementation changed in the week;
5. fuzzing (9.10);
6. the test matrix report (9.12).

### Flakiness

- A case is **flaky** when two runs on the same input, in the same image, give different results. Rule S09 marks it. A flaky case counts as a failure for the ladder.
- The usual cause is non-determinism in the implementation: iteration over a hash map in Go, an unseeded random pivot, a race. Each of these is a bug in the implementation unless the checker accepts every outcome and the randomness is the algorithm's own, with the seed passed in.
- A timeout is rerun once on a quiet runner. A second timeout is a failure.
- A flaky failure of the tooling (an image pull, a runner crash) is retried up to 2 times and never counts against the implementation.

## 9.9 Native tests

Each implementation has a test file in the test framework of its language (08.3). These tests are for readers: they show how to call the code, and the site shows them under the code (14.4).

Rules:

- **3 to 12 tests**, each short. At least: the example of the page (the same input as the page and the scene preset), the empty or smallest input, one edge class of the contract, and one case that the Pitfalls section names.
- **Deterministic.** No randomness and no time. Random testing belongs to the shared harness.
- **Standalone.** The native tests do not read the shared case files, so the code and its test can be copied together and run with nothing else.
- **Names say the behaviour,** in the style of the language: `test_sorts_duplicates_stably` (Python), `TestSortsDuplicatesStably` (Go), `sorts_duplicates_stably` (Rust), `sortsDuplicatesStably` (Java and Kotlin), `"sorts duplicates stably"` (JavaScript `node:test`, Swift Testing).
- **Data structures** call `check_invariant` after each operation when the implementation has it.

The native tests count for mutation (9.6), but most of the strength of the test system is in the shared harness.

## 9.10 Properties, metamorphic relations and fuzzing

**Properties.** The checker is the main property: it says what a right output is. Generic properties that hold for every implementation of a contract (output length, element types, no mutation of `in` parameters) are checked by the runner for every case.

**Metamorphic relations.** A relation says how the output must change when the input changes in a known way. It needs no oracle, so it catches bugs that the oracle and the implementation could share in principle (a wrong contract type map, for example). The contract lists them by name, and `relations.py` in the problem node defines each as a transform and a test:

| Problem | Relation |
|---|---|
| sorting | permuting the input does not change the output (`permute-input`) |
| lower bound (binary search) | `lower_bound(a, x) ≤ lower_bound(a, x + 1)`; adding $x$ to $a$ makes `a[lower_bound(a, x)] = x` |
| shortest paths | multiplying every weight by $c > 0$ multiplies every distance by $c$; adding an isolated vertex does not change the other distances |
| exact string matching | the matches of $P$ in $T$ shifted by $k$ are the matches in $X T$ for any $X$ of length $k$ that creates no new match |
| disjoint sets | the answers of `same` do not depend on the order of the `union` calls of a session |

The runner applies each relation to a sample of the generated inputs, on the oracle first (rule S08 also checks that the oracle meets every relation) and then on each implementation.

**Fuzzing.** Each night, coverage-guided fuzzing runs for C, C++, Rust and Go: libFuzzer with AddressSanitizer and UndefinedBehaviorSanitizer for C and C++, `cargo fuzz` for Rust, and `go test -fuzz` for Go. The fuzz entry is generated with the adapter. It turns the fuzzer's bytes into a valid input with the problem's generators (so the input meets `pre`), calls the implementation and the oracle, and runs the checker. A crash, a sanitizer report, a timeout or a disagreement becomes a regression case. The budget is 10 minutes per core node and language per night, in rotation.

## 9.11 Regression cases and shrinking

When a generated or fuzzed input breaks an implementation, the runner **shrinks** it before it reports it: it tries to remove elements, to make values smaller and to delete vertices and edges, and keeps each change that still fails. The result is a small input that a person can read.

The tester role (12.2) then opens a pull request that adds the shrunk input to `cases/regress.jsonl` of the problem, with a name `regress-<date>-<short hash>`, the language and node that it broke, and the expected output from the oracle. From then on, every implementation of the problem in every language runs it. A bug found in one language protects all of them.

## 9.12 The test matrix report

`algo build` writes `reports/tests/matrix.json` and a summary `reports/tests/matrix.md`:

- one row for each algorithm and data structure, one column for each language, and in each cell the I level and the first reason it is not higher (for example `I2: complexity warn, n log² n`);
- for each language: the number of implementations at each level, the pass rate of the nightly differential run, the distribution of mutation scores, and the slowest cases;
- for each problem: the oracle used (Lean or reference), the number of cases by class, and the open regression cases;
- the flaky cases and their issues.

The site renders it at `/matrix/` (14.19), and each pull request gets a comment with the ladder before and after for each node it touches.

## 9.13 Rules this document adds

Listed in 13.3 with their severities. The I rules are defined in 08.13; this document says how I02, I03, I04, I06, I08, I09, I16 and I17 are measured.

| Rule | Checks |
|---|---|
| S01 | `contract.yaml` is valid against its schema; each complexity variable of each solving algorithm is a size parameter or is defined |
| S02 | each case validates against the contract and meets `pre`; when `expect` is given, the oracle agrees |
| S03 | the checker gives the right verdict on every checker case, with a reason for each rejection |
| S04 | `edge.jsonl` has at least one case for each class of `edge_classes` |
| S05 | each generator is deterministic for its seed and meets `pre` |
| S06 | the contract of each core problem is reviewed by a person, bound to its hash |
| S07 | the Lean oracle, the reference and the brute force agree on all tiny and small inputs |
| S08 | at most 5% of mutants are marked equivalent, each with a reason; the oracle meets each metamorphic relation |
| S09 | a flaky case is marked, counts as a failure and has an open issue |
