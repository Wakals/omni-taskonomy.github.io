"""Fail if rendered research text is not an exact registered manuscript excerpt."""
from html.parser import HTMLParser
from pathlib import Path
import json,re,sys,urllib.request
import v12_audit
BASE=Path(__file__).resolve().parents[1]
book=json.loads((BASE/'content/manuscript-excerpts.json').read_text())
excerpts=book['excerpts']
author_excerpts=json.loads((BASE/'content/author-provided-copy.json').read_text())['excerpts']
paper_metadata=json.loads((BASE/'content/paper-metadata.json').read_text())
citation=json.loads((BASE/'content/citation.json').read_text())
teaser_labels=json.loads((BASE/'content/tldr-teaser.json').read_text())['labels']
def clean(s): return re.sub(r'\s+',' ',s).strip()
ui={'Skip to content','Read the manuscript','↗','Top ↑','View full size ↗','→','Manuscript ↗','Back to top ↑','Abstract','Training recipes','Annotation protocol','01','02','03','04','05','TL;DR','Paper','GitHub','Hugging Face','🤗','1','2','3','Finding 1','Finding 2','Finding 3','*'}
ui.update({'Visual Generation · I2I','Visual Understanding · I2T',
 'Click a node to explore','OmniTaskonomy','I2I','I2T',
 'Hover to magnify · click to pin','Negative','Positive','p < 0.05','I2I supervision task',
 'I2T capability','−15 pp','+15 pp','Close'})
ui.update({'Swipe to explore', 'Swipe to explore · tap a cell', 'Citation', '% BibTeX pending.', 'Module groups', 'RMSNorm layers', 'Full figure ↗', 'Source code ↗', 'Jigsaw', 'Zoom-In', 'Minibatch gradient alignment'})
ui.add('Outlined: p < 0.05 (two-sided paired permutation test vs. I2T-only)')
gradient=json.loads((BASE/'content/gradient-bars-v13.json').read_text())
ui.update(gradient['module_labels'])
ui.update('Layer '+str(i) for i in range(28))
ui.update(format(v,'.2f') for area in ('module_values','layer_values') for task in ('jigsaw','zoomin') for v in gradient[area][task])
ui.update(format(v,'.1f') for v in (-0.5,-0.1,0,0.2,0.4,0.5,0.6,1))
credit='This project page’s design and presentation are inspired by Beyond Language Modeling: An Exploration of Multimodal Pretraining and Playful Agentic Robot Learning. We thank their authors for the inspiration.'
class Audit(HTMLParser):
 def __init__(self):
  super().__init__();self.depth=0;self.skip=[];self.visual=[];self.visual_sources=[];self.active=None;self.matched=[];self.author_matched=[];self.teaser_matched=[];self.v12_matched=[];self.images=0;self.description=False;self.errors=[];self.selects=[]
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs);self.depth+=1
  if tag in {'head','script','style'}: self.skip.append((tag,self.depth))
  if attrs.get('data-visual-source'):
   assert attrs['data-visual-source'] in {'controlled-gradient-json','section6-gradient-and-transfer-csv','minibatch-gradient-html'}
   self.visual.append((tag,self.depth));self.visual_sources.append(attrs['data-visual-source'])
  if tag=='select': self.selects.append(attrs.get('aria-label'))
  if tag=='meta' and attrs.get('name')=='description':
   assert attrs['content']==excerpts['description']['text'];self.description=True
  if tag=='img':
   assert attrs.get('alt') in ({v['text'] for v in excerpts.values()} | {v['text'] for v in author_excerpts.values()}),'Unmapped image alt text';self.images+=1
  key=attrs.get('data-manuscript-excerpt')
  author_key=attrs.get('data-author-copy')
  v12_key=next(((kind,attrs[kind]) for kind in ('data-v12-copy','data-v12-metric','data-v12-view') if kind in attrs),None)
  metadata_key=attrs.get('data-paper-metadata')
  teaser_key=attrs.get('data-teaser-copy')
  if attrs.get('data-paper-citation')=='bibtex':
   assert self.active is None,'Nested provenance records'
   self.active={'depth':self.depth,'tag':tag,'key':None,'author_key':None,'v12_key':None,'metadata_key':'citation','teaser_key':None,'parts':[]}
  if key or author_key or v12_key or attrs.get('data-site-credit') or metadata_key or teaser_key:
   assert self.active is None,'Nested provenance records'
   self.active={'depth':self.depth,'tag':tag,'key':key,'author_key':author_key,'v12_key':v12_key,'metadata_key':metadata_key,'teaser_key':teaser_key,'parts':[]}
  if tag in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}: self.depth-=1
 def handle_startendtag(self,tag,attrs):
  self.handle_starttag(tag,attrs)
  if tag not in {"area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"}:self.handle_endtag(tag)
 def handle_endtag(self,tag):
  if self.active and self.active['depth']==self.depth:
   record=self.active;actual=clean(''.join(record['parts']));key=record['key']
   author_key=record['author_key']
   teaser_key=record['teaser_key']
   expected=excerpts[key]['text'] if key else author_excerpts[author_key]['text'] if author_key else teaser_labels[teaser_key] if teaser_key else paper_metadata['display_text'] if record['metadata_key']=='author-block' else credit
   if record['metadata_key']=='citation':expected=clean(citation['bibtex'])
   if record['v12_key']:
    kind,vkey=record['v12_key']
    expected={'data-v12-copy':v12_audit.copy,'data-v12-metric':v12_audit.metric,'data-v12-view':v12_audit.view}[kind](vkey)
    expected=clean(str(expected))
    self.v12_matched.append(record['v12_key'])
   if actual!=expected:self.errors.append({'key':key,'actual':actual,'expected':expected})
   if key:self.matched.append(key)
   if author_key:self.author_matched.append(author_key)
   if teaser_key:self.teaser_matched.append(teaser_key)
   self.active=None
  if self.skip and self.skip[-1]==(tag,self.depth):self.skip.pop()
  if self.visual and self.visual[-1]==(tag,self.depth):self.visual.pop()
  self.depth-=1
 def handle_data(self,data):
  if self.skip:return
  if self.active:self.active['parts'].append(data)
  elif self.visual:return
  elif clean(data) and clean(data) not in ui:self.errors.append({'unmapped_text':clean(data)})
url=sys.argv[1]
with urllib.request.urlopen(url) as response:
 assert response.status==200
 html=response.read().decode()
audit=Audit();audit.feed(html)
assert not audit.errors,json.dumps(audit.errors,ensure_ascii=False,indent=2)
assert audit.description and audit.images==3,(audit.description,audit.images)
assert len(audit.matched)>=32,audit.matched
assert {'tldr_question_1','tldr_question_2','tldr_question_3'} <= set(audit.matched)
assert 'tldr_taxonomy_compact' not in audit.matched
assert 'overview_caption_short' not in audit.matched
assert {'ability_generation','ability_transfer','ability_understanding'} <= set(audit.author_matched)
assert 'class="task-pair"' not in html
assert 'Original paper figure' not in html and 'class="ut-modalities"' not in html
assert 'id="citation"' in html and 'data-paper-citation="bibtex"' in html
assert citation['manuscript_commit']==book['manuscript_commit']
assert '% BibTeX pending.' not in html
assert paper_metadata['manuscript_commit']==book['manuscript_commit']
assert len(paper_metadata['authors'])==16
assert all(author.get('homepage','').startswith('https://') for author in paper_metadata['authors'])
assert all(f'href="{author["homepage"]}"' in html for author in paper_metadata['authors'])
assert 'href="/paper.pdf"' in html
assert 'href="https://github.com/omni-taskonomy/omni-taskonomy.github.io"' in html
assert 'href="https://huggingface.co/collections/Wakals/omnitaskonomy"' in html
assert set(audit.author_matched)==set(author_excerpts),audit.author_matched
assert set(audit.teaser_matched)==set(teaser_labels),audit.teaser_matched
assert 'tldr-crops/jigsaw-i2i.png' not in html and 'tldr-crops/jigsaw-i2t.png' not in html
assert sum(k=='data-v12-metric' for k,v in audit.v12_matched)==19*19
assert audit.selects==[],audit.selects
assert audit.visual_sources==['controlled-gradient-json','controlled-gradient-json','section6-gradient-and-transfer-csv'],audit.visual_sources
assert 'Minibatch gradient alignment' not in html
assert all(v.split('|')[3]=='delta' for k,v in audit.v12_matched if k=='data-v12-metric')
assert len({v for k,v in audit.v12_matched if k=='data-v12-copy' and v.startswith('leaf|') and v.endswith('|name')})==44
print(json.dumps({'source_commit':book['manuscript_commit'],'rendered_excerpt_instances':len(audit.matched),'unique_rendered_excerpts':len(set(audit.matched)),'author_provided_excerpts':len(audit.author_matched),'teaser_figure_labels':len(audit.teaser_matched),'manuscript_derived_image_alts':audit.images,'v12_source_and_numeric_records':len(audit.v12_matched),'metadata_verbatim':audit.description,'unmapped_research_text':0},indent=2))
