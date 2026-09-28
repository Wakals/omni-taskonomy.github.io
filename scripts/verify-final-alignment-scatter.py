#!/usr/bin/env python3
import json
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[1]
subprocess.run(["python3", str(root / "scripts/extract-gradient-transfer-scatter.py"), "--check"], check=True)
data = json.loads((root / "content/gradient-transfer-scatter.json").read_text())
assert len(data["capability"]["points"]) == 7
assert len(data["pairs"]["points"]) == 133
assert round(data["capability"]["correlation"], 3) == 0.795
assert round(data["pairs"]["correlation"], 3) == 0.529
assert {point["source_family"] for point in data["pairs"]["points"]} == {"REC", "RCN", "RORG"}
assert all(point["source"] and point["target"] for point in data["pairs"]["points"])
print("Final rendered scatter verified from CSV: 7 capabilities, 133 named task pairs.")
