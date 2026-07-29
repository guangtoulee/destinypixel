"use client";

import {
  Activity,
  ArrowLeft,
  Bell,
  Building2,
  CalendarCheck,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Cloud,
  CloudOff,
  Compass,
  Download,
  FileText,
  Filter,
  Gauge,
  Home,
  LocateFixed,
  LogOut,
  Mail,
  Map,
  MapPin,
  Menu,
  MessageSquare,
  Navigation,
  PackageCheck,
  Phone,
  Plus,
  RefreshCw,
  Route,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Target,
  Trash2,
  TrendingUp,
  UserRound,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  ChangeEvent,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type SalesLanguage,
  translateSalesCopy,
} from "./i18n";

type Screen =
  | "home"
  | "stores"
  | "store-detail"
  | "planned"
  | "today"
  | "activities"
  | "settings"
  | "visit"
  | "orders"
  | "new-order"
  | "messages";

type StoreRecord = {
  id: number;
  name: string;
  shortName: string;
  address: string;
  city: string;
  channel: string;
  tier: "A" | "B" | "C";
  distance: number;
  dueDays: number;
  contact: string;
  phone: string;
  status: "待拜访" | "已预约" | "已完成";
  lastVisit: string;
  sales: string;
  products: string[];
};

type Product = {
  id: string;
  name: string;
  spec: string;
  price: number;
  image: string;
  color: string;
};

type OrderRecord = {
  id: string;
  store: string;
  time: string;
  amount: number;
  status: "待审核" | "已确认" | "已发货";
  pieces: number;
};

const stores: StoreRecord[] = [
  {
    id: 1,
    name: "Ole' 精品超市 · 静安嘉里中心",
    shortName: "OL",
    address: "南京西路 1515 号 B1",
    city: "上海",
    channel: "精品商超",
    tier: "A",
    distance: 1.2,
    dueDays: 0,
    contact: "陈佳",
    phone: "138 **** 6682",
    status: "已预约",
    lastVisit: "7月18日",
    sales: "¥18,620",
    products: ["Jake Mints", "VitaminCandy"],
  },
  {
    id: 2,
    name: "CitySuper · 国金中心店",
    shortName: "CS",
    address: "世纪大道 8 号 LG2",
    city: "上海",
    channel: "精品商超",
    tier: "A",
    distance: 3.8,
    dueDays: 2,
    contact: "王琳",
    phone: "186 **** 1093",
    status: "待拜访",
    lastVisit: "7月09日",
    sales: "¥23,480",
    products: ["Whole Sleep", "Jake Mints"],
  },
  {
    id: 3,
    name: "全家便利店 · 淮海中路店",
    shortName: "FM",
    address: "淮海中路 717 号",
    city: "上海",
    channel: "便利店",
    tier: "B",
    distance: 2.6,
    dueDays: 3,
    contact: "刘店长",
    phone: "177 **** 2240",
    status: "待拜访",
    lastVisit: "7月06日",
    sales: "¥8,320",
    products: ["Jake Mints"],
  },
  {
    id: 4,
    name: "华氏大药房 · 徐家汇店",
    shortName: "HS",
    address: "肇嘉浜路 1065 号",
    city: "上海",
    channel: "连锁药房",
    tier: "A",
    distance: 6.4,
    dueDays: 5,
    contact: "周药师",
    phone: "139 **** 5018",
    status: "待拜访",
    lastVisit: "6月29日",
    sales: "¥12,960",
    products: ["Whole Sleep", "Whole Gastro"],
  },
  {
    id: 5,
    name: "盒马鲜生 · 长宁来福士店",
    shortName: "HM",
    address: "长宁路 1123 号 B1",
    city: "上海",
    channel: "新零售",
    tier: "A",
    distance: 7.9,
    dueDays: 8,
    contact: "徐阳",
    phone: "150 **** 7931",
    status: "待拜访",
    lastVisit: "6月25日",
    sales: "¥16,870",
    products: ["VitaminCandy", "Jake Infinity"],
  },
  {
    id: 6,
    name: "久光百货 · 食品馆",
    shortName: "JG",
    address: "南京西路 1618 号 B1",
    city: "上海",
    channel: "百货",
    tier: "B",
    distance: 1.6,
    dueDays: 12,
    contact: "赵经理",
    phone: "135 **** 9310",
    status: "待拜访",
    lastVisit: "6月18日",
    sales: "¥6,540",
    products: ["VitaminCandy"],
  },
];

const products: Product[] = [
  {
    id: "mints",
    name: "Jake Mints 薄荷含片",
    spec: "Peppermint · 14.4g × 12盒",
    price: 238,
    image: "/candy/jake-mints.jpg",
    color: "#d7efff",
  },
  {
    id: "vitamin",
    name: "Jake VitaminCandy",
    spec: "柑橘风味 · 18g × 12盒",
    price: 298,
    image: "/candy/jake-candy.jpg",
    color: "#fff0dc",
  },
  {
    id: "sleep",
    name: "Whole Sleep 睡眠含片",
    spec: "15片 × 10盒",
    price: 569,
    image: "/candy/whole-sleep.jpg",
    color: "#f5ead1",
  },
  {
    id: "gastro",
    name: "Whole Gastro 餐后含片",
    spec: "12片 × 10盒",
    price: 529,
    image: "/candy/whole-gastro.png",
    color: "#e0f1f4",
  },
];

const initialOrders: OrderRecord[] = [
  {
    id: "SO20260726018",
    store: "CitySuper · 国金中心店",
    time: "今天 10:26",
    amount: 3428,
    status: "待审核",
    pieces: 6,
  },
  {
    id: "SO20260725009",
    store: "Ole' 精品超市 · 静安嘉里中心",
    time: "昨天 16:42",
    amount: 5712,
    status: "已确认",
    pieces: 11,
  },
  {
    id: "SO20260723031",
    store: "盒马鲜生 · 长宁来福士店",
    time: "7月23日 14:18",
    amount: 2384,
    status: "已发货",
    pieces: 8,
  },
];

const dashboardTiles: {
  screen: Screen;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  tone: string;
  count?: string;
}[] = [
  {
    screen: "stores",
    title: "门店",
    subtitle: "客户档案与地图",
    icon: Store,
    tone: "green",
    count: "128",
  },
  {
    screen: "visit",
    title: "开始拜访",
    subtitle: "签到、陈列与下单",
    icon: LocateFixed,
    tone: "blue",
  },
  {
    screen: "planned",
    title: "计划拜访",
    subtitle: "路线与逾期提醒",
    icon: Route,
    tone: "red",
    count: "12",
  },
  {
    screen: "today",
    title: "今日拜访",
    subtitle: "3 家待完成",
    icon: CalendarCheck,
    tone: "rose",
    count: "3",
  },
  {
    screen: "activities",
    title: "工作台",
    subtitle: "目标与销售活动",
    icon: Activity,
    tone: "violet",
  },
  {
    screen: "settings",
    title: "设置",
    subtitle: "同步与通知",
    icon: Settings,
    tone: "orange",
  },
];

const screenTitles: Partial<Record<Screen, string>> = {
  stores: "门店",
  "store-detail": "门店详情",
  planned: "计划拜访",
  today: "今日拜访",
  activities: "销售工作台",
  settings: "设置",
  visit: "拜访执行",
  orders: "订单",
  "new-order": "新建订单",
  messages: "消息中心",
};

const LanguageContext = createContext<SalesLanguage>("zh");

function useSalesTranslation() {
  const language = useContext(LanguageContext);
  return (source: string) => translateSalesCopy(language, source);
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`status-pill ${tone}`}>{children}</span>;
}

function EmptyState({
  title,
  copy,
  button,
  onClick,
}: {
  title: string;
  copy: string;
  button?: string;
  onClick?: () => void;
}) {
  return (
    <div className="empty-state">
      <div className="empty-illustration">
        <ClipboardCheck size={52} strokeWidth={1.45} />
        <span />
      </div>
      <h3>{title}</h3>
      <p>{copy}</p>
      {button && onClick ? (
        <button className="primary-action" onClick={onClick}>
          {button}
        </button>
      ) : null}
    </div>
  );
}

export default function SalesH5() {
  const [language, setLanguage] = useState<SalesLanguage>("zh");
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedStoreId, setSelectedStoreId] = useState(1);
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("全部");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [online, setOnline] = useState(true);
  const [visitStep, setVisitStep] = useState(1);
  const [checkedIn, setCheckedIn] = useState(false);
  const [visitTasks, setVisitTasks] = useState<Record<string, boolean>>({
    display: true,
    price: false,
    inventory: false,
    competitor: false,
  });
  const [visitNote, setVisitNote] = useState("");
  const [photo, setPhoto] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({
    mints: 2,
    vitamin: 1,
    sleep: 0,
    gastro: 0,
  });
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);
  const [distance, setDistance] = useState(15);
  const [sound, setSound] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [completedVisits, setCompletedVisits] = useState(1);
  const [todayFilter, setTodayFilter] = useState<"全部" | "待完成" | "已完成">("全部");

  const selectedStore = stores.find((store) => store.id === selectedStoreId) ?? stores[0];
  const t = (source: string) => translateSalesCopy(language, source);

  useEffect(() => {
    const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
    const savedLanguage = window.localStorage.getItem("packom-sales-language");
    const savedOrders = window.localStorage.getItem("packom-sales-orders");
    const savedSettings = window.localStorage.getItem("packom-sales-settings");
    if (requestedLanguage === "en" || requestedLanguage === "zh") {
      setLanguage(requestedLanguage);
    } else if (savedLanguage === "en" || savedLanguage === "zh") {
      setLanguage(savedLanguage);
    }
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders) as OrderRecord[]);
      } catch {
        // Keep seeded demo data when a stale browser value cannot be parsed.
      }
    }
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings) as {
          distance?: number;
          sound?: boolean;
          autoSync?: boolean;
        };
        if (typeof parsed.distance === "number") setDistance(parsed.distance);
        if (typeof parsed.sound === "boolean") setSound(parsed.sound);
        if (typeof parsed.autoSync === "boolean") setAutoSync(parsed.autoSync);
      } catch {
        // Keep defaults.
      }
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredStores = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return stores.filter((store) => {
      const matchText =
        !keyword ||
        store.name.toLowerCase().includes(keyword) ||
        translateSalesCopy(language, store.name).toLowerCase().includes(keyword) ||
        store.address.toLowerCase().includes(keyword) ||
        translateSalesCopy(language, store.address).toLowerCase().includes(keyword) ||
        store.contact.toLowerCase().includes(keyword) ||
        translateSalesCopy(language, store.contact).toLowerCase().includes(keyword);
      const matchChannel = channel === "全部" || store.channel === channel;
      return matchText && matchChannel && store.distance <= distance;
    });
  }, [search, channel, distance, language]);

  const orderTotal = products.reduce(
    (total, product) => total + product.price * (quantities[product.id] ?? 0),
    0,
  );
  const orderPieces = Object.values(quantities).reduce((total, quantity) => total + quantity, 0);

  const navigate = (next: Screen) => {
    if (next === "visit") {
      setVisitStep(1);
      setCheckedIn(false);
      setPhoto("");
      setVisitNote("");
    }
    setMenuOpen(false);
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const goBack = () => {
    const backMap: Partial<Record<Screen, Screen>> = {
      stores: "home",
      "store-detail": "stores",
      planned: "home",
      today: "home",
      activities: "home",
      settings: "home",
      visit: "today",
      orders: "home",
      "new-order": "orders",
      messages: "home",
    };
    navigate(backMap[screen] ?? "home");
  };

  const openStore = (id: number) => {
    setSelectedStoreId(id);
    navigate("store-detail");
  };

  const startVisit = (id = selectedStoreId) => {
    setSelectedStoreId(id);
    navigate("visit");
  };

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhoto(URL.createObjectURL(file));
    setToast(t("照片已添加到本次拜访"));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setQuantities((current) => ({
      ...current,
      [productId]: Math.max(0, (current[productId] ?? 0) + delta),
    }));
  };

  const submitOrder = () => {
    if (!orderPieces) {
      setToast(t("请先选择至少一件商品"));
      return;
    }
    const nextOrder: OrderRecord = {
      id: `SO20260726${String(orders.length + 19).padStart(3, "0")}`,
      store: selectedStore.name,
      time: "刚刚",
      amount: orderTotal,
      status: "待审核",
      pieces: orderPieces,
    };
    const nextOrders = [nextOrder, ...orders];
    setOrders(nextOrders);
    window.localStorage.setItem("packom-sales-orders", JSON.stringify(nextOrders));
    setToast(t("订单已提交，等待审核"));
    navigate("orders");
  };

  const finishVisit = () => {
    setCompletedVisits((value) => Math.min(3, value + 1));
    setToast(t("拜访记录已完成并进入同步队列"));
    navigate("today");
  };

  const saveSettings = () => {
    window.localStorage.setItem(
      "packom-sales-settings",
      JSON.stringify({ distance, sound, autoSync }),
    );
    setToast(t("设置已保存"));
  };

  const toggleLanguage = () => {
    setLanguage((current) => {
      const next = current === "zh" ? "en" : "zh";
      window.localStorage.setItem("packom-sales-language", next);
      const url = new URL(window.location.href);
      url.searchParams.set("lang", next);
      window.history.replaceState({}, "", url);
      return next;
    });
  };

  return (
    <LanguageContext.Provider value={language}>
    <main className="sales-page" lang={language === "en" ? "en" : "zh-CN"} data-language={language}>
      <div className="sales-backdrop" aria-hidden="true">
        <div className="backdrop-copy">
          <span>PACKOM / CHINA</span>
          <strong>{t("让每一次到店，")}<br />{t("都有清晰结果。")}</strong>
          <p>{t("门店 · 拜访 · 陈列 · 订单 · 数据")}</p>
        </div>
      </div>

      <div className="sales-shell">
        {screen === "home" ? (
          <DashboardHeader
            online={online}
            language={language}
            onMessages={() => navigate("messages")}
            onMenu={() => setMenuOpen(true)}
            onLanguage={toggleLanguage}
          />
        ) : (
          <AppHeader
            title={t(screenTitles[screen] ?? "Packom 销售通")}
            subtitle={screen === "visit" ? t(selectedStore.name) : undefined}
            language={language}
            onBack={goBack}
            onLanguage={toggleLanguage}
            right={
              screen === "stores" ? (
                <button className="header-icon" aria-label={t("筛选门店")}>
                  <Filter size={20} />
                </button>
              ) : screen === "settings" ? (
                <button className="header-text" onClick={saveSettings}>
                  {t("保存")}
                </button>
              ) : undefined
            }
          />
        )}

        <div className={cn("sales-content", screen === "home" && "home-content")}>
          {screen === "home" && (
            <HomeScreen
              tiles={dashboardTiles}
              completedVisits={completedVisits}
              online={online}
              onNavigate={navigate}
              onStore={openStore}
            />
          )}

          {screen === "stores" && (
            <StoresScreen
              stores={filteredStores}
              search={search}
              channel={channel}
              distance={distance}
              onSearch={setSearch}
              onChannel={setChannel}
              onOpen={openStore}
            />
          )}

          {screen === "store-detail" && (
            <StoreDetail
              store={selectedStore}
              onVisit={() => startVisit(selectedStore.id)}
              onOrder={() => navigate("new-order")}
              onToast={setToast}
            />
          )}

          {screen === "planned" && (
            <PlannedVisits stores={stores} onOpen={openStore} onVisit={startVisit} onToast={setToast} />
          )}

          {screen === "today" && (
            <TodayVisits
              stores={stores.slice(0, 3)}
              completedVisits={completedVisits}
              filter={todayFilter}
              onFilter={setTodayFilter}
              onVisit={startVisit}
              onOpen={openStore}
            />
          )}

          {screen === "activities" && (
            <ActivitiesScreen completedVisits={completedVisits} orders={orders} />
          )}

          {screen === "settings" && (
            <SettingsScreen
              distance={distance}
              sound={sound}
              autoSync={autoSync}
              online={online}
              onDistance={setDistance}
              onSound={setSound}
              onAutoSync={setAutoSync}
              onOnline={setOnline}
              onToast={setToast}
            />
          )}

          {screen === "visit" && (
            <VisitScreen
              store={selectedStore}
              step={visitStep}
              checkedIn={checkedIn}
              tasks={visitTasks}
              photo={photo}
              note={visitNote}
              orderPieces={orderPieces}
              orderTotal={orderTotal}
              onStep={setVisitStep}
              onCheckIn={() => {
                setCheckedIn(true);
                setToast(t("签到成功，定位已记录"));
              }}
              onTask={(key) =>
                setVisitTasks((current) => ({ ...current, [key]: !current[key] }))
              }
              onPhoto={handlePhoto}
              onNote={setVisitNote}
              onOrder={() => navigate("new-order")}
              onFinish={finishVisit}
            />
          )}

          {screen === "orders" && (
            <OrdersScreen orders={orders} onNew={() => navigate("new-order")} />
          )}

          {screen === "new-order" && (
            <NewOrderScreen
              store={selectedStore}
              products={products}
              quantities={quantities}
              total={orderTotal}
              pieces={orderPieces}
              onQuantity={updateQuantity}
              onStore={() => navigate("stores")}
              onSubmit={submitOrder}
            />
          )}

          {screen === "messages" && <MessagesScreen onNavigate={navigate} />}
        </div>

        {!["visit", "new-order"].includes(screen) && (
          <BottomNav screen={screen} onNavigate={navigate} />
        )}

        {menuOpen && (
          <ProfileMenu
            online={online}
            onClose={() => setMenuOpen(false)}
            onNavigate={navigate}
            onLogout={() => setToast(t("演示模式：已安全退出"))}
            onLanguage={toggleLanguage}
            language={language}
          />
        )}

        {toast && (
          <div className="toast" role="status">
            <CheckCircle2 size={18} />
            {toast}
          </div>
        )}
      </div>
    </main>
    </LanguageContext.Provider>
  );
}

function DashboardHeader({
  online,
  language,
  onMessages,
  onMenu,
  onLanguage,
}: {
  online: boolean;
  language: SalesLanguage;
  onMessages: () => void;
  onMenu: () => void;
  onLanguage: () => void;
}) {
  const t = useSalesTranslation();
  return (
    <header className="dashboard-header">
      <div className="dashboard-topline">
        <div className="app-wordmark">
          <span className="wordmark-mark">P</span>
          <span>
            <strong>PACKOM</strong>
            <small>{t("销售通")}</small>
          </span>
        </div>
        <div className="dashboard-actions">
          <button className="language-button" onClick={onLanguage} aria-label={language === "zh" ? "Switch to English" : "切换到中文"}>
            {language === "zh" ? "EN" : "中"}
          </button>
          <button onClick={onMessages} aria-label={t("消息中心")}>
            <Bell size={21} />
            <i>3</i>
          </button>
          <button onClick={onMenu} aria-label={t("个人菜单")}>
            <Menu size={22} />
          </button>
        </div>
      </div>
      <div className="user-greeting">
        <div>
          <span className={cn("sync-state", online ? "online" : "offline")}>
            {online ? <Cloud size={14} /> : <CloudOff size={14} />}
            {online ? t("数据已同步") : t("离线工作中")}
          </span>
          <h1>{t("早上好，李晨")}</h1>
          <p>{t("7月26日 · 上海区域")}</p>
        </div>
        <div className="user-avatar">LC</div>
      </div>
    </header>
  );
}

function AppHeader({
  title,
  subtitle,
  language,
  onBack,
  onLanguage,
  right,
}: {
  title: string;
  subtitle?: string;
  language: SalesLanguage;
  onBack: () => void;
  onLanguage: () => void;
  right?: React.ReactNode;
}) {
  const t = useSalesTranslation();
  return (
    <header className="app-header">
      <button className="header-icon" onClick={onBack} aria-label={t("返回")}>
        <ArrowLeft size={22} />
      </button>
      <div className="app-header-title">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div className="header-right-slot">
        <button className="language-button compact" onClick={onLanguage} aria-label={language === "zh" ? "Switch to English" : "切换到中文"}>
          {language === "zh" ? "EN" : "中"}
        </button>
        {right}
      </div>
    </header>
  );
}

function HomeScreen({
  tiles,
  completedVisits,
  online,
  onNavigate,
  onStore,
}: {
  tiles: typeof dashboardTiles;
  completedVisits: number;
  online: boolean;
  onNavigate: (screen: Screen) => void;
  onStore: (id: number) => void;
}) {
  const t = useSalesTranslation();
  return (
    <>
      <section className="daily-summary">
        <div>
          <span>{t("今日进度")}</span>
          <strong>{completedVisits}<small>/3</small></strong>
          <p>{t("已完成拜访")}</p>
        </div>
        <div className="progress-ring" style={{ "--progress": `${completedVisits / 3}` } as React.CSSProperties}>
          <span>{Math.round((completedVisits / 3) * 100)}%</span>
        </div>
        <div>
          <span>{t("今日订单")}</span>
          <strong>¥3,428</strong>
          <p className="up"><TrendingUp size={13} /> {t("较昨日 +12%")}</p>
        </div>
      </section>

      <section className="module-grid" aria-label={t("主要功能")}>
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              className={`module-tile ${tile.tone}`}
              key={tile.title}
              onClick={() => onNavigate(tile.screen)}
            >
              <span className="tile-icon"><Icon size={24} /></span>
              {tile.count ? <b>{tile.count}</b> : null}
              <strong>{t(tile.title)}</strong>
              <small>{t(tile.subtitle)}</small>
              <ChevronRight className="tile-arrow" size={16} />
            </button>
          );
        })}
      </section>

      <section className="next-visit-card">
        <div className="section-title-row">
          <div>
            <span>{t("下一站")}</span>
            <h2>{t("10:30 · 还有 38 分钟")}</h2>
          </div>
          <button onClick={() => onNavigate("today")}>{t("查看日程")}</button>
        </div>
        <button className="next-store" onClick={() => onStore(1)}>
          <div className="store-monogram">OL</div>
          <div>
            <strong>{t("Ole' 精品超市")}</strong>
            <span><MapPin size={13} /> {t("静安嘉里中心 · 1.2 km")}</span>
          </div>
          <div className="nav-round"><Navigation size={18} /></div>
        </button>
        <div className="visit-objectives">
          <span><CheckCircle2 size={15} /> {t("新品陈列确认")}</span>
          <span><CircleAlert size={15} /> {t("库存低于安全线")}</span>
        </div>
      </section>

      {!online && (
        <div className="offline-banner">
          <CloudOff size={18} />
          {t("当前为离线模式，记录将在网络恢复后自动同步。")}
        </div>
      )}
    </>
  );
}

function StoresScreen({
  stores: visibleStores,
  search,
  channel,
  distance,
  onSearch,
  onChannel,
  onOpen,
}: {
  stores: StoreRecord[];
  search: string;
  channel: string;
  distance: number;
  onSearch: (value: string) => void;
  onChannel: (value: string) => void;
  onOpen: (id: number) => void;
}) {
  const t = useSalesTranslation();
  const language = useContext(LanguageContext);
  const channels = ["全部", "精品商超", "便利店", "连锁药房", "新零售"];
  return (
    <>
      <div className="search-box">
        <Search size={19} />
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={t("搜索门店、地址或联系人")}
          aria-label={t("搜索门店")}
        />
        {search ? (
          <button onClick={() => onSearch("")} aria-label={t("清除搜索")}>
            <X size={16} />
          </button>
        ) : null}
      </div>
      <div className="filter-chips">
        {channels.map((item) => (
          <button
            key={item}
            className={item === channel ? "active" : ""}
            onClick={() => onChannel(item)}
          >
            {t(item)}
          </button>
        ))}
      </div>
      <div className="list-summary">
        <span>
          {language === "en"
            ? `${visibleStores.length} stores · Within ${distance} km`
            : `${visibleStores.length} 家门店 · ${distance} km 内`}
        </span>
        <button><Map size={16} /> {t("地图模式")}</button>
      </div>
      <div className="store-list">
        {visibleStores.map((store) => (
          <StoreCard store={store} key={store.id} onOpen={() => onOpen(store.id)} />
        ))}
      </div>
      {!visibleStores.length ? (
        <EmptyState title={t("没有找到门店")} copy={t("试试调整关键词、渠道或搜索距离。")} />
      ) : null}
    </>
  );
}

function StoreCard({ store, onOpen }: { store: StoreRecord; onOpen: () => void }) {
  const t = useSalesTranslation();
  return (
    <button className="store-card" onClick={onOpen}>
      <div className="store-card-top">
        <div className="store-monogram">{store.shortName}</div>
        <div className="store-main">
          <div className="store-name-line">
            <strong>{t(store.name)}</strong>
            <StatusPill tone={store.tier === "A" ? "blue" : store.tier === "B" ? "violet" : "neutral"}>
              {store.tier}{t("级")}
            </StatusPill>
          </div>
          <p>{t(store.address)}</p>
          <span><MapPin size={13} /> {store.distance} km · {t(store.channel)}</span>
        </div>
        <ChevronRight size={18} className="muted-chevron" />
      </div>
      <div className="store-card-meta">
        <span>{t("上次拜访")} <b>{t(store.lastVisit)}</b></span>
        <span className={store.dueDays > 3 ? "late" : ""}>
          {store.dueDays === 0 ? t("今天应访") : `${t("逾期")} ${store.dueDays} ${t("天")}`}
        </span>
      </div>
    </button>
  );
}

function StoreDetail({
  store,
  onVisit,
  onOrder,
  onToast,
}: {
  store: StoreRecord;
  onVisit: () => void;
  onOrder: () => void;
  onToast: (message: string) => void;
}) {
  const t = useSalesTranslation();
  const language = useContext(LanguageContext);
  return (
    <>
      <section className="store-hero-card">
        <div className="store-hero-main">
          <div className="store-monogram large">{store.shortName}</div>
          <div>
            <div className="inline-pills">
              <StatusPill tone="blue">{store.tier}{t("级门店")}</StatusPill>
              <StatusPill tone="green">{t(store.status)}</StatusPill>
            </div>
            <h2>{t(store.name)}</h2>
            <p><MapPin size={14} /> {t(store.address)}</p>
          </div>
        </div>
        <div className="store-contact-actions">
          <button onClick={() => onToast(t("已复制门店联系电话"))}><Phone size={18} /> {t("致电")}</button>
          <button onClick={() => onToast(t("正在调起地图导航"))}><Navigation size={18} /> {t("导航")}</button>
          <button onClick={() => onToast(t("联系人信息已展开"))}><UserRound size={18} /> {t("联系人")}</button>
        </div>
      </section>

      <section className="store-kpi-row">
        <div><span>{t("近30天销售")}</span><strong>{store.sales}</strong><small>{t("目标完成 82%")}</small></div>
        <div><span>{t("在售SKU")}</span><strong>{store.products.length}</strong><small>{t("建议扩充 2 款")}</small></div>
        <div><span>{t("应收账款")}</span><strong>¥0</strong><small>{t("信用状态良好")}</small></div>
      </section>

      <section className="detail-card">
        <div className="section-title-row compact">
          <div><span>{t("本次拜访")}</span><h2>{t("执行重点")}</h2></div>
          <StatusPill tone="orange">{t("今天 10:30")}</StatusPill>
        </div>
        <ul className="objective-list">
          <li><span><Target size={17} /></span><div><strong>{t("新品陈列确认")}</strong><p>{t("确认 VitaminCandy 端架位置与价格签")}</p></div></li>
          <li><span><PackageCheck size={17} /></span><div><strong>{t("库存盘点")}</strong><p>{t("Jake Mints 当前库存低于两周安全线")}</p></div></li>
          <li><span><MessageSquare size={17} /></span><div><strong>{t("收集反馈")}</strong><p>{t("记录柑橘风味试吃评价和补货意向")}</p></div></li>
        </ul>
      </section>

      <section className="detail-card">
        <div className="section-title-row compact">
          <div><span>{t("门店资料")}</span><h2>{t("客户信息")}</h2></div>
          <button className="text-action">{t("编辑")}</button>
        </div>
        <dl className="info-grid">
          <div><dt>{t("联系人")}</dt><dd>{t(store.contact)}</dd></div>
          <div><dt>{t("联系电话")}</dt><dd>{store.phone}</dd></div>
          <div><dt>{t("渠道类型")}</dt><dd>{t(store.channel)}</dd></div>
          <div><dt>{t("结算方式")}</dt><dd>{t("月结 30 天")}</dd></div>
          <div className="wide"><dt>{t("在售产品")}</dt><dd>{store.products.join(language === "en" ? ", " : "、")}</dd></div>
        </dl>
      </section>

      <div className="sticky-actions">
        <button className="secondary-action" onClick={onOrder}><ShoppingCart size={18} /> {t("新建订单")}</button>
        <button className="primary-action" onClick={onVisit}><LocateFixed size={18} /> {t("开始拜访")}</button>
      </div>
    </>
  );
}

function PlannedVisits({
  stores: allStores,
  onOpen,
  onVisit,
  onToast,
}: {
  stores: StoreRecord[];
  onOpen: (id: number) => void;
  onVisit: (id: number) => void;
  onToast: (message: string) => void;
}) {
  const t = useSalesTranslation();
  const [date, setDate] = useState(0);
  const days = [
    { day: "今天", date: "26" },
    { day: "周一", date: "27" },
    { day: "周二", date: "28" },
    { day: "周三", date: "29" },
    { day: "周四", date: "30" },
  ];
  return (
    <>
      <div className="date-strip">
        {days.map((item, index) => (
          <button className={date === index ? "active" : ""} key={item.date} onClick={() => setDate(index)}>
            <span>{t(item.day)}</span><strong>{item.date}</strong>
          </button>
        ))}
      </div>
      <section className="route-overview">
        <div>
          <span>{t("今日路线")}</span>
          <strong>{t("3 家 · 18.6 km")}</strong>
          <p>{t("预计 4 小时 20 分")}</p>
        </div>
        <div className="route-dots" aria-hidden="true"><i /><i /><i /></div>
        <button onClick={() => onToast(t("路线已按距离和预约时间重新优化"))}>
          <Sparkles size={16} /> {t("智能优化")}
        </button>
      </section>
      <div className="timeline-list">
        {allStores.slice(date ? 2 : 0, date ? 5 : 3).map((store, index) => (
          <article className="timeline-item" key={store.id}>
            <div className="timeline-time">
              <strong>{["10:30", "13:40", "16:10"][index]}</strong>
              <span>{index ? t("预计") : t("已预约")}</span>
            </div>
            <div className="timeline-line"><i>{index + 1}</i></div>
            <div className="timeline-card">
              <button className="timeline-store" onClick={() => onOpen(store.id)}>
                <div className="store-monogram small">{store.shortName}</div>
                <div><strong>{t(store.name)}</strong><span>{t(store.address)}</span></div>
                <ChevronRight size={16} />
              </button>
              <div className="timeline-tags">
                <span>{t("陈列检查")}</span><span>{t("库存盘点")}</span>
              </div>
              <button className="visit-link" onClick={() => onVisit(store.id)}>
                {t("开始拜访")} <ChevronRight size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function TodayVisits({
  stores: todayStores,
  completedVisits,
  filter,
  onFilter,
  onVisit,
  onOpen,
}: {
  stores: StoreRecord[];
  completedVisits: number;
  filter: "全部" | "待完成" | "已完成";
  onFilter: (filter: "全部" | "待完成" | "已完成") => void;
  onVisit: (id: number) => void;
  onOpen: (id: number) => void;
}) {
  const t = useSalesTranslation();
  const language = useContext(LanguageContext);
  const items = todayStores.filter((_, index) => {
    const done = index < completedVisits;
    if (filter === "已完成") return done;
    if (filter === "待完成") return !done;
    return true;
  });
  return (
    <>
      <section className="today-progress">
        <div><span>{t("今日计划")}</span><strong>{t("3 家门店")}</strong></div>
        <div><span>{t("已完成")}</span><strong>{completedVisits} {language === "en" ? "stores" : "家"}</strong></div>
        <div className="linear-progress"><i style={{ width: `${(completedVisits / 3) * 100}%` }} /></div>
      </section>
      <div className="segmented-control">
        {(["全部", "待完成", "已完成"] as const).map((item) => (
          <button className={filter === item ? "active" : ""} key={item} onClick={() => onFilter(item)}>
            {t(item)}
          </button>
        ))}
      </div>
      {items.length ? (
        <div className="today-list">
          {items.map((store) => {
            const index = todayStores.findIndex((item) => item.id === store.id);
            const done = index < completedVisits;
            return (
              <article className={cn("today-card", done && "done")} key={store.id}>
                <div className="today-card-heading">
                  <span className="visit-order">{index + 1}</span>
                  <div><strong>{t(store.name)}</strong><p>{["10:30", "13:40", "16:10"][index]} · {store.distance} km</p></div>
                  {done ? <CheckCircle2 className="done-icon" size={22} /> : <Clock3 size={20} />}
                </div>
                <div className="today-task-row">
                  <span>{t("陈列")}</span><span>{t("库存")}</span><span>{t("店员反馈")}</span>
                </div>
                <div className="today-card-actions">
                  <button onClick={() => onOpen(store.id)}>{t("查看门店")}</button>
                  {!done ? <button onClick={() => onVisit(store.id)}>{t("开始拜访")}</button> : <button>{t("查看记录")}</button>}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={t(filter === "已完成" ? "今天还没有完成记录" : "没有待完成的拜访")}
          copy={t(filter === "已完成" ? "完成一次门店拜访后，记录会显示在这里。" : "今天的计划已经全部完成，辛苦了。")}
          button={filter === "已完成" ? t("查看待完成") : undefined}
          onClick={filter === "已完成" ? () => onFilter("待完成") : undefined}
        />
      )}
    </>
  );
}

function ActivitiesScreen({
  completedVisits,
  orders,
}: {
  completedVisits: number;
  orders: OrderRecord[];
}) {
  const t = useSalesTranslation();
  const total = orders.reduce((sum, order) => sum + order.amount, 0);
  const bars = [42, 58, 38, 72, 64, 86, 76];
  return (
    <>
      <section className="period-card">
        <div><span>{t("本周")}</span><strong>{t("7月20日—26日")}</strong></div>
        <button>{t("周报")} <ChevronDown size={15} /></button>
      </section>
      <section className="activity-kpis">
        <div><span><LocateFixed size={17} /> {t("拜访")}</span><strong>{completedVisits + 7}</strong><small>{t("目标 12 · 67%")}</small></div>
        <div><span><ShoppingBag size={17} /> {t("订单")}</span><strong>{orders.length + 6}</strong><small>{t("转化率 54%")}</small></div>
        <div><span><TrendingUp size={17} /> {t("销售额")}</span><strong>¥{(total + 18640).toLocaleString()}</strong><small className="up">{t("目标完成 78%")}</small></div>
        <div><span><ClipboardCheck size={17} /> {t("任务")}</span><strong>24</strong><small>{t("完成 21 项")}</small></div>
      </section>
      <section className="chart-card">
        <div className="section-title-row compact">
          <div><span>{t("销售趋势")}</span><h2>{t("近 7 日订单金额")}</h2></div>
          <StatusPill tone="green">+16.8%</StatusPill>
        </div>
        <div className="bar-chart">
          {bars.map((height, index) => (
            <div key={index}>
              <i style={{ height: `${height}%` }} />
              <span>{t(["一", "二", "三", "四", "五", "六", "日"][index])}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="detail-card">
        <div className="section-title-row compact">
          <div><span>{t("待办事项")}</span><h2>{t("本周重点")}</h2></div>
          <span className="counter-badge">4</span>
        </div>
        <ul className="task-list">
          <li><span className="task-check done"><Check size={14} /></span><div><strong>{t("完成 A 级门店陈列核查")}</strong><p>{t("8/8 家 · 已完成")}</p></div></li>
          <li><span className="task-check" /><div><strong>{t("收集 Whole Sleep 首轮反馈")}</strong><p>{t("还差 6 份有效问卷")}</p></div><ChevronRight size={16} /></li>
          <li><span className="task-check" /><div><strong>{t("处理 CitySuper 补货申请")}</strong><p>{t("今天 18:00 前")}</p></div><ChevronRight size={16} /></li>
        </ul>
      </section>
    </>
  );
}

function SettingsScreen({
  distance,
  sound,
  autoSync,
  online,
  onDistance,
  onSound,
  onAutoSync,
  onOnline,
  onToast,
}: {
  distance: number;
  sound: boolean;
  autoSync: boolean;
  online: boolean;
  onDistance: (value: number) => void;
  onSound: (value: boolean) => void;
  onAutoSync: (value: boolean) => void;
  onOnline: (value: boolean) => void;
  onToast: (message: string) => void;
}) {
  const t = useSalesTranslation();
  return (
    <>
      <section className="settings-profile">
        <div className="user-avatar large">LC</div>
        <div><strong>{t("李晨")}</strong><span>{t("上海区域 · 城市经理")}</span></div>
        <StatusPill tone={online ? "green" : "orange"}>{online ? t("在线") : t("离线")}</StatusPill>
      </section>
      <section className="settings-group">
        <div className="settings-heading"><span>{t("搜索范围")}</span><strong>{distance} km</strong></div>
        <input
          className="range-input"
          type="range"
          min="3"
          max="50"
          value={distance}
          onChange={(event) => onDistance(Number(event.target.value))}
          aria-label={t("门店搜索距离")}
        />
        <div className="range-labels"><span>3 km</span><span>25 km</span><span>50 km</span></div>
      </section>
      <section className="settings-group flush">
        <SettingRow icon={Bell} title={t("消息提示音")} copy={t("收到新任务和审批消息时播放提示音")}>
          <Switch value={sound} onChange={onSound} />
        </SettingRow>
        <SettingRow icon={RefreshCw} title={t("自动同步")} copy={t("在 Wi-Fi 或移动网络下自动上传")}>
          <Switch value={autoSync} onChange={onAutoSync} />
        </SettingRow>
        <SettingRow icon={online ? Cloud : CloudOff} title={t("网络状态")} copy={online ? t("当前已连接，可实时同步") : t("离线记录保存在本机")}>
          <Switch value={online} onChange={onOnline} />
        </SettingRow>
      </section>
      <section className="settings-group flush">
        <button className="setting-link" onClick={() => onToast(t("正在检查离线数据"))}><Download size={19} /><span><strong>{t("离线数据")}</strong><small>{t("已下载 128 家门店与 32 个产品")}</small></span><ChevronRight size={17} /></button>
        <button className="setting-link" onClick={() => onToast(t("当前版本 v1.0.0"))}><FileText size={19} /><span><strong>{t("版本与隐私")}</strong><small>{t("v1.0.0 · 中国演示版")}</small></span><ChevronRight size={17} /></button>
      </section>
      <button className="danger-link" onClick={() => onToast(t("本地缓存已清理"))}><Trash2 size={18} /> {t("清理本地缓存")}</button>
    </>
  );
}

function SettingRow({
  icon: Icon,
  title,
  copy,
  children,
}: {
  icon: LucideIcon;
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <div className="setting-row">
      <span className="setting-icon"><Icon size={19} /></span>
      <div><strong>{title}</strong><small>{copy}</small></div>
      {children}
    </div>
  );
}

function Switch({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      className={cn("switch", value && "active")}
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
    >
      <i />
    </button>
  );
}

function VisitScreen({
  store,
  step,
  checkedIn,
  tasks,
  photo,
  note,
  orderPieces,
  orderTotal,
  onStep,
  onCheckIn,
  onTask,
  onPhoto,
  onNote,
  onOrder,
  onFinish,
}: {
  store: StoreRecord;
  step: number;
  checkedIn: boolean;
  tasks: Record<string, boolean>;
  photo: string;
  note: string;
  orderPieces: number;
  orderTotal: number;
  onStep: (step: number) => void;
  onCheckIn: () => void;
  onTask: (key: string) => void;
  onPhoto: (event: ChangeEvent<HTMLInputElement>) => void;
  onNote: (note: string) => void;
  onOrder: () => void;
  onFinish: () => void;
}) {
  const t = useSalesTranslation();
  const language = useContext(LanguageContext);
  const completedTasks = Object.values(tasks).filter(Boolean).length;
  return (
    <div className="visit-flow">
      <div className="visit-stepper">
        {["签到", "执行", "订单", "总结"].map((label, index) => (
          <button
            key={label}
            className={cn(index + 1 === step && "active", index + 1 < step && "done")}
            onClick={() => index + 1 <= step && onStep(index + 1)}
          >
            <i>{index + 1 < step ? <Check size={13} /> : index + 1}</i><span>{t(label)}</span>
          </button>
        ))}
      </div>

      {step === 1 && (
        <section className="visit-panel checkin-panel">
          <div className={cn("map-placeholder", checkedIn && "checked")}>
            <div className="map-road road-a" />
            <div className="map-road road-b" />
            <div className="map-road road-c" />
            <span className="map-dot pulse"><LocateFixed size={24} /></span>
            <div className="location-accuracy"><Gauge size={14} /> {t("定位精度 12 米")}</div>
          </div>
          <div className="checkin-store">
            <div className="store-monogram">{store.shortName}</div>
            <div><strong>{t(store.name)}</strong><p>{t(store.address)}</p></div>
          </div>
          {checkedIn ? (
            <div className="success-box"><CheckCircle2 size={22} /><div><strong>{t("签到成功")}</strong><span>{t("10:24 · 距门店 12 米")}</span></div></div>
          ) : (
            <button className="primary-action full" onClick={onCheckIn}><LocateFixed size={19} /> {t("到店签到")}</button>
          )}
          <p className="fine-print">{t("签到时仅记录工作所需的位置和时间，不会持续跟踪定位。")}</p>
        </section>
      )}

      {step === 2 && (
        <>
          <section className="visit-panel">
            <div className="section-title-row compact">
              <div><span>{t("执行清单")}</span><h2>{completedTasks}/4 {t("已完成")}</h2></div>
              <StatusPill tone={completedTasks === 4 ? "green" : "orange"}>{completedTasks === 4 ? t("完成") : t("进行中")}</StatusPill>
            </div>
            <div className="visit-checklist">
              {[
                ["display", "陈列与价格签", "检查货架位置、排面和零售价"],
                ["price", "促销执行", "核对活动物料与促销价格"],
                ["inventory", "库存与效期", "记录库存量、临期和缺货情况"],
                ["competitor", "竞品信息", "拍摄同货架竞品及促销"],
              ].map(([key, title, copy]) => (
                <button key={key} className={tasks[key] ? "checked" : ""} onClick={() => onTask(key)}>
                  <i>{tasks[key] ? <Check size={15} /> : null}</i>
                  <span><strong>{t(title)}</strong><small>{t(copy)}</small></span>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          </section>
          <section className="visit-panel">
            <div className="section-title-row compact"><div><span>{t("现场留档")}</span><h2>{t("陈列照片")}</h2></div><span className="counter-badge">{photo ? 1 : 0}/6</span></div>
            <label className={cn("photo-upload", photo && "has-photo")}>
              {photo ? <img src={photo} alt={t("本次拜访上传的陈列照片")} /> : <><Camera size={30} /><strong>{t("拍摄或上传照片")}</strong><span>{t("支持 JPG、PNG，单张不超过 10MB")}</span></>}
              <input type="file" accept="image/*" capture="environment" onChange={onPhoto} />
            </label>
          </section>
        </>
      )}

      {step === 3 && (
        <section className="visit-panel">
          <div className="order-summary-hero">
            <ShoppingBag size={28} />
            <div><span>{t("本次订单")}</span><strong>{orderPieces ? `${orderPieces} ${language === "en" ? "items" : "件"} · ¥${orderTotal.toLocaleString()}` : t("尚未添加商品")}</strong></div>
          </div>
          <button className="primary-action full" onClick={onOrder}><Plus size={18} /> {orderPieces ? t("修改订单") : t("现场下单")}</button>
          <div className="visit-suggestion">
            <Sparkles size={18} />
            <div><strong>{t("智能补货建议")}</strong><p>{t("Jake Mints 预计 5 天后缺货，建议补充 2 箱。")}</p></div>
          </div>
          <button className="skip-link" onClick={() => onStep(4)}>{t("本次无订单，继续总结")}</button>
        </section>
      )}

      {step === 4 && (
        <section className="visit-panel">
          <div className="section-title-row compact">
            <div><span>{t("拜访总结")}</span><h2>{t("记录结果与下一步")}</h2></div>
          </div>
          <label className="form-label">{t("门店反馈")}<textarea value={note} onChange={(event) => onNote(event.target.value)} placeholder={t("例如：店员反馈柑橘风味接受度较高，申请增加试吃装…")} /></label>
          <div className="summary-options">
            <button><CheckCircle2 size={17} /> {t("达成目标")}</button>
            <button><CalendarCheck size={17} /> {t("14 天后复访")}</button>
            <button><CircleAlert size={17} /> {t("需要支持")}</button>
          </div>
          <div className="visit-final-stats">
            <div><span>{t("停留时长")}</span><strong>{t("28 分钟")}</strong></div>
            <div><span>{t("完成事项")}</span><strong>{completedTasks}/4</strong></div>
            <div><span>{t("订单金额")}</span><strong>¥{orderTotal.toLocaleString()}</strong></div>
          </div>
          <button className="primary-action full" onClick={onFinish}><CheckCircle2 size={18} /> {t("完成并提交拜访")}</button>
        </section>
      )}

      <div className="visit-footer">
        <button disabled={step === 1} onClick={() => onStep(Math.max(1, step - 1))}>{t("上一步")}</button>
        {step < 4 ? (
          <button disabled={step === 1 && !checkedIn} onClick={() => onStep(step + 1)}>{t("下一步")} <ChevronRight size={16} /></button>
        ) : null}
      </div>
    </div>
  );
}

function OrdersScreen({ orders, onNew }: { orders: OrderRecord[]; onNew: () => void }) {
  const t = useSalesTranslation();
  const language = useContext(LanguageContext);
  return (
    <>
      <section className="orders-total">
        <div><span>{t("本月订单额")}</span><strong>¥{orders.reduce((sum, order) => sum + order.amount, 0).toLocaleString()}</strong><p><TrendingUp size={14} /> {t("环比 +18.6%")}</p></div>
        <button onClick={onNew}><Plus size={18} /> {t("新建订单")}</button>
      </section>
      <div className="segmented-control">
        <button className="active">{t("全部")}</button><button>{t("待处理")}</button><button>{t("已完成")}</button>
      </div>
      <div className="order-list">
        {orders.map((order) => (
          <article className="order-card" key={order.id}>
            <div className="order-heading">
              <div><span>{order.id}</span><strong>{t(order.store)}</strong></div>
              <StatusPill tone={order.status === "已发货" ? "green" : order.status === "已确认" ? "blue" : "orange"}>{t(order.status)}</StatusPill>
            </div>
            <div className="order-meta"><span>{t(order.time)}</span><span>{order.pieces} {language === "en" ? "items" : "件商品"}</span></div>
            <div className="order-bottom"><strong>¥{order.amount.toLocaleString()}</strong><button>{t("查看详情")} <ChevronRight size={15} /></button></div>
          </article>
        ))}
      </div>
    </>
  );
}

function NewOrderScreen({
  store,
  products: orderProducts,
  quantities,
  total,
  pieces,
  onQuantity,
  onStore,
  onSubmit,
}: {
  store: StoreRecord;
  products: Product[];
  quantities: Record<string, number>;
  total: number;
  pieces: number;
  onQuantity: (id: string, delta: number) => void;
  onStore: () => void;
  onSubmit: () => void;
}) {
  const t = useSalesTranslation();
  const language = useContext(LanguageContext);
  return (
    <div className="new-order-flow">
      <button className="order-store-selector" onClick={onStore}>
        <div className="store-monogram small">{store.shortName}</div>
        <div><span>{t("下单门店")}</span><strong>{t(store.name)}</strong></div>
        <ChevronRight size={17} />
      </button>
      <div className="product-order-list">
        {orderProducts.map((product) => (
          <article className="product-order-card" key={product.id}>
            <div className="product-thumb" style={{ background: product.color }}><img src={product.image} alt={t(product.name)} /></div>
            <div className="product-order-info"><strong>{t(product.name)}</strong><span>{t(product.spec)}</span><b>¥{product.price}<small>{t("/箱")}</small></b></div>
            <div className="stepper">
              <button onClick={() => onQuantity(product.id, -1)} disabled={!quantities[product.id]}>−</button>
              <span>{quantities[product.id] ?? 0}</span>
              <button onClick={() => onQuantity(product.id, 1)}>+</button>
            </div>
          </article>
        ))}
      </div>
      <section className="order-note-card">
        <label>{t("订单备注")}<textarea placeholder={t("可填写交货时间、陈列物料或其他要求")} /></label>
      </section>
      <div className="order-submit-bar">
        <div><span>{language === "en" ? `${pieces} items` : `共 ${pieces} 件`}</span><strong>¥{total.toLocaleString()}</strong></div>
        <button onClick={onSubmit}>{t("提交订单")}</button>
      </div>
    </div>
  );
}

function MessagesScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const t = useSalesTranslation();
  const messages = [
    { icon: ClipboardCheck, tone: "blue", title: "审批提醒", copy: "CitySuper 订单已通过区域经理审核", time: "10:52", unread: true, screen: "orders" as Screen },
    { icon: CircleAlert, tone: "orange", title: "库存预警", copy: "Ole' 静安店 Jake Mints 库存低于安全线", time: "09:36", unread: true, screen: "stores" as Screen },
    { icon: UsersRound, tone: "violet", title: "团队任务", copy: "本周 Whole Sleep 反馈收集目标已更新", time: "昨天", unread: true, screen: "activities" as Screen },
    { icon: Cloud, tone: "green", title: "同步完成", copy: "昨日 8 条拜访记录已同步至服务器", time: "昨天", unread: false, screen: "settings" as Screen },
  ];
  return (
    <div className="message-list">
      {messages.map((message) => {
        const Icon = message.icon;
        return (
          <button key={message.title} onClick={() => onNavigate(message.screen)}>
            <span className={`message-icon ${message.tone}`}><Icon size={20} /></span>
            <div><strong>{t(message.title)}</strong><p>{t(message.copy)}</p></div>
            <span className="message-time">{t(message.time)}{message.unread ? <i /> : null}</span>
          </button>
        );
      })}
    </div>
  );
}

function BottomNav({ screen, onNavigate }: { screen: Screen; onNavigate: (screen: Screen) => void }) {
  const t = useSalesTranslation();
  const items: { label: string; icon: LucideIcon; screen: Screen; matches: Screen[] }[] = [
    { label: "首页", icon: Home, screen: "home", matches: ["home"] },
    { label: "门店", icon: Building2, screen: "stores", matches: ["stores", "store-detail"] },
    { label: "拜访", icon: Compass, screen: "today", matches: ["today", "planned"] },
    { label: "订单", icon: ShoppingBag, screen: "orders", matches: ["orders"] },
    { label: "我的", icon: UserRound, screen: "settings", matches: ["settings", "activities", "messages"] },
  ];
  return (
    <nav className="bottom-nav" aria-label={t("底部导航")}>
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.matches.includes(screen);
        return <button className={active ? "active" : ""} key={item.label} onClick={() => onNavigate(item.screen)}><Icon size={20} /><span>{t(item.label)}</span></button>;
      })}
    </nav>
  );
}

function ProfileMenu({
  online,
  language,
  onClose,
  onNavigate,
  onLogout,
  onLanguage,
}: {
  online: boolean;
  language: SalesLanguage;
  onClose: () => void;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  onLanguage: () => void;
}) {
  const t = useSalesTranslation();
  return (
    <div className="profile-overlay" role="dialog" aria-modal="true" aria-label={t("个人菜单")}>
      <button className="overlay-scrim" onClick={onClose} aria-label={t("关闭菜单")} />
      <aside className="profile-drawer">
        <div className="drawer-handle" />
        <div className="drawer-profile"><div className="user-avatar large">LC</div><div><strong>{t("李晨")}</strong><span>{t("城市经理 · 上海区域")}</span><small className={online ? "online" : ""}>{online ? t("在线并已同步") : t("离线工作中")}</small></div><button onClick={onClose}><X size={20} /></button></div>
        <button onClick={onLanguage}><span className="drawer-language">{language === "zh" ? "EN" : "中"}</span><span>{language === "zh" ? "English" : "中文"}</span><ChevronRight size={17} /></button>
        <button onClick={() => onNavigate("messages")}><Mail size={19} /><span>{t("消息中心")}</span><b>3</b><ChevronRight size={17} /></button>
        <button onClick={() => onNavigate("activities")}><Activity size={19} /><span>{t("我的工作台")}</span><ChevronRight size={17} /></button>
        <button onClick={() => onNavigate("settings")}><Settings size={19} /><span>{t("系统设置")}</span><ChevronRight size={17} /></button>
        <button className="logout" onClick={onLogout}><LogOut size={19} /><span>{t("退出登录")}</span></button>
      </aside>
    </div>
  );
}
