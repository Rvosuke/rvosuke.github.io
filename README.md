# Zeyang Bai · Orbit Archive

A bilingual academic homepage for 白泽阳 / Zeyang Bai, built with plain HTML, CSS and JavaScript for GitHub Pages. No package install, bundler, API key or external font service is required. A small Python helper fingerprints CSS and JavaScript before publishing to prevent stale-cache layout failures.

## Develop locally

From this checkout:

```sh
python3 scripts/prepare_assets.py
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
- `scripts/prepare_assets.py`: generates content-fingerprinted copies under `assets/site/` and updates all three HTML pages with matching references and a release identifier for internal navigation. Run it after CSS/JS edits and before publishing. Keep previous fingerprinted files so cached HTML retains working asset URLs.

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

The test launches a temporary loopback server. Set `CHROMIUM_PATH` if Chromium lives at a custom path. It checks 30 page/language/viewport combinations, language persistence, filters, mobile keyboard navigation, canvas fallback and reduced motion. No framework build is needed. `python3 scripts/prepare_assets.py --check` verifies that the generated files and HTML references match the current CSS/JS source; the browser suite runs this check too. The suite also primes a real browser cache with legacy CSS/JS and checks that all three current pages still render and work correctly.

Research images are stored in `assets/papers/` with provenance in [sources.json](assets/papers/sources.json). Stream3D uses Figure 1 from the latest checked arXiv v5. GraphSplat uses Figure 2 from the published paper, retrieved through Semantic Scholar's public extraction. Stroke-Seg currently uses the original BCSS dataset image from the author repository: publisher verification blocks access to its final PDF, so that image is identified as an author-repository image in the provenance file. SeeU uses Figure 1 rendered directly from arXiv v1. The custom conceptual SVGs have been removed. Images preserve their complete aspect ratio, with no recoloring or scientific edits. All images load locally.

## Design

See [design and Figma handoff notes](docs/design.md). This iteration was implemented from the supplied Orbit Archive ZIP and existing homepage information. No Figma file was available for inspection during this iteration.

Homepage chapter transitions combine a short decorative comet, smoothly reforming point clouds and a blur-to-clear content entrance. Animations pause when hidden and respect live reduced-motion preferences. Image version/source captions are intentionally omitted; provenance stays in `assets/papers/sources.json`. SeeU appears in the full research archive but is not featured on the homepage. Both timelines include the ByteDance algorithm internship beginning in July 2026. All page titles are simply “白泽阳” or “Zeyang Bai”.
