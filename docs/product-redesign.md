# Product redesign: from lessons to demonstrated capability

## Principle

Learners should not only study frontier AI infrastructure. They should work on real frontier
problems, produce verifiable evidence, contribute to real systems, and build a path into
internships, research, open-source work, and full-time jobs.

This is not only an education platform. It is a **learning, research, contribution, and
talent-development system**. The final outcome is not course completion. The final outcome is
demonstrated capability, real contribution, professional credibility, and access to meaningful
work.

The loop the product must make visible:

```text
learn -> experiment -> prove -> contribute -> get reviewed -> get hired
```

## Why this repo is already the seed

The hackathon build was designed around one discipline that the redesign generalizes:
**a claim only counts with a receipt, and every receipt names its evidence state.** That is
exactly the property a talent system needs — a portfolio is only stronger than a résumé if
every line in it is verifiable.

| Redesign pillar | Existing surface | State |
| --- | --- | --- |
| Learn the concept | `index.html` nine-stage lesson, `lab.html` thirteen-phase continuous view | live (local) |
| Inspect a working example | `challenge/baseline/` reproducible bad baseline | live (local) |
| Reproduce the result | `npm test` frozen acceptance contract, 10/10 | live (local) |
| Modify one variable | one-policy-at-a-time contract in `skills/touchdown-agent-optimizer/SKILL.md` | live (contract) |
| Submit evidence | `schemas/agent-optimization-receipt.schema.json`, receipt export | live (schema) + fixture data |
| Verified portfolio | `schemas/portfolio-receipt.schema.json`, `fixtures/portfolio-receipt.example.json` | schema live, example fixture_backed |
| Real challenge source | `challenge/CHALLENGE.md` (first marketplace entry, structured per the template below) | fixture_backed |
| Persist evidence | Butterbase data write (row `e5ff8fc6…9454`) | live_validated |
| Adaptive path | EverOS Case retrieval changing the next lesson | fixture_backed |
| Review, contribution, hiring | reviewer network, PR pipeline, hiring profiles | proposed |

Everything in the "proposed" row is design, not product. The demo pages label it that way.

## 1. The twelve-step progression

Every learning path leads into real work:

1. Learn the concept
2. Inspect a working example
3. Reproduce the result
4. Modify one variable
5. Diagnose a failure
6. Complete a guided challenge
7. Work on an open-ended industry or research problem
8. Submit evidence
9. Receive technical review
10. Contribute the accepted work
11. Add the result to a verified portfolio
12. Use that evidence to access internships, research opportunities, or jobs

Steps 1–8 are exercised end-to-end by the current build on the frozen task
`TD-A-01-RETRY-001` (steps 7's "open-ended" form is the take-home Mac MLX loop). Steps 9–12
exist as schema and page design only. `journey.html` walks the full path and marks each step
`live`, `fixture_backed`, or `proposed`.

## 2. Frontier challenge marketplace

Challenges come from real sources: company engineering teams, university laboratories,
open-source maintainers, published papers, production incident patterns, public benchmark
gaps, hardware vendors, cloud providers, nonprofit and government research programs.

Problem families (initial catalog): inference latency, prefix-cache reuse, KV-cache waste
diagnosis, quantization evaluation, engine comparison (vLLM / SGLang / llama.cpp), scheduling
under concurrency, cache-aware routing, paper reproduction, kernel ports, Triton kernels,
HBM bottleneck investigation, energy per successful task, local inference configuration,
observability, benchmark workload creation, correctness-failure hunting, documentation,
visual explanation, new-accelerator testing, CXL/memory-offload evaluation, benchmark
reproduction, fixes to real repositories.

Challenges are not artificial coding exercises. A challenge resembles the work an engineer,
researcher, or infrastructure team would actually perform.

### Challenge template (every entry must fill all fields)

```text
problem statement · why it matters · affected user or system · required background ·
suggested learning modules · codebase or environment · hardware requirements ·
reproduction steps · baseline · success criteria · verification method ·
expected evidence · constraints · safety and security boundaries ·
licensing and contribution rules · review process · estimated difficulty (L1–L9) ·
contribution path · internship / research / hiring relevance
```

First instantiation: [`challenge/CHALLENGE.md`](../challenge/CHALLENGE.md) wraps the existing
frozen retry task in this template so the marketplace has a working reference entry.

### Company-sponsored problems: boundaries

Company challenges must be bounded and sanitized. Never exposed: customer data, secrets,
private credentials, export-controlled information, sensitive infrastructure details,
unreviewed proprietary code, personal data. Use sanitized workloads, isolated environments,
synthetic data, open repositories, or approved code snapshots. The receipt schema's
`safety_boundary` field records what was excluded.

## 3. Contribution as an engineering discipline

Modules teach the mechanics maintainers actually reward: reading an unfamiliar codebase,
reproducing an issue, minimal test cases, logs and traces, benchmarking correctly, separating
correctness from performance, technical hypotheses, focused changes, validation,
documentation, useful issues, reviewable pull requests, responding to review, communicating
uncertainty, not overstating results, and working inside security/licensing/research
boundaries.

Contribution targets (no merge promises — the promise is reviewable quality): vLLM, SGLang,
LMCache, llama.cpp, PyTorch, Triton, Hugging Face libraries, MLIR projects, CUDA/ROCm
tooling, benchmark suites, profilers, visualization tools, research simulators, inference
observability projects, hardware-software co-design repositories.

High-quality rejected contributions retain portfolio value when the reasoning, experiments,
and review feedback are strong. The portfolio receipt has an explicit
`accepted: rejected_with_lessons` state for this.

## 4. Research participation

Tracks: reproduction of published results, new-hardware and new-model testing, failure-mode
hunting in reported results, experiment extension, new benchmark cases, algorithm comparison,
energy studies, memory-movement studies, cache-behavior studies, real-workload measurement,
simulators, hardware-software interface design, datasets, technical reports, co-authorship
when contributions justify it.

The system distinguishes — and the portfolio receipt labels — learning exercises,
reproduction studies, engineering contributions, research assistance, original research, and
publication-ready work. Credit matches the work actually performed. Participation is never
labeled authorship.

## 5. Honest experience labels

Every completed item carries exactly one experience label:

`guided_laboratory · reproduced_benchmark · open_source_issue_reproduction ·
accepted_pull_request · company_reviewed_challenge · research_reviewed_experiment ·
hardware_validation · technical_report · production_like_simulation · deployed_prototype ·
published_research_contribution`

Rules: a classroom simulation is never labeled production experience; a tutorial is never
labeled research; participation is never labeled authorship. This is the same discipline as
the repo's existing evidence states (`measured / live_validated / fixture_backed / derived /
vendor / unknown`) applied to human experience instead of system telemetry.

## 6. Verified portfolio and receipts

Every portfolio item includes a verification receipt
([`schemas/portfolio-receipt.schema.json`](../schemas/portfolio-receipt.schema.json)):
the task, the student's role, what they changed, what they measured, how the result was
verified, what reviewers said, what limitations remain, whether the contribution was
accepted, and whether the result was reproduced by another person. Unknown fields stay
`null` — never invented.

A rendered example (fixture-backed, from the demo's own stable-prefix change) lives in
[`fixtures/portfolio-receipt.example.json`](../fixtures/portfolio-receipt.example.json) and
is displayed on `journey.html`.

## 7. Skill graph based on evidence

No skill is awarded for watching a lesson or passing a quiz. Example gate — the
"KV-cache optimization" skill requires demonstrating all eight:

1. Explain KV-cache growth
2. Measure KV-cache memory
3. Identify cache waste
4. Modify a workload or policy
5. Run a controlled comparison
6. Verify output correctness
7. Explain the tradeoff
8. Defend whether the change should be deployed

Initial verified-skill catalog: inference profiling, prefix-cache analysis, KV-cache
diagnostics, vLLM operations, SGLang operations, llama.cpp deployment, PyTorch profiling,
Triton kernel development, CUDA debugging, benchmark design, quantization evaluation,
stateful routing, GPU memory analysis, cost modeling, energy measurement, research
reproduction, open-source contribution, technical writing, experimental design.

## 8. Difficulty ladder

```text
L1 Reproduce   – reproduce a known result
L2 Explain     – explain why the result occurs
L3 Modify      – change one variable and measure the effect
L4 Diagnose    – find the cause of an unknown failure or regression
L5 Improve     – produce a verified improvement
L6 Contribute  – submit a useful contribution to a real project
L7 Extend      – extend existing research or infrastructure
L8 Discover    – find a new result, failure mode, optimization, or design
L9 Lead        – define the problem, coordinate a team, review evidence, deliver
```

Current build covers L1–L5 on the frozen task. The take-home Mac MLX loop plus an
open-source issue is the designed L6 on-ramp. L7–L9 are proposed.

## 9. Hiring pathway and paid work

Discovery runs on verified evidence, not school or résumé keywords. Hiring profiles show
verified skills, challenge history, contributions, research work, reviewer ratings,
collaboration patterns, strengths, areas still developing, preferences, and availability —
evidence and context, never a single score.

Structured pathway: foundational learning → guided laboratories → team projects →
open-source contributions → company-reviewed challenges → paid micro-projects → part-time
apprenticeship → internship → full-time role.

Paid formats: bounties, research assistantships, benchmarking projects, documentation work,
reproduction studies, open-source sponsorships, company micro-projects, technical content,
data collection, hardware testing, infrastructure experiments, internships, apprenticeships.
Payment ties to clear scope, evidence, and review. No unpaid speculative work that replaces
normal employees; educational exercises, portfolio projects, volunteer open source, research
participation, paid company work, internship work, and employment stay distinct categories.

## 10. Reviewer network and teams

Reviewers: engineers, researchers, open-source maintainers, graduate students, professors,
infrastructure operators, hardware engineers, technical founders, experienced alumni. Review
evaluates correctness, experimental design, reproducibility, code quality, measurement
quality, communication, understanding of limitations, and usefulness to the target project.
Mentors guide without doing the work.

Team roles for problems too large for one student: workload engineer, inference engineer,
kernel engineer, benchmark engineer, data analyst, hardware researcher, visualization
engineer, technical writer, project lead, reviewer. Reference team project: *measure and
improve cost per successful coding-agent task across prompt construction, prefix caching,
engine scheduling, KV-cache placement, GPU execution, and verification* — each member with an
attributable contribution.

## 11. The feedback loop

1. Companies and researchers publish real bounded problems.
2. The platform converts them into learnable challenge paths.
3. Students learn the required foundations.
4. Students perform experiments.
5. Reviewers validate the evidence.
6. Useful results return to companies, laboratories, and open-source projects.
7. New failures and unanswered questions become future lessons and research challenges.
8. Strong contributors gain opportunities.
9. Alumni return as mentors, reviewers, founders, and challenge sponsors.

Company value: technically proven talent pipeline, reproduced benchmarks, open-source
contributions, research support, documentation, workload traces, cross-hardware validation,
lower-risk internship hiring, evidence of how candidates actually work. Not a cheap-labor
marketplace: the company must receive useful work; the learner must receive real education,
credit, feedback, and opportunity.

## 12. Build status and next receipts

| Capability | State | Next receipt to land |
| --- | --- | --- |
| L1–L5 on frozen task | live (local) | provider-token receipt on one live run |
| Portfolio receipt schema + example | live schema, fixture example | first real learner receipt with a named reviewer |
| Challenge template + first entry | fixture_backed | first externally sourced challenge (open-source issue) |
| Journey demo page | live (local, hardcoded) | replace proposed steps with live records |
| Review pipeline | proposed | one maintainer or engineer review round-trip |
| Hiring profiles / discovery | proposed | one company reading one portfolio receipt |
| Paid micro-projects | proposed | one bounded, paid, reviewed engagement |

A learner should be able to say: *I understand the mechanism. I reproduced the result. I
changed the system. I measured the effect. I verified correctness. I explained the
limitation. I contributed useful work. An engineer reviewed it. Here is the evidence. I am
ready for the next level of responsibility.*
