#!/usr/bin/env python3
"""
Verification Ledger Audit Script
Validates mechanisms.json against all master prompt requirements:
- Chronological order
- Non-empty, specific trade-offs
- Valid primary URLs
- Causal responds_to order
- Generates markdown chronology table for README.md
"""

import json
from pathlib import Path
import sys


def audit_ledger(json_path: Path) -> int:
    with open(json_path, "r", encoding="utf-8") as f:
        mechanisms = json.load(f)

    print(f"Loaded {len(mechanisms)} mechanisms from {json_path}")
    errors = []

    # 1. Chronological Sorting Check
    for i in range(len(mechanisms) - 1):
        curr = mechanisms[i]
        nxt = mechanisms[i + 1]
        if curr["first_appearance"]["date"] > nxt["first_appearance"]["date"]:
            errors.append(
                f"Chronological inversion: {curr['id']} ({curr['first_appearance']['date']}) appears before {nxt['id']} ({nxt['first_appearance']['date']})"
            )

    # 2. Trade-offs Check
    for m in mechanisms:
        gives_up = m.get("what_it_gives_up", [])
        if not gives_up:
            errors.append(f"{m['id']}: 'what_it_gives_up' is empty!")
        else:
            for item in gives_up:
                if len(item.strip()) < 10:
                    errors.append(f"{m['id']}: downside too brief or empty: '{item}'")

    # 3. Primary URL Check
    for m in mechanisms:
        status = m.get("date_status")
        url = m.get("first_appearance", {}).get("primary_url", "")
        if status != "UNVERIFIED" and not url.startswith("http"):
            errors.append(f"{m['id']}: missing valid primary URL: '{url}'")

    # 4. Causal responds_to Check
    id_to_idx = {m["id"]: i for i, m in enumerate(mechanisms)}
    for i, m in enumerate(mechanisms):
        for earlier_id in m.get("responds_to", []):
            if earlier_id not in id_to_idx:
                errors.append(f"{m['id']}: responds_to references unknown id '{earlier_id}'")
            elif id_to_idx[earlier_id] >= i:
                errors.append(
                    f"{m['id']} (index {i}) references future/same mechanism '{earlier_id}' (index {id_to_idx[earlier_id]})"
                )

    if errors:
        print("\n❌ LEDGER AUDIT FAILED WITH ERRORS:")
        for err in errors:
            print(f"  - {err}")
        return 1

    print("\n✅ ALL 4 INTEGRITY CHECKS PASSED SUCCESSFULLY!\n")
    print("=" * 110)
    print(f"{'Date':<12} | {'Mechanism Name':<42} | {'Event / Origin':<22} | {'Status':<10}")
    print("=" * 110)
    for m in mechanisms:
        date = m["first_appearance"]["date"]
        name = m["name"][:40]
        event = m["first_appearance"]["event"][:20]
        status = m["date_status"]
        print(f"{date:<12} | {name:<42} | {event:<22} | {status:<10}")
    print("=" * 110)

    return 0


if __name__ == "__main__":
    path = Path(__file__).parent.parent / "data" / "mechanisms.json"
    sys.exit(audit_ledger(path))
