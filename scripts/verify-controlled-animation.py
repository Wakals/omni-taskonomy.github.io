"""Build or check the controlled-settings animation and its reduced-motion still."""
from pathlib import Path
import hashlib, json, sys
import numpy as np
from PIL import Image

BASE = Path(__file__).resolve().parents[1]
FIGURES = BASE / 'public/figures'
RECORD = BASE / 'content/controlled-tasks-animation.json'
record = json.loads(RECORD.read_text())
check = '--check' in sys.argv[1:]
sha = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()

# The author-supplied GIF is served unchanged.
gif = FIGURES / record['animation']['file']
assert sha(gif) == record['animation']['sha256'], 'animation changed'
frames = Image.open(gif)
durations = []
for index in range(frames.n_frames):
    frames.seek(index)
    durations.append(frames.info.get('duration', 0))
assert [frames.width, frames.height] == record['animation']['size']
assert frames.n_frames == record['animation']['frames'] and sum(durations) == record['animation']['duration_ms']
assert frames.info.get('loop') == 0, 'animation must loop forever'

# The reduced-motion still is the GIF's own completed frame, the one it holds longest.
hold = record['still']['frame']
assert durations[hold] == max(durations), (hold, durations[hold], max(durations))
frames.seek(hold)
completed = frames.convert('RGB')
still = FIGURES / record['still']['file']
if not check:
    completed.save(still, optimize=True)
    record['still']['sha256'] = sha(still)
    RECORD.write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n')
assert sha(still) == record['still']['sha256'], 'still changed'
assert np.array_equal(np.asarray(Image.open(still).convert('RGB')), np.asarray(completed)), 'still is not the completed frame'
print(json.dumps({'animation': gif.name, 'frames': frames.n_frames, 'duration_ms': sum(durations), 'still_frame': hold, 'mode': 'check' if check else 'build'}))
