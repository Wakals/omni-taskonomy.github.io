"""Build or check the animated TL;DR Jigsaw teaser assets from the author-supplied images."""
from pathlib import Path
import hashlib, json, sys
import numpy as np
from PIL import Image

BASE = Path(__file__).resolve().parents[1]
FOLDER = BASE / 'public/figures/tldr-crops'
RECORD = BASE / 'content/tldr-teaser.json'
record = json.loads(RECORD.read_text())
check = '--check' in sys.argv[1:]

def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def rgb(path): return np.asarray(Image.open(path).convert('RGB')).astype(float)

# The supplied files are the unchanged sources; every derived file is a crop or re-encode of them.
for name, source in record['source_images'].items():
    path = FOLDER / name
    assert sha(path) == source['sha256'], f'{name} changed'
    assert list(Image.open(path).size) == source['size'], name

source_input = FOLDER / record['tiles']['source']
source_output = FOLDER / record['output']['source']
crops = [rgb(source_input)[y0:y1, x0:x1] for x0, y0, x1, y1 in record['tiles']['crop_boxes']]

# The output image must be the input patches rearranged by the figure's permutation answer.
permutation = record['permutation']
output = rgb(source_output)
half = output.shape[0] // 2
def distance(target, crop):
    # Allow the few pixels of gutter drift between the two supplied renders.
    h, w = target.shape[:2]
    return min(np.abs(target - crop[dy:dy + h, dx:dx + w]).mean() for dy in range(18) for dx in range(18))
for position, tile in enumerate(permutation):
    row, col = divmod(position, 2)
    target = output[row * half + 12:row * half + half - 12, col * half + 12:col * half + half - 12]
    errors = [distance(target, crop) for crop in crops]
    assert int(np.argmin(errors)) == tile and errors[tile] < 8, (position, [round(e, 1) for e in errors])

if not check:
    for index, crop in enumerate(crops):
        Image.fromarray(crop.astype('uint8')).save(FOLDER / record['tiles']['files'][index], 'WEBP', quality=90, method=6)
    Image.open(source_output).convert('RGB').save(FOLDER / record['output']['file'], 'WEBP', quality=90, method=6)
    record['tiles']['sha256'] = [sha(FOLDER / name) for name in record['tiles']['files']]
    record['output']['sha256'] = sha(FOLDER / record['output']['file'])
    RECORD.write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n')

# Derived files are pinned by hash and must still decode to their source pixels.
for index, name in enumerate(record['tiles']['files']):
    assert sha(FOLDER / name) == record['tiles']['sha256'][index], name
    assert np.abs(rgb(FOLDER / name) - crops[index]).mean() < 3, name
assert sha(FOLDER / record['output']['file']) == record['output']['sha256']
assert np.abs(rgb(FOLDER / record['output']['file']) - output).mean() < 3
answer = record['labels']['i2t_answer']
assert answer == "('reorder', [" + ', '.join(map(str, permutation)) + '])', answer
assert [record['labels'][f'tile_{i}'] for i in range(4)] == ['0', '1', '2', '3']
print(json.dumps({'teaser_tiles': len(crops), 'permutation': permutation, 'answer': answer, 'mode': 'check' if check else 'build'}))
