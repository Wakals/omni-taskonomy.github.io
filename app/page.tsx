import { FileText, Code, Boxes } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import manuscriptContent from '@/content/manuscript-excerpts.json';
import authorContent from '@/content/author-provided-copy.json';
import paperMetadata from '@/content/paper-metadata.json';
import controlledAnimation from '@/content/controlled-tasks-animation.json';
import citation from '@/content/citation.json';
import { InteractiveTaxonomy, InteractiveTransferMap } from '@/components/interactive-figures';
import { GradientBars } from '@/components/gradient-bars';
import { GradientTransferScatter } from '@/components/gradient-transfer-scatter';
import { coloredTerms } from '@/components/colored-terms';
import { TldrTeaser } from '@/components/tldr-teaser';

const resourceLinks = {
  paper: '/paper.pdf',
  github: 'https://github.com/para-lost/OmniTaskonomy/tree/main',
  huggingface: 'https://huggingface.co/collections/Wakals/omnitaskonomy',
};
const excerpts = manuscriptContent.excerpts;
const authorExcerpts = authorContent.excerpts;
type AuthorId = keyof typeof authorExcerpts;
type ExcerptId = keyof typeof excerpts;
const text = (id: ExcerptId) => excerpts[id].text;
const source = (id: ExcerptId) => `${excerpts[id].source.file}:${excerpts[id].source.start_line}-${excerpts[id].source.end_line}`;
const sections: [string, ExcerptId][] = [
  ['controlled', 'nav_controlled'], ['recipe', 'nav_training'], ['taxonomy', 'nav_taxonomy'],
  ['transfer', 'nav_transfer'], ['alignment', 'nav_alignment'],
];
const emphasis: Partial<Record<ExcerptId, string[]>> = {
  tldr_question_1: ['training curriculum', 'improve visual understanding'],
  tldr_question_2: ['visual generation tasks', 'understanding tasks'],
  tldr_question_3: ['explains transfer'],
  finding_a: ['initial I2I training stage', 'useful initialization'],
  finding_b: ['significant gains', 'across task families'],
  alignment_finding: ['early pre-attention normalization layers', 'positively associated'],
  controlled_lead: ['paired I2I and I2T tasks'],
  recipe_result: ['I2I → I2T'],
  recipe_finding: ['initial I2I training stage', 'useful initialization'],
  taxonomy_lead: ['OmniTaskonomy', 'shared hierarchy'],
  taxonomy_annotation: ['Three VLM judges', 'yielding 9,444 samples'],
  transfer_lead: ['significant gains', 'across task families'],
  related_example: ['Localization', 'object pointing', '+2.5', '+2.0'],
  depth_example: ['Z-depth', 'metric 3D relation', 'Jigsaw', '2D ordering'],
  cross_results: ['Inpainting', '2.5D segmentation'],
  alignment_module_result: ['pre-attention RMSNorm parameters'],
  alignment_layer_result: ['earlier transformer layers'],
  alignment_results: ['strongly positively correlated', 'r=0.795'],
  alignment_lead: ['positively correlated', 'r=0.529', 'optimization-level signal'],
};
// Split and wrap existing characters only: emphasis never creates or edits copy.
function formatted(value: string, highlights: string[] = []): ReactNode {
  if (!highlights.length) return coloredTerms(value);
  const terms = [...new Set(highlights)].sort((a, b) => b.length - a.length);
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(${terms.map(escape).join('|')})`, 'gi');
  return value.split(pattern).map((part, i) => {
    const lower = part.toLowerCase();
    if (highlights.some(term => term.toLowerCase() === lower)) return <strong key={i}>{coloredTerms(part)}</strong>;
    return coloredTerms(part);
  });
}
function ResourceButton({ label, href, children }: { label: string; href: string; children: ReactNode }) {
  return <a className="resource-button" href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined}>{children}<span>{label}</span></a>;
}
function PaperAuthors() {
  return <div className="paper-authors" data-paper-metadata="author-block">
    <div className="author-list">{paperMetadata.authors.map(author => <span className="author" key={author.name}><a href={author.homepage} target="_blank" rel="noreferrer">{author.name}</a> <sup>{author.marks}</sup>{' '}</span>)}</div>
    <div className="affiliation-list">{paperMetadata.affiliations.map(affiliation => <span key={affiliation.mark}><sup>{affiliation.mark}</sup> {affiliation.name}{' '}</span>)}</div>
    <div className="author-notes">{paperMetadata.notes.map(note => <span key={note}>{note}{' '}</span>)}</div>
  </div>;
}
function Passage({ id, className }: { id: ExcerptId; className?: string }) {
  return <p className={className} data-manuscript-excerpt={id} data-source={source(id)}>{formatted(text(id), emphasis[id])}</p>;
}
function AuthorPassage({ id, highlights = [] }: { id: AuthorId; highlights?: string[] }) {
  return <p data-author-copy={id}>{formatted(authorExcerpts[id].text, highlights)}</p>;
}
function AbilityNode({ id, kind }: { id: 'ability_generation' | 'ability_understanding'; kind: string }) {
  const value = authorExcerpts[id].text;
  const split = value.indexOf(' (');
  return <div className={'ability-node ability-' + kind} data-author-copy={id}>
    <span className="ability-title">{value.slice(0, split)}</span>{' '}
    <span className="ability-definition">{value.slice(split + 1)}</span>
  </div>;
}
function AbilityTransfer() {
  return <div className="ability-transfer" role="group" aria-label="Ability Transfer">
    <AbilityNode id="ability_generation" kind="generation" />
    <div className="ability-arrow"><span data-author-copy="ability_transfer">{authorExcerpts.ability_transfer.text}</span><i aria-hidden="true"><span className="ability-flow" /><span className="ability-comet" /></i></div>
    <AbilityNode id="ability_understanding" kind="understanding" />
  </div>;
}
function PlotLegend() {
  return <div className="plot-legend" aria-label="Plot legend">
    <span className="legend-item"><i className="legend-dot positive" aria-hidden="true" /><span data-author-copy="legend_blue">{authorExcerpts.legend_blue.text}</span></span>
    <span className="legend-item"><i className="legend-dot negative" aria-hidden="true" /><span data-author-copy="legend_red">{authorExcerpts.legend_red.text}</span></span>
  </div>;
}
// Lay out the author's exact recipe strings as routes plus descriptions.
function RecipeRoute({ value }: { value: string }) {
  return <span className="recipe-route">{value.split(/(Frozen I2I|I2I|I2T|Mixed|→)/g).map((part, i) => {
    const kind = part === 'I2I' || part === 'Frozen I2I' ? 'generation' : part === 'I2T' ? 'understanding' : part === 'Mixed' ? 'mixed' : part === '→' ? 'arrow' : 'suffix';
    return <span key={i} className={`route-${kind}`}>{part}</span>;
  })}</span>;
}
function RecipeNote() {
  const ids: AuthorId[] = ['recipe_r1', 'recipe_r2', 'recipe_r3', 'recipe_r4', 'recipe_r5', 'recipe_r6'];
  return <aside className="recipe-note" id="training-recipes" role="note" aria-label="Training recipes">
    <div className="recipe-note-intro"><AuthorPassage id="recipe_intro" /></div>
    <ol className="recipe-list">{ids.map((id, index) => {
      const value = authorExcerpts[id].text;
      const stop = value.indexOf('. ');
      return <li key={id} className={`recipe-item recipe-${index + 1}`} data-author-copy={id}>
        <div className="recipe-item-header"><RecipeRoute value={value.slice(0, stop + 1)} /></div>{' '}
        <p className="recipe-description">{formatted(value.slice(stop + 2))}</p>
      </li>;
    })}</ol>
  </aside>;
}
function Heading({ id, number }: { id: ExcerptId; number: string }) {
  return <div className="section-heading"><span className="section-index" aria-hidden="true">{number}</span><h2 data-manuscript-excerpt={id} data-source={source(id)}>{formatted(text(id))}</h2></div>;
}
function Figure({ name, file = `${name}.png`, still, caption, captionOverride, width, height, eager = false, className = '', note, showCaption = true }: { name: string; file?: string; still?: string; caption: ExcerptId; captionOverride?: AuthorId; width: number; height: number; eager?: boolean; className?: string; note?: string; showCaption?: boolean }) {
  const captionValue = captionOverride ? authorExcerpts[captionOverride].text : text(caption);
  const src = `/figures/${file}`;
  const image = <img src={src} alt={captionValue} width={width} height={height} loading={eager ? 'eager' : 'lazy'} />;
  return <figure className={className}>
    <div className="figure-frame" style={{ '--figure-mobile-width': width > 1500 ? '820px' : '740px' } as CSSProperties}>
      <div className="figure-viewport" tabIndex={0} role="region" aria-label="Scrollable figure">
        <a className="figure-link" href={src} target="_blank" rel="noreferrer" aria-label="Open full-resolution figure">
          {/* An animated figure falls back to its own completed frame for readers who reduce motion. */}
          {still ? <picture><source media="(prefers-reduced-motion: reduce)" srcSet={`/figures/${still}`} />{image}</picture> : image}
        </a>
      </div>
    </div>
    {showCaption && <figcaption className="figure-caption">{captionOverride
      ? <span data-author-copy={captionOverride}>{formatted(captionValue)}</span>
      : <span data-manuscript-excerpt={caption} data-source={source(caption)}>{formatted(captionValue, emphasis[caption])}</span>}
      {note && <a href={`#${note}`} className="footnote-ref" aria-label="Training recipe definitions"><sup>1</sup></a>}</figcaption>}
  </figure>;
}

function InteractiveFigure({ caption, children }: { caption: ExcerptId; children: ReactNode }) {
  return <figure className="interactive-figure">
    {children}
    <figcaption className="figure-caption"><span data-manuscript-excerpt={caption} data-source={source(caption)}>{formatted(text(caption), emphasis[caption])}</span></figcaption>
  </figure>;
}

export default function Home() {
  const title = text('title');
  const titleBreak = title.indexOf(': ') + 2;
  return <>
    <a className="skip-link" href="#overview">Skip to content</a>
    <header className="paper-header shell" id="top">
      <h1 data-manuscript-excerpt="title" data-source={source('title')}><span>{formatted(title.slice(0, titleBreak))}</span><span className="title-second">{formatted(title.slice(titleBreak))}</span></h1>
      <PaperAuthors />
      <div className="resource-buttons" aria-label="Project resources">
        <ResourceButton label="Paper" href={resourceLinks.paper}><FileText size={17} aria-hidden="true" /></ResourceButton>
        <ResourceButton label="GitHub" href={resourceLinks.github}><Code size={18} aria-hidden="true" /></ResourceButton>
        <ResourceButton label="Hugging Face" href={resourceLinks.huggingface}><Boxes size={18} aria-hidden="true" /></ResourceButton>
      </div>
    </header>

    <section className="overview shell" id="overview">
      <h2 className="tldr-heading">TL;DR</h2>
      <div className="tldr-box">
        <TldrTeaser><AbilityTransfer /></TldrTeaser>
        <ol className="tldr-questions">
          <li><Passage id="tldr_question_1" /></li>
          <li><Passage id="tldr_question_2" /></li>
          <li><Passage id="tldr_question_3" /></li>
        </ol>
      </div>
      <div className="overview-notes">
        <div><h3 className="finding-label">Finding 1</h3><Passage id="finding_a" /></div>
        <div><h3 className="finding-label">Finding 2</h3><Passage id="finding_b" /></div>
        <div><h3 className="finding-label">Finding 3</h3><Passage id="alignment_finding" /></div>
      </div>
      <Figure name="overview" caption="overview_caption_short" width={1800} height={645} eager className="teaser" showCaption={false} />
      <PlotLegend />
    </section>

    <nav className="section-nav" aria-label="Page sections"><div className="nav-inner"><a href="#top">Top ↑</a>{sections.map(([id, label]) => <a key={id} href={`#${id}`} data-manuscript-excerpt={label}>{formatted(text(label))}</a>)}</div></nav>
    <main>
      <section id="controlled" className="chapter"><div className="shell">
        <Heading id="controlled_heading" number="01" />
        <Passage id="controlled_lead" className="section-lead" />
        <Figure name="controlled-tasks" file={controlledAnimation.animation.file} still={controlledAnimation.still.file} caption="controlled_caption" captionOverride="controlled_caption_web" width={controlledAnimation.animation.size[0]} height={controlledAnimation.animation.size[1]} />

      </div></section>

      <section id="recipe" className="chapter chapter-tinted"><div className="shell">
        <Heading id="recipe_heading" number="02" />
        <RecipeNote />
        <Figure name="scaling" caption="scaling_caption" captionOverride="scaling_caption_web" width={3111} height={1035} />
        <div className="recipe-analysis"><Passage id="recipe_analysis" /><Passage id="recipe_result" /></div>

      </div></section>

      <section id="taxonomy" className="chapter"><div className="shell">
        <Heading id="taxonomy_heading" number="03" />
        <div className="section-lead"><AuthorPassage id="taxonomy_lead_web" highlights={["OmniTaskonomy"]} /></div>
        <InteractiveFigure caption="taxonomy_caption"><InteractiveTaxonomy /></InteractiveFigure>
        <aside className="method-note"><h3>Annotation protocol</h3><Passage id="taxonomy_annotation" /></aside>
      </div></section>

      <section id="transfer" className="chapter chapter-tinted"><div className="shell">
        <Heading id="transfer_heading" number="04" />
        <figure className="interactive-figure"><InteractiveTransferMap /></figure>
        <Passage id="transfer_lead" className="section-lead" />
        <div className="two-columns results-notes">
          <div><h3 data-manuscript-excerpt="related_heading">{formatted(text('related_heading'))}</h3><Passage id="related_example" /><Passage id="depth_example" /></div>
          <div><h3 data-manuscript-excerpt="cross_heading">{formatted(text('cross_heading'))}</h3><Passage id="cross_results" /></div>
        </div>
      </div></section>

      <section id="alignment" className="chapter"><div className="shell">
        <Heading id="alignment_heading" number="05" />
        <Passage id="alignment_setup" className="alignment-experiment-setup" />
        <div className="alignment-bar-pair alignment-bar-grid">
          <figure className="alignment-panel"><GradientBars view="modules" /><figcaption className="association-card-caption" data-author-copy="alignment_modules_caption_web">{formatted(authorExcerpts.alignment_modules_caption_web.text)}</figcaption></figure>
          <figure className="alignment-panel"><GradientBars view="layers" /><figcaption className="association-card-caption" data-author-copy="alignment_layers_caption_web">{formatted(authorExcerpts.alignment_layers_caption_web.text)}</figcaption></figure>
        </div>
        <div className="two-columns results-notes alignment-findings">
          <div><h3 className="standalone-capitalized" data-author-copy="alignment_module_heading_web">{formatted(authorExcerpts.alignment_module_heading_web.text)}</h3><Passage id="alignment_module_result" /></div>
          <div><h3 className="standalone-capitalized" data-author-copy="alignment_layer_heading_web">{formatted(authorExcerpts.alignment_layer_heading_web.text)}</h3><Passage id="alignment_layer_result" /></div>
        </div>
        <div className="alignment-second-experiment">
          <div className="alignment-experiment-setup"><Passage id="alignment_transfer_bridge" /><Passage id="alignment_transfer_setup" /></div>
          <GradientTransferScatter />
          <div className="two-columns results-notes alignment-findings">
            <div><h3 className="standalone-capitalized" data-author-copy="alignment_capability_heading_web">{formatted(authorExcerpts.alignment_capability_heading_web.text)}</h3><AuthorPassage id="alignment_results_web" highlights={["Understanding", "generation", "I2I", "strongly positively correlated", "r=0.795"]} /></div>
            <div><h3 className="standalone-capitalized" data-manuscript-excerpt="alignment_pair_heading">{formatted(text('alignment_pair_heading'))}</h3><Passage id="alignment_lead" /></div>
          </div>
        </div>
      </div></section>

      <section className="citation shell" id="citation" aria-labelledby="citation-heading">
        <h2 id="citation-heading">Citation</h2>
        <pre aria-label="BibTeX citation"><code data-paper-citation="bibtex">{citation.bibtex}</code></pre>
      </section>
    </main>
    <footer className="shell">
      <span data-manuscript-excerpt="title">{formatted(text('title'))}</span><a href="#top">Back to top ↑</a>
      <p data-site-credit="design" className="site-credit">This project page’s design and presentation are inspired by <a href="https://beyond-llms.github.io/" target="_blank" rel="noreferrer">Beyond Language Modeling: An Exploration of Multimodal Pretraining</a> and <a href="https://playful-rats.github.io/" target="_blank" rel="noreferrer">Playful Agentic Robot Learning</a>. We thank their authors for the inspiration.</p>
    </footer>
  </>;
}
