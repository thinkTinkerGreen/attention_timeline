// Persistent Cost Ledger Component (Section 3.4)
// Always-visible / sticky panel tracking current mechanism's exact costs against a stated reference configuration

import { Mechanism } from '../types';

export function renderCostLedger(activeMech: Mechanism): string {
  return `
  <aside id="cost-ledger" class="cost-ledger-panel" aria-label="Persistent Cost Ledger">
    <div class="ledger-header">
      <div class="ledger-title-group">
        <span class="ledger-tag">LIVE COST LEDGER</span>
        <h3 id="ledger-mech-name">${activeMech.name}</h3>
      </div>
      <div class="ledger-reference">
        <strong>Reference Spec:</strong> 32 Layers &bull; 32 Query Heads &bull; \(d_h=128\) &bull; FP16
      </div>
    </div>

    <div class="ledger-metrics-grid">
      <!-- Prefill Compute -->
      <div class="ledger-metric-card">
        <div class="metric-card-header">
          <span class="metric-icon">⚡</span>
          <span class="metric-name">Prefill Compute Complexity</span>
        </div>
        <div id="ledger-compute" class="metric-card-value font-mono">
          ${activeMech.metrics.compute_prefill}
        </div>
        <div class="metric-card-note">Scaling with sequence length \(N\)</div>
      </div>

      <!-- KV Cache Memory -->
      <div class="ledger-metric-card">
        <div class="metric-card-header">
          <span class="metric-icon">💾</span>
          <span class="metric-name">KV Cache Memory / Token</span>
        </div>
        <div id="ledger-memory" class="metric-card-value font-mono">
          ${activeMech.metrics.kv_cache_per_token}
        </div>
        <div class="metric-card-note">GPU HBM consumption per generated step</div>
      </div>

      <!-- Exactness of Long-Range Recall -->
      <div class="ledger-metric-card">
        <div class="metric-card-header">
          <span class="metric-icon">🎯</span>
          <span class="metric-name">Long-Range Recall Fidelity</span>
        </div>
        <div id="ledger-exactness" class="metric-card-value">
          ${activeMech.metrics.long_range_exactness}
        </div>
        <div class="metric-card-note">Exact global vs windowed vs lossy recurrent</div>
      </div>

      <!-- Hardware Friendliness -->
      <div class="ledger-metric-card">
        <div class="metric-card-header">
          <span class="metric-icon">⚙️</span>
          <span class="metric-name">Hardware & Kernel Efficiency</span>
        </div>
        <div id="ledger-hardware" class="metric-card-value">
          ${activeMech.metrics.hardware_friendliness}
        </div>
        <div class="metric-card-note">Dense GEMM, FlashAttention, or custom Triton</div>
      </div>
    </div>

    <!-- Active Trade-off Summary -->
    <div class="ledger-tradeoff-summary">
      <div class="tradeoff-col bought-col">
        <span class="tradeoff-badge bought-badge">&plus; What It Bought</span>
        <ul id="ledger-bought-list" class="ledger-list">
          ${activeMech.what_it_buys.slice(0, 2).map((b) => `<li>${b}</li>`).join('')}
        </ul>
      </div>
      <div class="tradeoff-col bill-col">
        <span class="tradeoff-badge bill-badge">&minus; The Bill (Cost Paid)</span>
        <ul id="ledger-bill-list" class="ledger-list">
          ${activeMech.what_it_gives_up.slice(0, 2).map((g) => `<li>${g}</li>`).join('')}
        </ul>
      </div>
    </div>
  </aside>
  `;
}
