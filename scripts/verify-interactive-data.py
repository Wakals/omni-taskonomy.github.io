"""Verify the current 19-source taxonomy and interactive transfer data."""
from hashlib import sha256
from pathlib import Path
import json
import sys

from v12_audit import RAW, CORRECTIONS, ROOT, H, LEAVES

provenance = json.loads((ROOT / "content/current-transfer-provenance.json").read_text())
assert provenance["models_including_baseline"] == 20
assert provenance["i2i_tasks"] == 19
assert provenance["understanding_capabilities"] == 25
assert provenance["main_map_capabilities"] == 19

if len(sys.argv) > 1:
    paper = Path(sys.argv[1]).resolve()
    for key in ("paired_results", "i2i_inventory"):
        source = paper / provenance[key]["path"]
        assert sha256(source.read_bytes()).hexdigest() == provenance[key]["sha256"]

assert RAW["source"]["paper_commit"] == provenance["paper_commit"]
assert RAW["source"]["hash"] == "sha256:" + provenance["paired_results"]["sha256"]
assert CORRECTIONS["source"]["paper_commit"] == provenance["paper_commit"]
assert CORRECTIONS["leaf_families"] == {}
assert CORRECTIONS["i2i_column_order"] == CORRECTIONS["i2i_tree_order"]

assert len(H["models"]) == 20 and len(H["nodes"]) == 29
assert len(LEAVES) == 44
assert sum(x["role"] == "i2i" for x in LEAVES.values()) == 19
assert sum(x["role"] == "i2t" for x in LEAVES.values()) == 25
assert sum(x["n"] for x in LEAVES.values()) == 9444
assert sum(x["type"] == "leaf" and H["expected"]["ALL"][x["id"]] > 100 for x in H["nodes"]) == 19

scatter = json.loads((ROOT / "content/gradient-transfer-scatter.json").read_text())
scatter_source = ROOT / "content/source-data/gradient-transfer"
assert scatter["source"]["capability_csv_sha256"] == sha256((scatter_source / "capability_7.csv").read_bytes()).hexdigest()
assert scatter["source"]["task_pairs_csv_sha256"] == sha256((scatter_source / "task_pairs_133.csv").read_bytes()).hexdigest()
assert len(scatter["capability"]["points"]) == 7
assert len(scatter["pairs"]["points"]) == 133
assert round(scatter["capability"]["correlation"], 3) == 0.795
assert round(scatter["pairs"]["correlation"], 3) == 0.529

i2i_order = CORRECTIONS["i2i_column_order"]
assert [LEAVES[x]["family"] for x in i2i_order] == ["REC"] * 2 + ["RCN"] * 9 + ["RORG"] * 8
assert LEAVES["i2i:object_replacement"]["name"] == "Object editing"
assert LEAVES["i2i:attribute_editing"]["name"] == "Attribute editing"
assert LEAVES["i2i:semantic_segmentation"]["family"] == "RORG"
assert LEAVES["i2t:SEMANTIC_SCENE_PARSING"]["family"] == "REC"

verified_images = 0
for leaf in LEAVES.values():
    if not leaf["sample"]:
        continue
    for web_path in leaf["sample"]["images"]:
        path = ROOT / "public" / web_path.lstrip("/")
        assert path.is_file() and path.stat().st_size > 0
        if path.name in provenance["new_example_images"]:
            assert sha256(path.read_bytes()).hexdigest() == provenance["new_example_images"][path.name]
        verified_images += 1

for scope in H["scopes"]:
    scope_id = scope["id"]
    assert len(H["expected"][scope_id]) == len(H["nodes"])
    for node in H["nodes"]:
        models = H["metrics"][scope_id][node["id"]]
        assert len(models) == 20
        assert len(H["pvalues"][scope_id][node["id"]]) == 19
        for pair in models.values():
            assert 0 <= pair[0] <= pair[1] == H["expected"][scope_id][node["id"]]

if len(sys.argv) > 1:
    paired = json.loads((paper / provenance["paired_results"]["path"]).read_text())
    for row in paired["rows"]:
        actual = H["pvalues"][row["scope"]][row["node_id"]][row["model"]]
        assert actual == row["p_value"]

print(json.dumps({
    "paper_commit": provenance["paper_commit"],
    "models_including_baseline": len(H["models"]),
    "i2i_tasks": 19,
    "understanding_capabilities": 25,
    "main_map_capabilities": 19,
    "display_cells": 19 * 19,
    "verified_example_images": verified_images,
}, indent=2))
