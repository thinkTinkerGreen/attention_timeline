import { describe, it, expect } from 'vitest';
import {
  softmax,
  scaledDotProductAttention,
  applyRoPE,
  calculateKVCacheBytesPerToken,
  linearAttentionParallel,
  linearAttentionRecurrent,
  deltaRuleRecurrent,
  topKSelection,
} from '../src/utils/attention-math';

describe('Numerical Correctness Tests (Section 7)', () => {
  it('softmax rows sum to 1.0 within numerical epsilon', () => {
    const logits = [2.0, 1.0, 0.1, -1.5];
    const probs = softmax(logits);
    const sum = probs.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 5);
    probs.forEach((p) => {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1.0);
    });
  });

  it('masked positions receive exactly 0.0 weight in causal attention', () => {
    const Q = [[1, 0], [0, 1]];
    const K = [[1, 0], [0, 1]];
    const V = [[10, 20], [30, 40]];
    const { weights } = scaledDotProductAttention(Q, K, V, true, true);
    // In causal mask for 2 tokens:
    // row 0: token 0 can only attend to token 0 (token 1 is masked)
    expect(weights[0][1]).toBe(0.0);
    expect(weights[0][0]).toBeCloseTo(1.0, 5);
  });

  it('scaling by 1/sqrt(d_k) normalizes variance of dot products', () => {
    const d_k = 64;
    // Generate two independent standard normal vectors of dimension d_k
    // E[q_i * k_i] = 0, Var(q_i * k_i) = 1 => Var(sum) = d_k
    // Scaled dot product: Var(dot / sqrt(d_k)) = d_k / d_k = 1
    let unscaledVarianceSum = 0;
    let scaledVarianceSum = 0;
    const trials = 1000;
    for (let t = 0; t < trials; t++) {
      let dot = 0;
      for (let i = 0; i < d_k; i++) {
        // pseudo-random unit variance components using Box-Muller
        const u1 = Math.random() || 0.001;
        const u2 = Math.random() || 0.001;
        const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        const z2 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
        dot += z1 * z2;
      }
      unscaledVarianceSum += dot * dot;
      const scaled = dot / Math.sqrt(d_k);
      scaledVarianceSum += scaled * scaled;
    }
    const empiricalUnscaledVar = unscaledVarianceSum / trials;
    const empiricalScaledVar = scaledVarianceSum / trials;

    // Unscaled variance should be close to d_k = 64
    expect(empiricalUnscaledVar).toBeGreaterThan(45);
    expect(empiricalUnscaledVar).toBeLessThan(85);
    // Scaled variance should be close to 1.0
    expect(empiricalScaledVar).toBeGreaterThan(0.7);
    expect(empiricalScaledVar).toBeLessThan(1.3);
  });

  it('RoPE relative-offset property: <R_m q, R_n k> == <q, R_{n-m} k>', () => {
    const q = [1.2, 0.8, -0.5, 2.1];
    const k = [0.4, -1.1, 1.8, 0.3];
    const posM = 7;
    const posN = 4;
    const offset = posN - posM; // -3

    const qRotM = applyRoPE(q, posM);
    const kRotN = applyRoPE(k, posN);

    // Inner product of R_m q and R_n k
    const innerProduct1 = qRotM.reduce((sum, val, idx) => sum + val * kRotN[idx], 0);

    // Inner product of unrotated q with R_{n-m} k
    const kRotOffset = applyRoPE(k, offset);
    const innerProduct2 = q.reduce((sum, val, idx) => sum + val * kRotOffset[idx], 0);

    expect(innerProduct1).toBeCloseTo(innerProduct2, 5);
  });

  it('GQA reduces to MHA when kv_heads == q_heads, and MQA when kv_heads == 1', () => {
    const layers = 32;
    const heads = 32;
    const d_head = 128;
    const bytesPerElement = 2; // fp16

    // MHA: 32 KV heads
    const mhaBytes = calculateKVCacheBytesPerToken({
      type: 'gqa',
      layers,
      q_heads: heads,
      kv_heads: heads,
      d_head,
      bytesPerElement,
    });
    // Hand calculation: 2 * 32 * 32 * 128 * 2 = 524,288 bytes
    expect(mhaBytes).toBe(524288);

    // GQA (8 KV heads): 2 * 32 * 8 * 128 * 2 = 131,072 bytes (4x reduction)
    const gqaBytes = calculateKVCacheBytesPerToken({
      type: 'gqa',
      layers,
      q_heads: heads,
      kv_heads: 8,
      d_head,
      bytesPerElement,
    });
    expect(gqaBytes).toBe(131072);
    expect(mhaBytes / gqaBytes).toBe(4);

    // MQA (1 KV head): 2 * 32 * 1 * 128 * 2 = 16,384 bytes (32x reduction)
    const mqaBytes = calculateKVCacheBytesPerToken({
      type: 'gqa',
      layers,
      q_heads: heads,
      kv_heads: 1,
      d_head,
      bytesPerElement,
    });
    expect(mqaBytes).toBe(16384);
    expect(mhaBytes / mqaBytes).toBe(32);
  });

  it('MLA per-token KV cache matches paper formula: layers * (d_c + d_R) * bytes', () => {
    const layers = 32;
    const d_c = 512; // compressed latent dimension
    const d_R = 64;  // decoupled RoPE dimension
    const bytesPerElement = 2;

    const mlaBytes = calculateKVCacheBytesPerToken({
      type: 'mla',
      layers,
      q_heads: 32,
      kv_heads: 1,
      d_head: 128,
      bytesPerElement,
      d_c,
      d_R,
    });
    // Hand calculation: 32 * (512 + 64) * 2 = 36,864 bytes
    expect(mlaBytes).toBe(36864);
  });

  it('Linear attention recurrent form matches parallel prefix sum form', () => {
    // 3 tokens with d=2
    const Q = [[1, 0], [0.5, 0.5], [0, 1]];
    const K = [[1, 1], [0, 2], [1, 0]];
    const V = [[2, 3], [1, 4], [5, 1]];

    const parallelOutputs = linearAttentionParallel(Q, K, V);
    const recurrentOutputs = linearAttentionRecurrent(Q, K, V);

    for (let t = 0; t < Q.length; t++) {
      for (let dim = 0; dim < V[0].length; dim++) {
        expect(recurrentOutputs[t][dim]).toBeCloseTo(parallelOutputs[t][dim], 5);
      }
    }
  });

  it('Delta-rule update recurrence matches S_t = S_{t-1}(I - beta * k * k^T) + beta * v * k^T', () => {
    const S_prev = [
      [1, 0],
      [0, 1],
    ];
    const k = [1, 0];
    const v = [3, 2];
    const beta = 0.5;

    const S_next = deltaRuleRecurrent(S_prev, k, v, beta);

    // Hand calculation:
    // k * k^T = [[1, 0], [0, 0]]
    // I - beta * k * k^T = [[0.5, 0], [0, 1]]
    // S_prev * (I - beta * k * k^T) = [[0.5, 0], [0, 1]]
    // beta * v * k^T = [[1.5, 0], [1.0, 0]]
    // S_next = [[2.0, 0], [1.0, 1.0]]
    expect(S_next[0][0]).toBeCloseTo(2.0, 5);
    expect(S_next[0][1]).toBeCloseTo(0.0, 5);
    expect(S_next[1][0]).toBeCloseTo(1.0, 5);
    expect(S_next[1][1]).toBeCloseTo(1.0, 5);
  });

  it('Top-K selection extracts highest scoring indices correctly', () => {
    const scores = [0.1, 5.4, -2.1, 8.9, 3.2, 1.1];
    const k = 3;
    const selected = topKSelection(scores, k);
    // Top 3 values: 8.9 (idx 3), 5.4 (idx 1), 3.2 (idx 4)
    expect(selected.map((s) => s.index)).toEqual([3, 1, 4]);
  });
});
