"""Fingerprint local CSS/JS references so cached old assets cannot mix with new HTML.

Run before publishing after changing CSS or JS. Previous fingerprinted files are
retained so already-cached HTML can continue to load its matching assets.
"""
import argparse
import hashlib
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ('styles.css', 'content.js', 'site.js', 'orbit.js')
PAGES = ('index.html', 'research.html', 'about.html')


def prepare(check=False):
    references = {}
    for name in SOURCES:
        data = (ROOT / name).read_bytes()
        source = Path(name)
        digest = hashlib.sha256(data).hexdigest()[:12]
        target = Path('assets/site') / f'{source.stem}.{digest}{source.suffix}'
        references[name] = target.as_posix()
        destination = ROOT / target
        if check:
            if not destination.is_file() or destination.read_bytes() != data:
                raise SystemExit(f'Outdated generated asset: {target}; run python3 scripts/prepare_assets.py')
        else:
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(data)
    for name in PAGES:
        original = (ROOT / name).read_text()
        updated = original
        for source, target in references.items():
            path = Path(source)
            pattern = r'(?P<attribute>(?:src|href)=")' + r'(?:assets/site/)?' + re.escape(path.stem) + r'(?:\.[0-9a-f]{12})?' + re.escape(path.suffix) + r'"'
            updated = re.sub(pattern, lambda match: match['attribute'] + target + '"', updated)
        if check and original != updated:
            raise SystemExit(f'Outdated asset references in {name}; run python3 scripts/prepare_assets.py')
        if not check:
            (ROOT / name).write_text(updated)
    print('PASS: CSS and JavaScript content fingerprints match all page references' if check else 'Prepared fingerprinted CSS and JavaScript assets for all three pages')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Validate without writing files')
    prepare(parser.parse_args().check)
