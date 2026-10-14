# How Does Attention Work Now? (2014 – 2026)
### A Chronological, Honest, and Interactive Explainer of Attention Mechanisms

[![Live App on Netlify](https://img.shields.io/badge/Netlify-Live%20Deploy-00C7B7?style=flat&logo=netlify)](https://marvelous-puffpuff-ae91a2.netlify.app)
[![Tests Passing](https://img.shields.io/badge/Vitest%20%26%20Pytest-Passing%20(22%2F22)-brightgreen)](https://github.com/thinkTinkerGreen/attention_timeline)
[![Primary Sources](https://img.shields.io/badge/Verification-30%2F30%20Verified-blue)](./docs/verification-log.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## 🌐 Live URLs & Deployment

* **Live Hosted Web App:** [https://marvelous-puffpuff-ae91a2.netlify.app](https://marvelous-puffpuff-ae91a2.netlify.app)
  * *Deployment Password:* `My-Drop-Site` (set automatically for anonymous drop deploys)
  * *Claim Your Site on Netlify:* [Claim Site Link](https://app.netlify.com/drop/marvelous-puffpuff-ae91a2#drop_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3OTE5OTY1NDUsImV4cCI6MTc5MjAwMDE0NSwiaXNzIjoiTmV0bGlmeSIsInNlc3Npb25faWQiOiI1YzNiNjRiZC1kNzdmLTQ0OTktYjI1Yi1mNDBjNDllMzRiY2UifQ.Yt1iVYP9tkHWBdRlRkI8LEGxxx5ZXsWGkVhkU5jUhi8) *(claim within 60 minutes to attach to your personal Netlify dashboard and unlock password restrictions)*
* **GitHub Repository:** [https://github.com/thinkTinkerGreen/attention_timeline](https://github.com/thinkTinkerGreen/attention_timeline)

---

## 🎯 Purpose & Pedagogical Philosophy

This application is built for machine learning researchers, engineers, and students who want to understand the real engineering and mathematical progression of attention mechanisms across a decade of foundation models. 

Standard attention is **not "bad"**: it solved the catastrophic information bottleneck of recurrent networks and unlocked massive GPU training parallelism. However, it generated three concrete costs:
1. **$O(N^2 d)$ prefill compute scaling**
2. **$O(N \cdot L \cdot H_{kv} \cdot d_h)$ linear KV-cache memory growth during autoregressive decoding**
3. **Permutation invariance (no built-in concept of token order)**
4. **Context horizon collapse past trained sequence lengths**

Every subsequent mechanism in history—from MQA and RoPE to FlashAttention, MLA, Gated DeltaNet, and DeepSeek-V4.1 CSA2—is a direct response to a limitation of what came before. We present no technique as universally "better"; we document what each technique buys, what bill it extracts, and the specific workload where choosing it is rational.

---

## 🛠️ Architecture & Dual-Stack Implementation

This repository provides **both** a production-grade interactive static web frontend and a rigorous Python numerical reference suite:

### 1. Web Application (TypeScript + Vite + SVG/Canvas + CSS)
* **Standard Attention Hero:** Step-by-step 6-stage worked example (4 tokens, $d=4$) with interactive toggles for $1/\sqrt{d_k}$ scaling (demonstrating softmax gradient saturation) and causal masking (demonstrating autoregressive sequence isolation).
* **Persistent Live Cost Ledger:** Sticky panel updating on scroll that evaluates prefill compute complexity, per-token KV cache memory, long-range recall exactness, and hardware friendliness for a stated **Reference Spec: 32 layers, 32 heads, $d_h=128$, FP16**.
* **Interactive Calculators & Visualizers:**
  * Universal KV Cache Memory & Bandwidth Calculator (MHA, GQA, MQA, MLA, CSA2).
  * Permutation Invariance token-shuffling experiment.
  * Attention Sinks & Sliding Window 2D token eviction heatmap.
  * Recurrent Associative Recall experiment (Linear Attention collision vs. Delta Rule error-correcting overwrite).
* **Workload Decision Lens:** Concrete guidance for 2K-token consumer chatbots, 128K-token legal document QA, and 1M-token autonomous coding agents.
* **Static-First & Accessible:** Makes full sense with JavaScript disabled; zero external font or script runtime bottlenecks; responsive on mobile and desktop.

### 2. Python Suite (`python/` & `tests/`)
* Pure Python + NumPy reference implementations of every major paradigm in `python/attention_mechanisms.py`.
* Interactive CLI KV cache calculator in `python/kv_cache_calculator.py`.
* Automated ledger integrity auditor in `python/verify_ledger.py`.
* Full pytest verification suite in `tests/test_attention_python.py`.

---

## 📜 Definition of "Launch Date"

As required by the Truth Protocol:
> **Launch Date** is strictly defined as the *date of first public appearance of the technique in a form a reader could inspect or use*: the **arXiv v1 submission date**, **first official public post/model release**, or **open-source forum submission**, whichever occurred earliest. Peer-reviewed venue dates and mainstream foundation model adoptions are tracked as secondary facts.

---

## ⏱️ Master Chronology Table (2014 – 2026)

All 30 entries below are verified against primary sources opened on **October 14, 2026**:

| First Appearance | Mechanism | Primary Event / Source | Venue / Adoption | Status |
|:---|:---|:---|:---|:---|
| **2014-09-01** | [Additive Attention (Bahdanau)](https://arxiv.org/abs/1409.0473) | [arXiv:1409.0473v1](https://arxiv.org/abs/1409.0473) | ICLR 2015 Oral | **VERIFIED** |
| **2017-05-08** | [Learned Absolute Positional Embeddings](https://arxiv.org/abs/1705.03122) | [arXiv:1705.03122v1](https://arxiv.org/abs/1705.03122) (ConvS2S) | ICML 2017 / Vaswani Tab. 3 | **VERIFIED** |
| **2017-06-12** | [Scaled Dot-Product & Multi-Head Attention](https://arxiv.org/abs/1706.03762) | [arXiv:1706.03762v1](https://arxiv.org/abs/1706.03762) | NeurIPS 2017 Oral | **VERIFIED** |
| **2017-06-12** | [Sinusoidal Positional Encoding](https://arxiv.org/abs/1706.03762) | [arXiv:1706.03762v1](https://arxiv.org/abs/1706.03762) | NeurIPS 2017 Oral | **VERIFIED** |
| **2018-03-06** | [Relative Position Representations (Shaw et al.)](https://arxiv.org/abs/1803.02155) | [arXiv:1803.02155v1](https://arxiv.org/abs/1803.02155) | NAACL-HLT 2018 | **VERIFIED** |
| **2019-04-23** | [Sparse Transformer (Fixed Patterns)](https://arxiv.org/abs/1904.10509) | [arXiv:1904.10509v1](https://arxiv.org/abs/1904.10509) + OpenAI Blog | OpenAI Release | **VERIFIED** |
| **2019-11-06** | [Multi-Query Attention (MQA)](https://arxiv.org/abs/1911.02150) | [arXiv:1911.02150v1](https://arxiv.org/abs/1911.02150) | PaLM Adoption (2022) | **VERIFIED** |
| **2019-12-25** | [Explicit Sparse / Top-k Attention](https://arxiv.org/abs/1912.11637) | [arXiv:1912.11637v1](https://arxiv.org/abs/1912.11637) | Peking Univ. / Alibaba | **VERIFIED** |
| **2020-04-10** | [Sliding-Window Attention & Global Tokens](https://arxiv.org/abs/2004.05150) | [arXiv:2004.05150v1](https://arxiv.org/abs/2004.05150) (Longformer) | Mistral 7B Return (2023) | **VERIFIED** |
| **2020-06-29** | [Linear Attention ('Transformers are RNNs')](https://arxiv.org/abs/2006.16236) | [arXiv:2006.16236v1](https://arxiv.org/abs/2006.16236) | ICML 2020 | **VERIFIED** |
| **2021-02-22** | [Delta Rule in Linear Attention](https://arxiv.org/abs/2102.11174) | [arXiv:2102.11174v1](https://arxiv.org/abs/2102.11174) | ICML 2021 | **VERIFIED** |
| **2021-04-20** | [Rotary Position Embedding (RoPE)](https://arxiv.org/abs/2104.09864) | [arXiv:2104.09864v1](https://arxiv.org/abs/2104.09864) (RoFormer) | GPT-J (2021) / LLaMA (2023) | **VERIFIED** |
| **2021-08-27** | [Attention with Linear Biases (ALiBi)](https://arxiv.org/abs/2108.12409) | [arXiv:2108.12409v1](https://arxiv.org/abs/2108.12409) | ICLR 2022 Oral / MPT-7B | **VERIFIED** |
| **2022-05-27** | [FlashAttention (IO-Aware Exact Attention)](https://arxiv.org/abs/2205.14135) | [arXiv:2205.14135v1](https://arxiv.org/abs/2205.14135) | NeurIPS 2022 | **VERIFIED** |
| **2023-05-22** | [Grouped-Query Attention (GQA)](https://arxiv.org/abs/2305.13245) | [arXiv:2305.13245v1](https://arxiv.org/abs/2305.13245) | EMNLP 2023 / LLaMA-2 70B | **VERIFIED** |
| **2023-05-31** | [NoPE (No Positional Encoding)](https://arxiv.org/abs/2305.19466) | [arXiv:2305.19466v1](https://arxiv.org/abs/2305.19466) | NeurIPS 2023 | **VERIFIED** |
| **2023-06-27** | [Position Interpolation (PI)](https://arxiv.org/abs/2306.15595) | [arXiv:2306.15595v1](https://arxiv.org/abs/2306.15595) | Meta Context Extension | **VERIFIED** |
| **2023-06-29** | [NTK-Aware Scaled RoPE](https://www.reddit.com/r/LocalLLaMA/comments/14lz7j5/ntkaware_scaled_rope_allows_llama_models_to_have/) | [Reddit r/LocalLLaMA Post id: 14lz7j5](https://www.reddit.com/r/LocalLLaMA/comments/14lz7j5/ntkaware_scaled_rope_allows_llama_models_to_have/) | Community Innovation | **VERIFIED** |
| **2023-08-31** | [YaRN (Yet another RoPE extensioN)](https://arxiv.org/abs/2309.00071) | [arXiv:2309.00071v1](https://arxiv.org/abs/2309.00071) | ICLR 2024 Poster | **VERIFIED** |
| **2023-09-29** | [Attention Sinks (StreamingLLM)](https://arxiv.org/abs/2309.17453) | [arXiv:2309.17453v1](https://arxiv.org/abs/2309.17453) | ICLR 2024 | **VERIFIED** |
| **2024-05-07** | [Multi-head Latent Attention (MLA)](https://arxiv.org/abs/2405.04434) | [arXiv:2405.04434v1](https://arxiv.org/abs/2405.04434) (DeepSeek-V2) | DeepSeek-V2 & V3 | **VERIFIED** |
| **2024-06-10** | [Parallel DeltaNet](https://arxiv.org/abs/2406.06484) | [arXiv:2406.06484v1](https://arxiv.org/abs/2406.06484) | MIT / IBM Research | **VERIFIED** |
| **2024-12-09** | [Gated DeltaNet](https://arxiv.org/abs/2412.06464) | [arXiv:2412.06464v1](https://arxiv.org/abs/2412.06464) | ICLR 2025 Oral | **VERIFIED** |
| **2025-02-16** | [Native Sparse Attention (NSA)](https://arxiv.org/abs/2502.11089) | [arXiv:2502.11089v1](https://arxiv.org/abs/2502.11089) | DeepSeek Pretraining | **VERIFIED** |
| **2025-09-11** | [Qwen3-Next Hybrid Attention (3:1)](https://huggingface.co/Qwen) | [Official HuggingFace Release](https://huggingface.co/Qwen) | vLLM Day-0 Integration | **VERIFIED** |
| **2025-09-29** | [DeepSeek Sparse Attention (DSA)](https://www.deepseek.com) | [DeepSeek-V3.2-Exp Release news250929](https://www.deepseek.com) | Production Web & API | **VERIFIED** |
| **2025-10-30** | [Kimi Linear / Kimi Delta Attention (KDA)](https://arxiv.org/abs/2510.26692) | [arXiv:2510.26692v1](https://arxiv.org/abs/2510.26692) | Moonshot AI | **VERIFIED** |
| **2025-12-13** | [DroPE (Drop Position Embeddings)](https://arxiv.org/abs/2512.12167) | [arXiv:2512.12167v1](https://arxiv.org/abs/2512.12167) | ICLR 2026 / Sakana AI | **VERIFIED** |
| **2026-04-24** | [Compressed Sparse Attention (CSA) & HCA](https://www.deepseek.com) | [DeepSeek-V4 Release & Tech Report](https://www.deepseek.com) | DeepSeek-V4 Preview | **VERIFIED** |
| **2026-09-15** | [Compressed Sparse Attention 2 (CSA2 & FP4)](https://huggingface.co/deepseek-ai) | [DeepSeek-V4.1-Flash Model Card & Report](https://huggingface.co/deepseek-ai) | 890 B/token Global KV | **VERIFIED** |

---

## 🔍 Corrections to the Instructor's Brief

As detailed in [`docs/corrections-to-brief.md`](./docs/corrections-to-brief.md), our audit caught several critical traps and chronological inversions:
1. **Class Order Inversion (Trap T-ORDER):** The brief listed mechanisms in lecture order (e.g. putting RoPE and ALiBi before MQA and Linear Attention). Chronologically, MQA (Nov 2019), Sparse Transformers (Apr 2019), and Linear Attention (June 2020) appeared up to **1.5 years before RoPE (Apr 2021) and ALiBi (Aug 2021)**.
2. **NTK-Aware Scaling Has No Paper (Trap T-NTK):** NTK-Aware scaling originated as a community Reddit post by `bloc97` on June 29, 2023, directly sparked by Meta's Position Interpolation paper (June 27, 2023). It was only later formalized in the YaRN paper (Aug 2023).
3. **Learned Absolute Position Origin (Trap T-LEARNED):** Learned absolute positional embeddings in sequence models were introduced in ConvS2S (May 8, 2017) before Vaswani et al. evaluated them in Transformer Table 3.
4. **Top-K Memory Trap (Trap T-TOPK-MEM):** Top-k attention (both Zhao et al. 2019 and DeepSeek DSA 2025) cuts **compute FLOPs**, not KV memory. DeepSeek-V4 CSA (April 2026) is what cut memory by *compressing* $m$ tokens into 1 prior to top-k selection.
5. **Exact Paper Titles:**
   * ALiBi's published title is *"Attention with Linear Biases Enables Input Length Extrapolation"* (not *Generalization*).
   * Gated DeltaNet's title is *"Gated Delta Networks: Improving Mamba2 with Delta Rule"*.
   * NSA's title is *"Native Sparse Attention: Hardware-Aligned and Natively Trainable Sparse Attention"* (not *Differentiable*).
6. **Qwen3-Next Release Date (Trap T-QWEN):** Official HuggingFace and vLLM release date is **September 11, 2025** (not August).
7. **DroPE Methodology (Trap T-DROPE):** DroPE is not NoPE; it pretrains with RoPE, then drops positional embeddings during brief recalibration.

---

## 🚀 How to Run, Test, and Deploy

### Prerequisites
* Node.js v20+
* Python 3.9+ with `uv` or virtualenv

### 1. Build and Run the Web App
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run TypeScript + Vitest data and numerical tests
npm test

# Build production bundle
npm run build
```

### 2. Run the Python Reference Suite & Verification CLI
```bash
# Setup Python virtualenv (uv or standard venv)
uv venv .venv
source .venv/bin/activate
uv pip install numpy pytest

# Run pytest numerical test suite
PYTHONPATH=. pytest tests/test_attention_python.py -v

# Audit chronology ledger with Python CLI
python3 python/verify_ledger.py

# Calculate KV cache memory and decode bandwidth for any model
python3 python/kv_cache_calculator.py --arch mla --seq-len 131072 --dtype fp16
```

### 3. Deploy to Netlify
```bash
npx netlify-cli deploy --dir=dist --prod --allow-anonymous
```

---

## ⚖️ License & Credits

* Code and documentation released under the [MIT License](./LICENSE).
* All paper citations, equations, and mathematical derivations credit their respective authors and research laboratories.
* **Timeline current through:** October 14, 2026.
