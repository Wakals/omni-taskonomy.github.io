# Project-page copy contract

## Final arXiv wording corrections (September 28, 2026)

- The author approved synchronizing the final manuscript corrections and replacing I2I "Pretrain" with "Train" in the previously supplied recipe copy. Keep the final contribution notes consistent with the manuscript.
- The author approved replacing the pending BibTeX placeholder. `content/citation.json` derives the title and author order from the final manuscript, uses year 2026 and the project URL, and deliberately omits an unassigned arXiv identifier. Replace that URL with the authoritative arXiv reference when supplied. This supersedes the earlier pending-citation instruction.
- Keep manuscript excerpts and their source hashes pinned to the current paper revision. Validate the citation as a separate exact provenance record in the rendered-copy audit.

The user requires manuscript-original wording and forbids GPT summaries or paraphrases.

- All research prose, research headings, findings, captions, image alt text, and metadata must come from contiguous passages in the actual manuscript source. Do not polish, shorten by rewriting, correct grammar, or synthesize claims.
- Choose excerpts only from active files included by the manuscript's main.tex. Exclude commented drafts, TODOs, collaborator notes, and template author placeholders.
- Use content/manuscript-excerpts.json through the existing components. Each excerpt records its pinned manuscript commit, file, source lines, raw TeX, and source hash. The source copies are under content/manuscript-sources and are not public assets.
- Permitted transformations are LaTeX presentation only: whitespace, emphasis commands, math delimiters, typography, and expansion of verified manuscript macros. Do not invent citations or resolve them from memory. Prefer self-contained passages that do not require omitted references.
- Interface controls and the existing, separately marked website-design acknowledgment are the only non-manuscript copy on this site. The manuscript acknowledgment names are not rendered, per the author's later request.
- Run python scripts/extract-manuscript.py --check and python scripts/verify-page-copy.py <local-url> before publishing. The second check rejects unregistered rendered research text and verifies captions, alt text, and metadata.
- Follow the user-requested visual direction while preserving original manuscript figures and the current site audience. Use short contiguous excerpts and progressive disclosure for long original passages; never rewrite prose to fit a layout. This site task does not authorize manuscript or bibliography changes on Overleaf.

## Explicit author edits on September 14, 2026

- The author supplied replacement R1–R6 descriptions and a compact plot legend. These are recorded separately in content/author-provided-copy.json and rendered with data-author-copy. This narrowly scoped exception does not permit invented research prose elsewhere.
- Use short, contiguous manuscript excerpts for TL;DR findings. Remove the rejected systematic-transfer and Taken-together lead-ins.
- Explain R1–R6 visibly before the training plot and link its caption to that note. Display annotation and experimental details in readable, open sections; do not hide them behind small disclosure labels.
- The rendered-copy audit must verify both manuscript excerpts and the explicit author-provided replacements against their separate records.

## Author-supplied interactive v12 data

- The author explicitly requested integrating the supplied v12 heatmap, tree and representative samples into the existing homepage. Exact labels, definitions, sample questions/choices/answers and counts from these files are an additional, narrowly scoped source for the two interactive figures.
- Keep this data in content/unitaskonomy-v12.json; source hashes and unchanged example-image hashes are in content/unitaskonomy-v12-provenance.json. Do not paraphrase definitions or generate example images.
- data-v12-copy identifies exact source fields; data-v12-metric identifies numeric cells calculated from the supplied correct/total pairs; data-v12-view identifies displayed row and sample counts. The rendered-copy audit validates these records separately and continues to reject unregistered text.
- Family membership follows the supplied v12 data. Keep the original manuscript figures accessible for comparison; they are a separate, older snapshot. Use the >100 global sample threshold for the default 19 rows, and preserve missing values as missing.
- Run scripts/verify-interactive-data.py in addition to the existing manuscript and rendered-copy checks.

## Subsequent author correction on September 14, 2026

- Remove both "Original paper figure" disclosures from the rendered page, as explicitly requested. This supersedes the earlier requirement to display the original taxonomy and transfer figures; leave their source assets intact.
- Remove the two modality badges above the taxonomy tree. This does not remove modality definitions elsewhere.
- TL;DR should introduce the paired setup and I2I/I2T abbreviations, then list the introduction's three exact research questions before Finding 1/2/3. Remove the UniTaskonomy introduction from TL;DR.

## Typography and heatmap simplification

- All prose uses Times New Roman at the same body size, including the TL;DR questions; the author withdrew the larger question size. Preserve Roman question numbering and Cormorant Garamond headings, including Finding labels.
- The transfer heatmap has only one selector: Benchmark. Show delta from the I2T-only baseline for the original 19-capability main analysis. Remove accuracy mode and the capability-subset selector.
- Keep family headers in their own column groups; the single-column Recognition label must not extend into Reconstruction.

## Mobile layout and pending citation

- Keep the established manuscript copy and uniform Times New Roman body size while adapting spacing, figures, touch targets and dialogs to narrow screens.
- The author requested a final Citation section with pending BibTeX. Display the explicit comment `% BibTeX pending.` until an authoritative entry is supplied; do not invent citation metadata. This is a narrowly scoped interface placeholder, registered in the copy audit.

## Author clarification of I2I families

- The author clarified with an updated paper heatmap that Recognition no longer contains I2I tasks. Semantic segmentation moves from Recognition to Reorganization; I2T Region semantic recognition stays in Recognition.
- Preserve the original v12 export and apply the explicit mapping and heatmap column order in content/unitaskonomy-author-corrections.json. Its source is the author's supplied paper figure. The original 15-column heatmap had 8 Reconstruction and 7 Reorganization columns; the v13 heatmap has 9 and 8 respectively; the combined taxonomy still has three families because I2T retains Recognition.
- This supersedes the original v12 I2I family assignment and single-column Recognition header rule. Do not change measurements, definitions, examples, I2T assignments or manuscript prose to implement this correction.

## Opening ability-transfer diagram

- Remove the standalone overview caption "When does generation help understanding?" from the rendered page; preserve the main paper title and research figure.
- Replace the small I2I/I2T badges with the author's centered diagram: "Image Generation (Image to Image, I2I)" → "Image Understanding (Image to Text, I2T)", with "Ability Transfer" above the arrow. These explicit labels are registered in content/author-provided-copy.json.
- This diagram uses Cormorant Garamond to match the title, with red generation and blue understanding. It is an explicit exception to the uniform body font rule; surrounding prose remains unchanged.

## Consistent modality colors

- Color editable page text for generation / image-to-image / I2I in muted red and image understanding / visual understanding / understanding task(s) / image-to-text / I2T in blue, including terms within existing bold passages. Color bare "understanding" only in paired modality phrases such as "generation and understanding" and "generation-to-understanding"; do not color capability names such as "Appearance understanding" or "Depth understanding." Apply colors by wrapping exact text, without rewriting it.
- Retain the original plot assets and their scientific color scales. The positive/negative transfer legend is independent of prose modality colors.

## Author correction for transfer heading

- The manuscript now says "Which generation data help which visual capabilities?" Render that active heading verbatim. The author's older image-to-image override applied to a superseded manuscript heading.

## Footer acknowledgment placement

- The author requested removing the manuscript acknowledgments section from the project page, including the names "Grace Luo, Amil Dravid, Xiaochuang Han, Yushi Hu." Keep only the website design inspiration credit to Beyond Language Modeling, placed at the bottom of the page.

## TL;DR controlled-example crop

- The author requested removing the TL;DR sentence "We construct paired generation and understanding tasks..." and placing cropped Jigsaw I2I / Jigsaw I2T examples from the controlled-settings figure above the Image Generation / Image Understanding diagram. Use the existing controlled-tasks figure asset for this visual crop; do not add new research prose.

## Author-supplied v13 evaluation and I2I examples

- Preserve the original v12 payload in `content/unitaskonomy-v12.json`. The active heatmap and tree payload is `content/unitaskonomy-v13.json`, derived from the author's v13 HTML and four sample archives. The v13 source hash and image hashes are recorded in `content/unitaskonomy-v12-provenance.json`.
- Inpainting is an I2I Reconstruction node; Localization is an I2I Reorganization node. Semantic segmentation remains an I2I Reorganization node under the author's earlier correction, even though its sample archive labels it Recognition.
- The v13 heatmap includes paper-removed I2T rows. Continue to display only the same 19 I2T capabilities with more than 100 global evaluation samples. Show all 17 v13 I2I model columns. Keep missing values missing.
- The supplied I2I sample instructions and pair definitions may be displayed verbatim as author data. Do not invent new task descriptions or answers. Distinguish the 15 taxonomy I2I leaves from the 17 transfer checkpoints. Do not claim 50k examples for the two added checkpoints; they use 38.4k each.
- Verify the updated data with `scripts/verify-interactive-data.py`, passing the source v13 HTML when available. Run the manuscript and rendered-copy audits before publishing.

## Final paper refresh (September 28, 2026)

- The active manuscript is pinned in `content/manuscript-revision.txt`. The title/method macro is OmniTaskonomy. Extract from active `6_gradient.tex`, never the retired `6_overall.tex`.
- The final taxonomy and transfer map have 19 I2I tasks and 25 I2T capability leaves: two Recognition, nine Reconstruction, and eight Reorganization sources. The interactive tree and heatmap use this same inventory, for 44 displayed leaves in total.
- Colorization's exact representative images come from the manuscript example manifest. All 44 displayed leaves have image files; verify them and the v13 data before publishing.
- The gradient bars use the current paper's exact plotting data and round to two decimals. The final paper's two transfer scatter panels report 19 sources, 133 pairs, and correlations 0.795 and 0.529. Since the checkout lacks the complete raw 19-source alignment table, display exact crops from the final paper figure rather than relabeling the older 15-source interactive payload.
- Use the current teaser and controlled/scaling figures, and keep captions and claims exactly aligned to the current manuscript. The interactive map shows significance stars and explains its paired permutation-test threshold in the interface legend.
- The final author list, six affiliations, contribution notes, and correspondence are rendered from `content/paper-metadata.json`, pinned to manuscript commit `bac824580f9c7f537eb95fbc17a35970cc5ac13e`.
- The public Paper button serves the compiled final manuscript at `/paper.pdf`; the GitHub button points to the public site repository. Keep the Hugging Face button absent until an authoritative destination exists.
- The final manuscript is public and names this project page, so the site is indexable. Keep the pending BibTeX placeholder until an authoritative citation is supplied.

## BAGEL architecture figure

- The author requested a code-grounded BAGEL attention diagram. Treat its concise node labels as code-derived diagram annotations, not a new source of free-form research prose. Its on-page caption and alt text must be an exact active-manuscript excerpt.
- Pin the official ByteDance-Seed/Bagel source revision and the SVG hash in `content/bagel-architecture-provenance.json`. Draw the understanding and generation Q/K/V projections, output projections, RMSNorm, and MLP as separate parameters. The token streams enter one attention computation with the supplied attention mask; do not draw shared QKV weights or unrestricted attention.
- Preserve the scalable SVG and a full-resolution link. Mobile readers should be able to pan rather than losing legibility to page-width shrinking.

## Animated TL;DR Jigsaw teaser (September 28, 2026)

- The author requested turning the static TL;DR Jigsaw I2I / Jigsaw I2T crops into an auto-looping HTML animation modeled on a supplied reference, keeping the existing text unchanged. This supersedes the earlier static-crop instruction; leave `jigsaw-i2i.png` and `jigsaw-i2t.png` in place as source assets.
- The author-supplied `public/figures/tldr-crops/jigsaw_input.png` and `jigsaw_output.png` are the unchanged sources. Tiles and the output WebP are derived by `scripts/build-tldr-teaser.py`, which also verifies that the output is the input rearranged by the figure's permutation `[3, 2, 1, 0]`. Hashes and crop boxes live in `content/tldr-teaser.json`.
- The only rendered teaser strings are the figure's own labels (`Jigsaw I2I`, `Jigsaw I2T`, `('reorder', [3, 2, 1, 0])`) and patch indices 0–3, recorded in `content/tldr-teaser.json` and rendered with `data-teaser-copy`. The ability-transfer diagram keeps its registered author copy. Do not add captions or narration to the animation.
- The server renders the completed state; the loop starts and ends on it. Keep the pause control, off-screen pausing, and the static completed state under `prefers-reduced-motion`.
- Run `python scripts/build-tldr-teaser.py --check` with the other checks before publishing.
