const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('/opt/codex/cua_node/lib/node_modules/playwright');

const base = process.env.BASE_URL || 'http://127.0.0.1:3043';
const previousBase = process.env.PREVIOUS_BASE_URL || 'http://127.0.0.1:3037';
const out = process.env.OUT_DIR || '/tmp/encyclopedia-samples-production';
const slugs = ['ding-you-day-pillar', 'hexagram-11', 'tarot-sun', 'tarot-moon'];
const locales = ['en', 'zh', 'zh-TW', 'ru'];
const previousDates = {'ding-you-day-pillar':'2026-10-05','hexagram-11':'2026-10-07','tarot-sun':'2026-10-08','tarot-moon':'2026-10-08'};
const route = (slug, locale) => `/journal/${slug}${locale === 'en' ? '' : `?locale=${locale}`}`;
const answerSelector = slug => slug.startsWith('tarot-') ? '[data-learning-short-answer]' : slug === 'hexagram-11' ? '[data-learning-short-answer]' : 'header p[class*="directAnswer"]';
const result = {base, previousBase, baselineCommit:'179c14e1f6d5bf19a244adeaef84d13ba79ce4b1', ssr:[], views:[], errors:[]};

(async () => {
  fs.mkdirSync(out, {recursive:true});
  const browser = await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  try {
    const ssr = await browser.newContext({javaScriptEnabled:false});
    const page = await ssr.newPage();
    const prior = await ssr.newPage();
    for (const slug of slugs) for (const locale of locales) {
      const response = await page.goto(base + route(slug, locale), {waitUntil:'load'});
      assert.equal(response.status(), 200);
      const data = await page.evaluate(() => {
        const article = document.querySelector('article');
        const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(s => JSON.parse(s.textContent));
        return {
          title:document.title, h1:document.querySelector('h1')?.textContent,
          canonical:document.querySelector('link[rel="canonical"]')?.href,
          alternates:[...document.querySelectorAll('link[rel="alternate"][hreflang]')].map(a => [a.hreflang,a.href]),
          robots:document.querySelector('meta[name="robots"]')?.content,
          articleSchema:schemas.find(s => s['@type'] === 'Article'),
          note:document.querySelector('[data-editorial-update]')?.textContent,
          text:article?.innerText.replace(/\s+/g,' ').trim(),
          images:[...article.querySelectorAll('img')].map(i => [i.alt, i.getAttribute('src')?.split('&w=')[0]]),
          hrefs:[...article.querySelectorAll('a')].map(a => a.getAttribute('href')),
        };
      });
      const edited = ['en','zh'].includes(locale);
      assert.equal(data.canonical, 'https://www.destinypixel.com' + route(slug,locale));
      assert.equal(data.alternates.length, 5);
      assert.ok(!data.robots?.includes('noindex'));
      assert.equal(data.articleSchema.dateModified, edited ? '2026-10-11' : previousDates[slug]);
      assert.equal(data.articleSchema.author['@type'], 'Organization');
      assert.equal(data.articleSchema.author.name, 'DestinyPixel');
      assert.ok(data.articleSchema.isAccessibleForFree);
      assert.equal(Boolean(data.note), edited);
      if (edited) assert.ok((await page.locator(answerSelector(slug)).first().textContent()).trim());
      else {
        const oldResponse = await prior.goto(previousBase + route(slug,locale), {waitUntil:'load'});
        assert.equal(oldResponse.status(),200);
        const old = await prior.evaluate(() => {
          const a=document.querySelector('article');
          return {text:a.innerText.replace(/\s+/g,' ').trim(),images:[...a.querySelectorAll('img')].map(i=>[i.alt,i.getAttribute('src')?.split('&w=')[0]]),hrefs:[...a.querySelectorAll('a')].map(a=>a.getAttribute('href'))};
        });
        assert.equal(data.text,old.text,`${slug}/${locale}: retained rendered text`);
        assert.deepEqual(data.images,old.images,`${slug}/${locale}: retained images`);
        assert.deepEqual(data.hrefs,old.hrefs,`${slug}/${locale}: retained links`);
      }
      result.ssr.push({slug,locale,status:response.status(),h1:data.h1,canonical:data.canonical,modified:data.articleSchema.dateModified,note:data.note,retainedCompared:!edited});
    }
    await ssr.close();
    const context = await browser.newContext({reducedMotion:'reduce'});
    await context.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
    for (const viewport of [{width:320,height:740},{width:390,height:844},{width:1440,height:900}]) {
      for (const slug of slugs) for (const locale of ['en','zh']) {
        const p=await context.newPage(); await p.setViewportSize(viewport);
        const errors=[];p.on('pageerror',e=>errors.push(e.message));
        const response=await p.goto(base+route(slug,locale),{waitUntil:'networkidle'});
        assert.equal(response.status(),200);
        const answer=p.locator(answerSelector(slug)).first();
        const box=await answer.boundingBox();assert.ok(box);assert.ok(box.y<viewport.height,`${slug}/${locale}/${viewport.width}: direct answer starts below first viewport`);
        const checks=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,brokenImages:[...document.querySelectorAll('article img')].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.alt),contents:[...document.querySelectorAll('aside nav a[href^="#"]')].map(a=>a.hash),ids:[...document.querySelectorAll('[id]')].map(e=>e.id),sources:[...document.querySelectorAll('article a[href^="https:"]')].map(a=>a.href)}));
        assert.equal(checks.overflow,false);assert.deepEqual(checks.brokenImages,[]);assert.deepEqual(errors,[]);
        for(const hash of checks.contents)assert.equal(checks.ids.filter(id=>id===decodeURIComponent(hash.slice(1))).length,1,`${slug}: TOC target ${hash}`);
        assert.ok(checks.sources.length>0);
        if(viewport.width===390||viewport.width===320&&slug==='tarot-moon'&&locale==='en')await p.screenshot({path:path.join(out,`${slug}-${locale}-${viewport.width}-initial.png`)});
        if(checks.contents.length){const link=p.locator('aside nav a[href^="#"]').first();await link.click();const target=await p.locator(link.getAttribute ? await link.getAttribute('href') : checks.contents[0]).boundingBox();assert.ok(target&&target.y>=-1&&target.y<viewport.height,'TOC scroll');}
        const tool=p.locator(slug.startsWith('tarot-')?'a[href^="/tarot"]':slug==='hexagram-11'?'a[href^="/iching"]':'div[class*="articleAction"] a').first();
        const toolHref=await tool.getAttribute('href');assert.ok(toolHref);const toolResponse=await context.request.get(base+toolHref);assert.equal(toolResponse.status(),200);
        result.views.push({slug,locale,viewport,answerTop:Math.round(box.y),answerBottom:Math.round(box.y+box.height),tocTargets:checks.contents.length,sourceLinks:checks.sources.length,toolHref,overflow:false,brokenImages:[],runtimeErrors:[]});
        await p.close();
      }
    }
    await context.close();
  } catch(e) {result.errors.push(e.stack);throw e;}
  finally {await browser.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(result,null,2)+'\n');}
  console.log(`PASS: ${result.ssr.length} no-JavaScript editions, ${result.views.length} viewport cases`);
})().catch(e=>{console.error(e);process.exitCode=1;});
