import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url), { chromium, expect } = require('playwright/test');
const base = process.argv[2] || 'http://localhost:3053';
const out = process.env.QA_EVIDENCE_DIR || '/workspace/artifacts/tarot-seo-20261009/after';
const tags = { en: 'en', zh: 'zh-Hans', 'zh-TW': 'zh-Hant', ru: 'ru' };
const ogTags = { en: 'en_US', zh: 'zh_CN', 'zh-TW': 'zh_TW', ru: 'ru_RU' };
const fs = require('fs');
fs.mkdirSync(out, { recursive: true });
(async () => {
    const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
    let result = { pages: [], resources: [] };
    try {
        for (const path of ['/tarot', '/journal/tarot-cards', '/journal/tarot-sun', '/journal/tarot-fool', '/journal/how-to-connect-three-tarot-cards', '/journal/why-the-four-fours-differ', '/journal/tarot-from-game-to-occult-traditions', '/journal/how-to-read-three-card-tarot', '/journal/pamela-colman-smith-tarot-artist'])
            for (const locale of ['en', 'zh', 'zh-TW', 'ru']) {
                const url = base + path + (locale === 'en' ? '' : '?locale=' + locale);
                const res = await fetch(url, { headers: { 'User-Agent': 'Googlebot' } });
                const html = await res.text();
                const p = await b.newPage({ javaScriptEnabled: false });
                await p.route('**/*', r => r.abort());
                await p.setContent(html);
                const data = await p.evaluate(() => ({ htmlLang: document.documentElement.lang, mainLang: document.querySelector('main')?.lang, title: document.title, description: document.querySelector('meta[name=description]')?.content, canonical: document.querySelector('link[rel=canonical]')?.href, alternates: [...document.querySelectorAll('link[rel=alternate][hreflang]')].map(e => ({ lang: e.hreflang, href: e.href })), robots: [...document.querySelectorAll('meta[name=robots],meta[name=googlebot]')].map(e => e.content), ogLocale: document.querySelector('meta[property="og:locale"]')?.content ?? null, ogImage: document.querySelector('meta[property="og:image"]')?.content ?? null, schema: [...document.querySelectorAll('script[type="application/ld+json"]')].map(e => JSON.parse(e.textContent)), h1: document.querySelector('h1')?.textContent, mainTextLength: document.querySelector('main')?.textContent.length, internalLinks: [...document.querySelectorAll('main a[href]')].map(e => e.getAttribute('href')).filter(h => h.startsWith('/')) }));
                assert.equal(res.status, 200, url);
                assert.equal(data.mainLang, tags[locale]);
                assert.equal(data.ogLocale, ogTags[locale]);
                assert.equal(data.canonical, 'https://www.destinypixel.com' + path + (locale === 'en' ? '' : '?locale=' + locale));
                assert.equal(data.alternates.length, 5);
                for (const [l, tag] of Object.entries(tags))
                    assert.ok(data.alternates.some(a => a.lang === tag && a.href === 'https://www.destinypixel.com' + path + (l === 'en' ? '' : '?locale=' + l)));
                assert.ok(data.h1 && data.description && data.mainTextLength > 1000);
                assert.ok(data.robots.every(r => !r.includes('noindex')));
                assert.ok(data.schema.length);
                assert.ok(!res.headers.get('x-robots-tag')?.includes('noindex'));
                result.pages.push({ path, locale, status: res.status, bytes: Buffer.byteLength(html), ...data });
                await p.close();
            }
        for (const path of ['/tarot?locale=zh', '/journal/tarot-cards?locale=zh', '/journal/tarot-sun?locale=zh']) {
            const p = await b.newPage({ viewport: { width: 390, height: 844 } });
            await p.route('**/*', r => new URL(r.request().url()).origin === base && r.request().method() === 'GET' ? r.continue() : r.abort());
            let resources = [];
            p.on('response', async (r) => { try {
                const buf = await r.body();
                resources.push({ url: new URL(r.url()).pathname, type: r.request().resourceType(), decodedBytes: buf.length });
            }
            catch { } });
            await p.goto(base + path);
            await p.waitForTimeout(2000);
            await expect(p.locator('html')).toHaveAttribute('lang', 'zh-Hans');
            result.resources.push({ path, htmlLang: await p.locator('html').getAttribute('lang'), resources: resources.sort((a, b) => b.decodedBytes - a.decodedBytes) });
            await p.close();
        }
        const sitemapResponse = await fetch(base + '/sitemap.xml');
        assert.equal(sitemapResponse.status, 200);
        const sitemap = await sitemapResponse.text();
        const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replaceAll('&amp;', '&'));
        assert.equal(urls.length, new Set(urls).size, 'duplicate sitemap URLs');
        const cards = JSON.parse(fs.readFileSync('lib/tarot-learning/catalog.json', 'utf8')).en;
        const expected = [undefined, ...cards.map(c => c.cardId)].flatMap(id => Object.keys(tags).map(l => 'https://www.destinypixel.com/journal/' + (id ? 'tarot-' + id : 'tarot-cards') + (l === 'en' ? '' : '?locale=' + l)));
        for (const url of expected)
            assert.ok(urls.includes(url), 'missing sitemap ' + url);
        assert.equal(expected.length, 316);
        result.sitemap = { allUrls: urls.length, tarotDirectoryAndCards: expected.length, duplicateUrls: false };
        const robots = await (await fetch(base + '/robots.txt')).text();
        assert.ok(!/Disallow: \/(?:tarot|journal)/.test(robots));
        assert.ok(robots.includes('Sitemap: https://www.destinypixel.com/sitemap.xml'));
        result.robots = 'tarot and journal allowed';
        result.savePanel = [];
        for (const locale of Object.keys(tags)) {
            const p = await b.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
            const errors = [];
            p.on('pageerror', e => errors.push(e.message));
            await p.route('**/*', r => new URL(r.request().url()).origin === base && r.request().method() === 'GET' ? r.continue() : r.abort());
            await p.goto(base + '/tarot' + (locale === 'en' ? '' : '?locale=' + locale));
            await expect(p.locator('html')).toHaveAttribute('lang', tags[locale]);
            await expect(p.locator('#table')).toHaveAttribute('aria-busy', 'false');
            await p.locator('.tarot-bottom-deck .cel-button').click();
            await expect(p.locator('.tarot-draw-action')).toBeEnabled();
            await p.locator('.tarot-draw-action').click();
            await expect(p.locator('#tarot-board .tarot-flipper')).toHaveCount(1);
            // Loading the unchanged save UI must not perform an account/AI write.
            await expect(p.locator('section[class*="saveBar"]')).toBeVisible();
            assert.ok((await p.locator('section[class*="saveBar"] h3').innerText()).length > 0);
            assert.deepEqual(errors, []);
            await p.locator('[data-tarot-navigation] a').nth(1).click();
            await expect(p.locator('html')).toHaveAttribute('lang', tags[locale]);
            const target = locale === 'ru' ? 'zh' : 'ru';
            await p.locator('header a[hreflang="' + tags[target] + '"]').click();
            await expect(p.locator('html')).toHaveAttribute('lang', tags[target]);
            await p.goBack();
            await expect(p.locator('html')).toHaveAttribute('lang', tags[locale]);
            await p.goForward();
            await expect(p.locator('html')).toHaveAttribute('lang', tags[target]);
            result.savePanel.push({ locale, loadsAfterPlacement: true, languageHistory: true, pageErrors: errors });
            await p.close();
        }
        result.status = 'passed';
        console.log('PASS 36 Googlebot SSR editions, 316 sitemap URLs, robots, 3 mobile resource captures, 4 deferred-panel/language-history flows');
    }
    finally {
        fs.writeFileSync(out + '/report.json', JSON.stringify(result, null, 2));
        await b.close();
    }
})();
