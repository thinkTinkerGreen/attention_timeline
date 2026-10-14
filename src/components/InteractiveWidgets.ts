// Interactive Widgets Component (Section 7)
// Pedagogical interactive components designed to teach specific mechanisms

export function renderKVCacheCalculatorWidget(): string {
  return `
  <section id="kv-cache-calculator-section" class="widget-section">
    <div class="widget-header">
      <span class="widget-badge">INTERACTIVE CALCULATOR</span>
      <h3>Universal KV Cache Memory & Bandwidth Calculator</h3>
      <p class="text-muted">
        Autoregressive decoding is memory-bandwidth bound. Explore why MHA chokes GPU memory and why GQA, MLA, and CSA2 were developed.
      </p>
    </div>

    <div class="calculator-grid">
      <!-- Sliders / Controls -->
      <div class="calc-controls">
        <div class="control-group">
          <label for="calc-arch">Architecture Paradigm:</label>
          <select id="calc-arch" class="form-select">
            <option value="mha">Multi-Head Attention (MHA - Standard)</option>
            <option value="gqa" selected>Grouped-Query Attention (GQA - LLaMA-3 / Mistral)</option>
            <option value="mqa">Multi-Query Attention (MQA - PaLM)</option>
            <option value="mla">Multi-head Latent Attention (MLA - DeepSeek-V2/V3)</option>
            <option value="csa2">Compressed Sparse Attention 2 (CSA2 - DeepSeek-V4.1)</option>
          </select>
        </div>

        <div class="control-group">
          <div class="slider-label-row">
            <label for="calc-seq-len">Sequence Context Length:</label>
            <span id="calc-seq-len-val" class="font-mono">131,072 tokens (128K)</span>
          </div>
          <input type="range" id="calc-seq-len" min="1024" max="1048576" step="1024" value="131072" class="form-range" />
        </div>

        <div class="control-row">
          <div class="control-group flex-1">
            <label for="calc-layers">Layers (\(L\)):</label>
            <input type="number" id="calc-layers" min="8" max="128" value="32" class="form-input" />
          </div>
          <div class="control-group flex-1">
            <label for="calc-q-heads">Query Heads (\(H_q\)):</label>
            <input type="number" id="calc-q-heads" min="8" max="128" value="32" class="form-input" />
          </div>
        </div>

        <div class="control-row">
          <div class="control-group flex-1">
            <label for="calc-kv-heads">KV Heads (\(H_{kv}\)):</label>
            <input type="number" id="calc-kv-heads" min="1" max="64" value="8" class="form-input" />
          </div>
          <div class="control-group flex-1">
            <label for="calc-d-head">Head Dim (\(d_h\)):</label>
            <input type="number" id="calc-d-head" min="32" max="256" value="128" class="form-input" />
          </div>
        </div>

        <div class="control-group">
          <label for="calc-dtype">Data Precision:</label>
          <select id="calc-dtype" class="form-select">
            <option value="2" selected>FP16 / BF16 (2 bytes / element)</option>
            <option value="1">FP8 (1 byte / element)</option>
            <option value="0.5">FP4 (0.5 bytes / element - Blackwell / V4.1)</option>
          </select>
        </div>
      </div>

      <!-- Live Calculation Display -->
      <div class="calc-results">
        <div class="result-tile primary-tile">
          <div class="tile-title">Total KV Cache Memory (Single Stream)</div>
          <div id="calc-total-mem" class="tile-number">4.00 GB</div>
          <div id="calc-token-bytes" class="tile-sub">32,768 Bytes / token</div>
        </div>

        <div class="result-tile">
          <div class="tile-title">Decode HBM Bandwidth Required</div>
          <div id="calc-bandwidth" class="tile-number">200.0 GB/s</div>
          <div class="tile-sub">Streaming KV cache at 50 tokens/sec generation</div>
        </div>

        <div class="result-tile">
          <div class="tile-title">Concurrent Streams on 80GB H100</div>
          <div id="calc-max-batch" class="tile-number">18 Streams</div>
          <div class="tile-sub">Before GPU memory exhausts (ignoring model weights)</div>
        </div>

        <div class="calc-explanation" id="calc-note">
          <strong>GQA Analysis:</strong> With 8 KV heads vs 32 Query heads, GQA reduces the KV cache by 4&times; compared to MHA, allowing 4&times; larger batch sizes while retaining multi-head representation quality.
        </div>
      </div>
    </div>
  </section>
  `;
}

export function renderPositionVisualizerWidget(): string {
  return `
  <section id="position-visualizer-section" class="widget-section">
    <div class="widget-header">
      <span class="widget-badge">INTERACTIVE EXPERIMENT</span>
      <h3>Why Position Encodings Exist: Permutation Invariance</h3>
      <p class="text-muted">
        Self-attention computes dot products between sets. Without position encodings, word order is completely invisible.
      </p>
    </div>

    <div class="perm-demo-card">
      <div class="perm-controls">
        <span>Try Reordering Tokens:</span>
        <button id="btn-perm-original" class="btn btn-sm btn-outline active">1. "Cats chase mice"</button>
        <button id="btn-perm-swapped" class="btn btn-sm btn-outline">2. "Mice chase cats"</button>
        <button id="btn-perm-random" class="btn btn-sm btn-outline">3. "Chase mice cats"</button>
      </div>

      <div class="perm-comparison-grid">
        <div class="perm-box">
          <h4>Without Positional Encodings (Unpositioned)</h4>
          <p class="text-danger font-semibold">&#9888; Exact Same Attention Weights!</p>
          <div class="token-flow" id="perm-unpositioned-tokens">
            <span class="token-pill">Cats</span> &rarr; <span class="token-pill">chase</span> &rarr; <span class="token-pill">mice</span>
          </div>
          <p class="text-sm text-muted">
            The model treats "Cats chase mice" and "Mice chase cats" as identical unordered bags of words!
          </p>
        </div>

        <div class="perm-box">
          <h4>With Positional Encodings (RoPE / ALiBi)</h4>
          <p class="text-success font-semibold">&#10003; Order-Sensitive Representation</p>
          <div class="token-flow" id="perm-positioned-tokens">
            <span class="token-pill pill-pos">Cats [pos:0]</span> &rarr; <span class="token-pill pill-pos">chase [pos:1]</span> &rarr; <span class="token-pill pill-pos">mice [pos:2]</span>
          </div>
          <p class="text-sm text-muted">
            Inner product depends on relative offset \((m - n)\), distinguishing subject from object accurately.
          </p>
        </div>
      </div>
    </div>
  </section>
  `;
}

export function renderSlidingWindowSinksWidget(): string {
  return `
  <section id="sinks-visualizer-section" class="widget-section">
    <div class="widget-header">
      <span class="widget-badge">INTERACTIVE DEMO</span>
      <h3>Sliding Window Attention & Attention Sinks (StreamingLLM)</h3>
      <p class="text-muted">
        Observe why naive window eviction causes infinite perplexity explosions and how keeping initial sink tokens fixes it.
      </p>
    </div>

    <div class="sinks-demo-container">
      <div class="sinks-controls">
        <label for="sinks-slider">Current Generation Step (Tokens Generated):</label>
        <input type="range" id="sinks-slider" min="4" max="16" value="8" class="form-range" />
        <span id="sinks-step-label" class="font-mono">Step 8</span>

        <div class="sinks-mode-toggles">
          <label class="toggle-control">
            <input type="checkbox" id="toggle-preserve-sinks" checked />
            <span class="toggle-slider"></span>
            <span class="toggle-label">Preserve Sink Tokens (0 & 1)</span>
          </label>
        </div>
      </div>

      <div class="sinks-grid-display">
        <div class="sinks-matrix-card">
          <h4>KV Cache Buffer Status at Current Step</h4>
          <div id="sinks-buffer-tokens" class="buffer-tokens-row">
            <!-- Dynamically populated tokens -->
          </div>
          <div id="sinks-status-callout" class="callout-box">
            <!-- Dynamically updated diagnosis -->
          </div>
        </div>
      </div>
    </div>
  </section>
  `;
}

export function renderRecurrentRecallWidget(): string {
  return `
  <section id="recurrent-recall-section" class="widget-section">
    <div class="widget-header">
      <span class="widget-badge">ASSOCIATIVE RECALL EXPERIMENT</span>
      <h3>Linear Attention vs. Delta Rule: The Overwriting Test</h3>
      <p class="text-muted">
        Linear attention stores memories in a fixed-size state matrix \(S \in \mathbb{R}^{d \times d}\).
        See what happens when two values are associated with the same key.
      </p>
    </div>

    <div class="recall-experiment-card">
      <div class="experiment-steps">
        <div class="exp-step"><strong>Step 1:</strong> Store Key: <code>"color"</code> &rarr; Value: <code>"blue"</code></div>
        <div class="exp-step"><strong>Step 2:</strong> Store Key: <code>"animal"</code> &rarr; Value: <code>"dog"</code></div>
        <div class="exp-step"><strong>Step 3:</strong> Update Key: <code>"color"</code> &rarr; Value: <code>"green"</code></div>
        <div class="exp-step highlight-query"><strong>Query:</strong> Recall Key <code>"color"</code>?</div>
      </div>

      <div class="experiment-results-grid">
        <div class="exp-result-box naive-box">
          <h4>1. Vanilla Linear Attention</h4>
          <div class="exp-math font-mono">S_t = S_{t-1} + k_t v_t^T</div>
          <div class="exp-output text-danger">Output: "blue" + "green" (Collision / Blended Noise)</div>
          <p class="text-sm text-muted">
            Additive updates cannot erase past associations. The state continually accumulates old values, causing severe interference on repeated keys.
          </p>
        </div>

        <div class="exp-result-box delta-box">
          <h4>2. Delta Rule (DeltaNet / Gated DeltaNet)</h4>
          <div class="exp-math font-mono">S_t = S_{t-1} - \beta_t (S_{t-1} k_t - v_t) k_t^T</div>
          <div class="exp-output text-success">Output: "green" (Exact Overwrite! 100% Fidelity)</div>
          <p class="text-sm text-muted">
            The delta rule predicts the prior value (\(S k = \text{"blue"}\)), computes error against new value \(\text{"green"}\), and subtracts the old memory before writing!
          </p>
        </div>
      </div>
    </div>
  </section>
  `;
}
