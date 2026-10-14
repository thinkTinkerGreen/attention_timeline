// Attention Timeline - Application Entrypoint (Classic Research View)
// Single source of truth: data/mechanisms.json

import mechanismsData from '../data/mechanisms.json';
import { Mechanism } from './types';
import { renderStandardAttentionHero, renderHeroStepContent } from './components/StandardAttentionHero';
import { renderCostLedger } from './components/CostLedger';
import { renderMechanismCard } from './components/MechanismCard';
import {
  renderKVCacheCalculatorWidget,
  renderPositionVisualizerWidget,
  renderSlidingWindowSinksWidget,
  renderRecurrentRecallWidget,
} from './components/InteractiveWidgets';
import { renderWorkloadLens } from './components/WorkloadLens';
import { renderTakeawaySummary } from './components/TakeawaySummary';
import { scaledDotProductAttention, calculateKVCacheBytesPerToken } from './utils/attention-math';
import './style.css';

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

let heroCurrentStep = 0;
let heroScaleEnabled = true;
let heroMaskEnabled = true;

function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;

  const initialMech = mechanisms.find((m) => m.id === 'standard-mha') || mechanisms[0];

  app.innerHTML = `
    <div class="app-container">
      <!-- App Header -->
      <header class="app-header">
        <div class="header-content">
          <div class="brand-group">
            <span style="font-size: 1.5rem;">⚡</span>
            <div>
              <div class="title-with-edition">
                <h1 class="brand-title">How Does Attention Work Now?</h1>
                <span class="edition-badge">Classic Research View</span>
              </div>
              <p class="text-sm text-muted">A Chronological, Honest, and Interactive Explainer (2014 &ndash; 2026)</p>
            </div>
          </div>

          <div class="header-controls-group">
            <!-- Alternative View Switcher -->
            <div class="view-switcher" role="group" aria-label="Interface Edition Switcher">
              <span class="switcher-label">View:</span>
              <a href="./index.html" class="view-switch-btn active" title="Currently viewing Classic Research Edition">
                <span class="view-dot"></span> Classic
              </a>
              <a href="./apple.html" class="view-switch-btn" title="Switch to Apple.com Design Edition">
                 Apple Edition
              </a>
            </div>

            <span class="header-status-badge">
              <span class="status-dot"></span>
              30 / 30 Verified Primary Sources
            </span>
          </div>
        </div>

        <!-- Tag Filters Row -->
        <div class="filter-bar-container">
          <div class="filter-label">Filter by Focus:</div>
          <div class="filter-bar" id="tag-filters" role="tablist">
            <button class="filter-chip active" data-tag="all">All (30)</button>
            <button class="filter-chip" data-tag="compute">#Compute</button>
            <button class="filter-chip" data-tag="decode-memory">#DecodeMemory</button>
            <button class="filter-chip" data-tag="position">#Position</button>
            <button class="filter-chip" data-tag="long-context">#LongContext</button>
            <button class="filter-chip" data-tag="recurrent-state">#Recurrence</button>
            <button class="filter-chip" data-tag="sparsity">#Sparsity</button>
            <button class="filter-chip" data-tag="compression">#Compression</button>
            <button class="filter-chip" data-tag="hybrid">#Hybrid</button>
          </div>
        </div>
      </header>

      <!-- Main Layout -->
      <div class="main-layout">
        <!-- Sticky Navigation Rail -->
        <nav class="timeline-nav-rail" aria-label="Timeline navigation">
          <!-- 1. Foundation & Interactive Tools (Outside Chronology) -->
          <div class="nav-rail-group">
            <div class="nav-rail-header">FOUNDATION & TOOLS</div>
            <ul class="nav-tools-list">
              <li class="nav-tool-item">
                <a href="#standard-attention" class="nav-tool-link">
                  <span class="tool-icon">🔍</span>
                  <span>Standard Attention Hero</span>
                </a>
              </li>
              <li class="nav-tool-item">
                <a href="#kv-cache-calculator-section" class="nav-tool-link">
                  <span class="tool-icon">🧮</span>
                  <span>KV Cache Calculator</span>
                </a>
              </li>
              <li class="nav-tool-item">
                <a href="#position-visualizer-section" class="nav-tool-link">
                  <span class="tool-icon">🧪</span>
                  <span>Permutation Invariance</span>
                </a>
              </li>
              <li class="nav-tool-item">
                <a href="#sinks-visualizer-section" class="nav-tool-link">
                  <span class="tool-icon">🪟</span>
                  <span>Sliding Window & Sinks</span>
                </a>
              </li>
              <li class="nav-tool-item">
                <a href="#recurrent-recall-section" class="nav-tool-link">
                  <span class="tool-icon">🔁</span>
                  <span>Recurrent Recall Test</span>
                </a>
              </li>
              <li class="nav-tool-item">
                <a href="#workload-lens" class="nav-tool-link">
                  <span class="tool-icon">🎯</span>
                  <span>Workload Decision Lens</span>
                </a>
              </li>
              <li class="nav-tool-item">
                <a href="#takeaways" class="nav-tool-link">
                  <span class="tool-icon">📊</span>
                  <span>10-Year Takeaways</span>
                </a>
              </li>
            </ul>
          </div>

          <!-- 2. True Chronological List (Strictly 2014 to 2026) -->
          <div class="nav-rail-group">
            <div class="nav-rail-header" id="rail-chronology-header">
              CHRONOLOGY (2014 &ndash; 2026)
            </div>
            <ol class="timeline-nav-list" id="timeline-rail-list">
              ${mechanisms
                .map(
                  (m) => `
                <li class="timeline-nav-item" data-mech-nav="${m.id}" data-tags="${m.tags.join(' ')}">
                  <a href="#mech-${m.id}" class="timeline-nav-link">
                    <span class="nav-link-date">${m.first_appearance.date}</span>
                    <span class="nav-link-name">${m.name.split('(')[0].trim()}</span>
                  </a>
                </li>
              `
                )
                .join('')}
            </ol>
          </div>
        </nav>

        <!-- Main Content Spine -->
        <main class="content-spine">
          <!-- 1. Foundational Hero: Scaled Dot-Product Attention (Pedagogical Tutorial) -->
          ${renderStandardAttentionHero()}

          <!-- 2. Permutation Invariance Interactive Widget -->
          ${renderPositionVisualizerWidget()}

          <!-- 3. Universal KV Cache Calculator -->
          ${renderKVCacheCalculatorWidget()}

          <!-- Active Filter Banner (Visible when a filter tag is active) -->
          <div id="filter-status-banner" class="filter-status-banner" style="display: none;">
            <div class="banner-content">
              <span class="banner-icon">🎯</span>
              <span id="filter-banner-text">Showing mechanisms</span>
            </div>
            <button id="btn-clear-filter" class="btn btn-sm btn-clear-filter">Show All (30)</button>
          </div>

          <!-- 4. Chronological Mechanism Cards Stream (Starting from 2014-09-01 Additive Attention) -->
          <section id="mechanism-stream" class="mechanisms-stream" aria-label="Chronological Mechanism Cards">
            <div class="stream-section-header">
              <h2>Chronological Progression of Attention Mechanisms</h2>
              <p class="text-muted">
                Each mechanism below responded to a concrete limitation of what came before.
                Sorted strictly by verified public appearance date (2014 &ndash; 2026).
              </p>
            </div>
            ${mechanisms.map((m) => renderMechanismCard(m, mechanisms)).join('')}
          </section>

          <!-- 5. Sliding Window & Sinks Demo -->
          ${renderSlidingWindowSinksWidget()}

          <!-- 6. Recurrent Recall Experiment Demo -->
          ${renderRecurrentRecallWidget()}

          <!-- 7. Workload Lens (2K, 128K, 1M) -->
          ${renderWorkloadLens()}

          <!-- 8. Takeaway Summary -->
          ${renderTakeawaySummary()}
        </main>

        <!-- Right: Persistent Live Cost Ledger -->
        <div class="ledger-column">
          ${renderCostLedger(initialMech)}
        </div>
      </div>

      <!-- App Footer -->
      <footer class="app-footer">
        <div class="footer-content">
          <div>
            <strong>How Does Attention Work Now?</strong> &bull; State-of-the-art interactive ML historical explainer.
            <p class="text-sm text-muted">All dates, numbers, formulas, and paper citations verified against primary sources on October 14, 2026.</p>
          </div>
          <div class="footer-links font-mono">
            <a href="./apple.html" style="color: var(--accent-cyan); font-weight: 600;"> Switch to Apple Design Edition</a>
            &bull;
            <a href="https://github.com/thinkTinkerGreen/attention_timeline" target="_blank" rel="noopener noreferrer">GitHub Repo</a>
            &bull;
            <a href="./docs/verification-log.md" target="_blank">Verification Log</a>
            &bull;
            <a href="./docs/corrections-to-brief.md" target="_blank">Brief Corrections</a>
          </div>
        </div>
      </footer>
    </div>
  `;

  attachEventListeners();
}

function attachEventListeners() {
  // Hero Step Navigation
  const stepButtons = document.querySelectorAll('.step-btn');
  stepButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      heroCurrentStep = parseInt(target.getAttribute('data-step') || '0', 10);
      stepButtons.forEach((b) => b.classList.remove('active'));
      target.classList.add('active');
      updateHeroDisplay();
    });
  });

  // Hero Toggles
  const scaleToggle = document.getElementById('hero-toggle-scale') as HTMLInputElement | null;
  const maskToggle = document.getElementById('hero-toggle-mask') as HTMLInputElement | null;

  if (scaleToggle) {
    scaleToggle.addEventListener('change', () => {
      heroScaleEnabled = scaleToggle.checked;
      updateHeroDisplay();
    });
  }

  if (maskToggle) {
    maskToggle.addEventListener('change', () => {
      heroMaskEnabled = maskToggle.checked;
      updateHeroDisplay();
    });
  }

  // Tag Filtering Implementation (Issue 3 Fix)
  initTagFiltering();

  // KV Cache Calculator Listeners
  initCalculatorListeners();

  // Position Permutation Listeners
  initPermutationListeners();

  // Sliding Window Sinks Listeners
  initSinksListeners();

  // ScrollSpy to update Sticky Nav Rail & Persistent Cost Ledger
  initScrollSpy();
}

function initTagFiltering() {
  const filterChips = document.querySelectorAll('.filter-chip');
  const banner = document.getElementById('filter-status-banner');
  const bannerText = document.getElementById('filter-banner-text');
  const clearBtn = document.getElementById('btn-clear-filter');
  const railHeader = document.getElementById('rail-chronology-header');

  function applyTagFilter(tag: string, scrollToResults = false) {
    // Update chip buttons
    filterChips.forEach((c) => {
      if (c.getAttribute('data-tag') === tag) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    const cards = document.querySelectorAll('.mechanism-card');
    const railItems = document.querySelectorAll('.timeline-nav-item[data-mech-nav]');
    let matchCount = 0;

    cards.forEach((card) => {
      const cardEl = card as HTMLElement;
      const cardTags = (cardEl.getAttribute('data-tags') || '').split(' ');
      if (tag === 'all' || cardTags.includes(tag)) {
        cardEl.style.display = 'block';
        matchCount++;
      } else {
        cardEl.style.display = 'none';
      }
    });

    // Also filter the sidebar navigation rail
    railItems.forEach((item) => {
      const itemEl = item as HTMLElement;
      const itemTags = (itemEl.getAttribute('data-tags') || '').split(' ');
      if (tag === 'all' || itemTags.includes(tag)) {
        itemEl.style.display = 'block';
      } else {
        itemEl.style.display = 'none';
      }
    });

    // Update banner
    if (banner && bannerText) {
      if (tag === 'all') {
        banner.style.display = 'none';
        if (railHeader) railHeader.textContent = 'CHRONOLOGY (2014 – 2026)';
      } else {
        banner.style.display = 'flex';
        bannerText.innerHTML = `Filter Active: Showing <strong>${matchCount}</strong> of ${mechanisms.length} mechanisms related to <code>#${tag}</code>`;
        if (railHeader) railHeader.textContent = `MATCHING #${tag.toUpperCase()} (${matchCount})`;

        if (scrollToResults) {
          const match = document.querySelector('.mechanism-card[style*="display: block"]') as HTMLElement | null;
          match?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  }

  filterChips.forEach((chip) => {
    chip.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const tag = target.getAttribute('data-tag') || 'all';
      applyTagFilter(tag, true);
    });
  });

  clearBtn?.addEventListener('click', () => {
    applyTagFilter('all', false);
  });
}

function updateHeroDisplay() {
  const displayBox = document.getElementById('hero-step-display');
  const diagnosisText = document.getElementById('hero-diagnosis-text');
  if (!displayBox) return;

  const currentRes = scaledDotProductAttention(
    Q_sample,
    K_sample,
    V_sample,
    heroScaleEnabled,
    heroMaskEnabled
  );

  displayBox.innerHTML = renderHeroStepContent(heroCurrentStep, currentRes, sampleTokens);

  if (diagnosisText) {
    if (!heroScaleEnabled) {
      diagnosisText.innerHTML = `
        <strong class="text-danger">&#9888; Softmax Saturation Warning:</strong> Scaling is OFF! For large dot products, values reach 4.5+, exponentiating to 90+. Softmax probabilities saturate heavily into 0.000 or 1.000, causing gradients to completely vanish during backpropagation!
      `;
    } else if (!heroMaskEnabled) {
      diagnosisText.innerHTML = `
        <strong class="text-danger">&#9888; Causal Mask Disabled:</strong> Bidirectional attention active. Token 1 ("robot") is directly attending to future tokens ("saw" and "cats"). This is valid for encoders (BERT), but destroys causal autoregressive generation!
      `;
    } else {
      diagnosisText.innerHTML = `
        <strong class="text-success">&#10003; Healthy Baseline:</strong> Scaled by \\(1/\\sqrt{4} = 0.5\\) (variance normalized). Causal mask active (future tokens receive \\(-\\infty\\) &rarr; strictly 0.000 weight).
      `;
    }
  }
}

function initCalculatorListeners() {
  const archSelect = document.getElementById('calc-arch') as HTMLSelectElement | null;
  const seqSlider = document.getElementById('calc-seq-len') as HTMLInputElement | null;
  const seqLabel = document.getElementById('calc-seq-len-val');
  const layersInput = document.getElementById('calc-layers') as HTMLInputElement | null;
  const qHeadsInput = document.getElementById('calc-q-heads') as HTMLInputElement | null;
  const kvHeadsInput = document.getElementById('calc-kv-heads') as HTMLInputElement | null;
  const dHeadInput = document.getElementById('calc-d-head') as HTMLInputElement | null;
  const dtypeSelect = document.getElementById('calc-dtype') as HTMLSelectElement | null;

  const totalMemEl = document.getElementById('calc-total-mem');
  const tokenBytesEl = document.getElementById('calc-token-bytes');
  const bandwidthEl = document.getElementById('calc-bandwidth');
  const maxBatchEl = document.getElementById('calc-max-batch');
  const noteEl = document.getElementById('calc-note');

  function updateCalc() {
    if (!archSelect || !seqSlider || !layersInput || !qHeadsInput || !kvHeadsInput || !dHeadInput || !dtypeSelect) {
      return;
    }

    const arch = archSelect.value as 'mha' | 'gqa' | 'mqa' | 'mla' | 'csa2';
    const seqLen = parseInt(seqSlider.value, 10);
    const layers = parseInt(layersInput.value, 10) || 32;
    const qHeads = parseInt(qHeadsInput.value, 10) || 32;
    let kvHeads = parseInt(kvHeadsInput.value, 10) || 8;
    const dHead = parseInt(dHeadInput.value, 10) || 128;
    const bytesPerElem = parseFloat(dtypeSelect.value) || 2;

    if (arch === 'mha') {
      kvHeads = qHeads;
      kvHeadsInput.value = qHeads.toString();
    } else if (arch === 'mqa') {
      kvHeads = 1;
      kvHeadsInput.value = '1';
    }

    if (seqLabel) {
      seqLabel.textContent = `${seqLen.toLocaleString()} tokens (${(seqLen / 1024).toFixed(0)}K)`;
    }

    const bytesPerToken = calculateKVCacheBytesPerToken({
      type: arch,
      layers,
      q_heads: qHeads,
      kv_heads: kvHeads,
      d_head: dHead,
      bytesPerElement: bytesPerElem,
    });

    const totalBytes = bytesPerToken * seqLen;
    const totalGB = totalBytes / (1024 * 1024 * 1024);
    const totalMB = totalBytes / (1024 * 1024);

    if (totalMemEl) {
      totalMemEl.textContent = totalGB >= 1 ? `${totalGB.toFixed(2)} GB` : `${totalMB.toFixed(1)} MB`;
    }
    if (tokenBytesEl) {
      tokenBytesEl.textContent = `${bytesPerToken.toLocaleString()} Bytes / token`;
    }

    // Decoding bandwidth at 50 tokens/sec
    const bandwidthGBs = (totalBytes * 50) / (1024 * 1024 * 1024);
    if (bandwidthEl) {
      bandwidthEl.textContent = `${bandwidthGBs.toFixed(1)} GB/s`;
    }

    // Maximum concurrent streams fitting inside 80GB H100 (assuming 50GB allocated to cache)
    const maxStreams = totalGB > 0 ? Math.floor(50 / totalGB) : 999;
    if (maxBatchEl) {
      maxBatchEl.textContent = `${Math.max(1, maxStreams)} Streams`;
    }

    if (noteEl) {
      if (arch === 'mha') {
        noteEl.innerHTML = `<strong>MHA Analysis:</strong> Standard MHA allocates 1 KV head per Query head. At 128K context, each stream requires ${(totalGB).toFixed(2)} GB, choking HBM bandwidth and severely limiting concurrent users.`;
      } else if (arch === 'gqa') {
        noteEl.innerHTML = `<strong>GQA Analysis:</strong> Grouping 4 query heads per KV head cuts cache size by 4&times; (${totalGB.toFixed(2)} GB). Recovers &gt;99% MHA accuracy while enabling 4&times; higher throughput.`;
      } else if (arch === 'mla') {
        noteEl.innerHTML = `<strong>MLA Analysis:</strong> DeepSeek low-rank latent compression projects KV down to \\(d_c=512\\), achieving a 93% memory reduction (${totalGB.toFixed(2)} GB) while retaining independent virtual multi-head attention.`;
      } else if (arch === 'csa2') {
        noteEl.innerHTML = `<strong>CSA2 Analysis:</strong> DeepSeek-V4.1 attacks the layer dimension with cross-layer KV sharing and native FP4 storage, compressing the entire model's cache to ~890 Bytes/token (${totalGB.toFixed(2)} GB at 128K).`;
      } else {
        noteEl.innerHTML = `<strong>MQA Analysis:</strong> Single KV head across all 32 query heads yields peak memory reduction (${totalGB.toFixed(2)} GB), but query heads lose independent subspace representation.`;
      }
    }
  }

  [archSelect, seqSlider, layersInput, qHeadsInput, kvHeadsInput, dHeadInput, dtypeSelect].forEach((el) => {
    el?.addEventListener('input', updateCalc);
    el?.addEventListener('change', updateCalc);
  });

  updateCalc();
}

function initPermutationListeners() {
  const btnOrig = document.getElementById('btn-perm-original');
  const btnSwap = document.getElementById('btn-perm-swapped');
  const btnRand = document.getElementById('btn-perm-random');
  const unpositionedContainer = document.getElementById('perm-unpositioned-tokens');
  const positionedContainer = document.getElementById('perm-positioned-tokens');

  function setOrder(words: string[], posIndices: number[]) {
    if (unpositionedContainer) {
      unpositionedContainer.innerHTML = words.map((w) => `<span class="token-pill">${w}</span>`).join(' &rarr; ');
    }
    if (positionedContainer) {
      positionedContainer.innerHTML = words
        .map((w, i) => `<span class="token-pill pill-pos">${w} [pos:${posIndices[i]}]</span>`)
        .join(' &rarr; ');
    }
  }

  btnOrig?.addEventListener('click', () => {
    [btnOrig, btnSwap, btnRand].forEach((b) => b?.classList.remove('active'));
    btnOrig.classList.add('active');
    setOrder(['Cats', 'chase', 'mice'], [0, 1, 2]);
  });

  btnSwap?.addEventListener('click', () => {
    [btnOrig, btnSwap, btnRand].forEach((b) => b?.classList.remove('active'));
    btnSwap.classList.add('active');
    setOrder(['Mice', 'chase', 'cats'], [0, 1, 2]);
  });

  btnRand?.addEventListener('click', () => {
    [btnOrig, btnSwap, btnRand].forEach((b) => b?.classList.remove('active'));
    btnRand.classList.add('active');
    setOrder(['Chase', 'mice', 'cats'], [0, 1, 2]);
  });
}

function initSinksListeners() {
  const slider = document.getElementById('sinks-slider') as HTMLInputElement | null;
  const stepLabel = document.getElementById('sinks-step-label');
  const toggleSinks = document.getElementById('toggle-preserve-sinks') as HTMLInputElement | null;
  const bufferTokensEl = document.getElementById('sinks-buffer-tokens');
  const calloutEl = document.getElementById('sinks-status-callout');

  function updateSinks() {
    if (!slider || !bufferTokensEl || !calloutEl) return;
    const step = parseInt(slider.value, 10);
    const preserveSinks = toggleSinks?.checked ?? true;
    const windowSize = 4;

    if (stepLabel) {
      stepLabel.textContent = `Token Step ${step}`;
    }

    let keptTokens: number[] = [];
    if (preserveSinks) {
      // Kept: sinks (0, 1) + most recent window tokens
      const startWindow = Math.max(2, step - windowSize + 1);
      const windowTokens = [];
      for (let t = startWindow; t <= step; t++) {
        windowTokens.push(t);
      }
      keptTokens = [0, 1, ...windowTokens];
    } else {
      // Naive sliding window (no sinks)
      const startWindow = Math.max(0, step - windowSize + 1);
      for (let t = startWindow; t <= step; t++) {
        keptTokens.push(t);
      }
    }

    bufferTokensEl.innerHTML = keptTokens
      .map((t) => {
        const isSink = t < 2;
        return `<span class="token-pill ${isSink ? 'pill-sink' : 'pill-pos'}">${isSink ? `Sink ${t}` : `Token ${t}`}</span>`;
      })
      .join(' ');

    if (!preserveSinks && step > 5) {
      calloutEl.className = 'callout-box callout-danger';
      calloutEl.innerHTML = `
        <strong class="text-danger">&#9888; Perplexity Explosion (NaN/&infin;):</strong>
        Initial tokens evicted! Without token 0 to absorb excess attention probability mass,
        softmax normalizers become wildly unstable, causing loss and perplexity to explode to infinity!
      `;
    } else {
      calloutEl.className = 'callout-box callout-success';
      calloutEl.innerHTML = `
        <strong class="text-success">&#10003; Stable Streaming Active:</strong>
        Sink tokens 0 and 1 absorb unneeded softmax weights. Tokens 2 to ${Math.max(2, step - windowSize)} have been evicted to save GPU RAM, maintaining a constant ${keptTokens.length}-token cache buffer forever.
      `;
    }
  }

  slider?.addEventListener('input', updateSinks);
  toggleSinks?.addEventListener('change', updateSinks);
  updateSinks();
}

function initScrollSpy() {
  const cards = document.querySelectorAll('.mechanism-card');
  const navItems = document.querySelectorAll('.timeline-nav-item');

  const ledgerName = document.getElementById('ledger-mech-name');
  const ledgerCompute = document.getElementById('ledger-compute');
  const ledgerMemory = document.getElementById('ledger-memory');
  const ledgerExactness = document.getElementById('ledger-exactness');
  const ledgerHardware = document.getElementById('ledger-hardware');
  const ledgerBought = document.getElementById('ledger-bought-list');
  const ledgerBill = document.getElementById('ledger-bill-list');

  const mechMap = new Map(mechanisms.map((m) => [m.id, m]));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const cardId = entry.target.getAttribute('data-mech-id');
          if (!cardId) return;

          const mech = mechMap.get(cardId);
          if (!mech) return;

          // Highlight Nav Rail
          navItems.forEach((item) => {
            if (item.getAttribute('data-mech-nav') === cardId) {
              item.classList.add('active');
            } else {
              item.classList.remove('active');
            }
          });

          // Highlight card border
          cards.forEach((c) => c.classList.remove('active-card'));
          entry.target.classList.add('active-card');

          // Update Persistent Cost Ledger
          if (ledgerName) ledgerName.textContent = mech.name;
          if (ledgerCompute) ledgerCompute.textContent = mech.metrics.compute_prefill;
          if (ledgerMemory) ledgerMemory.textContent = mech.metrics.kv_cache_per_token;
          if (ledgerExactness) ledgerExactness.textContent = mech.metrics.long_range_exactness;
          if (ledgerHardware) ledgerHardware.textContent = mech.metrics.hardware_friendliness;

          if (ledgerBought) {
            ledgerBought.innerHTML = mech.what_it_buys.slice(0, 2).map((b) => `<li>${b}</li>`).join('');
          }
          if (ledgerBill) {
            ledgerBill.innerHTML = mech.what_it_gives_up.slice(0, 2).map((g) => `<li>${g}</li>`).join('');
          }
        }
      });
    },
    { rootMargin: '-20% 0px -60% 0px', threshold: 0.1 }
  );

  cards.forEach((card) => observer.observe(card));
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', renderApp);
