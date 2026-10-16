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
import threading

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


@contextmanager
def local_server():
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
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
                    no_overflow(page)
                    if name == 'index':
                        assert page.locator('.hero-role').count() == 0
                    if name == 'research':
                        assert page.locator('.research-record').count() == 3
                        assert page.locator('.record-authors strong').count() == 3
                    if name == 'about':
                        assert page.locator('.trajectory-item').count() == 4
                        assert page.locator('.service-list li').count() == 2
                    cases += 1
        print(f'PASS {cases} responsive page/language combinations (320–1440 px)')

        page.set_viewport_size({'width': 1440, 'height': 1000})
        page.goto(base + '/research.html?lang=en')
        for category, record_id in [('generation', 'stream3d'), ('reconstruction', 'graphsplat'), ('vision', 'stroke-seg')]:
            page.locator(f'[data-filter="{category}"]').click()
            assert page.locator('.research-record').count() == 1
            assert page.locator('.research-record').get_attribute('id') == record_id
            assert f'filter={category}' in page.url
            assert page.locator(f'[data-filter="{category}"]').evaluate('(el) => el === document.activeElement')
            assert page.locator(f'[data-filter="{category}"]').get_attribute('aria-pressed') == 'true'
            assert '1 work' in page.locator('[data-research-summary]').inner_text()
        page.reload()
        assert page.locator('.research-record').count() == 1
        page.locator('[data-language-switch]').click()
        assert page.locator('.research-record').get_attribute('id') == 'stroke-seg'
        assert '共 1' in page.locator('[data-research-summary]').inner_text()
        page.locator('[data-filter="all"]').click()
        assert page.locator('.research-record').count() == 3
        assert page.locator('.research-figure figcaption a').count() == 3
        assert page.locator('.research-figure img[src$=".svg"]').count() == 0
        assert 'arXiv v5' in page.locator('#stream3d figcaption').inner_text()
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
        print('PASS filters, URL persistence, author highlights, paper images, cross-page language and portrait')

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

        assert not external_requests, external_requests
        assert not errors, errors
        assert (ROOT / 'CNAME').read_text().strip() == 'baizey.rvosuke.com'
        print('PASS no external page dependencies, no JavaScript errors; CNAME preserved')
        browser.close()


if __name__ == '__main__':
    run()
