# Corrections to the Instructor's Brief

This document records all errors, ambiguities, historical conflations, and chronological corrections identified in the assignment brief during the research pass on October 14, 2026.

---

### 1. Chronological Sorting vs. Pedagogical Order (Trap T-ORDER)
* **Brief's Framing:** The brief listed mechanisms in pedagogical / textbook order:
  `Standard Attention -> Absolute Learned -> Sinusoidal -> RoPE -> ALiBi -> MQA -> GQA -> Sliding Window -> Sinks -> NTK -> YaRN -> Linear -> Delta -> Gated DeltaNet -> MLA -> Sparse/Top-K -> CSA -> DroPE`.
* **Historical Reality:**
  * **Sparse Transformer (April 2019)** and **MQA (November 2019)** appeared nearly **two years before RoPE (April 2021)** and **ALiBi (August 2021)**.
  * **Linear Attention (June 2020)** and **Delta Rule Fast Weight Programmers (February 2021)** also appeared **before RoPE and ALiBi**.
  * **DroPE (December 2025)** was placed at the end of the brief list after CSA (April 2026), but actually appeared months *before* DeepSeek-V4's CSA release.
* **Resolution:** Re-ordered all mechanisms strictly by their verifiable first public appearance date (arXiv v1 submission, official public repository, or forum post).

---

### 2. Learned Absolute Position Embeddings (Trap T-LEARNED)
* **Brief's Framing:** Listed "Learned absolute position embeddings" with a 2017 date, implying origin in the Transformer paper.
* **Correction:** Learned absolute position embeddings in sequence models were introduced in **ConvS2S** (Gehring et al., Facebook AI Research, arXiv:1705.03122, May 8, 2017). Vaswani et al. (June 12, 2017) evaluated learned positional embeddings in Table 3 (row E) and found performance virtually identical to sinusoidal embeddings (+0.1 BLEU), selecting sinusoidal because it might allow sequence length extrapolation. Both dates and citations are explicitly documented.

---

### 3. NTK-Aware Scaled RoPE is Not an Academic Paper (Trap T-NTK)
* **Brief's Framing:** Listed alongside academic papers, with a prompt note to verify its nature.
* **Correction:** NTK-Aware Scaled RoPE has **no academic paper**. It was published by open-source researcher **bloc97** as a Reddit post on `r/LocalLLaMA` (post ID: `14lz7j5`) on **June 29, 2023**. It was later formalized in academic literature by Peng et al. in the YaRN paper (August 31, 2023). It is explicitly badged as a "Community Post" in our timeline. Furthermore, the brief omitted **Position Interpolation** (Meta, June 27, 2023), which was the direct catalyst for bloc97's NTK discovery.

---

### 4. The Delta Rule Lineage (Trap T-DELTA)
* **Brief's Framing:** The brief listed "the delta rule" as a single milestone in proximity to 2024 work.
* **Correction:** The delta rule is a multi-decade mathematical progression:
  1. **Concept Origin:** Widrow-Hoff (1960) adaptive LMS filter.
  2. **Fast Weight Programmers:** Schmidhuber (1992).
  3. **Linear Attention Connection:** Schlag, Irie, Schmidhuber (arXiv:2102.11174, February 22, 2021).
  4. **Parallel DeltaNet:** Yang et al. (arXiv:2406.06484, June 10, 2024) chunked Householder sequence parallelization.
  5. **Gated DeltaNet:** Yang, Kautz, Hatamizadeh (arXiv:2412.06464, December 9, 2024, ICLR 2025 Oral) channel decay gating.
  We explicitly distinguish each milestone with exact dates and mathematical formulations.

---

### 5. Sparse & Top-K Attention Are 2019, Not 2025 (Trap T-SPARSE)
* **Brief's Framing:** Placed "sparse & top-k attention" late in the sequence near 2025 work.
* **Correction:** Sparse attention is **2019** (OpenAI's Sparse Transformer, April 23, 2019). Explicit Top-K attention is **2019** (Zhao et al., December 25, 2019). The 2025 breakthroughs (NSA in Feb 2025; DSA in Sept 2025) represent the *return* of sparsity in natively differentiable, hardware-aligned forms. We represent sparsity as a recurring thread across 2019, 2020, and 2025.

---

### 6. Top-K Does NOT Reduce KV Cache Memory (Trap T-TOPK-MEM)
* **Brief's Framing:** Implied sparse/top-k attention reduces memory.
* **Correction:** Top-k attention (e.g. Zhao et al. 2019, and DeepSeek DSA 2025) reduces **attention compute FLOPs**, NOT KV cache memory! In DSA, the full uncompressed KV cache must still reside in GPU HBM alongside the indexer cache. DeepSeek-V4's Compressed Sparse Attention (CSA, April 2026) is what actually reduces physical KV cache memory by horizontally pooling $m$ tokens into 1.

---

### 7. Conflation of NSA, DSA, and CSA (Trap T-CSA)
* **Brief's Framing:** Addressed them in generic terms.
* **Correction:** These are three fundamentally distinct mechanisms:
  1. **NSA (Native Sparse Attention, Feb 16, 2025):** 3-branch architecture (compressed, selected blocks, sliding window).
  2. **DSA (DeepSeek Sparse Attention, Sept 29, 2025):** Lightning indexer top-k routing over MLA.
  3. **CSA / HCA (Compressed Sparse Attention, April 24, 2026):** Block pooling $m \to 1$ prior to top-k routing, paired with Heavily Compressed Attention.
  4. **CSA2 (Sept 15, 2026):** Cross-layer sharing of KV and indices across Full/Reindex/Reuse modes with native FP4 KV storage.

---

### 8. Paper Title Corrections
* **ALiBi:** Brief listed "Train Short, Test Long: Attention with Linear Biases Enables Input Length Generalization". The official published title is *"Train Short, Test Long: Attention with Linear Biases Enables Input Length Extrapolation"* (Press et al., arXiv:2108.12409).
* **Gated DeltaNet:** Exact title is *"Gated Delta Networks: Improving Mamba2 with Delta Rule"* (Yang, Kautz, Hatamizadeh, arXiv:2412.06464).
* **NSA:** Exact title is *"Native Sparse Attention: Hardware-Aligned and Natively Trainable Sparse Attention"* (not "Differentiable").

---

### 9. Qwen3-Next Release Date (Trap T-QWEN)
* **Brief's Note:** Prompt seed ledger flagged a risk of secondary sources claiming August 2025.
* **Finding:** Secondary aggregators frequently mistook early branch commits for the release. The primary source (official HuggingFace model cards and vLLM production day-0 release) confirms **September 11, 2025**.

---

### 10. DroPE Methodology & Timeline Placement (Trap T-DROPE)
* **Brief's Note:** Flagged risk of confusing DroPE with NoPE.
* **Finding:** DroPE (Sakana AI & Oxford, Gelberg et al., arXiv:2512.12167v1, submitted December 13, 2025) is NOT NoPE. NoPE trains from scratch without positions. DroPE pretrains *with* RoPE, then drops positional embeddings during a brief recalibration phase (~1-2% of pretraining tokens).
