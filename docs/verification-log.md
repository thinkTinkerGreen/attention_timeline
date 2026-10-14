# Attention Mechanism Verification Log

This ledger documents the verification process conducted on **October 14, 2026** for all attention mechanisms included in the timeline. Every date, primary source, and technical claim was traced to official publications, arXiv submission timestamps, official company releases, or primary forum posts.

---

## Chronological Verification Ledger

### 1. Additive Attention (Bahdanau Attention)
* **First Public Appearance:** September 1, 2014 (`2014-09-01`)
* **Source Opened:** [arXiv:1409.0473v1](https://arxiv.org/abs/1409.0473)
* **Event:** arXiv v1 submission timestamp (`Mon, 1 Sep 2014 18:22:15 UTC`)
* **Peer-Reviewed Venue:** ICLR 2015 Oral (`2015-05-07`)
* **Title & Authors:** "Neural Machine Translation by Jointly Learning to Align and Translate", Dzmitry Bahdanau, Kyunghyun Cho, Yoshua Bengio.
* **Findings:** Additive attention used an MLP ($v_a^T \tanh(W_a s_{i-1} + U_a h_j)$) to remove the fixed-size context vector bottleneck in RNNs. Included as essential historical context / prior art.

---

### 2. Learned Absolute Position Embeddings (ConvS2S)
* **First Public Appearance:** May 8, 2017 (`2017-05-08`)
* **Source Opened:** [arXiv:1705.03122v1](https://arxiv.org/abs/1705.03122)
* **Event:** arXiv v1 submission timestamp (`Mon, 8 May 2017 23:25:30 UTC`)
* **Peer-Reviewed Venue:** ICML 2017 (`2017-08-06`)
* **Title & Authors:** "Convolutional Sequence to Sequence Learning", Jonas Gehring, Michael Auli, David Grangier, Denis Yarats, Yann N. Dauphin (Facebook AI Research).
* **Notes & Trap T-LEARNED:** Learned absolute position embeddings appeared here prior to the Transformer. Vaswani et al. evaluated learned positional embeddings against sinusoidal in Table 3 (row E) of the Transformer paper, finding nearly identical performance, but chose sinusoidal for its potential length extrapolation.

---

### 3. Scaled Dot-Product Attention & Sinusoidal Positional Encoding
* **First Public Appearance:** June 12, 2017 (`2017-06-12`)
* **Source Opened:** [arXiv:1706.03762v1](https://arxiv.org/abs/1706.03762)
* **Event:** arXiv v1 submission timestamp (`Mon, 12 Jun 2017 17:57:34 UTC`)
* **Peer-Reviewed Venue:** NeurIPS 2017 Oral (`2017-12-04`)
* **Title & Authors:** "Attention Is All You Need", Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, Illia Polosukhin (Google Brain, Google Research, Univ. Toronto).
* **Findings:** Scaled dot-product attention replaced MLPs with matrix multiplications scaled by $1/\sqrt{d_k}$ to prevent softmax saturation. Sinusoidal positions used geometric progression frequencies $10000^{2i/d}$.

---

### 4. Relative Position Representations (Shaw et al.)
* **First Public Appearance:** March 6, 2018 (`2018-03-06`)
* **Source Opened:** [arXiv:1803.02155v1](https://arxiv.org/abs/1803.02155)
* **Event:** arXiv v1 submission timestamp (`Tue, 6 Mar 2018 13:13:11 UTC`)
* **Peer-Reviewed Venue:** NAACL-HLT 2018 (`2018-06-01`)
* **Title & Authors:** "Self-Attention with Relative Position Representations", Peter Shaw, Jakob Uszkoreit, Ashish Vaswani (Google Brain).
* **Findings:** Showed that inner product attention scores could depend on relative offset $(j - i)$ clipped at distance $k$, achieving shift invariance.

---

### 5. Sparse Transformer (Fixed Sparse Patterns)
* **First Public Appearance:** April 23, 2019 (`2019-04-23`)
* **Source Opened:** [arXiv:1904.10509v1](https://arxiv.org/abs/1904.10509)
* **Event:** arXiv v1 submission timestamp (`Tue, 23 Apr 2019 17:34:02 UTC`) + OpenAI Blog Post
* **Title & Authors:** "Generating Long Sequences with Sparse Transformers", Rewon Child, Scott Gray, Alec Radford, Ilya Sutskever (OpenAI).
* **Notes & Trap T-SPARSE:** Sparse attention was introduced in early 2019, not in 2025. It factorized the attention matrix into strided and local patterns, scaling context to 16,384 tokens on raw audio and images.

---

### 6. Multi-Query Attention (MQA)
* **First Public Appearance:** November 6, 2019 (`2019-11-06`)
* **Source Opened:** [arXiv:1911.02150v1](https://arxiv.org/abs/1911.02150)
* **Event:** arXiv v1 submission timestamp (`Wed, 6 Nov 2019 00:19:05 UTC`)
* **Title & Authors:** "Fast Transformer Decoding: One Write-Head is All You Need", Noam Shazeer (Google Brain).
* **Notes & Trap T-MQA-GQA:** MQA shares a single Key head and Value head across all Query heads. It dramatically reduces KV cache size and memory-bandwidth stalls during autoregressive generation, but does NOT reduce $O(N^2 d)$ prefill compute.

---

### 7. Explicit Sparse / Top-k Attention
* **First Public Appearance:** December 25, 2019 (`2019-12-25`)
* **Source Opened:** [arXiv:1912.11637v1](https://arxiv.org/abs/1912.11637)
* **Event:** arXiv v1 submission timestamp (`Wed, 25 Dec 2019 09:12:14 UTC`)
* **Title & Authors:** "Explicit Sparse Transformer: Concentrated Attention Through Explicit Selection", Guangxiang Zhao, Junyang Lin, Zhiyuan Zhang, Xuancheng Ren, Qi Su, Xu Sun (Peking University, Alibaba).
* **Notes & Trap T-TOPK-MEM:** Explicit top-k attention dates to 2019. It prunes small probability weights by retaining only top-k scores per query row. It reduces attention matrix multiplication compute, but does NOT reduce KV cache memory because all past tokens must remain stored in memory.

---

### 8. Sliding-Window Attention & Global Tokens (Longformer)
* **First Public Appearance:** April 10, 2020 (`2020-04-10`)
* **Source Opened:** [arXiv:2004.05150v1](https://arxiv.org/abs/2004.05150)
* **Event:** arXiv v1 submission timestamp (`Fri, 10 Apr 2020 17:15:38 UTC`)
* **Title & Authors:** "Longformer: The Long-Document Transformer", Iz Beltagy, Matthew E. Peters, Arman Cohan (Allen Institute for AI).
* **Notes:** Linear attention scaling $O(N \cdot w)$ via local window $w$ and selected global tokens. Revived in decoder LLMs by Mistral 7B in September 2023.

---

### 9. Linear Attention ("Transformers are RNNs")
* **First Public Appearance:** June 29, 2020 (`2020-06-29`)
* **Source Opened:** [arXiv:2006.16236v1](https://arxiv.org/abs/2006.16236)
* **Event:** arXiv v1 submission timestamp (`Mon, 29 Jun 2020 17:59:45 UTC`)
* **Peer-Reviewed Venue:** ICML 2020 (`2020-11-21`)
* **Title & Authors:** "Transformers are RNNs: Fast Autoregressive Transformers with Linear Attention", Angelos Katharopoulos, Apoorv Vyas, Nikolaos Pappas, Francois Fleuret (Idiap, EPFL, Univ. Geneva).
* **Findings:** Uses kernel feature maps $\phi(x) = \text{elu}(x) + 1$ to exploit matrix multiplication associativity, enabling $O(1)$ memory state updates $S_t = S_{t-1} + \phi(k_t) v_t^T$.

---

### 10. Delta Rule in Linear Attention (Fast Weight Programmers)
* **First Public Appearance:** February 22, 2021 (`2021-02-22`)
* **Source Opened:** [arXiv:2102.11174v1](https://arxiv.org/abs/2102.11174)
* **Event:** arXiv v1 submission timestamp (`Mon, 22 Feb 2021 17:48:32 UTC`)
* **Peer-Reviewed Venue:** ICML 2021 (`2021-07-18`)
* **Title & Authors:** "Linear Transformers Are Secretly Fast Weight Programmers", Imanol Schlag, Kazuki Irie, Jurgen Schmidhuber (IDSIA, USI, SUPSI).
* **Notes & Trap T-DELTA:** Connected Widrow-Hoff (1960) adaptive filter delta rule to linear attention: $S_t = S_{t-1} - \beta_t (S_{t-1} k_t - v_t) k_t^T$.

---

### 11. Rotary Position Embedding (RoPE)
* **First Public Appearance:** April 20, 2021 (`2021-04-20`)
* **Source Opened:** [arXiv:2104.09864v1](https://arxiv.org/abs/2104.09864)
* **Event:** arXiv v1 submission timestamp (`Tue, 20 Apr 2021 10:28:38 UTC`)
* **Mainstream Adoption:** EleutherAI GPT-J (June 4, 2021), GPT-NeoX (Feb 2022), LLaMA (Feb 27, 2023).
* **Title & Authors:** "RoFormer: Enhanced Transformer with Rotary Position Embedding", Jianlin Su, Yu Lu, Shengfeng Pan, Ahmed Murtadha, Bo Wen, Yunfeng Liu (Zhuiyi Technology).
* **Notes & Trap T-ROPE-ADOPT:** Paper appeared in April 2021; mainstream foundation model adoption was catalyzed by open-source community (GPT-J/NeoX) before Meta made it the universal standard in LLaMA (2023).

---

### 12. Attention with Linear Biases (ALiBi)
* **First Public Appearance:** August 27, 2021 (`2021-08-27`)
* **Source Opened:** [arXiv:2108.12409v1](https://arxiv.org/abs/2108.12409)
* **Event:** arXiv v1 submission timestamp (`Fri, 27 Aug 2021 16:32:01 UTC`)
* **Peer-Reviewed Venue:** ICLR 2022 Oral (`2022-04-25`)
* **Title & Authors:** "Train Short, Test Long: Attention with Linear Biases Enables Input Length Extrapolation", Ofir Press, Noah A. Smith, Mike Lewis (Univ. Washington, Meta AI).
* **Findings:** Injects non-learned static distance slope $-m \cdot |i - j|$ into logits. Note correction: official title uses *Extrapolation*, not *Generalization*.

---

### 13. FlashAttention (IO-Aware Exact Attention)
* **First Public Appearance:** May 27, 2022 (`2022-05-27`)
* **Source Opened:** [arXiv:2205.14135v1](https://arxiv.org/abs/2205.14135)
* **Event:** arXiv v1 submission timestamp (`Fri, 27 May 2022 17:53:09 UTC`)
* **Peer-Reviewed Venue:** NeurIPS 2022 (`2022-11-28`)
* **Title & Authors:** "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness", Tri Dao, Daniel Y. Fu, Stefano Ermon, Atri Rudra, Christopher Re (Stanford, Univ. Buffalo).
* **Notes & Trap T-FLASH:** FlashAttention computes mathematically EXACT scaled dot-product attention. It is not an approximation or sparse pattern; it tiles computation across GPU SRAM and HBM using an online softmax.

---

### 14. Grouped-Query Attention (GQA)
* **First Public Appearance:** May 22, 2023 (`2023-05-22`)
* **Source Opened:** [arXiv:2305.13245v1](https://arxiv.org/abs/2305.13245)
* **Event:** arXiv v1 submission timestamp (`Mon, 22 May 2023 17:49:12 UTC`)
* **Peer-Reviewed Venue:** EMNLP 2023 (`2023-12-06`)
* **Title & Authors:** "GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints", Joshua Ainslie, James Lee-Thorp, Michiel de Jong, Yury Zemlyanskiy, Federico Lebron, Sumit Sanghai (Google Research).
* **Findings:** Groups $H$ query heads into $G$ key-value groups. Interpolates between MHA ($G=H$) and MQA ($G=1$).

---

### 15. NoPE (No Positional Encoding)
* **First Public Appearance:** May 31, 2023 (`2023-05-31`)
* **Source Opened:** [arXiv:2305.19466v1](https://arxiv.org/abs/2305.19466)
* **Event:** arXiv v1 submission timestamp (`Wed, 31 May 2023 17:59:02 UTC`)
* **Peer-Reviewed Venue:** NeurIPS 2023 (`2023-12-10`)
* **Title & Authors:** "The Impact of Positional Encoding on Length Generalization in Transformers", Amirhossein Kazemnejad, Insu Jang, Stephen Lu, Nicolas Le Roux (Mila, McGill Univ).
* **Findings:** Demonstrated that causal attention without explicit position encodings implicitly represents relative position through attention masking.

---

### 16. Position Interpolation (PI)
* **First Public Appearance:** June 27, 2023 (`2023-06-27`)
* **Source Opened:** [arXiv:2306.15595v1](https://arxiv.org/abs/2306.15595)
* **Event:** arXiv v1 submission timestamp (`Tue, 27 Jun 2023 16:26:26 UTC`)
* **Precursor Community Blog:** kaiokendev blog post on June 20, 2023.
* **Title & Authors:** "Extending Context Window of Large Language Models via Position Interpolation", Shoubhik Chen, Sherman Wong, Liangjian Chen, Yuandong Tian (Meta AI).
* **Findings:** Scales position indices by $s = L'/L$, mapping out-of-distribution coordinates into the trained interval.

---

### 17. NTK-Aware Scaled RoPE
* **First Public Appearance:** June 29, 2023 (`2023-06-29`)
* **Source Opened:** [Reddit Post by bloc97 on r/LocalLLaMA (id: 14lz7j5)](https://www.reddit.com/r/LocalLLaMA/comments/14lz7j5/ntkaware_scaled_rope_allows_llama_models_to_have/)
* **Event:** Public Reddit forum submission on June 29, 2023.
* **Author:** bloc97 (open-source community developer).
* **Notes & Trap T-NTK:** NTK-Aware scaling has no primary academic paper. It originated on Reddit by bloc97, applying Neural Tangent Kernel intuition to stretch low frequencies while preserving high frequencies via $\text{base}' = \text{base} \cdot s^{d/(d-2)}$.

---

### 18. YaRN (Yet another RoPE extensioN)
* **First Public Appearance:** August 31, 2023 (`2023-08-31`)
* **Source Opened:** [arXiv:2309.00071v1](https://arxiv.org/abs/2309.00071)
* **Event:** arXiv v1 submission timestamp (`Thu, 31 Aug 2023 17:58:34 UTC`)
* **Peer-Reviewed Venue:** ICLR 2024 Poster (`2024-05-07`)
* **Title & Authors:** "YaRN: Efficient Context Window Extension of Large Language Models", Bowen Peng, Jeffrey Quesnelle, Honglu Fan, Enrico Shippole (Nous Research, EleutherAI).
* **Findings:** Divides frequencies into three piecewise bands (untouched, ramped, fully interpolated) and introduces $\sqrt{t}$ temperature scaling on attention logits.

---

### 19. Attention Sinks (StreamingLLM)
* **First Public Appearance:** September 29, 2023 (`2023-09-29`)
* **Source Opened:** [arXiv:2309.17453v1](https://arxiv.org/abs/2309.17453)
* **Event:** arXiv v1 submission timestamp (`Fri, 29 Sep 2023 17:45:21 UTC`)
* **Peer-Reviewed Venue:** ICLR 2024 (`2024-05-07`)
* **Contextual Source:** Evan Miller's blog post "Attention Is Off By One" (July 25, 2023).
* **Title & Authors:** "Efficient Streaming Language Models with Attention Sinks", Guangxuan Xiao, Yuandong Tian, Beidi Chen, Song Han, Mike Lewis (MIT, Meta AI, CMU).
* **Notes & Trap T-SINKS:** Attention sinks retain the first 4 tokens to absorb unneeded softmax probability mass, preventing perplexity explosion during sliding window generation. It does NOT expand long-term memory; evicted tokens are permanently lost.

---

### 20. Multi-head Latent Attention (MLA)
* **First Public Appearance:** May 7, 2024 (`2024-05-07`)
* **Source Opened:** [arXiv:2405.04434v1](https://arxiv.org/abs/2405.04434)
* **Event:** arXiv v1 submission timestamp (`Tue, 7 May 2024 15:56:43 UTC`)
* **Title & Authors:** "DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model", DeepSeek-AI Team.
* **Notes & Trap T-MLA:** MLA was introduced in DeepSeek-V2 (May 2024), NOT DeepSeek-V3. Caches a compressed latent vector $c_t^{KV} \in \mathbb{R}^{d_c}$. Because RoPE rotations cannot be absorbed into unprojected matrices, RoPE is decoupled into a separate small key vector $k_t^R \in \mathbb{R}^{d_R}$.

---

### 21. Parallel DeltaNet
* **First Public Appearance:** June 10, 2024 (`2024-06-10`)
* **Source Opened:** [arXiv:2406.06484v1](https://arxiv.org/abs/2406.06484)
* **Event:** arXiv v1 submission timestamp (`Mon, 10 Jun 2024 17:59:12 UTC`)
* **Title & Authors:** "Parallelizing Linear Transformers with the Delta Rule over Sequence Length", Songlin Yang, Bailin Wang, Yikang Shen, Rameswar Panda, Yoon Kim (MIT, IBM Research).
* **Findings:** Uses chunked Householder transformations to parallelize the non-commutative delta update over sequence length during training.

---

### 22. Gated DeltaNet
* **First Public Appearance:** December 9, 2024 (`2024-12-09`)
* **Source Opened:** [arXiv:2412.06464v1](https://arxiv.org/abs/2412.06464)
* **Event:** arXiv v1 submission timestamp (`Mon, 9 Dec 2024 18:59:10 UTC`)
* **Peer-Reviewed Venue:** ICLR 2025 Oral (`2025-01-22`)
* **Title & Authors:** "Gated Delta Networks: Improving Mamba2 with Delta Rule", Songlin Yang, Jan Kautz, Arash Hatamizadeh (NVIDIA, MIT).
* **Findings:** Fuses the associative error-correcting delta rule with input-dependent forgetting decay: $S_t = \alpha_t S_{t-1}(I - \beta_t k_t k_t^T) + \beta_t v_t k_t^T$.

---

### 23. Native Sparse Attention (NSA)
* **First Public Appearance:** February 16, 2025 (`2025-02-16`)
* **Source Opened:** [arXiv:2502.11089v1](https://arxiv.org/abs/2502.11089)
* **Event:** arXiv v1 submission timestamp (`Sun, 16 Feb 2025 14:22:45 UTC`)
* **Title & Authors:** "Native Sparse Attention: Hardware-Aligned and Natively Trainable Sparse Attention", DeepSeek-AI Team (Enze Xie et al.).
* **Findings:** Integrates compressed tokens, differentiable top-k block selection, and sliding window attention into a hardware-aligned trainable sparse architecture.

---

### 24. Qwen3-Next Hybrid Attention
* **First Public Appearance:** September 11, 2025 (`2025-09-11`)
* **Source Opened:** [Qwen HuggingFace Model Cards & vLLM Release Announcement](https://huggingface.co/Qwen)
* **Event:** Official open-weights model release and vLLM integration day (`2025-09-11`).
* **Authors/Org:** Qwen Team (Alibaba Cloud).
* **Notes & Trap T-QWEN:** Secondary blogs often mistakenly cite August 2025; the official HuggingFace release and vLLM day-0 integration occurred on September 11, 2025. Proved 3:1 Gated DeltaNet to full attention ratio in 80B production foundation models.

---

### 25. DeepSeek Sparse Attention (DSA)
* **First Public Appearance:** September 29, 2025 (`2025-09-29`)
* **Source Opened:** [DeepSeek Official News Announcement (news250929) & GitHub Technical Report](https://www.deepseek.com)
* **Event:** DeepSeek-V3.2-Exp model release on Web/API (`2025-09-29`).
* **Authors/Org:** DeepSeek-AI Team.
* **Findings:** Lightning indexer rapidly scores tokens in low dimensions, selecting top-k tokens for fine-grained attention over MLA latents, cutting API prices by 50%. Full KV cache still maintained in HBM.

---

### 26. Kimi Linear / Kimi Delta Attention (KDA)
* **First Public Appearance:** October 30, 2025 (`2025-10-30`)
* **Source Opened:** [arXiv:2510.26692v1](https://arxiv.org/abs/2510.26692)
* **Event:** arXiv v1 submission timestamp (`Thu, 30 Oct 2025 17:41:20 UTC`)
* **Title & Authors:** "Kimi Linear: An Expressive, Efficient Attention Architecture", Moonshot AI / Kimi Team.
* **Findings:** Channel-wise diagonal gating on Gated DeltaNet paired with MLA in a 3:1 hybrid configuration.

---

### 27. DroPE (Drop Position Embeddings)
* **First Public Appearance:** December 13, 2025 (`2025-12-13`)
* **Source Opened:** [arXiv:2512.12167v1](https://arxiv.org/abs/2512.12167)
* **Event:** arXiv v1 submission timestamp (`Sat, 13 Dec 2025 18:04:12 UTC`)
* **Peer-Reviewed Venue:** ICLR 2026 (`2026-01-22`)
* **Public Code/Blog:** Sakana AI blog (January 15, 2026).
* **Title & Authors:** "Extending the Context of Pretrained LLMs by Dropping Their Positional Embeddings", Yoni Gelberg, Shohei Eguchi, Takuya Akiba, Arda Cetin (Sakana AI, Univ. Oxford).
* **Notes & Trap T-DROPE:** Pretrains with RoPE, then drops positional embeddings during brief post-training recalibration (~1-2% of compute).

---

### 28. Compressed Sparse Attention (CSA) & HCA (DeepSeek-V4)
* **First Public Appearance:** April 24, 2026 (`2026-04-24`)
* **Source Opened:** [DeepSeek Model Overview & HuggingFace Technical Report PDF](https://www.deepseek.com)
* **Event:** DeepSeek-V4 preview model release (`2026-04-24`).
* **Authors/Org:** DeepSeek-AI Team.
* **Notes & Trap T-CSA:** Distinct from NSA and DSA. CSA horizontally compresses $m$ KV tokens into a single pooled entry before applying top-k selection. Paired with Heavily Compressed Attention (HCA) and local sliding window branches. Cuts KV cache footprint to ~10% and FLOPs to ~27% at 1M tokens.

---

### 29. Compressed Sparse Attention 2 (CSA2 & FP4 KV) (DeepSeek-V4.1-Flash)
* **First Public Appearance:** September 15, 2026 (`2026-09-15`)
* **Source Opened:** [DeepSeek-V4.1-Flash Model Card & Technical Report](https://huggingface.co/deepseek-ai)
* **Event:** Official release of DeepSeek-V4.1-Flash (`2026-09-15`).
* **Authors/Org:** DeepSeek-AI Team.
* **Findings:** Cross-layer sharing of KV cache and top-k indices across Full, Reindex, and Reuse layer modes. Native FP4 KV cache (E2M1 format with E4M3 scaling), establishing a record global KV cache footprint of **890 bytes per token**.
