// Standard Scaled Dot-Product Attention Hero Section
// Complete pedagogical breakdown with real numerical calculations and live toggles

import { scaledDotProductAttention } from '../utils/attention-math';

export function renderStandardAttentionHero(): string {
  // Preset 4-token sequence with 4-dimensional representations
  const tokens = ['The', 'robot', 'saw', 'cats'];
  const Q_sample = [
    [1.2, 0.4, -0.8, 0.5],
    [0.1, 1.8, 0.3, -0.9],
    [0.8, -0.2, 1.5, 0.1],
    [-0.5, 0.6, 0.2, 1.4],
  ];
  const K_sample = [
    [1.0, 0.3, -0.7, 0.4],
    [0.2, 1.5, 0.1, -0.8],
    [0.7, -0.3, 1.4, 0.2],
    [-0.4, 0.5, 0.3, 1.2],
  ];
  const V_sample = [
    [2.1, 0.5, 1.0, 0.2],
    [0.4, 3.2, 0.1, 1.5],
    [1.1, 0.8, 2.7, 0.4],
    [0.3, 1.2, 0.5, 2.9],
  ];

  const defaultRes = scaledDotProductAttention(Q_sample, K_sample, V_sample, true, true);

  return `
  <section id="standard-attention" class="hero-section">
    <div class="hero-badge">FOUNDATIONAL BASELINE &bull; JUNE 12, 2017</div>
    <h2 class="hero-title">Standard Scaled Dot-Product Attention</h2>
    <p class="hero-subtitle">
      Before modifying, pruning, or compressing attention, understand the exact original mathematical pipeline.
      Attention is <strong>not bad</strong>; it solved the fatal information bottleneck of recurrent networks
      and unlocked massive GPU parallelization. Later work exists solely to manage the specific bills it created.
    </p>

    <!-- Why Q, K, V exist -->
    <div class="concept-trio">
      <div class="concept-card">
        <div class="concept-icon">🔍</div>
        <h3>Query (Q)</h3>
        <p class="concept-role"><em>"What am I looking for?"</em></p>
        <p>The vector representation emitted by the current token asking what surrounding context it needs to resolve its meaning.</p>
      </div>
      <div class="concept-card">
        <div class="concept-icon">🏷️</div>
        <h3>Key (K)</h3>
        <p class="concept-role"><em>"What do I offer?"</em></p>
        <p>The indexing label emitted by candidate tokens indicating what semantic content they possess for incoming queries to match.</p>
      </div>
      <div class="concept-card">
        <div class="concept-icon">📦</div>
        <h3>Value (V)</h3>
        <p class="concept-role"><em>"What information do I contain?"</em></p>
        <p>The actual substantive payload extracted and weighted once a query successfully matches against a key.</p>
      </div>
    </div>

    <!-- The 6-Step Pipeline Visualizer -->
    <div class="pipeline-card">
      <div class="pipeline-header">
        <div>
          <h3>Interactive Worked Example: 4 Tokens, \\(d_k = 4\\)</h3>
          <p class="text-muted">Explore the exact 6-step transformation from raw word vectors to contextualized outputs.</p>
        </div>
        <div class="pipeline-controls">
          <label class="toggle-control" title="Toggle 1/sqrt(d_k) scaling to observe softmax saturation">
            <input type="checkbox" id="hero-toggle-scale" checked />
            <span class="toggle-slider"></span>
            <span class="toggle-label">Scale by \\(1/\\sqrt{d_k}\\)</span>
          </label>
          <label class="toggle-control" title="Toggle causal mask to allow or block future token visibility">
            <input type="checkbox" id="hero-toggle-mask" checked />
            <span class="toggle-slider"></span>
            <span class="toggle-label">Causal Mask</span>
          </label>
        </div>
      </div>

      <!-- Step indicator bar -->
      <div class="step-nav" role="tablist">
        <button class="step-btn active" data-step="0">1. \\(Q \\times K^T\\)</button>
        <button class="step-btn" data-step="1">2. Scale \\(\\frac{1}{\\sqrt{d_k}}\\)</button>
        <button class="step-btn" data-step="2">3. Mask (\\(-\\infty\\))</button>
        <button class="step-btn" data-step="3">4. Softmax</button>
        <button class="step-btn" data-step="4">5. \\(\\times V\\)</button>
        <button class="step-btn" data-step="5">6. Context Vector</button>
      </div>

      <!-- Dynamic display box -->
      <div id="hero-step-display" class="step-display-area">
        ${renderHeroStepContent(0, defaultRes, tokens)}
      </div>

      <!-- Live Diagnosis Box -->
      <div id="hero-diagnosis" class="diagnosis-box">
        <div class="diagnosis-icon">💡</div>
        <div id="hero-diagnosis-text" class="diagnosis-text">
          <strong>Operating at Healthy Baseline:</strong> Scaling by \\(1/\\sqrt{4} = 0.5\\) keeps dot products in a moderate range, preventing softmax gradients from vanishing. Causal masking ensures autoregressive integrity.
        </div>
      </div>
    </div>

    <!-- Variance Argument and Why Mask Before Softmax -->
    <div class="math-explainer-grid">
      <div class="explainer-box">
        <h4>Why Divide by \\(\\sqrt{d_k}\\)? (The Variance Proof)</h4>
        <p>
          Assume query and key components \\(q_i\\) and \\(k_i\\) are independent random variables with zero mean and unit variance (\\(\\mu=0, \\sigma^2=1\\)).
          The dot product is the sum of \\(d_k\\) independent terms:
        </p>
        <div class="math-block">
          \\[
          q \\cdot k = \\sum_{i=1}^{d_k} q_i k_i
          \\implies \\mathbb{E}[q \\cdot k] = 0, \\quad \\text{Var}(q \\cdot k) = \\sum_{i=1}^{d_k} \\text{Var}(q_i k_i) = d_k
          \\]
        </div>
        <p>
          As head dimension \\(d_k\\) grows (e.g. \\(d_k=128\\)), the standard deviation reaches \\(\\sqrt{128} \\approx 11.3\\).
          Large inputs push softmax into saturation regions where the derivative \\(S_i(1 - S_i) \\approx 0\\), completely killing gradient backpropagation!
          Dividing by \\(\\sqrt{d_k}\\) rescales the variance back to strictly \\(1.0\\).
        </p>
      </div>

      <div class="explainer-box">
        <h4>Why Mask to \\(-\\infty\\) Before Softmax?</h4>
        <p>
          In autoregressive models, token \\(i\\) must never see future tokens \\(j > i\\). If you zero out attention scores <em>after</em> softmax, the remaining probabilities no longer sum to \\(1.0\\), distorting the output magnitude.
        </p>
        <div class="math-block">
          \\[
          M_{ij} = \\begin{cases} 0 & \\text{if } j \\le i \\\\ -\\infty & \\text{if } j > i \\end{cases}
          \\implies \\text{Softmax}\\left(\\frac{q_i k_j^T}{\\sqrt{d_k}} + M_{ij}\\right) = \\frac{e^{-\\infty}}{\\sum e^{\\text{score}}} = 0.000
          \\]
        </div>
        <p>
          Setting future logits to \\(-\\infty\\) guarantees that \\(e^{-\\infty} = 0\\), naturally forcing future attention weights to exactly \\(0.0\\) while remaining past token weights smoothly sum to \\(1.0\\).
        </p>
      </div>
    </div>

    <!-- The Three Cost Curves & The Four Pressures -->
    <div class="cost-curves-card">
      <h3>The Three Cost Curves of Standard Attention</h3>
      <div class="cost-grid">
        <div class="cost-metric">
          <div class="cost-label">Prefill Compute</div>
          <div class="cost-value">\\(O(N^2 \\cdot d)\\)</div>
          <p class="cost-desc">Quadratic FLOPs. Processing a 100K token prompt requires 10,000&times; more compute operations than a 1K token prompt.</p>
        </div>
        <div class="cost-metric">
          <div class="cost-label">Score Matrix Memory</div>
          <div class="cost-value">\\(O(N^2)\\)</div>
          <p class="cost-desc">Quadratic memory traffic. Storing the full \\(N \\times N\\) attention score tensor in GPU HBM causes catastrophic OOM without IO tiling (FlashAttention).</p>
        </div>
        <div class="cost-metric">
          <div class="cost-label">Decode KV Cache Growth</div>
          <div class="cost-value">\\(O(N \\cdot L \\cdot H_{kv} \\cdot d_h)\\)</div>
          <p class="cost-desc">Linear state growth per token. At 32 layers, 32 heads, \\(d_h=128\\), FP16 precision, every single token consumes 524 KB of GPU memory indefinitely.</p>
        </div>
      </div>

      <div class="pressures-summary">
        <h4>The Four Pressures That Drive Everything After:</h4>
        <ol class="pressure-list">
          <li><strong>Quadratic Compute Bottleneck:</strong> How do we process long contexts without quadratic FLOP explosion? &rarr; <em>Sparse, Linear, Sliding Window</em></li>
          <li><strong>Decoding Memory-Bandwidth Choke:</strong> How do we serve high batch sizes when KV cache exhausts GPU RAM? &rarr; <em>MQA, GQA, MLA, CSA</em></li>
          <li><strong>Permutation Invariance:</strong> Self-attention has zero native concept of token order. How do we inject position without destroying extrapolation? &rarr; <em>RoPE, ALiBi, NoPE, DroPE</em></li>
          <li><strong>Context Length Horizon Collapse:</strong> Models fail when evaluated past their training length. How do we extend context without retraining from scratch? &rarr; <em>PI, NTK-Aware, YaRN</em></li>
        </ol>
      </div>
    </div>
  </section>
  `;
}

export function renderHeroStepContent(
  step: number,
  res: ReturnType<typeof scaledDotProductAttention>,
  tokens: string[]
): string {
  const formatNum = (n: number) => (n <= -1e8 ? '-&infin;' : n.toFixed(3));

  if (step === 0) {
    return `
      <div class="step-inner">
        <h4>Step 1: Compute Raw Dot Products \\(Q \\times K^T\\)</h4>
        <p class="text-muted">Unscaled dot product between Query vectors and Key vectors. Notice how values range up to 4.5+.</p>
        <div class="matrix-wrapper">
          <table class="matrix-table">
            <thead>
              <tr><th>Q \\ K</th>${tokens.map((t) => `<th>"${t}"</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${res.scoresRaw
                .map(
                  (row, i) => `
                <tr>
                  <th>"${tokens[i]}"</th>
                  ${row.map((val) => `<td>${formatNum(val)}</td>`).join('')}
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  if (step === 1) {
    return `
      <div class="step-inner">
        <h4>Step 2: Scale Scores by \\(1/\\sqrt{d_k} = 1/\\sqrt{4} = 0.5\\)</h4>
        <p class="text-muted">Dividing by \\(\\sqrt{d_k}\\) shrinks the spread, keeping variance normalized around 1.0.</p>
        <div class="matrix-wrapper">
          <table class="matrix-table">
            <thead>
              <tr><th>Q \\ K</th>${tokens.map((t) => `<th>"${t}"</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${res.scoresScaled
                .map(
                  (row, i) => `
                <tr>
                  <th>"${tokens[i]}"</th>
                  ${row.map((val) => `<td>${formatNum(val)}</td>`).join('')}
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  if (step === 2) {
    return `
      <div class="step-inner">
        <h4>Step 3: Apply Causal Mask (\\(-\\infty\\) for future tokens)</h4>
        <p class="text-muted">All upper-triangular entries (\\(j > i\\)) are set to \\(-\\infty\\), strictly prohibiting looking ahead.</p>
        <div class="matrix-wrapper">
          <table class="matrix-table">
            <thead>
              <tr><th>Q \\ K</th>${tokens.map((t) => `<th>"${t}"</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${res.scoresMasked
                .map(
                  (row, i) => `
                <tr>
                  <th>"${tokens[i]}"</th>
                  ${row.map((val, j) => `<td class="${j > i ? 'masked-cell' : ''}">${formatNum(val)}</td>`).join('')}
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  if (step === 3) {
    return `
      <div class="step-inner">
        <h4>Step 4: Softmax Normalization (Rows Sum to Exactly 1.000)</h4>
        <p class="text-muted">Exponentiating and normalizing turns logits into a probability distribution. Notice masked cells receive strictly 0.000.</p>
        <div class="matrix-wrapper">
          <table class="matrix-table">
            <thead>
              <tr><th>Q \\ K</th>${tokens.map((t) => `<th>"${t}"</th>`).join('')}<th>Row Sum</th></tr>
            </thead>
            <tbody>
              ${res.weights
                .map(
                  (row, i) => `
                <tr>
                  <th>"${tokens[i]}"</th>
                  ${row
                    .map(
                      (val) => `
                    <td class="prob-cell" style="--prob-intensity: ${val}">
                      <div class="prob-bar" style="width: ${val * 100}%"></div>
                      <span>${(val * 100).toFixed(1)}%</span>
                    </td>
                  `
                    )
                    .join('')}
                  <td class="sum-cell">${row.reduce((a, b) => a + b, 0).toFixed(3)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  if (step === 4) {
    return `
      <div class="step-inner">
        <h4>Step 5: Weighted Sum of Value Matrix \\(V\\)</h4>
        <p class="text-muted">Each token's output is formed by weighting the Value vectors of all attended tokens: \\(\\sum_j \\text{weight}_{ij} V_j\\).</p>
        <div class="matrix-wrapper">
          <table class="matrix-table">
            <thead>
              <tr><th>Token</th><th>Dim 0</th><th>Dim 1</th><th>Dim 2</th><th>Dim 3</th></tr>
            </thead>
            <tbody>
              ${res.output
                .map(
                  (row, i) => `
                <tr>
                  <th>"${tokens[i]}"</th>
                  ${row.map((val) => `<td>${val.toFixed(3)}</td>`).join('')}
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  return `
    <div class="step-inner">
      <h4>Step 6: Contextualized Representation Generated</h4>
      <p class="text-muted">Token 3 ("cats") has now incorporated relevant context from "The", "robot", and "saw" into its 4D vector representation.</p>
      <div class="vector-display">
        <div class="vector-chip">
          <span class="vector-token">"cats" context vector:</span>
          <code>[${res.output[3].map((v) => v.toFixed(3)).join(', ')}]</code>
        </div>
      </div>
    </div>
  `;
}
