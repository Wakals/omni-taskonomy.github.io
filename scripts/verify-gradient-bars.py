"""Check the interactive bars against the exact current-paper figure data."""
from pathlib import Path
import csv, hashlib, json, math, subprocess, sys
SITE=Path(__file__).resolve().parents[1]
PAPER=Path(sys.argv[1]).resolve()
payload=json.loads((SITE/'content/gradient-bars-v13.json').read_text())
source=payload['source']
subprocess.check_call(['git','-C',str(PAPER),'cat-file','-e',source['paper_commit']+'^{commit}'])
for field in ('data','script','figure'):
    path=PAPER/source[field+'_file']
    assert hashlib.sha256(path.read_bytes()).hexdigest()==source[field+'_sha256'],field
raw=json.loads((PAPER/source['data_file']).read_text())
for field,rawfield,n in (('module_values','modules',15),('layer_values','layers',28)):
    for task in ('jigsaw','zoomin'):
        assert payload[field][task]==raw[rawfield][task] and len(payload[field][task])==n,(field,task)
assert len(payload['module_labels'])==15
clean=json.loads((SITE/'content/jigsaw-zoomin-four-charts.json').read_text())
provenance=json.loads((SITE/'content/jigsaw-zoomin-four-charts-provenance.json').read_text())
assert hashlib.sha256((SITE/provenance['bundled_file']).read_bytes()).hexdigest()==provenance['source_sha256']
assert (SITE/'public/data/jigsaw-zoomin-four-charts.json').read_bytes()==(SITE/provenance['bundled_file']).read_bytes()
assert clean['pca_energy']==0.99
assert len(clean['concat']['labels'])==15 and clean['perlayer']['layers']==list(range(28))
for field,old_field,n in (('concat','module_values',15),('perlayer','layer_values',28)):
    for task in ('jigsaw','zoomin'):
        new,previous=clean[field][task],payload[old_field][task]
        assert len(new)==n and all(math.isfinite(value) for value in new)
        assert max(abs(a-b) for a,b in zip(new,previous))<2e-6
for filename,public in (('training_gradient_norms.csv','training-gradient-norms.csv'),('training_gradient_norms_metadata.json','training-gradient-norms-metadata.json')):
    assert (SITE/'public/data'/public).read_bytes()==(PAPER/'analysis/section6/data'/filename).read_bytes(), filename
with (SITE/'public/data/training-gradient-norms.csv').open() as f:
    records=list(csv.DictReader(f))
norms=json.loads((SITE/'content/gradient-checkpoint-norms.json').read_text())['records']
assert [record['checkpoint'] for record in norms]==['base','3k','10k','30k']
assert len(norms)==len(records)
for reported,record in zip(records,norms):
    assert record['checkpoint']==reported['checkpoint_label']
    for key in ('jigsaw_i2i','jigsaw_i2t','zoomin_i2i','zoomin_i2t'):
        assert record[key]==float(reported[key]),(record['checkpoint'],key)
print('Author-supplied gradient bars and original paper figure verified')
