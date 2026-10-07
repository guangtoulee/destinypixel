import type { JournalSourceArticle, JournalTranslation } from "@/lib/journal";

// Pamela Colman Smith biography. Images are public domain; credits are rendered as figure captions.
const editions: Record<"en" | "zh" | "ru", JournalTranslation> = {
  "en": {
    "title": "Pamela Colman Smith, the Artist of Tarot",
    "description": "Who drew the Rider-Waite tarot? Meet Pamela Colman Smith: theatre artist, painter of music, creator of 78 story cards and the PCS monogram in the corner.",
    "topic": "Tarot history",
    "introduction": "You probably know her pictures even if you don't know her name. A young traveller steps toward a cliff edge. A man stoops under a bundle of ten heavy staves. A red heart hangs in the rain, pierced by three swords. Most people call this the \"Rider-Waite\" deck. Ask who drew the Rider Waite deck, though, and the answer isn't Rider, the publisher, or Arthur Edward Waite, the occultist who planned it. It was Pamela Colman Smith, an artist whom Ellen Terry nicknamed Pixie.",
    "takeaway": "The deck most people call “Rider-Waite” was drawn by Pamela Colman Smith, and her PCS monogram still hides in the corners of the cards.",
    "sections": [
      {
        "id": "london-jamaica-new-york",
        "title": "London, Jamaica, New York",
        "paragraphs": [
          "She was born on 16 February 1878 in Pimlico, London, to American parents. Her grandfather, Cyrus Porter Smith, had been mayor of Brooklyn, and her uncle, Samuel Colman, was a painter. Around 1889 her father took a job in Jamaica, and the family went with him. In 1893 she enrolled at the Pratt Institute in New York, where she studied under Arthur Wesley Dow. She left around 1897 without a degree."
        ],
        "figures": [
          {
            "src": "/journal/pamela-colman-smith/rws-ace-of-cups-pam-a.webp",
            "width": 927,
            "height": 1600,
            "alt": "Ace of Cups, Rider–Waite–Smith Pam-A edition (1909)",
            "caption": "Pamela Colman Smith, Ace of Cups, Rider–Waite–Smith tarot, Pam-A edition, 1909. Scan: TaionWC / Wikimedia Commons (File:Cups01.jpg), public domain.",
            "afterParagraph": -1
          }
        ]
      },
      {
        "id": "stage-and-stories",
        "title": "The Stage, the Stories and a \"Mad Room\"",
        "paragraphs": [
          "From 1899 she worked with Henry Irving and Ellen Terry's Lyceum company, and in 1899–1900 she toured America with them, drawing illustrations and making costumes. The same year she published Annancy Stories; Chim-Chim followed in 1905. The theatre shaped her deeply, and in 1908 she said so plainly: \"The stage has taught me almost all I know of clothes, of action and of pictorial gestures.\"",
          "From 1903 she edited a little magazine, The Green Sheaf. It ran to thirteen issues, and every picture in it was coloured by hand. Afterwards she opened a hand-colouring shop and published under the name Green Sheaf Press. Her London home was known for its evenings. In Bohemia in London (1907), the writer Arthur Ransome describes one of them, giving her the alias \"Gypsy.\" He recalls arriving at her door: \"We left our hats and followed her into a mad room out of a fairy tale. As soon as I saw it I knew she could live in no other.\" He calls her, affectionately, the \"god-daughter of a witch and sister to a fairy.\" That is a friend's teasing tribute to her gift as a storyteller, not a description of who she was."
        ],
        "figures": [
          {
            "src": "/journal/pamela-colman-smith/green-sheaf-hand-coloured.webp",
            "width": 1300,
            "height": 1581,
            "alt": "Hand-coloured page from The Green Sheaf",
            "caption": "The Green Sheaf, edited by Pamela Colman Smith, 1903, hand-coloured page. Wikimedia Commons (File:Green_Sheaf_05C.jpg), public domain.",
            "afterParagraph": 1
          }
        ]
      },
      {
        "id": "pictures-in-music",
        "title": "What She Said She Saw",
        "paragraphs": [
          "The strangest thing about her, and the most beautiful, is that she painted music.",
          "In 1908 she explained it herself to The Strand Magazine, in a piece called \"Pictures in Music.\" Her paintings, she said, \"are not pictures of the music theme... but just what I see when I hear music.\" Then she described how it began: \"When I take a brush in hand and the music begins, it is like unlocking the door into a beautiful country.\"",
          "And what was in that country? She gave an example: \"Often when hearing Bach I hear bells ringing in the sky, rung by whirling cords held in the hands of maidens dressed in brown.\" The same year, writing for art students in The Craftsman, she put the idea more simply: \"sound and form are more closely connected than we know.\"",
          "You can still see one of these journeys. Overture. \"Egmont\" Beethoven (1907), painted as she listened to Beethoven's overture, now belongs to the Smithsonian American Art Museum.",
          "According to a journalist writing in The Craftsman in 1912, \"She sees music, rather than hears it.\" The same article says that \"from childhood she has had the gift of the 'second sight,'\" and that \"most often in Ireland she saw the Sidhe,\" the fairy people of Irish legend. Asked why she painted them so radiant and tall, \"she answers simply that it is the way they look.\" Later scholars have used the word \"synaesthesia\" for her. That is their term, not hers.",
          "What follows is imagined. The lamps are lowered and the music starts. She sits in a corner with paper across her knees, and her brush never stops. Everyone else is listening; she is looking. A phrase climbs, and a ridge of distant hills rises on the page. The bass drops, and the sea darkens with it. When the piece ends she looks up, as if she has come back from somewhere far away.",
          "In January 1907 the photographer Alfred Stieglitz gave her a show of 72 works at his 291 gallery. It was the first time the gallery had shown anything other than photographs, and she went on to have two more shows there. Not bad for a young illustrator who had left art school without a degree."
        ],
        "figures": [
          {
            "src": "/journal/pamela-colman-smith/pcs-egmont-beethoven-1907.webp",
            "width": 973,
            "height": 1400,
            "alt": "Smith's 1907 watercolour painted while listening to Beethoven's Egmont overture",
            "caption": "Pamela Colman Smith, Overture. \"Egmont\" Beethoven, 1907, watercolour, ink and pencil. Smithsonian American Art Museum (SAAM), Museum purchase 1984.24, public domain.",
            "afterParagraph": 3
          }
        ]
      },
      {
        "id": "waite",
        "title": "Waite Comes Calling",
        "paragraphs": [
          "Around 1901 she joined the Hermetic Order of the Golden Dawn. Some years later Waite, a fellow occultist, wanted a new tarot deck and asked her to draw it.",
          "Waite's 1910 book says the cards were \"drawn and colored by Miss Pamela Colman Smith.\" Decades later he remembered her as \"a most imaginative and abnormally psychic artist,\" working under his \"proper guidance.\" That is Waite's version. How much he directed and how much she invented, nobody can now say."
        ]
      },
      {
        "id": "eighty-designs",
        "title": "Eighty Designs, Very Little Cash",
        "paragraphs": [
          "On 19 November 1909 she wrote to Stieglitz. The letter is now at Yale's Beinecke Library. Almost in passing, she mentioned that she had just finished a big job for \"very little cash,\" a set of designs for a pack of tarot cards, \"80 designs.\" Then she turned to practical matters: \"I shall send some over — of the original drawings as some people may like them! — I will send you a pack — (printed in colour by lithography) — (probably very badly!) as soon as they are ready — by Dec. 1 — I think —\" She hoped New York buyers might want the originals.",
          "Rider published the deck that December, and the following year Waite's small companion book, The Key to the Tarot, appeared alongside it, later expanded as The Pictorial Key to the Tarot. No record of what she was paid survives. The pack she feared would be printed \"probably very badly\" went on to accompany generations of readers."
        ]
      },
      {
        "id": "minor-arcana-as-theatre",
        "title": "Turning the Minor Arcana into Theatre",
        "paragraphs": [
          "The deck's real revolution is in the minor cards. Before 1909, the numbered cards of a tarot deck usually just showed their suit symbols in a row: five cups were five cups. Pamela Colman Smith tarot cards are different. She turned all 78 into scenes with people in them. On the Five of Cups, a cloaked figure mourns the cups that have spilled. On the Ten of Wands, a man bends under his load and trudges toward a distant house. Every card looks like a play caught halfway through.",
          "Some researchers think she may have drawn on the Sola Busca tarot, an Italian deck. A full set of photographs of it entered the British Museum in 1907. She very likely saw them, and some of her minor cards do resemble it. This is the researchers' view, though; she never mentioned it herself.",
          "Because every card is a picture, beginners find this deck easy to read. Draw a card here and see what story it tells you, or try reading three cards together as one scene."
        ],
        "links": [
          {
            "text": "Draw a card here",
            "href": "/tarot"
          },
          {
            "text": "reading three cards together",
            "href": "/journal/how-to-read-three-card-tarot"
          }
        ]
      },
      {
        "id": "faces-on-the-cards",
        "title": "Who Are the Faces on the Cards?",
        "paragraphs": [
          "Some have guessed that her figures had real-life models, but accounts differ. The Queen of Wands is said by some to be Ellen Terry and by others to be Edith Craig. Others have guessed that the dancer on the World card is Florence Farr of the Golden Dawn. None of these guesses comes from her."
        ]
      },
      {
        "id": "pcs-monogram",
        "title": "The PCS Hidden in the Corner",
        "paragraphs": [
          "Turn up the Ten of Wands and look at the bottom-right corner. Then do the same on the Three of Swords, beside the falling rain. Each has a small mark that the V&A describes as an \"interlaced P, C and S.\" It is her monogram.",
          "She used it for years. It appears on the six colour plates she painted for Bram Stoker's The Lair of the White Worm (1911), a book that never printed her name. It also appears on a 1915 wartime charity poster, Buy a bulldog…, now in the US Library of Congress. Claims that it was a secret act of resistance or a copyright watermark have no evidence behind them. It is simply an artist signing her work."
        ],
        "figures": [
          {
            "src": "/journal/pamela-colman-smith/pcs-monogram-crop.webp",
            "width": 482,
            "height": 249,
            "alt": "Close-up of the interlaced P, C, S monogram",
            "caption": "Detail of the PCS monogram, cropped from Pamela Colman Smith's Ten of Wands and Three of Swords, Rider–Waite–Smith tarot, Pam-A edition, 1909. Scans: TaionWC / Wikimedia Commons (File:Wands10.jpg, File:Swords03.jpg), public domain; crop: DestinyPixel.",
            "afterParagraph": 1
          },
          {
            "src": "/journal/pamela-colman-smith/pcs-buy-a-bulldog-1915.webp",
            "width": 1059,
            "height": 1600,
            "alt": "1915 charity poster by Smith with the PCS monogram at lower right",
            "caption": "Pamela Colman Smith, Buy a bulldog on June 16th…, 1915, colour lithograph poster. Library of Congress Prints and Photographs Division, LCCN 2005691250, no known restrictions on publication.",
            "afterParagraph": 1
          }
        ]
      },
      {
        "id": "later-years",
        "title": "Later Years",
        "paragraphs": [
          "In 1910 she designed postcards for the suffrage group Suffrage Atelier. In 1911 she became a Catholic. After the First World War she moved to the Lizard peninsula in Cornwall, where she and her friend Nora Lake ran a holiday house for Catholic priests. She spent her last years in Bude and died on 18 September 1951 (some sources say the 16th). She left little in the way of money, and some debts, and her grave can no longer be located. What she did leave is in the hands of almost everyone who has ever shuffled a tarot deck.",
          "Legend has it that drawing the cards drained her spiritual strength, and that this is why her last years were poor. Many readers today prefer another way of seeing it: she gave the tarot its life, and that was a great gift in itself. In reality, the disaster of the legend never came. She simply lived out her life in Bude."
        ]
      },
      {
        "id": "name-left-off",
        "title": "A Name Left Off the Box",
        "paragraphs": [
          "The deck came to be called \"Rider-Waite,\" after a publisher and a writer, with no mention of the woman who drew it. For a long time people knew her pictures better than her name. That is changing. The 2009 centennial edition is called the Smith-Waite Centennial, and in January 2026 The New York Times gave her an obituary in its \"Overlooked\" series. Her name is now being remembered alongside the pictures that made it worth remembering.",
          "Next time you lay out a spread, look in the corners for those three letters. They are her way of saying: I drew this."
        ]
      }
    ],
    "action": {
      "label": "Draw a card on the tarot table",
      "href": "/tarot"
    }
  },
  "zh": {
    "title": "帕梅拉·科尔曼·史密斯：那个把塔罗画成故事的人",
    "description": "谁画了伟特塔罗？认识帕梅拉·科尔曼·史密斯：剧场画家、“看见”音乐的人，把 78 张牌画成一幕幕故事，还在角落留下 PCS 花押。",
    "topic": "塔罗历史",
    "introduction": "你手里那副最常见的塔罗牌，愚人站在悬崖边，权杖十的人弯腰扛着一捆木棍，宝剑三是一颗被刺穿的心。很多人叫它“伟特塔罗”，以为伟特塔罗作者就是画它的人。其实一笔一笔把这些画面画出来的，是一位女画家，帕梅拉·科尔曼·史密斯。Ellen Terry 给她起了个昵称，叫 Pixie。",
    "takeaway": "大多数人叫它“伟特塔罗”的这副牌，是帕梅拉·科尔曼·史密斯画的；她的 PCS 花押至今还藏在牌的角落里。",
    "sections": [
      {
        "id": "london-jamaica-new-york",
        "title": "从伦敦到牙买加，再到纽约",
        "paragraphs": [
          "1878 年 2 月 16 日，她在伦敦 Pimlico 出生，父母都是美国人。祖父 Cyrus Porter Smith 当过布鲁克林市长，舅舅 Samuel Colman 是画家。1889 年前后，父亲去牙买加工作，一家人也跟了过去。1893 年，她进了纽约的 Pratt Institute，跟 Arthur Wesley Dow 学画，大约 1897 年离校，没拿学位。"
        ],
        "figures": [
          {
            "src": "/journal/pamela-colman-smith/rws-ace-of-cups-pam-a.webp",
            "width": 927,
            "height": 1600,
            "alt": "韦特塔罗圣杯一，1909 年 Pam-A 版",
            "caption": "Pamela Colman Smith，《圣杯一》，韦特塔罗 Pam-A 版，1909。扫描：TaionWC / Wikimedia Commons（File:Cups01.jpg），公有领域。",
            "afterParagraph": -1
          }
        ]
      },
      {
        "id": "stage-and-stories",
        "title": "舞台、故事和一间“疯房间”",
        "paragraphs": [
          "1899 年起，她跟着 Henry Irving 和 Ellen Terry 的 Lyceum 剧团干活，还随团去美国巡演，画插图，做服装。同年她出了《Annancy Stories》，1905 年又出了《Chim-Chim》。1908 年她写道：“The stage has taught me almost all I know of clothes, of action and of pictorial gestures.” 衣服、动作、姿势，几乎都是舞台教她的。",
          "1903 年起，她主编小刊物《The Green Sheaf》，一共 13 期，画都是手工上色的。后来她开了家手工上色的店，以 Green Sheaf Press 的名义出书。她在伦敦的家常有聚会。作家 Ransome 在 1907 年的《Bohemia in London》里写过这些夜晚，书里给她用了个化名叫“Gypsy”，写他跟着她走进一间像童话里的疯房间，又称她是“god-daughter of a witch and sister to a fairy”。这是朋友在打趣，夸她讲故事有魔力，不是在说她的身份。"
        ],
        "figures": [
          {
            "src": "/journal/pamela-colman-smith/green-sheaf-hand-coloured.webp",
            "width": 1300,
            "height": 1581,
            "alt": "《The Green Sheaf》手工上色页",
            "caption": "Pamela Colman Smith 编，《The Green Sheaf》，1903，手工上色页。Wikimedia Commons（File:Green_Sheaf_05C.jpg），公有领域。",
            "afterParagraph": 1
          }
        ]
      },
      {
        "id": "pictures-in-music",
        "title": "她说自己看见了什么",
        "paragraphs": [
          "她最特别的地方，是能“看见”音乐。",
          "1908 年，她在《Strand》杂志的《Pictures in Music》里自己讲过。她说那些画画的不是乐曲的主题，“but just what I see when I hear music”，就是她听音乐时看见的东西。“When I take a brush in hand and the music begins, it is like unlocking the door into a beautiful country.” 拿起画笔，音乐一响，就像打开一扇门，门后是一片美丽的国度。",
          "她看见的是什么？她举过巴赫的例子：“Often when hearing Bach I hear bells ringing in the sky, rung by whirling cords held in the hands of maidens dressed in brown.” 听巴赫时，她常听见天上有钟声，敲钟的绳子在打转，握着绳子的是一群穿棕衣的少女。同一年，她在《The Craftsman》上给学美术的人写文章，说得更简单：“sound and form are more closely connected than we know”，声音和形状的关系，比我们以为的更近。",
          "她 1907 年画的《Overture. \"Egmont\" Beethoven》，就是听贝多芬《埃格蒙特》序曲时画下的，现在藏在美国史密森尼美国艺术博物馆。",
          "据当年记者描述，她是“sees music, rather than hears it”，与其说在听音乐，不如说在看。1912 年《The Craftsman》的这篇文章还说，她从小就有“second sight”，在爱尔兰最常看见的是 Sidhe，也就是传说中的仙族。问她为什么把它们画成那样，她答：“it is the way they look”，它们就长这样。后来有学者用“联觉”形容她，那是后人的说法，她自己没这么讲。",
          "以下是想象：灯调暗了，琴声响起来。她坐在角落，画纸摊在膝上，笔一直没停。别人在听，她在看。乐句往上走，纸上就多出一道远山；低音沉下去，海面跟着暗了。曲子停下，她抬起头，像刚从很远的地方回来。",
          "1907 年 1 月，摄影家 Stieglitz 在他的 291 画廊给她办展，展出 72 件作品。那是这家画廊头一回展出不是摄影的作品，后来她又在那里办了两次展。对一个没拿到美术学位的年轻插画家来说，这可真不赖。"
        ],
        "figures": [
          {
            "src": "/journal/pamela-colman-smith/pcs-egmont-beethoven-1907.webp",
            "width": 973,
            "height": 1400,
            "alt": "史密斯 1907 年听贝多芬《埃格蒙特》序曲后画的水彩",
            "caption": "Pamela Colman Smith，《Overture. \"Egmont\" Beethoven》，1907，水彩、墨、铅笔。史密森尼美国艺术博物馆（SAAM），博物馆购藏 1984.24，公有领域。",
            "afterParagraph": 3
          }
        ]
      },
      {
        "id": "waite",
        "title": "Waite 找上了她",
        "paragraphs": [
          "1901 年前后，她加入了神秘学团体金色黎明。后来 Arthur Edward Waite 要做一副新的塔罗牌，请她来画。",
          "Waite 在 1910 年的书里写明，这副牌是“drawn and colored by Miss Pamela Colman Smith”。多年后他回忆，说她是“a most imaginative and abnormally psychic artist”，是在他的“proper guidance”下作的牌。这是 Waite 自己的说法，他管了多少、她自由发挥了多少，现在没人说得清。"
        ]
      },
      {
        "id": "eighty-designs",
        "title": "一封信：80 幅，钱很少",
        "paragraphs": [
          "1909 年 11 月 19 日，她给 Stieglitz 写了封信，现在收在耶鲁大学 Beinecke 图书馆。她随口提了一句：刚做完一个大活，钱很少，“very little cash”，是一副塔罗牌，80 幅设计。她说想把几张原画寄去纽约，因为“some people may like them”，也许有人想买；印好的牌会给他寄一副，大概 12 月 1 日前后，还自嘲“probably very badly”，多半印得很糟。那年 12 月，这副牌由 Rider 出版。第二年，Waite 写的小册子《Key to the Tarot》随牌发行，后来又出了扩充版《Pictorial Key》。她到底拿了多少钱，没有记录。而那副她自嘲“多半印得很糟”的牌，后来陪了一代又一代读牌的人。"
        ]
      },
      {
        "id": "minor-arcana-as-theatre",
        "title": "把小牌画成一幕幕戏",
        "paragraphs": [
          "这副牌最了不起的地方在小牌。在她之前，数字牌大多只是把花色符号排一排，五个杯子就画五个杯子。她把 78 张全画成了有人物的场景。杯五里，披黑斗篷的人低头看着倒掉的杯子；权杖十的人扛着一捆木棍，弯着腰往远处的房子走。每张牌都像戏演到了一半。",
          "有研究者认为，她可能参考过意大利古牌 Sola Busca。这副牌的全套照片 1907 年进了大英博物馆，她很可能见过，部分小牌的构图也确实相似。但这是研究者的推测，她自己没提过。",
          "每张都是一幅画，所以初学者觉得它好读。你可以去本站的塔罗抽牌抽一张试试，或者照着三张牌怎么读把三幅画连成一个故事。"
        ],
        "links": [
          {
            "text": "本站的塔罗抽牌",
            "href": "/tarot?locale=zh"
          },
          {
            "text": "三张牌怎么读",
            "href": "/journal/how-to-read-three-card-tarot?locale=zh"
          }
        ]
      },
      {
        "id": "faces-on-the-cards",
        "title": "牌上的人是谁",
        "paragraphs": [
          "有人猜测牌上的人物有原型，说法不一。拿权杖王后来说，有人说是 Ellen Terry，也有人说是 Edith Craig。世界牌里的人，有人猜是金色黎明的 Florence Farr。这些都没有她本人的说法。"
        ]
      },
      {
        "id": "pcs-monogram",
        "title": "藏在牌里的 PCS",
        "paragraphs": [
          "翻到权杖十，看右下角；再翻到宝剑三，右下角的雨线旁边也有一个。那是她的花押，英国 V&A 博物馆形容它是“interlaced P, C and S”，P、C、S 三个字母缠在一起。",
          "这个花押她用了很多年。1911 年她给 Stoker 的《The Lair of the White Worm》画了 6 幅彩色插图，书上没署她的名字，插图上却有它；1915 年她画的战时慈善海报《Buy a bulldog…》上也有，那张海报现在藏在美国国会图书馆。网上说这个花押是秘密反抗、是版权水印，这些都没有证据。它就是画家的签名。"
        ],
        "figures": [
          {
            "src": "/journal/pamela-colman-smith/pcs-monogram-crop.webp",
            "width": 482,
            "height": 249,
            "alt": "放大后的 PCS 花押：P、C、S 三个字母交织",
            "caption": "PCS 花押局部，裁自 Pamela Colman Smith《权杖十》《宝剑三》，韦特塔罗 Pam-A 版，1909。扫描：TaionWC / Wikimedia Commons（File:Wands10.jpg、File:Swords03.jpg），公有领域；裁剪：DestinyPixel。",
            "afterParagraph": 1
          },
          {
            "src": "/journal/pamela-colman-smith/pcs-buy-a-bulldog-1915.webp",
            "width": 1059,
            "height": 1600,
            "alt": "1915 年史密斯设计的慈善海报，右下有 PCS 花押",
            "caption": "Pamela Colman Smith，《Buy a bulldog on June 16th…》，1915，彩色石印海报。美国国会图书馆印刷与摄影部，LCCN 2005691250，无已知出版限制（No known restrictions on publication）。",
            "afterParagraph": 1
          }
        ]
      },
      {
        "id": "later-years",
        "title": "后来的日子",
        "paragraphs": [
          "1910 年，她给参政运动团体 Suffrage Atelier 设计过明信片。1911 年，她改信天主教。一战以后，她搬到康沃尔的 Lizard 半岛，和朋友 Nora Lake 经营一处给天主教神父度假的房子。晚年她住在 Bude，1951 年 9 月 18 日去世（也有 16 日的说法）。她走的时候身后没有什么财产，还有债务，墓的位置如今也不可考。可她留下的东西，几乎每个翻开塔罗牌的人都见过。",
          "相传，画这副牌耗尽了她的灵力，所以她晚年才过得清贫。如今更多人愿意换个角度看：是她给了塔罗生命，这本身就是一份很大的功德。至于现实，传说里的那种反噬并没有发生，她只是在 Bude 走完了自己的一生。"
        ]
      },
      {
        "id": "name-left-off",
        "title": "名字里没有她",
        "paragraphs": [
          "这副牌后来叫“Rider-Waite”，一个是出版社，一个是 Waite，名字里没有画它的人。有很长一段时间，人们记住的是她的画，而不是她的名字。如今，提起她的人越来越多，2009 年出的百年纪念版就叫 Smith-Waite Centennial。2026 年 1 月，《纽约时报》在“Overlooked”栏目给她补了一篇讣告。这位韦特塔罗画者的名字，正和她的画一起被人记住。",
          "下次翻牌，不妨找找角落里的 PCS。那是她留下的一句话：这是我画的。"
        ]
      }
    ],
    "action": {
      "label": "去塔罗牌桌抽一张",
      "href": "/tarot?locale=zh"
    }
  },
  "ru": {
    "title": "Памела Колман Смит — художница Таро",
    "description": "Кто нарисовал колоду Райдера — Уэйта? Памела Колман Смит: театр, «музыкальные» картины, 78 сюжетных карт и монограмма PCS в углу.",
    "topic": "История Таро",
    "introduction": "Вы почти наверняка знаете её рисунки, даже если не знаете её имени. Юный странник шагает к краю обрыва. Человек сгибается под связкой из десяти тяжёлых жезлов. Красное сердце, пронзённое тремя мечами, висит под дождём. Большинство называет эту колоду «Райдер — Уэйт». Но если спросить, кто её нарисовал, ответом будет не издатель Райдер и не оккультист Артур Эдвард Уэйт, который её задумал. Её нарисовала Памела Колман Смит — художница, которую Эллен Терри прозвала Пикси.",
    "takeaway": "Колоду, которую принято называть «Райдер — Уэйт», нарисовала Памела Колман Смит. Её монограмма PCS до сих пор прячется в углах карт.",
    "sections": [
      {
        "id": "london-jamaica-new-york",
        "title": "Лондон, Ямайка, Нью-Йорк",
        "paragraphs": [
          "Она родилась 16 февраля 1878 года в лондонском районе Пимлико, в семье американцев. Её дед, Сайрус Портер Смит, был мэром Бруклина, а дядя, Сэмюэл Колман, — художником. Около 1889 года отец получил работу на Ямайке, и семья переехала вместе с ним. В 1893 году она поступила в Институт Пратта в Нью-Йорке и училась у Артура Уэсли Доу. Примерно в 1897 году она ушла оттуда, так и не получив диплома."
        ],
        "figures": [
          {
            "src": "/journal/pamela-colman-smith/rws-ace-of-cups-pam-a.webp",
            "width": 927,
            "height": 1600,
            "alt": "Туз Кубков из Таро Райдера — Уэйта — Смит, издание Pam-A (1909)",
            "caption": "Памела Колман Смит, Туз Кубков, Таро Райдера — Уэйта — Смит, издание Pam-A, 1909. Скан: TaionWC / Wikimedia Commons (File:Cups01.jpg), общественное достояние.",
            "afterParagraph": -1
          }
        ]
      },
      {
        "id": "stage-and-stories",
        "title": "Сцена, сказки и «безумная комната»",
        "paragraphs": [
          "С 1899 года она работала с труппой театра «Лицеум» Генри Ирвинга и Эллен Терри, а в 1899–1900 годах ездила с ними на гастроли по Америке: рисовала иллюстрации и шила костюмы. В тот же год вышли её «Сказки Ананси» (Annancy Stories), а в 1905 году — «Чим-Чим» (Chim-Chim). Театр сильно на неё повлиял, и в 1908 году она прямо об этом сказала: «Почти всё, что я знаю об одежде, о движении и о живописном жесте, мне дала сцена».",
          "С 1903 года она редактировала маленький журнал The Green Sheaf («Зелёный сноп»). Вышло тринадцать номеров, и каждую иллюстрацию в них раскрашивали вручную. Позже она открыла мастерскую ручной раскраски и выпускала книги под маркой Green Sheaf Press. Её лондонский дом славился своими вечерами. Писатель Артур Рэнсом описывает один из них в книге «Богема в Лондоне» (Bohemia in London, 1907), выводя её под прозвищем «Цыганка». Он вспоминает, как пришёл к её двери: «Мы оставили шляпы и пошли за ней в безумную комнату, словно из сказки. Едва увидев её, я понял, что ни в какой другой она жить не могла бы». Он ласково называет её «крестницей ведьмы и сестрой феи». Это дружеская шутка, дань её таланту рассказчицы, а не описание того, кем она была."
        ],
        "figures": [
          {
            "src": "/journal/pamela-colman-smith/green-sheaf-hand-coloured.webp",
            "width": 1300,
            "height": 1581,
            "alt": "Страница The Green Sheaf с ручной раскраской",
            "caption": "The Green Sheaf под редакцией Памелы Колман Смит, 1903, страница с ручной раскраской. Wikimedia Commons (File:Green_Sheaf_05C.jpg), общественное достояние.",
            "afterParagraph": 1
          }
        ]
      },
      {
        "id": "pictures-in-music",
        "title": "Что, по её словам, она видела",
        "paragraphs": [
          "Самое странное и самое прекрасное в ней то, что она рисовала музыку.",
          "В 1908 году она сама объяснила это журналу The Strand Magazine в статье «Картины в музыке» (Pictures in Music). Её картины, говорила она, — «не изображения музыкальной темы… а просто то, что я вижу, когда слышу музыку». И описала, как всё начинается: «Когда я беру в руку кисть и звучит музыка, это словно отпираешь дверь в прекрасную страну».",
          "Что же было в этой стране? Она привела пример: «Часто, слушая Баха, я слышу, как в небе звонят колокола; их раскачивают вихрящиеся верёвки в руках девушек, одетых в коричневое». В том же году в журнале The Craftsman, обращаясь к студентам-художникам, она выразила ту же мысль проще: «звук и форма связаны теснее, чем мы думаем».",
          "Одно из таких путешествий можно увидеть и сегодня. Работа «Увертюра. „Эгмонт“ Бетховена» (Overture. \"Egmont\" Beethoven, 1907), написанная под звуки бетховенской увертюры, хранится в Смитсоновском музее американского искусства.",
          "По словам журналиста, писавшего о ней в The Craftsman в 1912 году, «она скорее видит музыку, чем слышит её». В той же статье говорится, что «с детства у неё был дар „второго зрения“» и что «чаще всего в Ирландии она видела сидов» — волшебный народ ирландских легенд. На вопрос, почему она изображает их такими сияющими и высокими, «она просто отвечает, что так они и выглядят». Позднее исследователи стали говорить о её «синестезии». Это их термин, а не её.",
          "Дальше — воображаемая сцена. Лампы приглушают, звучит музыка. Она сидит в углу, на коленях лист бумаги, и кисть не останавливается ни на миг. Все остальные слушают, а она смотрит. Фраза взлетает вверх — и на листе поднимается гряда далёких холмов. Бас уходит вниз — и море темнеет вместе с ним. Когда пьеса заканчивается, она поднимает глаза, будто вернулась откуда-то издалека.",
          "В январе 1907 года фотограф Альфред Стиглиц устроил в своей галерее «291» её выставку из 72 работ. Впервые галерея показала что-то кроме фотографий, а позже Смит выставлялась там ещё дважды. Неплохо для молодой иллюстраторши, ушедшей из художественной школы без диплома."
        ],
        "figures": [
          {
            "src": "/journal/pamela-colman-smith/pcs-egmont-beethoven-1907.webp",
            "width": 973,
            "height": 1400,
            "alt": "Акварель Смит 1907 года, написанная под увертюру Бетховена «Эгмонт»",
            "caption": "Памела Колман Смит, Overture. \"Egmont\" Beethoven, 1907, акварель, тушь, карандаш. Смитсоновский музей американского искусства (SAAM), приобретение музея 1984.24, общественное достояние.",
            "afterParagraph": 3
          }
        ]
      },
      {
        "id": "waite",
        "title": "Уэйт стучится в дверь",
        "paragraphs": [
          "Около 1901 года она вступила в Герметический орден Золотой зари. Через несколько лет Уэйт, её собрат по оккультным кругам, задумал новую колоду Таро и попросил её нарисовать.",
          "В книге Уэйта 1910 года сказано, что карты «нарисованы и раскрашены мисс Памелой Колман Смит». Спустя десятилетия он вспоминал её как «художницу с богатейшим воображением и необычайно развитыми экстрасенсорными способностями», работавшую под его «должным руководством». Это версия Уэйта. Сколько он направлял и сколько она придумала сама, теперь не скажет никто."
        ]
      },
      {
        "id": "eighty-designs",
        "title": "Восемьдесят рисунков за гроши",
        "paragraphs": [
          "19 ноября 1909 года она написала Стиглицу. Это письмо сейчас хранится в Бейнекской библиотеке Йельского университета. Почти мимоходом она упомянула, что только что закончила большую работу за «совсем небольшие деньги» — серию рисунков для колоды карт Таро, «80 рисунков». Затем перешла к делу: «Пришлю кое-что — из оригинальных рисунков, вдруг они кому-нибудь понравятся! — пришлю вам колоду — (цветная литография) — (наверное, напечатано очень плохо!) как только будет готово — к 1 декабря — думаю —». Она надеялась, что оригиналы заинтересуют покупателей в Нью-Йорке.",
          "Райдер выпустил колоду в декабре того же года, а на следующий год вместе с ней вышла небольшая книжка-спутник Уэйта «Ключ к Таро» (The Key to the Tarot), позже расширенная до «Иллюстрированного ключа к Таро» (The Pictorial Key to the Tarot). Сведений о том, сколько ей заплатили, не сохранилось. А колода, которая, как она опасалась, будет напечатана «наверное, очень плохо», сопровождала потом не одно поколение тарологов."
        ]
      },
      {
        "id": "minor-arcana-as-theatre",
        "title": "Младшие арканы как театр",
        "paragraphs": [
          "Настоящая революция этой колоды — в младших картах. До 1909 года числовые карты Таро обычно просто показывали символы масти в ряд: пять кубков — это пять кубков. Карты Таро Памелы Колман Смит устроены иначе. Все 78 она превратила в сцены с людьми. На Пятёрке Кубков фигура в плаще скорбит над пролитыми кубками. На Десятке Жезлов человек сгибается под ношей и бредёт к далёкому дому. Каждая карта похожа на спектакль, застигнутый на середине.",
          "Некоторые исследователи считают, что она могла опираться на Таро Сола-Буска — итальянскую колоду. Полный комплект её фотографий поступил в Британский музей в 1907 году. Весьма вероятно, что Смит их видела, и некоторые её младшие карты действительно на неё похожи. Но это мнение исследователей: сама она об этом никогда не упоминала.",
          "Поскольку каждая карта — картина, новичкам эту колоду читать легко. Вытяните карту здесь и посмотрите, какую историю она вам расскажет, или попробуйте прочитать три карты вместе как одну сцену."
        ],
        "links": [
          {
            "text": "Вытяните карту здесь",
            "href": "/tarot?locale=ru"
          },
          {
            "text": "прочитать три карты вместе",
            "href": "/journal/how-to-read-three-card-tarot?locale=ru"
          }
        ]
      },
      {
        "id": "faces-on-the-cards",
        "title": "Чьи лица на картах?",
        "paragraphs": [
          "Высказывались догадки, что у её персонажей были реальные прототипы, но версии расходятся. Королеву Жезлов одни считают Эллен Терри, другие — Эдит Крейг. Говорят также, что танцовщица на карте «Мир» — это Флоренс Фарр из «Золотой зари». Ни одна из этих догадок не исходит от самой Смит."
        ]
      },
      {
        "id": "pcs-monogram",
        "title": "PCS в уголке карты",
        "paragraphs": [
          "Откройте Десятку Жезлов и посмотрите в правый нижний угол. Затем сделайте то же с Тройкой Мечей — рядом с падающим дождём. На каждой есть маленький знак, который Музей Виктории и Альберта описывает как «переплетённые P, C и S». Это её монограмма.",
          "Она пользовалась ею много лет. Монограмма есть на шести цветных иллюстрациях, которые она написала для романа Брэма Стокера «Логово белого червя» (The Lair of the White Worm, 1911), — в самой книге её имя так и не напечатали. Есть она и на благотворительном плакате военного 1915 года Buy a bulldog… («Купите бульдога…»), который сейчас хранится в Библиотеке Конгресса США. Утверждения, будто это был тайный акт сопротивления или защитный водяной знак, ничем не подкреплены. Это просто подпись художницы под своей работой."
        ],
        "figures": [
          {
            "src": "/journal/pamela-colman-smith/pcs-monogram-crop.webp",
            "width": 482,
            "height": 249,
            "alt": "Крупный план монограммы из переплетённых букв P, C, S",
            "caption": "Монограмма PCS, фрагмент Десятки Жезлов и Тройки Мечей Памелы Колман Смит, Таро Райдера — Уэйта — Смит, издание Pam-A, 1909. Сканы: TaionWC / Wikimedia Commons (File:Wands10.jpg, File:Swords03.jpg), общественное достояние; кадрирование: DestinyPixel.",
            "afterParagraph": 1
          },
          {
            "src": "/journal/pamela-colman-smith/pcs-buy-a-bulldog-1915.webp",
            "width": 1059,
            "height": 1600,
            "alt": "Благотворительный плакат Смит 1915 года с монограммой PCS справа внизу",
            "caption": "Памела Колман Смит, Buy a bulldog on June 16th…, 1915, цветной литографский плакат. Отдел эстампов и фотографий Библиотеки Конгресса, LCCN 2005691250, известных ограничений на публикацию нет (No known restrictions on publication).",
            "afterParagraph": 1
          }
        ]
      },
      {
        "id": "later-years",
        "title": "Последние годы",
        "paragraphs": [
          "В 1910 году она рисовала открытки для суфражистской группы Suffrage Atelier. В 1911 году приняла католичество. После Первой мировой войны переехала на полуостров Лизард в Корнуолле, где вместе с подругой Норой Лейк держала дом отдыха для католических священников. Последние годы она провела в Бьюде и умерла 18 сентября 1951 года (по некоторым данным, 16-го). Денег после неё почти не осталось, зато остались долги, а её могилу сегодня уже не найти. Но то, что она оставила, держал в руках почти каждый, кто хоть раз тасовал колоду Таро.",
          "Согласно преданию, работа над картами истощила её духовные силы, и потому последние годы она прожила в бедности. Многие читатели сегодня предпочитают смотреть на это иначе: она вдохнула в Таро жизнь, и это само по себе великий дар. В действительности беда из легенды так и не случилась. Она просто дожила свою жизнь в Бьюде."
        ]
      },
      {
        "id": "name-left-off",
        "title": "Имя, которого нет на коробке",
        "paragraphs": [
          "Колоду стали называть «Райдер — Уэйт» — по издателю и автору, — не упоминая женщину, которая её нарисовала. Долгое время её рисунки знали лучше, чем её имя. Теперь это меняется. Юбилейное издание 2009 года называется Smith-Waite Centennial, а в январе 2026 года The New York Times посвятила ей некролог в рубрике «Overlooked» («Незамеченные»). Её имя наконец вспоминают рядом с картинами, благодаря которым его стоит помнить.",
          "В следующий раз, раскладывая карты, поищите в уголках эти три буквы. Так она говорит нам: это нарисовала я."
        ]
      }
    ],
    "action": {
      "label": "Вытянуть карту за столом Таро",
      "href": "/tarot?locale=ru"
    }
  }
};

export const pamelaColmanSmithArticle: JournalSourceArticle = {
  slug: "pamela-colman-smith-tarot-artist",
  relatedSlug: "how-to-read-three-card-tarot",
  zhTwReplacements: [["大多隻是", "大多只是"], ["杯五里", "杯五裡"], ["意大利", "義大利"]],
  publishedAt: "2026-10-07",
  updatedAt: "2026-10-07",
  translations: { en: editions.en, zh: editions.zh },
};
export const pamelaColmanSmithRussian = editions.ru;
