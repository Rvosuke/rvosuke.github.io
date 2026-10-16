"""Browser regression checks. Requires Python Playwright and system Chromium.
Run: python3 tests/smoke.py
The site itself has no Python or Playwright dependency.
"""
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
import shutil
import subprocess
import sys
import threading
from urllib.parse import parse_qs, urlsplit

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


class LegacyCacheHandler(QuietHandler):
    """Model a returning visitor with fresh copies of the old asset URLs."""
    legacy_requests = 0

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == '/legacy-cache' or (path in ('/research.html', '/about.html') and 'v' not in parse_qs(urlsplit(self.path).query)):
            body = b'''<!doctype html><title>Warm legacy cache</title>
              <link rel="stylesheet" href="/styles.css">
              <script src="/content.js"></script><script src="/site.js"></script>
              <script src="/orbit.js"></script><p>Legacy site</p>'''
            content_type = 'text/html'
        elif path in ('/styles.css', '/content.js', '/site.js', '/orbit.js'):
            type(self).legacy_requests += 1
            body = b'body{background:#0f172a}a{color:#2563eb}' if path.endswith('.css') else b'window.legacyCachedAsset=true;'
            content_type = 'text/css' if path.endswith('.css') else 'text/javascript'
        else:
            return super().do_GET()
        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'public, max-age=86400')
        self.end_headers()
        self.wfile.write(body)


@contextmanager
def local_server(handler=QuietHandler):
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(handler, directory=str(ROOT)))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f'http://127.0.0.1:{server.server_port}'
    finally:
        server.shutdown()
        server.server_close()
        thread.join()


def no_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), page.url
    # Also catch clipped content concealed by overflow-x:hidden.
    assert page.evaluate('''() => [...document.querySelectorAll('main h1, main h2, main p, .hero-actions, .filter-controls, .connect-panel')]
      .filter(el => el.getClientRects().length)
      .every(el => { const r = el.getBoundingClientRect(); return r.left >= -1 && r.right <= innerWidth + 1; })'''), page.url


def run():
    subprocess.run([sys.executable, str(ROOT / 'scripts/prepare_assets.py'), '--check'], check=True)
    with local_server() as base, sync_playwright() as p:
        executable = os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or shutil.which('google-chrome')
        launch = {'headless': True, 'args': ['--no-sandbox']}
        if executable:
            launch['executable_path'] = executable
        browser = p.chromium.launch(**launch)
        errors = []
        external_requests = []
        cases = 0
        context = browser.new_context(reduced_motion='reduce')
        context.on('page', lambda page: page.on('pageerror', lambda e: errors.append(str(e))))
        context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else (external_requests.append(route.request.url), route.abort())[-1])
        page = context.new_page()
        for width in (320, 390, 768, 1024, 1440):
            page.set_viewport_size({'width': width, 'height': 900 if width > 760 else 844})
            for lang in ('en', 'zh'):
                for name in ('index', 'research', 'about'):
                    response = page.goto(f'{base}/{name}.html?lang={lang}', wait_until='networkidle')
                    assert response.status == 200
                    assert page.locator('h1').count() == 1
                    assert page.locator('h1').is_visible()
                    assert page.locator('html').get_attribute('lang') == ('zh-CN' if lang == 'zh' else 'en')
                    assert page.locator('[aria-current="page"]').count() == 1
                    assert page.title() == ('白泽阳' if lang == 'zh' else 'Zeyang Bai')
                    no_overflow(page)
                    if name == 'index':
                        assert page.locator('.hero-role').count() == 0
                        assert page.locator('[data-i18n="home.trajectoryLead"]').count() == 0
                        assert page.locator('.site-header').evaluate('(el) => getComputedStyle(el).position') == 'fixed'
                        assert page.locator('h1').evaluate('(el) => el.getBoundingClientRect().bottom <= innerHeight')
                    if name == 'research':
                        assert page.locator('.research-record').count() == 4
                        assert page.locator('.record-authors strong').count() == 4
                    if name == 'about':
                        assert page.locator('.trajectory-item').count() == 5
                        assert 'ByteDance' in page.locator('.trajectory-item').first.inner_text()
                        assert '2026.07' in page.locator('.trajectory-item').first.inner_text()
                        assert page.locator('.service-list li').count() == 4
                        assert 'Pattern Recognition' in page.locator('.service-list').inner_text()
                        assert 'MultiMedia Modeling 2027' in page.locator('.service-list').inner_text()
                        assert page.locator('.service-list a').count() == 0
                    cases += 1
        print(f'PASS {cases} responsive page/language combinations (320–1440 px)')

        page.set_viewport_size({'width': 1440, 'height': 1000})
        page.goto(base + '/research.html?lang=en')
        for category, record_ids in [('generation', ['stream3d']), ('reconstruction', ['seeu', 'graphsplat']), ('vision', ['stroke-seg'])]:
            page.locator(f'[data-filter="{category}"]').click()
            assert page.locator('.research-record').evaluate_all('(items) => items.map(el => el.id)') == record_ids
            assert f'filter={category}' in page.url
            assert page.locator(f'[data-filter="{category}"]').evaluate('(el) => el === document.activeElement')
            assert page.locator(f'[data-filter="{category}"]').get_attribute('aria-pressed') == 'true'
            assert page.locator('[data-research-summary]').count() == 0
        page.reload()
        assert page.locator('.research-record').count() == 1
        page.locator('[data-language-switch]').click()
        assert page.locator('.research-record').get_attribute('id') == 'stroke-seg'
        assert page.locator('[data-research-summary]').count() == 0
        page.locator('[data-filter="all"]').click()
        assert page.locator('.research-record').count() == 4
        assert page.locator('.research-figure figcaption').count() == 0
        assert page.locator('.research-figure img[src$=".svg"]').count() == 0
        assert page.locator('#seeu .record-project').inner_text() == 'SeeU'
        assert '3DWM' in page.locator('#seeu .record-venue').inner_text()
        assert page.locator('#seeu .record-authors strong').inner_text() == 'Zeyang Bai'
        for image in page.locator('.research-figure img').all():
            image.scroll_into_view_if_needed()
            image.evaluate('(img) => img.decode()')
            assert image.evaluate('(img) => img.naturalWidth > 0')
        page.locator('.site-nav a[href*="about.html"]').click()
        assert 'lang=zh' in page.url
        assert page.locator('h1').inner_text() == '白泽阳。'
        assert page.locator('.about-portrait').evaluate('(img) => img.complete && img.naturalWidth > 0')
        page.goto(base + '/index.html')
        assert page.locator('html').get_attribute('lang') == 'zh-CN'
        print('PASS SeeU, filters, original paper images, ByteDance timeline, names-only titles and bilingual navigation')

        assert page.locator('[data-featured-research] .featured-card').count() == 2
        assert page.locator('[data-featured-research] a[href*="seeu"]').count() == 0
        assert page.locator('figcaption').count() == 0

        # Chapter links work with keyboard focus and select the corresponding section.
        page.locator('.chapter-rail a[href="#selected-research"]').focus()
        page.keyboard.press('Enter')
        page.wait_for_function("document.querySelector('[href=\"#selected-research\"][aria-current=\"location\"]') !== null")
        assert page.locator('#selected-research').evaluate('(el) => el.getBoundingClientRect().top >= 0')

        page.set_viewport_size({'width': 390, 'height': 844})
        page.goto(base + '/index.html?lang=en')
        menu = page.locator('[data-menu-toggle]')
        menu.click()
        assert menu.get_attribute('aria-expanded') == 'true'
        assert page.locator('main').evaluate('(el) => el.inert')
        page.keyboard.press('Shift+Tab')
        assert menu.evaluate('(el) => el === document.activeElement')
        page.keyboard.press('Shift+Tab')
        assert page.locator('[data-language-switch]').evaluate('(el) => el === document.activeElement')
        page.keyboard.press('Escape')
        assert menu.get_attribute('aria-expanded') == 'false'
        assert menu.evaluate('(el) => el === document.activeElement')
        assert not page.locator('main').evaluate('(el) => el.inert')
        menu.click()
        page.locator('[data-language-switch]').click()
        assert page.locator('html').get_attribute('lang') == 'zh-CN'
        assert menu.get_attribute('aria-expanded') == 'false'
        menu.click()
        page.set_viewport_size({'width': 1440, 'height': 1000})
        assert menu.get_attribute('aria-expanded') == 'false'
        assert not page.locator('body').evaluate('(el) => el.classList.contains("menu-open")')
        print('PASS chapter navigation, mobile focus trap, Escape, language switch and responsive menu reset')

        page.goto(base + '/index.html?lang=en')
        assert page.locator('#orbit-canvas').get_attribute('data-rendered') == 'true'
        image_a = page.locator('#orbit-canvas').evaluate('(c) => c.toDataURL()')
        page.wait_for_timeout(150)
        assert image_a == page.locator('#orbit-canvas').evaluate('(c) => c.toDataURL()')
        assert page.locator('#orbit-canvas').evaluate('''c => {
          const data = c.getContext('2d').getImageData(0,0,c.width,c.height).data;
          return data.some((v,i) => i % 4 === 3 && v > 0);
        }''')
        page.emulate_media(reduced_motion='no-preference')
        page.wait_for_timeout(150)
        assert image_a != page.locator('#orbit-canvas').evaluate('(c) => c.toDataURL()')
        page.emulate_media(reduced_motion='reduce')
        # Chromium dispatches media-query change listeners during rendering;
        # wait until that handler has stopped the animation before sampling.
        page.evaluate('() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
        still = page.locator('#orbit-canvas').evaluate('(c) => c.toDataURL()')
        page.wait_for_timeout(150)
        assert still == page.locator('#orbit-canvas').evaluate('(c) => c.toDataURL()')
        fallback = context.new_page()
        fallback.add_init_script("HTMLCanvasElement.prototype.getContext = function() { return null; }")
        fallback.goto(base + '/index.html?lang=en')
        assert fallback.locator('.orbit-fallback').evaluate('(el) => Number(getComputedStyle(el).opacity) > 0')
        assert fallback.locator('h1').is_visible()
        fallback.close()
        print('PASS visible canvas, static reduced motion, live motion preference changes and CSS fallback')

        # Test the requested chapter transitions through real scrolling.
        page.goto(base + '/index.html?lang=en')
        page.emulate_media(reduced_motion='no-preference')
        page.evaluate('() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
        assert page.locator('#signal .section-shell').evaluate('(el) => parseFloat(getComputedStyle(el).opacity) < 1')
        page.locator('#signal').evaluate("el => el.scrollIntoView({behavior:'instant',block:'start'})")
        page.wait_for_function("document.querySelector('.chapter-comet.is-crossing') !== null")
        assert page.locator('.chapter-comet').evaluate('(el) => getComputedStyle(el).pointerEvents') == 'none'
        page.wait_for_function("getComputedStyle(document.querySelector('#signal .section-shell')).filter === 'blur(0px)'")
        assert page.locator('#signal .section-shell').evaluate('(el) => parseFloat(getComputedStyle(el).opacity)') == 1
        assert page.locator('#signal h2').is_visible()
        page.wait_for_function("!document.querySelector('.chapter-comet').classList.contains('is-crossing')")
        page.locator('#selected-research').evaluate("el => el.scrollIntoView({behavior:'instant',block:'start'})")
        page.wait_for_function("document.querySelector('.chapter-comet.is-crossing') !== null")
        assert page.locator('.chapter-comet').count() == 1
        page.emulate_media(reduced_motion='reduce')
        page.evaluate('() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
        assert page.locator('.chapter-comet').evaluate('(el) => getComputedStyle(el).display') == 'none'
        assert page.locator('.chapter-comet.is-crossing').count() == 0
        assert page.locator('#selected-research .section-shell').evaluate('(el) => getComputedStyle(el).filter') == 'none'
        assert page.locator('#selected-research h2').is_visible()
        no_overflow(page)
        print('PASS scroll-triggered comet, blur-to-clear chapter reveal, cleanup and reduced-motion cancellation')

        assert not external_requests, external_requests
        assert not errors, errors
        assert (ROOT / 'CNAME').read_text().strip() == 'baizey.rvosuke.com'
        print('PASS no external page dependencies, no JavaScript errors; CNAME preserved')

        # Routing disables the browser cache, so use a separate context with no
        # interception to cover returning visitors rather than just cold loads.
        with local_server(LegacyCacheHandler) as cached_base:
            cached_context = browser.new_context(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
            cached = cached_context.new_page()
            cached.goto(cached_base + '/legacy-cache', wait_until='networkidle')
            assert cached.evaluate('window.legacyCachedAsset === true')
            assert cached.locator('body').evaluate('(el) => getComputedStyle(el).backgroundColor') == 'rgb(15, 23, 42)'
            assert LegacyCacheHandler.legacy_requests == 4
            for old_page in ('research.html', 'about.html'):
                cached.goto(cached_base + '/' + old_page + '?lang=zh', wait_until='networkidle')
                assert cached.title() == 'Warm legacy cache'
            cached.goto(cached_base + '/index.html?lang=en', wait_until='networkidle')
            assert cached.locator('.site-header').evaluate('(el) => getComputedStyle(el).position') == 'fixed'
            assert cached.locator('.skip-link').evaluate('(el) => el.getBoundingClientRect().bottom <= 0')
            assert cached.locator('h1').evaluate('(el) => el.getBoundingClientRect().bottom <= innerHeight')
            assert cached.locator('#orbit-canvas').evaluate('(el) => el.getBoundingClientRect().top') == 0
            assert cached.locator('[data-featured-research] .featured-card').count() == 2
            assert cached.evaluate('typeof window.legacyCachedAsset === "undefined"')
            cached.locator('[data-language-switch]').click()
            assert cached.locator('.hero-title-accent').inner_text() == '到三维世界。'
            cached.locator('.site-nav a[href*="research.html"]').click()
            assert parse_qs(urlsplit(cached.url).query)['v'][0] == cached.locator('html').get_attribute('data-release')
            assert cached.locator('.research-record').count() == 4
            assert cached.locator('.site-header').evaluate('(el) => getComputedStyle(el).position') == 'fixed'
            cached.locator('.site-nav a[href*="about.html"]').click()
            assert cached.locator('h1').inner_text() == '白泽阳。'
            assert cached.locator('.site-header').evaluate('(el) => getComputedStyle(el).position') == 'fixed'
            assert LegacyCacheHandler.legacy_requests == 4
            cached_context.close()
        print('PASS warm legacy CSS/JS cache: all three pages load matching styles and functional scripts')
        browser.close()


if __name__ == '__main__':
    run()
