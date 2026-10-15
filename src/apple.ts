// Apple.com Design Edition - Application Controller
// Conforms to Apple Human Interface Guidelines and Product Showcase aesthetics

import mechanismsData from '../data/mechanisms.json';
import { Mechanism } from './types';
import { scaledDotProductAttention, calculateKVCacheBytesPerToken } from './utils/attention-math';
import './apple.css';

const mechanisms: Mechanism[] = mechanismsData as Mechanism[];

// Preset 4-token sequence with 4-dimensional representations for Hero
const sampleTokens = ['The', 'robot', 'saw', 'cats'];
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

let appleScaleEnabled = true;
let appleMaskEnabled = true;

function renderAppleApp() {
  const app = document.getElementById('apple-app');
  if (!app) return;

  app.innerHTML = `
    <div class="apple-page-wrapper">
      <!-- Apple Global Navigation -->
      <nav class="apple-nav" aria-label="Global Navigation">
        <div class="apple-nav-inner">
          <a href="./apple.html" class="apple-logo-group">
            <span class="apple-logo-icon"></span>
            <span class="apple-logo-text">Attention</span>
          </a>

          <!-- View Switcher -->
          <div class="apple-view-switch" role="group" aria-label="View Switcher">
            <a href="./index.html" class="apple-switch-link" title="Switch to Research Station">Research Station</a>
            <a href="./apple.html" class="apple-switch-link active" title="Currently viewing Editorial Story">Editorial Story</a>
          </div>
        </div>
      </nav>

      <!-- Apple Local Sticky Sub-nav -->
      <div class="apple-local-nav" aria-label="Local Navigation">
        <div class="apple-local-nav-inner">
          <span class="apple-local-title">How Does Attention Work Now?</span>
          <ul class="apple-local-links">
            <li><a href="#overview">Overview</a></li>
            <li><a href="#foundations">Standard Attention</a></li>
            <li><a href="#calculator">Calculator</a></li>
            <li><a href="#timeline">Chronology</a></li>
            <li><a href="#workloads">Workloads</a></li>
            <li><a href="#takeaways">Takeaways</a></li>
          </ul>
        </div>
      </div>

      <!-- Apple Hero Section -->
      <header id="overview" class="apple-hero">
        <div class="apple-eyebrow">A Decade of Machine Learning &bull; 2014 &ndash; 2026</div>
        <h1 class="apple-headline">Attention.<br>Reimagined from the dot product up.</h1>
        <p class="apple-subhead">
          From \(O(N^2 d)\) quadratic compute to 890 bytes per token. Explore every major attention mechanism
          in strict chronological order, with exact mathematical fidelity, verified primary sources, and zero hype.
        </p>
        <div class="apple-cta-row">
          <a href="#timeline" class="apple-btn-primary">Explore the Chronology &darr;</a>
          <a href="#calculator" class="apple-btn-secondary">Open KV Cache Calculator &rarr;</a>
        </div>
      </header>

      <!-- Apple Interactive Filter Section -->
      <section class="apple-filter-section" aria-label="Filter timeline">
        <div class="apple-segmented-control" role="tablist">
          <button class="apple-segment-btn active" data-apple-tag="all">All (30)</button>
          <button class="apple-segment-btn" data-apple-tag="compute">Compute</button>
          <button class="apple-segment-btn" data-apple-tag="decode-memory">Decode Memory</button>
          <button class="apple-segment-btn" data-apple-tag="position">Position</button>
          <button class="apple-segment-btn" data-apple-tag="long-context">Long Context</button>
          <button class="apple-segment-btn" data-apple-tag="recurrent-state">Recurrence</button>
          <button class="apple-segment-btn" data-apple-tag="sparsity">Sparsity</button>
          <button class="apple-segment-btn" data-apple-tag="compression">Compression</button>
        </div>
        <div id="apple-filter-indicator" class="apple-filter-indicator">
          Showing all 30 verified mechanisms
        </div>
      </section>

      <div class="apple-container">
        <!-- 1. Standard Attention Showcase Card -->
        <section id="foundations" class="apple-showcase-card">
          <div class="apple-showcase-grid">
            <div class="apple-showcase-content">
              <div class="apple-eyebrow" style="color: var(--apple-blue);">The Baseline &bull; June 12, 2017</div>
              <h3>Standard Scaled Dot-Product Attention</h3>
              <p>
                Before optimizing, pruning, or compressing, understand the original mathematical pipeline.
                Attention was not flawed; it solved the recurrent information bottleneck and unlocked massive GPU training parallelism.
              </p>
              <div class="apple-math-pill">
                \(\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{Q K^T}{\sqrt{d_k}} + M\right) V\)
              </div>
              <p class="text-sm">
                Scaling by \(1/\sqrt{d_k}\) counteracts the variance growth of dot products under unit variance components,
                preventing softmax saturation and vanishing gradients.
              </p>
            </div>

            <!-- Interactive Mini Matrix -->
            <div class="apple-matrix-interactive">
              <div class="apple-interactive-toggles">
                <label class="apple-switch-toggle">
                  <input type="checkbox" id="apple-toggle-scale" checked />
                  <span class="apple-toggle-knob"></span>
                  <span>Scale \(1/\sqrt{d_k}\)</span>
                </label>
                <label class="apple-switch-toggle">
                  <input type="checkbox" id="apple-toggle-mask" checked />
                  <span class="apple-toggle-knob"></span>
                  <span>Causal Mask</span>
                </label>
              </div>

              <div id="apple-matrix-container">
                ${renderAppleMatrix(true, true)}
              </div>
            </div>
          </div>
        </section>

        <!-- 2. Apple KV Cache Calculator -->
        <section id="calculator" class="apple-calc-wrapper">
          <div class="apple-section-header">
            <div class="apple-eyebrow">Interactive Pro Tool</div>
            <h2>Universal KV Cache Calculator</h2>
            <p>Calculate GPU High Bandwidth Memory (HBM) footprints and streaming decode bandwidth across architectures.</p>
          </div>

          <div class="apple-calc-grid">
            <div class="apple-slider-card">
              <div class="apple-slider-group">
                <label for="apple-calc-arch" class="text-sm">Architecture Paradigm:</label>
                <select id="apple-calc-arch" class="apple-select">
                  <option value="mha">Multi-Head Attention (MHA - Standard)</option>
                  <option value="gqa" selected>Grouped-Query Attention (GQA - LLaMA 3)</option>
                  <option value="mqa">Multi-Query Attention (MQA - PaLM)</option>
                  <option value="mla">Multi-head Latent Attention (MLA - DeepSeek-V2/V3)</option>
                  <option value="csa2">Compressed Sparse Attention 2 (CSA2 - DeepSeek-V4.1)</option>
                </select>
              </div>

              <div class="apple-slider-group">
                <div class="apple-slider-header">
                  <label for="apple-calc-seq">Context Sequence Length:</label>
                  <span id="apple-calc-seq-val">131,072 tokens (128K)</span>
                </div>
                <input type="range" id="apple-calc-seq" min="1024" max="1048576" step="1024" value="131072" class="apple-range" />
              </div>

              <div class="apple-slider-group">
                <div class="apple-slider-header">
                  <label for="apple-calc-layers">Transformer Layers:</label>
                  <span id="apple-calc-layers-val">32</span>
                </div>
                <input type="range" id="apple-calc-layers" min="8" max="128" step="4" value="32" class="apple-range" />
              </div>

              <div class="apple-slider-group">
                <label for="apple-calc-dtype" class="text-sm">Numerical Precision:</label>
                <select id="apple-calc-dtype" class="apple-select">
                  <option value="2" selected>FP16 / BF16 (2 bytes / param)</option>
                  <option value="1">FP8 (1 byte / param)</option>
                  <option value="0.5">FP4 (0.5 bytes / param - Blackwell)</option>
                </select>
              </div>
            </div>

            <!-- Apple Calc Results Display -->
            <div class="apple-calc-display">
              <div class="apple-metric-tile highlight">
                <div class="apple-metric-title">KV Cache Footprint (Single User)</div>
                <div id="apple-metric-total" class="apple-metric-number">4.00 GB</div>
                <div id="apple-metric-per-token" class="apple-metric-sub">32,768 Bytes / token</div>
              </div>

              <div class="apple-metric-tile">
                <div class="apple-metric-title">Decode HBM Bandwidth Required</div>
                <div id="apple-metric-bw" class="apple-metric-number">200.0 GB/s</div>
                <div class="apple-metric-sub">Streaming KV cache at 50 tokens/sec generation</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. Apple Chronology Stream -->
        <section id="timeline" class="apple-timeline-section">
          <div class="apple-section-header">
            <div class="apple-eyebrow">2014 &ndash; 2026</div>
            <h2>Chronological Progression</h2>
            <p>Every mechanism appeared as a direct answer to a concrete limitation of what came before.</p>
          </div>

          <div class="apple-cards-stream" id="apple-cards-container">
            ${mechanisms.map((m) => renderAppleMechanismCard(m)).join('')}
          </div>
        </section>

        <!-- 4. Apple Workload Guidance -->
        <section id="workloads" class="apple-workloads-section">
          <div class="apple-section-header" style="margin-top: 4rem;">
            <div class="apple-eyebrow">Workload Engineering</div>
            <h2>When to Choose Each Mechanism</h2>
            <p>Architecture choices tied to real production constraints.</p>
          </div>

          <div class="apple-workload-grid">
            <div class="apple-workload-card">
              <div>
                <div class="apple-workload-icon">💬</div>
                <h3>2K Consumer Chatbot</h3>
                <p>Low latency &bull; High concurrency &bull; Cost-sensitive</p>
                <div class="apple-spec-pill"><span>Prompt Length:</span><span class="apple-mono">~1,500 tokens</span></div>
                <div class="apple-spec-pill"><span>Batch Size:</span><span class="apple-mono">64-128 streams</span></div>
              </div>
              <div class="apple-rec-box">
                <strong>&#10003; Recommended: GQA (8:1)</strong>
                Small memory footprint enables massive batch concurrency without complex indexing overhead.
              </div>
            </div>

            <div class="apple-workload-card">
              <div>
                <div class="apple-workload-icon">📑</div>
                <h3>128K Document QA</h3>
                <p>Needle retrieval &bull; High precision &bull; Deep synthesis</p>
                <div class="apple-spec-pill"><span>Prompt Length:</span><span class="apple-mono">100K-128K tokens</span></div>
                <div class="apple-spec-pill"><span>Batch Size:</span><span class="apple-mono">4-8 streams</span></div>
              </div>
              <div class="apple-rec-box">
                <strong>&#10003; Recommended: MLA + YaRN</strong>
                Exact global pairwise attention ensures zero lost needles; low-rank latents cut KV cache by 93%.
              </div>
            </div>

            <div class="apple-workload-card">
              <div>
                <div class="apple-workload-icon">🤖</div>
                <h3>1M Autonomous Coding Agent</h3>
                <p>Extreme context &bull; Multi-turn tool execution loops</p>
                <div class="apple-spec-pill"><span>Prompt Length:</span><span class="apple-mono">500K-1M tokens</span></div>
                <div class="apple-spec-pill"><span>Tool Turns:</span><span class="apple-mono">50-200 iterations</span></div>
              </div>
              <div class="apple-rec-box">
                <strong>&#10003; Recommended: CSA2 / Hybrid Gated DeltaNet</strong>
                Cross-layer KV sharing with FP4 shrinks 1M cache to 890 MB; Gated DeltaNet handles 75% of layers in O(1) state.
              </div>
            </div>
          </div>
        </section>

        <!-- 5. Apple Takeaways -->
        <section id="takeaways" class="apple-takeaways-section">
          <div class="apple-section-header">
            <div class="apple-eyebrow">A Decade in Review</div>
            <h2>The Arc of Attention</h2>
            <p>From escaping recurrent bottlenecks in 2014 to creating unified compressed hybrids in 2026.</p>
          </div>

          <div class="apple-showcase-card" style="text-align: center; padding: 3rem 2rem;">
            <p style="font-size: 1.2rem; line-height: 1.7; max-width: 800px; margin: 0 auto; color: var(--apple-text-primary);">
              <em>
                &ldquo;Every modern attention mechanism is a specific answer to a specific bill:
                FlashAttention paid in kernel engineering; GQA and MLA paid in projection capacity;
                DeltaNet paid in finite state memory; CSA paid in lossy pooling.
                True mastery of attention means knowing which bill your workload can afford to pay.&rdquo;
              </em>
            </p>
          </div>
        </section>
      </div>

      <!-- Apple Footer -->
      <footer class="apple-footer">
        <div class="apple-footer-inner">
          <div>
            <strong>How Does Attention Work Now?</strong> &bull; Editorial Story Edition.
            <p style="margin-top: 0.25rem;">All 30 mechanisms verified against primary sources on October 14, 2026.</p>
          </div>
          <div class="apple-footer-links">
            <a href="./index.html">Research Station</a>
            &bull;
            <a href="https://github.com/thinkTinkerGreen/attention_timeline" target="_blank" rel="noopener noreferrer">GitHub</a>
            &bull;
            <a href="./docs/verification-log.md" target="_blank">Verification Log</a>
            &bull;
            <a href="./docs/corrections-to-brief.md" target="_blank">Corrections</a>
          </div>
        </div>
      </footer>
    </div>
  `;

  attachAppleEvents();
}

function renderAppleMatrix(scale: boolean, mask: boolean): string {
  const res = scaledDotProductAttention(Q_sample, K_sample, V_sample, scale, mask);
  return `
    <table class="apple-matrix-table">
      <thead>
        <tr><th>Q \\ K</th>${sampleTokens.map((t) => `<th>${t}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${res.weights
          .map(
            (row, i) => `
          <tr>
            <th>${sampleTokens[i]}</th>
            ${row
              .map(
                (p) => `
              <td class="prob-cell" style="--prob: ${p}">
                ${(p * 100).toFixed(0)}%
              </td>
            `
              )
              .join('')}
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;
}

function renderAppleMechanismCard(m: Mechanism): string {
  return `
  <article class="apple-mech-card" data-apple-tags="${m.tags.join(' ')}" id="apple-mech-${m.id}">
    <div class="apple-card-top-row">
      <span class="apple-date-badge">${m.first_appearance.date}</span>
      <span class="apple-verified-badge">&#10003; Verified</span>
      <a href="${m.first_appearance.primary_url}" target="_blank" rel="noopener noreferrer" class="apple-source-btn">
        Primary Source (${m.first_appearance.event}) &UpperRightArrow;
      </a>
    </div>

    <h3 class="apple-card-name">${m.name}</h3>
    <div class="apple-card-authors">${m.authors_org}</div>

    <!-- Apple 2-Column Bento Grid: Pressure & Move | Benefits & Downsides -->
    <div class="apple-card-grid">
      <!-- Pressure & Move -->
      <div class="apple-card-pane">
        <h4>The Engineering Pressure</h4>
        <p>${m.pressure}</p>

        <h4 style="margin-top: 1rem;">The Move (Mechanism)</h4>
        <p style="font-family: var(--sf-mono); font-size: 0.82rem; color: var(--apple-cyan);">${m.mechanism}</p>
      </div>

      <!-- What It Bought & The Bill -->
      <div class="apple-card-pane">
        <div class="apple-bought-pane" style="padding-left: 0.75rem; margin-bottom: 1rem;">
          <h4>What It Bought</h4>
          <ul class="apple-list">
            ${m.what_it_buys.map((b) => `<li><strong>&plus;</strong> ${b}</li>`).join('')}
          </ul>
        </div>

        <div class="apple-bill-pane" style="padding-left: 0.75rem;">
          <h4>The Bill (Cost Paid)</h4>
          <ul class="apple-list">
            ${m.what_it_gives_up.map((g) => `<li><strong>&minus;</strong> ${g}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>

    <!-- Workload Guidance -->
    <div class="apple-card-guidance">
      <div class="apple-guidance-col apple-choose-col">
        <span>&#10004; Choose When:</span>
        <p class="text-sm">${m.choose_when.join('; ')}</p>
      </div>
      <div class="apple-guidance-col apple-avoid-col">
        <span>&#10008; Avoid When:</span>
        <p class="text-sm">${m.avoid_when.join('; ')}</p>
      </div>
    </div>
  </article>
  `;
}

function attachAppleEvents() {
  // Hero Toggles
  const scaleToggle = document.getElementById('apple-toggle-scale') as HTMLInputElement | null;
  const maskToggle = document.getElementById('apple-toggle-mask') as HTMLInputElement | null;
  const matrixContainer = document.getElementById('apple-matrix-container');

  function updateMatrix() {
    if (!matrixContainer || !scaleToggle || !maskToggle) return;
    appleScaleEnabled = scaleToggle.checked;
    appleMaskEnabled = maskToggle.checked;
    matrixContainer.innerHTML = renderAppleMatrix(appleScaleEnabled, appleMaskEnabled);
  }

  scaleToggle?.addEventListener('change', updateMatrix);
  maskToggle?.addEventListener('change', updateMatrix);

  // Apple Segmented Control Filtering
  const segmentButtons = document.querySelectorAll('.apple-segment-btn');
  const indicator = document.getElementById('apple-filter-indicator');
  const cards = document.querySelectorAll('.apple-mech-card');

  segmentButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const tag = target.getAttribute('data-apple-tag') || 'all';

      segmentButtons.forEach((b) => b.classList.remove('active'));
      target.classList.add('active');

      let matchCount = 0;
      cards.forEach((card) => {
        const cardEl = card as HTMLElement;
        const cardTags = (cardEl.getAttribute('data-apple-tags') || '').split(' ');
        if (tag === 'all' || cardTags.includes(tag)) {
          cardEl.style.display = 'block';
          matchCount++;
        } else {
          cardEl.style.display = 'none';
        }
      });

      if (indicator) {
        if (tag === 'all') {
          indicator.textContent = 'Showing all 30 verified mechanisms';
        } else {
          indicator.textContent = `Showing ${matchCount} mechanisms tagged with #${tag}`;
        }
      }
    });
  });

  // Apple Calculator
  const archSelect = document.getElementById('apple-calc-arch') as HTMLSelectElement | null;
  const seqSlider = document.getElementById('apple-calc-seq') as HTMLInputElement | null;
  const seqVal = document.getElementById('apple-calc-seq-val');
  const layersSlider = document.getElementById('apple-calc-layers') as HTMLInputElement | null;
  const layersVal = document.getElementById('apple-calc-layers-val');
  const dtypeSelect = document.getElementById('apple-calc-dtype') as HTMLSelectElement | null;

  const totalMetric = document.getElementById('apple-metric-total');
  const perTokenMetric = document.getElementById('apple-metric-per-token');
  const bwMetric = document.getElementById('apple-metric-bw');

  function updateAppleCalc() {
    if (!archSelect || !seqSlider || !layersSlider || !dtypeSelect) return;

    const arch = archSelect.value as 'mha' | 'gqa' | 'mqa' | 'mla' | 'csa2';
    const seqLen = parseInt(seqSlider.value, 10);
    const layers = parseInt(layersSlider.value, 10);
    const dtype = parseFloat(dtypeSelect.value);

    if (seqVal) seqVal.textContent = `${seqLen.toLocaleString()} tokens (${(seqLen / 1024).toFixed(0)}K)`;
    if (layersVal) layersVal.textContent = `${layers}`;

    const kvHeads = arch === 'mha' ? 32 : arch === 'mqa' ? 1 : 8;

    const bytesPerToken = calculateKVCacheBytesPerToken({
      type: arch,
      layers,
      q_heads: 32,
      kv_heads: kvHeads,
      d_head: 128,
      bytesPerElement: dtype,
    });

    const totalBytes = bytesPerToken * seqLen;
    const totalGB = totalBytes / (1024 * 1024 * 1024);
    const totalMB = totalBytes / (1024 * 1024);
    const bwGBs = (totalBytes * 50) / (1024 * 1024 * 1024);

    if (totalMetric) {
      totalMetric.textContent = totalGB >= 1 ? `${totalGB.toFixed(2)} GB` : `${totalMB.toFixed(1)} MB`;
    }
    if (perTokenMetric) {
      perTokenMetric.textContent = `${bytesPerToken.toLocaleString()} Bytes / token`;
    }
    if (bwMetric) {
      bwMetric.textContent = `${bwGBs.toFixed(1)} GB/s`;
    }
  }

  [archSelect, seqSlider, layersSlider, dtypeSelect].forEach((el) => {
    el?.addEventListener('input', updateAppleCalc);
    el?.addEventListener('change', updateAppleCalc);
  });

  updateAppleCalc();
}

document.addEventListener('DOMContentLoaded', renderAppleApp);
