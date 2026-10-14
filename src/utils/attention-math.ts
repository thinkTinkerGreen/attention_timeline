// Numerical Attention Math Implementation & Calculators
// Strict numerical fidelity matching paper equations

export function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  if (sum === 0) return logits.map(() => 1 / logits.length);
  return exps.map((e) => e / sum);
}

export interface AttentionStepResult {
  scoresRaw: number[][];
  scoresScaled: number[][];
  scoresMasked: number[][];
  weights: number[][];
  output: number[][];
}

export function scaledDotProductAttention(
  Q: number[][],
  K: number[][],
  V: number[][],
  scale = true,
  causalMask = true
): AttentionStepResult {
  const seqLen = Q.length;
  const d_k = Q[0].length;
  const sqrtD = scale ? Math.sqrt(d_k) : 1.0;

  const scoresRaw: number[][] = [];
  const scoresScaled: number[][] = [];
  const scoresMasked: number[][] = [];
  const weights: number[][] = [];
  const output: number[][] = [];

  for (let i = 0; i < seqLen; i++) {
    scoresRaw[i] = [];
    scoresScaled[i] = [];
    scoresMasked[i] = [];
    for (let j = 0; j < seqLen; j++) {
      let dot = 0;
      for (let d = 0; d < d_k; d++) {
        dot += Q[i][d] * K[j][d];
      }
      scoresRaw[i][j] = dot;
      scoresScaled[i][j] = dot / sqrtD;

      if (causalMask && j > i) {
        scoresMasked[i][j] = -1e9;
      } else {
        scoresMasked[i][j] = scoresScaled[i][j];
      }
    }

    weights[i] = softmax(scoresMasked[i]);

    output[i] = [];
    const d_v = V[0].length;
    for (let d = 0; d < d_v; d++) {
      let sum = 0;
      for (let j = 0; j < seqLen; j++) {
        sum += weights[i][j] * V[j][d];
      }
      output[i][d] = sum;
    }
  }

  return { scoresRaw, scoresScaled, scoresMasked, weights, output };
}

// 2D Rotary Position Embedding (RoPE)
export function applyRoPE(vec: number[], pos: number, base = 10000): number[] {
  const d = vec.length;
  const out = [...vec];
  for (let i = 0; i < d; i += 2) {
    const theta = 1.0 / Math.pow(base, i / d);
    const mTheta = pos * theta;
    const cos = Math.cos(mTheta);
    const sin = Math.sin(mTheta);

    const x0 = vec[i];
    const x1 = vec[i + 1] ?? 0;

    out[i] = x0 * cos - x1 * sin;
    out[i + 1] = x0 * sin + x1 * cos;
  }
  return out;
}

// KV Cache Size Calculator
export interface KVCacheParams {
  type: 'mha' | 'gqa' | 'mqa' | 'mla' | 'csa2';
  layers: number;
  q_heads: number;
  kv_heads: number;
  d_head: number;
  bytesPerElement: number; // 2 for fp16, 1 for fp8, 0.5 for fp4
  d_c?: number; // MLA compressed latent dimension (default 512)
  d_R?: number; // MLA decoupled RoPE dimension (default 64)
}

export function calculateKVCacheBytesPerToken(params: KVCacheParams): number {
  const { type, layers, kv_heads, d_head, bytesPerElement, d_c = 512, d_R = 64 } = params;

  if (type === 'mla') {
    // DeepSeek-V2 / V3: layers * (d_c + d_R) * bytes
    return layers * (d_c + d_R) * bytesPerElement;
  }

  if (type === 'csa2') {
    // DeepSeek-V4.1-Flash: ~890 bytes per token global across entire model in FP4 with layer sharing
    return 890;
  }

  // MHA / GQA / MQA: 2 (K and V) * layers * kv_heads * d_head * bytesPerElement
  return 2 * layers * kv_heads * d_head * bytesPerElement;
}

// Linear Attention Feature Map: phi(x) = elu(x) + 1
export function featureMapELU(vec: number[]): number[] {
  return vec.map((x) => (x > 0 ? x + 1 : Math.exp(x)));
}

// Linear Attention: Autoregressive Parallel Scan
export function linearAttentionParallel(Q: number[][], K: number[][], V: number[][]): number[][] {
  const seqLen = Q.length;
  const d_k = Q[0].length;
  const d_v = V[0].length;

  const phiQ = Q.map(featureMapELU);
  const phiK = K.map(featureMapELU);

  const outputs: number[][] = [];

  for (let i = 0; i < seqLen; i++) {
    // Compute prefix sum S_i = sum_{j=0}^i phiK_j * V_j^T
    const S: number[][] = Array.from({ length: d_k }, () => Array(d_v).fill(0));
    const z: number[] = Array(d_k).fill(0);

    for (let j = 0; j <= i; j++) {
      for (let k = 0; k < d_k; k++) {
        z[k] += phiK[j][k];
        for (let v = 0; v < d_v; v++) {
          S[k][v] += phiK[j][k] * V[j][v];
        }
      }
    }

    // Multiply phiQ_i with S
    const out_i: number[] = Array(d_v).fill(0);
    let normalizer = 0;
    for (let k = 0; k < d_k; k++) {
      normalizer += phiQ[i][k] * z[k];
      for (let v = 0; v < d_v; v++) {
        out_i[v] += phiQ[i][k] * S[k][v];
      }
    }

    outputs[i] = normalizer > 0 ? out_i.map((val) => val / normalizer) : out_i;
  }

  return outputs;
}

// Linear Attention: Recurrent O(1) state step
export function linearAttentionRecurrent(Q: number[][], K: number[][], V: number[][]): number[][] {
  const seqLen = Q.length;
  const d_k = Q[0].length;
  const d_v = V[0].length;

  const phiQ = Q.map(featureMapELU);
  const phiK = K.map(featureMapELU);

  const outputs: number[][] = [];
  const S: number[][] = Array.from({ length: d_k }, () => Array(d_v).fill(0));
  const z: number[] = Array(d_k).fill(0);

  for (let i = 0; i < seqLen; i++) {
    // State update
    for (let k = 0; k < d_k; k++) {
      z[k] += phiK[i][k];
      for (let v = 0; v < d_v; v++) {
        S[k][v] += phiK[i][k] * V[i][v];
      }
    }

    // Query computation
    const out_i: number[] = Array(d_v).fill(0);
    let normalizer = 0;
    for (let k = 0; k < d_k; k++) {
      normalizer += phiQ[i][k] * z[k];
      for (let v = 0; v < d_v; v++) {
        out_i[v] += phiQ[i][k] * S[k][v];
      }
    }

    outputs[i] = normalizer > 0 ? out_i.map((val) => val / normalizer) : out_i;
  }

  return outputs;
}

// Delta Rule recurrent step: S_t = S_{t-1}(I - beta * k * k^T) + beta * v * k^T
// Equivalent to: S_t = S_{t-1} - beta * (S_{t-1} k - v) k^T
export function deltaRuleRecurrent(
  S_prev: number[][],
  k: number[],
  v: number[],
  beta: number
): number[][] {
  const d_k = k.length;
  const d_v = v.length;

  // Predict: y_hat = S_prev * k (shape d_v)
  const y_hat: number[] = Array(d_v).fill(0);
  for (let r = 0; r < d_v; r++) {
    for (let c = 0; c < d_k; c++) {
      y_hat[r] += S_prev[r][c] * k[c];
    }
  }

  // Error delta: err = y_hat - v (shape d_v)
  const err = y_hat.map((val, idx) => val - v[idx]);

  // Next state: S_next = S_prev - beta * err * k^T
  const S_next: number[][] = Array.from({ length: d_v }, () => Array(d_k).fill(0));
  for (let r = 0; r < d_v; r++) {
    for (let c = 0; c < d_k; c++) {
      S_next[r][c] = S_prev[r][c] - beta * err[r] * k[c];
    }
  }

  return S_next;
}

// Top-k index selection
export function topKSelection(scores: number[], k: number): { index: number; value: number }[] {
  return scores
    .map((val, idx) => ({ index: idx, value: val }))
    .sort((a, b) => b.value - a.value)
    .slice(0, k);
}
