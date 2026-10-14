#!/usr/bin/env python3
"""
KV Cache Memory & Bandwidth Calculator CLI
Calculate exact GPU memory footprint and decoding bandwidth for MHA, GQA, MQA, MLA, and CSA2.
"""

import argparse
import sys


def calculate_kv_cache(
    arch: str,
    seq_len: int,
    layers: int,
    q_heads: int,
    kv_heads: int,
    d_head: int,
    bytes_per_elem: float,
    d_c: int = 512,
    d_r: int = 64,
) -> dict:
    """Calculate KV cache metrics for a given architecture."""
    arch = arch.lower()

    if arch == "mla":
        # DeepSeek-V2/V3: layers * (d_c + d_R) * bytes_per_elem
        bytes_per_token = layers * (d_c + d_r) * bytes_per_elem
    elif arch == "csa2":
        # DeepSeek-V4.1-Flash: ~890 bytes per token global across all layers
        bytes_per_token = 890.0
    else:
        # Standard MHA / GQA / MQA: 2 * layers * kv_heads * d_head * bytes_per_elem
        bytes_per_token = 2 * layers * kv_heads * d_head * bytes_per_elem

    total_bytes = bytes_per_token * seq_len
    total_mb = total_bytes / (1024**2)
    total_gb = total_bytes / (1024**3)

    # Decode memory bandwidth at 50 tokens/sec generation per stream
    # Each generated token must read the entire KV cache from HBM
    bandwidth_gb_s = (total_bytes * 50.0) / (1024**3)

    return {
        "arch": arch.upper(),
        "seq_len": seq_len,
        "bytes_per_token": bytes_per_token,
        "total_mb": total_mb,
        "total_gb": total_gb,
        "bandwidth_gb_s_at_50tok_s": bandwidth_gb_s,
    }


def main():
    parser = argparse.ArgumentParser(description="Attention Mechanism KV Cache & Bandwidth Calculator")
    parser.add_argument("--arch", choices=["mha", "gqa", "mqa", "mla", "csa2"], default="gqa", help="Attention architecture")
    parser.add_argument("--seq-len", type=int, default=131072, help="Context sequence length (default: 128K = 131072)")
    parser.add_argument("--layers", type=int, default=32, help="Number of transformer layers (default: 32)")
    parser.add_argument("--q-heads", type=int, default=32, help="Number of Query heads (default: 32)")
    parser.add_argument("--kv-heads", type=int, default=8, help="Number of Key/Value heads (default: 8)")
    parser.add_argument("--d-head", type=int, default=128, help="Head dimension (default: 128)")
    parser.add_argument("--dtype", choices=["fp16", "bf16", "fp8", "fp4"], default="fp16", help="Data type precision")

    args = parser.parse_args()

    dtype_bytes = {"fp16": 2.0, "bf16": 2.0, "fp8": 1.0, "fp4": 0.5}[args.dtype]

    res = calculate_kv_cache(
        arch=args.arch,
        seq_len=args.seq_len,
        layers=args.layers,
        q_heads=args.q_heads,
        kv_heads=args.kv_heads,
        d_head=args.d_head,
        bytes_per_elem=dtype_bytes,
    )

    print("=" * 60)
    print(" ATTENTION MECHANISM KV CACHE AUDIT")
    print("=" * 60)
    print(f"Architecture:            {res['arch']}")
    print(f"Context Length:          {res['seq_len']:,} tokens")
    print(f"Layers / Q-Heads:        {args.layers}L / {args.q_heads}Q")
    print(f"KV Heads / d_head:       {args.kv_heads}KV / {args.d_head}d ({args.dtype})")
    print("-" * 60)
    print(f"Cache Footprint / Token: {res['bytes_per_token']:,.0f} Bytes / token")
    print(f"Total KV Cache Size:     {res['total_mb']:,.2f} MB ({res['total_gb']:,.2f} GB)")
    print(f"Decode HBM Bandwidth:    {res['bandwidth_gb_s_at_50tok_s']:,.2f} GB/s @ 50 tokens/sec")
    print("=" * 60)


if __name__ == "__main__":
    main()
