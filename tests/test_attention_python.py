"""
Pytest Suite for Attention Mechanisms Python Implementations.
Verifies numerical equivalence, mathematical identities, and variance properties.
"""

import numpy as np
import pytest
from python.attention_mechanisms import (
    ScaledDotProductAttention,
    RotaryPositionalEmbedding,
    ALiBiAttention,
    MultiQueryAttention,
    GroupedQueryAttention,
    LinearAttention,
    DeltaNet,
    GatedDeltaNet,
    AttentionSinks,
)


def test_scaled_dot_product_softmax_sum():
    attn = ScaledDotProductAttention(d_k=4, scale=True)
    q = np.random.randn(5, 4)
    k = np.random.randn(5, 4)
    v = np.random.randn(5, 8)
    _, weights, _ = attn.forward(q, k, v, causal_mask=True)

    # Every row of attention weights must sum to 1.0
    row_sums = np.sum(weights, axis=-1)
    np.testing.assert_allclose(row_sums, np.ones(5), atol=1e-5)

    # Future tokens must have 0.0 weight
    for i in range(5):
        for j in range(i + 1, 5):
            assert weights[i, j] == pytest.approx(0.0, abs=1e-6)


def test_variance_scaling():
    d_k = 128
    attn_scaled = ScaledDotProductAttention(d_k=d_k, scale=True)
    attn_unscaled = ScaledDotProductAttention(d_k=d_k, scale=False)

    trials = 2000
    q = np.random.randn(trials, d_k)
    k = np.random.randn(trials, d_k)
    dots = np.sum(q * k, axis=-1)

    # Var(q dot k) ~ d_k
    np_unscaled_var = np.var(dots)
    # Var((q dot k) / sqrt(d_k)) ~ 1.0
    np_scaled_var = np.var(dots / np.sqrt(d_k))

    assert 100 < np_unscaled_var < 160
    assert 0.85 < np_scaled_var < 1.15


def test_rope_relative_offset_property():
    rope = RotaryPositionalEmbedding(dim=4, base=10000.0)
    q = np.array([1.2, 0.8, -0.5, 2.1])
    k = np.array([0.4, -1.1, 1.8, 0.3])
    m = 7
    n = 4
    offset = n - m

    q_m = rope.apply(q, m)
    k_n = rope.apply(k, n)
    k_offset = rope.apply(k, offset)

    # <R_m q, R_n k> == <q, R_{n-m} k>
    dot1 = np.dot(q_m.squeeze(), k_n.squeeze())
    dot2 = np.dot(q, k_offset.squeeze())

    np.testing.assert_allclose(dot1, dot2, atol=1e-5)


def test_gqa_reduces_to_mqa():
    # When num_kv_heads == 1, GQA is mathematically equivalent to MQA
    num_q = 8
    seq_len = 4
    d = 16
    q = np.random.randn(seq_len, num_q, d)
    k = np.random.randn(seq_len, 1, d)
    v = np.random.randn(seq_len, 1, d)

    mqa = MultiQueryAttention(num_q_heads=num_q, d_k=d, d_v=d)
    out_mqa = mqa.forward(q, k, v, causal=True)

    gqa = GroupedQueryAttention(num_q_heads=num_q, num_kv_heads=1, d_k=d, d_v=d)
    out_gqa = gqa.forward(q, k, v, causal=True)

    np.testing.assert_allclose(out_gqa, out_mqa, atol=1e-5)


def test_linear_attention_parallel_equals_recurrent():
    lin = LinearAttention()
    seq_len = 5
    d_k = 4
    d_v = 6
    q = np.random.randn(seq_len, d_k)
    k = np.random.randn(seq_len, d_k)
    v = np.random.randn(seq_len, d_v)

    out_parallel = lin.forward_parallel(q, k, v)

    # Compute step-by-step recurrent
    out_recurrent = []
    S = np.zeros((d_k, d_v), dtype=np.float32)
    z = np.zeros(d_k, dtype=np.float32)
    for t in range(seq_len):
        step_out, S, z = lin.forward_recurrent_step(q[t], k[t], v[t], S, z)
        out_recurrent.append(step_out)

    out_recurrent = np.array(out_recurrent)
    np.testing.assert_allclose(out_parallel, out_recurrent, atol=1e-5)


def test_delta_rule_memory_overwriting():
    d = 2
    delta = DeltaNet(d_k=d, d_v=d)
    S = np.zeros((d, d), dtype=np.float32)

    k_blue = np.array([1.0, 0.0])
    v_blue = np.array([5.0, 0.0])

    # Write blue
    S = delta.recurrent_step(k_blue, v_blue, beta_t=1.0, S_prev=S)
    pred_blue = np.matmul(S, k_blue)
    np.testing.assert_allclose(pred_blue, v_blue, atol=1e-5)

    # Overwrite blue with green at the same key
    v_green = np.array([0.0, 9.0])
    S = delta.recurrent_step(k_blue, v_green, beta_t=1.0, S_prev=S)
    pred_green = np.matmul(S, k_blue)
    # The delta rule correctly predicts and erases blue to write green!
    np.testing.assert_allclose(pred_green, v_green, atol=1e-5)


def test_attention_sinks_eviction():
    sinks = AttentionSinks(sink_size=2, window_size=3)
    k = np.arange(10)[:, None]  # 10 tokens: 0, 1, ..., 9
    v = np.arange(10)[:, None] * 10

    k_evicted, v_evicted = sinks.evict_kv_cache(k, v)
    # Kept: tokens 0, 1 (sinks) + tokens 7, 8, 9 (window of size 3)
    expected_tokens = np.array([0, 1, 7, 8, 9])[:, None]
    np.testing.assert_array_equal(k_evicted, expected_tokens)
