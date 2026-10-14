// Takeaway Summary Component (Section 8)
// Executive synthesis of the field's shifting priorities across a decade of attention evolution (2014 - 2026)

export function renderTakeawaySummary(): string {
  return `
  <section id="takeaways" class="takeaway-section">
    <div class="takeaway-header">
      <span class="takeaway-badge">SYNTHESIS & RETROSPECTIVE</span>
      <h2>What to Take Away: The Arc of Attention (2014 &ndash; 2026)</h2>
      <p class="takeaway-subtitle">
        How the field's priorities shifted from escaping recurrent bottlenecks to inventing modern compressed hybrids.
      </p>
    </div>

    <div class="timeline-arc-grid">
      <!-- Era 1 -->
      <div class="arc-card">
        <div class="arc-era font-mono">2014 &ndash; 2017</div>
        <h3>The Parallel Breakthrough</h3>
        <p class="arc-desc">
          Additive attention solved RNN fixed-vector bottlenecks, but recurrence was strictly sequential.
          <strong>Scaled dot-product attention (2017)</strong> replaced sequential steps with massively parallel matrix multiplications.
          The field traded compute memory for training scalability.
        </p>
        <div class="arc-tags"><span class="chip">O(N^2) FLOPs</span><span class="chip">Exact Global Field</span></div>
      </div>

      <!-- Era 2 -->
      <div class="arc-card">
        <div class="arc-era font-mono">2019 &ndash; 2021</div>
        <h3>Decode Memory & Positional Foundations</h3>
        <p class="arc-desc">
          As models moved to production inference, memory bandwidth choked autoregressive decoding.
          <strong>MQA (2019)</strong> proved keys and values could be shared.
          Simultaneously, <strong>RoPE (2021)</strong> and <strong>ALiBi (2021)</strong> replaced rigid absolute positions with relative rotational dynamics.
        </p>
        <div class="arc-tags"><span class="chip">Decode Bandwidth</span><span class="chip">RoPE Rotations</span></div>
      </div>

      <!-- Era 3 -->
      <div class="arc-card">
        <div class="arc-era font-mono">2022 &ndash; 2023</div>
        <h3>Hardware IO-Awareness & Context Scaling</h3>
        <p class="arc-desc">
          <strong>FlashAttention (2022)</strong> kept standard attention dominant by tiling SRAM memory.
          <strong>GQA (2023)</strong> became the universal open-weights default.
          When models hit length limits, <strong>Position Interpolation, NTK-Aware Scaling, and YaRN</strong> stretched RoPE frequencies without retraining.
          <strong>StreamingLLM</strong> revealed attention sinks.
        </p>
        <div class="arc-tags"><span class="chip">IO-Tiling</span><span class="chip">GQA 8:1</span><span class="chip">Frequency Stretching</span></div>
      </div>

      <!-- Era 4 -->
      <div class="arc-card">
        <div class="arc-era font-mono">2024</div>
        <h3>Latent Compression & Recurrence Returns</h3>
        <p class="arc-desc">
          GQA's 8x compression was no longer enough. <strong>MLA (DeepSeek-V2)</strong> compressed KV caches into low-rank latents (93% reduction).
          Simultaneously, recurrent linear models returned: <strong>Parallel DeltaNet</strong> solved training parallelization, and <strong>Gated DeltaNet</strong> fused associative error correction with forget gates.
        </p>
        <div class="arc-tags"><span class="chip">MLA Latents</span><span class="chip">Delta Rule</span><span class="chip">O(1) State Memory</span></div>
      </div>

      <!-- Era 5 -->
      <div class="arc-card">
        <div class="arc-era font-mono">2025</div>
        <h3>Trainable Sparsity & Production Hybrids</h3>
        <p class="arc-desc">
          Sparsity returned in hardware-aligned forms: <strong>NSA</strong> and <strong>DSA (V3.2)</strong> used lightning indexers for linear compute.
          <strong>Qwen3-Next</strong> and <strong>Kimi Linear</strong> deployed 3:1 hybrids (75% linear Gated DeltaNet, 25% full attention), slashing memory while preserving reasoning.
          <strong>DroPE</strong> demonstrated position-free length extrapolation.
        </p>
        <div class="arc-tags"><span class="chip">3:1 Hybrids</span><span class="chip">Lightning Indexer</span><span class="chip">DroPE</span></div>
      </div>

      <!-- Era 6 -->
      <div class="arc-card frontier-card">
        <div class="arc-era font-mono">2026 &bull; STATE OF THE ART</div>
        <h3>Horizontal Compression & Cross-Layer Sharing</h3>
        <p class="arc-desc">
          At native 1-million-token contexts, <strong>DeepSeek-V4 CSA & HCA</strong> compressed the sequence dimension horizontally ($m \to 1$).
          <strong>DeepSeek-V4.1-Flash CSA2</strong> attacked the layer dimension with Full/Reindex/Reuse modes and native FP4 KV caches,
          establishing the global record of <strong>890 bytes per token</strong>.
        </p>
        <div class="arc-tags"><span class="chip chip-gold">890 B/token</span><span class="chip chip-gold">FP4 E2M1</span><span class="chip chip-gold">1M Native Context</span></div>
      </div>
    </div>

    <!-- Final Takeaway Quote -->
    <div class="takeaway-footer-quote">
      <blockquote>
        "Every modern attention mechanism is a specific answer to a specific bill:
        FlashAttention paid in kernel engineering; GQA and MLA paid in projection capacity;
        DeltaNet paid in finite state memory; CSA paid in lossy pooling.
        Understanding attention means knowing which bill your workload can afford to pay."
      </blockquote>
    </div>
  </section>
  `;
}
