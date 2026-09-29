"""Check that rendered figure assets are pinned to the current paper PDFs."""
from pathlib import Path
import hashlib,json,subprocess,sys
SITE=Path(__file__).resolve().parents[1]
PAPER=Path(sys.argv[1]).resolve()
manifest=json.loads((SITE/'content/current-paper-figures.json').read_text())
revision=manifest['manuscript_commit']
subprocess.check_call(['git','-C',str(PAPER),'cat-file','-e',revision+'^{commit}'])
for name,record in manifest['rendered_assets'].items():
    assert hashlib.sha256(subprocess.check_output(['git','-C',str(PAPER),'show',revision+':'+record['source_pdf']])).hexdigest()==record['source_sha256']
    assert hashlib.sha256((SITE/'public/figures'/name).read_bytes()).hexdigest()==record['output_sha256']
print('Current teaser, controlled tasks, and scaling assets verified')
