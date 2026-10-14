"""
Comprehensive Python / NumPy Implementations of Historical and Modern Attention Mechanisms
Strict numerical fidelity matching foundational papers (2014 - 2026).
"""

from typing import Dict, List, Optional, Tuple, Union
import numpy as np


def softmax(x: np.ndarray, axis: int = -1) -> np.ndarray:
    """Numerically stable softmax."""
    x_max = np.max(x, axis=axis, keepdims=True)
    exp_x = np.exp(x - x_max)
    return exp_x / np.sum(exp_x, axis=axis, keepdims=True)


class ScaledDotProductAttention:
    """
    Standard Scaled Dot-Product Attention (Vaswani et al., 2017).
    Attention(Q, K, V) = softmax((Q K^T) / sqrt(d_k) + M) V
    """

    def __init__(self, d_k: int, scale: bool = True):
        self.d_k = d_k
        self.scale = scale
        self.scale_factor = 1.0 / np.sqrt(d_k) if scale else 1.0

    def forward(
        self,
        q: np.ndarray,
        k: np.ndarray,
        v: np.ndarray,
        causal_mask: bool = True,
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Args:
            q: (seq_len_q, d_k)
            k: (seq_len_k, d_k)
            v: (seq_len_k, d_v)
            causal_mask: whether to mask future tokens
        Returns:
            output: (seq_len_q, d_v)
            weights: (seq_len_q, seq_len_k)
            scores_raw: (seq_len_q, seq_len_k)
        """
        scores_raw = np.matmul(q, k.T)
        scores = scores_raw * self.scale_factor

        if causal_mask:
            seq_len_q, seq_len_k = q.shape[0], k.shape[0]
            # Create upper triangular mask with -inf
            mask = np.triu(np.full((seq_len_q, seq_len_k), -1e9), k=1)
            scores = scores + mask

        weights = softmax(scores, axis=-1)
        output = np.matmul(weights, v)
        return output, weights, scores_raw


class RotaryPositionalEmbedding:
    """
    Rotary Position Embedding (RoPE) (Su et al., 2021).
    Rotates query and key vectors in 2D sub-planes such that <R_m q, R_n k> = <q, R_{n-m} k>.
    """

    def __init__(self, dim: int, base: float = 10000.0):
        assert dim % 2 == 0, "Dimension must be even for 2D plane rotations."
        self.dim = dim
        self.base = base
        # Frequencies: theta_i = base^(-2i / dim)
        self.inv_freq = 1.0 / (base ** (np.arange(0, dim, 2).astype(np.float32) / dim))

    def apply(self, x: np.ndarray, pos: Union[int, np.ndarray]) -> np.ndarray:
        """
        Args:
            x: shape (..., dim)
            pos: position index or array of position indices
        """
        pos = np.asarray(pos, dtype=np.float32)
        if pos.ndim == 0:
            pos = pos[None]
        
        # Angles: (seq_len, dim // 2)
        angles = np.outer(pos, self.inv_freq)
        # Duplicate angles for real/imag components: (seq_len, dim)
        sin = np.sin(angles)
        cos = np.cos(angles)

        # Pair elements: x0, x1
        x_reshaped = x.reshape(-1, self.dim // 2, 2)
        x0 = x_reshaped[..., 0]
        x1 = x_reshaped[..., 1]

        # 2D rotation: [x0*cos - x1*sin, x0*sin + x1*cos]
        rot_x0 = x0 * cos - x1 * sin
        rot_x1 = x0 * sin + x1 * cos

        out = np.stack([rot_x0, rot_x1], axis=-1).reshape(x.shape)
        return out


class ALiBiAttention:
    """
    Attention with Linear Biases (Press et al., 2021).
    Injects a non-learned static distance slope -m * |i - j| into logits.
    """

    def __init__(self, num_heads: int):
        self.num_heads = num_heads
        # Geometric sequence of slopes: 2^(-8i / H)
        self.slopes = np.array([2 ** (-8.0 * (i + 1) / num_heads) for i in range(num_heads)])

    def get_bias_matrix(self, seq_len: int) -> np.ndarray:
        """Returns bias tensor of shape (num_heads, seq_len, seq_len)."""
        positions = np.arange(seq_len)
        # Distance matrix: dist[i, j] = j - i for causal
        dist = positions[None, :] - positions[:, None]  # j - i <= 0 for past tokens
        bias = np.zeros((self.num_heads, seq_len, seq_len), dtype=np.float32)
        for h in range(self.num_heads):
            # slope * (j - i) = -slope * |i - j| when j <= i
            bias[h] = self.slopes[h] * dist
        return bias


class MultiQueryAttention:
    """
    Multi-Query Attention (MQA) (Shazeer, 2019).
    All query heads share a single key head and single value head.
    """

    def __init__(self, num_q_heads: int, d_k: int, d_v: int):
        self.num_q_heads = num_q_heads
        self.d_k = d_k
        self.d_v = d_v
        self.scale_factor = 1.0 / np.sqrt(d_k)

    def forward(
        self,
        q: np.ndarray,  # (seq_len_q, num_q_heads, d_k)
        k: np.ndarray,  # (seq_len_k, 1, d_k)
        v: np.ndarray,  # (seq_len_k, 1, d_v)
        causal: bool = True,
    ) -> np.ndarray:
        # q: (num_q_heads, seq_len_q, d_k)
        # k: (1, seq_len_k, d_k)
        q_t = np.transpose(q, (1, 0, 2))
        k_t = np.transpose(k, (1, 0, 2))  # (1, seq_len_k, d_k)
        v_t = np.transpose(v, (1, 0, 2))

        # Broadcast dot product across query heads
        scores = np.matmul(q_t, np.transpose(k_t, (0, 2, 1))) * self.scale_factor
        if causal:
            seq_q, seq_k = q.shape[0], k.shape[0]
            mask = np.triu(np.full((seq_q, seq_k), -1e9), k=1)
            scores = scores + mask[None, :, :]

        weights = softmax(scores, axis=-1)
        out_t = np.matmul(weights, v_t)  # (num_q_heads, seq_len_q, d_v)
        return np.transpose(out_t, (1, 0, 2))


class GroupedQueryAttention:
    """
    Grouped-Query Attention (GQA) (Ainslie et al., 2023).
    Partitions num_q_heads into G groups, with each group sharing one KV head.
    """

    def __init__(self, num_q_heads: int, num_kv_heads: int, d_k: int, d_v: int):
        assert num_q_heads % num_kv_heads == 0, "Query heads must be divisible by KV heads."
        self.num_q_heads = num_q_heads
        self.num_kv_heads = num_kv_heads
        self.group_size = num_q_heads // num_kv_heads
        self.d_k = d_k
        self.d_v = d_v
        self.scale_factor = 1.0 / np.sqrt(d_k)

    def forward(
        self,
        q: np.ndarray,  # (seq_len_q, num_q_heads, d_k)
        k: np.ndarray,  # (seq_len_k, num_kv_heads, d_k)
        v: np.ndarray,  # (seq_len_k, num_kv_heads, d_v)
        causal: bool = True,
    ) -> np.ndarray:
        seq_q = q.shape[0]
        outputs = []

        for g in range(self.num_kv_heads):
            # Query slice for group g
            q_group = q[:, g * self.group_size : (g + 1) * self.group_size, :]
            k_g = k[:, g : g + 1, :]
            v_g = v[:, g : g + 1, :]

            # Compute using MQA logic within group
            mqa = MultiQueryAttention(self.group_size, self.d_k, self.d_v)
            out_g = mqa.forward(q_group, k_g, v_g, causal=causal)
            outputs.append(out_g)

        return np.concatenate(outputs, axis=1)


class LinearAttention:
    """
    Linear Attention ('Transformers are RNNs') (Katharopoulos et al., 2020).
    Replaces softmax with feature map phi(x) = elu(x) + 1 to exploit associativity.
    """

    @staticmethod
    def feature_map(x: np.ndarray) -> np.ndarray:
        return np.where(x > 0, x + 1.0, np.exp(x))

    def forward_parallel(self, q: np.ndarray, k: np.ndarray, v: np.ndarray) -> np.ndarray:
        """Prefix sum scan O(N * d^2)."""
        phi_q = self.feature_map(q)
        phi_k = self.feature_map(k)
        seq_len, d_k = q.shape
        _, d_v = v.shape

        outputs = np.zeros((seq_len, d_v), dtype=np.float32)
        S = np.zeros((d_k, d_v), dtype=np.float32)
        z = np.zeros(d_k, dtype=np.float32)

        for i in range(seq_len):
            S += np.outer(phi_k[i], v[i])
            z += phi_k[i]
            denom = np.dot(phi_q[i], z)
            outputs[i] = np.dot(phi_q[i], S) / (denom + 1e-9)

        return outputs

    def forward_recurrent_step(
        self,
        q_t: np.ndarray,
        k_t: np.ndarray,
        v_t: np.ndarray,
        S_prev: np.ndarray,
        z_prev: np.ndarray,
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """O(1) memory step during decoding."""
        phi_q = self.feature_map(q_t)
        phi_k = self.feature_map(k_t)

        S_next = S_prev + np.outer(phi_k, v_t)
        z_next = z_prev + phi_k

        denom = np.dot(phi_q, z_next)
        out_t = np.dot(phi_q, S_next) / (denom + 1e-9)
        return out_t, S_next, z_next


class DeltaNet:
    """
    Delta Rule in Linear Attention (Schlag et al., 2021; Yang et al., 2024).
    S_t = S_{t-1}(I - beta_t k_t k_t^T) + beta_t v_t k_t^T
    """

    def __init__(self, d_k: int, d_v: int):
        self.d_k = d_k
        self.d_v = d_v

    def recurrent_step(
        self,
        k_t: np.ndarray,
        v_t: np.ndarray,
        beta_t: float,
        S_prev: np.ndarray,
    ) -> np.ndarray:
        # Predict: y_hat = S_prev @ k_t
        y_hat = np.matmul(S_prev, k_t)
        # Error: err = y_hat - v_t
        err = y_hat - v_t
        # Update: S_next = S_prev - beta_t * (err * k_t^T)
        S_next = S_prev - beta_t * np.outer(err, k_t)
        return S_next


class GatedDeltaNet:
    """
    Gated DeltaNet (Yang, Kautz, Hatamizadeh, 2024).
    S_t = alpha_t * S_{t-1}(I - beta_t k_t k_t^T) + beta_t v_t k_t^T
    """

    def __init__(self, d_k: int, d_v: int):
        self.d_k = d_k
        self.d_v = d_v

    def recurrent_step(
        self,
        k_t: np.ndarray,
        v_t: np.ndarray,
        beta_t: float,
        alpha_t: float,  # Data-dependent decay / forgetting gate in (0, 1)
        S_prev: np.ndarray,
    ) -> np.ndarray:
        y_hat = np.matmul(S_prev, k_t)
        err = y_hat - v_t
        S_decayed = alpha_t * S_prev
        S_next = S_decayed - beta_t * np.outer(err, k_t)
        return S_next


class AttentionSinks:
    """
    Attention Sinks / StreamingLLM (Xiao et al., 2023).
    Preserves initial sink tokens + local rolling window.
    """

    def __init__(self, sink_size: int = 4, window_size: int = 1024):
        self.sink_size = sink_size
        self.window_size = window_size

    def evict_kv_cache(
        self,
        k_cache: np.ndarray,
        v_cache: np.ndarray,
    ) -> Tuple[np.ndarray, np.ndarray]:
        """Keeps sinks + most recent window tokens."""
        seq_len = k_cache.shape[0]
        if seq_len <= self.sink_size + self.window_size:
            return k_cache, v_cache

        sinks_k = k_cache[: self.sink_size]
        sinks_v = v_cache[: self.sink_size]

        window_k = k_cache[-self.window_size :]
        window_v = v_cache[-self.window_size :]

        new_k = np.concatenate([sinks_k, window_k], axis=0)
        new_v = np.concatenate([sinks_v, window_v], axis=0)
        return new_k, new_v
