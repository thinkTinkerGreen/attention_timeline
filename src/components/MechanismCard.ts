// Mechanism Card Component (Section 3.2 & Section 4)
// Renders the strict 7-beat causal narrative:
// The World Before -> The Pressure -> The Move -> What It Bought -> The Bill -> The Next Pressure -> Choose/Avoid

import { Mechanism } from '../types';

export function renderMechanismCard(m: Mechanism, allMechs: Mechanism[]): string {
  const idToMech = new Map(allMechs.map((item) => [item.id, item]));

  // Build backlinks for "The World Before"
  const beforeLinks = m.responds_to
    .map((prevId) => {
      const prev = idToMech.get(prevId);
      if (!prev) return '';
      return `<a href="#mech-${prev.id}" class="causal-link back-link" title="Jump back to ${prev.name}">&larr; ${prev.name} (${prev.first_appearance.date.slice(0, 4)})</a>`;
    })
    .filter(Boolean)
    .join(' ');

  // Build forward links for "The Next Pressure"
  const nextLinks = m.next_pressure
    .map((nextId) => {
      const nxt = idToMech.get(nextId);
      if (!nxt) return '';
      return `<a href="#mech-${nxt.id}" class="causal-link fwd-link" title="Jump forward to ${nxt.name}">${nxt.name} (${nxt.first_appearance.date.slice(0, 4)}) &rarr;</a>`;
    })
    .filter(Boolean)
    .join(' ');

  const dateBadgeClass = m.date_status === 'VERIFIED' ? 'badge-verified' : 'badge-unverified';

  return `
  <article id="mech-${m.id}" class="mechanism-card" data-mech-id="${m.id}" data-tags="${m.tags.join(' ')}">
    <!-- Card Header -->
    <header class="card-header">
      <div class="card-meta-top">
        <span class="card-date font-mono">
          <time datetime="${m.first_appearance.date}">${m.first_appearance.date}</time>
        </span>
        <span class="card-event-badge">${m.first_appearance.event}</span>
        <span class="status-badge ${dateBadgeClass}">
          ${m.date_status === 'VERIFIED' ? '&#10003; VERIFIED' : '&#9888; UNVERIFIED'}
        </span>
        <a href="${m.first_appearance.primary_url}" target="_blank" rel="noopener noreferrer" class="primary-source-link" title="Open primary source verification link">
          Primary Source &UpperRightArrow;
        </a>
      </div>

      <h3 class="card-title">${m.name}</h3>
      <div class="card-authors font-mono text-muted">
        ${m.authors_org}
      </div>

      <!-- Tag chips -->
      <div class="card-tags">
        ${m.tags.map((t) => `<span class="tag-chip tag-${t}">#${t}</span>`).join(' ')}
      </div>
    </header>

    <!-- 7-Beat Causal Story Spine -->
    <div class="card-body">
      <!-- 1. The World Before -->
      <section class="beat-section beat-before">
        <h4 class="beat-title">
          <span class="beat-num">1</span> THE WORLD BEFORE
        </h4>
        <div class="beat-content">
          ${beforeLinks ? `<div class="backlinks-row">${beforeLinks}</div>` : '<p class="text-muted">Originating sequence baseline (prior art).</p>'}
        </div>
      </section>

      <!-- 2. The Pressure -->
      <section class="beat-section beat-pressure">
        <h4 class="beat-title">
          <span class="beat-num">2</span> THE PRESSURE
        </h4>
        <div class="beat-content pressure-highlight">
          <p>${m.pressure}</p>
        </div>
      </section>

      <!-- 3. The Move -->
      <section class="beat-section beat-move">
        <h4 class="beat-title">
          <span class="beat-num">3</span> THE MOVE (THE MECHANISM)
        </h4>
        <div class="beat-content">
          <p>${m.mechanism}</p>
        </div>
      </section>

      <!-- SVG Mechanism Figure -->
      <figure class="card-figure">
        ${renderCardFigure(m.id)}
      </figure>

      <!-- 4. What It Bought -->
      <section class="beat-section beat-bought">
        <h4 class="beat-title">
          <span class="beat-num">4</span> WHAT IT BOUGHT (BENEFITS)
        </h4>
        <ul class="bought-list">
          ${m.what_it_buys.map((b) => `<li><strong>&plus;</strong> ${b}</li>`).join('')}
        </ul>
      </section>

      <!-- 5. The Bill -->
      <section class="beat-section beat-bill">
        <h4 class="beat-title">
          <span class="beat-num">5</span> THE BILL (NEW FAILURE MODE / DOWNSIDE)
        </h4>
        <ul class="bill-list">
          ${m.what_it_gives_up.map((g) => `<li><strong>&minus;</strong> ${g}</li>`).join('')}
        </ul>
      </section>

      <!-- 6. The Next Pressure -->
      <section class="beat-section beat-next">
        <h4 class="beat-title">
          <span class="beat-num">6</span> THE NEXT PRESSURE
        </h4>
        <div class="beat-content">
          ${nextLinks ? `<div class="fwdlinks-row">${nextLinks}</div>` : '<p class="text-muted">Current state of the art; active research frontier.</p>'}
        </div>
      </section>

      <!-- 7. Workload Decision Guidance -->
      <section class="beat-section beat-decision">
        <h4 class="beat-title">
          <span class="beat-num">7</span> WORKLOAD DECISION GUIDANCE
        </h4>
        <div class="decision-grid">
          <div class="decision-box choose-box">
            <span class="decision-label choose-label">&#10004; Choose When:</span>
            <ul>
              ${m.choose_when.map((c) => `<li>${c}</li>`).join('')}
            </ul>
          </div>
          <div class="decision-box avoid-box">
            <span class="decision-label avoid-label">&#10008; Avoid When:</span>
            <ul>
              ${m.avoid_when.map((a) => `<li>${a}</li>`).join('')}
            </ul>
          </div>
        </div>
      </section>
    </div>

    <!-- Verification Footer Note -->
    <footer class="card-footer font-mono text-muted">
      <span>Verified on ${m.verified_on}: ${m.verification_note}</span>
    </footer>
  </article>
  `;
}

function renderCardFigure(mechId: string): string {
  // Pure inline SVGs providing clear, static visual explanations
  switch (mechId) {
    case 'convs2s-learned-pos':
      return `
        <svg viewBox="0 0 600 120" class="mech-svg" role="img" aria-label="Learned Absolute Position Vector Addition">
          <rect x="20" y="30" width="160" height="60" rx="8" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>
          <text x="100" y="55" fill="#f8fafc" text-anchor="middle" font-size="14" font-weight="bold">Word Embedding e_i</text>
          <text x="100" y="75" fill="#94a3b8" text-anchor="middle" font-size="12">R^d</text>

          <text x="210" y="65" fill="#38bdf8" text-anchor="middle" font-size="24" font-weight="bold">+</text>

          <rect x="240" y="30" width="160" height="60" rx="8" fill="#1e293b" stroke="#ec4899" stroke-width="2"/>
          <text x="320" y="55" fill="#f8fafc" text-anchor="middle" font-size="14" font-weight="bold">Learned Pos p_i</text>
          <text x="320" y="75" fill="#94a3b8" text-anchor="middle" font-size="12">From P in R^{L_max x d}</text>

          <text x="430" y="65" fill="#38bdf8" text-anchor="middle" font-size="24" font-weight="bold">=</text>

          <rect x="460" y="30" width="120" height="60" rx="8" fill="#0f172a" stroke="#10b981" stroke-width="2"/>
          <text x="520" y="65" fill="#10b981" text-anchor="middle" font-size="16" font-weight="bold">x_i in R^d</text>
        </svg>
      `;

    case 'sinusoidal-pos':
      return `
        <svg viewBox="0 0 600 130" class="mech-svg" role="img" aria-label="Sinusoidal Geometric Frequencies">
          <path d="M 30 65 Q 90 10, 150 65 T 270 65 T 390 65 T 510 65" fill="none" stroke="#38bdf8" stroke-width="3"/>
          <path d="M 30 65 Q 60 30, 90 65 T 150 65 T 210 65 T 270 65 T 330 65 T 390 65 T 450 65 T 510 65" fill="none" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="4"/>
          <text x="30" y="115" fill="#94a3b8" font-size="12">Low Freq: sin(pos / 10000^{2i/d}) (Global)</text>
          <text x="350" y="115" fill="#94a3b8" font-size="12">High Freq: sin(pos / 10000^{0}) (Local)</text>
        </svg>
      `;

    case 'rope':
      return `
        <svg viewBox="0 0 600 150" class="mech-svg" role="img" aria-label="Rotary Position Embedding 2D Vector Rotation">
          <circle cx="150" cy="75" r="55" fill="none" stroke="#334155" stroke-width="2"/>
          <line x1="150" y1="75" x2="195" y2="40" stroke="#38bdf8" stroke-width="3"/>
          <circle cx="195" cy="40" r="4" fill="#38bdf8"/>
          <text x="205" y="40" fill="#38bdf8" font-size="13" font-weight="bold">R_m q</text>

          <line x1="150" y1="75" x2="185" y2="105" stroke="#ec4899" stroke-width="3"/>
          <circle cx="185" cy="105" r="4" fill="#ec4899"/>
          <text x="195" y="110" fill="#ec4899" font-size="13" font-weight="bold">R_n k</text>

          <path d="M 175 55 A 35 35 0 0 1 170 95" fill="none" stroke="#f59e0b" stroke-width="2"/>
          <text x="310" y="60" fill="#f8fafc" font-size="14" font-weight="bold">&lang; R_m q, R_n k &rang; = q^T R_{n-m} k</text>
          <text x="310" y="85" fill="#94a3b8" font-size="12">Score depends purely on relative offset (n - m)</text>
          <text x="310" y="105" fill="#10b981" font-size="12">&#10003; Norms perfectly preserved by orthogonal rotation</text>
        </svg>
      `;

    case 'alibi':
      return `
        <svg viewBox="0 0 600 130" class="mech-svg" role="img" aria-label="ALiBi Linear Distance Slope">
          <line x1="50" y1="30" x2="550" y2="30" stroke="#475569" stroke-width="1"/>
          <line x1="50" y1="30" x2="500" y2="110" stroke="#f43f5e" stroke-width="3"/>
          <line x1="50" y1="30" x2="500" y2="80" stroke="#fbbf24" stroke-width="2"/>
          <line x1="50" y1="30" x2="500" y2="55" stroke="#38bdf8" stroke-width="2"/>
          <text x="510" y="115" fill="#f43f5e" font-size="11">Head 1 (m=2^-1)</text>
          <text x="510" y="85" fill="#fbbf24" font-size="11">Head 4 (m=2^-4)</text>
          <text x="510" y="60" fill="#38bdf8" font-size="11">Head 8 (m=2^-8)</text>
          <text x="50" y="125" fill="#94a3b8" font-size="11">Query position i &rarr; past token distance |i - j|</text>
        </svg>
      `;

    case 'mqa':
      return `
        <svg viewBox="0 0 600 130" class="mech-svg" role="img" aria-label="Multi-Query Attention Architecture">
          <!-- Query Heads -->
          <rect x="30" y="20" width="80" height="22" rx="4" fill="#3b82f6"/>
          <text x="70" y="35" fill="#fff" font-size="10" text-anchor="middle">Q Head 1</text>
          <rect x="30" y="47" width="80" height="22" rx="4" fill="#3b82f6"/>
          <text x="70" y="62" fill="#fff" font-size="10" text-anchor="middle">Q Head 2</text>
          <rect x="30" y="74" width="80" height="22" rx="4" fill="#3b82f6"/>
          <text x="70" y="89" fill="#fff" font-size="10" text-anchor="middle">Q Head ...</text>
          <rect x="30" y="101" width="80" height="22" rx="4" fill="#3b82f6"/>
          <text x="70" y="116" fill="#fff" font-size="10" text-anchor="middle">Q Head 32</text>

          <!-- Shared Single KV Head -->
          <line x1="120" y1="30" x2="260" y2="65" stroke="#64748b" stroke-width="2"/>
          <line x1="120" y1="60" x2="260" y2="65" stroke="#64748b" stroke-width="2"/>
          <line x1="120" y1="85" x2="260" y2="65" stroke="#64748b" stroke-width="2"/>
          <line x1="120" y1="110" x2="260" y2="65" stroke="#64748b" stroke-width="2"/>

          <rect x="270" y="35" width="130" height="60" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
          <text x="335" y="60" fill="#10b981" text-anchor="middle" font-size="13" font-weight="bold">Single Shared K</text>
          <text x="335" y="80" fill="#10b981" text-anchor="middle" font-size="13" font-weight="bold">Single Shared V</text>

          <text x="440" y="65" fill="#f8fafc" font-size="13" font-weight="bold">32x Smaller KV Cache</text>
          <text x="440" y="85" fill="#94a3b8" font-size="11">524 KB &rarr; 16 KB / token</text>
        </svg>
      `;

    case 'gqa':
      return `
        <svg viewBox="0 0 600 130" class="mech-svg" role="img" aria-label="Grouped-Query Attention Architecture">
          <!-- 4 Query Heads grouped to 1 KV head -->
          <rect x="30" y="15" width="70" height="18" rx="4" fill="#3b82f6"/>
          <rect x="30" y="37" width="70" height="18" rx="4" fill="#3b82f6"/>
          <rect x="30" y="59" width="70" height="18" rx="4" fill="#3b82f6"/>
          <rect x="30" y="81" width="70" height="18" rx="4" fill="#3b82f6"/>
          <text x="65" y="115" fill="#94a3b8" font-size="11" text-anchor="middle">Group 1 (4 Qs)</text>

          <line x1="110" y1="55" x2="180" y2="55" stroke="#64748b" stroke-width="2"/>
          <rect x="190" y="30" width="100" height="50" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
          <text x="240" y="52" fill="#10b981" text-anchor="middle" font-size="12" font-weight="bold">KV Group 1</text>
          <text x="240" y="70" fill="#94a3b8" text-anchor="middle" font-size="10">Shared 1 Key, 1 Val</text>

          <text x="340" y="55" fill="#f8fafc" font-size="14" font-weight="bold">Optimal Sweet Spot</text>
          <text x="340" y="75" fill="#94a3b8" font-size="12">8 KV heads for 32 Q heads &bull; 4x-8x memory compression</text>
          <text x="340" y="95" fill="#10b981" font-size="12">&#10003; 99% MHA quality recovered</text>
        </svg>
      `;

    case 'mla':
      return `
        <svg viewBox="0 0 600 140" class="mech-svg" role="img" aria-label="Multi-Head Latent Attention Architecture">
          <rect x="30" y="35" width="150" height="70" rx="8" fill="#1e293b" stroke="#8b5cf6" stroke-width="2"/>
          <text x="105" y="60" fill="#a78bfa" text-anchor="middle" font-size="14" font-weight="bold">Latent KV c_t^{KV}</text>
          <text x="105" y="80" fill="#94a3b8" text-anchor="middle" font-size="11">Compressed dim d_c=512</text>
          <text x="105" y="95" fill="#10b981" text-anchor="middle" font-size="10">Cached in RAM</text>

          <text x="200" y="75" fill="#38bdf8" font-size="20" font-weight="bold">&plus;</text>

          <rect x="230" y="35" width="130" height="70" rx="8" fill="#1e293b" stroke="#ec4899" stroke-width="2"/>
          <text x="295" y="60" fill="#f472b6" text-anchor="middle" font-size="14" font-weight="bold">Decoupled RoPE</text>
          <text x="295" y="80" fill="#94a3b8" text-anchor="middle" font-size="11">k_t^R (dim d_R=64)</text>
          <text x="295" y="95" fill="#94a3b8" text-anchor="middle" font-size="10">Positional vector</text>

          <path d="M 370 70 L 430 70" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
          <text x="440" y="60" fill="#f8fafc" font-size="13" font-weight="bold">Matrix Absorption</text>
          <text x="440" y="80" fill="#94a3b8" font-size="11">W_UK absorbed into Q</text>
          <text x="440" y="100" fill="#10b981" font-size="11">93% KV Cache Reduction</text>
        </svg>
      `;

    case 'linear-attention':
      return `
        <svg viewBox="0 0 600 130" class="mech-svg" role="img" aria-label="Linear Attention Recurrent State Matrix">
          <rect x="30" y="30" width="120" height="70" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
          <text x="90" y="60" fill="#38bdf8" text-anchor="middle" font-size="14" font-weight="bold">State S_{t-1}</text>
          <text x="90" y="80" fill="#94a3b8" text-anchor="middle" font-size="12">Matrix in R^{d x d}</text>

          <text x="170" y="70" fill="#38bdf8" font-size="24" font-weight="bold">+</text>

          <rect x="200" y="30" width="140" height="70" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
          <text x="270" y="60" fill="#f59e0b" text-anchor="middle" font-size="14" font-weight="bold">&phi;(k_t) v_t^T</text>
          <text x="270" y="80" fill="#94a3b8" text-anchor="middle" font-size="12">Outer product</text>

          <text x="360" y="70" fill="#38bdf8" font-size="24" font-weight="bold">=</text>

          <rect x="390" y="30" width="120" height="70" rx="8" fill="#0f172a" stroke="#10b981" stroke-width="2"/>
          <text x="450" y="60" fill="#10b981" text-anchor="middle" font-size="14" font-weight="bold">State S_t</text>
          <text x="450" y="80" fill="#94a3b8" text-anchor="middle" font-size="12">O(1) Memory</text>
        </svg>
      `;

    case 'delta-rule-linear':
    case 'gated-deltanet':
      return `
        <svg viewBox="0 0 600 140" class="mech-svg" role="img" aria-label="Delta Rule Predict-Compare-Correct Update">
          <rect x="20" y="25" width="160" height="85" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
          <text x="100" y="50" fill="#38bdf8" text-anchor="middle" font-size="13" font-weight="bold">1. Predict & Compare</text>
          <text x="100" y="72" fill="#f8fafc" text-anchor="middle" font-size="12">y_hat = S_{t-1} k_t</text>
          <text x="100" y="92" fill="#ef4444" text-anchor="middle" font-size="12">err = y_hat - v_t</text>

          <path d="M 190 65 L 230 65" stroke="#64748b" stroke-width="2"/>

          <rect x="240" y="25" width="180" height="85" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
          <text x="330" y="50" fill="#10b981" text-anchor="middle" font-size="13" font-weight="bold">2. Corrective Erase & Write</text>
          <text x="330" y="72" fill="#f8fafc" text-anchor="middle" font-size="12">S_t = S_{t-1} - &beta;_t (err &otimes; k_t)</text>
          <text x="330" y="92" fill="#10b981" text-anchor="middle" font-size="11">&#10003; Erases conflicting memories</text>

          <text x="460" y="60" fill="#f59e0b" font-size="13" font-weight="bold">Gated DeltaNet:</text>
          <text x="460" y="80" fill="#94a3b8" font-size="11">Multiplies S_{t-1} by &alpha;_t</text>
          <text x="460" y="98" fill="#94a3b8" font-size="11">(input-dependent forget gate)</text>
        </svg>
      `;

    case 'csa-deepseek-v4':
    case 'csa2-deepseek-v4-1':
      return `
        <svg viewBox="0 0 600 140" class="mech-svg" role="img" aria-label="Compressed Sparse Attention 2 Architecture">
          <rect x="20" y="25" width="160" height="90" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
          <text x="100" y="48" fill="#38bdf8" text-anchor="middle" font-size="12" font-weight="bold">Full Mode Layers</text>
          <text x="100" y="68" fill="#94a3b8" text-anchor="middle" font-size="10">Computes KV & Indices</text>
          <text x="100" y="88" fill="#10b981" text-anchor="middle" font-size="10">m:1 Sequence Pooling</text>

          <rect x="200" y="25" width="160" height="90" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
          <text x="280" y="48" fill="#f59e0b" text-anchor="middle" font-size="12" font-weight="bold">Reindex Mode</text>
          <text x="280" y="68" fill="#94a3b8" text-anchor="middle" font-size="10">Reuses Prior Layer KV</text>
          <text x="280" y="88" fill="#94a3b8" text-anchor="middle" font-size="10">Rescores with Local Q</text>

          <rect x="380" y="25" width="160" height="90" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
          <text x="460" y="48" fill="#10b981" text-anchor="middle" font-size="12" font-weight="bold">Reuse Mode</text>
          <text x="460" y="68" fill="#94a3b8" text-anchor="middle" font-size="10">Reuses KV AND Indices</text>
          <text x="460" y="88" fill="#10b981" text-anchor="middle" font-size="11" font-weight="bold">FP4 KV: 890 B / token</text>
        </svg>
      `;

    default:
      return `
        <svg viewBox="0 0 600 80" class="mech-svg" role="img" aria-label="Attention Mechanism Schematic">
          <rect x="50" y="20" width="500" height="40" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
          <text x="300" y="45" fill="#94a3b8" text-anchor="middle" font-size="13">Attention Schematic: ${mechId}</text>
        </svg>
      `;
  }
}
