'use client';

import { useState } from 'react';
import data from '@/content/gradient-transfer-final-overlay.json';
import authorCopy from '@/content/author-provided-copy.json';
import { coloredTerms } from '@/components/colored-terms';

type Family = keyof typeof data.families;
type CapabilityPoint = (typeof data.capability.points)[number];
type PairPoint = (typeof data.pairs.points)[number];
type Point = CapabilityPoint | PairPoint;

const familyColors: Record<Family, string> = {
  REC: '#0064e0',
  RCN: '#76aae7',
  RORG: '#ac97cc',
};

function valueLabel(value: number, digits: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(digits)}`;
}

function InteractivePaperPanel({
  kind,
  image,
  caption,
  captionId,
  points,
}: {
  kind: 'capability' | 'pairs';
  image: string;
  caption: string;
  captionId: 'alignment_capability_caption_web' | 'alignment_pair_caption_web';
  points: readonly Point[];
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const activeIndex = pinned ?? hovered;
  const active = activeIndex === null ? null : points[activeIndex];
  const isPair = kind === 'pairs';

  return <figure className="association-paper-panel final-scatter-card">
    <div className="final-scatter-stage" onPointerLeave={() => setHovered(null)}>
      <img src={image} alt={caption} width={900} height={570} loading="lazy" />
      <svg className="final-scatter-overlay" viewBox="0 0 900 570" aria-label={isPair ? 'Interactive transfer plot for 133 source-target task pairs' : 'Interactive transfer plot for seven understanding capabilities'}>
        {points.map((point, index) => {
          const selected = activeIndex === index;
          const title = 'name' in point ? point.name : point.label || `${data.families[point.family as Family]} source-target pair`;
          return <circle
            key={isPair ? `pair-${'id' in point ? point.id : index}` : title}
            className={selected ? 'final-scatter-hit active' : 'final-scatter-hit'}
            cx={point.image_x}
            cy={point.image_y}
            r={selected ? 11 : 9}
            fill={familyColors[point.family as Family]}
            role="button"
            tabIndex={index === 0 || selected ? 0 : -1}
            aria-label={`${title}; alignment ${valueLabel(point.alignment, 3)}; transfer ${valueLabel(point.transfer, 2)} percentage points`}
            onPointerEnter={() => setHovered(index)}
            onFocus={() => setHovered(index)}
            onBlur={() => setHovered(null)}
            onClick={() => setPinned(current => current === index ? null : index)}
          />;
        })}
      </svg>
      {active && <div
        className={`final-scatter-tooltip ${active.image_x > 610 ? 'align-right' : ''} ${active.image_y < 135 ? 'below' : ''}`}
        style={{ left: `${active.image_x / 9}%`, top: `${active.image_y / 5.7}%` }}
        role="status"
      >
        <strong>{'name' in active ? active.name : active.label || `${data.families[active.family as Family]} source-target pair`}</strong>
        <span>{data.families[active.family as Family]}</span>
        <span>Alignment {valueLabel(active.alignment, 3)} · Transfer {valueLabel(active.transfer, 2)} pp</span>
      </div>}
    </div>
    <figcaption className="figure-caption"><span data-author-copy={captionId}>{coloredTerms(caption)}</span></figcaption>
  </figure>;
}

export function FinalAlignmentScatter() {
  return <div className="final-association-grid" data-visual-source="final-paper-vector-pdf">
    <InteractivePaperPanel
      kind="capability"
      image="/figures/alignment-capability-final.png"
      caption={authorCopy.excerpts.alignment_capability_caption_web.text}
      captionId="alignment_capability_caption_web"
      points={data.capability.points}
    />
    <InteractivePaperPanel
      kind="pairs"
      image="/figures/alignment-pairs-final.png"
      caption={authorCopy.excerpts.alignment_pair_caption_web.text}
      captionId="alignment_pair_caption_web"
      points={data.pairs.points}
    />
  </div>;
}
