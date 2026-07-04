# DestinyPixel SEO / GEO Research Notes

Last updated: 2026-07-04

## Positioning

DestinyPixel should avoid sounding like a hard fortune-telling promise. The stronger public positioning is:

- Multidimensional birth map
- Symbolic self-understanding
- Psychological and energetic guidance
- Bazi + natal astrology fusion
- Palm, face, Tarot, and question oracle studios
- Practical timing and decision support, with clear safety boundaries

## Global Search Clusters

### Birth And Natal Chart

People search for simple entry points before they know the technical language.

- birth chart reading
- natal chart reading
- free birth chart
- astrology chart
- sun moon rising
- current transits astrology
- astrology compatibility
- 2026 astrology forecast
- personal astrology report

Content angle: "Your birth chart is not a personality label; it is a map of rhythm, needs, tension, and timing."

### Bazi / Chinese Astrology

Western audiences search in mixed terms. Chinese audiences search with direct technical keywords.

- Bazi calculator
- Four Pillars of Destiny
- Chinese astrology reading
- day pillar
- five elements personality
- 2026 fortune reading
- 八字排盘
- 四柱八字
- 日柱
- 五行
- 大运流年
- 流年运势
- 真太阳时

Content angle: "We translate the hard terminology into animal archetypes, five-element language, and practical life rhythm."

### Tarot And One-Question Readings

The highest-intent queries are usually emotional and immediate.

- tarot reading online
- yes no tarot
- love tarot
- career tarot
- tarot spread
- one card tarot
- 塔罗占卜
- 感情占卜
- 事业占卜
- 问事占卜
- 六爻起卦

Content angle: "One issue at a time: show the card, show the hexagram, then give a direct next step."

### Palm And Face Reading

Users expect visual upload and direct conclusions.

- palm reading online
- AI palm reading
- palmistry app
- life line reading
- face reading online
- physiognomy reading
- 手相分析
- 掌纹分析
- 面相分析
- 五官面相

Content angle: "Do not score beauty or identity. Read visible patterns as symbolic cues for rhythm, pressure, social expression, and resilience."

### Russian Search Cluster

- натальная карта онлайн
- астрологический прогноз
- карта рождения
- таро онлайн
- расклад таро
- хиромантия онлайн
- китайская астрология
- бацзы

Content angle: keep Russian pages and AI output fully Russian, not machine-translated Chinese.

## Social Platform Observations

### Reddit / X / TikTok

Public samples show strong demand for:

- "Can someone read my birth chart?"
- "What is the best birth chart website?"
- "I want an extensive birth chart reading."
- free readings in exchange for feedback
- current transits and relationship questions
- palmistry + astrology apps

Product implication:

- Root page should keep a free, no-signup first experience.
- Report copy should be easy to understand and less technical than traditional astrology forums.
- Share images and result cards matter.

### Zhihu / Weibo / Xiaohongshu / Douyin

Public samples and competitor pages cluster around:

- 八字、紫微、星盘、塔罗、手相、面相 as parallel systems
- "准不准" and anti-Barnum discussion
- 年运 / 大运 / 流年 as high-value paid report formats
- 玄学 as emotional support during uncertainty
- hand/face/photo readings as visual, mobile-first modules

Product implication:

- Chinese copy can be more direct and concrete.
- Annual timing should use 大运、流年、流月/节气 language when locale is Chinese.
- Avoid generic "you are sensitive but strong" copy; include specific tensions and practical boundaries.

## Crawler / Data Tools

### MediaCrawler

Repository: https://github.com/NanmiCoder/MediaCrawler

Useful for Chinese public-content research across 小红书、抖音、快手、B站、微博、贴吧、知乎. It uses Playwright/CDP login-state reuse and can save data to CSV, JSON, SQLite, MySQL, MongoDB, or Excel depending on configuration.

Recommended use:

- Run outside the Next.js app as a separate research pipeline.
- Use a dedicated research account where login is required.
- Store only public post metadata, text, engagement numbers, and keyword aggregates.
- Do not scrape private data, user profiles beyond public fields, or bypass platform restrictions.

### Other Public Tools To Evaluate Later

- Reddit: PRAW / official Reddit API for compliant subreddit and post research.
- X: official X API where available; scraping tools are fragile and frequently break.
- TikTok: TikTokApi or managed providers such as Apify for public trend discovery.
- Facebook: public page/group tooling is limited; official Graph API is safer.

## Content Roadmap For Organic Traffic

1. Build public pages for high-intent modules:
   - `/palm`
   - `/face`
   - `/oracle`
   - `/learn`

2. Add future keyword pages only after the product stabilizes:
   - `/learn/birth-chart-reading`
   - `/learn/bazi-day-pillar`
   - `/learn/2026-annual-forecast`
   - `/learn/tarot-yes-no`
   - `/learn/palm-reading-online`
   - `/learn/liuyao-oracle`

3. For social growth:
   - 10-20 second TikTok/Douyin clips showing a card reveal.
   - Xiaohongshu posts comparing "generic horoscope" vs "specific pattern".
   - Reddit-friendly transparent posts asking for feedback on readability, not making accuracy claims.
   - Pinterest/Instagram share cards for the 60 archetypes.

## Tone Rules

- Say the conclusion first.
- Mention difficult patterns without fear language.
- Use five elements and practical life language instead of teaching-heavy Bazi terminology.
- Avoid excessive literary filler.
- Prefer "this pattern often wastes energy here" over "you are destined to..."
- Always keep medical, legal, financial, psychological, and emergency boundaries clear.

