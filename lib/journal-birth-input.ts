import type { JournalSourceArticle, JournalTranslation } from "@/lib/journal";

export const birthInputArticle: JournalSourceArticle = {
  "slug": "prepare-birth-date-time-place",
  "publishedAt": "2026-09-11",
  "updatedAt": "2026-11-06",
  "translations": {
    "en": {
      "title": "Birth time and birthplace: what to enter for astrology and BaZi",
      "description": "Which birth time should you enter? Compare astrology, BaZi and unknown-time compatibility, with a worked time-zone example and daylight-saving checks.",
      "topic": "Birth map essentials",
      "introduction": "Use the date and clock time recorded where you were born, even if you now live in another country. Do not convert them to your current time zone or subtract daylight saving yourself. The important next question is which tool you are using: a natal astrology chart, a BaZi birth map and a comparison with an unknown birth time do not calculate the same things. Here is how to prepare one record and use it consistently.",
      "takeaway": "Enter the original local Gregorian date and time with the birthplace. Let the tool resolve the time zone. If the time is unknown, use the compatibility checkbox rather than inventing noon; it does not create a precise natal chart.",
      "sections": [
        {
          "id": "choose-tool",
          "title": "Choose the tool before filling in the time",
          "paragraphs": [
            "The natal astrology chart shows ten planetary placements, the Ascendant, Midheaven, whole-sign houses and aspects. The personal BaZi birth map follows Chinese astrology conventions for the Four Pillars. The compatibility calculator compares two people and has a separate reduced-information mode. A feature offered by one form should not be assumed to exist in the others.",
            "Open the natal astrology chart for a single-person sky chart, the BaZi birth form for Four Pillars, or the compatibility calculator for two people. The product facts page lists each tool’s inputs and current limits."
          ],
          "table": {
            "headings": [
              "Tool",
              "What to enter",
              "What an unknown time means"
            ],
            "rows": [
              [
                "Natal astrology chart",
                "Local date and time; a listed city, or verified latitude, longitude and IANA time zone.",
                "Time is required. No unknown-time chart or recovered Ascendant is offered."
              ],
              [
                "Personal BaZi birth map",
                "Local date and time; a supported city. Keep the other form choices consistent.",
                "Time is required. Its solar-time calculation needs an actual time to start from."
              ],
              [
                "Two-person compatibility",
                "Each person’s date and supported city; known time or their own unknown-time checkbox.",
                "One or both may be unknown. Missing hour pillars and precise planetary aspects are excluded from date-only scoring."
              ]
            ]
          },
          "links": [
            {
              "text": "natal astrology chart",
              "href": "/astrology"
            },
            {
              "text": "BaZi birth form",
              "href": "/#report"
            },
            {
              "text": "compatibility calculator",
              "href": "/compatibility"
            },
            {
              "text": "product facts page",
              "href": "/product-facts"
            }
          ]
        },
        {
          "id": "original-record",
          "title": "Start with the original record",
          "paragraphs": [
            "Look for a birth certificate or a contemporaneous hospital record if one is available to you. Write down the time exactly as recorded, including whether it uses a 12-hour or 24-hour clock. A remembered “around breakfast” is still useful family history, but it should not quietly become an exact 08:00 in your notes.",
            "Separate what the record says from your interpretation of it. Keep a note such as “07:40, copied from certificate” or “between 07:00 and 08:00, family recollection.” You do not need to upload the document to use the birth form. The aim is an accurate input record, not a collection of private paperwork."
          ],
          "table": {
            "headings": [
              "Detail",
              "What to check"
            ],
            "rows": [
              [
                "Date",
                "Year, month and day; confirm which calendar the record uses."
              ],
              [
                "Time",
                "Hours and minutes, AM/PM if relevant, and whether it is estimated."
              ],
              [
                "Place",
                "Birth city and country, rather than your current home."
              ],
              [
                "Time uncertainty",
                "Any known daylight-saving or clock-change issue at that date."
              ]
            ]
          }
        },
        {
          "id": "local-clock",
          "title": "Keep the clock time attached to its place",
          "paragraphs": [
            "For all three tools, start from the recorded local civil date and time in the birthplace. Do not convert a New York birth into Beijing time because you now live in China, or change a London birth into your phone’s current time zone. Do not pre-adjust to solar time: the BaZi calculation applies its own correction; the natal chart resolves the actual instant from the original local record.",
            "If a record uses a lunar calendar date, first obtain a verified Gregorian equivalent and retain both versions in your notes. The current form expects a Gregorian calendar date; it has no lunar-calendar toggle. If an AM/PM conversion crosses midnight, check the date as well as the hour instead of treating them as unrelated fields."
          ]
        },
        {
          "id": "time-limits",
          "title": "Separate civil time, solar time and the sky",
          "paragraphs": [
            "Civil time and solar time answer different questions. Civil time follows a place’s clock rules. A solar-time correction accounts for longitude and the changing relationship between the Sun and a uniform clock. NOAA’s solar equations separate these terms; a longitude correction alone cannot resolve the civil-time offset.",
            "DestinyPixel uses the selected city’s IANA time zone and birth date to obtain the UTC instant, including historical offsets and daylight saving. Its Bazi model separately applies longitude and an approximate equation of time to produce a solar clock. Planetary longitudes use the UTC instant and Astronomy Engine’s geocentric calculations; they do not use that solar-clock label as UTC. Year and month change at precise LiChun/Jie instants; the solar-clock day changes at midnight. These calculations do not validate the symbolic interpretation. The supported calculation range is 1800–2100.",
            "For a time-based calculation, a clock-change gap or repeated hour is rejected rather than silently guessed. In New York, 10 March 2024 at 02:30 did not occur, while 3 November 2024 at 01:30 occurred twice. The current form cannot select which repeated occurrence a record means. Verify the original date, time, city and any documented offset; do not subtract an hour or change a valid record simply to pass the check. Historical records and time-zone data can still have uncertainty."
          ],
          "sources": [
            {
              "label": "IANA: what the Time Zone Database records",
              "href": "https://www.iana.org/time-zones"
            },
            {
              "label": "NOAA: general solar-position equations (PDF)",
              "href": "https://gml.noaa.gov/grad/solcalc/solareqns.PDF"
            },
            {
              "label": "Astronomy Engine: time and geocentric coordinates",
              "href": "https://github.com/cosinekitty/astronomy/tree/master/source/js"
            },
            {
              "label": "Lunar library: Four Pillars boundary conventions",
              "href": "https://6tail.cn/calendar/lunar.ganzhi.html"
            },
            {
              "label": "NIST: daylight-saving clock changes",
              "href": "https://www.nist.gov/pml/time-and-frequency-division/popular-links/daylight-saving-time-dst"
            }
          ]
        },
        {
          "id": "worked-time-example",
          "title": "Worked example: a New York record just after midnight",
          "paragraphs": [
            "This is a fictional input example, not a person’s birth record or a personality reading: New York, 1 July 1990, 00:10 local time. Enter 1990-07-01, 00:10 and New York in the form. IANA’s historical rules put New York on UTC−04:00 on that date. The current calculation therefore resolves the instant as 1 July at 04:10 UTC.",
            "The natal chart uses that 04:10 UTC instant and the selected location for its angles; it does not use the solar-clock label as a different moment. Separately, the BaZi model uses the listed longitude −74.006° and its approximate equation of time. The correction is about −59.55 minutes, so its solar-clock label is 30 June, 23:10 at displayed minute precision. The original birth date is still 1 July: do not change the form to 30 June or enter 23:10, which would apply the correction again.",
            "If all you know is “1 July in New York,” select unknown time in compatibility. That mode keeps the civil date, omits the hour pillar and cannot decide whether the person was born before or after a solar-date boundary. Its day pillar can therefore differ from a timed BaZi result near midnight. That difference reflects different available information and conventions; it does not identify the correct birth time."
          ],
          "table": {
            "headings": [
              "Stage",
              "Value in this example",
              "Your action"
            ],
            "rows": [
              [
                "Original record",
                "1990-07-01 · 00:10 · New York",
                "Enter these unchanged."
              ],
              [
                "Resolved instant",
                "1990-07-01 · 04:10 UTC",
                "A system conversion, not a replacement form entry."
              ],
              [
                "BaZi solar clock",
                "1990-06-30 · 23:10",
                "A calculated label; do not enter it back into the form."
              ],
              [
                "If the hour is unknown",
                "1990-07-01 · New York · time unknown",
                "Keep the date; do not borrow 00:10 from this example."
              ]
            ]
          },
          "sources": [
            {
              "label": "IANA: North American historical time-zone rules",
              "href": "https://data.iana.org/time-zones/tzdb/northamerica"
            }
          ]
        },
        {
          "id": "city-choice",
          "title": "Choose a listed city or verify a custom location",
          "paragraphs": [
            "Choose the full matching city, including its country, rather than where you live today. The personal BaZi form and compatibility form use a limited supported-city list. An unlisted town does not acquire verified coordinates because you type its name; a nearby city is a substitute and should be labelled as such.",
            "The standalone natal astrology form also offers a custom location. It requires latitude, longitude and an IANA zone such as America/New_York. West longitudes and south latitudes use negative numbers. A fixed “UTC−5” label cannot represent New York’s summer and historical rules, and coordinates alone do not determine the correct civil time zone. Check both location and zone before using this option.",
            "If you cannot verify these details, retain the real birthplace in your notes and contact us about support. Do not call a substitute-city chart precise. An IANA identifier may name a representative city for a larger region; verify the region’s rules instead of choosing a zone just because its name looks familiar."
          ]
        },
        {
          "id": "unknown-time",
          "title": "Keep uncertainty visible when you read",
          "paragraphs": [
            "The standalone natal chart and personal BaZi birth map still require a time. The compatibility tool lets each person mark their own time as unknown. In that mode the unknown person has no hour pillar, Ascendant, houses or exact natal aspects. Planetary sign possibilities are approximate samples across the local day, not a recovered birth moment; they do not enter the date-only score. A year or month pillar may also be omitted when the day crosses a solar-term boundary.",
            "For the actual two-person workflow, see compatibility without birth time. It explains what remains comparable when only one person knows their time. If you later find a reliable record, rerun with that record and note the change of mode; differences in the score do not measure a relationship becoming better or worse.",
            "With a documented time range, comparing endpoints is only a sensitivity exercise. Matching endpoints do not prove that nothing changed in between, and a convincing AI paragraph cannot recover the missing time. Keep uncertainty beside the result, rather than hiding it behind a precise-looking number."
          ],
          "links": [
            {
              "text": "compatibility without birth time",
              "href": "/journal/compatibility-without-birth-time"
            }
          ]
        },
        {
          "id": "first-reading",
          "title": "Make one reproducible first reading",
          "paragraphs": [
            "Before generating, check the Gregorian date, AM/PM conversion, recorded local time and selected birthplace together. On the personal BaZi form, keep its gender option consistent when comparing readings. On the natal chart, also check any custom coordinates and zone. Only change an input when you have a reason grounded in the record.",
            "If a chart differs from another calculator, first compare the original input, time-zone offset, tropical or sidereal zodiac, house system and any solar-time or day-boundary convention. DestinyPixel’s standalone natal chart uses the tropical zodiac and whole-sign houses. A house-system difference can change house labels without changing the recorded birth moment. For what the placements mean, continue with the Sun, Moon and rising guide.",
            "A rejected clock-change time calls for checking the record; a generic load failure does not prove your birth details are wrong. Keep the record intact rather than trying random hours until a request succeeds. Review the calculated structure before any AI interpretation. Reproducible calculations and astronomical coordinates do not establish that a symbolic personality or future reading is scientifically valid."
          ],
          "links": [
            {
              "text": "Sun, Moon and rising guide",
              "href": "/journal/sun-moon-rising-signs-explained"
            }
          ]
        }
      ],
      "action": {
        "label": "Open the natal chart form",
        "href": "/astrology"
      }
    },
    "zh": {
      "title": "星盘和八字怎么填出生时间、地点？时区与夏令时核对指南",
      "description": "出生时间填当地时间还是北京时间？用纽约凌晨的实例，区分星盘、八字太阳时与未知时辰合盘，说明夏令时、出生城市和跨日怎样核对。",
      "topic": "出生图谱入门",
      "introduction": "填写出生资料时，先用出生地当时记录的日期和钟表时间。即使现在住在另一个国家，也不用换成现居地时间，更不要自己先减去夏令时。接下来要分清你用的是哪个工具：本命星盘、八字出生图和不知道时辰的双人合盘，计算的内容并不一样。这篇指南把一份原始记录怎样填写、怎样核对结果讲清楚。",
      "takeaway": "原始当地公历日期、钟表时间和出生地一起填，由工具处理时区。时辰未知时使用合盘里的独立勾选项，不补午时，也不把日期版结果当成精确本命星盘。",
      "sections": [
        {
          "id": "choose-tool",
          "title": "先选工具，再决定时间怎么填",
          "paragraphs": [
            "本命星盘展示十颗星体的位置、上升、天顶、整宫制宫位和相位。个人八字出生图使用四柱的传统计算约定；双人合盘则比较两个人，并另设资料不完整的日期版。一个表单支持的功能，不等于另一个表单也支持。",
            "想看个人星空，打开本命星盘；想排四柱，进入八字出生表单；想比较两人的相处方式，使用情感匹配。各工具的输入条件和限制也可在产品事实页核对。"
          ],
          "table": {
            "headings": [
              "工具",
              "需要填写",
              "不知道时辰时"
            ],
            "rows": [
              [
                "本命星盘",
                "当地日期、时间；列表城市，或已核实的经纬度与 IANA 时区。",
                "时间必填。没有未知时辰星盘，也不会替你还原上升。"
              ],
              [
                "个人八字出生图",
                "当地日期、时间和支持的出生城市；其他选项保持一致。",
                "时间必填。太阳时校正需要从实际记录的时间出发。"
              ],
              [
                "双人情感匹配",
                "每个人分别填写日期、支持的城市，提供已知时间或勾选时辰未知。",
                "支持一方或双方未知。日期版评分不补缺失时柱，也不使用精确行星相位。"
              ]
            ]
          },
          "links": [
            {
              "text": "本命星盘",
              "href": "/astrology?locale=zh"
            },
            {
              "text": "八字出生表单",
              "href": "/?locale=zh#report"
            },
            {
              "text": "情感匹配",
              "href": "/compatibility?locale=zh"
            },
            {
              "text": "产品事实页",
              "href": "/product-facts?locale=zh"
            }
          ]
        },
        {
          "id": "original-record",
          "title": "先找原始记录，再写自己的判断",
          "paragraphs": [
            "如果手边有出生证明或当年的医院记录，先逐字核对年月日、时分，以及记录采用十二小时制还是二十四小时制。家人记得“早饭前后”也是有价值的信息，但不要在没有依据时把它变成精确的 08:00。",
            "把记录和推断分开保存，例如“07:40，来自出生证明”或“07:00—08:00，家人口述”。使用出生表单不需要上传证明文件；你需要的是一份准确的输入笔记，而不是把私人证件交给工具。"
          ],
          "table": {
            "headings": [
              "资料",
              "核对内容"
            ],
            "rows": [
              [
                "日期",
                "完整年月日，以及原始记录采用的历法。"
              ],
              [
                "时间",
                "时、分、上午或下午，是否只是估计。"
              ],
              [
                "地点",
                "出生城市和国家，而不是现在居住的城市。"
              ],
              [
                "时间疑问",
                "该日期是否可能涉及夏令时或历史调钟。"
              ]
            ]
          }
        },
        {
          "id": "local-clock",
          "title": "时间应当跟着出生地走",
          "paragraphs": [
            "这三个工具都从出生地当时记录的当地民用日期和钟表时间出发。不要因为现在住在中国，就把纽约出生时间换成北京时间；也不要把伦敦的记录改成当前手机时区。无需预先做太阳时校正：八字计算有自己的校正过程，本命星盘则从原始当地记录换算实际时刻。",
            "原始资料如果写的是农历，先核实对应的公历日期，并把两种日期都保留在笔记里。当前表单接收公历日期，没有农历切换选项。处理上午、下午或跨过午夜的时间时，日期也必须一起检查，不能只改小时。"
          ]
        },
        {
          "id": "time-limits",
          "title": "区分民用时间、太阳时与实际星空",
          "paragraphs": [
            "民用时间遵循当地钟表制度；太阳时修正则涉及经度，以及太阳运行与均匀钟表时间之间的差异。NOAA 的太阳位置计算将这些因素分开处理。仅凭经度修正，无法确定出生地当时采用的民用时差。",
            "DestinyPixel 按所选城市的 IANA 时区和出生日期换算 UTC 时刻，包含历史时差与夏令时。八字模型另外应用经度修正和近似均时差，得到太阳时钟。行星黄经则使用 UTC 时刻与 Astronomy Engine 的地心计算，不会把校正后的太阳时标签当作 UTC。年柱、月柱分别在立春和十二节的准确时刻切换；日柱采用当地太阳时午夜换日。这些计算不会为象征性解读提供科学证明。目前支持的计算年份为 1800—2100 年。",
            "需要具体时刻的计算遇到调钟跳过或重复的时段时，会拒绝而不是偷偷猜一个。例如纽约 2024 年 3 月 10 日 02:30 没有发生过；11 月 3 日 01:30 则出现过两次。当前表单不能选择重复时段中的哪一次。应核对原始日期、时间、城市以及记录中已有的时差依据，不要为了通过检查就减去一小时或修改有效记录。历史资料和时区数据也可能存在不确定性。"
          ],
          "sources": [
            {
              "label": "IANA：时区数据库记录哪些规则",
              "href": "https://www.iana.org/time-zones"
            },
            {
              "label": "NOAA：太阳位置计算公式（PDF）",
              "href": "https://gml.noaa.gov/grad/solcalc/solareqns.PDF"
            },
            {
              "label": "Astronomy Engine：时间与地心坐标",
              "href": "https://github.com/cosinekitty/astronomy/tree/master/source/js"
            },
            {
              "label": "Lunar 历法库：四柱交界约定",
              "href": "https://6tail.cn/calendar/lunar.ganzhi.html"
            },
            {
              "label": "NIST：夏令时调钟规则",
              "href": "https://www.nist.gov/pml/time-and-frequency-division/popular-links/daylight-saving-time-dst"
            }
          ]
        },
        {
          "id": "worked-time-example",
          "title": "实例：纽约凌晨的记录，为什么八字会显示前一天？",
          "paragraphs": [
            "这是一组虚构的填写实例，不是真实个人资料，也不是性格案例：纽约，1990 年 7 月 1 日，当地时间 00:10。表单照填 1990-07-01、00:10，并选择纽约。IANA 的历史规则显示，当天纽约使用 UTC−04:00，当前程序把它换算为 7 月 1 日 04:10 UTC。",
            "本命星盘使用这个 04:10 UTC 时刻，并结合所选地点计算上升和天顶，不会把太阳时标签另当成一次出生时刻。八字模型则另外使用列表里的经度 −74.006° 和近似均时差，得到约 −59.55 分钟的修正，太阳时按分钟显示为 6 月 30 日 23:10。原始生日仍然是 7 月 1 日：不要把表单日期改为 6 月 30 日，也不要把时间改填成 23:10，否则相当于又校正了一遍。",
            "如果你只知道“7 月 1 日出生在纽约”，合盘里应勾选时辰未知。日期版保留民用日期、不补时柱，也无法判断出生时刻在太阳时跨日之前还是之后。因此，午夜附近的日期版日柱可能与已知时辰的八字结果不同。这是资料完整度与计算约定不同，不能据此反推出真正的出生时间。"
          ],
          "table": {
            "headings": [
              "阶段",
              "本例中的值",
              "你该怎么做"
            ],
            "rows": [
              [
                "原始记录",
                "1990-07-01 · 00:10 · 纽约",
                "原样填入。"
              ],
              [
                "实际时刻换算",
                "1990-07-01 · 04:10 UTC",
                "系统换算值，不是让你改填的时间。"
              ],
              [
                "八字太阳时钟",
                "1990-06-30 · 23:10",
                "计算标签，不要再填回表单。"
              ],
              [
                "如果时辰未知",
                "1990-07-01 · 纽约 · 时辰未知",
                "保留日期，不借用本例的 00:10。"
              ]
            ]
          },
          "sources": [
            {
              "label": "IANA：北美历史时区规则",
              "href": "https://data.iana.org/time-zones/tzdb/northamerica"
            }
          ]
        },
        {
          "id": "city-choice",
          "title": "列表城市与自定义地点，分别怎么选",
          "paragraphs": [
            "选择完整匹配的出生城市及国家，不用现居地代替。个人八字表单和合盘表单使用有限的支持城市列表；输入一个不在列表里的城镇名字，并不会自动获得已核实的坐标。附近城市只能作为替代地点，需要明确记下这一点。",
            "独立本命星盘还提供自定义地点，需要填写纬度、经度和 IANA 时区，例如 America/New_York。西经、南纬用负数。一个固定的“UTC−5”不能代表纽约夏季及历史上的全部规则，经纬度本身也不能确定当地民用时区。使用这一选项前，应同时核实坐标和时区。",
            "如果这些资料无法核实，请保留真实出生地的记录，联系我们补充支持，不要把替代城市的结果当成精确星盘。IANA 标识可能以一个代表城市命名，实际对应更大的地区；要核对地区适用的规则，而不是只挑名字熟悉的时区。"
          ]
        },
        {
          "id": "unknown-time",
          "title": "不知道几点，就保留这个“不知道”",
          "paragraphs": [
            "独立本命星盘和个人八字出生图仍然要求时间。合盘允许每个人分别勾选时辰未知；未知者不补时柱，不推算上升、宫位或精确本命相位。显示的行星可能星座来自当地一天内的近似取样，并不是恢复出来的出生时刻，也不参与日期版评分。当天若跨节气边界，无法确定的年柱或月柱也可能留空。",
            "具体双人流程可看不知道出生时间怎么合盘，里面说明了一方已知、另一方未知时仍能比较什么。以后找到可靠记录，再按原记录重新计算，并记下模式发生了变化；分数不同并不表示关系变好或变差。",
            "如果有可靠的时间范围，可以比较两端，只把它当作敏感性检查。两端结果一样，不证明中间完全没有变化；一段看似贴切的 AI 解读也不能还原缺失时间。阅读时把不确定性留在结果旁边，不用精确数字把它遮住。"
          ],
          "links": [
            {
              "text": "不知道出生时间怎么合盘",
              "href": "/journal/compatibility-without-birth-time?locale=zh"
            }
          ]
        },
        {
          "id": "first-reading",
          "title": "完成一次可以复核的体验",
          "paragraphs": [
            "提交前，把公历日期、上午下午换算、原始当地时间和出生地一起复核。比较个人八字报告时，表单里的性别选项也保持一致；星盘如果使用自定义地点，还要核对经纬度与时区。只有找到记录依据，才修改输入。",
            "如果结果与另一个排盘网站不同，先比较原始输入、时区偏移、回归黄道或恒星黄道、宫制，以及太阳时和换日约定。DestinyPixel 的独立本命星盘采用回归黄道与整宫制。宫制不同可能改变宫位标签，但不等于出生时刻改变了。位置含义可继续看太阳、月亮和上升星座指南。",
            "明确提示调钟时段不存在或重复时，需要核对原始记录；普通的加载失败并不能证明出生资料填错了。不要为了让请求成功，就随意换几个小时试。先核对计算结构，再读 AI 解释。能够复现的计算和天文坐标，并不等于象征性的性格或未来解读获得了科学验证。"
          ],
          "links": [
            {
              "text": "太阳、月亮和上升星座指南",
              "href": "/journal/sun-moon-rising-signs-explained?locale=zh"
            }
          ]
        }
      ],
      "action": {
        "label": "打开本命星盘填写资料",
        "href": "/astrology?locale=zh"
      }
    }
  }
};

export const birthInputRussian: JournalTranslation = {
  "title": "Время и место рождения: что вводить для натальной карты и Ба-цзы",
  "description": "Как вводить время рождения с учётом часового пояса и летнего времени: пример для Нью-Йорка, различия натальной карты, Ба-цзы и совместимости без часа.",
  "topic": "Основы карты рождения",
  "introduction": "Используйте дату и время, записанные по местным часам там, где вы родились, даже если сейчас живёте в другой стране. Не переводите запись в нынешний часовой пояс и не вычитайте летнее время вручную. Затем выберите подходящий инструмент: натальная карта, карта Ба-цзы и совместимость при неизвестном часе рассчитывают разные вещи. Разберём, как сохранить одну исходную запись и последовательно использовать её.",
  "takeaway": "Введите исходную местную григорианскую дату, время и место рождения; часовой пояс обработает инструмент. Если час неизвестен, отметьте это в форме совместимости, а не подставляйте полдень. Такой расчёт не заменяет точную натальную карту.",
  "sections": [
    {
      "id": "choose-tool",
      "title": "Сначала выберите инструмент",
      "paragraphs": [
        "Натальная карта показывает положения десяти небесных тел, асцендент, MC, целознаковые дома и аспекты. Личная карта Ба-цзы использует традиционные правила китайской астрологии для четырёх столпов. Калькулятор совместимости сравнивает двух людей и отдельно обрабатывает неполные данные. Возможность одной формы не обязательно есть в другой.",
        "Откройте натальную карту для карты неба одного человека, форму Ба-цзы для четырёх столпов или калькулятор совместимости для сравнения пары. На странице сведений о продукте перечислены условия ввода и ограничения."
      ],
      "table": {
        "headings": [
          "Инструмент",
          "Что вводить",
          "Если час неизвестен"
        ],
        "rows": [
          [
            "Натальная карта",
            "Местные дата и время; город из списка либо проверенные координаты и часовой пояс IANA.",
            "Время обязательно. Карта без часа и восстановление асцендента не предусмотрены."
          ],
          [
            "Личная карта Ба-цзы",
            "Местные дата и время, поддерживаемый город. Остальные параметры сохраняйте неизменными.",
            "Время обязательно: солнечная поправка требует исходного времени."
          ],
          [
            "Совместимость двух людей",
            "Дата и поддерживаемый город каждого; известное время или отдельная отметка о его отсутствии.",
            "Час может быть неизвестен у одного или обоих. В режиме по датам отсутствующие часовые столпы и точные аспекты не участвуют в оценке."
          ]
        ]
      },
      "links": [
        {
          "text": "натальную карту",
          "href": "/astrology?locale=ru"
        },
        {
          "text": "форму Ба-цзы",
          "href": "/?locale=ru#report"
        },
        {
          "text": "калькулятор совместимости",
          "href": "/compatibility?locale=ru"
        },
        {
          "text": "странице сведений о продукте",
          "href": "/product-facts?locale=ru"
        }
      ]
    },
    {
      "id": "original-record",
      "title": "Начните с исходной записи",
      "paragraphs": [
        "Если у вас есть свидетельство о рождении или запись роддома, проверьте их. Перепишите время точно, учитывая 12- или 24-часовой формат. Семейное воспоминание «примерно во время завтрака» тоже ценно, но без основания не превращайте его в точные 08:00.",
        "Отделяйте запись от предположений: «07:40, из документа» или «между 07:00 и 08:00, по словам семьи». Для формы рождения не требуется загружать документ. Нужны точные заметки для ввода, а не передача личных бумаг."
      ],
      "table": {
        "headings": [
          "Данные",
          "Что проверить"
        ],
        "rows": [
          [
            "Дата",
            "Год, месяц, день и календарь исходной записи."
          ],
          [
            "Время",
            "Часы, минуты, утро или вечер; известно ли время точно."
          ],
          [
            "Место",
            "Город и страна рождения, а не нынешнее место жительства."
          ],
          [
            "Неопределённость",
            "Возможный переход на летнее время или исторический перевод часов."
          ]
        ]
      }
    },
    {
      "id": "local-clock",
      "title": "Сохраняйте связь времени с местом",
      "paragraphs": [
        "Во всех трёх инструментах начинайте с местных гражданских даты и времени, записанных в месте рождения. Не переводите нью-йоркскую запись в пекинское время из-за переезда и не заменяйте лондонское время нынешним часовым поясом телефона. Не корректируйте ввод по Солнцу заранее: расчёт Ба-цзы применяет собственную поправку, а натальная карта получает фактический момент из исходной местной записи.",
        "Если исходная дата записана по лунному календарю, сначала уточните её григорианский эквивалент и сохраните обе записи. Текущая форма принимает григорианскую дату и не имеет переключателя лунного календаря. При переходе через полночь проверяйте дату вместе с часом."
      ]
    },
    {
      "id": "time-limits",
      "title": "Различайте гражданское и солнечное время",
      "paragraphs": [
        "Гражданское время определяется местными правилами часов. Солнечная поправка связана с долготой и меняющимся соотношением движения Солнца с равномерным ходом часов. Формулы NOAA рассматривают эти составляющие отдельно; одной долготы недостаточно для определения гражданского смещения времени.",
        "DestinyPixel использует часовой пояс IANA выбранного города и дату рождения для получения момента UTC, включая исторические смещения и летнее время. Модель Ба-цзы отдельно применяет поправку по долготе и приближённое уравнение времени. Долготы планет рассчитываются геоцентрически библиотекой Astronomy Engine по UTC, а не по условному солнечному времени. Год и месяц меняются в точные моменты Личунь и соответствующих узлов Цзе; день — в полночь солнечного времени. Эти расчёты не доказывают символические толкования. Поддерживается диапазон 1800–2100 годов.",
        "При расчёте с конкретным временем пропущенный или повторившийся час отклоняется, а не угадывается. В Нью-Йорке 10 марта 2024 года время 02:30 не наступало, а 3 ноября 2024 года 01:30 наступило дважды. Текущая форма не позволяет выбрать нужное повторение. Проверьте исходные дату, время, город и документированное смещение, если оно есть; не вычитайте час и не меняйте верную запись лишь для прохождения проверки. Исторические записи и базы часовых поясов могут содержать неопределённость."
      ],
      "sources": [
        {
          "label": "IANA: база часовых поясов",
          "href": "https://www.iana.org/time-zones"
        },
        {
          "label": "NOAA: формулы положения Солнца (PDF)",
          "href": "https://gml.noaa.gov/grad/solcalc/solareqns.PDF"
        },
        {
          "label": "Astronomy Engine: время и геоцентрические координаты",
          "href": "https://github.com/cosinekitty/astronomy/tree/master/source/js"
        },
        {
          "label": "Библиотека Lunar: правила границ столпов",
          "href": "https://6tail.cn/calendar/lunar.ganzhi.html"
        },
        {
          "label": "NIST: правила перевода часов",
          "href": "https://www.nist.gov/pml/time-and-frequency-division/popular-links/daylight-saving-time-dst"
        }
      ]
    },
    {
      "id": "worked-time-example",
      "title": "Пример: нью-йоркская запись вскоре после полуночи",
      "paragraphs": [
        "Это вымышленный пример ввода, а не чья-либо запись о рождении или характеристика личности: Нью-Йорк, 1 июля 1990 года, 00:10 по местным часам. Введите 1990-07-01, 00:10 и выберите Нью-Йорк. По историческим правилам IANA в этот день действовало смещение UTC−04:00. Текущий расчёт получает момент 1 июля, 04:10 UTC.",
        "Натальная карта использует именно этот момент 04:10 UTC, а для асцендента и MC также выбранное место. Солнечное время не подменяет момент рождения. Модель Ба-цзы отдельно применяет долготу из списка −74.006° и приближённое уравнение времени. Поправка составляет около −59.55 минуты; солнечное время отображается с точностью до минуты как 30 июня, 23:10. Исходная дата рождения остаётся 1 июля. Не меняйте дату в форме на 30 июня и не вводите 23:10: иначе поправка будет применена ещё раз.",
        "Если известно лишь «1 июля, Нью-Йорк», отметьте неизвестное время в совместимости. Режим по датам сохраняет гражданскую дату, исключает часовой столп и не может определить, по какую сторону солнечной полуночи родился человек. Поэтому около полуночи столп дня может отличаться от результата Ба-цзы с известным временем. Это следствие разных данных и правил расчёта, а не способ восстановить час."
      ],
      "table": {
        "headings": [
          "Этап",
          "Значение в примере",
          "Что делать"
        ],
        "rows": [
          [
            "Исходная запись",
            "1990-07-01 · 00:10 · Нью-Йорк",
            "Введите без изменений."
          ],
          [
            "Момент UTC",
            "1990-07-01 · 04:10 UTC",
            "Это пересчёт системы, не новое время для ввода."
          ],
          [
            "Солнечное время Ба-цзы",
            "1990-06-30 · 23:10",
            "Не вводите вычисленное значение обратно в форму."
          ],
          [
            "Если час неизвестен",
            "1990-07-01 · Нью-Йорк · время неизвестно",
            "Сохраните дату; не заимствуйте 00:10 из примера."
          ]
        ]
      },
      "sources": [
        {
          "label": "IANA: исторические правила часовых поясов Северной Америки",
          "href": "https://data.iana.org/time-zones/tzdb/northamerica"
        }
      ]
    },
    {
      "id": "city-choice",
      "title": "Выбор города или проверка собственного места",
      "paragraphs": [
        "Выбирайте точный город и страну рождения, а не нынешнее место жительства. Личная форма Ба-цзы и форма совместимости используют ограниченный список городов. Ввод названия отсутствующего населённого пункта не добавляет проверенные координаты; соседний город остаётся заменой, которую нужно отметить.",
        "В отдельной натальной карте есть также собственное место: требуются широта, долгота и зона IANA, например America/New_York. Западная долгота и южная широта задаются отрицательными числами. Фиксированное обозначение «UTC−5» не учитывает летние и исторические правила Нью-Йорка, а координаты сами по себе не определяют гражданский часовой пояс. Проверьте и координаты, и зону.",
        "Если проверить данные невозможно, сохраните реальное место в заметках и обратитесь к нам по поводу поддержки. Не считайте карту с заменой города точной. Идентификатор IANA может носить имя одного города, но описывать более широкую область; проверяйте правила региона, а не выбирайте знакомое название."
      ]
    },
    {
      "id": "unknown-time",
      "title": "Сохраняйте неопределённость видимой",
      "paragraphs": [
        "Отдельная натальная карта и личная карта Ба-цзы по-прежнему требуют времени. В совместимости каждый человек может отдельно отметить неизвестный час. Для него не подставляется часовой столп, не вычисляются асцендент, дома или точные натальные аспекты. Возможные знаки планет — приблизительные выборки в пределах местных суток, а не восстановленный момент рождения; они не участвуют в оценке по датам. Если день пересекает границу солнечного сезона, неопределённый столп года или месяца тоже может отсутствовать.",
        "Пошаговый пример приведён в руководстве по совместимости без времени рождения: там разобрано, что можно сравнить, когда час известен только у одного человека. Если позже найдётся надёжная запись, повторите расчёт с ней и отметьте смену режима. Изменение балла не означает, что отношения стали лучше или хуже.",
        "При документированном диапазоне времени сравнение его границ служит только проверкой чувствительности. Совпавшие результаты на границах не доказывают отсутствия изменений внутри диапазона. Убедительный текст AI тоже не восстанавливает неизвестный час. Сохраняйте эту неопределённость рядом с результатом."
      ],
      "links": [
        {
          "text": "руководстве по совместимости без времени рождения",
          "href": "/journal/compatibility-without-birth-time?locale=ru"
        }
      ]
    },
    {
      "id": "first-reading",
      "title": "Сделайте воспроизводимый первый расчёт",
      "paragraphs": [
        "Перед расчётом проверьте вместе григорианскую дату, перевод AM/PM в 24-часовой формат, исходное местное время и место рождения. При сравнении личных карт Ба-цзы сохраняйте одинаковый выбор пола в форме; для натальной карты проверьте и собственные координаты с зоной. Меняйте ввод только на основании записи.",
        "Если другой калькулятор выдаёт иной результат, сначала сравните исходные данные, смещение часового пояса, тропический или сидерический зодиак, систему домов и правила солнечного времени или смены суток. Отдельная натальная карта DestinyPixel использует тропический зодиак и целознаковые дома. Другая система домов может изменить номера домов, но не сам момент рождения. Значения положений объясняет руководство по Солнцу, Луне и асценденту.",
        "Сообщение о повторяющемся или пропущенном времени требует проверки записи; обычная ошибка загрузки не доказывает, что данные рождения неверны. Не перебирайте случайные часы ради успешного запроса. Сначала проверяйте расчётную структуру, затем читайте AI-толкование. Воспроизводимые расчёты и астрономические координаты не подтверждают научную достоверность символических выводов о личности или будущем."
      ],
      "links": [
        {
          "text": "руководство по Солнцу, Луне и асценденту",
          "href": "/journal/sun-moon-rising-signs-explained?locale=ru"
        }
      ]
    }
  ],
  "action": {
    "label": "Открыть форму натальной карты",
    "href": "/astrology?locale=ru"
  }
};
