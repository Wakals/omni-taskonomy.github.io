import source from '@/content/gradient-transfer-scatter.json';
import authorCopy from '@/content/author-provided-copy.json';
import { coloredTerms } from '@/components/colored-terms';

type Family = keyof typeof source.families;
type CapabilityPoint = (typeof source.capability.points)[number];
type PairPoint = (typeof source.pairs.points)[number];

const familyColors: Record<Family, string> = { REC: '#0064e0', RCN: '#76aae7', RORG: '#ac97cc' };
const familyNames = source.families as Record<Family, string>;
const captions = authorCopy.excerpts;
const capabilityLabels: Record<string, string> = {
  'i2t:CATEGORY_INSTANCE': 'Category',
  'i2t:COLOR_MATERIAL': 'Appearance',
  'i2t:DEPTH_DISTANCE': 'Depth',
  'i2t:METRIC_3D_RELATION': 'Metric 3D',
  'i2t:RELATIVE_3D_RELATION': '2D spatial',
  'i2t:OBJECT_COUNTING': 'Counting',
  'i2t:CORRESPONDENCE_TRACKING': 'Correspondence',
};
const capabilityLabelOffsets: Record<string, { dx: number; dy: number; anchor: 'start' | 'end' }> = {
  'i2t:CATEGORY_INSTANCE': { dx: 10, dy: -13, anchor: 'start' },
  'i2t:COLOR_MATERIAL': { dx: 11, dy: 22, anchor: 'start' },
  'i2t:DEPTH_DISTANCE': { dx: -12, dy: -10, anchor: 'end' },
  'i2t:METRIC_3D_RELATION': { dx: -12, dy: -12, anchor: 'end' },
  'i2t:RELATIVE_3D_RELATION': { dx: 11, dy: 22, anchor: 'start' },
  'i2t:OBJECT_COUNTING': { dx: 11, dy: -7, anchor: 'start' },
  'i2t:CORRESPONDENCE_TRACKING': { dx: 11, dy: 20, anchor: 'start' },
};
const illustrativePairs = [
  { source: 'taskonomy_edge_texture', target: 'i2t:CATEGORY_INSTANCE', label: '2D edges → Category recognition', x: -.53, y: 3.75, anchor: 'start' as const },
  { source: 'counting', target: 'i2t:OBJECT_COUNTING', label: 'Object pointing → Counting', x: .37, y: 3.75, anchor: 'end' as const },
  { source: 'taskonomy_keypoints3d', target: 'i2t:COLOR_MATERIAL', label: '3D keypoints → Appearance', x: .37, y: -1.55, anchor: 'end' as const },
  { source: 'taskonomy_segment_unsup25d', target: 'i2t:CORRESPONDENCE_TRACKING', label: '2.5D segmentation → Correspondence', x: .37, y: -5.35, anchor: 'end' as const },
];

function Regression({ domain, line, x, y }: { domain: { x: number[]; y: number[] }; line: { slope: number; intercept: number }; x: (v: number) => number; y: (v: number) => number }) {
  const [x1, x2] = domain.x;
  return <line className="association-fit" x1={x(x1)} y1={y(line.slope * x1 + line.intercept)} x2={x(x2)} y2={y(line.slope * x2 + line.intercept)} />;
}

function ScatterFrame({ kind, children }: { kind: 'capability' | 'pairs'; children: (helpers: { x: (v: number) => number; y: (v: number) => number; width: number; height: number; left: number; top: number; plotWidth: number; plotHeight: number; domain: { x: number[]; y: number[] } }) => React.ReactNode }) {
  const width = 560, height = 400, left = 64, top = 34, plotWidth = 466, plotHeight = 304;
  const domain = source[kind].domain;
  const x = (value: number) => left + (value - domain.x[0]) * plotWidth / (domain.x[1] - domain.x[0]);
  const y = (value: number) => top + (domain.y[1] - value) * plotHeight / (domain.y[1] - domain.y[0]);
  const xTicks = kind === 'capability' ? [-.3, -.15, 0, .15] : [-.5, -.25, 0, .25];
  const yTicks = kind === 'capability' ? [-2, -1, 0, 1, 2] : [-6, -3, 0, 3];
  return <svg className="association-plot" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={kind === 'capability' ? 'Mean gradient alignment and transfer by capability' : 'Gradient alignment and transfer for 133 task pairs'}>
    {yTicks.map(tick => <g key={'y' + tick}><line className={tick === 0 ? 'association-zero' : 'association-grid'} x1={left} x2={left + plotWidth} y1={y(tick)} y2={y(tick)} /><text className="association-tick" x={left - 10} y={y(tick) + 5} textAnchor="end">{tick}</text></g>)}
    {xTicks.map(tick => <g key={'x' + tick}><line className={tick === 0 ? 'association-zero' : 'association-grid vertical'} y1={top} y2={top + plotHeight} x1={x(tick)} x2={x(tick)} /><text className="association-tick" x={x(tick)} y={top + plotHeight + 24} textAnchor="middle">{tick}</text></g>)}
    <text className="association-axis-label" x={left + plotWidth / 2} y={height - 12} textAnchor="middle">{kind === 'capability' ? 'Mean gradient alignment across 19 sources' : 'Gradient alignment'}</text>
    <text className="association-axis-label" transform={`translate(18 ${top + plotHeight / 2}) rotate(-90)`} textAnchor="middle">{kind === 'capability' ? 'Mean transfer gain (pp)' : 'Transfer gain (pp)'}</text>
    {children({ x, y, width, height, left, top, plotWidth, plotHeight, domain })}
  </svg>;
}

function HoverTip({ x, y, width, lines, label }: { x: number; y: number; width: number; lines: string[]; label: string }) {
  const height = lines.length * 15 + 14;
  const tx = x > 300 ? x - width - 12 : x + 12;
  const ty = y < height + 16 ? y + 12 : y - height - 12;
  const boxX = Math.min(x - 10, tx) - 2, boxY = Math.min(y - 10, ty) - 2;
  const boxWidth = Math.max(x + 10, tx + width) - boxX + 2;
  const boxHeight = Math.max(y + 10, ty + height) - boxY + 2;
  return <foreignObject className="association-html-hit-wrap" x={boxX} y={boxY} width={boxWidth} height={boxHeight}>
    <div className="association-html-hit-area">
      <button type="button" className="association-html-hit" aria-label={label} style={{ left: x - boxX - 9, top: y - boxY - 9 }} />
      <div className="association-html-tooltip" style={{ left: tx - boxX, top: ty - boxY, width, height }} aria-hidden="true">
        {lines.map((line, index) => <span key={line} className={index === 0 ? 'tip-title' : undefined}>{line}</span>)}
      </div>
    </div>
  </foreignObject>;
}

function CapabilityScatter() {
  return <article className="association-card">
    <div className="association-title"><strong>Transfer by capability</strong><span>r = {source.capability.correlation.toFixed(3)}</span></div>
    <ScatterFrame kind="capability">{({ x, y, domain }) => <>
      <Regression domain={domain} line={source.capability.regression} x={x} y={y} />
      {source.capability.points.map((point: CapabilityPoint) => {
        const px = x(point.alignment), py = y(point.transfer), label = capabilityLabelOffsets[point.id];
        const value = `${point.transfer >= 0 ? '+' : ''}${point.transfer.toFixed(2)}`;
        const ariaLabel = `${point.name}: mean alignment ${point.alignment.toFixed(3)}, mean transfer ${point.transfer.toFixed(2)} percentage points`;
        return <g key={point.id} className="association-point">
          <title>{`${point.name} — alignment ${point.alignment.toFixed(3)}, transfer ${value} pp`}</title>
          <circle cx={px} cy={py} r="6.5" fill={familyColors[point.family as Family]} />
          <text x={px + label.dx} y={py + label.dy} textAnchor={label.anchor}>{capabilityLabels[point.id]}</text>
          <HoverTip x={px} y={py} width={220} label={ariaLabel} lines={[point.name, familyNames[point.family as Family], `Alignment ${point.alignment.toFixed(3)} · Transfer ${value} pp`]} />
        </g>;
      })}
    </>}</ScatterFrame>
    <p className="association-card-caption" data-author-copy="alignment_capability_caption_web">{coloredTerms(captions.alignment_capability_caption_web.text)}</p>
  </article>;
}

function PairScatter() {
  return <article className="association-card">
    <div className="association-title"><strong>Transfer by task pair</strong><span>133 pairs · r = {source.pairs.correlation.toFixed(3)}</span></div>
    <ScatterFrame kind="pairs">{({ x, y, domain }) => <>
      <path className="association-ellipse" d={source.pairs.ellipse.map((point, index) => `${index ? 'L' : 'M'}${x(point[0])},${y(point[1])}`).join(' ') + ' Z'} />
      <Regression domain={domain} line={source.pairs.regression} x={x} y={y} />
      {source.pairs.points.map((point: PairPoint) => {
        const px = x(point.alignment), py = y(point.transfer);
        const value = `${point.transfer >= 0 ? '+' : ''}${point.transfer.toFixed(2)}`;
        const ariaLabel = `${point.source} to ${point.target}: alignment ${point.alignment.toFixed(3)}, transfer ${point.transfer.toFixed(2)} percentage points`;
        return <g key={point.source_id + point.target_id} className="association-pair">
          <title>{`${point.source} → ${point.target} — alignment ${point.alignment.toFixed(3)}, transfer ${value} pp`}</title>
          <circle cx={px} cy={py} r="4.2" fill={familyColors[point.target_family as Family]} />
          <HoverTip x={px} y={py} width={250} label={ariaLabel} lines={[point.source, `→ ${point.target}`, `Alignment ${point.alignment.toFixed(3)} · Transfer ${value} pp`]} />
        </g>;
      })}
      {illustrativePairs.map(label => {
        const point = source.pairs.points.find(item => item.source_id === label.source && item.target_id === label.target)!;
        const tx = x(label.x), ty = y(label.y);
        return <g className="association-annotation" key={label.source + label.target}>
          <line x1={x(point.alignment)} y1={y(point.transfer)} x2={tx} y2={ty + 4} />
          <text x={tx} y={ty} textAnchor={label.anchor}>{label.label}</text>
        </g>;
      })}
    </>}</ScatterFrame>
    <p className="association-card-caption" data-author-copy="alignment_pair_caption_web">{coloredTerms(captions.alignment_pair_caption_web.text)}</p>
  </article>;
}

export function GradientTransferScatter() {
  return <div className="association-figure" data-visual-source="section6-gradient-and-transfer-csv">
    <div className="association-guide"><span>Hover, tap, or focus a point to inspect it</span><span className="association-legend">{(Object.keys(familyNames) as Family[]).map(family => <span key={family}><i style={{ background: familyColors[family] }} />{familyNames[family]}</span>)}</span></div>
    <div className="association-grid"><CapabilityScatter /><PairScatter /></div>
  </div>;
}
