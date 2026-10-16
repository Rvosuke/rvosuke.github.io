# Zeyang Bai · Orbit Archive

A bilingual academic homepage for 白泽阳 / Zeyang Bai, built with plain HTML, CSS and JavaScript for GitHub Pages. No package install, build, API key or external font service is required.

## Develop locally

From this checkout:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Use the existing checkout in a cloud task; no separate worktree is needed. The server must be restarted in a restored environment. Keep `CNAME` unchanged unless changing the site's custom domain.

- `index.html`: research positioning, interactive point field, selected work and trajectory.
- `research.html`: publications, contributions, author roles and filters.
- `about.html`: biography, portrait, education, research internships and academic service.
- `content.js`: bilingual copy, publication records, links and timeline. Edit personal information here.
- `site.js`: language preferences, navigation, filters and chapter state.
- `orbit.js`: progressive Canvas enhancement with static CSS and reduced-motion fallbacks.
- `styles.css`: shared design tokens, responsive layouts and interaction states.

English and Chinese can be selected using `?lang=en` / `?lang=zh`. The choice persists locally and carries across pages. Research filters are recorded in `?filter=generation`, `reconstruction` or `vision`.

## Verify

JavaScript syntax:

```sh
node --check content.js
node --check site.js
node --check orbit.js
```

Browser regression tests use Python Playwright and Chromium (development tools only, already available in the prepared cloud environment):

```sh
python3 tests/smoke.py
```

The test launches a temporary loopback server. Set `CHROMIUM_PATH` if Chromium lives at a custom path. It checks 30 page/language/viewport combinations, language persistence, filters, mobile keyboard navigation, canvas fallback and reduced motion. There is no production build step.

Research images are stored in `assets/papers/` with provenance in [sources.json](assets/papers/sources.json). Stream3D uses Figure 1 from the latest checked arXiv v5. GraphSplat uses Figure 2 from the published paper, retrieved through Semantic Scholar's public extraction. Stroke-Seg currently uses the original BCSS dataset image from the author repository: publisher verification blocks access to its final PDF, so that image is explicitly identified as an author-repository image. The custom conceptual SVGs have been removed. Images preserve their complete aspect ratio, with no recoloring or scientific edits. All images load locally.

## Design

See [design and Figma handoff notes](docs/design.md). This iteration was implemented from the supplied Orbit Archive ZIP and existing homepage information. No Figma file was available for inspection during this iteration.
