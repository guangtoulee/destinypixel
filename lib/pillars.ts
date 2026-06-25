export type Locale = "en" | "cn";

export type LocalizedText = Record<Locale, string>;

export type PillarProfile = {
  name: LocalizedText;
  essence: LocalizedText;
  career: {
    style: LocalizedText;
    fields: LocalizedText;
    wealth: LocalizedText;
  };
  love: {
    mode: LocalizedText;
    challenge: LocalizedText;
  };
  growth: LocalizedText;
  health?: LocalizedText;
  link?: string;
};

export const pillarsDB = {
  "甲寅": {
    "name": {
      "en": "The Forest Sovereign",
      "cn": "丛林君主"
    },
    "essence": {
      "en": "A towering ancient tree or a monarch tiger in its prime. You represent pure, unbending life force and the absolute dignity of a natural leader.",
      "cn": "参天古木或全盛时期的领地猛虎。你代表了纯粹、不可弯曲的生命原力，以及天生领袖那不可冒犯的尊严。"
    },
    "career": {
      "style": {
        "en": "The Self-Made Executive. You possess a natural authority that commands respect. You don't just work; you conquer. You thrive when you are the final decision-maker.",
        "cn": "白手起家的执行者。你拥有一种令人肃然起敬的天然权威。你不仅是在工作，更是在征服。当你是最终决策者时，你的能量最强。"
      },
      "fields": {
        "en": "Founders, CEO, Forestry, Competitive Sports, High-Level Management.",
        "cn": "创始人、企业CEO、林业与环保、竞技体育、高层管理。"
      },
      "wealth": {
        "en": "Struggle Wealth. Your fortune is built through bold, decisive actions and direct competition. You earn by being the strongest in the room.",
        "cn": "开拓之财。你的财富是通过大胆、果断的行为和直接的竞争建立的。你通过成为房间里最强者而获利。"
      }
    },
    "love": {
      "mode": {
        "en": "The Dominant Protector. You express love by providing a massive safety net. You are loyal and responsible, but you expect to lead the relationship.",
        "cn": "霸道守护者。你通过提供巨大的安全网来表达爱。你忠诚且极具责任感，但你期望在感情中占据主导地位。"
      },
      "challenge": {
        "en": "Extreme Stubbornness. Your unbending nature makes it hard to admit fault or see the partner's emotional nuances.",
        "cn": "极度固执。你那种“不可弯曲”的天性让你很难承认错误，也难以察觉伴侣细微的情绪变化。"
      }
    },
    "growth": {
      "en": "Executive Maturity. You grow by learning that true power includes the ability to bend without breaking.",
      "cn": "统御的成熟。你通过学习“真正的力量包含了柔韧”这一道理，实现人生的进化。"
    },
    "health": {
      "en": "Focus: Liver & Gallbladder. Watch for high-pressure tension that manifests as chronic headaches.",
      "cn": "关注肝胆。注意预防因高压和紧绷导致的慢性偏头痛或肝火过旺。"
    },
    "link": "#"
  },
  "乙卯": {
    "name": {
      "en": "The Ivy Rabbit",
      "cn": "常春藤灵兔"
    },
    "essence": {
      "en": "A lush secret garden or a social vine. You are the master of soft power, adaptable, connecting, and capable of thriving in any environment.",
      "cn": "繁茂的秘密花园或常春藤。你是软实力的主人，适应力极强，擅长连接与渗透，能在任何环境中蓬勃生长。"
    },
    "career": {
      "style": {
        "en": "The Ultimate Connector. You use social intelligence to climb. You don't fight obstacles; you grow around them. You excel in environments that value networking.",
        "cn": "终极连接者。你利用社交智慧上位。你从不正面硬撞障碍，而是绕着它生长。你在看重人脉和协调的环境中出类拔萃。"
      },
      "fields": {
        "en": "Public Relations, Marketing, Fashion, Art, Diplomacy.",
        "cn": "公关外交、社交媒体营销、时尚产业、艺术设计、高级中介。"
      },
      "wealth": {
        "en": "Social Wealth. Your fortune is a reflection of your network. Money flows through the hands of the people you know.",
        "cn": "人脉之财。你的财富是你社交网络的缩影。金钱是通过你结识的人脉资源流向你的。"
      }
    },
    "love": {
      "mode": {
        "en": "The Charming Soul. You are romantic and need constant emotional sunlight. You seek a partner who can provide deep emotional nourishment.",
        "cn": "迷人灵魂。你极其浪漫，需要持续的情感阳光。你寻找的是能够提供深层情感滋养、懂你细腻心思的伴侣。"
      },
      "challenge": {
        "en": "Weak Boundaries. Your desire for harmony often leads you to lose your own voice to please the other person.",
        "cn": "界限感薄弱。你对和谐的渴望常导致你为了讨好对方而失声，甚至在关系中迷失自我。"
      }
    },
    "growth": {
      "en": "Individual Identity. You grow by learning to stand your own ground even when you are part of a lush garden.",
      "cn": "个体觉醒。你通过学习“即使身处群体也能独立坚持主张”而获得真正的灵魂提升。"
    },
    "health": {
      "en": "Focus: Limbs & Nervous System. Watch for anxiety-induced insomnia or sensitive nerves.",
      "cn": "关注四肢与神经。注意预防由焦虑引起的失眠、多梦或植物神经紊乱。"
    },
    "link": "#"
  },
  "甲辰": {
    "name": {
      "en": "The Azure Dragon",
      "cn": "苍龙出海"
    },
    "essence": {
      "en": "A dragon coiled around a sacred tree, holding hidden treasures. You are dignified, steady, and possess an air of quiet immense power.",
      "cn": "盘绕神木的巨龙，守护着秘库的宝藏。你威严、稳重，举手投足间散发着一种安静却巨大的天然压迫感。"
    },
    "career": {
      "style": {
        "en": "The Strategic Resource Manager. You have a natural instinct for value. You are steady and commanding, often seen as the bedrock of your organization.",
        "cn": "战略资源管家。你对价值有天然的直觉。你稳如泰山且极具威望，常被视为组织的基石和定海神针。"
      },
      "fields": {
        "en": "Real Estate, Asset Management, Large Corporations, Construction, Governance.",
        "cn": "房地产、资产托管、大型跨国集团、重型建筑、政务管理。"
      },
      "wealth": {
        "en": "Accumulated Vault. You are a natural wealth-holder. Your fortune grows through steady accumulation and holding physical assets.",
        "cn": "财富之库。你天生就是财富的持有者。你的财富通过稳步积累和持有实物资产而日益丰厚。"
      }
    },
    "love": {
      "mode": {
        "en": "The Rock-Solid Guardian. You treat love as a long-term commitment. You offer unshakeable security to your partner from day one.",
        "cn": "磐石守护者。你将爱情视为一项长期的严肃承诺。从一开始就能为伴侣提供不可撼动的心理和物质安全感。"
      },
      "challenge": {
        "en": "The Silent Wall. When angry, you retreat into a cold, stony silence that is impossible for a partner to penetrate.",
        "cn": "沉默之墙。生气时，你会退缩进一种冰冷、僵化的沉默中，让伴侣根本无法触达你的内心世界。"
      }
    },
    "growth": {
      "en": "Vulnerability. You grow by learning that showing your soft underbelly is a sign of ultimate strength.",
      "cn": "脆弱的力量。你通过学习“展现柔软的一面才是终极的强大”来实现自我突破。"
    },
    "health": {
      "en": "Focus: Spleen & Skin. Watch for digestive issues or skin irritation caused by internal dampness.",
      "cn": "关注脾胃与皮肤。注意预防因体内湿气过重导致的消化不良、皮肤敏感或结节。"
    },
    "link": "#"
  },
  "乙丑": {
    "name": {
      "en": "The Lotus in Mud",
      "cn": "淤泥清莲"
    },
    "essence": {
      "en": "A delicate lotus growing in cold, wet soil. You represent beauty and ambition born from pragmatism, patience, and silent struggle.",
      "cn": "生于寒冷湿土中的娇美莲花。你代表了从务实、耐心和沉默奋斗中孕育出的坚韧美感与野心。"
    },
    "career": {
      "style": {
        "en": "The Pragmatic Strategist. You don't chase illusions. You use every piece of mud around you to climb silently and efficiently to the top.",
        "cn": "务实的野心家。你不追求虚幻。你利用身边的每一块“淤泥”作为养分，默默且高效地爬向权力的顶峰。"
      },
      "fields": {
        "en": "Financial Auditing, Accounting, Specialized Design, Professional Services.",
        "cn": "财务审计、会计、精细设计、专业咨询、档案管理。"
      },
      "wealth": {
        "en": "Hidden Reserves. You possess a secret bank account or hidden assets. You earn through careful calculation and avoiding the spotlight.",
        "cn": "隐秘储备。你通常拥有秘密账户或隐形资产。你通过精准计算和避开不必要的聚光灯来获利。"
      }
    },
    "love": {
      "mode": {
        "en": "The Realistic Provider. You value material stability and a shared future over empty romantic gestures.",
        "cn": "现实提供者。你认为物质的稳定和清晰的未来规划，远比空洞的浪漫辞藻更有安全感。"
      },
      "challenge": {
        "en": "Emotional Detachment. You may treat relationships as transactions, focusing too much on logic and security.",
        "cn": "情感疏离。你可能会下意识把感情当成交易，过度关注逻辑和安全性，而忽略了感性的流动。"
      }
    },
    "growth": {
      "en": "Emotional Expression. You grow by learning to trust the flow of feelings without needing to calculate the outcome.",
      "cn": "情感释放。你通过学习“信任感觉的流动而不需要预设计算结果”来完成自我进化。"
    },
    "health": {
      "en": "Focus: Digestion & Cold Dampness. Keep your internal fire burning with warm food and sunlight.",
      "cn": "关注消化与寒湿。多吃热食、多晒太阳，保持体内“生命火种”的温度。"
    },
    "link": "#"
  },
  "甲申": {
    "name": {
      "en": "The Ironwood",
      "cn": "绝壁苍松"
    },
    "essence": {
      "en": "A pine tree growing on a sheer cliff, roots gripping rock. You are the survivor who thrives in extreme conditions.",
      "cn": "生长在万丈深渊边、根系抓紧冰冷岩石的苍松。你是能在极端严酷条件下反向生长的孤傲幸存者。"
    },
    "career": {
      "style": {
        "en": "The Crisis Specialist. You are at your best when things are falling apart. You possess the iron will to fix broken systems.",
        "cn": "危机处理专家。当一切分崩离析时，你表现最强。你拥有一种修复崩溃系统和处理高风险任务的钢铁意志。"
      },
      "fields": {
        "en": "Surgery, Law, Military Command, Rescue Operations, Structural Engineering.",
        "cn": "精密外科、法律诉讼、军事指挥、紧急救援、结构工程、危机公关。"
      },
      "wealth": {
        "en": "High-Risk Wealth. You earn money where others are afraid to go. Your fortune comes from overcoming immense obstacles.",
        "cn": "险中求财。你在别人不敢涉足的领域赚钱。你的财富来自于对巨大生存障碍的成功跨越。"
      }
    },
    "love": {
      "mode": {
        "en": "The Challenging Lover. You seek a partner who can handle your intensity. Relationships are often a crucible for growth.",
        "cn": "挑战性爱人。你寻找的是能接住你这种生命强度的伴侣。感情对你来说通常是共同成长的修罗场。"
      },
      "challenge": {
        "en": "Cutting Bluntness. Your honesty is a blade. You often wound those you love with words that are too sharp.",
        "cn": "刀子嘴。你的诚实是一把双刃剑。你常因言辞过于犀利和直接，误伤了你最亲近的人。"
      }
    },
    "growth": {
      "en": "Self-Temperance. You grow by learning that strength is not just about endurance, but also about grace under pressure.",
      "cn": "自我的锤炼。你通过学习“强大不仅是忍耐，更是极端压力下的优雅”而获得境界提升。"
    },
    "health": {
      "en": "Focus: Bones & Nervous Tension. Watch out for accidents and migraines caused by rigidity.",
      "cn": "关注骨骼与神经。注意预防意外挫伤或由长期精神紧绷引起的偏头痛。"
    },
    "link": "#"
  },
  "乙巳": {
    "name": {
      "en": "The Flowering Vine",
      "cn": "沐光艳卉"
    },
    "essence": {
      "en": "A vibrant vine blooming under the summer sun. You are magnetic, artistic, and designed to capture the world's eye.",
      "cn": "盛夏艳阳下肆意绽放的藤蔓。你天生具有表现力、吸引力，仿佛生来就是为了捕捉全世界惊叹的目光。"
    },
    "career": {
      "style": {
        "en": "The Natural Performer. You need a stage to shine. You communicate through beauty and talent, and wither in boring roles.",
        "cn": "天生表演者。你需要舞台才能发光。你通过美感和才华进行沟通，在枯燥重复的行政角色中你会迅速枯萎。"
      },
      "fields": {
        "en": "Fashion, Media, Entertainment, Creative Direction, Fine Dining.",
        "cn": "时尚、传媒、演艺娱乐、创意总监、品牌策划、高级审美行业。"
      },
      "wealth": {
        "en": "Flowing Luxury. You earn through your image. You are excellent at generating wealth, but also at spending it for the vibe.",
        "cn": "流动的奢华。你靠形象和创意赚钱。你很会吸金，但也极擅长为了营造“氛围感”而消耗财富。"
      }
    },
    "love": {
      "mode": {
        "en": "The Passionate Dreamer. You love the chase and the honeymoon phase. You need a partner who can keep life exciting.",
        "cn": "激情梦想家。你热爱追求的过程和火花。你需要一个能让生活保持兴奋感、新鲜感和视觉美感的伴侣。"
      },
      "challenge": {
        "en": "Fickleness. Your interest can fade as fast as a flower in a storm once the novelty wears off.",
        "cn": "喜新厌旧。一旦新鲜感消退，你的兴趣可能像暴风雨中的娇花一样迅速凋零，转投他处。"
      }
    },
    "growth": {
      "en": "Depth beyond Surface. You grow by turning your visual flair into lasting spiritual or professional substance.",
      "cn": "由表及里。你通过将视觉上的天赋转化为持久的精神或专业深度来实现真正的进化。"
    },
    "health": {
      "en": "Focus: Heart & Vision. Watch for emotional exhaustion or eye strain from sensory overload.",
      "cn": "关注心脏与视力。注意预防因情感消耗过度或感官过载导致的心理疲劳或视力损耗。"
    },
    "link": "#"
  },
  "甲戌": {
    "name": {
      "en": "The Guardian Spirit",
      "cn": "守望圣火"
    },
    "essence": {
      "en": "A sacred fire on an ancient altar, or a loyal guard at the gate. You represent faith, loyalty, and quiet sacrifice.",
      "cn": "古老祭坛上的圣火，或忠诚守望的卫士。你是信仰、忠诚与默默牺牲的化身，照亮他人的同时也承受孤独。"
    },
    "career": {
      "style": {
        "en": "The Ethical Leader. You are driven by a cause. You excel in roles that protect tradition or serve a community.",
        "cn": "道义领袖。你被一种超越物质的使命感驱动。在守护传统、捍卫真理或服务社区时，你的表现最杰出。"
      },
      "fields": {
        "en": "NGO Leadership, Medicine, Religion, Real Estate Ethics, Philanthropy.",
        "cn": "公益、医疗卫生、宗教文化、地产伦理、慈善、文化遗产保护。"
      },
      "wealth": {
        "en": "Dignified Wealth. You value reputation more than money. Fortune comes from the trust you have built over decades.",
        "cn": "体面之财。你视名誉高于金钱。你的财富来自于你数十年如一日建立起的、不可动摇的深厚信任。"
      }
    },
    "love": {
      "mode": {
        "en": "The Loyal Anchor. You are fiercely loyal to your partner, but you often feel a deep loneliness that few reach.",
        "cn": "忠诚锚点。你对伴侣极其忠诚，甚至带有自我牺牲精神。但你内心常有一种深层的孤独，极少有人能触及。"
      },
      "challenge": {
        "en": "Pessimism. You tend to prepare for the worst, sometimes missing the joy of the present due to constant worry.",
        "cn": "悲观倾向。你习惯为最坏的情况做打算，有时会因为过度忧虑未来而错过当下纯粹的快乐。"
      }
    },
    "growth": {
      "en": "Opening the Heart. You grow by learning that it's okay to lean on others, instead of always being the pillar.",
      "cn": "敞开心扉。你通过学习“适时依靠他人，而非永远做那个沉默的支柱”而获得灵魂的宽慰。"
    },
    "health": {
      "en": "Focus: Circulation & Qi. Regular movement is needed to prevent energy from stagnating in the chest.",
      "cn": "关注血液循环与气滞。需要规律的运动和表达来防止能量在胸中郁结。"
    },
    "link": "#"
  },
  "乙未": {
    "name": {
      "en": "The Desert Willow",
      "cn": "旱地柔柳"
    },
    "essence": {
      "en": "A resilient willow in dry soil. You possess a fragile exterior but an incredibly tough, flexible internal system.",
      "cn": "旱地中顽强存活的柳树。你拥有看似纤弱、随风摇曳的外表，内部却拥有极其强悍且灵活的生命系统。"
    },
    "career": {
      "style": {
        "en": "The Anxious Overachiever. You work twice as hard because you never feel fully secure. You excel in craftsmanship.",
        "cn": "焦虑的奋斗者。因为缺乏安全感，你付出了超乎常人的努力。你在技术职位和精密手工艺中表现卓越。"
      },
      "fields": {
        "en": "Tech Support, Artisan Crafts, Healthcare, Academic Research, Precision Engineering.",
        "cn": "技术支持、精密手工艺、高级护理、学术研究、质量监控。"
      },
      "wealth": {
        "en": "Grit Wealth. Your money is earned through consistent effort and careful budgeting. You are a master of making a little go far.",
        "cn": "坚韧之财。你的每一分钱都是靠艰苦努力和精打细算赚来的。你是那种能把有限资源发挥到极致的理财高手。"
      }
    },
    "love": {
      "mode": {
        "en": "The Devoted Keeper. You provide endless care, but you can be controlling because you fear losing stability.",
        "cn": "奉献的守护者。你提供无微不至的照顾，但也可能因为害怕失去稳定而表现出较强的占有欲和控制倾向。"
      },
      "challenge": {
        "en": "Deep Insecurity. Small changes in a relationship can trigger massive internal anxiety for you.",
        "cn": "深度不安。感情中微小的风吹草动都能引发你内心巨大的焦虑波澜，让你反复揣测。"
      }
    },
    "growth": {
      "en": "Inner Abundance. You grow by learning that your value is inherent, not just a byproduct of your labor.",
      "cn": "内在丰盈。你通过学习“你的价值是生而为人自带的，而非仅仅是劳动的产物”来实现自我进阶。"
    },
    "health": {
      "en": "Focus: Spleen & Hydration. You need to keep your body hydrated and avoid excessive internal heat.",
      "cn": "关注脾胃与补水。你需要保持身体水分充足，避免由于思虑过度引发的内火积聚。"
    },
    "link": "#"
  },
  "甲午": {
    "name": {
      "en": "The Solar Flare",
      "cn": "烈火神木"
    },
    "essence": {
      "en": "A tree struck by lightning. You are the spark of genius—fast, brilliant, but often self-consuming.",
      "cn": "被雷电击中的神木，或燃烧的森林。你是天才的火花——敏捷、灿烂，但也常常处于自我消耗的高能状态。"
    },
    "career": {
      "style": {
        "en": "The Innovative Spark. You process info at lightning speed. You are best at launching projects and breakthroughs.",
        "cn": "创意火花。你处理信息的速度惊人。你最擅长启动新项目、从无到有创造突破，而非守成。"
      },
      "fields": {
        "en": "Tech Innovation, Advertising, R&D, High-Frequency Trading, Media.",
        "cn": "技术创新、广告策划、前沿研发、高频交易、新媒体爆发力岗位。"
      },
      "wealth": {
        "en": "Fast Gains. Your wealth comes in bursts. You earn through smart, high-leverage moves rather than long-term drudgery.",
        "cn": "爆发性之财。你的财富是脉冲式的。你通过聪明的高杠杆操作而非长期的重复劳动获利。"
      }
    },
    "love": {
      "mode": {
        "en": "The Electric Lover. Your passion is direct and overwhelming. You bring a storm of excitement to any partner.",
        "cn": "电能爱人。你的激情直接且排山倒海。你会为伴侣带来一场充满兴奋感、如过山车般的感情风暴。"
      },
      "challenge": {
        "en": "Lack of Endurance. You burn bright but get bored fast. Routine is your greatest enemy in relationships.",
        "cn": "耐力不足。你燃烧得极亮，但也厌倦得很快。感情中的长期枯燥常规是你这种“电火花”最大的天敌。"
      }
    },
    "growth": {
      "en": "Sustainable Burning. You grow by learning to pace your energy so you don't burn out too early.",
      "cn": "可持续燃烧。你通过学习“控制能量节奏，以免在任务完成前燃尽”来实现人生的稳步进阶。"
    },
    "health": {
      "en": "Focus: Heart & Head. Watch out for Burnout symptoms and chronic sleep issues.",
      "cn": "关注心脏与头部。注意预防由于脑部超频导致的“过劳”症状和神经性失眠。"
    },
    "link": "#"
  },
  "乙酉": {
    "name": {
      "en": "The Potted Rose",
      "cn": "锦簇利剪"
    },
    "essence": {
      "en": "A manicured flower or a sharp tool. You represent aesthetics meeting razor-sharp precision.",
      "cn": "修剪完美的繁花，或精致的利刃。你是顶级审美与极端精准的完美结合体，外表柔美内心坚硬。"
    },
    "career": {
      "style": {
        "en": "The Perfectionist Pro. You work best under high pressure. You have a laser focus on quality and detail.",
        "cn": "完美主义专家。你在极高压力下表现最稳。你对品质有着激光般的专注，能瞬间发现任何系统的细微瑕疵。"
      },
      "fields": {
        "en": "Surgery, Law, Jewelry Design, Quality Control, Fashion Architecture.",
        "cn": "精密外科、法学分析、珠宝定制、质控专家、高级时装构造。"
      },
      "wealth": {
        "en": "Precision Wealth. Linked to elite skills. People pay a premium for your flawless eye and execution.",
        "cn": "精准之财。你的收入与你精英级的、不可替代的技能挂钩。人们愿意为了你那双“无瑕”的眼睛支付溢价。"
      }
    },
    "love": {
      "mode": {
        "en": "The High-Standard Partner. You want a relationship that looks and feels perfect. You are loyal but very critical.",
        "cn": "高标准伴侣。你追求在视觉和心理上都达到满分的感情。你极其忠诚，但对另一半的要求也近乎苛刻。"
      },
      "challenge": {
        "en": "Cutting Words. Your ability to see flaws means you can be incredibly sharp and critical of small mistakes.",
        "cn": "言语如剪。你发现缺陷的能力太强，这让你可能对伴侣的无心之失表现得过于冷酷和挑剔。"
      }
    },
    "growth": {
      "en": "Compassion. You grow by learning that imperfections are what make people and beauty real.",
      "cn": "慈悲心。你通过学习“不完美才是美与人性的真实所在”而获得灵魂的真正升华。"
    },
    "health": {
      "en": "Focus: Lungs & Nervous System. You need deep breathing and environments with fresh air to relax.",
      "cn": "关注肺部与神经。你需要深呼吸练习、瑜伽，以及空气洁净的生活环境来舒缓张力。"
    },
    "link": "#"
  },
  "甲子": {
    "name": {
      "en": "The Oceanic Sequoia",
      "cn": "海中神木"
    },
    "essence": {
      "en": "The first of 60 pillars. A floating sacred tree, pioneering energy mixed with ancient wisdom.",
      "cn": "六十甲子之首，海中漂浮的神木。你是开创性的化身，兼具了生命初生时的勇气与古老深邃的智慧。"
    },
    "career": {
      "style": {
        "en": "The Visionary Pioneer. You build systems from scratch and possess high prestige in academic or executive roles.",
        "cn": "远见开拓者。你擅长从零开始构建逻辑或组织体系。你在学术或高级行政领域通常拥有令人信赖的天然威望。"
      },
      "fields": {
        "en": "Education, Philosophy, Founder, Strategic R&D, System Architecture.",
        "cn": "教育学、哲学研究、企业创始人、战略研发、系统架构。"
      },
      "wealth": {
        "en": "Prestige Wealth. Money follows your fame and established authority. You earn by being the source of ideas.",
        "cn": "声望之财。金钱追随你的名气和建立的权威，而非辛苦求索。你通过成为思想的源头而获得丰厚回报。"
      }
    },
    "love": {
      "mode": {
        "en": "The Independent Soul. You seek a partner who respects your deep need for mental autonomy and space.",
        "cn": "独立灵魂。你寻找的是能尊重你深层精神空间、不让你感到被束缚的伴侣，爱得理性且深沉。"
      },
      "challenge": {
        "en": "Emotional Isolation. Your mind moves so fast and so deep that you can be hard for a partner to reach emotionally.",
        "cn": "情感孤岛。你的思想由于走得太深、太快，有时会让伴侣感到难以触达你的真实情感核心。"
      }
    },
    "growth": {
      "en": "Social Connection. You grow by bridging the gap between your lofty wisdom and common human needs.",
      "cn": "社会融合。学习如何将你深奥的智慧转化为他人能理解并使用的语言，是你通往圆满的关键。"
    },
    "health": {
      "en": "Focus: Liver & Feet. Keep your mind calm to prevent mental over-exhaustion from manifesting physically.",
      "cn": "关注肝脏与足部。保持心境平和，防止过度用脑导致的体能透支。"
    },
    "link": "#"
  },
  "乙亥": {
    "name": {
      "en": "The Mystic Driftwood",
      "cn": "深海浮木"
    },
    "essence": {
      "en": "Wood floating on a dark, starlit sea. You are intuitive, gentle, and possess a mysterious resilience.",
      "cn": "暗夜星光海面上漂浮的灵木。你直觉惊人、温柔如水，拥有一种在随波逐流中依然能保全自我的神秘韧性。"
    },
    "career": {
      "style": {
        "en": "The Intuitive Creative. You excel in artistic or spiritual fields where emotion matters more than logic.",
        "cn": "直觉创意者。你在那些不需要强逻辑、更看重感性和灵气流动的艺术或灵性领域表现极佳，灵感频发。"
      },
      "fields": {
        "en": "Fine Arts, Occult Arts, Fiction Writing, Psychology, Healing.",
        "cn": "艺术创作、神秘学研究、小说写作、心理咨询、能量愈疗。"
      },
      "wealth": {
        "en": "Gift Wealth. Money comes through unexpected support and hidden talents that you finally reveal.",
        "cn": "天赋之财。通过意外的馈赠、贵人的扶持或挖掘出深藏已久的天赋而获利，带有某种宿命的运气。"
      }
    },
    "love": {
      "mode": {
        "en": "The Deep Soul. You offer absolute empathy and seek a transcendental bond with your partner.",
        "cn": "深魂爱人。你提供绝对的共情与包容，追求一种超脱物质的灵魂绑定，爱得极其细腻且带有梦幻色彩。"
      },
      "challenge": {
        "en": "Escapism. You tend to drift away or hide in your fantasies when real-life problems become too harsh.",
        "cn": "逃避主义。当现实世界的摩擦过于严酷时，你倾向于躲进自己的幻想世界或精神气泡中消失。"
      }
    },
    "growth": {
      "en": "Grounding. You grow by learning to anchor your spiritual dreams into a stable, practical reality.",
      "cn": "落地生根。你通过学习“如何将飘渺的梦想锚定在坚实的现实大地上”，从而实现真正的人生跨越。"
    },
    "health": {
      "en": "Focus: Kidneys & Circulation. Watch for internal dampness affecting your energy levels.",
      "cn": "关注肾脏与循环。注意预防由于体内湿气过重导致的疲劳感或精神涣散。"
    },
    "link": "#"
  },
  "丙寅": {
    "name": {
      "en": "The Dawn Tiger",
      "cn": "旭日初萌"
    },
    "essence": {
      "en": "Sun rising over a forest. You represent pure warmth, optimism, and the boundless potential of new beginnings.",
      "cn": "旭日从森林地平线上升起。你代表了纯粹的温暖、乐观，以及生命每一个阶段中蕴含的无限潜能。"
    },
    "career": {
      "style": {
        "en": "The Charismatic Mentor. You lead through inspiration. You radiate ideas and have a natural gift for uplifting others.",
        "cn": "魅力导师。你靠启发而非行政命令来领导。你散发着源源不断的创意，具备一种天然的教育并提升他人的感召力。"
      },
      "fields": {
        "en": "Education, Motivational Speaking, Philosophy, Charity, Creative Strategy.",
        "cn": "教育事业、励志演讲、哲学研究、慈善机构、创意策划、启蒙教育。"
      },
      "wealth": {
        "en": "Popularity Wealth. Money follows your reputation. When you are respected and loved, fortune finds you naturally.",
        "cn": "人气之财。金钱追随你的名望。当你由于专业或人品被众人尊重和爱戴时，财富自然会汇聚而来。"
      }
    },
    "love": {
      "mode": {
        "en": "The Healing Partner. You are the sunshine in your partner's life, providing warmth and a childlike wonder.",
        "cn": "治愈系伴侣。你是伴侣生活中的恒定阳光，提供无尽的温暖和一种孩子般纯真的、探索世界的乐趣。"
      },
      "challenge": {
        "en": "Naive Idealism. You may ignore reality's red flags because you want to see the absolute best in everyone.",
        "cn": "天真理想主义。因为太想看到每个人身上的优点，你可能会下意识忽略明显的危险信号和现实陷阱。"
      }
    },
    "growth": {
      "en": "Discernment. You grow by learning to focus your light on those who truly deserve it.",
      "cn": "辨别力。你通过学习“将有限的光芒聚焦在真正值得、有反馈的人身上，而非盲目燃烧”而获得跨越。"
    },
    "health": {
      "en": "Focus: Heart & Blood Pressure. Keep your enthusiasm and blood pressure in check.",
      "cn": "关注心脏与血压。注意控制情绪波动的频率，预防由于兴奋过度引发的血压问题。"
    },
    "link": "#"
  },
  "丁卯": {
    "name": {
      "en": "The Lantern Rabbit",
      "cn": "古寺孤灯"
    },
    "essence": {
      "en": "A lantern in a quiet temple. You represent sensitive, candle-like wisdom that guides but never burns.",
      "cn": "寂静古寺中的一盏孤灯。你代表了敏感、谦逊且持久的智慧，你能为迷茫者引路却从不灼伤他人。"
    },
    "career": {
      "style": {
        "en": "The Enlightened Sage. You excel in quiet environments. You are a deep thinker who values quality over quantity.",
        "cn": "觉悟的智者。你在安静、充满智性挑战的环境中表现最佳。你是那种视质量高于数量、追求精深而非广大的思想者。"
      },
      "fields": {
        "en": "Cultural Preservation, Creative Writing, Spiritual Coaching, Niche Research.",
        "cn": "文化保护、文学创作、心理辅导、灵性辅导、冷门学科深度研究。"
      },
      "wealth": {
        "en": "Quiet Wealth. Your fortune is clean and comes from specialized intellectual property or long-term cultural work.",
        "cn": "清贵之财。你的财富通常非常干净，往往来自特定的知识产权、版税或长期的文化事业积累。"
      }
    },
    "love": {
      "mode": {
        "en": "The Sensitive Soul. You seek a telepathic connection. You are gentle, but you need significant personal space.",
        "cn": "敏感灵魂。你追求一种几乎不需要言语的、灵魂层面的深度连接。你很温柔，但对个人空间和独立的需求极高。"
      },
      "challenge": {
        "en": "Deep Suspicion. Because you are so intuitive, you often over-analyze intentions, leading to unnecessary paranoia.",
        "cn": "过度多疑。因为感知力太强，你常过度解读伴侣的微表情或语调，导致不必要的猜忌和心累。"
      }
    },
    "growth": {
      "en": "Outer Strength. You grow by learning that your soft light is your greatest power, not a vulnerability.",
      "cn": "内在韧性。你通过学习“你的柔光和敏感是极其伟大的力量，而非需要隐藏的弱点”来实现进化。"
    },
    "health": {
      "en": "Focus: Eyes & Liver. You are sensitive to environmental toxins and require a pure, high-quality diet.",
      "cn": "关注眼睛与肝脏。你对环境污染和食物毒素敏感，需要维持非常纯净、健康的饮食习惯。"
    },
    "link": "#"
  },
  "丙午": {
    "name": {
      "en": "The Solar Stallion",
      "cn": "烈日天马"
    },
    "essence": {
      "en": "The peak sun of a summer noon. You are the embodiment of intense passion and the drive of a conqueror.",
      "cn": "盛夏正午的巅峰阳光。你是纯粹能量、极致激情和不可阻挡征服欲的化身，能量之强令人眩目。"
    },
    "career": {
      "style": {
        "en": "The Apex Competitor. You lead from the front. You thrive in high-stakes environments where glory is the goal.",
        "cn": "巅峰竞争者。你总是在最前方领跑，享受这种带头冲锋。你在追求荣耀、高风险和高回报的环境中如鱼得水。"
      },
      "fields": {
        "en": "Professional Sports, High-Level Politics, Entertainment, Crisis Leadership.",
        "cn": "竞技体育、高层政界、演艺娱乐界、危机统御中心、顶级市场公关。"
      },
      "wealth": {
        "en": "High-Fluctuation Wealth. You earn big and spend big. Your fortune follows the rhythm of your daring risks.",
        "cn": "剧烈波动之财。你属于赚得多、花得也快的一类。你的财富节奏与你敢于承担风险、追求极致的目标完全同步。"
      }
    },
    "love": {
      "mode": {
        "en": "The Burning Lover. Your love is a wildfire—intense, total, and all-consuming. You seek an equally powerful partner.",
        "cn": "燃烧的爱人。你的爱像一场无法扑灭的野火——浓烈、彻底且带着焚毁一切的决绝。你寻找的是能接纳这种热度的伴侣。"
      },
      "challenge": {
        "en": "Explosive Temper. When your fire is blocked, you can explode with a force that leaves permanent scars.",
        "cn": "爆炸脾气。当你的意志受阻或能量被压制时，你的瞬间爆发力会对亲密关系留下永久的裂痕。"
      }
    },
    "growth": {
      "en": "Temperance. You grow by learning to harness your fire to heat a home, rather than burn down the forest.",
      "cn": "节制与转化。你通过学习“利用内在的火种去温暖家园，而非失控烧毁整座森林”而获得真正的进化。"
    },
    "health": {
      "en": "Focus: Cardiovascular & Inflammation. Watch for high blood pressure and heat-related ailments.",
      "cn": "关注心血管与炎症。注意预防由于过热、兴奋过度引发的高血压及身体各部位炎症。"
    },
    "link": "#"
  },
  "丁巳": {
    "name": {
      "en": "The Electric Viper",
      "cn": "电火灵蛇"
    },
    "essence": {
      "en": "Intense, shifting fire or lightning. You represent high intelligence, strategic mystery, and a relentless inner drive.",
      "cn": "极度炽热且变幻莫测的火光。你代表了高智商、战略层面的神秘感，以及一种永不熄灭的内在驱动力。"
    },
    "career": {
      "style": {
        "en": "The Intense Strategist. You possess a laser-like focus and the speed of lightning. You thrive in complex, high-competition arenas.",
        "cn": "强力策划者。你拥有一种激光般的专注力和闪电般的执行力。你在复杂、高频竞争且需要即时反应的行业中无人能敌。"
      },
      "fields": {
        "en": "Tech Development, Strategic Investment, Intelligence, Advanced Manufacturing.",
        "cn": "尖端科技研发、战略投资、情报分析、精密制造、博弈论应用。"
      },
      "wealth": {
        "en": "Active Profit. Money is made through speed and superior positioning. You earn by seeing the move before others do.",
        "cn": "活跃之财。你靠反应速度和更高维度的布局获利。你在别人还没看清棋局时就已经先手一步。"
      }
    },
    "love": {
      "mode": {
        "en": "The Intense Obsession. You love with extreme focus and possessiveness, seeking a total union with your partner.",
        "cn": "极致痴恋。你爱得极度专注且占有欲强，追求与伴侣在精神和肉体上的完全融合。"
      },
      "challenge": {
        "en": "The Burn. Your intensity can be exhausting. When you feel insecure, your suspicion can turn into a destructive force.",
        "cn": "灼烧感。你的强度有时会让伴侣精疲力尽。当你感到不安全时，你的猜疑会演变成极具破坏性的力量。"
      }
    },
    "growth": {
      "en": "Emotional Maturity. You grow by learning to trust the silence and the space within a relationship.",
      "cn": "情感的成熟。你通过学习“信任关系中的留白与沉默”，而非时刻紧盯着对方，来实现真正的进化。"
    },
    "health": {
      "en": "Focus: Heart & Nervous System. You need to manage high-intensity stress to prevent 'fire' from burning out your nerves.",
      "cn": "关注心脏与神经系统。你需要管理好高强度压力，防止体内的“火气”烧干你的精力储备。"
    },
    "link": "#"
  },
  "丙申": {
    "name": {
      "en": "The Golden Sunset",
      "cn": "夕阳熔金"
    },
    "essence": {
      "en": "Sun reflecting off golden waves. You represent the peak of beauty, worldly abundance, and sophisticated wisdom.",
      "cn": "黄昏时分夕阳在金波上的倒影。你代表了极致审美、世俗富足与圆融智慧交织出的精致巅峰。"
    },
    "career": {
      "style": {
        "en": "The Sophisticated Tycoon. You mix business with high-level pleasure. You have excellent commercial instincts.",
        "cn": "精致大亨。你天生懂得将生意与高级享受结合。你对品质有着无可挑剔的眼光，且具备敏锐的商业嗅觉。"
      },
      "fields": {
        "en": "Finance, Luxury Branding, Global Trade, Culinary Arts, High-End Tourism.",
        "cn": "金融投资、奢侈品牌、全球贸易、高级饮食文化、高端酒店与旅游业。"
      },
      "wealth": {
        "en": "Abundant Flow. Money is a tool for you to experience life's best. You are a natural magnet for commercial deals.",
        "cn": "丰沛之财。金钱对你而言是体验生命之美的工具。你天生就是优质商业机会和合作伙伴的磁石。"
      }
    },
    "love": {
      "mode": {
        "en": "The Romantic Connoisseur. You are a generous partner who knows how to create high-standard memories and dates.",
        "cn": "浪漫鉴赏家。你是一个有趣且极大方的伴侣，深谙如何制造高标准的回忆，每一场约会都充满了仪式感。"
      },
      "challenge": {
        "en": "Fear of Boredom. You may struggle in relationships that lack material advancement or constant excitement.",
        "cn": "对平庸的恐惧。在缺乏新鲜感、物质生活停滞或过于枯燥的长久关系中，你可能会感到难以忍受。"
      }
    },
    "growth": {
      "en": "Spiritual Depth. You grow by finding values that are internal and eternal, rather than purely visual and material.",
      "cn": "精神深度。你通过寻找内在且永恒的灵魂价值，而非纯粹物质上的追求，来实现真正的自我进化。"
    },
    "health": {
      "en": "Focus: Lungs & Respiratory System. Watch for sensitivity in dry or polluted environments.",
      "cn": "关注肺部与大肠。在干燥或空气质量欠佳的环境中，要注意呼吸系统的脆弱性。"
    },
    "link": "#"
  },
  "丁酉": {
    "name": {
      "en": "The Starry Jewel",
      "cn": "星辉珠宝"
    },
    "essence": {
      "en": "A diamond under a spotlight or a golden phoenix. You are pure, precious, and possess an air of high-class perfection.",
      "cn": "聚光灯下的钻石或金凤凰。你纯粹、珍贵且带有一点冷意，自带一种高阶完美的精英气场。"
    },
    "career": {
      "style": {
        "en": "The Elite Professional. You are born with luck and high standards. You excel in environments where flawlessness is key.",
        "cn": "精英专家。你生来就带有某种好运和极高标准。你在那些要求“零容忍错误”的高端职业环境中简直无懈可击。"
      },
      "fields": {
        "en": "Wealth Management, Jewelry, Law, Specialized Surgery, Precision Finance.",
        "cn": "高端理财、珠宝鉴定、法律仲裁、精细外科手术、精密金融分析。"
      },
      "wealth": {
        "en": "Elite status Wealth. You earn through maintaining a premium status. Your investments are as precise as your work.",
        "cn": "精英之财。你通过维持顶级的个人品牌和身份获利。你的理财和投资通常像你的手术刀一样精准。"
      }
    },
    "love": {
      "mode": {
        "en": "The Quality Lover. You seek a partner who is equally polished. You value intellectual and visual harmony.",
        "cn": "高品位爱人。你寻找的是同样精致且成功的伴侣。你极其看重沟通中的智力匹配和视觉层面的完美。"
      },
      "challenge": {
        "en": "Extreme Criticism. You can be so focused on flaws that you forget to appreciate the raw beauty of your partner.",
        "cn": "极度挑剔。你有时太过于关注对方的瑕疵（无论性格还是外表），以至于忘了欣赏灵魂中最真实的美。"
      }
    },
    "growth": {
      "en": "Accepting Flaws. You grow by learning that perfection is a myth and that true beauty lies in the cracks.",
      "cn": "拥抱缺陷。你通过学习“完美只是神话”以及“裂痕才是生命力所在”这一道理，实现境界的跃迁。"
    },
    "health": {
      "en": "Focus: Lungs & Skin. You require a very organized and clean living environment to stay in peak health.",
      "cn": "关注肺部与皮肤。你对生活细节要求极高，需要一个整洁、空气质量上乘的环境来保持健康。"
    },
    "link": "#"
  },
  "丙戌": {
    "name": {
      "en": "The Sunset Guardian",
      "cn": "古庙夕照"
    },
    "essence": {
      "en": "Sunset over an ancient temple. You are spiritual, protective, and possess a quiet wisdom born from patience.",
      "cn": "古庙前的夕阳余晖，或黄昏时的忠诚守望者。你具有深厚的灵性、保护欲，拥有一种在寂静中孕育的静谧智慧。"
    },
    "career": {
      "style": {
        "en": "The Soulful Architect. You seek meaning over money. You are a great listener and excel in roles that guide others.",
        "cn": "灵魂建筑师。你追求生命意义多过追求金钱积累。你是一个极佳的倾听者，在引导或保护他人内心世界的角色中表现出色。"
      },
      "fields": {
        "en": "Psychology, Cultural Heritage, Metaphysics, Social Work, Creative Writing.",
        "cn": "心理咨询、文化遗产保护、玄学研究、社会工作、自由写作、公益组织。"
      },
      "wealth": {
        "en": "Accumulated Value. Your wealth is built on long-term assets and your deep, trusted reputation in your community.",
        "cn": "沉淀之财。你的财富建立在长期资产持有和你在社群中建立的、极受信赖的名声之上。"
      }
    },
    "love": {
      "mode": {
        "en": "The Loyal Anchor. You are the emotional foundation of your family, offering a safe, spiritual haven for your partner.",
        "cn": "忠诚锚点。你是家庭无可争议的情感基石。你为伴侣提供一个安全、充满精神高度的、可栖息的避风港。"
      },
      "challenge": {
        "en": "Melancholy. You are prone to feeling lonely even in a crowd, often carrying the emotional weights of the past.",
        "cn": "忧郁底色。即便身处闹市你也容易感到内在的孤独，且常背负着过去的情感重担，难以释怀。"
      }
    },
    "growth": {
      "en": "Living in the Present. You grow by letting go of the past and learning to enjoy the bright sun of the now.",
      "cn": "活在当下。你通过学习放下对过往的执念，转而享受此时此刻灿烂的阳光，来实现自我的救赎。"
    },
    "health": {
      "en": "Focus: Heart & Blood Circulation. You need warmth and community to prevent your heart from feeling 'isolated'.",
      "cn": "关注心脏与血液循环。你需要温暖的人际互动和社交圈来防止内心感到枯燥和荒凉。"
    },
    "link": "#"
  },
  "丁未": {
    "name": {
      "en": "The Twilight Desert",
      "cn": "夏夜余温"
    },
    "essence": {
      "en": "Warm sand at twilight or a candle in a vast field. You are enduring, detailed, and possess a quiet, unquenchable inner fire.",
      "cn": "薄暮时分温暖的沙砾，或广袤原野中的不灭红烛。你持久、极其注重细节，拥有一种拒绝熄灭的、强大的静谧内火。"
    },
    "career": {
      "style": {
        "en": "The Meticulous Craftsman. You are a master of details and service. You possess incredible stamina for complex tasks.",
        "cn": "细致入微的工匠。你是细节、工艺和服务的大师。你对专业领域且极其复杂的任务拥有一种惊人的韧性和持久力。"
      },
      "fields": {
        "en": "Quality Engineering, Specialized Medicine, Culinary Arts, Tech Support, Textile Design.",
        "cn": "质量工程、精专医疗、烹饪艺术、技术支持、纺织设计、精密仪器制造。"
      },
      "wealth": {
        "en": "Skill-Based Wealth. You earn through your hand and your eye. Your value lies in the perfection you bring to every task.",
        "cn": "技艺之财。你靠手眼合一、精益求精而获利。你的核心价值在于你为每一项任务带来的那种近乎强迫症的完成度。"
      }
    },
    "love": {
      "mode": {
        "en": "The Tender Shell. You appear tough and independent, but your heart is incredibly sensitive and dedicated to comfort.",
        "cn": "温柔的外壳。外表看起来坚强且不依不附，但你的内心极其敏感，且全心全意致力于为伴侣提供细腻的舒适感。"
      },
      "challenge": {
        "en": "Emotional Sensitivity. You can be easily wounded by slights, leading to long periods of internal sulking.",
        "cn": "情感过敏。你很容易被微小的冷落所伤，导致长时间的生闷气或心理拉锯战。"
      }
    },
    "growth": {
      "en": "Releasing Control. You grow by learning that life doesn't always have to be perfect to be incredibly meaningful.",
      "cn": "释放控制。你通过学习“生活不必处处完美，也可以富有深层的意义和美感”而获得灵魂的真正放松。"
    },
    "health": {
      "en": "Focus: Digestion & Hydration. Watch for internal heat leading to skin sensitivity or stomach acid.",
      "cn": "关注脾胃与补水。注意预防由“内热”引起的皮肤敏感、胃部不适或焦虑状态。"
    },
    "link": "#"
  },
  "丙子": {
    "name": {
      "en": "The Sunlit Wave",
      "cn": "粼粼波光"
    },
    "essence": {
      "en": "Sun reflecting off a clear lake. You are dazzling, beautiful, and possess a magnetic charm that draws people effortlessly.",
      "cn": "清澈湖面上跳跃的、碎金般的阳光。你耀眼、迷人，拥有一种磁石般的吸引力，让周围人不由自主地向你靠拢。"
    },
    "career": {
      "style": {
        "en": "The Visual Icon. You excel in roles where image and first impressions matter. You are a natural at marketing your vision.",
        "cn": "视觉符号。你在那些极其看重个人形象、审美和第一印象的职位中表现最佳。你天生就擅长包装和营销你的创意。"
      },
      "fields": {
        "en": "Fashion, Media, Entertainment, High-End Sales, Art Direction.",
        "cn": "时尚产业、传媒公关、演艺娱乐、高端奢侈品销售、艺术指导。"
      },
      "wealth": {
        "en": "Magnet Wealth. You attract fortune through your charisma and visibility. Your fame is your most valuable capital.",
        "cn": "磁吸之财。你通过个人魅力和高频的出镜率吸引财富。在这个时代，你的名气和眼缘就是你最厚重的资产。"
      }
    },
    "love": {
      "mode": {
        "en": "The Dazzling Partner. You provide a glamorous, exciting relationship. You seek a partner who can admire and match your light.",
        "cn": "夺目的伴侣。你能提供一种光鲜亮丽、充满新鲜感的感情生活。你很浪漫，寻找的是能欣赏并匹配你光芒的人。"
      },
      "challenge": {
        "en": "Paradoxical Coldness. Beneath your sunny exterior lies a cool, calculating rationality that can surprise a partner.",
        "cn": "矛盾的冷感。在你灿烂的外表下，隐藏着一种酷冷、甚至有些疏离的理性，这有时会让伴侣感到意外和不安。"
      }
    },
    "growth": {
      "en": "Internal Source. You grow by finding a source of self-worth that doesn't depend on the admiration of the world.",
      "cn": "内在光源。你通过寻找一种不依赖于外界喝彩和赞美的自我价值源泉，来实现真正的灵魂独立。"
    },
    "health": {
      "en": "Focus: Vision & Heart. Protect your eyes from over-stimulation and your heart from emotional fatigue.",
      "cn": "关注视力与心脏。保护眼睛免受信息和光的过载伤害，保护心脏免受过度兴奋后的空虚感影响。"
    },
    "link": "#"
  },
  "丁丑": {
    "name": {
      "en": "The Starry Swamp",
      "cn": "湿地星光"
    },
    "essence": {
      "en": "Starlight reflected in dark marsh. You represent hidden genius and a brilliance that works best in the quiet shadows.",
      "cn": "暗夜里静谧湿地映出的星光。你代表了不显山露水的隐匿天才，以及一种在阴影和寂静中表现最出色的才华。"
    },
    "career": {
      "style": {
        "en": "The Behind-the-Scenes Genius. You possess immense creative power that you prefer to use privately. You are a secret weapon.",
        "cn": "幕后天才。你拥有巨大的创意或分析能量，但你更倾向于在安静的后方行使。你是任何团队中那个不可或缺的“秘密武器”。"
      },
      "fields": {
        "en": "Specialized Research, Advanced Design, Investigation, Occult Arts, Data Analysis.",
        "cn": "精专研究、高阶设计、调查咨询、玄学艺术、数据深挖、冷门学术。"
      },
      "wealth": {
        "en": "Invisible Rich. You likely have hidden sources of income or a lifestyle that is much wealthier than it appears.",
        "cn": "隐形富豪。你可能拥有外人看不出的稳定收入源，或者实际生活水平远比你展现出来的要优渥、讲究得多。"
      }
    },
    "love": {
      "mode": {
        "en": "The Silent Keeper. You are a deep, loyal observer. You express love through subtle, meaningful actions.",
        "cn": "沉默的守望者。你是一个深沉且极度忠诚的观察者。你通过含蓄、持久且有实际意义的行动来表达爱，而非口头承诺。"
      },
      "challenge": {
        "en": "Passive-Aggression. You struggle to speak your needs directly, letting resentment build until it becomes cold and damp.",
        "cn": "被动攻击。你很难直接表达你的不满或需求，常任由负面情绪积聚，直到它变得像湿地一样寒冷、难以沟通。"
      }
    },
    "growth": {
      "en": "Finding the Voice. You grow by learning to step into the light and claim credit for your immense brilliance.",
      "cn": "发出声音。你通过学习“适时走到聚光灯下，并为你的卓越才华争取应得的认可和荣誉”来实现人生的跨越。"
    },
    "health": {
      "en": "Focus: Heart & Spleen. Watch out for 'Internal Dampness' affecting your energy levels and motivation.",
      "cn": "关注心脾。注意预防由于体内“湿气”过重导致的整体动力缺失或情绪低落。"
    },
    "link": "#"
  },
  "丙辰": {
    "name": {
      "en": "The Solar Ridge",
      "cn": "火龙之山"
    },
    "essence": {
      "en": "Sun shining on a great mountain. You represent passionate authority and a massive presence that inspires people.",
      "cn": "阳光普照的巍峨大山。你代表了充满激情的权威感和巨大的存在感，你生来就具备感召大众的领袖魅力。"
    },
    "career": {
      "style": {
        "en": "The Charismatic Leader. You lead by vision and warmth. You are a natural organizer who unites people for a goal.",
        "cn": "魅力领袖。你靠宏大远见和人格温度来领导。你是天生的组织者，能够让不同背景的人团结在你的旗帜之下。"
      },
      "fields": {
        "en": "Politics, Large-Scale Project Management, Education, Public Sector.",
        "cn": "政界领导、大型项目管理、教育事业、公共资源整合、大众传媒。"
      },
      "wealth": {
        "en": "Expanding Wealth. Money flows from your large-scale influence and your ability to consolidate resources.",
        "cn": "扩张之财。财富来自于你宏大的社会影响力和对大宗资源的整合能力。你赚的是“势”带来的钱。"
      }
    },
    "love": {
      "mode": {
        "en": "The Generous Guardian. You offer both intense passion and unshakeable support. You are the pride of your partner.",
        "cn": "慷慨守护者。你提供热烈的爱和不可撼动的物质/精神支持。你是伴侣眼中的骄傲，能撑起一整片天空。"
      },
      "challenge": {
        "en": "Overpowering Presence. Your light can be too intense for some, sometimes making your partner feel overshadowed.",
        "cn": "气场太强。你的光芒有时会盖过伴侣，让对方感到在关系中失去了主体性或感到巨大的被压迫感。"
      }
    },
    "growth": {
      "en": "Delegation. You grow by learning to trust others with the details of your vision, allowing you to focus on the horizon.",
      "cn": "学会授权。你通过学习“信任他人去处理细节，将手放开”，从而让自己能专注于更远大的地平线。"
    },
    "health": {
      "en": "Focus: Spleen & Circulation. Regular activity is needed to keep your immense energy moving smoothly.",
      "cn": "关注脾胃与循环。需要规律的户外运动来保持你体内宏大能量的顺畅流动，防止淤积。"
    },
    "link": "#"
  },
  "戊辰": {
    "name": {
      "en": "The Imperial Mountain",
      "cn": "皇陵之巅"
    },
    "essence": {
      "en": "A grand, ancient mountain containing hidden palaces and secrets. You possess a massive presence and an aura of natural, unshakeable authority that commands silence.",
      "cn": "藏着地下宫殿和远古秘密的宏伟山脉。你拥有巨大的存在感和一种天然的、不可撼动的权威气场，令人不自觉地保持肃静与敬畏。"
    },
    "career": {
      "style": {
        "en": "The Empire Builder. You lead by gravity, not speed. People are naturally drawn into your orbit. You are built to handle massive responsibilities and long timelines.",
        "cn": "帝国建造者。你靠“引力”而非速度来领导。人们会自然地被吸引到你的轨道上。你生来就是为了处理重任和超长周期的宏大项目。"
      },
      "fields": {
        "en": "High-level Governance, Corporate Strategy, Heavy Construction, Resource Extraction.",
        "cn": "政界高层、企业战略规划、重型建筑、大型资源性产业。"
      },
      "wealth": {
        "en": "Massive Assets. You command large-scale fortunes. Your financial life is often tied to tangible assets, land, and long-term equity.",
        "cn": "巨量财富。你掌控的是规模化的财富。你的财务状况通常与实物资产、土地和长期股权深度绑定，根基极深。"
      }
    },
    "love": {
      "mode": {
        "en": "The Fortress Partner. You offer a sense of eternal stability. You are the pillar that your entire family leans on, providing unshakeable security.",
        "cn": "要塞伴侣。你提供一种永恒的稳定感。你是整个家庭都在倚靠的那根顶梁柱，给予伴侣风雨不侵的安全感。"
      },
      "challenge": {
        "en": "Immovable Walls. During conflict, you become silent and stubborn, acting like a stone wall that makes negotiation impossible.",
        "cn": "顽固之墙。冲突时你会化身一座无法移动的石山，拒绝沟通，让伴侣感到彻底的无力与隔绝。"
      }
    },
    "growth": {
      "en": "Adaptability. Your life goal is to build something lasting, but you must learn to adapt to the changing climate to survive.",
      "cn": "适应力。你的目标是建立永恒的功业，但你必须学会根据时代气候的变化去调整自己的形态，否则容易崩塌。"
    },
    "health": {
      "en": "Focus: Stomach & Digestive Flow. Watch for 'Earth Stagnation' leading to tumors or bloating.",
      "cn": "关注脾胃与代谢。注意预防“土气淤滞”导致的腹胀、结节或各类慢性炎症。"
    },
    "link": "#"
  },
  "戊戌": {
    "name": {
      "en": "The Volcanic Range",
      "cn": "万仞孤烟"
    },
    "essence": {
      "en": "A range of dormant volcanoes under a scorching sun. You are rugged, independent, and possess an unbreakable spirit tempered by strict discipline.",
      "cn": "烈日下连绵的休眠火山。你崎岖、独立，体内蕴含着巨大的势能，却被严明的律法和内心的信仰死死压住，极其隐忍。"
    },
    "career": {
      "style": {
        "en": "The Spiritual Guardian. You are extremely principled. You protect the rules and the traditions of your industry with absolute grit. You are the last line of defense.",
        "cn": "精神守护者。你极度讲原则。你用绝对的毅力捍卫着行业或家族的规则与传统。你是混乱世界中最后的防线。"
      },
      "fields": {
        "en": "Security, Religious Leadership, Cultural Preservation, Defense, Hard-Skill Engineering.",
        "cn": "安保系统、宗教领袖、文化遗产保护、国防工业、硬核工程专家。"
      },
      "wealth": {
        "en": "Persistence Wealth. Your fortune is built on manual or intellectual grit. You earn by being the one who never quits in a crisis.",
        "cn": "毅力之财。你的财富建立在持久的磨炼之上。你通过成为危机中那个永不退缩的人来获取属于你的利润。"
      }
    },
    "love": {
      "mode": {
        "en": "The Solitary Hero. You are loyal to a fault, but unromantic. You show love through loyalty and being there during the hardest times.",
        "cn": "孤绝英雄。你忠诚得近乎偏执，但并不浪漫。你通过患难与共的守候来表达爱，而非甜言蜜语。"
      },
      "challenge": {
        "en": "Inflexibility. Once you have made up your mind, moving a mountain is easier than changing your opinion, which frustrates partners.",
        "cn": "顽固不化。一旦你下了定论，挪动大山都比改变你的想法要容易。这常让伴侣感到沟通受阻，甚至绝望。"
      }
    },
    "growth": {
      "en": "Turning Fire into Heat. You grow by learning to use your inner fire to power systems rather than burn them down.",
      "cn": "能量转化。你通过学习将内在的怒火转化为驱动体系的动力，而非烧毁森林，来实现进化。"
    },
    "health": {
      "en": "Focus: Stomach & Skin Dryness. You need regular hydration and emotional release.",
      "cn": "关注胃燥与皮肤。你需要频繁补水，以及寻找能够释放压抑情绪的出口，防止“内燥”。"
    },
    "link": "#"
  },
  "戊寅": {
    "name": {
      "en": "The Guardian Ridge",
      "cn": "岩上伏虎"
    },
    "essence": {
      "en": "A tiger standing on a rocky ridge. You are powerful, territorial, and possess the grit to grow in the harshest, most unforgiving terrains.",
      "cn": "伫立在乱石脊梁上的猛虎。你充满力量，领地意识极强，拥有一种在最贫瘠、最恶劣的地形中扎根生长的顽强毅力。"
    },
    "career": {
      "style": {
        "en": "The Self-Reliant Leader. You don't wait for permission. You build your own kingdom from scratch, often excelling in pioneering or high-conflict industries.",
        "cn": "自立的开拓者。你从不等待许可。你从零开始建立自己的王国，常在那些需要“硬碰硬”或开辟荒地的行业中脱颖而出。"
      },
      "fields": {
        "en": "Startup Founders, Heavy Construction, Law Enforcement, Independent Research.",
        "cn": "创业创始人、重型建筑、执法部门、独立科研项目。"
      },
      "wealth": {
        "en": "Self-Made Fortune. Your wealth is carved out of hard rock through pure individual struggle. You earn by being too tough to quit.",
        "cn": "硬核之财。你的财富是通过个人的拼搏从乱石中凿出来的。你赚钱靠的是那股“死磕到底”的狠劲。"
      }
    },
    "love": {
      "mode": {
        "en": "The Fierce Guardian. You are protective and loyal, but you can be domineering. You seek a partner who respects your strength.",
        "cn": "悍然守护者。你极具保护欲且忠诚，但占有欲也极强。你寻找的是能理解并尊重你这种强度的伴侣。"
      },
      "challenge": {
        "en": "Internal Tension. Your 'never show weakness' policy creates immense stress within you and the relationship.",
        "cn": "内在紧绷。你那种“永不示弱”的原则会给自己和感情带来巨大的心理压力，让亲密关系变得沉重。"
      }
    },
    "growth": {
      "en": "Learning Vulnerability. You grow by understanding that a ridge is stronger when it allows the wind to pass through.",
      "cn": "学习柔软。你通过理解“脊梁在允许风穿过时更坚固”这一道理，实现人生的跨越。"
    },
    "health": {
      "en": "Focus: Liver & Spleen. Watch out for tension-related digestive issues.",
      "cn": "关注肝脾。注意预防因长期压力和紧绷导致的消化系统问题。"
    },
    "link": "#"
  },
  "戊申": {
    "name": {
      "en": "The Mineral Mountain",
      "cn": "富矿金山"
    },
    "essence": {
      "en": "A mountain filled with precious ores. You are talented, expressive, and possess a wealth of internal resources that you love to share.",
      "cn": "蕴藏着珍贵矿石的山脉。你多才多艺、表达欲强，拥有一种极其丰厚的内在资源，且乐于向世界展示。"
    },
    "career": {
      "style": {
        "en": "The Creative Architect. You are smart, eloquent, and have a natural gift for enjoying life. You build wealth through talent and social charm.",
        "cn": "创意建筑师。你聪明、口才极佳，且天生懂得享受生活。你通过才华、表达和社交魅力来构建自己的财富帝国。"
      },
      "fields": {
        "en": "Finance, Luxury Culinary, Arts, Public Relations, Investment.",
        "cn": "金融投资、高级餐饮文化、艺术创作、公关媒体。"
      },
      "wealth": {
        "en": "Natural Abundance. You are a 'lucky' pillar. Money flows to you because of your ability to enjoy life and create value through talent.",
        "cn": "天生丰饶。你是自带好运的日柱。财富流向你是由于你那种享受生活的能力和通过才华创造价值的本能。"
      }
    },
    "love": {
      "mode": {
        "en": "The Generous Hedonist. You show love by sharing the best life has to offer—fine food, travel, and beautiful experiences.",
        "cn": "慷慨的享乐者。你通过分享生活中最美好的事物——美食、旅行和绝佳的感官体验——来表达爱。"
      },
      "challenge": {
        "en": "Self-Centeredness. You may become so focused on your own comfort and expression that you forget the partner's needs.",
        "cn": "自我中心。你有时会过度沉溺于自己的舒适和自我表达，从而忽略了伴侣的实际需求。"
      }
    },
    "growth": {
      "en": "Refining Talent. You grow by learning to polish your raw mineral into a finished diamond through focus and discipline.",
      "cn": "才华精炼。你通过学习将原始矿石通过专注和纪律打磨成成品钻石，来实现人生跃迁。"
    },
    "health": {
      "en": "Focus: Digestion & Lungs. Watch for issues related to over-indulgence.",
      "cn": "关注消化系统与肺。注意预防由过度享受美食、烟酒带来的健康负担。"
    },
    "link": "#"
  },
  "戊子": {
    "name": {
      "en": "The Island Peak",
      "cn": "深海孤峰"
    },
    "essence": {
      "en": "A massive mountain peak rising from the deep abyss. On the surface, it is silent; beneath the waterline, it sits on an immense foundation of wealth.",
      "cn": "从深渊中升起的孤峰。海面上，它寂静冷峻；海面下，它坐拥无比厚重的财富基座。你是“大智若愚”的典型。"
    },
    "career": {
      "style": {
        "en": "The Smart Investor. You possess a 'poker face' that hides a sharp financial mind. You are rational, patient, and extremely pragmatic.",
        "cn": "精明的投资者。你拥有一张隐藏着极度精准算盘的“扑克脸”。你理智、耐心，且是无可救药的务实主义者。"
      },
      "fields": {
        "en": "Banking, Asset Management, Real Estate, Infrastructure, Macro-Planning.",
        "cn": "银行业、资产管理、房地产、大型基建、宏观战略规划。"
      },
      "wealth": {
        "en": "Secure Wealth. You are a natural at holding money and finding hidden profit where others see only emptiness.",
        "cn": "稳固之财。你天生擅长守财，且总能在别人觉得荒芜的地方发现潜伏的利润。你本身就是个“金库”。"
      }
    },
    "love": {
      "mode": {
        "en": "The Realistic Partner. You show love through financial security and building a stable future, rather than through emotional displays.",
        "cn": "现实派伴侣。你通过提供经济安全感和构建稳定的未来来表达爱。对你来说，给对方买份保险比送束玫瑰更浪漫。"
      },
      "challenge": {
        "en": "Emotional Coldness. Your extreme rationality can make a partner feel like they are living with a monument rather than a person.",
        "cn": "情感冷感。极度的理智有时会让伴侣觉得是跟一座石像生活在一起，缺乏温情和情绪起伏。"
      }
    },
    "growth": {
      "en": "Strategic Management. You grow by learning how to consolidate power and multiply your existing assets.",
      "cn": "资源整合。你通过学习如何巩固权力并让你手中的现有资产成倍增长来获得进化。"
    },
    "health": {
      "en": "Focus: Spleen & Kidneys. Watch for energy blockages due to a lack of emotional release.",
      "cn": "关注脾肾。注意预防由于长期情绪压抑导致的身体沉重或代谢淤积。"
    },
    "link": "#"
  },
  "戊午": {
    "name": {
      "en": "The Volcanic Peak",
      "cn": "熔岩火峰"
    },
    "essence": {
      "en": "A mountain containing an active core of fire. You are steady on the outside but possess an explosive, passionate energy within.",
      "cn": "核心蕴含着烈火的山峰。外表稳重厚实，内心却拥有爆炸性的、热烈的能量。你是不动如山与侵略如火的结合。"
    },
    "career": {
      "style": {
        "en": "The Dynamic Leader. You possess the endurance of the earth and the speed of fire. You excel at turning vision into reality through pure passion.",
        "cn": "动态领袖。你兼具大地的耐力和火的爆发力。你极其擅长通过纯粹的热情将宏伟愿景转化为现实成果。"
      },
      "fields": {
        "en": "Real Estate Development, High-End Manufacturing, Professional Sports, Energy.",
        "cn": "房地产开发、高端制造业、竞技体育行业、能源产业。"
      },
      "wealth": {
        "en": "Booming Wealth. Your fortune grows rapidly during cycles of expansion. You earn by being bolder and faster than the competition.",
        "cn": "爆发性之财。你的财富在扩张周期内增长极快。你通过比竞争对手更胆大、更迅速来获取利润。"
      }
    },
    "love": {
      "mode": {
        "en": "The Protective Sun. You are warm, generous, and dominant. You bring light and security to your partner.",
        "cn": "炽热守护者。你温暖、慷慨且极具主导权。你会为伴侣带来阳光般的关怀，但也要求绝对的尊重。"
      },
      "challenge": {
        "en": "Sudden Eruptions. Your patience is high, but when it breaks, your temper is catastrophic for the relationship.",
        "cn": "突然爆发。你的耐性很高，但一旦触及底线，你的怒火对感情来说是灾难性的。"
      }
    },
    "growth": {
      "en": "Energy Channeling. You grow by learning to vent your internal heat slowly and productively.",
      "cn": "能量导流。你通过学习将内在的热量缓慢且建设性地释放，而非突然爆发，来实现自我进化。"
    },
    "health": {
      "en": "Focus: Heart & Stomach. Watch out for 'Heart Fire' affecting your digestion.",
      "cn": "关注心脏与脾胃。注意预防由“心火过旺”引起的肠胃不适或血压波动。"
    },
    "link": "#"
  },
  "己丑": {
    "name": {
      "en": "The Fertile Valley",
      "cn": "湿土藏金"
    },
    "essence": {
      "en": "A valley in winter, silently holding life. You are patient, deep, and resilient, with a vast internal world that few see.",
      "cn": "冬日里的沉静山谷，默默孕育生机。你耐心、深邃且具有极强的韧性，拥有一个极少人能窥见的、巨大的内心世界。"
    },
    "career": {
      "style": {
        "en": "The Silent Cultivator. You possess extreme work ethic and attention to detail. You are the reliable pillar who builds wealth slowly but surely.",
        "cn": "沉默的耕耘者。你拥有惊人的职业道德和细节把控力。你是那种稳步扎实积累财富的定海神针，从不急于求成。"
      },
      "fields": {
        "en": "Medical Research, Archives, Museum Curation, Agriculture, High-Precision Arts.",
        "cn": "医疗科研、档案管理、博物馆策划、现代农业、高精密手工艺。"
      },
      "wealth": {
        "en": "Saved Wealth. Your fortune grows through consistent accumulation. You are often the 'Invisible Rich' in your circle.",
        "cn": "积蓄之财。你的财富通过数十年如一日的积累增长。你往往是圈子里那个不显山露水的“隐形富豪”。"
      }
    },
    "love": {
      "mode": {
        "en": "The Persistent Partner. Your love is a slow-burn devotion that creates an unbreakable safety net for your family.",
        "cn": "长情的伴侣。你的爱是慢火细熬的奉献。你一旦认定，就会为家庭建立起一张不可摧毁的安全网。"
      },
      "challenge": {
        "en": "Emotional Repression. You swallow grievances until they become part of your identity, leading to hidden bitterness.",
        "cn": "情感压抑。你习惯把委屈咽进心里，直到它们变成性格的一部分，这会导致内心某种长期的苦味。"
      }
    },
    "growth": {
      "en": "Endurance. You grow by understanding the seasons of life and being the last person standing in any crisis.",
      "cn": "耐力。你通过理解人生的四季规律，并成为危机中最后一个离开战场的人来实现自我进化。"
    },
    "health": {
      "en": "Focus: Spleen & Warmth. You are prone to 'internal cold'. Warm foods are your medicine.",
      "cn": "关注脾胃与内寒。你的消化系统容易受寒。温热的食物和充足的阳光是你最好的补药。"
    },
    "link": "#"
  },
  "己未": {
    "name": {
      "en": "The Dusty Plains",
      "cn": "烈日平原"
    },
    "essence": {
      "en": "Dry, rugged plains under a vast sky. You are independent, resilient, and capable of thriving in conditions that would break others.",
      "cn": "苍穹下干燥、崎岖的平原。你独立、顽强，拥有一种能在足以击垮他人的恶劣环境中蓬勃生长的草根韧性。"
    },
    "career": {
      "style": {
        "en": "The Resilient Survivor. You are unbreakable. You thrive on hard work and possess a gritty independence that needs no validation.",
        "cn": "顽强的幸存者。你是打不垮的。你依靠刻苦工作而活，拥有一种不需要任何人认可的、硬核的独立精神。"
      },
      "fields": {
        "en": "Civil Engineering, Real Estate, Crisis Management, Independent Crafts.",
        "cn": "土木工程、房地产开发、危机管理、独立手工艺人。"
      },
      "wealth": {
        "en": "Sweat Equity. Your fortune is earned through sheer persistence. You take the difficult road and find the gold at the end.",
        "cn": "血汗之财。你的财富是通过纯粹的坚持赚来的。你选择最难的路，并在终点挖到属于你的金矿。"
      }
    },
    "love": {
      "mode": {
        "en": "The Stubborn Guardian. You are fiercely loyal to your tribe and partner, offering gritty, realistic support.",
        "cn": "固执的守护者。你对自己的“圈子”和伴侣极其忠诚，提供一种真实、硬核的物质和精神支持。"
      },
      "challenge": {
        "en": "Short Temper. Frustration can flare up suddenly. You are often too hard on yourself and those you love.",
        "cn": "急脾气。挫败感会让你突然爆发。你对自己和所爱的人往往过于严苛，甚至有些刻薄。"
      }
    },
    "growth": {
      "en": "Transforming Pressure. You grow by learning to turn life's heavy burdens into solid achievements.",
      "cn": "高压转化。你通过学习如何将生活中的沉重负担转化为坚实的成就来实现进化。"
    },
    "health": {
      "en": "Focus: Liver Fire & Digestion. Stay hydrated and find ways to cool your internal system.",
      "cn": "关注肝火与脾胃。体质偏燥热，需要频繁补水并寻找清热解压的方式。"
    },
    "link": "#"
  },
  "己巳": {
    "name": {
      "en": "The Molten Field",
      "cn": "金蛇出穴"
    },
    "essence": {
      "en": "Earth meeting intense internal fire. You are strategic, colorful, and possess a magnetic social status that commands attention.",
      "cn": "大地与内在烈火的碰撞。你充满了策略感，色彩斑斓，拥有一种能够吸引众人目光的磁性地位。"
    },
    "career": {
      "style": {
        "en": "The Diplomatic Strategist. You possess a 'Gold' image. You are excellent at moving between social classes and closing deals.",
        "cn": "外交策略家。你自带一种“黄金形象”。你极其擅长在不同阶层间游走，并能谈成那些高难度的、涉及多方利益的交易。"
      },
      "fields": {
        "en": "High Finance, Luxury Branding, Diplomacy, High-End PR.",
        "cn": "高端金融、奢侈品品牌、外交事务、高级公关。"
      },
      "wealth": {
        "en": "Status Wealth. Your fortune is tied to your rank. You earn by being the face of high-value systems.",
        "cn": "地位之财。你的财富与你的地位、人脉深度绑定。你通过成为高价值体系的“代言人”获利。"
      }
    },
    "love": {
      "mode": {
        "en": "The Classy Partner. You seek a relationship that elevates your social status. You are generous but calculated.",
        "cn": "精英爱人。你寻求的是一种能提升你社会地位和视觉形象的关系。你大方，但在心中有精确的账本。"
      },
      "challenge": {
        "en": "Masking. You may focus so much on the perfect 'image' of love that you forget to build actual emotional intimacy.",
        "cn": "过度伪装。你可能太关注爱情的“完美外壳”，以至于忘了去建立真正的、赤裸的情感亲密感。"
      }
    },
    "growth": {
      "en": "Authenticity. You grow by finding the raw earth beneath your golden surface and standing for your true values.",
      "cn": "返璞归真。你通过寻找黄金外表下的原始大地，并为自己真实的价值观发声，来实现跨越。"
    },
    "health": {
      "en": "Focus: Heart & Digestion. Watch for issues caused by high-pressure social lives.",
      "cn": "关注心脏与脾胃。注意预防由高压社交生活引起的循环系统问题。"
    },
    "link": "#"
  },
  "己亥": {
    "name": {
      "en": "The Riverbank Field",
      "cn": "河畔沃野"
    },
    "essence": {
      "en": "Fertile soil by a flowing river. You are flexible, lucky, and possess a yielding strength that allows you to thrive anywhere.",
      "cn": "奔流河畔的肥沃土地。你灵活、幸运，拥有一种“柔能克刚”的力量，这让你在任何环境中都能迅速站稳脚跟。"
    },
    "career": {
      "style": {
        "en": "The Adaptable Tycoon. You flow with trends and earn easily. You are a master of soft negotiation and timing.",
        "cn": "灵活的大亨。你顺应趋势而动，赚钱相对轻松。你是软性谈判和时机捕捉的大师。"
      },
      "fields": {
        "en": "Global Trade, Human Resources, Culinary Arts, International Logistics.",
        "cn": "跨国贸易、人力资源管理、饮食文化、国际物流。"
      },
      "wealth": {
        "en": "Lucky Wealth. Your money comes through waves of opportunity. You are often supported by powerful mentors.",
        "cn": "顺流之财。你的金钱随着机遇的浪潮而来。你常能得到强大的“幕后”贵人或导师的支持。"
      }
    },
    "love": {
      "mode": {
        "en": "The Gentle Partner. You are caring, stable, and incredibly supportive of your partner's dreams.",
        "cn": "温柔伴侣。你体贴、稳定，且极度支持伴侣的梦想，是那种“背后的功臣”。"
      },
      "challenge": {
        "en": "Indecision. Because you can see all sides, you may find it hard to take a firm stand when a conflict arises.",
        "cn": "优柔寡断。因为你能看到事物的多面性，所以在冲突发生时，你可能很难坚定地站稳立场。"
      }
    },
    "growth": {
      "en": "Self-Assertion. You grow by learning to claim your own space and making firm decisions even when the water is choppy.",
      "cn": "自我主张。你通过学习“即使在水流湍急时也能占据自己的空间并做出果断决策”来实现进化。"
    },
    "health": {
      "en": "Focus: Digestion & Dampness. You need regular exercise to keep your 'internal soil' from becoming waterlogged.",
      "cn": "关注脾胃与水湿。你需要规律运动来防止体内的“水土”过度淤积，保持干爽活力。"
    },
    "link": "#"
  },
  "己酉": {
    "name": {
      "en": "The Gold Mine",
      "cn": "富矿之地"
    },
    "essence": {
      "en": "Fertile land containing vast veins of gold. You are productive, comfortable, and lucky, possessing a natural gift for wealth.",
      "cn": "埋藏着巨大金矿的沃土。你高产、懂得享受生活且自带好运，拥有一种天生招财的体质。"
    },
    "career": {
      "style": {
        "en": "The Wealthy Cultivator. You earn easily and enjoy life. You are pragmatic and excel at creating high-value results.",
        "cn": "富有耕耘者。你赚钱相对轻松且极懂享受。你务实，擅长利用简单的资源创造出高价值的结果。"
      },
      "fields": {
        "en": "Luxury Culinary, Entertainment, Finance, Real Estate, Fine Goods.",
        "cn": "高级餐饮、娱乐业、金融投资、房地产、高端消费品。"
      },
      "wealth": {
        "en": "Happy Wealth. You are a 'Wealth Magnet'. Money comes through enjoyment, creativity, and your pragmatism.",
        "cn": "快乐之财。你是天然的“金钱磁铁”。财富通过你的享乐、创意和务实精神源源不断地流入。"
      }
    },
    "love": {
      "mode": {
        "en": "The Hedonist Lover. You seek a relationship that is comfortable, fun, and visually pleasing.",
        "cn": "享乐爱人。你寻找的是一段舒适、有趣且在视觉上令人愉悦的关系。"
      },
      "challenge": {
        "en": "Laziness. When life is too comfortable, you may lose your drive and become overly focused on material pleasure.",
        "cn": "懒惰。当生活太舒适时，你可能会丧失进取心，过度沉溺于物质享受，忽略了精神成长。"
      }
    },
    "growth": {
      "en": "Strategic Discipline. You grow by learning to channel your abundance into meaningful legacy, not just consumption.",
      "cn": "纪律进化。你通过学习将你的丰饶转化为有意义的传承，而非仅仅是消耗，来实现人生的升华。"
    },
    "health": {
      "en": "Focus: Digestion & Weight. Watch out for issues caused by over-indulgence in rich foods.",
      "cn": "关注消化系统与体重。注意预防由于贪食美味带来的身体负担。"
    },
    "link": "#"
  },
  "己卯": {
    "name": {
      "en": "The Lush Meadow",
      "cn": "春原灵兔"
    },
    "essence": {
      "en": "Fertile land in early spring. You are gentle, social, and incredibly productive. You grow where there is harmony and light.",
      "cn": "早春时节的肥沃土地。你温柔、擅长社交，且极具生产力。只要有和谐的环境和阳光，你就能创造奇迹。"
    },
    "career": {
      "style": {
        "en": "The Creative Producer. You excel at turning artistic ideas into practical results. You thrive in environments that value beauty.",
        "cn": "创意生产者。你极擅长将艺术构思转化为实际成果。你在看重审美、和谐与团队协作的环境中如鱼得水。"
      },
      "fields": {
        "en": "Fine Arts, Marketing, Interior Design, Community Building, Horticulture.",
        "cn": "艺术创作、市场策划、室内设计、社群建设、园艺与环保。"
      },
      "wealth": {
        "en": "Artistic Wealth. Your fortune comes from your taste and your ability to make the world a more beautiful place.",
        "cn": "审美之财。你的财富来自你的品味，以及你那种让世界变得更美、更有序的能力。"
      }
    },
    "love": {
      "mode": {
        "en": "The Nurturing Lover. You provide a soft, beautiful home. You are highly romantic but need a lot of emotional validation.",
        "cn": "滋养型爱人。你提供一个柔软而美丽的家。你极度浪漫，但也需要伴侣给予大量的反馈和情感确认。"
      },
      "challenge": {
        "en": "Passive-Aggression. You hate direct conflict, so you often use silence or subtle hints to show your displeasure.",
        "cn": "被动攻击。你讨厌正面冲突，所以常通过沉默或暗示来表达不满，这会让伴侣感到困惑。"
      }
    },
    "growth": {
      "en": "Boundary Building. You grow by learning to protect your own 'soil' from those who would take advantage of your kindness.",
      "cn": "边界建设。你通过学习保护自己的“领地”，不让那些利用你善良的人过度索取，从而获得进化。"
    },
    "health": {
      "en": "Focus: Liver & Nerves. Watch for anxiety-related digestive issues.",
      "cn": "关注肝胆与神经。注意预防由情绪焦虑引起的消化功能紊乱。"
    },
    "link": "#"
  },
  "庚申": {
    "name": {
      "en": "The Iron Titan",
      "cn": "钢铁战神"
    },
    "essence": {
      "en": "Pure, hard iron ore. Invincible, sharp, and possessing the raw power to shatter any obstacle. You represent raw execution.",
      "cn": "纯粹坚硬的铁矿石。不可摧毁、不可战胜，拥有粉碎一切障碍的原始力量。你代表了极致的执行力与冷峻的正义。"
    },
    "career": {
      "style": {
        "en": "The Unstoppable Force. You have extreme execution power. You don't play political games; you simply deliver undeniable results.",
        "cn": "不可阻挡的力量。你拥有极强的执行力，不屑于玩办公室政治，你只用无可辩驳的结果说话。"
      },
      "fields": {
        "en": "Military Command, Heavy Industry, Competitive Sports, Law Enforcement.",
        "cn": "军事指挥、重工业、竞技体育、执法部门、大型项目执行。"
      },
      "wealth": {
        "en": "Solid Wealth. Your fortune is earned through direct struggle, grit, and dominating the competition.",
        "cn": "实干之财。你的财富来自于直接的斗争、过人的耐力或在竞争中对对手的绝对碾压。"
      }
    },
    "love": {
      "mode": {
        "en": "Ride or Die. You are a fiercely loyal partner who will fight the world for your loved one.",
        "cn": "生死之交。你会为爱人与世界为敌，极其忠诚，但也要求对方给予同等的绝对忠诚和透明。"
      },
      "challenge": {
        "en": "Lack of Filter. Your bluntness can deeply hurt sensitive partners. You often forget that words are also weapons.",
        "cn": "缺乏滤镜。你的毒舌往往在不经意间深深刺伤感性的伴侣。你忘了，语言有时比刀子更伤人。"
      }
    },
    "growth": {
      "en": "Discipline. Structure makes you stronger. You thrive when life has a clear, tough hierarchy.",
      "cn": "纪律。规则和硬核挑战让你更强大。你在有明确层级和高压挑战的环境中成长最快。"
    },
    "health": {
      "en": "Focus: Bones & Gut. Prone to injuries or inflammation related to excessive physical tension.",
      "cn": "关注骨骼与肠道。容易出现外伤或由于过度紧绷导致的消化系统炎症。"
    },
    "link": "#"
  },
  "辛酉": {
    "name": {
      "en": "The Diamond Rooster",
      "cn": "钻石神凰"
    },
    "essence": {
      "en": "A precision-cut diamond. Flawless, sharp, and radiant. You represent the peak of refinement and high-class aesthetics.",
      "cn": "精密切割的钻石。完美、犀利且耀眼。你代表了人类审美的极致精致和一种冷冽、高贵的纯粹。"
    },
    "career": {
      "style": {
        "en": "The Flawless Professional. You have an eye for detail and extreme high standards. You thrive in roles that require precision.",
        "cn": "完美专家。你拥有极高的审美标准，能发现最细微的缺陷。你在需要极端精确和高端审美的职位上是绝对的权威。"
      },
      "fields": {
        "en": "Jewelry, Constitutional Law, Surgery, Finance, Luxury Design.",
        "cn": "高端珠宝、精密法学、微创外科、顶级金融分析、奢侈品设计。"
      },
      "wealth": {
        "en": "Refined Wealth. You earn through high-value expertise and elite circles. Your value is your impeccable reputation.",
        "cn": "精致之财。你通过高价值的专业知识和维持精英地位获利。你那无可挑剔的声誉就是你的核心资产。"
      }
    },
    "love": {
      "mode": {
        "en": "The High-Maintenance Lover. You seek perfection and elegance. You value intellectual and visual harmony above all.",
        "cn": "高标爱人。你追求情感的纯净与体面。你极其看重精神交流和感官体验上的双重完美。"
      },
      "challenge": {
        "en": "The Sharp Tongue. Your ability to spot flaws makes you a harsh critic, which can be exhausting for a partner.",
        "cn": "剔透也伤人。你发现缺陷的能力太强，这让你容易变成一个刻薄的批评者，让伴侣感到筋疲力尽。"
      }
    },
    "growth": {
      "en": "Specialization. You grow by becoming the absolute gold-standard in your field, leaving no room for error.",
      "cn": "专精之道。你通过在所属领域达到“金标准”级别的专业高度，并不留任何容错空间来实现进化。"
    },
    "health": {
      "en": "Focus: Lungs & Skin. You are sensitive to pollution and require an organized, clean living environment.",
      "cn": "关注肺部与皮肤。你对环境污染异常敏感，需要一个整洁、空气洁净的生活空间。"
    },
    "link": "#"
  },
  "庚辰": {
    "name": {
      "en": "The Armored Dragon",
      "cn": "披甲战龙"
    },
    "essence": {
      "en": "A dragon encased in heavy chrome armor. A strategic general who combines the raw power of metal with ancient wisdom.",
      "cn": "身披重甲的金属巨龙。一位将金属的杀伐果断与巨龙的古老智慧结合的战略统帅。"
    },
    "career": {
      "style": {
        "en": "The Strategic General. You possess natural authority and a 'poker face'. You are built to lead massive, complex projects.",
        "cn": "战略统帅。你拥有天然的权威和一张“扑克脸”。你生来就是为了带领宏大且复杂的项目走向胜利。"
      },
      "fields": {
        "en": "High-level Politics, Corporate Turnarounds, Large-scale Manufacturing, Legal Architecture.",
        "cn": "政界高层、企业重组专家、大型制造业、法律体系架构。"
      },
      "wealth": {
        "en": "Power Wealth. Money is a tool for you, not the goal. Your fortune is a byproduct of your authority.",
        "cn": "权力之财。金钱对你来说是工具而非目标。你的财富是你权威和影响力的副产品。"
      }
    },
    "love": {
      "mode": {
        "en": "The Dominant Protector. You provide a safe, unshakable fortress, but you are the absolute head of the household.",
        "cn": "霸道守护者。你为伴侣提供一个安全、不可撼动的堡垒，但你必须是家庭中绝对的首领。"
      },
      "challenge": {
        "en": "Suppression. Your presence is so strong that your partner may feel their own voice is lost in your shadow.",
        "cn": "压制感。你的气场太强，以至于伴侣可能会觉得自己的声音在你的阴影下消失了。"
      }
    },
    "growth": {
      "en": "Leadership Alchemy. You grow by learning to temper your iron will with the dragon's flexibility.",
      "cn": "统御炼金术。你通过学习用巨龙的灵活性来调和钢铁般的意志，从而获得真正的进化。"
    },
    "health": {
      "en": "Focus: Skin & Back. Tension often manifests as back pain or skin irritation.",
      "cn": "关注皮肤与背部。压力通常表现为背部疼痛或皮肤过敏。"
    },
    "link": "#"
  },
  "庚戌": {
    "name": {
      "en": "The Iron Guardian",
      "cn": "钢铁卫士"
    },
    "essence": {
      "en": "A suit of heavy iron armor guarding a mountain gate. You represent unshakeable loyalty, moral grit, and the protection of tradition.",
      "cn": "守护山门的重型铁甲。你代表了不可撼动的忠诚、道德毅力，以及对传统的捍卫。"
    },
    "career": {
      "style": {
        "en": "The Honest Enforcer. You are a person of your word. You thrive in roles that require absolute integrity and security.",
        "cn": "诚实的执行者。你是一个言出必行的人。在需要绝对诚实、安保和维护系统的职位上，你表现最佳。"
      },
      "fields": {
        "en": "Internal Audit, Security Architecture, Defense Industry, Traditional Manufacturing.",
        "cn": "内部审计、安保架构、国防工业、传统制造业、司法系统。"
      },
      "wealth": {
        "en": "Stable Fortress. Your wealth is built on trust and reliability. You earn by being the bedrock of your industry.",
        "cn": "堡垒之财。你的财富建立在信任和可靠之上。你通过长期的服务和成为行业的基石来获利。"
      }
    },
    "love": {
      "mode": {
        "en": "The Unshakeable Anchor. You provide a safe, stable home. You are the partner who will be there for 50 years.",
        "cn": "不可撼动的锚点。你提供一个安全、稳定的家。你是那种能够守护 50 年而从不退缩的伴侣。"
      },
      "challenge": {
        "en": "Stubborn Moralizing. You can be so rigid in your beliefs that you make your partner feel judged.",
        "cn": "固执的道德感。你在信仰上可能过于僵化，以至于让伴侣因为一些人性的小错而感到被你审判。"
      }
    },
    "growth": {
      "en": "Flexibility. You grow by learning that a shield is only useful if it can move to cover the heart.",
      "cn": "灵活性。你通过学习“盾牌只有在能够灵活移动以遮住心脏时才有用”来实现进化。"
    },
    "health": {
      "en": "Focus: Lungs & Skin. Watch out for 'dryness' causing skin or respiratory stiffness.",
      "cn": "关注肺部与皮肤。注意预防由体内“燥气”引起的皮肤或呼吸系统僵硬。"
    },
    "link": "#"
  },
  "庚午": {
    "name": {
      "en": "The Forged Blade",
      "cn": "烈火纯青"
    },
    "essence": {
      "en": "Metal forged in intense white fire. Disciplined, ethical, and incredibly sharp. You represent the gentleman warrior.",
      "cn": "在烈火中反复锻打的利刃。自律、克制且极其锋利。你代表了那种恪守准则、温文尔雅却又杀伐果断的绅士战士。"
    },
    "career": {
      "style": {
        "en": "The Ethical Warrior. You are principled, polite, and highly disciplined. You fit perfectly in structured organizations.",
        "cn": "道义战士。你有原则、讲礼貌且极度自律。你非常适合那些看重荣誉、规则和层级制度的规范化组织。"
      },
      "fields": {
        "en": "Public Service, Military Officers, Compliance, High-end Consulting.",
        "cn": "公职人员、高级军官、合规官、高端管理咨询、司法系统。"
      },
      "wealth": {
        "en": "Honest Wealth. Your fortune is built steadily through your unshakeable reputation and professional integrity.",
        "cn": "正道之财。你的财富是通过你不可撼动的名誉和职业操守稳步积累起来的。"
      }
    },
    "love": {
      "mode": {
        "en": "The Model Spouse. You are loyal, traditional, and protective, though you may find it hard to express wild passion.",
        "cn": "模范伴侣。你忠诚、传统且极具保护欲，尽管你可能觉得很难表达狂野的激情，但你的爱极其深厚。"
      },
      "challenge": {
        "en": "High Pressure. You hold yourself to such a high moral standard that you and your partner may feel constant tension.",
        "cn": "高压感。你对自己和伴侣的要求都极高，这可能导致双方都感到持久的心理压力和紧绷感。"
      }
    },
    "growth": {
      "en": "Self-Improvement. You are on a lifelong quest to 'polish' your character and reach the peak of excellence.",
      "cn": "自我精进。你的一生都在不断“打磨”性格，剔除灵魂中的杂质，追求极致的卓越。"
    },
    "health": {
      "en": "Focus: Heart & Lungs. Watch for inflammation caused by repressed emotions.",
      "cn": "关注心脏与肺部。注意预防由于情绪压抑导致的内脏炎症或气滞。"
    },
    "link": "#"
  },
  "庚寅": {
    "name": {
      "en": "The White Tiger",
      "cn": "林中战虎"
    },
    "essence": {
      "en": "A fierce tiger in a winter forest, claws of metal. You represent aggression, strength, and a restless drive for conquest.",
      "cn": "冬日森林中的猛虎，利爪如金。你代表了原始的进取心、不屈的力量，以及一种永不安分的征服欲。你是破局者。"
    },
    "career": {
      "style": {
        "en": "The Front-Line Warrior. You are a natural disruptor. You break old systems to build new ones and thrive in high-stakes environments.",
        "cn": "前线战士。你是天生的颠覆者。你打破旧体系以建立新世界，在充满冲突和高回报的环境中如鱼得水。"
      },
      "fields": {
        "en": "Founders, Crisis Management, Competitive Sales, Litigation.",
        "cn": "创业创始人、危机管理专家、竞争性销售、法律诉讼。"
      },
      "wealth": {
        "en": "Conquest Wealth. You earn by taking risks that others fear. Your fortune is built on 'capturing' market share.",
        "cn": "征服之财。你通过承担他人恐惧的风险获利。你的财富建立在“夺取”市场份额和赢下硬仗之上。"
      }
    },
    "love": {
      "mode": {
        "en": "The Intense Hunter. Your love is a chase. You are passionate and direct, seeking a partner who can stand their ground.",
        "cn": "激烈的猎手。你的爱是一场追逐。你热情而直接，但你需要一个能在你猛烈攻势面前守住阵地的伴侣。"
      },
      "challenge": {
        "en": "Impulsivity. Your first instinct is to 'attack' during an argument, which can lead to permanent damage.",
        "cn": "冲动行事。争吵时你的第一本能是“攻击”，这可能会对感情造成难以修复的伤害。"
      }
    },
    "growth": {
      "en": "Restraint. You grow by learning that the greatest tiger is the one who knows exactly when NOT to strike.",
      "cn": "克制。你通过学习“最强大的老虎是那些懂得何时不该出击的人”来实现自我的飞跃。"
    },
    "health": {
      "en": "Focus: Liver Fire & Bones. Watch out for injuries from impulsive actions.",
      "cn": "关注肝火与骨骼。注意预防由冲动行为或高频活动导致的意外伤害。"
    },
    "link": "#"
  },
  "辛卯": {
    "name": {
      "en": "The Jade Cutter",
      "cn": "雕玉尖刀"
    },
    "essence": {
      "en": "A razor-sharp knife carving exquisite jade. Precise, pragmatic, and incredibly efficient at extracting value from raw materials.",
      "cn": "正在雕琢美玉的锋利尖刀。精准、务实，且极其擅长从原材料中提取核心价值。你是效率的化身。"
    },
    "career": {
      "style": {
        "en": "The Pragmatic Executor. You are results-oriented with a sharp business mind. You find the fastest way to get things done.",
        "cn": "务实执行者。结果导向，拥有极其犀利的商业头脑。你总能找到完成任务最快、最高效的路径。"
      },
      "fields": {
        "en": "Arbitrage, Venture Capital, Surgery, Technical Architecture, Supply Chain.",
        "cn": "套利交易、风险投资、精密外科、技术架构、供应链管理。"
      },
      "wealth": {
        "en": "Business Wealth. You have a natural instinct for profit and ROI. You earn by cutting through the noise.",
        "cn": "经营之财。你对利润和投产比有天然嗅觉。你通过穿透迷雾、直击核心利润点来赚钱。"
      }
    },
    "love": {
      "mode": {
        "en": "The Controlling Lover. You want to 'shape' your partner according to your ideal standards, often managing their life.",
        "cn": "改造派爱人。你会根据自己的理想标准去“雕琢”伴侣，常常下意识地替他们管理生活。"
      },
      "challenge": {
        "en": "Micro-management. Your constant desire to improve things can feel like suffocation to a partner who values autonomy.",
        "cn": "过度干涉。你不断想要“优化”一切的欲望，会让看重自主权的伴侣感到窒息。"
      }
    },
    "growth": {
      "en": "Applied Skills. Your growth is tied to the mastery of specific, sharp tools or knowledge that give you an edge.",
      "cn": "应用技能。你的进化与掌握某种特定的、锋利的工具或知识紧密相关。"
    },
    "health": {
      "en": "Focus: Limbs & Nerves. Watch out for repetitive strain or joint pain.",
      "cn": "关注四肢与神经张力。注意预防劳损或由于紧张导致的关节疼痛。"
    },
    "link": "#"
  },
  "辛未": {
    "name": {
      "en": "The Oasis Gem",
      "cn": "漠中金宝"
    },
    "essence": {
      "en": "A sparkling gemstone hidden in the dry desert sand. You are tough, resilient, and possess a unique beauty that thrives in harsh conditions.",
      "cn": "干燥沙漠中闪耀的宝石。你强韧、耐磨，拥有一种在最恶劣环境下依然能蓬勃生长的独特美感。"
    },
    "career": {
      "style": {
        "en": "The Resilient Craftsman. You rely on specific skills and individual grit. You thrive as an independent expert.",
        "cn": "顽强的工匠。你依靠特定的专业技能和个人的硬核毅力。作为独立专家，你不需要追随者也能独自闪耀。"
      },
      "fields": {
        "en": "Freelance Specialization, Tech Solutions, Artisan Crafts, Nursing, Sales.",
        "cn": "独立专家、技术方案解决、手工艺、高级护理、高端销售。"
      },
      "wealth": {
        "en": "Self-Made Wealth. You earn through individual struggle. Your fortune is carved out of hard rock, never given.",
        "cn": "白手起家。你通过个人的拼搏和无可替代的专业技能赚取财富。你的财富是自己凿出来的，而非运气赐予。"
      }
    },
    "love": {
      "mode": {
        "en": "The Moody Guardian. You are loyal but your emotions can be volatile. You protect your loved ones with thorns.",
        "cn": "情绪化守护者。你忠诚得近乎疯狂，但你的情绪起伏可能像沙漠气候一样剧烈。你用满身的刺保护你爱的人。"
      },
      "challenge": {
        "en": "Short Temper. Your frustration can flare up quickly, leading to sharp words that sting those closest to you.",
        "cn": "急躁。你的挫败感爆发得很快，容易在冲动下说出伤人的狠话。"
      }
    },
    "growth": {
      "en": "Practical Mastery. You grow by mastering real-world tools and proving your worth through survival.",
      "cn": "实战进阶。你通过掌握实用工具并在现实压力中证明自己的卓越来实现自我进化。"
    },
    "health": {
      "en": "Focus: Digestive Fire & Skin. You need regular hydration and calming activities.",
      "cn": "关注胃火与皮肤干燥。你需要频繁补水，以及能够平复心绪的冥想或放松活动。"
    },
    "link": "#"
  },
  "辛丑": {
    "name": {
      "en": "The Muddy Pearl",
      "cn": "湿土明珠"
    },
    "essence": {
      "en": "A pearl hidden in the moist soil. Low-key, talented, and deep. You are a gem that reveals its true value only when polished.",
      "cn": "藏在湿润土壤里的珍珠。低调、才华横溢且深邃。你是一块只有经过时间和信任打磨后，才会展现真正价值的宝石。"
    },
    "career": {
      "style": {
        "en": "The Hidden Sage. You work best in specialized fields where you can polish your craft without the distractions of the crowd.",
        "cn": "隐世智者。你最适合在专精、冷门的领域工作，在那里你可以心无旁骛地磨炼手艺。"
      },
      "fields": {
        "en": "Deep Research, Archaeology, Craftsmanship, Specialized Consulting, Art Restoration.",
        "cn": "深度研究、考古学、手工艺、特种咨询、艺术品修复。"
      },
      "wealth": {
        "en": "Hidden Reserves. You are a master of managing assets quietly. You likely have wealth that no one else knows about.",
        "cn": "隐秘储备。你是默默管理资产的大师。你很可能拥有谁都不知道的财富积累。"
      }
    },
    "love": {
      "mode": {
        "en": "The Passive Observer. You are loyal and deep, but you keep a part of yourself walled off until you feel 100% safe.",
        "cn": "被动观察者。你忠诚而深沉，但你会把自己的一角封锁起来，直到感到 100% 安全。"
      },
      "challenge": {
        "en": "Suspicion. You tend to analyze a partner's motives too deeply, sometimes creating problems where there are none.",
        "cn": "多疑。你倾向于过度分析伴侣的动机，有时会在没问题的地方制造问题。"
      }
    },
    "growth": {
      "en": "Surface Brilliance. You grow by learning that it's okay to let your light be seen.",
      "cn": "表面光华。你通过学习“即使感到脆弱，让你的光芒被看见也是可以的”来实现进化。"
    },
    "health": {
      "en": "Focus: Spleen & Lungs. Watch out for 'Cold-Damp' in the digestive tract.",
      "cn": "关注脾肺。注意预防消化系统的“寒湿”问题。"
    },
    "link": "#"
  },
  "辛亥": {
    "name": {
      "en": "The Pearl in Deep Water",
      "cn": "深海明珠"
    },
    "essence": {
      "en": "A rare pearl at the bottom of a dark ocean. You possess hidden value, deep intuition, and a talent that is both cold and luminous.",
      "cn": "暗夜海底的一颗罕见明珠。你拥有隐藏的价值、深邃的直觉，以及一种既冷冽又灿烂夺目的天赋。"
    },
    "career": {
      "style": {
        "en": "The Intuitive Artist. You are a creative genius who works best in solitude. You spot value in things others find dark.",
        "cn": "直觉艺术家。你是一个适合在孤独中工作的创意天才。你拥有一种天生的本领，能在他人觉得阴郁的事物中发现价值。"
      },
      "fields": {
        "en": "Creative Writing, Film Direction, Niche Luxury, Psychology, Spiritual Research.",
        "cn": "创意写作、电影导演、冷门奢侈品、心理学、灵性研究。"
      },
      "wealth": {
        "en": "Gifted Wealth. Your fortune comes from your unique vision. You earn when you 'surface' your hidden talents.",
        "cn": "天赋之财。你的财富来自你独特的愿景。当你向正确的受众展现你隐藏的天赋时，财富便会随之而来。"
      }
    },
    "love": {
      "mode": {
        "en": "The Soulful Romantic. You seek a love that is transcendental. You require a lot of mystery in the relationship.",
        "cn": "灵魂浪漫派。你追求一种超脱尘俗的爱。你温柔而睿智，但你要求感情生活中保有大量的神秘感。"
      },
      "challenge": {
        "en": "Escapism. When reality gets too harsh, you tend to sink into the deep water and disappear.",
        "cn": "逃避主义。当现实变得太严酷时，你倾向于沉入深水并消失，让伴侣感到困惑。"
      }
    },
    "growth": {
      "en": "Visibility. You grow by learning that your pearl can only light the world if you allow it to be seen.",
      "cn": "显化。你通过学习“明珠只有在水面之上被看见时才能照亮世界”而获得进化。"
    },
    "health": {
      "en": "Focus: Kidneys & Circulation. Watch for coldness affecting vitality.",
      "cn": "关注肾脏与循环。注意预防由于体寒影响的整体活力下降。"
    },
    "link": "#"
  },
  "辛巳": {
    "name": {
      "en": "The Molten Gold",
      "cn": "流金蛇影"
    },
    "essence": {
      "en": "Gold melting in a brilliant white furnace. You represent the peak of elite transformation, elegance, and strategic mastery.",
      "cn": "白色熔炉中熔化的黄金。你代表了精英蜕变的巅峰、极致优雅，以及对上流社会规则的战略性掌控。"
    },
    "career": {
      "style": {
        "en": "The Polished Diplomat. You are smooth, strategic, and possess natural class. You win through negotiation and image.",
        "cn": "圆滑的外交官。你从容、老练且自带高级感。你通过谈判和维持无可挑剔的形象来取胜。"
      },
      "fields": {
        "en": "International Diplomacy, Wealth Management, Luxury Branding, High-End PR.",
        "cn": "国际外交、财富管理、奢侈品牌、高端公关。"
      },
      "wealth": {
        "en": "Status Wealth. Your fortune is tied to your rank. You earn by being in the right circles.",
        "cn": "地位之财。你的财富与你的地位和人脉深度绑定。你通过进入正确的圈子并展现正确的形象获利。"
      }
    },
    "love": {
      "mode": {
        "en": "The Elite Partner. You seek an alliance that elevates your status. You want a partner who is as polished as you are.",
        "cn": "精英爱人。你寻求的是一种既是战略联盟又是浪漫情缘的关系。你渴望能提升你地位的另一半。"
      },
      "challenge": {
        "en": "The Mask. You are so focused on maintaining your 'Gold' image that you struggle to show vulnerability.",
        "cn": "面具。你太专注于维持你的“黄金形象”，以至于很难展现出你脆弱、真实的人性一面。"
      }
    },
    "growth": {
      "en": "Authenticity. You grow by finding the solid metal beneath the liquid gold and standing for true values.",
      "cn": "真诚。你通过寻找流动金光下的原始固体金属，并为外观之外的真理发声，来实现进化。"
    },
    "health": {
      "en": "Focus: Heart & Teeth. Watch out for stress-related dental or cardiovascular issues.",
      "cn": "关注心脏与牙齿。注意预防表现为口腔问题或心血管不适的压力综合征。"
    },
    "link": "#"
  },
  "庚子": {
    "name": {
      "en": "The Ringing Bell",
      "cn": "深潭金钟"
    },
    "essence": {
      "en": "A golden bell submerged in cold water. Your voice carries far, but it has a chill. You represent advanced logic and critical brilliance.",
      "cn": "沉在冷水里的金钟。你的声音传得很远，但带着一丝寒意。你代表了高阶逻辑和批判性的才华。"
    },
    "career": {
      "style": {
        "en": "The Sharp Critic. You speak the hard truth. You excel in roles requiring high-level analysis and a fearless mind.",
        "cn": "犀利的评论家。你是那个敢说出残酷真相的人。在需要高阶分析和无畏、独立头脑的职位上，你表现卓越。"
      },
      "fields": {
        "en": "Advanced Logic, Investigative Journalism, Music, Philosophy, Strategic Auditing.",
        "cn": "高级逻辑、调查记者、音乐、哲学、战略审计。"
      },
      "wealth": {
        "en": "Eloquence Wealth. Your income is tied to your voice and your ability to cut through the noise.",
        "cn": "谈吐之财。你的收入与你的声音以及你用清晰、冷峻的事实穿透喧嚣的能力挂钩。"
      }
    },
    "love": {
      "mode": {
        "en": "The Aloof Lover. You are a misunderstood romantic who protects their heart with ice. You seek intellectual resonance.",
        "cn": "高冷的爱人。你是一个用冰层保护内心的、被误解的浪漫主义者。你追求的是精神上的极致共鸣。"
      },
      "challenge": {
        "en": "Arrogance. Your high intelligence can make you appear cold or superior, pushing away warmth.",
        "cn": "傲慢。你的高智商有时让你显得冷漠或优越，推开了你其实渴望的温暖。"
      }
    },
    "growth": {
      "en": "Warm Expression. You grow by learning that logic is a tool, but emotional warmth creates a home.",
      "cn": "温情表达。你通过学习“逻辑是工具，但情感的温度才是构建家园的基石”来实现进化。"
    },
    "health": {
      "en": "Focus: Lungs & Kidneys. Watch out for 'Cold-Damp' affecting your joints.",
      "cn": "关注肺部与肾脏。注意预防“寒湿”影响关节和血液循环。"
    },
    "link": "#"
  },
  "壬子": {
    "name": {
      "en": "The Tsunami Rat",
      "cn": "海啸灵鼠"
    },
    "essence": {
      "en": "A dynamic mouse surfing on a massive, glowing blue wave. You represent pure, massive flowing energy that can either nourish civilizations or reshape coastlines with a single thought.",
      "cn": "驾驭巨浪的蓝色灵鼠。你代表了纯粹且巨大的流动能量，既能孕育万物文明，也能在瞬息之间以雷霆万钧之势重塑整个海岸线。你是大得不能再大的水。"
    },
    "career": {
      "style": {
        "en": "The Liquid Tycoon. You possess an incredibly high IQ and natural social charisma. Like water, you adapt to any container but always maintain your overwhelming force underneath.",
        "cn": "流动的大亨。你拥有极高的智商与天然的社交手腕。像水一样，你能瞬间适应任何环境的容器，却始终在深处保持着足以颠覆一切的原始动力。"
      },
      "fields": {
        "en": "Global Trade, High-Speed Logistics, Big Data, International Diplomacy, Strategic Betting.",
        "cn": "跨国贸易、全球物流运输、大数据分析、外交官、高风险战略决策。"
      },
      "wealth": {
        "en": "Flowing Wealth. Your fortune comes in massive, rhythmic waves. You are a natural money-magnet whenever you keep yourself in motion and avoid stagnation.",
        "cn": "澎湃之财。你的财富像潮汐般具有节奏感且规模宏大。只要你保持行动、拒绝停滞，你就是一个天然的金钱磁铁，财富会随浪潮涌向你。"
      }
    },
    "love": {
      "mode": {
        "en": "The Tsunami Lover. Your affection is overwhelming and free-spirited. You seek a partner who can either swim alongside you or be the unshakeable anchor in your storm.",
        "cn": "海啸般的爱人。你的情感极具爆发力且追求绝对自由。你寻找的是那种能陪你远征深海，或者能成为你狂风暴雨中那个不可撼动的定海神针的人。"
      },
      "challenge": {
        "en": "Restlessness. You find it hard to stay in one place or one emotional state for too long, which can make a partner feel insecure and unanchored.",
        "cn": "漂泊感。你很难长期停留在某处或某种单一的情绪状态中，这种永恒的波动感有时会让追求稳定的伴侣感到极度缺乏安全感。"
      }
    },
    "growth": {
      "en": "Street Smarts. You learn through constant adaptation and real-world struggle. Experience is your most profound teacher.",
      "cn": "实战智慧。你在不断的流转和环境适应中汲取能量。生活中的每一次跌宕起伏都是你最深刻的教科书，经验是你进阶的终极武器。"
    }
  },
  "癸丑": {
    "name": {
      "en": "The Iceberg Ox",
      "cn": "冰川神牛"
    },
    "essence": {
      "en": "A majestic ox carved from solid, translucent glacial ice. Silent, patient, and capable of containing vast oceans of emotion beneath a frozen, calm surface.",
      "cn": "万年玄冰构成的神牛。沉默、耐心，在寒冷的外表下包裹着波涛汹涌的情感与深邃的秘密。你是一座移动的冰山，水面下的部分远比水面上巨大。"
    },
    "career": {
      "style": {
        "en": "The Silent Strategist. You work best in research or behind-the-scenes roles where your patience can outlast any fast-moving competition.",
        "cn": "沉默的策划者。你最适合在研究或幕后运筹帷幄，在那儿你的耐心足以耗死任何竞争对手。你擅长做那种需要蛰伏很久才能爆发的大事。"
      },
      "fields": {
        "en": "History, Specialized Research, Intelligence Analysis, Art Collection, Investigation.",
        "cn": "历史学、专精研究、情报分析、艺术收藏、深度调查行业。"
      },
      "wealth": {
        "en": "Invisible Wealth. You are excellent at holding assets and quietly building a safety net that no one else can see. You prefer value over flash.",
        "cn": "隐形之财。你擅长持有资产并默默建立一个巨大的安全网，财不露白。你更看重资产的厚度和安全性，而不是表面的光鲜。"
      }
    },
    "love": {
      "mode": {
        "en": "The Deep Keeper. You are slow to open up, but your heart is a vault of loyalty. Once you commit, it is for a lifetime.",
        "cn": "深沉的守护。你很难敞开心扉，但你的心一旦打开，就是一座忠诚的保险库。你认定的感情，往往就是奔着一辈子去的。"
      },
      "challenge": {
        "en": "Emotional Stagnation. You tend to hold on to old hurts, letting them freeze into bitterness instead of letting them flow away.",
        "cn": "情绪冻结。你容易死守旧日伤痛，让它们冻结成内心的苦涩，而不是让它们随水流走。冷战是你最大的杀伤性武器。"
      }
    },
    "growth": {
      "en": "Inner Warmth. You grow by finding the internal fire or external sunlight that prevents your soul from freezing over completely.",
      "cn": "寻找暖阳。你通过寻找内在的火种或外部的温暖关怀，来防止灵魂彻底冻结。学会表达温度，是你进化的关键。"
    }
  },
  "壬寅": {
    "name": {
      "en": "The River Tiger",
      "cn": "江流猛虎"
    },
    "essence": {
      "en": "A tiger swimming powerfully in a mystical river. You represent a high-IQ warrior who combines deep emotional depth with sudden, explosive action.",
      "cn": "奔流江水中的猛虎。你是一个高智商的战士，将深沉的情感深度与惊人的瞬间爆发力完美结合。你既有水的智慧，又有虎的霸气。"
    },
    "career": {
      "style": {
        "en": "The Dynamic Strategist. You possess both the ambition of the tiger and the flexibility of water. You excel in rapidly changing markets where others get lost.",
        "cn": "动态策划者。你兼具老虎的雄心和水的灵活性。在瞬息万变、让别人迷失方向的市场中，你总能找到通往顶峰的支流。"
      },
      "fields": {
        "en": "New Media, Global Logistics, Venture Capital, Innovative Education, Journalism.",
        "cn": "新媒体、全球物流枢纽、风险投资、创新教育、调查记者。"
      },
      "wealth": {
        "en": "Active Profit. Your money is made through constant movement and spotting trends before they hit the shore. Speed is your currency.",
        "cn": "活跃之财。你靠不断的流动和在趋势“上岸”前就捕捉到它而获利。速度和对流向的判断是你最核心的货币。"
      }
    },
    "love": {
      "mode": {
        "en": "The Passionate Wanderer. You are romantic, intense, and love the chase, but you need your independence to feel truly alive.",
        "cn": "激情浪子。你浪漫、热烈且沉迷于追求的过程。但为了感到“活着”，你必须在感情中保留极强的独立空间和自由度。"
      },
      "challenge": {
        "en": "Mood Swings. Your internal energy can shift from a calm river to a roaring beast in seconds, confusing those close to you.",
        "cn": "情绪波动。你的内在能量可能在几秒钟内从平静的流水变成咆哮的野兽。这种像天气一样多变的情绪会让伴侣感到措手不及。"
      }
    },
    "growth": {
      "en": "Self-Harnessing. You grow by learning to guide your massive energy toward a single, long-term legacy rather than scattering it.",
      "cn": "自我驯服。你通过学习将你那宏大的能量导向一个长期的、有意义的目标，而非任其四散奔流，来实现真正的进化。"
    }
  },
  "癸卯": {
    "name": {
      "en": "The Dewy Rabbit",
      "cn": "雨露灵兔"
    },
    "essence": {
      "en": "An elegant rabbit covered in morning dew. Gentle, creative, and highly intuitive. You bring freshness and healing beauty to a harsh world.",
      "cn": "青草尖上沾满晨露的灵兔。温柔、剔透、直觉敏锐。你为这个严酷的世界带来清新与美感，虽然看起来微小，却是不可或缺的治愈力量。"
    },
    "career": {
      "style": {
        "en": "The Creative Visionary. You win by intuition and taste, not force. You excel in fields that require a delicate touch and high aesthetics.",
        "cn": "创意梦想家。你靠直觉和品味取胜，而非武力。你在任何涉及美学、设计和疗愈的领域都能发光，你是细节的大师。"
      },
      "fields": {
        "en": "Graphic Design, Psychology, Fine Arts, Writing, Healing Therapies.",
        "cn": "平面设计、心理咨询、艺术创作、写作、灵性疗愈。"
      },
      "wealth": {
        "en": "Fluid Wealth. Money flows to you like water. You attract wealth through creativity, kindness, and good karma rather than aggression.",
        "cn": "灵动之财。金钱如流水般进出。你通过创意、善意和积累的福报吸引财富，而非通过强取豪夺。"
      }
    },
    "love": {
      "mode": {
        "en": "The Soul Connection. You seek empathy and pure harmony. You hate conflict and crave a love that feels like a gentle rain.",
        "cn": "灵魂连接。你追求共情且和谐的关系。你极度讨厌冲突，渴望一种如细雨般润物无声、能够滋养灵魂的爱。"
      },
      "challenge": {
        "en": "Avoidance. You tend to hide or evaporate when faced with harsh reality or direct confrontation.",
        "cn": "逃避倾向。当面对严酷的现实或直接的争吵时，你倾向于躲藏或像露水一样“蒸发”消失，让人找不到你。"
      }
    },
    "growth": {
      "en": "Resilience. You grow by learning that you can survive the scorching sun and return again as fresh dew.",
      "cn": "韧性。你通过学习“即使被太阳蒸发，也能在黑夜后重新凝结”的道理，练就外柔内刚的韧性。"
    }
  },
  "壬辰": {
    "name": {
      "en": "The Abyss Dragon",
      "cn": "深渊黑龙"
    },
    "essence": {
      "en": "A sleek, dark blue deep-sea dragon cub. Master of hidden resources, possessing ancient power and a terrifying, majestic calm.",
      "cn": "潜伏在深海沟中的黑龙。你是天然的资源掌控者，拥有古老的威严和一种令人胆寒的、深不见底的冷静与智慧。"
    },
    "career": {
      "style": {
        "en": "The Power Player. Born to lead and command. You swallow resources like a whale and have a natural instinct for dominating your territory.",
        "cn": "权力玩家。生来就是为了统领全局。你像鲸吞般吸纳行业资源，对所属领地有着天然的统治直觉，是那种不怒自威的领袖。"
      },
      "fields": {
        "en": "Group CEO, Military Command, Global Business, Resource Extraction, Politics.",
        "cn": "集团CEO、高级军事指挥、大宗跨国贸易、矿产能源产业、政界高层。"
      },
      "wealth": {
        "en": "Massive Scale. You are built to handle large-scale fortunes and complex financial empires. Your wealth is tied to grand assets.",
        "cn": "巨幅财富。你天生就是为了操盘大宗财富和复杂的金融帝国而生的。你的财务状况通常与宏大项目、土地和国家级资源深度绑定。"
      }
    },
    "love": {
      "mode": {
        "en": "The Dominant Force. You are fiercely protective of your partner, offering rock-solid stability and a sense of belonging to an empire.",
        "cn": "霸道守护。你对自己的“领地”和伴侣有着极强的保护欲，提供磐石般的物质和心理稳定性，让对方感到如在堡垒般安全。"
      },
      "challenge": {
        "en": "The Dictator. Your 'my way or the highway' attitude can stifle the growth of your partner, making them feel small.",
        "cn": "独裁倾向。你那种“唯我独尊”的态度有时会过度压制伴侣的个性发展，让他们觉得自己只是你帝国中的一员，而非平等的伴侣。"
      }
    },
    "growth": {
      "en": "Strategic Vision. You grow by mastering the macro-view of the world and taking on the weight of immense responsibilities.",
      "cn": "宏观战略。你通过掌控全局视野和承担足以改变他人命运的巨大社会责任，来完成从个体到统帅的进化。"
    }
  },
  "癸巳": {
    "name": {
      "en": "The Mist Snake",
      "cn": "云雾灵蛇"
    },
    "essence": {
      "en": "A graceful snake made of swirling mist. Shifting, colorful, and mystic, moving between different worlds with effortless grace.",
      "cn": "晨曦中变幻莫测的云雾灵蛇。神秘、灵动且多彩。你能毫不费力地穿梭于不同的世界和圈层，让人捉摸不透。"
    },
    "career": {
      "style": {
        "en": "The Mystic Elite. High intuition and a natural gift for social climbing. You rise to the top with an air of elegance that avoids direct conflict.",
        "cn": "神秘精英。你拥有极高的直觉和天然的阶层跃迁能力。你总能带着一种毫不费力的优雅上位，在谈笑间搞定复杂的利益分配。"
      },
      "fields": {
        "en": "High Finance, Fine Arts, Luxury Branding, Diplomacy, Occult Arts.",
        "cn": "高端金融、艺术品贸易、奢侈品牌公关、外交官、神秘学应用。"
      },
      "wealth": {
        "en": "Windfall Wealth. You often experience 'Lucky Breaks' or unexpected support from influential mentors who see your hidden potential.",
        "cn": "天降之财。你常有“贵人缘”，容易获得意外的提拔、跨越阶层的财富支持或是在关键时刻得到导师的倾力相助。"
      }
    },
    "love": {
      "mode": {
        "en": "The Elusive Lover. You are charming and magnetic, but your true heart is as hard to catch as a shifting cloud in the sky.",
        "cn": "迷离爱人。你充满魅力且极度吸粉，但你的真心像云雾一样难以被彻底捕获或定义。你的爱充满了朦胧的美感。"
      },
      "challenge": {
        "en": "Fickleness. Your internal state changes rapidly, which can confuse or alienate a partner who seeks constant stability.",
        "cn": "善变。你内在的情绪和状态起伏极快，这会让追求绝对确定性的伴侣感到迷茫、疲惫，甚至最终选择疏远。"
      }
    },
    "growth": {
      "en": "Authenticity. You grow by finding the solid core beneath your shifting masks and standing for a true self.",
      "cn": "真实自我。你通过在变幻莫测的面具下找到那个不变的核心，并勇敢地展现真实的自己，来实现灵魂的整合。"
    }
  },
  "壬午": {
    "name": {
      "en": "The Steam Horse",
      "cn": "蒸汽战马"
    },
    "essence": {
      "en": "A spirited horse composed of boiling steam. You represent high-pressure energy, intelligence mixed with passion, and a constant drive.",
      "cn": "沸腾蒸汽构成的战马。你代表了高压能量、理智与激情的剧烈交织，以及一种永不停歇、随时准备爆发的行动力。"
    },
    "career": {
      "style": {
        "en": "The Dynamic Strategist. You process information rapidly and act with white-hot passion. You excel in high-stakes, fast-paced environments.",
        "cn": "极速策划者。你处理信息的速度极快且充满激情。在那些需要瞬间决策、充满博弈的高风险环境中，你是绝对的高手。"
      },
      "fields": {
        "en": "Venture Capital, Crisis PR, Modern Media, High-Speed Logistics, Tech Startups.",
        "cn": "风险投资、危机公关处理、现代新媒体、高速物流、科技初创。"
      },
      "wealth": {
        "en": "Active Profit. You earn through speed and by staying ahead of the curve. Your fortune is made at the 'boiling point' of opportunities.",
        "cn": "活跃之财。你靠反应速度和超前的趋势判断获利。你的财富通常是在机遇最炽热的“沸点”时刻通过果断出击赚取的。"
      }
    },
    "love": {
      "mode": {
        "en": "The Passionate Wave. Your love is exciting, romantic, and brings a constant flow of high-octane energy to the relationship.",
        "cn": "激情之波。你的爱令人兴奋且浪漫，能为感情生活带来持续的高能驱动，让伴侣感到生活充满了火花。"
      },
      "challenge": {
        "en": "Impatience. You can become frustrated if the partner doesn't move at your lightning speed or share your intensity.",
        "cn": "缺乏耐心。如果伴侣跟不上你那闪电般的节奏，或者无法回应你那种强度的热情，你会感到极度的沮丧和焦躁。"
      }
    },
    "growth": {
      "en": "Focus. You grow by learning to channel your high-pressure energy into a single direction rather than letting it scatter into thin air.",
      "cn": "聚气成能。你通过学习将那种高压能量聚焦于一个明确的长线方向，而非任其在瞬间散失，从而实现真正的进阶。"
    }
  },
  "癸未": {
    "name": {
      "en": "The Rain Sheep",
      "cn": "烟雨灵羊"
    },
    "essence": {
      "en": "A fluffy sheep resembling a rain cloud. Precious, fragile, and providing healing relief in a harsh environment.",
      "cn": "蒙蒙烟雨中的灵羊。你珍贵、纤弱，在严酷且充满压力的现实环境中，你是一剂沁人心脾的愈疗灵药，带来湿润的生机。"
    },
    "career": {
      "style": {
        "en": "The Empathetic Healer. You thrive in roles requiring high emotional intelligence and provide the 'soft power' that holds groups together.",
        "cn": "共情愈疗者。你在需要极高情商的职位上表现卓越。你拥有一种能将团队凝聚在一起的、温柔却不可忽视的“软实力”。"
      },
      "fields": {
        "en": "High-end Counseling, Human Resources, Fine Arts, Floral Design, Luxury Nursing.",
        "cn": "高级心理咨询、人力资源管理、精细艺术、花艺设计、高端护理服务。"
      },
      "wealth": {
        "en": "Support Wealth. You earn through your ability to solve human problems and being indispensable to the lives of influential people.",
        "cn": "扶持之财。你通过解决人的情感和细节困境获利。当你成为重要人物生命中那个不可或缺的存在时，财富会随之而至。"
      }
    },
    "love": {
      "mode": {
        "en": "The Vulnerable Guardian. You love with your whole heart and seek a partner who is a solid 'mountain' for your delicate rain.",
        "cn": "纤弱守护者。你爱得全心全意但也极易受伤。你渴望的是那个能像“大山”一样，为你这一阵润物无声的雨露遮风挡雨的伴侣。"
      },
      "challenge": {
        "en": "Mood Swings. Your emotions change with the wind, often leading to internal storms that confuse your loved ones.",
        "cn": "情绪化。你的内在情感随风而变，常导致难以捉摸的内心风暴，会让深爱你的人感到疲于应付且困惑不已。"
      }
    },
    "growth": {
      "en": "Self-Protection. You grow by learning that your sensitivity is a sacred power, and building healthy boundaries to protect it.",
      "cn": "自我保护。你通过意识到“敏感是一种神圣的力量而非弱点”，并学会建立健康的心理边界来保护它，从而获得成长。"
    }
  },
  "壬申": {
    "name": {
      "en": "The Spring Monkey",
      "cn": "源泉灵猴"
    },
    "essence": {
      "en": "A playful monkey under a waterfall. Pure, crystal-clear water gushing from solid rock. You represent high intelligence and endless logic.",
      "cn": "瀑布源头的灵猴。你代表了从坚硬岩石中源源不断涌出的清澈智慧。你拥有极高的理智、无穷的潜力，以及永不枯竭的生命力。"
    },
    "career": {
      "style": {
        "en": "The Long-term Strategist. You value precision and wisdom over brute force. You start as a small stream but grow into an unstoppable river.",
        "cn": "长线策略家。你看重精准与智慧，而非蛮力。你属于“慢热型”高手，起步时看似平静，但随着经验积累会汇聚成不可阻挡的力量。"
      },
      "fields": {
        "en": "Scientific Research, IT Architecture, Law, Intelligence, Technical Writing.",
        "cn": "前沿科学研究、IT架构开发、法律诉讼、情报分析、精密技术写作。"
      },
      "wealth": {
        "en": "Source Wealth. A steady, endless flow of income based on your deep expertise. You grow wealthier and wiser with age.",
        "cn": "源头之财。基于你深厚的专业知识和技术壁垒，财富会像泉水一样源源不断。你属于典型的财富与智慧随年龄同步增长的类型。"
      }
    },
    "love": {
      "mode": {
        "en": "The Rational Partner. You are stable and reliable, expressing love through solving problems and providing logical support.",
        "cn": "理智伴侣。你稳健且极度可靠，你表达爱的方式是默默帮对方解决生活中的难题，而非通过华丽的辞藻或浪漫的表演。"
      },
      "challenge": {
        "en": "Cool Detachment. Your lack of romantic expression can sometimes make a partner feel neglected or lonely in your presence.",
        "cn": "理性的疏离。你缺乏感性的、剧烈的情感表达，有时会让伴侣觉得你像冷水一样缺乏温度，产生一种近在咫尺却远在天边的孤独感。"
      }
    },
    "growth": {
      "en": "Academic Mastery. You are a natural student of life, excelling in systems that require high-level logical architecture.",
      "cn": "学术精进。你是天生的终身学习者。在需要高层逻辑支撑、需要不断钻研的系统里，你最能找到成长的快乐。"
    }
  },
  "癸酉": {
    "name": {
      "en": "The Crystal Rooster",
      "cn": "水晶神凤"
    },
    "essence": {
      "en": "A rooster made of clear crystal. Sharp, refined, and melancholic. You possess a mind as sharp as a razor under the moonlight.",
      "cn": "剔透水晶雕刻的神凤。你拥有一种精致、忧郁且极具穿透力的天赋，头脑像手术刀一样精准，且带有一种清冷的月光感。"
    },
    "career": {
      "style": {
        "en": "The Specialized Aesthete. You have a laser focus on both flaws and beauty. You excel in niche fields requiring technical precision.",
        "cn": "专精的审美家。你对瑕疵和美感都有着激光般的直觉。在需要艺术感和技术精确度高度并存的冷门领域，你是那个无可替代的巅峰。"
      },
      "fields": {
        "en": "Forensics, Specialized Design, Legal Analysis, Luxury Watchmaking, Deep Psychology.",
        "cn": "法医学鉴定、特种产品设计、法律细节分析、高级钟表工艺、深层心理分析。"
      },
      "wealth": {
        "en": "Talent Wealth. Your income is a reflection of your unique, high-value skills. You earn by seeing what others are too afraid to look at.",
        "cn": "才华之财。你的收入是你独特、高价值技能的缩影。你通过穿透迷雾、直击他人不敢直视的真相或细节而获得丰厚的回报。"
      }
    },
    "love": {
      "mode": {
        "en": "The Addictive Enigma. Your love is deep, quiet, and slightly tragic. You seek a partner who can see the beauty in your melancholic shadows.",
        "cn": "成瘾之谜。你的爱深沉、安静且带有一种宿命般的忧郁。你寻找的是那个能洞察你阴影中的美，并能陪伴你渡过寒雨的灵魂知己。"
      },
      "challenge": {
        "en": "Melancholy. You are prone to self-isolation and can become trapped in your own dark, over-analyzed thoughts.",
        "cn": "情感漩涡。你极其容易自我孤立，并可能陷入自己那些过度分析、灰暗且忧郁的思绪中无法自拔，让人难以靠近。"
      }
    },
    "growth": {
      "en": "Alchemy of Sorrow. You grow by learning to turn your deep pain and sensitivity into sharp, world-changing creative masterpieces.",
      "cn": "悲伤炼金。你通过学习将内心的忧郁和痛苦转化为锐利、感人至深的创造力产出，从而完成人生的华丽转身。"
    }
  },
  "壬戌": {
    "name": {
      "en": "The Ocean Dog",
      "cn": "沧海神犬"
    },
    "essence": {
      "en": "A loyal dog guarding the vast ocean. Powerful water held back by a massive dam. You represent potential energy and control.",
      "cn": "守护沧海的神犬。被巨型石坝拦截的奔腾江水。你代表了巨大的潜在势能与极强的控制力，那种深藏不露的厚重感令人肃然起敬。"
    },
    "career": {
      "style": {
        "en": "The Strategic Accumulator. Excellent at holding wealth, secrets, and power until the precise moment to release them.",
        "cn": "战略积累者。你极其擅长守护财富、秘密与权力。你像大坝蓄水一样默默积攒能量，直到那个完美的爆发时刻到来，给予世界致命一击。"
      },
      "fields": {
        "en": "Real Estate, Asset Management, Security, Strategic Reserves, Large-scale Logistics.",
        "cn": "房地产开发、资产托管管理、国家级安保、战略物资储备、大型物流枢纽。"
      },
      "wealth": {
        "en": "Saved Wealth. A master of accumulation. You build a massive safety net and often become significantly wealthy in the second half of life.",
        "cn": "积蓄之财。你是积累的大师。你擅长构建巨大的财务安全网，通常会在人生的中下半场厚积薄发，拥有惊人的财富储备。"
      }
    },
    "love": {
      "mode": {
        "en": "The Controlling Guardian. Loyal to a fault, you offer a safe, stable home, but you keep a tight grip on the direction of the relationship.",
        "cn": "控制型守护者。你忠诚得近乎执着，能为家庭提供一个最安全的港湾，但你也会牢牢掌控感情发展的每一个细节，不容偏离。"
      },
      "challenge": {
        "en": "Stubbornness. Once your mind is made up, you become an immovable wall. You struggle to adapt to sudden emotional shifts.",
        "cn": "顽固。一旦你的观念形成（大坝建成），几乎没有人能说服你改变。你很难适应伴侣突如其来的情感变化或不按常理出牌的行为。"
      }
    },
    "growth": {
      "en": "Foresight. Your success comes from your ability to look decades ahead and plan for every possible tide.",
      "cn": "远见卓识。你的成功源于你能够提前几十年布局人生、并为每一次可能的社会大潮做足准备的能力。"
    }
  },
  "癸亥": {
    "name": {
      "en": "The Galaxy Boar",
      "cn": "星河灵猪"
    },
    "essence": {
      "en": "A piglet whose skin reflects the entire Milky Way. The limitless darkness of the deep sea holding ancient secrets.",
      "cn": "映照着璀璨星河的灵猪。你是无边无际深海中秘密的保管者，拥有一种与生俱来的、能与宇宙潜意识产生连接的通灵特质。"
    },
    "career": {
      "style": {
        "en": "The Silent Oracle. You see the invisible patterns behind human behavior. You excel in roles that require deep wisdom.",
        "cn": "沉默的先知。你能看到人类行为背后那些隐形的规律。在需要极深智慧、策略和人性洞察的职位上，你是无可比拟的。"
      },
      "fields": {
        "en": "Psychology, Metaphysics, High-stakes Strategy, Philanthropy, Occult Research.",
        "cn": "心理学、玄学、顶级商业策略、慈善事业、神秘学研究。"
      },
      "wealth": {
        "en": "Intuitive Wealth. Money follows your spiritual alignment. You don't chase wealth; you attract it.",
        "cn": "灵感之财。不需要辛苦追逐，只要你顺应直觉并对齐你的灵魂使命，财富会随着你的灵性觉醒而自然汇聚，不求而自得。"
      }
    },
    "love": {
      "mode": {
        "en": "The Deep Soul. You are an empathetic sponge, absorbing your partner's emotions and providing unconditional acceptance.",
        "cn": "深沉灵魂。你是一个极具同理心的情感海绵。你无意识地吸收伴侣的情绪，并给予一种近乎神圣的、完全接纳且不加评判的爱。"
      },
      "challenge": {
        "en": "Nihilism. Absorbing too much negative energy can lead to deep sadness or emptiness.",
        "cn": "虚无感。吸收了太多外界的负面能量后，你容易陷入极度的抑郁或对世界的冷漠。你面临着在自己挖掘的情感深渊中迷失的风险。"
      }
    },
    "growth": {
      "en": "Transcendental Wisdom. You grow by bringing light to the darkest corners of consciousness.",
      "cn": "超脱觉悟。你通过为自己和他人意识中最黑暗的角落带去光亮，来实现生命维度的提升，达到大智若愚的境界。"
    }
  },
  "丁亥": {
    "name": {
      "en": "The Sparkler Boar",
      "cn": "星火灵猪"
    },
    "essence": {
      "en": "A warm spark held inside deep night water. You are intuitive, loyal, and quietly radiant, with a gift for finding hope in emotionally complex places.",
      "cn": "深夜水面上被小心守护的一点星火。你直觉敏锐、重情而安静发光，擅长在复杂情绪中找到希望。"
    },
    "career": {
      "style": {
        "en": "The Empathic Illuminator. You notice what others miss and turn subtle emotional signals into thoughtful creative or strategic work.",
        "cn": "共情型点灯者。你能觉察他人忽略的细微信号，并把它转化为有温度的创作或策略。"
      },
      "fields": {
        "en": "Psychology, Film, Writing, Hospitality, Brand Storytelling, Healing Arts.",
        "cn": "心理咨询、影视写作、酒店服务、品牌叙事、疗愈艺术。"
      },
      "wealth": {
        "en": "Trust Wealth. Opportunity grows through emotional intelligence, reputation, and relationships built slowly over time.",
        "cn": "信任之财。机会来自情绪洞察、长期声誉，以及缓慢建立起来的深度关系。"
      }
    },
    "love": {
      "mode": {
        "en": "The Gentle Devotee. You love through tenderness, memory, and a private world shared with one trusted person.",
        "cn": "温柔的守望者。你用体贴、记忆和只与所爱之人共享的私密世界表达感情。"
      },
      "challenge": {
        "en": "Hidden Overwhelm. You can absorb too much, retreat without explanation, and expect others to sense needs you have not voiced.",
        "cn": "隐性的过载。你容易吸收过多情绪、无声退避，并期待对方读懂你尚未说出的需要。"
      }
    },
    "growth": {
      "en": "Visible Warmth. You grow by naming your needs clearly and allowing your small, steady light to be seen.",
      "cn": "让温度被看见。清楚表达需要，并允许自己稳定而细小的光被他人看见。"
    },
    "health": {
      "en": "Focus: Circulation & Rest. Protect sleep and warmth when emotional demands are high.",
      "cn": "关注循环与睡眠。情绪负荷较高时尤其需要保暖并保护休息。"
    },
    "link": "#"
  }
} as const satisfies Record<string, PillarProfile>;
