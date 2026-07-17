export type LayerKey = 'bone' | 'muscle' | 'tendon' | 'ligament' | 'connection';

export type RegionId =
  | 'cervical'
  | 'shoulder'
  | 'thoracic-rib'
  | 'lumbar-disc'
  | 'pelvis'
  | 'leg-length'
  | 'knee'
  | 'achilles';

export type Vec3 = [number, number, number];

export interface RegionContent {
  id: RegionId;
  title: string;
  shortTitle: string;
  category: string;
  aliases: string[];
  layers: LayerKey[];
  focus: Vec3;
  camera: Vec3;
  hotspot: Vec3;
  summary: string;
  anatomy: string;
  signals: string[];
  assessment: string[];
  redFlags: string[];
  metrics: [string, string][];
}

export interface TechniqueContact {
  point: Vec3;
  label: string;
  role: 'contact' | 'stabilize';
}

export interface TechniqueVector {
  from: Vec3;
  to: Vec3;
  label: string;
}

export interface Technique {
  id: string;
  region: RegionId;
  name: string;
  master: string;
  category: string;
  level: string;
  summary: string;
  principle: string;
  contact: string;
  stabilize: string;
  direction: string;
  contraindications: string[];
  camera: Vec3;
  target: Vec3;
  contacts: TechniqueContact[];
  vectors: TechniqueVector[];
}

export interface StructureTerm {
  zh: string;
  aliases: string[];
  patterns: string[];
  region: RegionId;
  layer: LayerKey;
}

export const layerNames: Record<LayerKey, string> = {
  bone: '骨骼',
  muscle: '肌肉',
  tendon: '肌腱',
  ligament: '韧带',
  connection: '手法路径',
};

export const layerColors: Record<LayerKey, string> = {
  bone: '#e8dfcb',
  muscle: '#b84a43',
  tendon: '#e6c46b',
  ligament: '#66d5d0',
  connection: '#56e3c6',
};

export const regionData: RegionContent[] = [
  {
    id: 'cervical',
    title: '颈椎与肩颈链',
    shortTitle: '颈椎问题',
    category: '上颈段 / 颈胸交界',
    aliases: ['颈椎', '脖子', '肩颈', '落枕', '头晕', '手麻', '颈胸交界'],
    layers: ['bone', 'muscle', 'tendon', 'ligament'],
    focus: [0, 2.5, 0],
    camera: [1.3, 2.65, 4.0],
    hotspot: [0.12, 2.48, 0.18],
    summary: '颈椎、第一肋和肩胛带共同承担头颈定位，局部不适常与胸椎活动和上肢神经张力一起出现。',
    anatomy: '七节颈椎通过椎间盘、小关节与韧带稳定；胸锁乳突肌、斜角肌、提肩胛肌和斜方肌上束把颅骨、颈椎、锁骨与肩胛骨连接为一条动力链。',
    signals: ['转头角度左右不对称', '低头后枕部发紧', '肩胛内上角牵扯', '上肢麻胀或放射感'],
    assessment: ['先筛查神经体征和血管风险', '比较颈胸交界与第一肋活动', '观察肩胛位置和呼吸代偿'],
    redFlags: ['外伤后剧烈颈痛', '进行性手脚无力', '眩晕伴语言不清', '大小便功能改变'],
    metrics: [['7节', '颈椎'], ['C5-C7', '常见受累段'], ['3链', '头颈肩联动']],
  },
  {
    id: 'shoulder',
    title: '肩关节与肩袖',
    shortTitle: '肩膀问题',
    category: '肩胛胸廓 / 盂肱关节',
    aliases: ['肩膀', '肩关节', '肩周炎', '肩袖', '冻结肩', '冈上肌', '肩胛骨'],
    layers: ['bone', 'muscle', 'tendon', 'ligament'],
    focus: [0.62, 1.92, 0],
    camera: [2.35, 2.0, 3.45],
    hotspot: [0.72, 1.96, 0.17],
    summary: '肩部是锁骨、肩胛骨、肱骨与胸廓共同工作的复合体，抬手轨迹取决于肩袖和肩胛节律。',
    anatomy: '冈上肌、冈下肌、小圆肌和肩胛下肌包绕肱骨头；三角肌负责抬臂，前锯肌和斜方肌控制肩胛骨上旋，肌腱把肌肉力量传到肱骨。',
    signals: ['侧抬手出现疼痛弧', '夜间压肩疼', '外旋无力', '肩胛骨翘起或节律异常'],
    assessment: ['区分盂肱关节与肩胛胸廓限制', '检查胸椎伸展和锁骨活动', '急性外伤先做肩袖与脱位筛查'],
    redFlags: ['跌倒后不能主动抬臂', '明显畸形或脱位感', '发热红肿', '进行性肌肉萎缩'],
    metrics: [['4块', '肩袖肌群'], ['3关节', '肩复合体'], ['60-120°', '常见疼痛弧']],
  },
  {
    id: 'thoracic-rib',
    title: '胸椎、肋骨与肩胛',
    shortTitle: '胸背问题',
    category: '胸椎 / 肋椎关节',
    aliases: ['胸椎', '肋骨', '胸背', '圆肩', '肩胛内侧', '呼吸'],
    layers: ['bone', 'muscle', 'tendon', 'ligament'],
    focus: [0, 1.45, 0],
    camera: [-1.55, 1.6, 3.65],
    hotspot: [-0.28, 1.48, 0.18],
    summary: '胸廓既参与呼吸，也给肩胛骨提供滑动面；胸椎僵硬可能让颈椎和肩关节承担额外代偿。',
    anatomy: '十二节胸椎通过肋椎关节连接肋骨；斜方肌中下束、菱形肌、前锯肌和胸小肌共同控制肩胛位置与胸廓扩张。',
    signals: ['深呼吸时胸背紧', '肩胛内侧疼', '长期圆肩', '胸椎伸展或旋转受限'],
    assessment: ['观察胸椎伸展与旋转', '比较两侧肋骨桶柄运动', '同步评估肩胛和呼吸模式'],
    redFlags: ['胸痛伴气短出汗', '外伤后呼吸痛', '发热咳血', '不明原因持续夜痛'],
    metrics: [['12节', '胸椎'], ['12对', '肋骨'], ['肩胛', '胸廓滑动面']],
  },
  {
    id: 'lumbar-disc',
    title: '腰椎间盘与坐骨链',
    shortTitle: '腰椎间盘',
    category: '腰骶段 / 神经根',
    aliases: ['腰椎', '腰间盘', '腰椎间盘突出', '腰痛', '坐骨神经', '腿麻', '腰突'],
    layers: ['bone', 'muscle', 'tendon', 'ligament'],
    focus: [0, 0.82, 0],
    camera: [1.35, 0.95, 3.35],
    hotspot: [0.1, 0.84, 0.18],
    summary: '腰椎症状可能来自椎间盘、神经根、小关节、筋膜与髋周肌群，影像“突出”不等于症状来源。',
    anatomy: '五节腰椎承担躯干负荷，椎间盘缓冲压力；多裂肌、竖脊肌、腰方肌和髂腰肌形成主动稳定系统，并与骨盆和髋关节共同传力。',
    signals: ['弯腰或咳嗽时腿痛加重', '臀部到小腿牵涉', '久坐后起身困难', '腰盆髋控制差'],
    assessment: ['区分椎间盘源、关节源和肌筋膜源', '检查感觉、肌力、反射和神经张力', '急性放射痛以减压和转诊评估优先'],
    redFlags: ['大小便障碍', '鞍区麻木', '脚下垂', '夜间痛伴发热或体重下降'],
    metrics: [['L4-S1', '高发节段'], ['5节', '腰椎'], ['2链', '腰盆髋联动']],
  },
  {
    id: 'pelvis',
    title: '骨盆与骶髂关节',
    shortTitle: '骨盆问题',
    category: '骶髂 / 髋周稳定',
    aliases: ['骨盆', '骶髂', '髋', '胯', '盆骨', '臀部痛', '骨盆旋转'],
    layers: ['bone', 'muscle', 'tendon', 'ligament'],
    focus: [0, 0.3, 0],
    camera: [1.75, 0.48, 3.15],
    hotspot: [-0.34, 0.4, 0.17],
    summary: '骨盆是脊柱和下肢之间的力学枢纽，骶髂关节、髋关节与臀肌共同影响站立和步态。',
    anatomy: '髂骨、坐骨、耻骨与骶骨组成骨盆环；强韧的骶髂韧带提供被动稳定，臀中肌、深层外旋肌和腹壁提供主动稳定。',
    signals: ['单腿站立骨盆下沉', '久坐后臀深部痛', '一侧髋外侧酸', '腰骶交界反复卡顿感'],
    assessment: ['观察骨盆前后倾和旋转', '检查髋内外旋与单腿稳定', '结合臀中肌和躯干控制判断功能性问题'],
    redFlags: ['外伤后无法负重', '髋部持续夜间痛', '发热或感染迹象', '肿瘤病史伴新发骨痛'],
    metrics: [['2侧', '骶髂关节'], ['1环', '骨盆闭合结构'], ['臀中肌', '关键稳定肌']],
  },
  {
    id: 'leg-length',
    title: '长短腿与下肢力线',
    shortTitle: '长短腿',
    category: '结构性 / 功能性',
    aliases: ['长短腿', '腿长差', '骨盆倾斜', '高低肩', '步态', '下肢力线'],
    layers: ['bone', 'muscle', 'connection'],
    focus: [0, -0.55, 0],
    camera: [0.25, -0.05, 5.1],
    hotspot: [0.52, -1.02, 0.16],
    summary: '长短腿需区分骨性长度差和骨盆、髋膝踝、足弓代偿造成的功能性差异，单看站姿容易误判。',
    anatomy: '下肢长度由股骨、胫骨与足踝支撑决定；功能性差异常与骨盆旋转、髋外展肌控制、膝过伸或足内旋有关。',
    signals: ['裤脚长度长期不一致', '站立时一侧骨盆更高', '走路身体左右摆动', '单侧腰髋膝踝反复劳损'],
    assessment: ['仰卧、俯卧和站立交叉判断', '观察骨盆旋转、膝伸展和足弓', '疑似结构性差异时以影像测量确认'],
    redFlags: ['儿童进行性跛行', '外伤后突然腿长改变', '髋膝踝明显畸形', '疼痛伴无法负重'],
    metrics: [['骨性', '真实长度差'], ['功能性', '姿势代偿'], ['ASIS-踝', '常用测量线']],
  },
  {
    id: 'knee',
    title: '膝关节与髌股轨迹',
    shortTitle: '膝盖问题',
    category: '髌股 / 胫股关节',
    aliases: ['膝盖', '膝关节', '半月板', '交叉韧带', '髌骨', '跑步膝'],
    layers: ['bone', 'muscle', 'tendon', 'ligament'],
    focus: [0.42, -0.74, 0],
    camera: [1.45, -0.58, 2.85],
    hotspot: [0.44, -0.73, 0.18],
    summary: '膝关节承接髋和足踝力线，髌骨轨迹、股四头肌、腘绳肌与韧带稳定性共同决定负重表现。',
    anatomy: '股骨髁、胫骨平台和髌骨构成骨性基础；交叉韧带控制前后滑动，侧副韧带控制侧向稳定，髌腱负责传递伸膝力量。',
    signals: ['上下楼前膝痛', '弹响伴卡住', '扭伤后肿胀', '深蹲时膝内扣'],
    assessment: ['先看髋膝踝整体力线', '急性扭伤筛查韧带和半月板', '评估髌骨轨迹与股四头肌控制'],
    redFlags: ['扭伤后快速肿胀', '不能伸直或锁住', '无法负重四步', '小腿肿胀疼痛'],
    metrics: [['4韧带', '主要稳定结构'], ['髌腱', '伸膝传力'], ['髋-膝-踝', '下肢力线']],
  },
  {
    id: 'achilles',
    title: '踝关节与跟腱',
    shortTitle: '跟腱足踝',
    category: '距小腿 / 小腿后侧链',
    aliases: ['跟腱', '脚踝', '踝关节', '足底', '扭脚', '足弓', '背屈'],
    layers: ['bone', 'muscle', 'tendon', 'ligament'],
    focus: [0.43, -1.8, 0],
    camera: [1.18, -1.52, 2.65],
    hotspot: [0.44, -1.76, -0.04],
    summary: '跟腱把腓肠肌和比目鱼肌力量传到跟骨；踝背屈受限会改变深蹲、走路和跑跳的力线。',
    anatomy: '腓肠肌与比目鱼肌汇成跟腱附着于跟骨；胫腓骨构成踝穴，距骨在其中滑动，外侧韧带与三角韧带限制过度翻转。',
    signals: ['晨起跟腱僵硬', '踝背屈左右差异', '跑跳后跟腱疼', '反复扭踝或足弓塌陷'],
    assessment: ['区分肌腱中段和附着点问题', '比较屈膝与伸膝位背屈', '结合足弓、胫骨旋转和小腿力量'],
    redFlags: ['突然啪响后无法踮脚', '明显凹陷或肿胀', '小腿红肿发热', '外伤后骨性压痛'],
    metrics: [['跟骨', '跟腱止点'], ['3肌头', '小腿三头肌'], ['背屈', '关键活动度']],
  },
];

export const techniques: Technique[] = [
  {
    id: 'ct-junction-mobilization', region: 'cervical', name: '颈胸交界低幅松动', master: '通用教学演示',
    category: '关节松动', level: '专业评估后使用',
    summary: '以低幅、可控的方向性负荷改善颈胸交界活动，演示不包含高速旋转扳动。',
    principle: '固定肩胛带后，在 C7-T2 附近施加小幅分离与伸展方向，引导受限节段而不把旋转压力集中到上颈段。',
    contact: '主接触：颈胸交界棘突旁', stabilize: '稳定：同侧肩胛带与上胸廓', direction: '前上方低幅引导，配合呼气',
    contraindications: ['近期外伤或骨折风险', '进行性神经症状', '椎动脉相关症状', '严重骨质疏松'],
    camera: [1.65, 2.5, -3.55], target: [0, 2.37, -0.14],
    contacts: [{ point: [0.08, 2.4, -0.29], label: '主接触', role: 'contact' }, { point: [0.48, 2.12, -0.2], label: '肩胛稳定', role: 'stabilize' }],
    vectors: [{ from: [0.48, 2.53, -0.52], to: [0.1, 2.42, -0.28], label: '低幅前上引导' }],
  },
  {
    id: 'scapulothoracic-mobilization', region: 'shoulder', name: '肩胛胸廓节律松动', master: '通用教学演示',
    category: '肩胛带松动', level: '低幅演示',
    summary: '围绕肩胛骨上旋、后倾和内收方向做节律引导，强调肩胛与肱骨协同。',
    principle: '一手稳定肩峰，另一接触肩胛下角，使肩胛骨沿胸廓滑动；目标是恢复肩胛节律，而不是强拉盂肱关节。',
    contact: '主接触：肩胛下角与内侧缘', stabilize: '稳定：肩峰与锁骨外侧', direction: '上外旋并轻度后倾',
    contraindications: ['疑似骨折或脱位', '急性肩袖撕裂', '明显红肿发热', '术后未获医生许可'],
    camera: [2.35, 1.9, -3.4], target: [0.55, 1.75, -0.12],
    contacts: [{ point: [0.5, 1.58, -0.28], label: '肩胛下角', role: 'contact' }, { point: [0.78, 2.03, -0.18], label: '肩峰稳定', role: 'stabilize' }],
    vectors: [{ from: [0.34, 1.38, -0.42], to: [0.56, 1.72, -0.27], label: '上旋方向' }],
  },
  {
    id: 'thoracic-breath-mobilization', region: 'thoracic-rib', name: '胸椎呼吸配合松动', master: '通用教学演示',
    category: '胸廓松动', level: '低幅演示',
    summary: '利用呼气阶段胸廓张力下降的窗口，对胸椎和肋椎关节做小幅引导。',
    principle: '接触受限节段旁的肋椎区域，呼气时沿肋骨回落方向轻度加压，吸气时减压，让呼吸成为自然的节律反馈。',
    contact: '主接触：胸椎旁肋椎关节', stabilize: '稳定：对侧胸廓', direction: '随呼气向前内侧',
    contraindications: ['胸痛原因未明', '近期肋骨骨折', '呼吸困难', '感染或发热'],
    camera: [-1.55, 1.55, -3.5], target: [-0.18, 1.45, -0.14],
    contacts: [{ point: [-0.24, 1.45, -0.3], label: '肋椎接触', role: 'contact' }, { point: [0.3, 1.52, -0.2], label: '对侧稳定', role: 'stabilize' }],
    vectors: [{ from: [-0.58, 1.55, -0.55], to: [-0.25, 1.46, -0.29], label: '呼气加压方向' }],
  },
  {
    id: 'lumbosacral-decompression', region: 'lumbar-disc', name: '腰骶减压牵伸', master: '通用教学演示',
    category: '减压 / 牵伸', level: '症状监测下使用',
    summary: '通过骨盆与下胸段反向稳定形成温和纵向减压，适合展示腰盆髋受力关系。',
    principle: '保持腰椎中立，以骨盆和胸廓为两个稳定端产生低负荷长轴分离；若放射症状向远端扩散应立即停止。',
    contact: '主接触：髂嵴后方', stabilize: '稳定：下胸段', direction: '沿脊柱长轴向尾侧',
    contraindications: ['马尾综合征信号', '急性骨折或肿瘤风险', '症状进行性远端化', '腹主动脉瘤风险'],
    camera: [1.5, 0.85, -3.15], target: [0, 0.78, -0.13],
    contacts: [{ point: [0.23, 0.42, -0.31], label: '髂嵴接触', role: 'contact' }, { point: [-0.18, 1.28, -0.28], label: '下胸稳定', role: 'stabilize' }],
    vectors: [{ from: [0.24, 0.72, -0.48], to: [0.24, 0.4, -0.3], label: '尾侧减压' }],
  },
  {
    id: 'sacroiliac-guided-mobilization', region: 'pelvis', name: '骶髂关节定位松动', master: '通用教学演示',
    category: '骨盆环松动', level: '低幅演示',
    summary: '在骨盆环整体评估基础上，以骶骨和髂骨为接触面做低幅方向性引导。',
    principle: '骶髂关节活动幅度很小，手法目的在于感觉与负荷调节，而不是把骨盆“掰回去”；效果应由症状和功能复测确认。',
    contact: '主接触：髂后上棘内侧', stabilize: '稳定：对侧髂骨', direction: '向前内侧微幅引导',
    contraindications: ['妊娠相关高风险', '骨盆骨折', '炎症性骶髂关节病活动期', '严重骨质疏松'],
    camera: [1.75, 0.36, -3.0], target: [0, 0.28, -0.14],
    contacts: [{ point: [0.31, 0.34, -0.31], label: '髂后上棘', role: 'contact' }, { point: [-0.34, 0.3, -0.25], label: '对侧稳定', role: 'stabilize' }],
    vectors: [{ from: [0.62, 0.43, -0.53], to: [0.32, 0.35, -0.3], label: '前内侧引导' }],
  },
  {
    id: 'functional-leg-length-assessment', region: 'leg-length', name: '功能性长短腿三位评估', master: '通用教学演示',
    category: '体态与测量', level: '评估演示',
    summary: '把仰卧、站立和步态结果交叉验证，避免只凭脚跟高低判断长短腿。',
    principle: '结构性差异来自骨长度，功能性差异常由骨盆旋转、髋膝位置和足弓造成；手法前后必须用同一标志点复测。',
    contact: '测量起点：髂前上棘', stabilize: '测量终点：内踝与足跟', direction: '双侧同路径对比，不强行拉齐',
    contraindications: ['外伤后突然出现腿长变化', '儿童进行性跛行', '髋膝踝明显畸形', '无法负重或剧烈疼痛'],
    camera: [0.3, -0.05, 5.0], target: [0, -0.55, 0],
    contacts: [{ point: [0.42, 0.28, 0.2], label: '髂前上棘', role: 'contact' }, { point: [0.35, -2.02, 0.2], label: '内踝', role: 'stabilize' }],
    vectors: [
      { from: [0.42, 0.28, 0.3], to: [0.35, -2.02, 0.3], label: '右侧测量线' },
      { from: [-0.42, 0.28, 0.3], to: [-0.35, -2.02, 0.3], label: '左侧测量线' },
    ],
  },
  {
    id: 'patellofemoral-glide', region: 'knee', name: '髌股轨迹引导', master: '通用教学演示',
    category: '关节滑动', level: '低负荷演示',
    summary: '在股四头肌放松位观察髌骨内外侧滑动，并结合髋膝踝力线复测。',
    principle: '髌骨在股骨滑车内随屈伸移动；轻柔滑动用于评估与减敏，真正改善仍依赖股四头肌、髋外展和动作控制。',
    contact: '主接触：髌骨内外缘', stabilize: '稳定：股骨远端', direction: '以内外侧小幅滑动为主',
    contraindications: ['急性脱位或骨折', '明显关节积液', '感染性关节炎风险', '术后限制期'],
    camera: [1.45, -0.58, 2.7], target: [0.43, -0.75, 0.06],
    contacts: [{ point: [0.43, -0.74, 0.2], label: '髌骨接触', role: 'contact' }, { point: [0.43, -0.48, 0.12], label: '股骨稳定', role: 'stabilize' }],
    vectors: [{ from: [0.7, -0.74, 0.31], to: [0.46, -0.74, 0.2], label: '内侧滑动' }],
  },
  {
    id: 'ankle-dorsiflexion-mobilization', region: 'achilles', name: '踝背屈关节松动', master: '通用教学演示',
    category: '距小腿关节松动', level: '低幅演示',
    summary: '稳定胫腓骨后，引导距骨后滑，帮助展示踝背屈与跟腱、小腿后侧链的关系。',
    principle: '闭链背屈时胫骨向前移动，距骨需要相对后滑；手法方向应与足部稳定和膝盖轨迹配合。',
    contact: '主接触：距骨颈前方', stabilize: '稳定：胫腓骨远端', direction: '距骨向后，胫骨向前',
    contraindications: ['急性骨折或严重扭伤', '跟腱断裂疑虑', '明显肿胀发热', '无法负重'],
    camera: [1.35, -1.62, -2.55], target: [0.43, -1.82, -0.08],
    contacts: [{ point: [0.43, -1.9, -0.16], label: '距骨接触', role: 'contact' }, { point: [0.43, -1.58, -0.15], label: '小腿稳定', role: 'stabilize' }],
    vectors: [{ from: [0.43, -1.86, 0.12], to: [0.43, -1.91, -0.16], label: '距骨后滑' }],
  },
];

export const structureTerms: StructureTerm[] = [
  { zh: '颈椎', aliases: ['C1', '寰椎', '枢椎'], patterns: ['cervical vertebra', 'atlas', 'axis'], region: 'cervical', layer: 'bone' },
  { zh: '胸锁乳突肌', aliases: ['胸锁乳突'], patterns: ['sternocleidomastoid'], region: 'cervical', layer: 'muscle' },
  { zh: '斜角肌', aliases: ['前斜角肌', '中斜角肌'], patterns: ['scalene'], region: 'cervical', layer: 'muscle' },
  { zh: '提肩胛肌', aliases: ['提肩胛'], patterns: ['levator scapulae'], region: 'cervical', layer: 'muscle' },
  { zh: '锁骨', aliases: [], patterns: ['clavicle'], region: 'shoulder', layer: 'bone' },
  { zh: '肩胛骨', aliases: ['肩胛'], patterns: ['scapula'], region: 'shoulder', layer: 'bone' },
  { zh: '肱骨', aliases: [], patterns: ['humerus'], region: 'shoulder', layer: 'bone' },
  { zh: '三角肌', aliases: [], patterns: ['deltoid'], region: 'shoulder', layer: 'muscle' },
  { zh: '冈上肌', aliases: ['肩袖'], patterns: ['supraspinatus'], region: 'shoulder', layer: 'muscle' },
  { zh: '冈下肌', aliases: ['肩袖'], patterns: ['infraspinatus'], region: 'shoulder', layer: 'muscle' },
  { zh: '小圆肌', aliases: ['肩袖'], patterns: ['teres minor'], region: 'shoulder', layer: 'muscle' },
  { zh: '肩胛下肌', aliases: ['肩袖'], patterns: ['subscapularis'], region: 'shoulder', layer: 'muscle' },
  { zh: '胸大肌', aliases: [], patterns: ['pectoralis major'], region: 'shoulder', layer: 'muscle' },
  { zh: '前锯肌', aliases: [], patterns: ['serratus anterior'], region: 'thoracic-rib', layer: 'muscle' },
  { zh: '斜方肌', aliases: [], patterns: ['trapezius'], region: 'thoracic-rib', layer: 'muscle' },
  { zh: '菱形肌', aliases: [], patterns: ['rhomboid'], region: 'thoracic-rib', layer: 'muscle' },
  { zh: '胸椎', aliases: [], patterns: ['thoracic vertebra'], region: 'thoracic-rib', layer: 'bone' },
  { zh: '肋骨', aliases: [], patterns: ['rib '], region: 'thoracic-rib', layer: 'bone' },
  { zh: '腰椎', aliases: ['L4', 'L5'], patterns: ['lumbar vertebra'], region: 'lumbar-disc', layer: 'bone' },
  { zh: '竖脊肌', aliases: [], patterns: ['erector spinae'], region: 'lumbar-disc', layer: 'muscle' },
  { zh: '腰方肌', aliases: [], patterns: ['quadratus lumborum'], region: 'lumbar-disc', layer: 'muscle' },
  { zh: '多裂肌', aliases: [], patterns: ['multifidus'], region: 'lumbar-disc', layer: 'muscle' },
  { zh: '骶骨', aliases: [], patterns: ['sacrum'], region: 'pelvis', layer: 'bone' },
  { zh: '髂骨', aliases: [], patterns: ['ilium'], region: 'pelvis', layer: 'bone' },
  { zh: '臀中肌', aliases: [], patterns: ['gluteus medius'], region: 'pelvis', layer: 'muscle' },
  { zh: '梨状肌', aliases: [], patterns: ['piriformis'], region: 'pelvis', layer: 'muscle' },
  { zh: '股骨', aliases: [], patterns: ['femur'], region: 'leg-length', layer: 'bone' },
  { zh: '髌骨', aliases: [], patterns: ['patella'], region: 'knee', layer: 'bone' },
  { zh: '股四头肌', aliases: ['股直肌'], patterns: ['quadriceps', 'rectus femoris', 'vastus'], region: 'knee', layer: 'muscle' },
  { zh: '腘绳肌', aliases: ['腿后侧肌群'], patterns: ['biceps femoris', 'semitendinosus', 'semimembranosus'], region: 'knee', layer: 'muscle' },
  { zh: '胫骨', aliases: [], patterns: ['tibia'], region: 'knee', layer: 'bone' },
  { zh: '腓骨', aliases: [], patterns: ['fibula'], region: 'knee', layer: 'bone' },
  { zh: '腓肠肌', aliases: ['小腿肚'], patterns: ['gastrocnemius'], region: 'achilles', layer: 'muscle' },
  { zh: '比目鱼肌', aliases: [], patterns: ['soleus'], region: 'achilles', layer: 'muscle' },
  { zh: '跟腱', aliases: ['阿基里斯腱'], patterns: ['achilles', 'calcaneal tendon'], region: 'achilles', layer: 'tendon' },
  { zh: '跟骨', aliases: [], patterns: ['calcaneus'], region: 'achilles', layer: 'bone' },
];
