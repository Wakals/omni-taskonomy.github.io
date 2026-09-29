'use client';
import { mathNumbers } from '@/components/colored-terms';

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { data, leaves, familyColors, metric, number, fill, rowsFor, modelsFor, sourceCopy, treeLeavesFor, viewLabel, type Leaf } from '@/lib/unitaskonomy';

function V({ id }: { id: string }) { return <span data-v12-copy={id}>{sourceCopy(id)}</span>; }
function Value({ scope, row, model, precision = 1 }: { scope: string; row: string; model: string; precision?: number }) {
  return <span data-v12-metric={[scope, row, model, 'delta', precision].join('|')}>{number(metric(scope, row, model).delta, precision, true)}</span>;
}
function Modality({ role }: { role: string }) {
  return <span className={'ut-modality ut-' + role}>{role === 'i2i' ? 'Visual Generation · I2I' : 'Visual Understanding · I2T'}</span>;
}

export function InteractiveTaxonomy() {
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [selected, setSelected] = useState<Leaf | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  // Start with one branch on phones; each family remains independently expandable.
  useEffect(() => {
    if (window.matchMedia('(max-width: 760px)').matches) setCollapsed(data.tree.families.slice(1).map(f => f.id));
  }, []);
  const sample = selected?.sample;
  return <div className="ut-figure ut-taxonomy" aria-label="Interactive OmniTaskonomy tree">
    <div className="ut-tree-toolbar"><span>Click a node to explore</span></div>
    <div className="ut-root"><span>OmniTaskonomy</span></div>
    <div className="ut-tree">
      {data.tree.families.map(f => {
        const open = !collapsed.includes(f.id);
        return <div className="ut-family" key={f.id} style={{ '--ut-family': familyColors[f.id] } as CSSProperties}>
          <button className="ut-family-button" aria-expanded={open} aria-controls={'ut-branch-' + f.id} onClick={() => setCollapsed(open ? [...collapsed, f.id] : collapsed.filter(id => id !== f.id))}>
            <span><strong><V id={'family|' + f.id + '|name'} /></strong><small><V id={'family|' + f.id + '|count'} /></small></span>
            {open ? <ChevronDown size={18} /> : <Plus size={18} />}
          </button>
          <ul className="ut-leaves" id={'ut-branch-' + f.id} hidden={!open}>
            {treeLeavesFor(f.id).map(l => <li key={l.id}>
              <button className="ut-leaf" onClick={e => { trigger.current = e.currentTarget; setSelected(l); }} aria-haspopup="dialog" aria-label={l.name + ', ' + l.role.toUpperCase() + ', open definition and example'}>
                <i className={'ut-node-dot ' + l.role} aria-hidden="true" />
                <span className="ut-leaf-name"><V id={'leaf|' + l.id + '|name'} /></span>
                <span className={'ut-role ut-' + l.role}>{l.role.toUpperCase()}</span>
                <span className="ut-count">{l.role === 'i2t' && <V id={'leaf|' + l.id + '|n'} />}</span>
              </button>
            </li>)}
          </ul>
        </div>;
      })}
    </div>
    <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}>
      <DialogContent className="ut-leaf-dialog" finalFocus={trigger} showCloseButton={false}>
        <div className="ut-dialog-close-bar"><DialogClose render={<Button variant="ghost" size="icon" aria-label="Close" />}><X size={20} /></DialogClose></div>
        <div className="ut-dialog-body">{selected && <>
          <div className="ut-dialog-heading"><span className="ut-dialog-family"><V id={'family|' + selected.family + '|name'} /></span><DialogTitle><V id={'leaf|' + selected.id + '|name'} /></DialogTitle><Modality role={selected.role} /></div>
          <DialogDescription className="ut-definition"><V id={'leaf|' + selected.id + '|definition'} /></DialogDescription>
          {sample ? <div className="ut-sample">
            <div className="ut-sample-heading"><strong>Representative example</strong><V id={'sample|' + selected.id + '|benchmark'} /></div>
            <div className={'ut-sample-images' + (sample.images.length > 1 ? ' ut-multi' : '')}>
              {sample.images.map((src, i) => <a key={src} href={src} target="_blank" rel="noreferrer" aria-label="Open example image"><img src={src} alt={selected.name + ' · ' + sample.benchmark + ' · image ' + (i + 1)} loading="lazy" /></a>)}
            </div>
            <p className="ut-question"><V id={'sample|' + selected.id + '|question'} /></p>
            {!!sample.choices?.length && <ul className="ut-choices">{sample.choices.map((c, i) => <li key={i}><V id={'sample|' + selected.id + '|choice:' + i} /></li>)}</ul>}
            {sample.answer && <p className="ut-answer"><strong>Answer</strong><V id={'sample|' + selected.id + '|answer'} /></p>}
            {sample.reason && <details className="ut-routing"><summary>Why this sample belongs here</summary><p><V id={'sample|' + selected.id + '|reason'} /></p></details>}
          </div> : <p className="ut-no-example">No representative image was supplied for this I2I task.</p>}
        </>}</div>
      </DialogContent>
    </Dialog>
  </div>;
}

type Cell = { row: string; model: string };
function CellDetail({ scope, cell }: { scope: string; cell: Cell }) {
  const m = metric(scope, cell.row, cell.model);
  return <>
    <div className="ut-tip-path"><strong><V id={'model|' + cell.model} /></strong><span aria-hidden="true">→</span><V id={'leaf|' + cell.row + '|name'} /></div>
    <div className={'ut-tip-score ' + (m.delta !== null && m.delta < 0 ? 'ut-negative' : '')}><Value scope={scope} row={cell.row} model={cell.model} precision={2} /><small>pp</small></div>
    <div className="ut-tip-comparison"><span><b>{number(m.accuracy)}{m.accuracy !== null && '%'}</b>Checkpoint</span><span><b>{number(m.baseline)}{m.baseline !== null && '%'}</b>I2T-only baseline</span><span><b>{data.heatmap.expected[scope]?.[cell.row]?.toLocaleString('en-US') ?? 0}</b>Samples</span></div>
    <span className="ut-tip-scope"><V id={'scope|' + scope} /></span>
  </>;
}

export function InteractiveTransferMap() {
  const scope = 'ALL';
  const [pinned, setPinned] = useState<Cell | null>(null);
  const [active, setActive] = useState<Cell | null>(null);
  const [focus, setFocus] = useState([0, 0]);
  const grid = useRef<HTMLDivElement>(null);
  const rows = rowsFor('main'), columns = modelsFor('delta');
  const groups: { id: string; count: number }[] = [];
  columns.forEach(m => {
    const id = leaves.get(m.leaf!)!.family;
    if (groups.at(-1)?.id === id) groups[groups.length - 1].count++;
    else groups.push({ id, count: 1 });
  });
  function navigate(e: KeyboardEvent<HTMLButtonElement>, ri: number, ci: number) {
    let r = ri, c = ci;
    if (e.key === 'Escape') { setPinned(null); return; }
    if (e.key === 'ArrowRight') c++;
    else if (e.key === 'ArrowLeft') c--;
    else if (e.key === 'ArrowDown') r++;
    else if (e.key === 'ArrowUp') r--;
    else if (e.key === 'Home') { c = 0; if (e.ctrlKey) r = 0; }
    else if (e.key === 'End') { c = columns.length - 1; if (e.ctrlKey) r = rows.length - 1; }
    else return;
    e.preventDefault();
    r = Math.max(0, Math.min(rows.length - 1, r)); c = Math.max(0, Math.min(columns.length - 1, c));
    setFocus([r, c]);
    const next = grid.current?.querySelector<HTMLButtonElement>('[data-cell="' + r + '-' + c + '"]');
    next?.focus({ preventScroll: true });
    next?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  return <div className="ut-figure ut-transfer" aria-label="Interactive transfer heatmap">
    <div className="ut-map-guide"><span className="pointer-hint">Hover to magnify · click to pin</span><span className="touch-hint">Swipe to explore · tap a cell</span><span className="ut-color-key"><span><i className="ut-swatch negative" />Negative</span><span><i className="ut-swatch positive" />Positive</span><span><i className="ut-swatch significant" />{mathNumbers('Outlined: p < 0.05 (two-sided paired permutation test vs. I2T-only)')}</span></span></div>
    <TooltipProvider delay={70}>
      <div className="ut-map-scroll" ref={grid} tabIndex={0} role="region" aria-label="Transfer matrix; use arrow keys to move between cells">
        <table className="ut-map">
          <colgroup><col className="ut-row-width" />{columns.map(m => <col key={m.id} />)}</colgroup>
          <thead><tr className="ut-group-row"><th /><th colSpan={columns.length} className="ut-axis-top"><span className="ut-modality ut-i2i">I2I supervision task</span></th></tr>
            <tr className="ut-group-row"><th /><>{groups.map(g => <th key={g.id} colSpan={g.count} scope="colgroup" className="ut-family-group" style={{ '--ut-family': familyColors[g.id] } as CSSProperties}><span className={'ut-group-name' + (g.count === 1 ? ' ut-narrow-group' : '')}><V id={'family|' + g.id + '|name'} /></span></th>)}</></tr>
            <tr><th className="ut-axis-side"><span className="ut-modality ut-i2t">I2T capability</span></th>{columns.map(m => <th key={m.id} scope="col" className={'ut-column-label' + (active?.model === m.id ? ' ut-col-active' : '')}><span><V id={'model|' + m.id} /></span></th>)}</tr>
          </thead>
          <tbody>{rows.map((row, ri) => {
            const values = columns.map(m => metric(scope, row.id, m.id).delta);
            const family = leaves.get(row.id)!.family;
            const start = ri === 0 || leaves.get(rows[ri - 1].id)!.family !== family;
            return <tr key={row.id} className={(start ? 'ut-family-start ' : '') + (active?.row === row.id ? 'ut-row-active' : '')} style={{ '--ut-family': familyColors[family] } as CSSProperties}>
              <th scope="row"><V id={'leaf|' + row.id + '|name'} /></th>
              {columns.map((model, ci) => {
                const value = values[ci], significant = metric(scope, row.id, model.id).pValue !== null && metric(scope, row.id, model.id).pValue! < 0.05;
                const isPinned = pinned?.row === row.id && pinned.model === model.id;
                return <td key={model.id}><Tooltip disabled={!!pinned}>
                  <TooltipTrigger render={<button type="button" className={'ut-cell' + (significant ? ' ut-significant' : '') + (isPinned ? ' ut-pinned' : '') + (value === null ? ' ut-missing' : '')}
                    data-cell={ri + '-' + ci} tabIndex={focus[0] === ri && focus[1] === ci ? 0 : -1}
                    aria-label={row.name + ', ' + model.name + ', ' + (value === null ? 'No evaluation samples' : number(value, 2, true) + ' percentage points') + (significant ? ', p less than 0.05' : '')}
                    aria-pressed={isPinned}
                    onPointerEnter={() => setActive({ row: row.id, model: model.id })} onPointerLeave={() => setActive(null)}
                    onFocus={() => { setFocus([ri, ci]); setActive({ row: row.id, model: model.id }); }} onBlur={() => setActive(null)}
                    onKeyDown={e => navigate(e, ri, ci)} onClick={() => setPinned(isPinned ? null : { row: row.id, model: model.id })}>
                    <span className="ut-tile" style={{ background: fill(value, 'delta'), color: value !== null && Math.abs(value) >= 11 ? '#fff' : '#22384c' }}><span className="ut-cell-value"><Value scope={scope} row={row.id} model={model.id} />{significant && <sup>*</sup>}</span></span>
                  </button>} />
                  <TooltipContent className="ut-cell-tooltip" side="top" sideOffset={12}><CellDetail scope={scope} cell={{ row: row.id, model: model.id }} /></TooltipContent>
                </Tooltip></td>;
              })}
            </tr>;
          })}</tbody>
        </table>
      </div>
    </TooltipProvider>
    <div className="ut-map-footer"><span data-v12-view={scope + '|main'}>{viewLabel(scope, 'main')}</span><span className="ut-scale"><span>−15 pp</span><i /><span>+15 pp</span></span></div>
    {pinned && <div className="ut-pinned-detail" role="status"><div><CellDetail scope={scope} cell={pinned} /></div><Button variant="ghost" size="icon" aria-label="Unpin cell" onClick={() => setPinned(null)}><X size={18} /></Button></div>}
  </div>;
}
