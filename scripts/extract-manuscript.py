"""Extract only contiguous passages from the current, active manuscript."""
from pathlib import Path
import hashlib, json, re, sys
BASE = Path(__file__).resolve().parents[1]
SOURCE = BASE / 'content/manuscript-sources'
REV = (BASE / 'content/manuscript-revision.txt').read_text().strip()
assert r'\newcommand{\methodname}{OmniTaskonomy\xspace}' in (SOURCE / 'paper_layout.tex').read_text()
entries = {}

def visible(raw):
    return re.sub(r'(?<!\\)%[^\n]*', lambda m: ' ' * len(m[0]), raw)

def render(raw):
    s = re.sub(r'\\methodname(?:\{\})?', 'OmniTaskonomy', visible(raw))
    previous = None
    while previous != s:
        previous = s
        s = re.sub(r'\\(?:textbf|textit|emph|section|subsection|paragraph|title|xd)\{([^{}]*)\}', r'\1', s)
    s = s.replace(r'\rightarrow', '→').replace(r'\\', ' ')
    s = s.replace(r'\(', '').replace(r'\)', '').replace(r'\%', '%').replace('~', ' ')
    s = s.replace('---', '—').replace('--', '–').replace('``', '“').replace("''", '”').replace('$', '')
    if re.search(r'\\[A-Za-z]+|[{}]', s): raise ValueError('Unresolved LaTeX: ' + s)
    return re.sub(r'\s+', ' ', s).strip()

def take(key, filename, start, end=None):
    raw = (SOURCE / filename).read_text()
    masked = visible(raw)
    begin = masked.index(start)
    stop = begin + len(start) if end is None else masked.index(end, begin) + len(end)
    snippet = raw[begin:stop]
    folder = '' if filename in {'main.tex', 'paper_layout.tex'} else 'sections/'
    entries[key] = {'text': render(snippet), 'source': {'file': 'iclr2026/' + folder + filename,
        'start_line': raw[:begin].count('\n') + 1, 'end_line': raw[:stop].count('\n') + 1,
        'raw_tex': snippet, 'file_sha256': hashlib.sha256(raw.encode()).hexdigest()}}

A='0_abstract.tex'; I='1_introduction_clean.tex'; P='3_poc.tex'; T='4_taxonomy.tex'; X='5_analysis.tex'; G='6_gradient.tex'
take('title','main.tex',r'\title{\methodname: When Does Visual\\Generation Improve Visual Understanding}')
take('description',A,r'We ask: \xd{when and how does visual generation supervision improve visual understanding?}')
take('tldr_question_1',I,r'what training curriculum enables visual generation to improve visual understanding?')
take('tldr_question_2',I,r'which visual generation tasks help which understanding tasks?')
take('tldr_question_3',I,r'What explains transfer from visual generation to understanding?')
take('finding_a',P,'An initial I2I training stage that updates parameters shared with the I2T objective provides a useful initialization for subsequent I2T learning.')
take('finding_b',X,'Visual Generation supervision yields significant gains for specific visual understanding capabilities, through both related tasks and transfer across task families.')
take('alignment_finding',G,'Gradient alignment is concentrated in early pre-attention normalization layers and is positively associated with downstream transfer across both understanding capabilities and individual source-target pairs.')
take('overview_caption_short',I,r'When and how does visual generation improve visual understanding?')
take('controlled_heading',P,r'\section{Does visual generation help visual understanding?}')
take('controlled_lead',P,'To isolate the effect of confounding factors, we construct paired I2I and I2T tasks','other factors.')
take('bagel_architecture_caption',P,'We instantiate this on BAGEL, a unified multimodal model based on a Mixture-of-Transformers (MoT) architecture,','paired I2T task.')
take('controlled_caption',P,'(a) Controlled Jigsaw and Zoom-In tasks with image and text outputs.')
take('controlled_inputs',P,'In Jigsaw, patches of an image are shuffled,','correct order.')
take('controlled_output',P,'For each input, the I2I objective produces the correctly ordered image,','output modality.')
take('recipe_heading',P,r'\paragraph{Which training recipe transfers best?}')
take('recipe_result',P,r'We therefore use I2I $\rightarrow$ I2T as the default recipe in subsequent experiments.')
take('recipe_finding',P,'An initial I2I training stage that updates parameters shared with the I2T objective provides a useful initialization for subsequent I2T learning.')
take('scaling_caption',P,'(b) I2T accuracy versus I2I training examples','100k I2I examples.')
take('taxonomy_heading',T,r'\section{\methodname: A unified taxonomy of visual capabilities}')
take('taxonomy_lead',T,'Existing benchmarks typically organize visual tasks','training objective.')
take('taxonomy_caption',T,'A unified taxonomy of visual tasks organized into three broad families:','same visual hierarchy.')
take('taxonomy_annotation',T,'Once the taxonomy is fixed,','yielding 9,444 samples.')
take('transfer_heading',X,r'\section{Which visual generation tasks help which visual understanding tasks?}')
take('transfer_scope',X,'To study this, we evaluate all 19 I2I tasks','25 understanding capabilities.')
take('taxonomy_extensions',X,'To study this, we evaluate all 19 I2I tasks','25 understanding capabilities.')
take('transfer_caption',X,'Each column corresponds to an I2I source task','relative to the I2T-only baseline.')
take('transfer_lead',X,'Visual Generation supervision yields significant gains for specific visual understanding capabilities, through both related tasks and transfer across task families.')
take('related_heading',X,r'\paragraph{Shared visual operations predict several of the strongest gains.}')
take('related_example',X,'Localization and object pointing produce the largest improvements in counting','spatially localized.')
take('depth_example',X,'Similarly, Z-depth, Euclidean depth, and surface normals improve metric 3D relation','relative spatial arrangement of image regions.')
take('cross_heading',X,r'\paragraph{Useful transfer is not confined to closely matched capabilities.}')
take('cross_results',X,'Inpainting improves both counting','support category recognition.')
take('alignment_heading',G,r'\section{What explains visual generation-to-understanding transfer?}')
take('alignment_setup',G,'For each task, we sample 500 matched examples and compute I2I and I2T gradients at the pretrained checkpoint.')
take('alignment_results',G,'average alignment and average transfer are strongly positively correlated','larger average gains from I2I training.')
take('alignment_lead',G,'Alignment and transfer are positively correlated across these 133 pairs ($r=0.529$).')
take('alignment_caption',G,'(a,b) Gradient alignment for the controlled Jigsaw and Zoom-In pairs','all 133 source--target pairs.')
take('alignment_transfer_caption',G,'(c) Mean gradient alignment versus mean transfer','all 133 source--target pairs.')
take('nav_controlled',P,'visual generation help visual understanding?')
take('nav_training',P,'training recipe')
take('nav_taxonomy',T,r'\methodname')
take('nav_transfer',X,'visual generation tasks help which visual understanding tasks?')
take('nav_alignment',G,'visual generation-to-understanding transfer?')
result={'manuscript_project':'https://www.overleaf.com/project/69d99c42c6f3e61ae13f54f1','manuscript_commit':REV,'rendering':'Contiguous source excerpts with only LaTeX typography and method macro expanded.','excerpts':entries}
out=BASE/'content/manuscript-excerpts.json'
serialized=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
if '--check' in sys.argv:
    assert out.read_text()==serialized,'Stored excerpts do not match current source'
    print(f'{len(entries)} current excerpts verified at {REV}')
else:
    out.write_text(serialized)
    print(f'Extracted {len(entries)} current excerpts')
