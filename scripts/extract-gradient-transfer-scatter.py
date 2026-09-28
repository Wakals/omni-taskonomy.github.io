#!/usr/bin/env python3
"""Build the interactive alignment/transfer scatter plots from the final CSVs."""
from __future__ import annotations

from hashlib import sha256
from pathlib import Path
import csv
import json
import math
import sys

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "content/source-data/gradient-transfer"
OUT = ROOT / "content/gradient-transfer-scatter.json"
CHECK = "--check" in sys.argv


def read_csv(name: str) -> list[dict[str, str]]:
    with (DATA / name).open(newline="") as handle:
        return list(csv.DictReader(handle))


def regression(rows: list[dict], x_key: str, y_key: str) -> dict[str, float]:
    xs = [row[x_key] for row in rows]
    ys = [row[y_key] for row in rows]
    mx, my = sum(xs) / len(xs), sum(ys) / len(ys)
    slope = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sum((x - mx) ** 2 for x in xs)
    return {"slope": slope, "intercept": my - slope * mx}


def correlation(rows: list[dict], x_key: str, y_key: str) -> float:
    xs = [row[x_key] for row in rows]
    ys = [row[y_key] for row in rows]
    mx, my = sum(xs) / len(xs), sum(ys) / len(ys)
    numerator = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    denominator = math.sqrt(sum((x - mx) ** 2 for x in xs) * sum((y - my) ** 2 for y in ys))
    return numerator / denominator


def covariance_ellipse(rows: list[dict]) -> list[list[float]]:
    xs = [row["alignment"] for row in rows]
    ys = [row["transfer"] for row in rows]
    mx, my = sum(xs) / len(xs), sum(ys) / len(ys)
    n = len(rows) - 1
    a = sum((x - mx) ** 2 for x in xs) / n
    d = sum((y - my) ** 2 for y in ys) / n
    b = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / n
    trace = a + d
    root = math.sqrt((a - d) ** 2 + 4 * b * b)
    high, low = (trace + root) / 2, (trace - root) / 2
    if abs(b) > 1e-12:
        vx, vy = b, high - a
        length = math.hypot(vx, vy)
        vx, vy = vx / length, vy / length
    elif a >= d:
        vx, vy = 1.0, 0.0
    else:
        vx, vy = 0.0, 1.0
    wx, wy = -vy, vx
    return [
        [
            mx + math.sqrt(high) * math.cos(2 * math.pi * step / 64) * vx + math.sqrt(low) * math.sin(2 * math.pi * step / 64) * wx,
            my + math.sqrt(high) * math.cos(2 * math.pi * step / 64) * vy + math.sqrt(low) * math.sin(2 * math.pi * step / 64) * wy,
        ]
        for step in range(65)
    ]


capability_rows = read_csv("capability_7.csv")
pair_rows = read_csv("task_pairs_133.csv")

capability_points = [
    {
        "id": row["capability_id"],
        "name": row["target"],
        "family": row["family"],
        "eval_n": int(row["eval_n"]),
        "gradient_n": int(row["gradient_n"]),
        "n_sources": int(row["n_sources"]),
        "alignment": float(row["mean_alignment"]),
        "transfer": float(row["mean_transfer_gain_pp"]),
    }
    for row in capability_rows
]

pairs = [
    {
        "source_id": row["task_id"],
        "source": row["source"],
        "source_family": row["source_family"],
        "target_id": row["capability_id"],
        "target": row["target"],
        "target_family": row["target_family"],
        "alignment": float(row["cosine"]),
        "alignment_ci_low": float(row["ci_low"]),
        "alignment_ci_high": float(row["ci_high"]),
        "transfer": float(row["delta_pp"]),
        "eval_n": int(row["eval_n"]),
        "gradient_n": int(row["gradient_n"]),
        "n_seeds": int(row["n_seeds"]),
    }
    for row in pair_rows
]

payload = {
    "source": {
        "paper_commit": (ROOT / "content/manuscript-revision.txt").read_text().strip(),
        "capability_csv_sha256": sha256((DATA / "capability_7.csv").read_bytes()).hexdigest(),
        "task_pairs_csv_sha256": sha256((DATA / "task_pairs_133.csv").read_bytes()).hexdigest(),
        "definition": "Post-PCA cosine at the pretrained checkpoint; transfer is accuracy gain over the I2T-only baseline.",
    },
    "families": {"REC": "Recognition", "RCN": "Reconstruction", "RORG": "Reorganization"},
    "capability": {
        "points": capability_points,
        "regression": regression(capability_points, "alignment", "transfer"),
        "correlation": correlation(capability_points, "alignment", "transfer"),
        "domain": {"x": [-0.3, 0.23], "y": [-2.65, 2.35]},
    },
    "pairs": {
        "points": pairs,
        "regression": regression(pairs, "alignment", "transfer"),
        "ellipse": covariance_ellipse(pairs),
        "correlation": correlation(pairs, "alignment", "transfer"),
        "domain": {"x": [-0.55, 0.39], "y": [-6.6, 4.2]},
    },
}

serialized = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
if CHECK:
    assert OUT.read_text() == serialized, "Stored scatter data do not match the final CSVs"
    assert len(capability_points) == 7
    assert len(pairs) == 133
    assert round(payload["capability"]["correlation"], 3) == 0.795
    assert round(payload["pairs"]["correlation"], 3) == 0.529
    print("Verified final CSV scatter data: 7 capabilities and 133 task pairs")
else:
    OUT.write_text(serialized)
    print(f"Wrote {len(capability_points)} capability means and {len(pairs)} task pairs to {OUT}")
