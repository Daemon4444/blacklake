import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Factory,
  FileClock,
  Gauge,
  KeyRound,
  Layers3,
  LineChart,
  LogOut,
  PackageCheck,
  Play,
  PlugZap,
  RefreshCw,
  Route,
  ScanLine,
  Search,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TimerReset,
  Truck,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CommercialPackage,
  Employee,
  EventItem,
  Integration,
  Material,
  QualityIssue,
  Recommendation,
  Snapshot,
  ViewKey,
  WorkOrder,
} from "./data";

type Surface = "home" | "command" | "fulfillment" | "shopfloor" | "quality" | "materials" | "implementation" | "platform" | "admin";
type RoleKey = "coo" | "planner" | "production" | "quality" | "warehouse" | "it";

const surfaces: { key: Surface; label: string; icon: typeof Factory }[] = [
  { key: "home", label: "商业首页", icon: Factory },
  { key: "command", label: "经营总览", icon: Gauge },
  { key: "fulfillment", label: "订单履约", icon: Route },
  { key: "shopfloor", label: "移动现场", icon: Smartphone },
  { key: "quality", label: "质量追溯", icon: ClipboardCheck },
  { key: "materials", label: "物料供应", icon: Boxes },
  { key: "implementation", label: "上线实施", icon: BadgeCheck },
  { key: "platform", label: "平台能力", icon: PlugZap },
  { key: "admin", label: "组织权限", icon: UserCog },
];

const roleFocus: Record<RoleKey, { name: string; mission: string; primary: Surface }> = {
  coo: { name: "经营层", mission: "看准交、库存、质量、产能和多厂复制风险", primary: "command" },
  planner: { name: "计划员", mission: "把订单、产能、物料、质量约束放进同一张计划表", primary: "fulfillment" },
  production: { name: "生产现场", mission: "用扫码报工和异常回写让车间进度实时在线", primary: "shopfloor" },
  quality: { name: "质量团队", mission: "围绕批次、工序、检验点和责任人完成偏差闭环", primary: "quality" },
  warehouse: { name: "仓储物料", mission: "以工单齐套为中心处理发料、退料、补货和盘点", primary: "materials" },
  it: { name: "IT/实施", mission: "配置主数据、接口、权限、审计和多厂复制模板", primary: "admin" },
};

const mesModules = [
  "生产统计",
  "物料管理",
  "工艺路线",
  "设备管理",
  "故障管理",
  "质量管理",
  "工位管理",
  "产线管理",
  "计划排程",
  "BOM 管理",
  "工序管理",
  "模具管理",
  "预警管理",
  "二维码管理",
  "车间管理",
];

const dashboardShots = [
  {
    title: "生产看板",
    body: "车间生产状况实时把握",
    url: "https://files.blacklake.cn/ow-images/zhuanti/180808/1%E7%94%9F%E4%BA%A7%E7%9C%8B%E6%9D%BF.png",
  },
  {
    title: "质量看板",
    body: "批次、检验点、异常闭环统一追溯",
    url: "https://files.blacklake.cn/ow-images/zhuanti/180808/2%E8%B4%A8%E9%87%8F%E7%9C%8B%E6%9D%BF.png",
  },
  {
    title: "物料看板",
    body: "库存、齐套、发料和安全库存同步协同",
    url: "https://files.blacklake.cn/ow-images/zhuanti/180808/3%E7%89%A9%E6%96%99%E7%9C%8B%E6%9D%BF.png",
  },
  {
    title: "设备看板",
    body: "点检、保养、停机和产能影响即时可见",
    url: "https://files.blacklake.cn/ow-images/zhuanti/180808/4%E8%AE%BE%E5%A4%87%E7%9C%8B%E6%9D%BF.png",
  },
  {
    title: "移动现场",
    body: "手机端扫码报工、质检、收发料和异常上报",
    url: "https://files.blacklake.cn/ow-images/zhuanti/180808/5%E6%94%AF%E6%8C%81%E6%89%8B%E6%9C%BAapp.png",
  },
];

const scenarioSections = [
  {
    id: "质量管理",
    eyebrow: "Quality Traceability",
    title: "质量问题不是事后登记，而是卡在工序现场闭环",
    body: "把来料检、首检、巡检、终检和客诉追溯接到批次、工单、工序、设备与责任人。质量员可以在移动端发起偏差、隔离批次、要求返工，经营层能看到未闭环问题对交付的影响。",
    image: "https://files.blacklake.cn/ow-images/zhuanti/180808/2%E8%B4%A8%E9%87%8F%E7%9C%8B%E6%9D%BF.png",
    facts: ["检验点配置", "批次追溯", "偏差闭环", "客诉关联"],
  },
  {
    id: "设备管理",
    eyebrow: "Equipment Operations",
    title: "设备、模具、点检和停机原因进入同一张运行账",
    body: "设备工程师维护资产台账、保养计划、故障记录和停机影响；班组在报工时同步记录设备状态。系统把设备可用性和产线计划放在一起，让排产不再只看人和物料。",
    image: "https://files.blacklake.cn/ow-images/zhuanti/180808/4%E8%AE%BE%E5%A4%87%E7%9C%8B%E6%9D%BF.png",
    facts: ["资产台账", "点检保养", "停机影响", "OEE 分析"],
  },
  {
    id: "物料管理",
    eyebrow: "Material Collaboration",
    title: "围绕工单齐套管理物料，而不是只看仓库库存",
    body: "计划创建工单后，仓储按批次和库位发料，现场扫码领料、退料、补料，系统自动提示缺料风险和安全库存。物料动作与工单进度相互校验，减少等料和错料。",
    image: "https://files.blacklake.cn/ow-images/zhuanti/180808/3%E7%89%A9%E6%96%99%E7%9C%8B%E6%9D%BF.png",
    facts: ["齐套检查", "批次库位", "发退补料", "安全库存"],
  },
];

const guideSteps = [
  { title: "注册企业租户", body: "创建公司、工厂、车间、产线和数据隔离空间。", icon: Factory },
  { title: "导入员工组织", body: "从 HR/企微/飞书导入员工，按部门、工厂、班组分组。", icon: Users },
  { title: "选择岗位角色", body: "计划、生产、质量、仓储、经营层、IT 分别进入不同工作台。", icon: UserCog },
  { title: "配置操作权限", body: "控制谁能报工、补货、关闭偏差、同步接口、查看审计。", icon: ShieldCheck },
  { title: "进入生产系统", body: "角色登录后直接进入对应业务流程，动作进入事件流和审计。", icon: ArrowRight },
];

const dataChainSteps = [
  { title: "销售订单", body: "客户交期、优先级、产品规格进入统一订单池。", icon: Truck },
  { title: "计划排程", body: "结合产能、工艺、物料和质量约束自动识别冲突。", icon: Route },
  { title: "物料齐套", body: "按工单、批次、库位发料，低库存自动触发补货。", icon: Boxes },
  { title: "现场执行", body: "班组扫码报工，异常、停机、返工实时回写。", icon: ScanLine },
  { title: "质量追溯", body: "检验点、批次、设备和责任人共同构成追溯链。", icon: ClipboardCheck },
  { title: "经营看板", body: "经营层看到准交、库存、质量和产线负载风险。", icon: LineChart },
  { title: "审计归档", body: "每次配置、审批和业务动作保留可复盘记录。", icon: FileClock },
];

const faqItems = [
  ["这类 MES 怎么售卖？", "以首厂试点为入口，按企业租户、启用模块、工厂/产线规模和实施服务打包。试点跑通后沉淀模板，再复制到多工厂和上下游协同网络。"],
  ["为什么要做角色导购？", "MES 的购买者和使用者不是同一人。经营层看 ROI，IT 看权限与接口，计划、生产、质量、仓储关心每日动作。导购页需要把这些入口直接连到工作台。"],
  ["和传统项目制软件的差异？", "云端产品强调配置、移动现场、快速上线和持续迭代；传统项目更多依赖长周期定制。这里的原型把配置、权限、流程和业务动作放在同一条链路里。"],
  ["后台管理必须包含什么？", "至少要有企业租户、组织员工、角色权限、工厂范围、主数据、接口状态和审计日志，否则官网注册之后无法进入一个可信的生产系统。"],
];

async function request<T>(path: string, userId: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "content-type": "application/json", "x-user-id": userId },
    ...options,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function App() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [surface, setSurface] = useState<Surface>("home");
  const [showSite, setShowSite] = useState(true);
  const [userId, setUserId] = useState(() => localStorage.getItem("gongmai-user-id") || "U-1001");
  const [authenticated, setAuthenticated] = useState(() => localStorage.getItem("gongmai-session") === "active");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  async function refresh(nextUserId = userId) {
    const next = await request<Snapshot>("/api/snapshot", nextUserId);
    setSnapshot(next);
  }

  async function login(nextUserId: string, password = "demo123") {
    setBusy(nextUserId);
    try {
      const next = await request<Snapshot>("/api/auth/login", nextUserId, {
        method: "POST",
        body: JSON.stringify({ userId: nextUserId, password }),
      });
      localStorage.setItem("gongmai-user-id", nextUserId);
      localStorage.setItem("gongmai-session", "active");
      setUserId(nextUserId);
      setSnapshot(next);
      setAuthenticated(true);
      setShowSite(false);
      setSurface(roleFocus[(next.currentUser.roleKey as RoleKey) || "planner"]?.primary || "command");
      toast(`${next.currentUser.name} 已进入 ${next.tenant.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
      setAuthenticated(false);
    } finally {
      setBusy(null);
    }
  }

  async function mutate(path: string, label: string) {
    setBusy(label);
    try {
      const next = await request<Snapshot>(path, userId, { method: "POST", body: "{}" });
      setSnapshot(next);
      toast("动作已写入事件流、业务对象和审计日志");
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setBusy(null);
    }
  }

  function toast(message: string) {
    setNotice(message);
    setError(null);
    window.setTimeout(() => setNotice(null), 2600);
  }

  function logout() {
    localStorage.removeItem("gongmai-session");
    setAuthenticated(false);
    setShowSite(true);
    setSurface("home");
  }

  useEffect(() => {
    refresh().catch((err) => setError(err.message));
  }, [userId]);

  useEffect(() => {
    if (!authenticated) return undefined;
    const stream = new EventSource(`/api/events/stream?userId=${userId}`);
    stream.onmessage = () => refresh().catch(() => undefined);
    stream.onerror = () => stream.close();
    return () => stream.close();
  }, [authenticated, userId]);

  const actions = {
    planPackage: (id: string) => mutate(`/api/commercial/${id}/plan`, id),
    convert: (id: string) => mutate(`/api/opportunities/${id}/convert`, id),
    executeRecommendation: (id: string) => mutate(`/api/recommendations/${id}/execute`, id),
    advanceOrder: (id: string) => mutate(`/api/orders/${id}/advance`, id),
    closeQuality: (id: string) => mutate(`/api/quality/${id}/close`, id),
    replenish: (id: string) => mutate(`/api/materials/${id}/replenish`, id),
    completeMobile: (id: string) => mutate(`/api/mobile/${id}/complete`, id),
    verifyMasterData: (id: string) => mutate(`/api/master-data/${id}/verify`, id),
    syncIntegration: (id: string) => mutate(`/api/integrations/${id}/sync`, id),
    reset: () => mutate("/api/admin/reset", "reset"),
    exception: () => mutate("/api/events/exception", "exception"),
  };

  if (!snapshot) return <Boot message={error || "正在连接云端制造协同平台..."} />;
  if (showSite || !authenticated) {
    return (
      <MesLanding
        snapshot={snapshot}
        selectedUserId={userId}
        busy={busy}
        onSelectUser={setUserId}
        onLogin={() => login(userId)}
        onEnterConsole={() => {
          setShowSite(false);
          setSurface(roleFocus[(snapshot.currentUser.roleKey as RoleKey) || "planner"]?.primary || "command");
        }}
      />
    );
  }

  const activeRole = roleFocus[(snapshot.currentUser.roleKey as RoleKey) || "planner"] || roleFocus.planner;

  return (
    <div className="product-shell">
      <aside className="rail">
        <button className="brand-lockup" type="button" onClick={() => setShowSite(true)} aria-label="工脉智造原型首页">
          <span className="brand-symbol">GM</span>
          <span>
            <strong>工脉智造</strong>
            <small>制造协同原型</small>
          </span>
        </button>
        <nav className="rail-nav" aria-label="产品模块">
          {surfaces.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={surface === item.key ? "active" : ""}
                type="button"
                onClick={() => (item.key === "home" ? setShowSite(true) : setSurface(item.key))}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="tenant-mini">
          <Factory size={17} />
          <strong>{snapshot.tenant.name}</strong>
          <span>{snapshot.tenant.plants} 工厂 / {snapshot.tenant.lines} 产线 / {snapshot.tenant.users} 用户</span>
        </div>
      </aside>

      <main className="workspace">
        <header className="topline">
          <div>
            <p className="eyebrow">Cloud MES / MOM / Supply Chain / Industrial AI</p>
            <h1>{surfaces.find((item) => item.key === surface)?.label}</h1>
            <span>{snapshot.currentUser.name} · {activeRole.name} · {activeRole.mission}</span>
          </div>
          <div className="top-actions">
            <label className="searchbox">
              <Search size={16} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索工单、物料、客户" />
            </label>
            <select value={userId} onChange={(event) => login(event.target.value)} aria-label="切换角色">
              {snapshot.users.map((user) => (
                <option key={user.id} value={user.id}>{user.name} · {user.role}</option>
              ))}
            </select>
            <button className="icon-button warn" type="button" onClick={actions.exception} disabled={busy === "exception"} title="触发现场异常">
              <AlertTriangle size={17} />
            </button>
            <button className="icon-button" type="button" onClick={actions.reset} disabled={busy === "reset"} title="重置演示数据">
              <RefreshCw size={17} />
            </button>
            <button className="icon-button" type="button" onClick={logout} title="退出">
              <LogOut size={17} />
            </button>
          </div>
        </header>

        {notice && <div className="toast success">{notice}</div>}
        {error && <div className="toast error">{error === "HTTP 401" ? "密码不正确，演示密码为 demo123" : error}</div>}

        {surface === "home" && <Home snapshot={snapshot} actions={actions} busy={busy} onNavigate={setSurface} />}
        {surface === "command" && <CommandCenter snapshot={snapshot} actions={actions} busy={busy} onNavigate={setSurface} />}
        {surface === "fulfillment" && <Fulfillment snapshot={snapshot} query={query} actions={actions} busy={busy} />}
        {surface === "shopfloor" && <Shopfloor snapshot={snapshot} actions={actions} busy={busy} />}
        {surface === "quality" && <Quality snapshot={snapshot} actions={actions} busy={busy} />}
        {surface === "materials" && <Materials snapshot={snapshot} actions={actions} busy={busy} />}
        {surface === "implementation" && <Implementation snapshot={snapshot} actions={actions} busy={busy} />}
        {surface === "platform" && <Platform snapshot={snapshot} actions={actions} busy={busy} />}
        {surface === "admin" && <AdminCenter snapshot={snapshot} />}
      </main>
    </div>
  );
}

function MesLanding({
  snapshot,
  selectedUserId,
  busy,
  onSelectUser,
  onLogin,
  onEnterConsole,
}: {
  snapshot: Snapshot;
  selectedUserId: string;
  busy: string | null;
  onSelectUser: (id: string) => void;
  onLogin: () => void;
  onEnterConsole: () => void;
}) {
  const selectedUser = snapshot.users.find((user) => user.id === selectedUserId) || snapshot.users[0];
  const selectedFocus = roleFocus[(selectedUser.roleKey as RoleKey) || "planner"] || roleFocus.planner;
  const activeLines = snapshot.lines.filter((line) => line.status === "运行").length;
  const insightQueue = snapshot.intelligenceInsights.filter((item) => item.status === "待处理").slice(0, 3);

  return (
    <main className="mes-site" id="top">
      <header className="mes-nav">
        <button className="mes-logo" type="button" aria-label="MES 官网首页">
          <span className="brand-symbol">GM</span>
          <strong>工脉智造</strong>
        </button>
        <nav aria-label="MES 专题导航">
          {["生产管理", "质量管理", "设备管理", "物料管理", "看板管理", "产品价值"].map((item) => <a key={item} href={`#${item}`}>{item}</a>)}
        </nav>
        <span className="mes-phone">400-921-0816</span>
        <button className="mes-cta" type="button" onClick={onLogin} disabled={busy !== null}>
          免费体验
        </button>
      </header>

      <section className="mes-hero">
        <div className="mes-hero-copy">
          <h1>工脉智造 - 云端 MES 制造执行系统<br />连接现场、质量与供应，实现精益交付</h1>
          <ul className="mes-hero-points">
            {[
              "高效配置生产资源，减少浪费，提升工厂交付能力",
              "实时管控生产流程，质量问题精准追溯",
              "云端协同降低沟通成本，各个部门无缝合作",
              "全流程电子信息化，规范保存便捷查找",
              "生产数据智能分析，指导生产、发现问题",
            ].map((item) => <li key={item}>{item}</li>)}
          </ul>
          <div className="mes-hero-actions">
            <button className="primary-action" type="button" onClick={onLogin} disabled={busy !== null}>
              立即建立数字化工厂 <ArrowRight size={17} />
            </button>
            <a href="#导购登录">选择员工角色进入系统</a>
          </div>
          <div className="mes-hero-kpis" aria-label="制造经营指标">
            {[
              ["准交预测", `${onTime(snapshot)}%`, "订单、产能、物料联合预测"],
              ["缺料风险", `${lowStock(snapshot.materials)} 项`, "关联工单自动预警"],
              ["运行产线", `${activeLines}/${snapshot.lines.length}`, "实时采集现场状态"],
            ].map(([label, value, hint]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <em>{hint}</em>
              </article>
            ))}
          </div>
        </div>
        <div className="mes-hero-aside">
          <form className="mes-apply-card" onSubmit={(event) => { event.preventDefault(); onLogin(); }}>
            <h2>在线注册，免费体验</h2>
            <label><span>* 公司名称：</span><input placeholder="公司名称" defaultValue={snapshot.tenant.name} /></label>
            <label><span>* 联系人：</span><input placeholder="联系人" defaultValue={selectedUser.name} /></label>
            <label><span>* 手机：</span><input placeholder="手机" /></label>
            <label><span>* 邮箱：</span><input placeholder="邮箱" defaultValue={selectedUser.email} /></label>
            <label><span>* 所属行业：</span><select defaultValue=""><option value="" disabled>请选择行业</option><option>食品饮料</option><option>汽车零部件</option><option>装备制造</option><option>电子组装</option><option>医药化工</option></select></label>
            <button type="submit" disabled={busy !== null}>确认提交</button>
          </form>
          <div className="mes-live-card" aria-label="实时工厂信号">
            <div>
              <span>华东一厂实时信号</span>
              <strong>{snapshot.events[0]?.time || "刚刚"}</strong>
            </div>
            {snapshot.lines.slice(0, 3).map((line) => (
              <article key={line.id}>
                <b>{line.name}</b>
                <span>{line.status}</span>
                <meter min="0" max="100" value={line.oee}>{line.oee}%</meter>
              </article>
            ))}
          </div>
        </div>
      </section>

      <nav className="mes-anchor-bar" aria-label="专题锚点">
        {["生产管理", "质量管理", "设备管理", "物料管理", "看板管理", "产品价值"].map((item) => <a key={item} href={`#${item}`}>{item}</a>)}
        <button type="button" onClick={onLogin} disabled={busy !== null}>免费体验</button>
        <a className="chat-link" href="#导购登录">客服在线 点击咨询</a>
      </nav>

      <aside className="mes-float">
        <a href="#导购登录">联系我们</a>
        <a href="#top">TOP</a>
      </aside>

      <section className="mes-proof-strip" aria-label="产品可信度">
        {[
          [`${snapshot.tenant.plants} 座工厂`, "集团多工厂租户模型"],
          [`${snapshot.tenant.lines} 条产线`, "覆盖灌装、包装、外协装配"],
          [`${snapshot.tenant.users} 名员工`, "按岗位授权进入工作台"],
          [`${snapshot.integrations.length} 个接口`, "ERP、WMS、PLM 与开放 API"],
        ].map(([value, label]) => (
          <article key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </section>

      <section className="mes-section" id="生产管理">
        <p className="eyebrow">Manufacturing Knowledge Engine</p>
        <h2>从工厂建模开始，贴着真实生产方式配置</h2>
        <p className="section-lead">先把公司、工厂、车间、产线、工位、设备、BOM、工艺路线、质检点和二维码建成模型，再把不同岗位的操作权限挂到模型上。这样每一次报工、发料、质检、维修、补货都能回到同一张生产事实表。</p>
        <div className="mes-module-cloud">
          {mesModules.map((item, index) => (
            <article key={item} style={{ animationDelay: `${index * 35}ms` }}>
              <Factory size={18} />
              <span>{item}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="mes-section mes-ops-room">
        <div className="ops-room-copy">
          <p className="eyebrow">Operations Room</p>
          <h2>让经营层、计划员和现场看到同一套生产事实</h2>
          <p>专题页不只讲概念，它要让客户感到系统已经连上真实工厂：订单有交期，产线有负载，物料有风险，质量有责任人，智能建议能推送到对应岗位。</p>
        </div>
        <div className="ops-room-board" aria-label="实时运营驾驶舱">
          <div className="ops-board-main">
            {snapshot.orders.slice(0, 3).map((order) => (
              <article key={order.id}>
                <span>{order.customer}</span>
                <strong>{order.id}</strong>
                <meter min="0" max="100" value={order.progress}>{order.progress}%</meter>
                <em>{order.line} / {order.status}</em>
              </article>
            ))}
          </div>
          <div className="ops-board-side">
            {insightQueue.map((insight) => (
              <article key={insight.id} className={insight.severity === "高" ? "hot" : ""}>
                <span>{insight.domain}</span>
                <strong>{insight.value}</strong>
                <p>{insight.title}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mes-section mes-process-band">
        <div className="process-copy">
          <p className="eyebrow">How MES Works</p>
          <h2>不是只展示看板，而是把业务动作接到生产系统</h2>
          <p>销售订单进入系统后，计划员排程，仓库按工单发料，班组扫码报工，质检员在工序点检验，设备工程师处理停机，经营层查看准交和异常。每个动作都带着员工身份、岗位权限、业务对象和审计记录。</p>
        </div>
        <div className="process-grid">
          {[
            ["订单", `${snapshot.orders.length} 个工单`, "客户交期、优先级、产线负载"],
            ["物料", `${lowStock(snapshot.materials)} 项风险`, "库存、安全库存、齐套、补货"],
            ["质量", `${openQuality(snapshot.qualityIssues)} 单待闭环`, "批次、检验点、偏差、追溯"],
            ["设备", `${snapshot.equipmentAssets.length} 台资产`, "OEE、点检、保养、停机影响"],
          ].map(([title, value, body]) => (
            <article key={title}>
              <strong>{title}</strong>
              <b>{value}</b>
              <span>{body}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="mes-section mes-data-chain">
        <div>
          <p className="eyebrow">Data Chain</p>
          <h2>一条主线串起订单、现场、质量、物料和审计</h2>
          <p className="section-lead">制造企业真正需要的是端到端的生产事实链，而不是孤立模块。每个节点都对应一个岗位动作、一个业务对象和一条可追溯记录。</p>
        </div>
        <div className="data-chain-track">
          {dataChainSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <Icon size={21} />
                <strong>{step.title}</strong>
                <p>{step.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mes-section mes-scenarios" aria-label="核心业务场景">
        {scenarioSections.map((scenario, index) => (
          <article
            className={index % 2 === 1 ? "scenario-row reversed" : "scenario-row"}
            id={scenario.id}
            key={scenario.id}
          >
            <div className="scenario-copy">
              <p className="eyebrow">{scenario.eyebrow}</p>
              <h2>{scenario.title}</h2>
              <p>{scenario.body}</p>
              <div className="scenario-facts">
                {scenario.facts.map((fact) => <span key={fact}>{fact}</span>)}
              </div>
            </div>
            <figure>
              <img src={scenario.image} alt={`${scenario.id}看板`} />
            </figure>
          </article>
        ))}
      </section>

      <section className="mes-section mes-template-lab">
        <div>
          <p className="eyebrow">Industry Templates</p>
          <h2>把行业 Know-how 做成可复制模板</h2>
          <p className="section-lead">真正能商业化的 MES 不能每个客户从零项目制开发。它需要把行业字段、角色、流程、看板和质检点沉淀为模板，让首厂试点之后可以规模复制。</p>
        </div>
        <div className="template-grid">
          {snapshot.industryTemplates.map((template) => (
            <article key={template.id} className={template.status === "已启用" ? "active" : ""}>
              <span>{template.industry}</span>
              <h3>{template.name}</h3>
              <p>{template.fit}</p>
              <div>
                {template.modules.slice(0, 4).map((item) => <b key={item}>{item}</b>)}
              </div>
              <em>{template.rollout}</em>
            </article>
          ))}
        </div>
      </section>

      <section className="mes-section mes-dark" id="看板管理">
        <div>
          <p className="eyebrow">Production Dashboard</p>
          <h2>生产数据精准传递，科学指导生产制造</h2>
          <p className="section-lead">把车间实时状态、物料齐套、质量异常和设备负载放进同一组看板，让现场管理从追问变成看见。</p>
        </div>
        <div className="dashboard-showcase">
          {dashboardShots.map((shot) => (
            <article key={shot.title}>
              <img src={shot.url} alt={shot.title} />
              <strong>{shot.title}</strong>
              <span>{shot.body}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="mes-section mes-commercial">
        <div className="commercial-copy">
          <p className="eyebrow">Commercialization</p>
          <h2>官网导购要能解释“怎么购买、怎么落地、怎么扩厂”</h2>
          <p>按云端工业 SaaS 的市场认知，客户买的不是一个孤立看板，而是一套从试点到规模化复制的制造协同能力。页面需要把套餐、实施、ROI 和后台权限讲清楚。</p>
        </div>
        <div className="commercial-grid">
          {snapshot.commercialPackages.map((item) => (
            <article key={item.id} className={item.status === "主推" ? "featured" : ""}>
              <span>{item.status}</span>
              <h3>{item.name}</h3>
              <p>{item.target}</p>
              <strong>{item.priceModel}</strong>
              <em>{item.implementation}</em>
            </article>
          ))}
        </div>
      </section>

      <section className="mes-section mes-role-map">
        <div>
          <p className="eyebrow">Role-based Guide</p>
          <h2>导购页把每类用户直接带到自己的工作台</h2>
          <p className="section-lead">制造现场不是一个人用系统。角色入口越清楚，客户越容易理解购买后如何在公司内部推广：经营层看指标，计划看履约，现场做执行，IT 管配置和权限。</p>
        </div>
        <div className="role-map-grid">
          {snapshot.users.map((user) => {
            const focus = roleFocus[(user.roleKey as RoleKey) || "planner"] || roleFocus.planner;
            const surfaceLabel = surfaces.find((item) => item.key === focus.primary)?.label || "生产系统";
            return (
              <article key={user.id}>
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.role}</span>
                </div>
                <p>{focus.mission}</p>
                <footer>
                  <b>{surfaceLabel}</b>
                  <em>{user.permissions.length} 项权限</em>
                </footer>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mes-section mes-admin-preview">
        <div className="admin-preview-copy">
          <p className="eyebrow">Admin & Permission</p>
          <h2>注册之后必须有可信的组织、权限和接口后台</h2>
          <p>用户在线提交只是开始。真实 MES 要能把企业租户、工厂范围、员工角色、接口状态和审计日志管起来，否则官网再漂亮也无法支撑生产系统上线。</p>
          <button className="secondary-action" type="button" onClick={onEnterConsole}>
            查看组织权限后台
          </button>
        </div>
        <div className="admin-preview-board" aria-label="后台管理预览">
          <article className="tenant-preview">
            <span>{snapshot.tenant.plan}</span>
            <strong>{snapshot.tenant.name}</strong>
            <p>{snapshot.tenant.plants} 工厂 / {snapshot.tenant.lines} 产线 / {snapshot.tenant.users} 员工</p>
          </article>
          <div className="permission-preview">
            {snapshot.users.slice(0, 4).map((user) => (
              <article key={user.id}>
                <span>{user.department}</span>
                <strong>{user.name}</strong>
                <p>{user.permissions.slice(0, 3).join(" / ")}</p>
              </article>
            ))}
          </div>
          <div className="admin-signal-grid">
            {snapshot.integrations.slice(0, 3).map((item) => (
              <article key={item.id}>
                <span>{item.type}</span>
                <strong>{item.name}</strong>
                <em>{item.status} · {item.lastSync}</em>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mes-section mes-guide" id="导购登录">
        <p className="eyebrow">Guided Purchase & Login</p>
        <h2>导购页最后必须接入真实生产系统</h2>
        <p className="section-lead">客户不是看完官网就结束，而是创建企业租户、选择岗位角色，然后进入对应权限的生产系统。下面这一步就是从官网导购切到真实业务系统的入口。</p>
        <div className="guide-flow">
          {guideSteps.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.title}>
                <Icon size={20} />
                <strong>{step.title}</strong>
                <span>{step.body}</span>
              </article>
            );
          })}
        </div>
        <div className="role-entry">
          <div className="role-entry-copy">
            <h3>选择一个员工身份进入系统</h3>
            <p>同一个公司租户下，不同员工登录后会进入不同工作台，并且只能操作自己岗位权限范围内的业务。</p>
            <div className="selected-role-card">
              <strong>{selectedUser.name} · {selectedUser.role}</strong>
              <span>{selectedUser.department} / {selectedUser.plant}</span>
              <p>{selectedFocus.mission}</p>
            </div>
          </div>
          <div className="role-picker-grid">
            {snapshot.users.map((user) => {
              const focus = roleFocus[(user.roleKey as RoleKey) || "planner"] || roleFocus.planner;
              return (
                <button
                  key={user.id}
                  className={user.id === selectedUserId ? "selected" : ""}
                  type="button"
                  onClick={() => onSelectUser(user.id)}
                >
                  <strong>{user.name}</strong>
                  <span>{user.role}</span>
                  <em>{focus.primary === "admin" ? "组织权限" : surfaces.find((item) => item.key === focus.primary)?.label}</em>
                </button>
              );
            })}
          </div>
          <button className="primary-action role-login" type="button" onClick={onLogin} disabled={busy !== null}>
            登录并进入 {surfaces.find((item) => item.key === selectedFocus.primary)?.label || "生产系统"}
            <ArrowRight size={17} />
          </button>
          {localStorage.getItem("gongmai-session") === "active" && (
            <button className="secondary-action role-console" type="button" onClick={onEnterConsole}>
              进入当前登录工作台
            </button>
          )}
        </div>
      </section>

      <section className="mes-section" id="产品价值">
        <p className="eyebrow">Why Cloud MES</p>
        <h2>选择云端制造协同，而不是笨重项目制软件</h2>
        <div className="mes-value-grid">
          {[
            ["35%", "缩短规划和制造周期"],
            ["65%", "加快多部门协作响应"],
            ["80%", "简化沟通和纸张使用"],
            ["32%", "减少在制品滞留数量"],
            ["90%", "提升生产数据完整性"],
            ["22%", "提高制造效率和质量"],
          ].map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="mes-section mes-rollout">
        <div>
          <p className="eyebrow">Implementation Journey</p>
          <h2>从首厂诊断到多厂复制，每一步都有交付物</h2>
        </div>
        <div className="rollout-track">
          {snapshot.implementationPhases.map((phase) => (
            <article key={phase.id} className={phase.status === "进行中" ? "current" : phase.status === "已完成" ? "done" : ""}>
              <span>{phase.time}</span>
              <strong>{phase.name}</strong>
              <em>{phase.owner}</em>
              <p>{phase.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mes-section mes-advantage">
        {[
          ["四周上线", "实施与培训周期低于传统工业软件"],
          ["按需收费", "降低一次性项目投入风险"],
          ["灵活配置", "无需配备开发人员，敏捷完成个性化配置"],
          ["操作简易", "支持 Web、手机和物联网设备"],
          ["标准接口", "提供 API，支持数据导入导出和延展开发"],
        ].map(([title, body]) => (
          <article key={title}>
            <CheckCircle2 size={20} />
            <strong>{title}</strong>
            <span>{body}</span>
          </article>
        ))}
      </section>

      <section className="mes-section mes-faq">
        <p className="eyebrow">FAQ</p>
        <h2>客户真正会问的问题，页面里就要提前回答</h2>
        <div className="faq-grid">
          {faqItems.map(([question, answer]) => (
            <article key={question}>
              <strong>{question}</strong>
              <p>{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="mes-footer">
        <h2>立即体验制造现场数字化带来的效用与便捷</h2>
        <button className="primary-action" type="button" onClick={onLogin} disabled={busy !== null}>进入演示工作台</button>
        <span>客服热线：400-921-0816</span>
      </footer>
    </main>
  );
}

function Boot({ message }: { message: string }) {
  return (
    <main className="boot-screen">
      <span className="brand-symbol">GM</span>
      <strong>工脉智造制造协同原型</strong>
      <p>{message}</p>
    </main>
  );
}

function Login({
  snapshot,
  selected,
  busy,
  error,
  onSelect,
  onLogin,
}: {
  snapshot: Snapshot;
  selected: string;
  busy: string | null;
  error: string | null;
  onSelect: (id: string) => void;
  onLogin: (id: string, password?: string) => void;
}) {
  const [password, setPassword] = useState("demo123");
  const active = snapshot.users.find((user) => user.id === selected) || snapshot.users[0];

  return (
    <main className="login-view">
      <section className="login-brief">
        <span className="brand-symbol">GM</span>
        <p className="eyebrow">云原生制造协同平台</p>
        <h1>从订单到交付，让工厂在线协同</h1>
        <p>沿用云端制造协同产品的商业逻辑：官网售卖、首厂试点、车间扫码、质量追溯、供应链透明和工业 AI 建议在同一套租户数据里闭环。</p>
        <div className="proof-strip">
          <span><TimerReset size={15} /> 6-12 周上线</span>
          <span><ScanLine size={15} /> 移动端优先</span>
          <span><BrainCircuit size={15} /> 工业智能体</span>
        </div>
      </section>
      <section className="login-panel">
        <div className="section-title">
          <KeyRound size={18} />
          <h2>员工账号登录</h2>
        </div>
        <label>
          <span>企业租户</span>
          <input value={`${snapshot.tenant.name} · ${snapshot.tenant.plan}`} readOnly />
        </label>
        <label>
          <span>角色</span>
          <select value={selected} onChange={(event) => onSelect(event.target.value)}>
            {snapshot.users.map((user) => <option key={user.id} value={user.id}>{user.name} · {user.role}</option>)}
          </select>
        </label>
        <label>
          <span>密码</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <div className="identity-card">
          <strong>{active.name}</strong>
          <span>{active.department} · {active.plant}</span>
        </div>
        {error && <div className="toast error">{error === "HTTP 401" ? "密码不正确，演示密码为 demo123" : error}</div>}
        <button className="primary-action" type="button" onClick={() => onLogin(selected, password)} disabled={busy === selected}>
          <KeyRound size={17} /> 登录工作台
        </button>
      </section>
    </main>
  );
}

function Home({
  snapshot,
  actions,
  busy,
  onNavigate,
}: {
  snapshot: Snapshot;
  actions: ReturnType<typeof actionShape>;
  busy: string | null;
  onNavigate: (surface: Surface) => void;
}) {
  return (
    <div className="screen-stack">
      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">工脉智造 / 云端制造协同</p>
          <h2>云端协同，数据驱动的制造运营平台</h2>
          <p>
            以订单履约为主线，连接计划、物料、生产、质检、设备、供应链和工业智能体。
            售卖从首厂试点开始，沉淀行业模板，再复制到多工厂和上下游供应网络。
          </p>
          <div className="hero-actions">
            <button className="primary-action" type="button" onClick={() => onNavigate("command")}>
              进入经营总览 <ArrowRight size={17} />
            </button>
            <button className="secondary-action" type="button" onClick={() => onNavigate("implementation")}>
              查看上线路径
            </button>
          </div>
        </div>
        <div className="hero-ops" aria-label="制造运营信号">
          <Metric label="准交预测" value={`${onTime(snapshot)}%`} tone="good" />
          <Metric label="缺料风险" value={`${lowStock(snapshot.materials)} 项`} tone="warn" />
          <Metric label="质量待闭环" value={`${openQuality(snapshot.qualityIssues)} 单`} tone="risk" />
          <div className="line-map">
            {snapshot.lines.map((line) => (
              <span key={line.id} className={`line-node ${line.status === "运行" ? "run" : "hold"}`}>
                {line.name}<b>{line.oee}%</b>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="product-matrix">
        {[
          ["工脉 MES", "中大型工厂与集团多厂", "MES/MOM、计划、质量、设备、低代码、AI"],
          ["工脉轻工单", "中小工厂快速数字化", "工单、报工、物料、质检、计件工资、消息提醒"],
          ["工脉供应链", "链主企业与品牌方", "供应商、订单同步、来料进度、库存透明、风险预警"],
          ["工业智能体", "数据成熟客户", "AI 排程、ChatBI、异常归因、质量预测、自动决策"],
        ].map(([name, target, scope]) => (
          <article className="matrix-card" key={name}>
            <Sparkles size={18} />
            <h3>{name}</h3>
            <p>{target}</p>
            <span>{scope}</span>
          </article>
        ))}
      </section>

      <section className="split">
        <div className="panel">
          <SectionTitle icon={LineChart} title="商业化套餐" />
          <div className="package-grid">
            {snapshot.commercialPackages.map((item) => (
              <PackageCard key={item.id} item={item} busy={busy} onPlan={actions.planPackage} />
            ))}
          </div>
        </div>
        <EventPanel events={snapshot.events} />
      </section>
    </div>
  );
}

function CommandCenter({
  snapshot,
  actions,
  busy,
  onNavigate,
}: {
  snapshot: Snapshot;
  actions: ReturnType<typeof actionShape>;
  busy: string | null;
  onNavigate: (surface: Surface) => void;
}) {
  return (
    <div className="screen-stack">
      <section className="metric-row">
        <Metric label="准交预测" value={`${onTime(snapshot)}%`} tone="good" />
        <Metric label="平均工单进度" value={`${avg(snapshot.orders.map((order) => order.progress))}%`} tone="info" />
        <Metric label="缺料风险" value={`${lowStock(snapshot.materials)} 项`} tone="warn" />
        <Metric label="质量待闭环" value={`${openQuality(snapshot.qualityIssues)} 单`} tone="risk" />
        <Metric label="接口健康" value={`${snapshot.integrations.filter((item) => item.status === "已连接").length}/${snapshot.integrations.length}`} tone="info" />
      </section>
      <section className="split">
        <div className="panel">
          <SectionTitle icon={BrainCircuit} title="AI 运营建议" />
          <div className="recommendation-list">
            {snapshot.recommendations.map((item) => (
              <RecommendationCard key={item.id} item={item} busy={busy} onAccept={actions.executeRecommendation} />
            ))}
          </div>
        </div>
        <div className="panel">
          <SectionTitle icon={Factory} title="角色下一步" />
          <div className="journey-list">
            {[
              ["经营层", "看准交、库存、质量与产能红线", "command"],
              ["计划员", "处理阻塞工单并冻结今日计划", "fulfillment"],
              ["现场", "扫码报工并回写异常", "shopfloor"],
              ["质量", "关闭偏差并归档追溯链", "quality"],
              ["IT/实施", "校验主数据和接口健康", "implementation"],
            ].map(([role, task, target]) => (
              <button key={role} className="journey-item" type="button" onClick={() => onNavigate(target as Surface)}>
                <strong>{role}</strong>
                <span>{task}</span>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
        </div>
      </section>
      <EventPanel events={snapshot.events} />
    </div>
  );
}

function Fulfillment({ snapshot, query, actions, busy }: { snapshot: Snapshot; query: string; actions: ReturnType<typeof actionShape>; busy: string | null }) {
  const orders = filterOrders(snapshot.orders, query);
  return (
    <div className="screen-stack">
      <section className="split wide-left">
        <div className="panel">
          <SectionTitle icon={Route} title="订单履约池" />
          <div className="table-list">
            {orders.map((order) => (
              <article className="work-card" key={order.id}>
                <div>
                  <strong>{order.id} · {order.sku}</strong>
                  <span>{order.customer} / {order.line} / 交期 {order.due}</span>
                </div>
                <Progress value={order.progress} />
                <StatusPill value={order.status} />
                <button className="small-action" type="button" onClick={() => actions.advanceOrder(order.id)} disabled={busy === order.id}>
                  <Play size={15} /> 报工推进
                </button>
              </article>
            ))}
          </div>
        </div>
        <div className="panel">
          <SectionTitle icon={BarChart3} title="产线负载" />
          <div className="line-stack">
            {snapshot.lines.map((line) => (
              <div className="line-row" key={line.id}>
                <span>{line.name}</span>
                <Progress value={line.load} />
                <b>{line.status}</b>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="panel">
        <SectionTitle icon={Layers3} title="工艺路线与质检点" />
        <div className="route-grid">
          {snapshot.processRoutes.map((route) => (
            <article className="route-card" key={route.id}>
              <strong>{route.product} · {route.version}</strong>
              <span>{route.line} / {route.cycleTime} / {route.status}</span>
              <div>{route.steps.map((step) => <em key={step.sequence}>{step.name}</em>)}</div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Shopfloor({ snapshot, actions, busy }: { snapshot: Snapshot; actions: ReturnType<typeof actionShape>; busy: string | null }) {
  return (
    <section className="split">
      <div className="panel phone-panel">
        <SectionTitle icon={Smartphone} title="移动扫码任务" />
        {snapshot.mobileTasks.map((task) => (
          <article className="mobile-task" key={task.id}>
            <ScanLine size={22} />
            <div>
              <strong>{task.title}</strong>
              <span>{task.target} / {task.scanCode}</span>
              <p>{task.instruction}</p>
            </div>
            <button className="small-action" type="button" onClick={() => actions.completeMobile(task.id)} disabled={busy === task.id || task.status === "已完成"}>
              <CheckCircle2 size={15} /> {task.status}
            </button>
          </article>
        ))}
      </div>
      <div className="panel">
        <SectionTitle icon={Gauge} title="现场大屏" />
        <div className="kanban-grid">
          {snapshot.kanbanBoards.map((board) => (
            <article key={board.id}>
              <strong>{board.name}</strong>
              <span>{board.audience} / {board.scope}</span>
              <p>{board.widgets.join(" · ")}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Quality({ snapshot, actions, busy }: { snapshot: Snapshot; actions: ReturnType<typeof actionShape>; busy: string | null }) {
  return (
    <section className="split">
      <div className="panel">
        <SectionTitle icon={ClipboardCheck} title="质量偏差闭环" />
        <div className="table-list">
          {snapshot.qualityIssues.map((issue) => (
            <IssueCard key={issue.id} item={issue} busy={busy} onClose={actions.closeQuality} />
          ))}
        </div>
      </div>
      <div className="panel">
        <SectionTitle icon={ShieldCheck} title="追溯链" />
        <div className="trace-chain">
          {["来料批次", "工序扫码", "首件确认", "巡检记录", "成品放行", "客户追溯"].map((step, index) => (
            <span key={step}><b>{index + 1}</b>{step}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Materials({ snapshot, actions, busy }: { snapshot: Snapshot; actions: ReturnType<typeof actionShape>; busy: string | null }) {
  return (
    <section className="split">
      <div className="panel">
        <SectionTitle icon={Boxes} title="物料与齐套" />
        <div className="table-list">
          {snapshot.materials.map((item) => (
            <MaterialCard key={item.id} item={item} busy={busy} onReplenish={actions.replenish} />
          ))}
        </div>
      </div>
      <div className="panel">
        <SectionTitle icon={Truck} title="供应协同" />
        <div className="supply-cards">
          {snapshot.salesOpportunities.map((item) => (
            <article key={item.id}>
              <strong>{item.customer}</strong>
              <span>{item.stage}</span>
              <p>{item.nextStep}</p>
              <button className="small-action" type="button" onClick={() => actions.convert(item.id)} disabled={busy === item.id || item.status === "已转实施"}>
                转入实施
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Implementation({ snapshot, actions, busy }: { snapshot: Snapshot; actions: ReturnType<typeof actionShape>; busy: string | null }) {
  return (
    <div className="screen-stack">
      <section className="panel">
        <SectionTitle icon={BadgeCheck} title="7 步上线路径" />
        <div className="phase-track">
          {snapshot.implementationPhases.map((phase) => (
            <article key={phase.id} className={phase.status === "进行中" ? "current" : ""}>
              <strong>{phase.name}</strong>
              <span>{phase.owner} / {phase.time}</span>
              <p>{phase.detail}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="split">
        <div className="panel">
          <SectionTitle icon={Database} title="主数据准备度" />
          <div className="table-list">
            {snapshot.masterDataChecks.map((item) => (
              <article className="data-check" key={item.id}>
                <div>
                  <strong>{item.domain}</strong>
                  <span>{item.source} / {item.owner} / {item.issues} 个问题</span>
                </div>
                <Progress value={item.readiness} />
                <button className="small-action" type="button" onClick={() => actions.verifyMasterData(item.id)} disabled={busy === item.id || item.status === "已校验"}>
                  校验
                </button>
              </article>
            ))}
          </div>
        </div>
        <div className="panel">
          <SectionTitle icon={Users} title="角色启用" />
          <div className="activation-list">
            {snapshot.activationTasks.map((task) => (
              <article key={task.id}>
                <strong>{task.role}</strong>
                <span>{task.workspace}</span>
                <p>{task.firstAction}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Platform({ snapshot, actions, busy }: { snapshot: Snapshot; actions: ReturnType<typeof actionShape>; busy: string | null }) {
  return (
    <div className="screen-stack">
      <section className="platform-grid">
        {[
          ["云原生架构", "容器化、弹性扩容、持续迭代", Database],
          ["低代码配置", "字段、流程、报表、权限和行业模板", Settings2],
          ["开放接口", "ERP、PLM、WMS、IoT 和身份系统", PlugZap],
          ["工业智能体", "排程、ChatBI、异常归因和质量预测", BrainCircuit],
        ].map(([title, body, Icon]) => (
          <article className="capability-card" key={title as string}>
            <Icon size={22} />
            <strong>{title}</strong>
            <span>{body}</span>
          </article>
        ))}
      </section>
      <section className="split">
        <div className="panel">
          <SectionTitle icon={PlugZap} title="集成健康" />
          <div className="table-list">
            {snapshot.integrations.map((item) => <IntegrationCard key={item.id} item={item} busy={busy} onSync={actions.syncIntegration} />)}
          </div>
        </div>
        <div className="panel">
          <SectionTitle icon={FileClock} title="审计与数据库" />
          <div className="db-grid">
            <Metric label="数据库" value={snapshot.databaseAdmin.status} tone="good" />
            <Metric label="表数量" value={`${snapshot.databaseAdmin.tableCount}`} tone="info" />
            <Metric label="记录数" value={`${snapshot.databaseAdmin.totalRows}`} tone="info" />
            <Metric label="备份数" value={`${snapshot.databaseAdmin.backups.length}`} tone="info" />
          </div>
          <div className="audit-list">
            {snapshot.auditLogs.slice(0, 6).map((log) => (
              <span key={log.id}>{log.actor} / {log.action} / {log.entity}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function AdminCenter({ snapshot }: { snapshot: Snapshot }) {
  const permissionLabels: Record<string, string> = {
    "orders:write": "工单推进",
    "schedule:write": "排程调整",
    "quality:write": "质量处理",
    "inventory:write": "库存操作",
    "config:read": "配置查看",
    "config:write": "配置维护",
    "dashboard:read": "经营看板",
    "approval:write": "审批放行",
    "audit:read": "审计查看",
    "execution:write": "现场报工",
    "mobile:write": "移动任务",
    "routes:read": "工艺查看",
    "workflow:write": "流程处理",
    "integrations:read": "接口查看",
    "integrations:write": "接口维护",
    "users:read": "员工查看",
  };
  const permissionKeys = Array.from(new Set(snapshot.users.flatMap((user) => user.permissions)));

  return (
    <div className="screen-stack">
      <section className="admin-hero panel">
        <div>
          <p className="eyebrow">Tenant Admin Console</p>
          <h2>企业租户、员工、角色与操作权限</h2>
          <p>一家制造企业上线 MES 后，后台不是摆设。IT/实施负责人需要管理公司组织、工厂范围、岗位角色、可操作模块、接口权限和审计追踪，保证每个员工只看到、只操作自己该负责的生产对象。</p>
        </div>
        <div className="admin-tenant-card">
          <Factory size={22} />
          <strong>{snapshot.tenant.name}</strong>
          <span>{snapshot.tenant.plan} / {snapshot.tenant.plants} 工厂 / {snapshot.tenant.users} 员工</span>
        </div>
      </section>

      <section className="split wide-left">
        <div className="panel">
          <SectionTitle icon={Users} title="员工与数据范围" />
          <div className="employee-grid">
            {snapshot.users.map((user) => <EmployeeCard key={user.id} user={user} />)}
          </div>
        </div>
        <div className="panel">
          <SectionTitle icon={ShieldCheck} title="权限设计原则" />
          <div className="policy-list">
            {[
              ["最小权限", "生产员工只能报工和执行移动任务，不能改排程或接口。"],
              ["按工厂隔离", "员工默认只进入所在工厂、车间、产线的数据范围。"],
              ["关键动作审计", "补货、关闭偏差、同步接口、重置数据都进入审计日志。"],
              ["岗位工作台", "登录后按照角色进入经营、计划、现场、质量、仓储或后台。"],
            ].map(([title, body]) => (
              <article key={title}>
                <strong>{title}</strong>
                <span>{body}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <SectionTitle icon={UserCog} title="角色权限矩阵" />
        <div className="permission-table">
          <div className="permission-row head">
            <span>员工</span>
            {permissionKeys.map((key) => <span key={key}>{permissionLabels[key] || key}</span>)}
          </div>
          {snapshot.users.map((user) => (
            <div className="permission-row" key={user.id}>
              <strong>{user.name}<small>{user.role}</small></strong>
              {permissionKeys.map((key) => (
                <span key={key} className={user.permissions.includes(key) ? "granted" : ""}>
                  {user.permissions.includes(key) ? "允许" : "拒绝"}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="split">
        <div className="panel">
          <SectionTitle icon={FileClock} title="最近审计" />
          <div className="audit-list">
            {snapshot.auditLogs.slice(0, 8).map((log) => (
              <span key={log.id}>{log.createdAt} / {log.actor} / {log.action} / {log.entity}</span>
            ))}
          </div>
        </div>
        <div className="panel">
          <SectionTitle icon={Database} title="后台数据对象" />
          <div className="db-grid">
            <Metric label="员工" value={`${snapshot.users.length}`} tone="info" />
            <Metric label="权限项" value={`${permissionKeys.length}`} tone="info" />
            <Metric label="接口" value={`${snapshot.integrations.length}`} tone="info" />
            <Metric label="审计" value={`${snapshot.auditLogs.length}`} tone="good" />
          </div>
        </div>
      </section>
    </div>
  );
}

function EmployeeCard({ user }: { user: Employee }) {
  return (
    <article className="employee-card">
      <div>
        <strong>{user.name}</strong>
        <span>{user.role}</span>
      </div>
      <p>{user.department} / {user.plant}</p>
      <em>{user.status} / {user.lastActive}</em>
      <div>
        {user.permissions.slice(0, 4).map((permission) => <b key={permission}>{permission}</b>)}
      </div>
    </article>
  );
}

function PackageCard({ item, busy, onPlan }: { item: CommercialPackage; busy: string | null; onPlan: (id: string) => void }) {
  return (
    <article className="package-card">
      <span className="badge">{item.status}</span>
      <h3>{item.name}</h3>
      <p>{item.target}</p>
      <strong>{item.priceModel}</strong>
      <span>{item.scope}</span>
      <em>{item.roi}</em>
      <button className="small-action" type="button" onClick={() => onPlan(item.id)} disabled={busy === item.id}>
        生成方案
      </button>
    </article>
  );
}

function RecommendationCard({ item, busy, onAccept }: { item: Recommendation; busy: string | null; onAccept: (id: string) => void }) {
  return (
    <article className="recommendation-card">
      <span className={`severity ${item.severity}`}>{item.severity}</span>
      <div>
        <strong>{item.title}</strong>
        <p>{item.body}</p>
        <em>{item.impact}</em>
      </div>
      <button className="small-action" type="button" onClick={() => onAccept(item.id)} disabled={busy === item.id || item.accepted}>
        {item.accepted ? "已执行" : "执行"}
      </button>
    </article>
  );
}

function IssueCard({ item, busy, onClose }: { item: QualityIssue; busy: string | null; onClose: (id: string) => void }) {
  return (
    <article className="work-card">
      <div>
        <strong>{item.id} · {item.batch}</strong>
        <span>{item.source} / {item.owner} / 根因：{item.rootCause}</span>
      </div>
      <span className={`severity ${item.severity}`}>{item.severity}</span>
      <StatusPill value={item.status} />
      <button className="small-action" type="button" onClick={() => onClose(item.id)} disabled={busy === item.id || item.status === "已关闭"}>
        关闭
      </button>
    </article>
  );
}

function MaterialCard({ item, busy, onReplenish }: { item: Material; busy: string | null; onReplenish: (id: string) => void }) {
  const risk = item.stock < item.safeStock;
  return (
    <article className="work-card">
      <div>
        <strong>{item.id} · {item.name}</strong>
        <span>{item.location} / 关联 {item.linkedOrders.join("、")}</span>
      </div>
      <Progress value={Math.min(100, Math.round((item.stock / item.safeStock) * 100))} />
      <StatusPill value={risk ? "风险" : "正常"} />
      <button className="small-action" type="button" onClick={() => onReplenish(item.id)} disabled={busy === item.id || !risk}>
        补货
      </button>
    </article>
  );
}

function IntegrationCard({ item, busy, onSync }: { item: Integration; busy: string | null; onSync: (id: string) => void }) {
  return (
    <article className="work-card">
      <div>
        <strong>{item.name}</strong>
        <span>{item.type} / 最近同步 {item.lastSync}</span>
      </div>
      <StatusPill value={item.status === "已连接" ? "正常" : item.status === "告警" ? "风险" : "阻塞"} />
      <button className="small-action" type="button" onClick={() => onSync(item.id)} disabled={busy === item.id}>
        同步
      </button>
    </article>
  );
}

function EventPanel({ events }: { events: EventItem[] }) {
  return (
    <div className="panel event-panel">
      <SectionTitle icon={FileClock} title="实时事件流" />
      <ol>
        {events.slice(0, 8).map((event) => (
          <li key={event.id}>
            <span>{event.time}</span>
            <strong>{event.type}</strong>
            <p>{event.message}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "good" | "warn" | "risk" | "info" }) {
  return (
    <article className={`metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof Factory; title: string }) {
  return (
    <div className="section-title">
      <Icon size={18} />
      <h2>{title}</h2>
    </div>
  );
}

function Progress({ value }: { value: number }) {
  return <span className="progress"><i style={{ width: `${Math.max(4, Math.min(100, value))}%` }} /></span>;
}

function StatusPill({ value }: { value: string }) {
  const className = value === "正常" || value === "完成" || value === "已连接" ? "ok" : value === "风险" || value === "告警" ? "warn" : "risk";
  return <span className={`status-pill ${className}`}>{value}</span>;
}

function filterOrders(orders: WorkOrder[], query: string) {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return orders;
  return orders.filter((order) => [order.id, order.customer, order.sku, order.line, order.status].some((field) => field.toLowerCase().includes(keyword)));
}

function avg(values: number[]) {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length));
}

function lowStock(materials: Material[]) {
  return materials.filter((item) => item.stock < item.safeStock).length;
}

function openQuality(issues: QualityIssue[]) {
  return issues.filter((issue) => issue.status !== "已关闭").length;
}

function onTime(snapshot: Snapshot) {
  const risk = snapshot.orders.filter((order) => order.status === "风险" || order.status === "阻塞").length;
  return Math.max(80, 98 - risk * 4 - lowStock(snapshot.materials) * 2);
}

function actionShape() {
  return {
    planPackage: (_id: string) => undefined,
    convert: (_id: string) => undefined,
    executeRecommendation: (_id: string) => undefined,
    advanceOrder: (_id: string) => undefined,
    closeQuality: (_id: string) => undefined,
    replenish: (_id: string) => undefined,
    completeMobile: (_id: string) => undefined,
    verifyMasterData: (_id: string) => undefined,
    syncIntegration: (_id: string) => undefined,
    reset: () => undefined,
    exception: () => undefined,
  };
}

const _viewKeyGuard: ViewKey | null = null;
void _viewKeyGuard;

export default App;
