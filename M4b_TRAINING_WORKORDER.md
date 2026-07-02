# M4b — Trained Track Work Order

**For:** Claude Sonnet 5.0, agent mode, VS Code, repo `snn-sandbox`
**Author:** technical reviewer / architect (handoff)
**Status of project at handoff:** software phase closed on a *decisive negative* — **but only in the untrained regime**. M4b's single job is to determine whether that negative survives end-to-end training, or whether training reopens a window. This document is a scoped work order, not open-ended implementation. Do not exceed its non-goals.

---

## 0. Read this first — the one way to get M4b wrong

The project's honest conclusion (e11) is that the energy advantage belongs to **event-driven coding in general, not to spikes specifically**. A trained spiking net will look good *if you compare it against a weak baseline*. That is the failure mode. **The trained spiking net must be compared against an equally-trained analogue+event-driven-ADC network** — the same steelman that killed the untrained case — at **matched accuracy**. If you compare trained-SNN vs untrained-or-naive-digital, you have rebuilt a strawman and the result is worthless. Everything below exists to prevent that.

---

## 1. Where we are (context you must not re-derive)

- The codebase is Brian2-based, organised as an installable `snnlab` package with a uniform `Experiment` / `Result` pattern (`build → run → record → evaluate → save`) and an `evaluate()` function rating each experiment `good / promising / discard` against **pre-declared** expected ranges saved to `results/*.json`.
- Robustness rule of the project: *reproducible ≠ robust*. A headline claim only counts if it survives a multi-seed × ±20% parameter sweep with **separated, non-overlapping error bars**. This rule is applied to the project's own claims, not just competitors'.
- Energy is accounted through `src/snnlab/energy.py`, where **every per-operation joule figure is sourced** (Horowitz ISSCC'14 for MAC & memory, Walden/Murmann ADC figure-of-merit, Loihi per-spike). This file is the single source of truth for energy and must remain so.
- The untrained gates already ran:
  - **e10 (energy gate):** three-way at iso-fidelity (spike-regen vs analogue+clocked-ADC vs pure-digital). Spiking beats pure digital ~10×, **loses** to analogue+ADC at sourced defaults, wins the full three-way race in ~14% of the ratio space (expensive-ADC / cheap-spike corner).
  - **e11 (sparsity gate):** added an **event-driven (level-crossing) ADC steelman** that also skips zeros. Sparsity helps the spike and the event-ADC *equally*; the spike beats the steelman in only ~3% of the (ratio × sparsity) space and never at defaults. **Decisive negative.**
  - **e09 lesson:** lower relative-L2 does **not** imply better `argmax` decision — coherent drift shifts all states together and a cosine/argmax readout largely survives it, while spike quantisation injects incoherent angular noise that L2 under-weights but `argmax` feels. **L2 ≠ accuracy.**

The one thing all of the above shares: **nothing was trained.** M4b closes that.

---

## 2. The M4b question (state it exactly this way in code comments and the results JSON)

> When a network is **trained end-to-end** on a task that lives inside the energy-favourable regime e10/e11 mapped, does spike-based regeneration reach a **target task accuracy at lower energy** than a trained analogue+**event-driven-ADC** steelman — at **matched accuracy**?

Corollary sub-questions, all pre-committed:

1. **Does training let fidelity become accuracy?** e09 said no in the untrained fixed case. Under training, does the fidelity edge finally translate into a decision-level advantage? Test on a readout that is *sensitive to coherent bias* (a regression / value output), where fidelity should bite — not only on `argmax` classification, where e09 showed it doesn't.
2. **Does training discover a cheaper spike code?** The project's cost model is *rate coding pays linearly in spikes for precision*. Surrogate-gradient training can in principle learn a sparser temporal code. Measure the **trained spike count at iso-accuracy** and check whether it drops below the rate-coding budget. If it does, the "linear in spikes" cost narrows; if not, it holds even trained. Either outcome is a result.

### Null hypothesis (consistent with e11, must be pre-declared)
Training helps the spiking net and the event-ADC steelman **equally**, so the ~3% verdict is unchanged and the negative merely upgrades from *untrained* to *trained*. **This null is a success, not a failure:** upgrading the negative to the trained regime is precisely what closes the "you didn't train" objection and makes the write-up defensible at a venue. Do not treat rejecting the null as the goal.

---

## 3. Non-goals (hard scope — do not cross)

- **No hardware.** M5 stays closed regardless of M4b's outcome unless a *trained* window opens at defaults, which is not expected.
- **No SOTA-chasing.** The task must be small and fast (CPU-trainable in minutes). This is a decision experiment, not a benchmark leaderboard.
- **No new energy constants.** Reuse `energy.py`. If the event-driven (level-crossing) ADC energy model there is not yet as carefully sourced as the MAC/spike figures, flag it in a `TODO(source)` comment and use the existing plausible range — do **not** invent a favourable number for either side.
- **No task outside the e10/e11-favourable regime** unless explicitly justified in the JSON, because a win outside that regime is meaningless.
- **Do not modify** the existing e01–e11 experiments or their results JSON. M4b is additive.

---

## 4. Design

### 4.1 Stack boundary (Brian2 ↔ snnTorch)

Surrogate-gradient training is PyTorch/snnTorch territory; Brian2 is not built for it. Therefore:

- Add a new module `src/snnlab/training.py` that holds snnTorch models, the surrogate-gradient training loop, and weight export.
- **`energy.py` remains the single source of truth.** The torch inference path must *count operations* (spikes emitted, analogue MACs, ADC conversions, digital MACs, memory accesses) and multiply by the existing sourced constants from `energy.py`. Do not re-implement energy numbers inside torch.
- Device non-idealities must be applied through the **same** models as the rest of the project. Either import `src/snnlab/nonidealities.py` and apply them to the trained weights at inference, or, if that is impractical inside the torch graph, replicate them by *calling* the existing functions — never by re-deriving them. The realistic preset must be identical to what e05/e06/e10 used.
- Add `snntorch` to `pyproject.toml` `[dev]` extras. Keep the NumPy-only Brian2 target for the existing experiments; snnTorch is torch/CPU and additive.

### 4.2 The four architectures (all trained, same protocol)

| id | Architecture | Regeneration |
|---|---|---|
| **A** | analogue crossbar MAC + **1-bit spike** encode/decode | spike-regenerated |
| **B** | analogue crossbar MAC + periodic **clocked multi-bit ADC/DAC** | clocked ADC |
| **B-evt** | analogue crossbar MAC + **level-crossing (event-driven) ADC** | event ADC — **the steelman** |
| **C** | pure digital MACs + weight-memory accesses | von Neumann baseline |

All four are trained to the **same target accuracy** on the same task with the same seeds and the same device non-ideality preset. Energy is measured **after** matching accuracy, not at matched hyperparameters. If an architecture cannot reach the target accuracy, record that as its result — do not silently drop it.

### 4.3 Two experiments

- **`e12_trained_regression.py` — the discriminating test (primary).**
  A trained **regression / value-output** task where the readout is a continuous value, so coherent bias directly shifts the output and fidelity is expected to matter (unlike `argmax`). Default task: a synthetic continuous-target task built on the existing overlapping-prototype generator used in e05 (reuse it; map prototypes to a scalar/vector target instead of a class label). Metric: energy at **iso-accuracy** where accuracy = task error (MSE / R²), three-way + steelman. This is the experiment most able to reopen a window.

- **`e13_trained_classification.py` — the control.**
  The same pipeline with a classification readout (`argmax`). Purpose: confirm whether training lets accuracy track fidelity, or reproduces the e09 null under training. A same-as-untrained result here (no accuracy gap) is a valid, informative outcome and must not be over-interpreted.

- **`e12_robustness.py`** — apply the project's robustness rule to whichever of e12/e13 produces the headline claim (seeds × ±20% on the decisive hyperparameters and the decisive energy ratios).

### 4.4 What gets measured (per architecture, per task)

- Task accuracy (MSE/R² for e12; classification accuracy for e13).
- Total inference energy via `energy.py`, decomposed by op type.
- **Trained spike count at iso-accuracy** (for A) — feeds sub-question 2.
- Energy-at-iso-accuracy across the decisive ratio sweep (`E_adc/E_spike`, `E_mem/E_mac`) and, for e12, whether the trained regime shifts the ~3% / ~14% fractions from the untrained gates.

---

## 5. Pre-declared acceptance criteria (WRITE THESE BEFORE LOOKING AT RESULTS)

Save these ranges into the experiment's `expected` block *before* the first full run, exactly as the existing experiments do. Rating rubric, consistent with the project:

- **discard** — the trained spike net does **not** beat the trained event-ADC steelman at iso-accuracy anywhere near defaults (fraction of favourable space ≲ 5%, matching untrained ~3%). ⇒ *Negative upgraded to trained regime.* This is the expected outcome under the null and is a **publishable** result.
- **promising** — a **robust** iso-accuracy energy win over the steelman opens in a non-trivial, clearly-bounded slice of the (ratio × sparsity) space that was closed in the untrained case (e.g. favourable fraction rises meaningfully above the untrained ~3% *with separated error bars*), but not at sourced defaults.
- **good** — a robust iso-accuracy energy win over the **event-ADC steelman at or near the sourced defaults**, surviving the multi-seed × ±20% sweep with non-overlapping error bars. (Do not expect this. If you get it, scrutinise the steelman's energy model and training first — it is the most likely place a bug flatters the spike.)

The crossover / win criterion must be **formalised**, not eyeballed: define "separated error bars" as non-overlapping bootstrap CIs (state the CI level, e.g. 95%, and n_seeds) at the compared operating point. Report the criterion in the JSON.

---

## 6. Robustness protocol

- Minimum **10 seeds** for any headline claim (the untrained gates used 5–10; the trained claim is the load-bearing one, so use ≥10).
- ±20% sweep on the decisive hyperparameters (learning rate, membrane decay / `beta`, spike budget or ADC bits) **and** the two decisive energy ratios.
- Set **all** RNG seeds: `torch`, `numpy`, Python `random`, and `torch.use_deterministic_algorithms(True)` + cuDNN deterministic flags (even on CPU, set them for portability).
- A claim that does not survive the sweep with non-overlapping CIs is downgraded per the project rule (as e04 was: good → promising).

---

## 7. Deliverables

```
src/snnlab/
  training.py         NEW — snnTorch models (A / B / B-evt / C), surrogate-gradient
                      training loop, accuracy-matching protocol, weight export,
                      op-count instrumentation feeding energy.py
experiments/
  e12_trained_regression.py     NEW — primary, coherent-bias-sensitive readout
  e13_trained_classification.py NEW — control, argmax readout (e09 re-test, trained)
  e12_robustness.py             NEW — robustness re-validation of the headline claim
tests/
  test_training.py    NEW — unit tests: models build; a net actually fires (guard
                      against the trivial "no spikes → free" degenerate win);
                      op-counts × energy.py reproduce e11 continuity at s=1 / dense;
                      accuracy-matching converges; determinism (same seed → same result)
results/              NEW e12/e13 PNG (gitignored) + JSON (tracked)
```

Update `README.md`: fill the M4b roadmap row with the honest outcome and one-line finding, in the same voice as the existing rows. If the null holds, state plainly that the negative now holds in the trained regime and the "you didn't train" objection is closed. Do **not** soften a negative.

---

## 8. Implementation pitfalls (specific to this work)

- **Degenerate energy win.** A net that never fires trivially "wins" on energy. Add a test asserting non-trivial spike activity and non-trivial task accuracy before any energy comparison is valid. A cheap-but-useless net is not a win.
- **Unfair accuracy matching.** Comparing a well-trained spike net to an under-trained steelman is the classic rig. Train each architecture to the **same target accuracy** (early-stop at target, or build a Pareto front of accuracy vs energy and compare at equal accuracy). Report each architecture's converged accuracy so the match is auditable.
- **Surrogate-gradient instability.** Use a standard surrogate (fast-sigmoid or arctan), sane `beta` init, gradient clipping. Verify neurons don't die (all-zero spikes) — that is a bug, not a result.
- **The steelman must be trained too.** B-evt is not a fixed baseline; train it under the identical protocol. This is the single most important fairness check, mirroring e11.
- **Energy model asymmetry.** Confirm the level-crossing ADC energy in `energy.py` is sourced or explicitly flagged as an assumption with a plausible range. The entire M4b verdict leans on this number being fair; do not let it silently favour either side.
- **Metric consistency.** e12 compares energy at iso-**accuracy** (task metric), NOT iso-L2. Do not reuse the iso-L2 protocol from e10/e11 for e12 — that was e10's choice and e09 showed why L2 can mislead. iso-L2 for e12 is a bug.
- **Continuity check.** At the dense / `s=1` limit with training disabled (or weights frozen to the untrained values), the op-count × energy path must reproduce e10/e11 numbers (A≈364, B≈51, C≈5222 pJ). If it doesn't, the torch energy instrumentation disagrees with `energy.py` — fix that before trusting any trained number.

---

## 9. Honesty anchors (restate in the results JSON `notes`)

- The honest competitor is the **event-driven ADC**, not pure digital or a clocked ADC. A win only counts against B-evt.
- Compare at **matched accuracy**, not matched hyperparameters.
- A negative that survives training is a **strong, publishable** result — do not treat it as failure and do not chase a positive by weakening the steelman.
- Rate coding is the spike's worst energy case; report whether training found anything cheaper, and scope the "linear in spikes" claim to what was actually tested.

---

## 10. Definition of done

M4b is complete when:

1. `e12`, `e13`, `e12_robustness` run, self-evaluate against pre-declared ranges, and save JSON.
2. The continuity check (§8) passes against e10/e11.
3. Tests pass, including the anti-degenerate-win and determinism guards.
4. The README M4b row states the honest outcome (upgraded negative *or* a bounded reopened window), and — critically — whether the trained result **closes the "you didn't train" objection**, which is the whole point of M4b.

Outcome mapping:
- **Null holds (expected):** negative now holds trained ⇒ the write-up is defensible at a venue; M5 stays closed.
- **Window reopens (unexpected):** a bounded, robust regime where trained spiking beats the event-ADC steelman at matched accuracy ⇒ M4b escalates to a scoped positive and M5 may be reconsidered *only* for that regime. Scrutinise the steelman before believing this.

---

## 11. Open decisions for the human (defaults chosen; override in your first message if you disagree)

- **Regression task (e12):** default = synthetic continuous-target built on the e05 overlapping-prototype generator. Alternative if you want realism: a small delayed-value / temporal-integration task. Your call — the default is the fastest defensible one.
- **Target accuracy for matching:** default = the accuracy each architecture reaches at a fixed modest training budget, matched via early-stop; switch to full Pareto-front comparison if the matched-accuracy approach proves fragile.
- **Energy regime target:** default = sweep the same `(E_adc/E_spike, E_mem/E_mac)` ranges as e10/e11 so trained vs untrained fractions are directly comparable. Do not narrow the sweep to flatter the spike.
