# Orbit Archive · Design handoff

## Direction

Preserve the uploaded draft's dark spatial archive identity, while making the academic identity legible on arrival. The homepage now introduces Zeyang Bai / 白泽阳, the UCAS M.Eng. role and the 3D vision focus before inviting visitors into the research. The orbit is a progressive visual layer; essential content is always in the DOM.

The supplied ZIP is a design/content reference. Its embedded design document was not treated as a new authorization or a source of independently verified academic claims. The content uses the existing homepage and uploaded draft: four public works, five education/research/industry entries, and four academic service entries. Hidden works from the previous homepage remain absent. No CV file, publication metric, new award or new scientific result was invented.

## Figma reference

No Figma file was inspected or updated: the Figma connector was unavailable. These notes and CSS variables provide the implementation reference for a subsequent Figma pass. A shared file/frame link is sufficient to establish a concrete Figma reference once the connector is available.

Suggested review frames: desktop 1440 px, tablet 768 / 1024 px, mobile 390 px, narrow mobile 320 px. Review both English and Chinese; Chinese headings use a separate line-height and tracking rule.

## Tokens

| Role | CSS variable | Value |
| --- | --- | --- |
| Background | `--void` | `#05070A` |
| Surface | `--carbon` | `#0B1015` |
| Accent / action | `--signal` | `#6DE7F2` |
| Secondary accent | `--spectral` | `#5D9FFF` |
| Primary text | `--paper` | `#EDF6F8` |
| Secondary text | `--muted` | `#A1B0B9` |
| Metadata | `--dim` | `#81939F` |
| Divider | `--line` | `rgba(172,209,220,.18)` |
| Strong divider | `--line-strong` | `rgba(172,224,235,.34)` |

The font stacks resolve locally, without remote requests. Display: Space Grotesk when installed, Avenir Next / Segoe UI fallback; body: IBM Plex Sans when installed, Segoe UI fallback; Chinese: PingFang SC / Microsoft YaHei; metadata: IBM Plex Mono when installed, Consolas / monospace. The application does not download these fonts.

Desktop content shell: maximum 1180 px, with 48 px minimum outer margins; mobile margins: 18 px. Core spacing follows 8 px increments, with 24 / 32 px content gaps and 70–130 px section spacing. Navigation and filter controls have a minimum 44 px height.

## Components and behavior

- **Header:** orbit mark, identity, current-page navigation, language switch. At 760 px and below, the menu becomes an overlay with focus containment, Escape dismissal, background inertness, scroll lock and focus restoration.
- **Hero:** two-line research thesis, explicit academic role, primary research action, About link, institution context and orbit caption. No unsupported location coordinates are displayed.
- **Point field:** deterministic projected points, pointer response, chapter-specific shapes and a 30 fps limit. Pauses when hidden, adapts density after resizing, responds to live motion preference changes, and falls back to CSS orbits if Canvas is unavailable.
- **Featured research:** short project name, full subtitle, paper image, contribution, venue and author role. Links target the corresponding full publication record.
- **Research archive:** full titles/authors, highlighted Zeyang Bai, contribution, venue and original resource URLs. Filters persist in the URL and retain keyboard focus; the active filter is exposed through its pressed state.
- **About:** unaltered source portrait, biography, collaborator links, timeline, service and direct contact. No CV action is offered without a real CV file.
- **Chapter rail:** keyboard-accessible section links and active chapter state; hidden on narrow screens.

## Content maintenance

Edit both language versions in `content.js`. Publication title, authors, URLs, year and categories are shared records; descriptions and roles are localized. Keep status, dates and author order consistent with the source papers when updating them. The Stroke-Seg resource now links to the verified article DOI (10.1049/ipr2.13255), replacing the journal-wide landing page.

The research images now use public original material rather than custom drawings. `assets/papers/sources.json` records versions, origins, original-image hashes and extraction details. Stream3D uses its arXiv v5 first-page teaser; GraphSplat uses the published framework figure indexed by Semantic Scholar. Stroke-Seg's final PDF remains blocked by publisher browser verification, so the current image is the original dataset illustration from the author's BCSS repository and is identified accordingly in the provenance file. It must not be described as a verified final-paper figure. Visible image captions are omitted at the user’s request; the provenance JSON retains version and source details. Homepage featured cards link to the corresponding research records.

The homepage academic role line was removed at the user's request; it remains on About.

## Validation

Run `python3 tests/smoke.py` for the responsive and interaction regression suite. The site has no runtime network dependencies. External publication/advisor links remain the supplied links; successful local validation does not establish that those remote destinations are reachable.


## Release cache consistency

All three pages reference content-fingerprinted CSS and JavaScript paths under `assets/site/`. Source files remain at the repository root for maintenance. Run `python3 scripts/prepare_assets.py` after changing CSS or JavaScript, then commit both the generated files and updated HTML. Previous fingerprinted files are deliberately retained so existing cached HTML can still find its matching resources.

This fixes the observed return-visitor failure where new HTML loaded the old `/styles.css`: the header fell back to normal document flow and an unstyled full-viewport canvas pushed the headline below the fold. A browser test now primes the original CSS/JS URLs with long-lived legacy responses, navigates to the new pages with the same browser cache, and verifies layout, visible headline, language switching and cross-page navigation.

The helper also derives a release identifier from the asset bundle and writes it to each page. Internal navigation carries this identifier in the URL, allowing returning visitors to navigate without reusing older cached HTML pages.


## Scroll transitions and content update

On a downward chapter change, one decorative CSS comet crosses the viewport and cleans up after its short animation. Point positions interpolate through a deterministic diffuse state into the next spatial arrangement over 1.35 seconds; enlarged, low-opacity point footprints give a Gaussian-like resolving effect. Below-fold section shells reveal once through a blur/opacity/position transition. Reading, navigation and scrolling remain native; there is no scroll trapping. Comets and content blur are suppressed with reduced motion, including when the preference changes mid-transition. The page-hidden handler cancels animation work.

SeeU is the fourth public research record and is excluded from selected research. Its title, author order, abstract, ECCV 2026 Workshop (3DWM) acceptance and first-page figure were checked against arXiv:2608.22740v1 and the supplied Scholar record. The ByteDance algorithm internship is dated July 2026–present from the user’s instruction, without a guessed team or project description. Tab titles use only the person’s name in the selected language.

The archive count/author-formatting notice and the generic trajectory introduction are omitted. Academic service includes Pattern Recognition and MMM reviewer roles, without unconfirmed years.
