# 08. Implementations

An implementation is code that a reader can read, run and copy. It is written to be read first and to be fast enough second. Each implementation meets the contract of the problem that its algorithm solves (09.1), so one set of tests checks every language.

## 8.1 What an implementation is

- An implementation belongs to one `algorithm` or `data-structure` node and one language. It lives in `impl/<lang>/` in the node directory (04.3).
- It has one **reference** version. It can also have other versions with labels (8.6).
- It has its native tests next to it, in the test framework of its language (8.3). The shared cases of the contract run through a generated adapter (8.5, 09.2). The native tests show a reader how to call the code. The shared cases prove that it is correct.
- It has no dependency outside the standard library of its language (8.4).
- It follows the pseudocode of the page line by line, and marks the lines with `@line` comments, so that the visualization and the page can show the line that runs (8.3, 10.5).
- The build computes its level I0 to I4 (8.8). Nobody writes the level.

## 8.2 The language register and the tiers

### 8.2.1 The register

`registers/languages.yaml` lists each language. A language is in the register before any implementation in it can merge (rule I12). Each entry has the fields of this example:

```yaml
- id: rust                    # the directory name under impl/
  name: Rust
  tier: 1
  ext: [rs]
  file_case: snake            # merge_sort.rs
  ident_case: snake           # fn merge_sort
  type_case: pascal           # struct BinaryHeap
  test: {framework: builtin, file: "inline mod tests"}
  format: {tool: rustfmt}
  lint: {tool: clippy, args: ["-D", "warnings"]}
  mutation: {tool: cargo-mutants}
  image: algo-runner-rust     # 8.7
  int: i64                    # the type of the contract type int (8.9)
  list: "Vec<T> / &[T]"
  comment: "//"
  highlight: rust             # the grammar of the site highlighter
  since: 2026-11
```

### 8.2.2 The tiers

| Tier | Languages | Required for | Count |
|---|---|---|---|
| **1** | Python, C++, Java, C, C#, JavaScript, TypeScript, Go, Rust, Kotlin | each node of the core, and each node of the long tail that has an implementation at all | 10 |
| **2** | Swift, Ruby, PHP, Dart, Scala, Haskell, OCaml, F#, Elixir, Julia, R, Zig, Lua | each node of the core | 13 |
| **Lean** | Lean 4, the executable model of 07.3 | each node with a Lean part | 1 |
| **3** | open: for example Clojure, Erlang, Perl, Nim, Crystal, Fortran, Ada, Racket, Common Lisp, MATLAB/Octave, Prolog, Mojo, Gleam, D, Pascal, Visual Basic | nothing; a contributor adds them | any |

"All popular languages" means tiers 1 and 2: 23 languages plus Lean. Tier 3 has the same harness, the same tests and the same ladder. It is not in the "complete" test of 04.8 and not in the coverage levels of 16.2. The site shows tier-3 implementations in the language menu under "More languages".

### 8.2.3 The evidence for the choice

No single ranking measures what readers of an algorithm site want. The tiers combine four signals (01.5):

| Signal | What it says (2025–2026) |
|---|---|
| TIOBE index, October 2026 | 1 Python 19.23%, 2 C 11.33%, 3 C++ 8.87%, 4 Java 8.41%, 5 C# 3.79%, 6 JavaScript 2.77%, 7 Visual Basic 2.20%, 8 R 2.06%, 9 SQL 1.97%, 10 Rust 1.44%, 11 Go 1.39%; Julia is back at 18; Dart and OCaml are close to the top 20; TypeScript is near 39 |
| GitHub Octoverse 2025 | TypeScript became the most used language on GitHub by monthly contributors, ahead of Python and JavaScript |
| Stack Overflow Developer Survey 2025 | JavaScript, Python, SQL, TypeScript, Java, C#, C++, C, PHP, Go, Rust and Kotlin lead among general-purpose languages |
| teaching and practice | Python, Java, C and C++ dominate first courses; C++ dominates competitive programming, then Python and Java; interview sites use Python, Java, C++, JavaScript, Go, Kotlin, Swift and C# |

The rules of the choice:

- **Tier 1** is each general-purpose language that is strong in at least two of the four signals. Kotlin is in tier 1 for its weight in interviews and on Android. Swift and PHP are just below the line, so they lead tier 2.
- **Tier 2** is each language with a strong showing in one signal and a real community that reads about algorithms: the functional family (Haskell, OCaml, F#, Scala, Elixir), the scientific family (Julia, R), the systems newcomer (Zig), the scripting family (Ruby, PHP, Lua) and the app family (Swift, Dart).
- **Not in tiers 1 or 2:** SQL (not a general-purpose language; set-based algorithms such as joins are explained in SQL inside the prose of `systems/database-algorithms`), Visual Basic (high on TIOBE, low everywhere else), MATLAB (proprietary; Octave can be tier 3).
- The tiers are reviewed once a year, in November, against the four signals. A move between tiers is a pull request to the register with the numbers.

### 8.2.4 The pinned toolchains

`manifests/toolchains.yaml` pins one toolchain for each language. `algo bump toolchains` proposes newer versions each month, runs the full test matrix of the language with them, and opens a pull request with the report. The versions below are the first pins; the manifest is the truth.

```yaml
python:     {version: "3.14", test: pytest, format: ruff, lint: [ruff, mypy --strict]}
cpp:        {compilers: [gcc 15, clang 21], std: c++23, flags: "-Wall -Wextra -Wpedantic -Werror", sanitizers: [address, undefined]}
c:          {compilers: [gcc 15, clang 21], std: c23, flags: "-Wall -Wextra -Wpedantic -Werror", sanitizers: [address, undefined]}
java:       {jdk: "25", build: gradle, test: junit 5}
kotlin:     {version: "2.3", jvm: "25", test: kotlin.test}
csharp:     {dotnet: "10", lang: "14", test: xunit, nullable: enable}
javascript: {node: "24", test: "node:test"}
typescript: {node: "24", tsc: "pinned in the image", strict: true, test: "node:test"}
go:         {version: "1.27", test: testing, lint: [go vet, staticcheck]}
rust:       {channel: stable, edition: "2024", test: builtin, lint: clippy}
lean:       {toolchain: "leanprover/lean4:v4.35.0", mathlib: "v4.35.0"}   # same pin as math2 (07.2)
```

Two compilers for C and C++ catch code that depends on one compiler. The sanitizers run on the shared cases and the random tests. An implementation that triggers a sanitizer report is at I0 for that run.

## 8.3 Conventions for each language

### 8.3.1 Rules for every language

1. **Read first.** The reference version is the clearest correct code that meets the stated bound. A trick that saves a constant factor and costs clarity goes in the `optimized` version (8.6).
2. **Follow the pseudocode.** The names of variables and procedures are the names of the pseudocode of the page (06.4), changed only to the case rule of the language. One procedure of the pseudocode is one function of the code. The order of the steps is the same.
3. **Mark the lines.** Each line of the pseudocode that the page or the scene refers to has a marker comment on the line of code that does it: `# @line L4` in Python, `// @line L4` in C++. A marker can be on more than one line of code. Rule I11 checks that each line id of the pseudocode has at least one marker, and that each marker names a line id that exists.
4. **One entry point.** The function or type that the contract names is the public entry point. Its name comes from the contract by the case rule of the language (8.3.3). Helpers are private where the language has private.
5. **No input or output.** The implementation reads no file, no standard input and no environment, and it prints nothing. The adapter does the input and output (8.5).
6. **No global mutable state.** Each call is independent. A cache that persists between calls is not allowed in the reference version.
7. **Preconditions are written down.** The doc comment says what the input must satisfy (sorted, non-negative weights, a DAG). The behaviour on an input that breaks a precondition is the behaviour that the contract says: return an error value, raise, or "undefined, not tested".
8. **Comments explain why.** The doc comment says what the function does, its cost, and a link to the page. Line comments say why a step is right or needed, never what the syntax does. The invariant of each loop of the proof is a comment above the loop, in the words of the proof (06.5).
9. **Short lines.** At most 100 columns, 4 spaces or the format tool of the language. The formatter of the register decides; nobody argues about style.
10. **Size.** A reference version is usually 10 to 80 lines without tests. Rule I13 warns above 200 lines, which often means that the code does too much or that the node should split.

### 8.3.2 The table of tools

| Language | File name | Entry name | Test framework | Formatter | Linter and checks |
|---|---|---|---|---|---|
| Python | `merge_sort.py`, `test_merge_sort.py` | `merge_sort` | pytest | ruff format | ruff, mypy --strict |
| C++ | `merge_sort.hpp`, `merge_sort_test.cpp` | `algo::merge_sort` | `algo_test.hpp` (8.4) | clang-format | clang-tidy, -Werror, sanitizers |
| Java | `MergeSort.java`, `MergeSortTest.java` | `MergeSort.sort` | JUnit 5 | google-java-format | javac -Xlint:all -Werror |
| C | `merge_sort.h`, `merge_sort.c`, `merge_sort_test.c` | `merge_sort` | `algo_test.h` (8.4) | clang-format | clang-tidy, -Werror, sanitizers |
| C# | `MergeSort.cs`, `MergeSortTests.cs` | `MergeSort.Sort` | xUnit | dotnet format | analyzers, warnings as errors, nullable |
| JavaScript | `merge-sort.mjs`, `merge-sort.test.mjs` | `mergeSort` | node:test | Biome | Biome lint |
| TypeScript | `merge-sort.ts`, `merge-sort.test.ts` | `mergeSort` | node:test | Biome | tsc --strict, Biome lint |
| Go | `merge_sort.go`, `merge_sort_test.go` | `MergeSort` | testing | gofmt | go vet, staticcheck |
| Rust | `merge_sort.rs` | `merge_sort` | `#[cfg(test)] mod tests` | rustfmt | clippy -D warnings |
| Kotlin | `MergeSort.kt`, `MergeSortTest.kt` | `mergeSort` | kotlin.test | ktfmt | detekt |
| Swift | `MergeSort.swift`, `MergeSortTests.swift` | `mergeSort` | Swift Testing | swift-format | swift-format lint |
| Ruby | `merge_sort.rb`, `merge_sort_test.rb` | `merge_sort` | minitest | rubocop -a | rubocop |
| PHP | `MergeSort.php`, `MergeSortTest.php` | `mergeSort` | PHPUnit | php-cs-fixer | phpstan max |
| Dart | `merge_sort.dart`, `merge_sort_test.dart` | `mergeSort` | package:test | dart format | dart analyze |
| Scala | `MergeSort.scala`, `MergeSortSuite.scala` | `mergeSort` | munit | scalafmt | -Werror |
| Haskell | `MergeSort.hs`, `MergeSortSpec.hs` | `mergeSort` | hspec | fourmolu | hlint, -Wall -Werror |
| OCaml | `merge_sort.ml`, `test_merge_sort.ml` | `merge_sort` | alcotest | ocamlformat | warnings as errors |
| F# | `MergeSort.fs`, `MergeSortTests.fs` | `mergeSort` | Expecto | Fantomas | warnings as errors |
| Elixir | `merge_sort.ex`, `merge_sort_test.exs` | `MergeSort.sort` | ExUnit | mix format | credo --strict |
| Julia | `merge_sort.jl`, `test_merge_sort.jl` | `merge_sort` | Test (stdlib) | JuliaFormatter | Aqua checks |
| R | `merge_sort.R`, `test_merge_sort.R` | `merge_sort` | testthat | styler | lintr |
| Zig | `merge_sort.zig` | `mergeSort` | builtin `test` blocks | zig fmt | zig build -freference-trace |
| Lua | `merge_sort.lua`, `merge_sort_spec.lua` | `merge_sort` | busted | StyLua | luacheck |
| Lean | `lean/Algo/.../MergeSort.lean` (07.3) | `Algo.Sorting.MergeSort.mergeSort` | `#guard`, `lake test` | (none) | `algo lean lint` |

The register holds this table. `algo new impl <slug> <lang>` writes the two files with the right names, the licence header, the doc comment, the signature from the contract and empty bodies with `@line` markers for each pseudocode line.

### 8.3.3 The canonical signature

The contract of the problem (09.1) gives the signature in a neutral type language:

```yaml
# nodes/searching/sequential-and-binary-search/lower-bound-problem/contract.yaml (part)
entry: lower_bound
params:
  - {name: a, type: "list<int>", pre: "sorted non-decreasing"}
  - {name: x, type: int}
returns: {type: int, post: "least i with a[i] >= x, or len(a)"}
generic: {T: ordered}          # optional: the entry may be generic over T
bounds: {len(a): [0, 1000000], int: [-2^63, 2^63-1]}
```

The neutral types and their mapping:

| Neutral | Python | C++ | Java | C | C# | JS/TS | Go | Rust | Kotlin | Haskell |
|---|---|---|---|---|---|---|---|---|---|---|
| `int` | `int` | `std::int64_t` | `long` | `int64_t` | `long` | `number` (safe range) or `bigint` (8.9.1) | `int64` | `i64` | `Long` | `Int` |
| `index` | `int` | `std::size_t` | `int` | `size_t` | `int` | `number` | `int` | `usize` | `Int` | `Int` |
| `bool` | `bool` | `bool` | `boolean` | `bool` | `bool` | `boolean` | `bool` | `bool` | `Boolean` | `Bool` |
| `float` | `float` | `double` | `double` | `double` | `double` | `number` | `float64` | `f64` | `Double` | `Double` |
| `string` | `str` | `std::string_view` in, `std::string` out | `String` | `const char *` + length | `string` | `string` | `string` | `&str` in, `String` out | `String` | `String` |
| `list<T>` | `list[T]` / `Sequence[T]` | `std::span<const T>` in, `std::vector<T>` out | `long[]` or `List<T>` | pointer + length | `ReadOnlySpan<T>` / `T[]` | `T[]` | `[]T` | `&[T]` in, `Vec<T>` out | `List<T>` / `LongArray` | `[T]` |
| `graph` | adjacency `list[list[int]]` | `std::vector<std::vector<int>>` | `List<List<Integer>>` | CSR arrays | `List<int>[]` | `number[][]` | `[][]int` | `Vec<Vec<usize>>` | `List<List<Int>>` | `Array Int [Int]` |
| `wgraph` | `list[list[tuple[int, int]]]` | `std::vector<std::vector<Edge>>` | `List<List<Edge>>` | CSR + weights | `List<(int, long)>[]` | `[number, number][][]` | `[][]Edge` | `Vec<Vec<(usize, i64)>>` | `List<List<Edge>>` | `Array Int [(Int, Int)]` |
| `option<T>` | `T \| None` | `std::optional<T>` | `OptionalLong` / `Optional<T>` | out param + `bool` | `T?` | `T \| null` | `(T, bool)` | `Option<T>` | `T?` | `Maybe T` |

The register holds the full table for each language. Rule I14 checks that the entry point has the canonical signature after the mapping.

The case rule maps `lower_bound` to `lower_bound` (snake), `lowerBound` (camel) or `LowerBound` (Pascal, for Go exports and C# methods). Languages with classes put the entry in a class named after the algorithm (`BinarySearch.lowerBound` in Java and Kotlin, `BinarySearch.LowerBound` in C#).

### 8.3.4 Generics

- When the contract has `generic: {T: ordered}`, a language with cheap and clear generics writes the entry generically: Rust `T: Ord`, C++ `std::totally_ordered T`, Go `cmp.Ordered`, Java `<T extends Comparable<? super T>>`, C# `where T : IComparable<T>`, Swift `T: Comparable`, Kotlin `T : Comparable<T>`, TypeScript with a comparator, Haskell `Ord a`, OCaml with a `compare` argument or a functor.
- The adapter calls the generic entry with `int` and with `string` cases, so the generic code is tested on two types.
- C has no generics. The C reference works on `int64_t`. A C `qsort`-style version with a comparator and `void *` is a variant with the label `generic` (8.6).
- Python, Ruby, JavaScript, Lua and the other dynamic languages are generic already. Python adds type hints with a `TypeVar` bound to a `SupportsLessThan` protocol written in the file, because `typing` is in the standard library.

### 8.3.5 Data structures

A `data-structure` node implements the operations of its `abstract-type` (04.5). The implementation is:

- a class (Python, Java, C#, C++, Kotlin, Swift, Ruby, PHP, Dart, Scala, TypeScript, JavaScript), a struct with methods (Go, Rust, Zig), a module with an abstract type (OCaml, Haskell, F#, Elixir, Julia), a table with functions (Lua) or an opaque struct with functions that take a pointer (C: `heap_new`, `heap_push`, `heap_free`);
- with one method for each operation of the abstract type, named after the operation by the case rule;
- with a constructor from nothing and, when the abstract type lists `build`, from a list;
- with no method that the abstract type does not list, except private helpers and, optionally, `check_invariant`, which the tests call after each operation in debug runs.

Persistent structures in Haskell, OCaml, Elixir, F# and Scala return a new value from each update. Their contract is the same; the adapter threads the value through the sequence of operations (09.2).

## 8.4 The standard library only

Rule I07: an implementation imports nothing outside the standard library of its language, at the pinned version.

- The reason: a reader can copy the file into any project, and the code shows the whole algorithm. A dependency would hide the part that the page explains.
- The `library` variant (8.6) may call the standard library's own version (`bisect.bisect_left`, `std::sort`, `slices.Sort`). It still imports only the standard library.
- Tests may use the one test framework of the register. The runner image has it at a pinned version. For C and C++, which have no standard test framework, the harness provides `algo_test.h` and `algo_test.hpp`: one small header each, MIT, with `CHECK`, `CHECK_EQ` and a test registry. It lives in algorithm-agent, and `algo gen` copies it into the build tree.
- Rule I07 reads the imports with the parser of each language (tree-sitter grammars in `algo`) and compares them with the list of standard modules of the pinned version, which the runner image exports as `stdlib.txt`.
- A data structure that the algorithm uses and that the standard library lacks (a priority queue with decrease-key, a disjoint-set forest) is written in the same file as a private helper, or the file imports the reference implementation of that node through the build tree. The second form is allowed only for nodes in `uses`, and the site shows a link to the imported node next to the code.

## 8.5 Generated build trees

Implementations live with their algorithms. Build tools want one tree per language. `algo gen <lang>` makes that tree in `build/lang/<lang>/` from each `nodes/**/impl/<lang>/`, and nobody edits it (rule I15: no file under `build/` is committed).

| Language | The generated tree |
|---|---|
| Python | a package `algo` with one module for each node, `algo.sorting.merge_sort`; `pyproject.toml`; `conftest.py` with the case fixtures |
| C++ | one CMake project; one test target for each node, grouped by top area; the header `algo_test.hpp` |
| C | as C++, with one static library for each top area |
| Java | one Gradle build with one subproject for each top area; package `algo.<area>.<slug without hyphens>`; JUnit 5 |
| Kotlin | as Java |
| C# | one solution with one project for each top area and one test project for each; namespace `Algo.<Area>.<Slug>` |
| JavaScript | one directory of ES modules and a `package.json` with no dependencies; `node --test` |
| TypeScript | as JavaScript, plus a `tsconfig.json` with `strict` |
| Go | one module `algo.local/impl` with one package for each node, named after the slug without hyphens (`mergesort`) |
| Rust | one Cargo workspace with one crate for each top area; `lib.rs` declares each node as a module with `#[path]` |
| Lean | not generated; `lean/` is its own Lake package (07.2) |
| others | the register gives a template for each, for example a `dune-project` for OCaml or a `Package.swift` for Swift |

Rules of the generator:

- Files are copied, not linked, so that the image can mount the tree read-only. `build/lang/<lang>/SOURCES` maps each generated path back to its node path. `algo test` rewrites each compiler error and test failure to the node path, so the author sees `nodes/sorting/comparison/merge-sort/impl/rust/merge_sort.rs:14`.
- Where the language needs a package or namespace line in the file (Java, Kotlin, C#, Go, Scala), the node file carries it, and the generator checks that it matches the path (rule I12). The file still compiles alone after a reader copies it and fixes that one line.
- The generator also writes the **adapter** of each node: a small program in the language that reads cases as JSON lines on standard input, decodes them to the native types of 8.3.3, calls the entry point and writes the result as JSON. The adapter for C and C++ includes a tiny JSON codec. The protocol is in 09.2. The adapter is not part of the implementation and is not shown on the site.
- One build for each top area keeps compile times low and lets the matrix run areas in parallel (8.7). A change to one node rebuilds its area only.

## 8.6 Versions with labels

A node can have more than one version in a language. The reference version is in `impl/<lang>/`. Each other version is in `impl/<lang>/<label>/`.

| Label | What it is | Rules |
|---|---|---|
| `reference` | the default: clear, correct, within the stated bound | exactly one for each language; the I level is its level |
| `optimized` | faster in practice: iterative instead of recursive, a cutoff to insertion sort, branchless steps, cache-aware layout | the same contract and tests; the benchmark (09.7) must show a speedup of at least 1.3× on the largest size, or the version is removed (rule I16) |
| `functional` | idiomatic functional style in a language where the reference is imperative (a recursive Scala or Kotlin version, a fold in Python) | same contract; same tests |
| `library` | the call to the standard library's own version, with a note on its guarantees (`std::sort` is introsort, not stable; `sorted` in Python is Timsort, stable) | one call and a note; tested on the shared cases |
| `generic` | a generic form where the reference is not generic (C with `void *` and a comparator) | tested with two element types |
| `contest` | short code for competitive programming, with the usual shortcuts of that community | tested; shown only in the "Competitive programming" course and under a toggle |

The site shows the reference version first and a version menu next to the language menu (14.4). The label is in the file path, never in the code.

## 8.7 Runner images and the sandbox

### 8.7.1 Images

- Each language has one image, `ghcr.io/tamnd/algo-runner-<lang>`, built from `algorithm-agent/images/<lang>/Dockerfile`. It holds the toolchain, the test framework, the formatter, the linter, the mutation tool (09.6), the benchmark helper and `stdlib.txt`.
- `manifests/images.yaml` in the content repository pins each image by digest, as in math2. A new image is a pull request that moves the digest and carries the report of the full test matrix of the language with it.
- Images are built for `linux/amd64` and `linux/arm64`. The nightly build runs both, and a test that passes on one architecture and fails on the other is a finding (rule I17).

### 8.7.2 The sandbox

Each run of tests or benchmarks of an implementation runs in its image under these limits:

| Limit | Value |
|---|---|
| network | none (`--network none`) |
| file system | the build tree read-only; a tmpfs of 512 MiB for build outputs |
| user | an unprivileged user, no new privileges, the default seccomp profile |
| CPU | 2 cores for a test run, 1 pinned core for a benchmark run |
| memory | 2 GiB for each run, 256 MiB for each case batch unless the contract asks for more |
| time | 10 s for each batch of cases, 120 s for a native test suite, 600 s for a mutation run of one node |
| processes | at most 256 |

Code from a pull request runs only inside the sandbox, on the CI runners or the build server, never on a maintainer's machine through `algo` (rule I18: `algo test` refuses to run tests outside a container unless `-unsafe-local` is given).

### 8.7.3 The cache

- Build caches (Cargo target, the Go build cache, Gradle, the .NET cache) live in volumes keyed by the image digest. Dependencies of tests are inside the image, so builds are offline.
- A test result is cached under the hash of: the implementation files, the contract, the cases, the generator specs and seeds, the adapter, and the image digest. A cached pass is reused until one of them changes.
- The pull request check runs only the changed implementations and, when a contract or its cases change, every implementation of every algorithm that solves the problem (03.6).

### 8.7.4 Scale (estimate)

At 1,200 core nodes × 23 languages, plus the long tail in tier 1, the matrix has about 35,000 implementations. A cold full run on the build server (32 cores) is estimated at 3 to 5 hours, most of it compilation and mutation testing. A warm nightly run with the cache is estimated at under 30 minutes. M2 measures both (19).

## 8.8 The implementation ladder I0–I4

The build computes one level for each node and each language, from the reference version.

| Level | It needs | Rules |
|---|---|---|
| I0 | no reference version, or one that fails a check below I1 | |
| I1 | it builds with no warnings under the flags of the register, on both compilers where there are two, and passes every shared case of the contract (09.2) | I01, I02, I07, I10, I12, I14 |
| I2 | I1, and it passes the random and adversarial differential tests against the oracle (09.5), the overflow and deep-input cases (8.9), the sanitizers where they exist, and its native tests plus the shared cases kill at least 85% of the mutants (09.6) | I03, I04, I08, I09 |
| I3 | I2, and the formatter makes no change, the linter reports nothing, the `@line` markers are complete, and the complexity check passes (09.7) where the language is in the benchmark set | I05, I06, I11 |
| I4 | I3, and a person who is not the author reviewed this exact file hash (13.4) | |

The benchmark set is C++, Rust, Go and Java, where timing is stable enough. For the other languages, I3 needs the complexity check of the operation counters in 09.7 instead of wall-clock time.

A node is "tested everywhere" (13.1) when each tier-1 language is at I3 and each tier-2 language is at I2.

## 8.9 Numbers, overflow and recursion

### 8.9.1 Integers

- The contract type `int` is a signed 64-bit integer. The contract gives `bounds` for each input (8.3.3). An implementation must give the right answer for every input inside the bounds, with no overflow in any intermediate value (rule I08).
- The shared cases of each contract include the extreme values of its bounds, so an implementation that writes `(lo + hi) / 2` fails I2 when the indices can be large, and one that adds two weights fails when the sum can pass 2^63 − 1.
- Python, Ruby, Haskell (`Integer`), Elixir, Lisp-family and other languages with big integers by default still meet the bounds; the adapter checks that results fit in 64 bits.
- JavaScript and TypeScript: `number` is exact up to 2^53 − 1. A contract whose values stay in that range uses `number`. A contract with full 64-bit values uses `bigint`, and the register says so for each contract. The adapter checks the range.
- Modular arithmetic contracts (number theory) give the modulus. Multiplication of two residues near 2^63 uses `__int128` in C and C++, `u128` in Rust, `math/bits.Mul64` in Go, `Math.multiplyHigh` in Java, or a double-and-add helper written in the file.

### 8.9.2 Floats

A contract with `float` outputs gives an absolute and a relative tolerance, and the checker compares within them (09.3). Numerical algorithms state their error bound in the front matter, and a case that is outside the bound fails.

### 8.9.3 Recursion depth

- Recursion is allowed and often clearer. The reference version may recurse when the depth is O(log n) (merge sort, balanced trees) or bounded by a small constant.
- When the depth can be Θ(n) (DFS, naive quicksort, recursive DP on a path), the reference version must pass the **deep input** case of the contract, a path or a sorted list at the largest size (rule I09). Languages with small default stacks (Python, JavaScript, Java, C#, Kotlin) then use an explicit stack in the reference version, and keep the recursive form as a `functional` version with a note on its limit. The page says why.
- Languages with tail calls or large stacks (Scheme, Elixir, OCaml with OCaml 5 stacks, Haskell with lazy evaluation where it is safe) may keep the recursive form when it passes the deep input case.
- The adapter never raises the stack limit, so the result is the one a reader would get when they copy the code.

## 8.10 The Lean model as a language

The Lean model of 07.3 is an implementation too:

- It is executable. `lake build` makes the binary `algo-oracle`, which reads cases as JSON lines, runs the model of the named node and writes the result. It is the oracle of the differential tests (09.5).
- It has a tab on the page, "Lean", next to the other languages, with a link to the proof (14.4). It is written in the plain functional style that the proofs need, with `List`, `Array`, `Nat` and `Int`, and termination proved, not `partial`.
- Its level is the formal ladder L0–L4 (07.8), not the I ladder. It does not count as a tier-1 or tier-2 language.
- When the model is too slow to be an oracle at the largest sizes (a list-based model of an array algorithm), the contract marks the sizes above which the oracle is the Python reference instead, and the build first checks the Python reference against the Lean oracle on the smaller sizes (09.5).

## 8.11 The licence header

Each implementation and test file starts with two comment lines:

```
SPDX-License-Identifier: MIT
Part of https://algorithm.tamnd.com/merge-sort/. The authors are listed in prov/4MRG7S.jsonl.
```

Rule I10 checks them. The MIT licence text is in `LICENSES/MIT.txt`, and `REUSE.toml` gives MIT to each `impl/` path (17.1). Copying the file with the header meets the licence. The header has no year and no list of names, so it never changes when the code changes.

## 8.12 A worked example: lower bound in four languages

The page `binary-search` has this pseudocode (06.4), with line ids:

```
LOWER-BOUND(a, x)
L1  lo ← 0; hi ← n
L2  while lo < hi
L3      mid ← lo + ⌊(hi − lo) / 2⌋
L4      if a[mid] < x then lo ← mid + 1
L5      else hi ← mid
L6  return lo
```

The loop invariant of the proof is: every index below `lo` holds a value less than `x`, and every index at or above `hi` holds a value at least `x`.

**Python**: `impl/python/binary_search.py`

```python
# SPDX-License-Identifier: MIT
# Part of https://algorithm.tamnd.com/binary-search/. The authors are listed in prov/2B7QDX.jsonl.
"""Binary search for the first position whose value is at least x."""

from collections.abc import Sequence


def lower_bound(a: Sequence[int], x: int) -> int:
    """Return the least i with a[i] >= x, or len(a) if there is none.

    a must be sorted in non-decreasing order. Time O(log n), extra space O(1).
    """
    lo, hi = 0, len(a)  # @line L1
    # Invariant: a[i] < x for i < lo, and a[i] >= x for i >= hi.
    while lo < hi:  # @line L2
        mid = lo + (hi - lo) // 2  # @line L3
        if a[mid] < x:  # @line L4
            lo = mid + 1
        else:  # @line L5
            hi = mid
    return lo  # @line L6
```

`impl/python/test_binary_search.py`

```python
# SPDX-License-Identifier: MIT
# Part of https://algorithm.tamnd.com/binary-search/. The authors are listed in prov/2B7QDX.jsonl.
from binary_search import lower_bound


def test_finds_first_of_equal_values() -> None:
    assert lower_bound([1, 2, 2, 2, 5], 2) == 1


def test_returns_length_when_all_smaller() -> None:
    assert lower_bound([1, 2, 3], 9) == 3


def test_empty() -> None:
    assert lower_bound([], 0) == 0
```

**C++**: `impl/cpp/binary_search.hpp`

```cpp
// SPDX-License-Identifier: MIT
// Part of https://algorithm.tamnd.com/binary-search/. The authors are listed in prov/2B7QDX.jsonl.
#pragma once
#include <concepts>
#include <cstddef>
#include <span>

namespace algo {

// The least i with a[i] >= x, or a.size() if there is none.
// a must be sorted in non-decreasing order. Time O(log n), extra space O(1).
template <std::totally_ordered T>
std::size_t lower_bound(std::span<const T> a, const T& x) {
    std::size_t lo = 0, hi = a.size();  // @line L1
    // Invariant: a[i] < x for i < lo, and a[i] >= x for i >= hi.
    while (lo < hi) {                   // @line L2
        std::size_t mid = lo + (hi - lo) / 2;  // @line L3
        if (a[mid] < x) {               // @line L4
            lo = mid + 1;
        } else {                        // @line L5
            hi = mid;
        }
    }
    return lo;                          // @line L6
}

}  // namespace algo
```

**Go**: `impl/go/binary_search.go`

```go
// SPDX-License-Identifier: MIT
// Part of https://algorithm.tamnd.com/binary-search/. The authors are listed in prov/2B7QDX.jsonl.

// Package binarysearch finds the first position whose value is at least x.
package binarysearch

import "cmp"

// LowerBound returns the least i with a[i] >= x, or len(a) if there is none.
// a must be sorted in non-decreasing order. Time O(log n), extra space O(1).
func LowerBound[T cmp.Ordered](a []T, x T) int {
	lo, hi := 0, len(a) // @line L1
	// Invariant: a[i] < x for i < lo, and a[i] >= x for i >= hi.
	for lo < hi { // @line L2
		mid := lo + (hi-lo)/2 // @line L3
		if a[mid] < x { // @line L4
			lo = mid + 1
		} else { // @line L5
			hi = mid
		}
	}
	return lo // @line L6
}
```

**Rust**: `impl/rust/binary_search.rs`, with its tests inline

```rust
// SPDX-License-Identifier: MIT
// Part of https://algorithm.tamnd.com/binary-search/. The authors are listed in prov/2B7QDX.jsonl.

//! Binary search for the first position whose value is at least x.

/// Returns the least `i` with `a[i] >= x`, or `a.len()` if there is none.
///
/// `a` must be sorted in non-decreasing order. Time O(log n), extra space O(1).
pub fn lower_bound<T: Ord>(a: &[T], x: &T) -> usize {
    let (mut lo, mut hi) = (0, a.len()); // @line L1
    // Invariant: a[i] < x for i < lo, and a[i] >= x for i >= hi.
    while lo < hi {
        // @line L2
        let mid = lo + (hi - lo) / 2; // @line L3
        if a[mid] < *x {
            // @line L4
            lo = mid + 1;
        } else {
            // @line L5
            hi = mid;
        }
    }
    lo // @line L6
}

#[cfg(test)]
mod tests {
    use super::lower_bound;

    #[test]
    fn finds_first_of_equal_values() {
        assert_eq!(lower_bound(&[1, 2, 2, 2, 5], &2), 1);
    }

    #[test]
    fn returns_length_when_all_smaller() {
        assert_eq!(lower_bound(&[1, 2, 3], &9), 3);
    }

    #[test]
    fn empty() {
        assert_eq!(lower_bound::<i64>(&[], &0), 0);
    }
}
```

The four files have the same shape, the same names, the same invariant comment and the same six markers. The site shows them in tabs, with the active pseudocode line highlighted in the code of the reader's language during the visualization (10.5). The `library` versions are one line each: `bisect.bisect_left(a, x)`, `std::ranges::lower_bound(a, x) - a.begin()`, `sort.Search(len(a), func(i int) bool { return a[i] >= x })` and `a.partition_point(|v| v < x)`.

## 8.13 The rules of this document

The rules are listed in 13.3. In short:

| Rule | Checks |
|---|---|
| I01 | it builds with no warnings under the flags of the register |
| I02 | it passes each shared case of the contract |
| I03 | it passes the random and adversarial differential tests against the oracle |
| I04 | its tests kill at least 85% of the mutants |
| I05 | the formatter makes no change and the linter reports nothing |
| I06 | the complexity check passes |
| I07 | standard library only |
| I08 | no overflow inside the contract bounds (the extreme cases pass) |
| I09 | the deep-input case passes |
| I10 | the licence header is present |
| I11 | the `@line` markers cover the pseudocode line ids and name only existing ids |
| I12 | the language is in the register, and the file names and the package line follow its conventions |
| I13 | warning: a reference version is longer than 200 lines |
| I14 | the entry point has the canonical signature of the contract |
| I15 | no generated file under `build/` is committed |
| I16 | an `optimized` version is at least 1.3× faster on the largest benchmark size |
| I17 | the results are the same on amd64 and arm64 |
| I18 | tests of a pull request run only in the sandbox |
