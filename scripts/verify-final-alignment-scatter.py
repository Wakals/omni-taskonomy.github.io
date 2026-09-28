#!/usr/bin/env python3
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'content/gradient-transfer-final-overlay.json').read_text())
assert data['provenance']['source_sha256'] == '3fb16b00a1d56da24ca923a2afc5816372bf17bfe5356e063284e618946e9ad7'
assert data['capability']['correlation'] == 0.795
assert data['pairs']['correlation'] == 0.529
assert len(data['capability']['points']) == 7
assert len(data['pairs']['points']) == 133
assert sum(bool(point['label']) for point in data['pairs']['points']) == 4
assert {point['family'] for point in data['pairs']['points']} == {'REC', 'RCN', 'RORG'}
print('Final alignment scatter verified: 7 capabilities, 133 pairs, 4 labeled examples.')
