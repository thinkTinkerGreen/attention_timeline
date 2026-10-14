// Workload Lens Component (Section 3.5)
// Ties the timeline and ledger to three real-world production workloads

export function renderWorkloadLens(): string {
  return `
  <section id="workload-lens" class="workload-section">
    <div class="workload-header">
      <span class="workload-badge">PRACTICAL ENGINEERING GUIDE</span>
      <h2>The Workload Lens: When Would I Actually Choose It?</h2>
      <p class="workload-subtitle">
        There is no single "best" attention mechanism. The optimal architecture depends entirely on your context length,
        memory-bandwidth constraints, and whether your task requires exact multi-hop retrieval or broad semantic synthesis.
      </p>
    </div>

    <div class="workload-grid">
      <!-- Workload A: 2K-token Chatbot -->
      <article class="workload-card">
        <div class="workload-card-header">
          <span class="workload-icon">💬</span>
          <div>
            <h3>Workload A: 2K-Token Consumer Chatbot</h3>
            <span class="workload-meta">Short context &bull; High concurrency &bull; Latency-critical</span>
          </div>
        </div>

        <div class="workload-body">
          <div class="workload-stat-row">
            <div class="stat-pill">
              <span class="stat-label">Prompt Length:</span>
              <span class="stat-val font-mono">~1,500 tokens</span>
            </div>
            <div class="stat-pill">
              <span class="stat-label">Target Batch Size:</span>
              <span class="stat-val font-mono">64 - 128 streams</span>
            </div>
            <div class="stat-pill">
              <span class="stat-label">Critical Constraint:</span>
              <span class="stat-val">Serving throughput / GPU cost</span>
            </div>
          </div>

          <div class="recommendation-box recommended">
            <h4>Recommended Architecture: GQA (Grouped-Query Attention)</h4>
            <p>
              With short contexts, quadratic FLOPs are negligible (\(2000^2 \times 4096 \approx 16\) GFLOPs).
              The bottleneck is streaming KV caches from HBM during decoding. GQA with 8 KV heads shrinks the KV cache to ~131 KB/token,
              allowing 64 concurrent users to comfortably fit inside a single GPU with zero quality loss.
            </p>
          </div>

          <div class="recommendation-box avoid">
            <h4>Avoid: Complex Sparse / CSA Architectures</h4>
            <p>
              At 2K tokens, the overhead of lightning indexers, block pooling, or dynamic top-k routing costs more latency
              than executing a blazing-fast dense FlashAttention GEMM. Keep it simple with standard GQA.
            </p>
          </div>
        </div>
      </article>

      <!-- Workload B: 128K-token Document QA -->
      <article class="workload-card">
        <div class="workload-card-header">
          <span class="workload-icon">📑</span>
          <div>
            <h3>Workload B: 128K-Token Document QA / Legal Analysis</h3>
            <span class="workload-meta">Long prompt &bull; Needle-in-a-Haystack &bull; Strict Precision</span>
          </div>
        </div>

        <div class="workload-body">
          <div class="workload-stat-row">
            <div class="stat-pill">
              <span class="stat-label">Prompt Length:</span>
              <span class="stat-val font-mono">100K - 128K tokens</span>
            </div>
            <div class="stat-pill">
              <span class="stat-label">Target Batch Size:</span>
              <span class="stat-val font-mono">4 - 8 streams</span>
            </div>
            <div class="stat-pill">
              <span class="stat-label">Critical Constraint:</span>
              <span class="stat-val">100% exact retrieval fidelity</span>
            </div>
          </div>

          <div class="recommendation-box recommended">
            <h4>Recommended Architecture: MLA (Multi-head Latent Attention) + YaRN</h4>
            <p>
              Legal analysis demands exact needle retrieval: missing a single clause in a 100-page contract is unacceptable.
              Pure recurrent models (Mamba/DeltaNet) suffer lossy collisions. MLA provides <strong>exact global attention</strong>,
              while its low-rank latent compression (\(c_t^{KV}\)) reduces the 128K KV cache by 93% (from 68 GB down to 4.7 GB),
              enabling multi-stream serving with full precision retrieval.
            </p>
          </div>

          <div class="recommendation-box avoid">
            <h4>Avoid: Pure Sliding Window or Pure Recurrent SSMs</h4>
            <p>
              Sliding windows evict earlier pages completely. Pure recurrent states suffer catastrophic forgetting over 100K tokens,
              failing arbitrary cross-document cross-referencing.
            </p>
          </div>
        </div>
      </article>

      <!-- Workload C: 1M-token Autonomous Coding Agent -->
      <article class="workload-card">
        <div class="workload-card-header">
          <span class="workload-icon">🤖</span>
          <div>
            <h3>Workload C: 1M-Token Autonomous Coding Agent</h3>
            <span class="workload-meta">Extreme context &bull; Multi-turn tool execution &bull; Iterative loops</span>
          </div>
        </div>

        <div class="workload-body">
          <div class="workload-stat-row">
            <div class="stat-pill">
              <span class="stat-label">Prompt Length:</span>
              <span class="stat-val font-mono">500K - 1,000,000 tokens</span>
            </div>
            <div class="stat-pill">
              <span class="stat-label">Tool Iterations:</span>
              <span class="stat-val font-mono">50 - 200 turns</span>
            </div>
            <div class="stat-pill">
              <span class="stat-label">Critical Constraint:</span>
              <span class="stat-val">HBM capacity & Prefill latency</span>
            </div>
          </div>

          <div class="recommendation-box recommended">
            <h4>Recommended Architecture: CSA2 / Hybrid Gated DeltaNet + MLA</h4>
            <p>
              At 1 million tokens, dense attention requires 1 trillion FLOPs per query and 500+ GB of GPU memory per stream!
              You must use hierarchical compression:
              <strong>DeepSeek-V4.1 CSA2</strong> reuses KV caches and top-k indices across layers and quantizes to FP4,
              compressing the 1M KV cache down to an unprecedented <strong>890 MB</strong>.
              Alternatively, <strong>Qwen3-Next 3:1 hybrids</strong> handle 75% of layers in \(O(1)\) recurrent state.
            </p>
          </div>

          <div class="recommendation-box avoid">
            <h4>Avoid: Standard Dense MHA / Vanilla GQA</h4>
            <p>
              Dense MHA at 1M tokens requires over 500 GB of HBM per single conversation, exhausting 6+ H100 GPUs just for the cache.
              Without horizontal compression or hybrid recurrence, 1M context is economically impossible to serve.
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
  `;
}
