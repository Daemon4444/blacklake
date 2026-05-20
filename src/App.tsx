import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BellRing,
  Boxes,
  BrainCircuit,
  Calculator,
  CalendarClock,
  ChevronRight,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Database,
  Factory,
  FileClock,
  GitPullRequestArrow,
  GitBranch,
  HardDrive,
  KeyRound,
  Layers3,
  LayoutDashboard,
  LineChart,
  LogOut,
  LucideIcon,
  PackageCheck,
  Play,
  PlugZap,
  RadioTower,
  RefreshCw,
  Rocket,
  Route,
  ScanLine,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Smartphone,
  ServerCog,
  Users,
  Wrench,
} from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  AuditLog,
  ActivationTask,
  CommercialPackage,
  Employee,
  EquipmentAsset,
  EventItem,
  ImplementationPhase,
  IndustryTemplate,
  Integration,
  IntelligenceInsight,
  KanbanBoard,
  Line,
  Material,
  MasterDataCheck,
  MobileTask,
  ProcessRoute,
  QualityIssue,
  Recommendation,
  Rule,
  SalesOpportunity,
  Snapshot,
  ViewKey,
  WorkOrder,
  WorkflowInstance,
} from "./data";

const navItems: { key: ViewKey; label: string; icon: LucideIcon }[] = [
  { key: "command", label: "总览工作台", icon: LayoutDashboard },
  { key: "commercial", label: "商业化官网", icon: Rocket },
  { key: "onboarding", label: "客户启动", icon: BadgeCheck },
  { key: "planning", label: "订单排程", icon: Route },
  { key: "execution", label: "生产执行", icon: Play },
  { key: "kanban", label: "看板中心", icon: LayoutDashboard },
  { key: "mobile", label: "移动现场", icon: Smartphone },
  { key: "quality", label: "质量闭环", icon: ClipboardCheck },
  { key: "inventory", label: "物料库存", icon: Boxes },
  { key: "mrp", label: "主计划 MRP", icon: CalendarClock },
  { key: "procurement", label: "采购供应商", icon: ShoppingCart },
  { key: "costing", label: "成本财务", icon: Calculator },
  { key: "model", label: "工厂模型", icon: GitBranch },
  { key: "routes", label: "工艺路线", icon: ClipboardList },
  { key: "equipment", label: "设备资源", icon: Wrench },
  { key: "intelligence", label: "数据智能", icon: LineChart },
  { key: "agent", label: "工业智能体", icon: BrainCircuit },
  { key: "rules", label: "规则配置", icon: Settings2 },
  { key: "templates", label: "配置模板", icon: Layers3 },
  { key: "workflow", label: "流程引擎", icon: GitPullRequestArrow },
  { key: "integrations", label: "开放集成", icon: PlugZap },
  { key: "audit", label: "审计日志", icon: FileClock },
  { key: "database", label: "系统数据库", icon: Database },
  { key: "implementation", label: "实施蓝图", icon: Rocket },
];

type RoleKey = "coo" | "planner" | "production" | "quality" | "warehouse" | "procurement" | "equipment" | "finance" | "it";

type RoleProfile = {
  key: RoleKey;
  label: string;
  buyer: string;
  mission: string;
  success: string;
  firstActions: { label: string; detail: string; view: ViewKey }[];
};

const roleProfiles: RoleProfile[] = [
  {
    key: "coo",
    label: "COO / 工厂总经理",
    buyer: "经营层",
    mission: "跨工厂看交付、库存、质量与产能风险，确认需要管理层介入的动作。",
    success: "准交率、产能利用率、库存周转、异常关闭时长",
    firstActions: [
      { label: "看今日红线", detail: "从准交、缺料、质量和产线负载判断经营风险。", view: "command" },
      { label: "看商业 ROI", detail: "理解首厂试点、多厂复制和集团运营的商业价值。", view: "commercial" },
      { label: "启动首厂上线", detail: "确认角色启用、主数据准备度和实施路径。", view: "onboarding" },
    ],
  },
  {
    key: "planner",
    label: "计划员",
    buyer: "供应链计划",
    mission: "把订单、产能、物料和质量约束放到同一张计划工作台，处理例外并冻结计划。",
    success: "计划响应速度、齐套率、产能冲突数、延期风险",
    firstActions: [
      { label: "处理订单风险", detail: "查看阻塞工单、交期、客户优先级和排程建议。", view: "planning" },
      { label: "查看预测洞察", detail: "识别准交、库存和产能的提前预警。", view: "intelligence" },
      { label: "核对工艺约束", detail: "确认 BOM、工序、SOP 与产线能力是否匹配。", view: "routes" },
    ],
  },
  {
    key: "production",
    label: "生产主管 / 班组长",
    buyer: "车间生产",
    mission: "接收派工、推进报工、处理现场异常，让真实进度回到计划层。",
    success: "报工及时率、工单进度准确率、停线时长、换线效率",
    firstActions: [
      { label: "移动扫码报工", detail: "用手机或 PDA 扫工单并回写现场进度。", view: "mobile" },
      { label: "查看现场大屏", detail: "按班组关注派工、节拍、设备告警和待料。", view: "kanban" },
      { label: "查看工艺 SOP", detail: "按产品二维码进入工序、质检点和作业指导。", view: "routes" },
    ],
  },
  {
    key: "quality",
    label: "质量经理 / 质检员",
    buyer: "质量管理",
    mission: "围绕批次、工序、检验点和责任人完成偏差闭环与追溯。",
    success: "一次合格率、偏差关闭时长、追溯完整率、质量成本",
    firstActions: [
      { label: "移动质检确认", detail: "扫码批次并把复检结果写入追溯链。", view: "mobile" },
      { label: "追溯工厂模型", detail: "定位产线、设备、质检中心与仓储对象。", view: "model" },
      { label: "复核质量规则", detail: "确认质量阈值、升级策略和审计链路。", view: "rules" },
    ],
  },
  {
    key: "warehouse",
    label: "仓库 / 物料员",
    buyer: "仓储物流",
    mission: "以工单齐套为中心处理备料、发料、退料、低库存和盘点。",
    success: "库存准确率、缺料次数、备料及时率、库位周转",
    firstActions: [
      { label: "移动扫码发料", detail: "扫描库位与物料，把发料结果同步到库存。", view: "mobile" },
      { label: "生成补货", detail: "把低库存转换为采购或调拨建议。", view: "mrp" },
      { label: "同步 WMS", detail: "检查仓储接口与库存事件是否正常。", view: "integrations" },
    ],
  },
  {
    key: "procurement",
    label: "采购员",
    buyer: "采购供应",
    mission: "把 MRP 缺口变成采购申请，并跟踪供应商交期、价格与质量风险。",
    success: "供应准时率、采购提前期、价格差异、供应异常响应",
    firstActions: [
      { label: "处理采购建议", detail: "从 MRP 缺料例外进入供应建议。", view: "mrp" },
      { label: "确认供应商", detail: "查看供应商评分、风险和采购申请入口。", view: "procurement" },
      { label: "同步 ERP", detail: "把采购、成本和库存交易同步到外部系统。", view: "integrations" },
    ],
  },
  {
    key: "equipment",
    label: "设备工程师",
    buyer: "设备与资源",
    mission: "看设备健康、IoT 指标、点检保养和产线影响，把设备异常闭环到生产计划。",
    success: "OEE、MTBF、MTTR、计划保养完成率",
    firstActions: [
      { label: "查看设备健康", detail: "按产线查看设备状态、健康分和传感器指标。", view: "equipment" },
      { label: "维护工厂模型", detail: "确认设备、工位、产线和权限关系。", view: "model" },
      { label: "推进设备流程", detail: "将点检保养与生产变更流程联动。", view: "workflow" },
    ],
  },
  {
    key: "finance",
    label: "财务 / 成本会计",
    buyer: "财务成本",
    mission: "把报工、耗料、采购价差、质量损失汇总为 WIP 与成本差异。",
    success: "成本差异率、关账时长、凭证一致性、质量成本",
    firstActions: [
      { label: "查看成本差异", detail: "检查 WIP、待过账报工和质量成本事件。", view: "costing" },
      { label: "看经营指标", detail: "关注成本、交付、库存和质量指标趋势。", view: "intelligence" },
      { label: "复核审计", detail: "查看生产、库存、质量、接口动作记录。", view: "audit" },
    ],
  },
  {
    key: "it",
    label: "IT / 实施顾问",
    buyer: "信息化与实施",
    mission: "配置租户、权限、工厂模型、接口和上线阶段，保证系统可复制交付。",
    success: "上线周期、接口成功率、权限合规、扩厂复制速度",
    firstActions: [
      { label: "检查上线蓝图", detail: "跟踪诊断、主数据、接口、试点和验收。", view: "implementation" },
      { label: "生成售前方案", detail: "把套餐、行业包、ROI 和实施路径转为商机。", view: "commercial" },
      { label: "转入客户启动", detail: "把商机、角色、主数据和接口变成上线任务。", view: "onboarding" },
      { label: "配置运营看板", detail: "发布角色化看板、投屏布局和刷新策略。", view: "kanban" },
    ],
  },
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
  const [activeView, setActiveView] = useState<ViewKey>("command");
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<RoleKey>("planner");
  const [activeUserId, setActiveUserId] = useState(() => localStorage.getItem("zhuyun-user-id") || "U-1001");
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem("zhuyun-session") === "active");

  async function refresh() {
    const next = await request<Snapshot>("/api/snapshot", activeUserId);
    setSnapshot(next);
    setActiveRole((next.currentUser.roleKey as RoleKey) || "planner");
  }

  async function mutate(path: string, actionLabel: string) {
    setBusyAction(actionLabel);
    try {
      const next = await request<Snapshot>(path, activeUserId, { method: "POST", body: "{}" });
      setSnapshot(next);
      setActiveRole((next.currentUser.roleKey as RoleKey) || "planner");
      setError(null);
      setNotice("操作已写入系统，并同步到事件流与审计日志");
      window.setTimeout(() => setNotice(null), 2600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setBusyAction(null);
    }
  }

  async function loginAs(userId: string, password = "demo123") {
    setBusyAction(userId);
    try {
      localStorage.setItem("zhuyun-user-id", userId);
      setActiveUserId(userId);
      const next = await request<Snapshot>("/api/auth/login", userId, { method: "POST", body: JSON.stringify({ userId, password }) });
      setSnapshot(next);
      setActiveRole((next.currentUser.roleKey as RoleKey) || "planner");
      localStorage.setItem("zhuyun-session", "active");
      setIsAuthenticated(true);
      setError(null);
      setNotice(`${next.currentUser.name} 已登录，后端会按该员工写入协同事件与审计`);
      window.setTimeout(() => setNotice(null), 2600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
      setIsAuthenticated(false);
    } finally {
      setBusyAction(null);
    }
  }

  function logout() {
    localStorage.removeItem("zhuyun-session");
    setIsAuthenticated(false);
    setActiveView("command");
    setNotice(null);
  }

  useEffect(() => {
    refresh().catch((err) => setError(err.message));
    if (!isAuthenticated) return undefined;
    const stream = new EventSource(`/api/events/stream?userId=${activeUserId}`);
    stream.onmessage = () => refresh().catch(() => undefined);
    stream.onerror = () => stream.close();
    return () => stream.close();
  }, [activeUserId, isAuthenticated]);

  const metrics = useMemo(() => {
    if (!snapshot) return [];
    const riskyOrders = snapshot.orders.filter((order) => order.status === "风险" || order.status === "阻塞").length;
    const avgProgress = Math.round(snapshot.orders.reduce((sum, order) => sum + order.progress, 0) / snapshot.orders.length);
    const lowStock = snapshot.materials.filter((item) => item.stock < item.safeStock).length;
    const openQuality = snapshot.qualityIssues.filter((issue) => issue.status !== "已关闭").length;
    return [
      { label: "准交预测", value: `${Math.max(82, 98 - riskyOrders * 3)}%`, tone: "green" },
      { label: "工单平均进度", value: `${avgProgress}%`, tone: "blue" },
      { label: "缺料风险", value: `${lowStock} 项`, tone: lowStock > 0 ? "amber" : "green" },
      { label: "质量待闭环", value: `${openQuality} 单`, tone: openQuality > 0 ? "red" : "green" },
    ];
  }, [snapshot]);

  const filteredOrders = useMemo(() => {
    if (!snapshot) return [];
    const keyword = search.trim().toLowerCase();
    if (!keyword) return snapshot.orders;
    return snapshot.orders.filter((order) =>
      [order.id, order.customer, order.sku, order.line, order.status].some((field) => field.toLowerCase().includes(keyword)),
    );
  }, [snapshot, search]);

  const currentRole = roleProfiles.find((role) => role.key === activeRole) || roleProfiles[0];

  if (!snapshot) {
    return (
      <div className="boot-screen">
        <div className="brand-mark">Z</div>
        <strong>正在连接制造协同平台</strong>
        <span>{error || "加载租户、权限、生产数据与实时事件流..."}</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen
        snapshot={snapshot}
        activeUserId={activeUserId}
        busyAction={busyAction}
        error={error}
        onLogin={loginAs}
        onSelectUser={setActiveUserId}
      />
    );
  }

  const api = {
    executeRecommendation: (id: string) => mutate(`/api/recommendations/${id}/execute`, id),
    createCommercialPlan: (id: string) => mutate(`/api/commercial/${id}/plan`, id),
    convertOpportunity: (id: string) => mutate(`/api/opportunities/${id}/convert`, id),
    completeActivation: (id: string) => mutate(`/api/activation/${id}/complete`, id),
    verifyMasterData: (id: string) => mutate(`/api/master-data/${id}/verify`, id),
    advanceWorkflow: (id: string) => mutate(`/api/workflows/${id}/advance`, id),
    advanceOrder: (id: string) => mutate(`/api/orders/${id}/advance`, id),
    closeQuality: (id: string) => mutate(`/api/quality/${id}/close`, id),
    replenish: (id: string) => mutate(`/api/materials/${id}/replenish`, id),
    inspectQuality: (id: string) => mutate(`/api/quality/${id}/inspect`, id),
    inspectLine: (id: string) => mutate(`/api/model/${id}/inspect`, id),
    publishRoute: (id: string) => mutate(`/api/routes/${id}/publish`, id),
    publishKanban: (id: string) => mutate(`/api/kanban/${id}/publish`, id),
    triggerException: () => mutate("/api/events/exception", "exception"),
    toggleRule: (id: string) => mutate(`/api/rules/${id}/toggle`, id),
    syncIntegration: (id: string) => mutate(`/api/integrations/${id}/sync`, id),
    completeEquipmentCheck: (id: string) => mutate(`/api/equipment/${id}/check`, id),
    resolveInsight: (id: string) => mutate(`/api/insights/${id}/resolve`, id),
    advanceImplementation: (id: string) => mutate(`/api/implementation/${id}/advance`, id),
    completeMobileTask: (id: string) => mutate(`/api/mobile/${id}/complete`, id),
    applyTemplate: (id: string) => mutate(`/api/templates/${id}/apply`, id),
    reset: () => mutate("/api/admin/reset", "reset"),
    backupDatabase: () => mutate("/api/admin/database/backup", "database-backup"),
  };

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onChange={setActiveView} snapshot={snapshot} />
      <main className="app-main">
        <Topbar
          search={search}
          snapshot={snapshot}
          busyAction={busyAction}
          activeRole={activeRole}
          roles={roleProfiles}
          activeUserId={activeUserId}
          onSearch={setSearch}
          onLogin={loginAs}
          onLogout={logout}
          onTriggerException={api.triggerException}
          onReset={api.reset}
        />
        {error && <div className="error-banner">{error}</div>}
        {notice && <div className="success-banner">{notice}</div>}
        {activeView === "command" && (
          <CommandCenter
            metrics={metrics}
            snapshot={snapshot}
            onAccept={api.executeRecommendation}
            busyAction={busyAction}
            roleProfile={currentRole}
            onNavigate={setActiveView}
          />
        )}
        {activeView === "commercial" && (
          <CommercialSite
            snapshot={snapshot}
            onCreatePlan={api.createCommercialPlan}
            onConvert={api.convertOpportunity}
            busyAction={busyAction}
            onNavigate={setActiveView}
          />
        )}
        {activeView === "onboarding" && (
          <CustomerOnboarding
            snapshot={snapshot}
            onConvert={api.convertOpportunity}
            onCompleteActivation={api.completeActivation}
            onVerifyMasterData={api.verifyMasterData}
            onNavigate={setActiveView}
            busyAction={busyAction}
          />
        )}
        {activeView === "planning" && (
          <PlanningBoard orders={filteredOrders} recommendations={snapshot.recommendations} onAccept={api.executeRecommendation} busyAction={busyAction} />
        )}
        {activeView === "execution" && <Execution orders={filteredOrders} onAdvance={api.advanceOrder} busyAction={busyAction} />}
        {activeView === "kanban" && <KanbanCenter snapshot={snapshot} onPublish={api.publishKanban} busyAction={busyAction} />}
        {activeView === "mobile" && <MobileWorkstation tasks={snapshot.mobileTasks} onComplete={api.completeMobileTask} busyAction={busyAction} />}
        {activeView === "quality" && <Quality issues={snapshot.qualityIssues} onClose={api.closeQuality} onInspect={api.inspectQuality} busyAction={busyAction} />}
        {activeView === "inventory" && <Inventory materials={snapshot.materials} onReplenish={api.replenish} busyAction={busyAction} />}
        {activeView === "mrp" && <MRP snapshot={snapshot} onReplenish={api.replenish} busyAction={busyAction} />}
        {activeView === "procurement" && <Procurement snapshot={snapshot} onReplenish={api.replenish} busyAction={busyAction} />}
        {activeView === "costing" && <Costing snapshot={snapshot} onSync={api.syncIntegration} busyAction={busyAction} />}
        {activeView === "model" && <FactoryModel lines={snapshot.lines} onInspect={api.inspectLine} busyAction={busyAction} />}
        {activeView === "routes" && <ProcessRoutes routes={snapshot.processRoutes} onPublish={api.publishRoute} busyAction={busyAction} />}
        {activeView === "equipment" && <EquipmentResources assets={snapshot.equipmentAssets} onCheck={api.completeEquipmentCheck} busyAction={busyAction} />}
        {activeView === "intelligence" && <DataIntelligence snapshot={snapshot} onResolve={api.resolveInsight} busyAction={busyAction} />}
        {activeView === "agent" && <Agent snapshot={snapshot} onAccept={api.executeRecommendation} busyAction={busyAction} />}
        {activeView === "rules" && <Rules rules={snapshot.rules} onToggle={api.toggleRule} busyAction={busyAction} />}
        {activeView === "templates" && <IndustryTemplates templates={snapshot.industryTemplates} onApply={api.applyTemplate} busyAction={busyAction} />}
        {activeView === "workflow" && <WorkflowEngine workflows={snapshot.workflowInstances} onAdvance={api.advanceWorkflow} busyAction={busyAction} />}
        {activeView === "integrations" && <Integrations integrations={snapshot.integrations} onSync={api.syncIntegration} busyAction={busyAction} />}
        {activeView === "audit" && <Audit logs={snapshot.auditLogs} />}
        {activeView === "database" && <DatabaseManagement snapshot={snapshot} onBackup={api.backupDatabase} onReset={api.reset} busyAction={busyAction} />}
        {activeView === "implementation" && (
          <Implementation phases={snapshot.implementationPhases} onAdvance={api.advanceImplementation} busyAction={busyAction} />
        )}
      </main>
    </div>
  );
}

function Sidebar({ activeView, onChange, snapshot }: { activeView: ViewKey; onChange: (view: ViewKey) => void; snapshot: Snapshot }) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">Z</div>
        <div>
          <strong>铸云智造</strong>
          <span>Manufacturing SaaS</span>
        </div>
      </div>
      <nav className="side-nav" aria-label="SaaS 模块">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button className={activeView === item.key ? "active" : ""} key={item.key} type="button" onClick={() => onChange(item.key)}>
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="tenant-card">
        <Factory size={18} />
        <div>
          <strong>{snapshot.tenant.name}</strong>
          <span>{snapshot.tenant.plants} 工厂 · {snapshot.tenant.lines} 产线 · {snapshot.tenant.users} 用户</span>
        </div>
      </div>
    </aside>
  );
}

function LoginScreen({
  snapshot,
  activeUserId,
  busyAction,
  error,
  onLogin,
  onSelectUser,
}: {
  snapshot: Snapshot;
  activeUserId: string;
  busyAction: string | null;
  error: string | null;
  onLogin: (userId: string, password?: string) => void;
  onSelectUser: (userId: string) => void;
}) {
  const [password, setPassword] = useState("demo123");
  const activeUser = snapshot.users.find((user) => user.id === activeUserId) || snapshot.users[0];

  return (
    <main className="login-shell">
      <section className="login-brand">
        <div className="brand-mark">Z</div>
        <p className="eyebrow">Enterprise Manufacturing SaaS</p>
        <h1>登录铸云智造企业租户</h1>
        <p>
          一家公司内的计划、车间、质量、仓储、IT 和经营层员工从这里进入同一套后端数据。
          登录后，系统会按当前员工写入协同事件、审计日志与在线状态。
        </p>
        <div className="login-proof">
          <span><ShieldCheck size={15} /> 员工身份</span>
          <span><Database size={15} /> 租户数据隔离</span>
          <span><FileClock size={15} /> 操作审计</span>
        </div>
      </section>
      <section className="login-card">
        <div className="panel-title"><KeyRound size={18} /><h2>员工账号登录</h2></div>
        <label>
          <span>企业租户</span>
          <input value={`${snapshot.tenant.name} · ${snapshot.tenant.plan}`} readOnly />
        </label>
        <label>
          <span>员工账号</span>
          <select value={activeUserId} onChange={(event) => onSelectUser(event.target.value)}>
            {snapshot.users.map((user) => (
              <option value={user.id} key={user.id}>{user.name} · {user.role} · {user.email}</option>
            ))}
          </select>
        </label>
        <label>
          <span>密码</span>
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="演示密码 demo123" />
        </label>
        <p className="login-hint">演示环境统一密码：demo123。生产版本应替换为企业 SSO、OIDC 或钉钉/飞书/企业微信登录。</p>
        {activeUser && (
          <div className="login-user-preview">
            <strong>{activeUser.name}</strong>
            <span>{activeUser.title} · {activeUser.department} · {activeUser.plant}</span>
          </div>
        )}
        {error && <div className="error-banner">{error === "HTTP 401" ? "密码不正确，演示密码为 demo123" : error}</div>}
        <button className="button primary" type="button" onClick={() => onLogin(activeUserId, password)} disabled={busyAction === activeUserId}>
          <KeyRound size={16} /> 登录系统
        </button>
        <div className="login-sso-row">
          <button className="button secondary" type="button" disabled>企业微信 SSO</button>
          <button className="button secondary" type="button" disabled>飞书 SSO</button>
        </div>
      </section>
    </main>
  );
}

function Topbar({
  snapshot,
  search,
  busyAction,
  activeRole,
  roles,
  activeUserId,
  onSearch,
  onLogin,
  onLogout,
  onTriggerException,
  onReset,
}: {
  snapshot: Snapshot;
  search: string;
  busyAction: string | null;
  activeRole: RoleKey;
  roles: RoleProfile[];
  activeUserId: string;
  onSearch: (value: string) => void;
  onLogin: (value: string, password?: string) => void;
  onLogout: () => void;
  onTriggerException: () => void;
  onReset: () => void;
}) {
  const activeProfile = roles.find((role) => role.key === activeRole);
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Cloud MES · APS · QMS · WMS · AI Agent</p>
        <h1>制造协同操作系统</h1>
        <p className="session-line">
          {snapshot.currentUser.name} · {snapshot.currentUser.title} · {snapshot.currentUser.department} · {snapshot.tenant.plan}
        </p>
      </div>
      <div className="topbar-actions">
        <label className="role-select-field">
          <Users size={16} />
          <select value={activeUserId} onChange={(event) => onLogin(event.target.value)} aria-label="员工登录">
            {snapshot.users.map((user) => <option value={user.id} key={user.id}>{user.name} · {user.role}</option>)}
          </select>
        </label>
        <span className="login-scope">{activeProfile?.buyer || snapshot.currentUser.role} · {snapshot.currentUser.plant}</span>
        <label className="search-field">
          <Search size={16} />
          <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="搜索工单、客户、产线" />
        </label>
        <button className="button secondary exception-action" type="button" onClick={onTriggerException} disabled={busyAction === "exception"}>
          <AlertTriangle size={16} />
          触发现场异常
        </button>
        <button className="button bare reset-action" type="button" onClick={onReset} disabled={busyAction === "reset"}>
          <RefreshCw size={16} />
          重置环境
        </button>
        <button className="button bare logout-action" type="button" onClick={onLogout}>
          <LogOut size={16} />
          退出
        </button>
      </div>
    </header>
  );
}

function CommandCenter({
  metrics,
  snapshot,
  onAccept,
  busyAction,
  roleProfile,
  onNavigate,
}: {
  metrics: { label: string; value: string; tone: string }[];
  snapshot: Snapshot;
  onAccept: (id: string) => void;
  busyAction: string | null;
  roleProfile: RoleProfile;
  onNavigate: (view: ViewKey) => void;
}) {
  const riskOrders = snapshot.orders.filter((order) => order.status === "风险" || order.status === "阻塞");
  const lowStock = snapshot.materials.filter((item) => item.stock < item.safeStock);
  const activeAgent = snapshot.recommendations.find((item) => !item.accepted) || snapshot.recommendations[0];

  return (
    <section className="view-stack">
      <RoleLaunchpad profile={roleProfile} onNavigate={onNavigate} />
      <div className="ai-hero">
        <div className="ai-hero-copy">
          <span className="ai-state"><RadioTower size={15} /> AI Manufacturing Copilot Online</span>
          <h2>工厂智能体正在重排今日生产态势</h2>
          <p>
            汇聚订单、产线、库存、质量与规则引擎，持续把现场噪声压缩成可执行动作。
            当前最高优先级建议：{activeAgent?.title}
          </p>
          <div className="ai-hero-actions">
            {activeAgent && (
              <button className="button primary" type="button" onClick={() => onAccept(activeAgent.id)} disabled={busyAction === activeAgent.id}>
                <Sparkles size={16} /> 执行首要建议
              </button>
            )}
            <span>{snapshot.events.length} 条实时事件 · {snapshot.auditLogs.length} 条审计轨迹</span>
          </div>
        </div>
        <div className="neural-orbit" aria-hidden="true">
          <span className="orbit-core">AI</span>
          <i className="orbit orbit-a"></i>
          <i className="orbit orbit-b"></i>
          <b className="pulse p1"></b>
          <b className="pulse p2"></b>
          <b className="pulse p3"></b>
        </div>
      </div>
      <div className="metric-grid">
        {metrics.map((metric) => (
          <article className={`metric-card ${metric.tone}`} key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.label === "准交预测" ? "AI forecast" : metric.label === "工单平均进度" ? "Live MES" : metric.label === "缺料风险" ? "WMS signal" : "QMS loop"}</small>
          </article>
        ))}
      </div>
      <div className="dashboard-grid">
        <Panel title="今日风险队列" icon={AlertTriangle}>
          <div className="dense-list">
            {riskOrders.map((order) => (
              <div className="risk-row" key={order.id}>
                <StatusPill status={order.status} />
                <div>
                  <strong>{order.id}</strong>
                  <span>{order.customer} · {order.sku}</span>
                </div>
                <em>{order.due}</em>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="产线负载" icon={Activity}>
          <LineLoad lines={snapshot.lines} />
        </Panel>
        <Panel title="缺料预警" icon={PackageCheck}>
          <div className="dense-list">
            {lowStock.map((item) => (
              <div className="stock-row" key={item.id}>
                <strong>{item.id}</strong>
                <span>{item.name}</span>
                <Progress value={Math.round((item.stock / item.safeStock) * 100)} tone="amber" />
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="企业级运行态" icon={Database}>
          <SystemReadiness snapshot={snapshot} />
        </Panel>
        <Panel title="在线协同" icon={Users}>
          <EmployeePresence users={snapshot.users} currentUser={snapshot.currentUser} />
        </Panel>
        <Panel title="AI 建议" icon={Sparkles} wide>
          <RecommendationList recommendations={snapshot.recommendations.slice(0, 2)} onAccept={onAccept} busyAction={busyAction} />
        </Panel>
        <Panel title="协同事件流" icon={LineChart} wide>
          <EventFeed events={snapshot.events} />
        </Panel>
      </div>
    </section>
  );
}

function RoleLaunchpad({ profile, onNavigate }: { profile: RoleProfile; onNavigate: (view: ViewKey) => void }) {
  return (
    <section className="role-launchpad">
      <div className="role-summary">
        <span className="ai-state"><Users size={15} /> {profile.buyer}</span>
        <h2>{profile.label} 今天如何使用铸云智造</h2>
        <p>{profile.mission}</p>
        <small>衡量指标：{profile.success}</small>
      </div>
      <div className="role-task-grid">
        {profile.firstActions.map((action, index) => (
          <button className="role-task" type="button" key={action.label} onClick={() => onNavigate(action.view)}>
            <span>0{index + 1}</span>
            <strong>{action.label}</strong>
            <small>{action.detail}</small>
            <em>进入模块 <ChevronRight size={14} /></em>
          </button>
        ))}
      </div>
    </section>
  );
}

function CommercialSite({
  snapshot,
  onCreatePlan,
  onConvert,
  busyAction,
  onNavigate,
}: {
  snapshot: Snapshot;
  onCreatePlan: (id: string) => void;
  onConvert: (id: string) => void;
  busyAction: string | null;
  onNavigate: (view: ViewKey) => void;
}) {
  const heroMetrics = [
    { label: "首厂上线", value: "4-8 周" },
    { label: "按需付费", value: "模块化" },
    { label: "对接系统", value: `${snapshot.integrations.length}+` },
  ];
  const salesMotion = [
    ["价值诊断", "导入订单、库存、质量和产线样本，测算 ROI。"],
    ["样板产线", "用 Starter 或 Professional 跑通真实工单闭环。"],
    ["首厂上线", "完成 ERP/PLM/WMS 接口、培训、验收和审计。"],
    ["扩厂复制", "复用行业模板、工艺路线、看板和实施蓝图。"],
  ];

  return (
    <section className="view-stack">
      <div className="commercial-hero">
        <div>
          <span className="ai-state"><Rocket size={15} /> Go-to-market page</span>
          <h2>云端制造协同 SaaS，从样板产线卖到集团运营</h2>
          <p>对外讲清楚“为什么买、怎么买、多久上线、怎么证明 ROI”。页面里的套餐、行业包、实施路径和售前方案都连接到当前产品模块与审计。</p>
          <div className="commercial-actions">
            <button className="button primary" type="button" onClick={() => onCreatePlan("PKG-PRO")} disabled={busyAction === "PKG-PRO"}>
              <Rocket size={16} /> 生成主推售前方案
            </button>
            <button className="button secondary" type="button" onClick={() => onNavigate("implementation")}>
              <ClipboardList size={16} /> 查看实施蓝图
            </button>
            <button className="button ghost" type="button" onClick={() => onNavigate("onboarding")}>
              <BadgeCheck size={16} /> 进入客户启动
            </button>
          </div>
        </div>
        <div className="commercial-hero-metrics">
          {heroMetrics.map((item) => (
            <article key={item.label}><span>{item.label}</span><strong>{item.value}</strong></article>
          ))}
        </div>
      </div>
      <div className="commercial-proof">
        {["小投入、大回报", "四周起快速实施", "按需配置付费", "开放 API 集成", "专业实施陪跑"].map((item) => (
          <span key={item}><CheckCircle2 size={15} /> {item}</span>
        ))}
      </div>
      <div className="commercial-grid">
        {snapshot.commercialPackages.map((item) => (
          <CommercialPackageCard item={item} onCreatePlan={onCreatePlan} busyAction={busyAction} key={item.id} />
        ))}
      </div>
      <div className="commercial-layout">
        <Panel title="销售路径" icon={Route}>
          <div className="sales-motion">
            {salesMotion.map(([title, body], index) => (
              <article key={title}>
                <span>{index + 1}</span>
                <div><strong>{title}</strong><p>{body}</p></div>
              </article>
            ))}
          </div>
        </Panel>
        <Panel title="已打通商机" icon={Database}>
          <OpportunityList opportunities={snapshot.salesOpportunities} packages={snapshot.commercialPackages} onConvert={onConvert} busyAction={busyAction} />
        </Panel>
      </div>
    </section>
  );
}

function CommercialPackageCard({
  item,
  onCreatePlan,
  busyAction,
}: {
  item: CommercialPackage;
  onCreatePlan: (id: string) => void;
  busyAction: string | null;
}) {
  return (
    <article className={`commercial-card ${item.status === "主推" ? "featured" : ""}`}>
      <div className="card-head">
        <div><strong>{item.name}</strong><span>{item.id} · {item.target}</span></div>
        <span className={item.status === "主推" ? "stock-badge" : "stock-badge muted-badge"}>{item.status}</span>
      </div>
      <p>{item.scope}</p>
      <div className="commercial-meta">
        <div><span>收费口径</span><strong>{item.priceModel}</strong></div>
        <div><span>上线承诺</span><strong>{item.implementation}</strong></div>
        <div><span>ROI 话术</span><strong>{item.roi}</strong></div>
      </div>
      <div className="kanban-widgets">
        <strong>绑定模块</strong>
        <div>{item.modules.map((module) => <span key={module}>{module}</span>)}</div>
      </div>
      <button className="button secondary" type="button" onClick={() => onCreatePlan(item.id)} disabled={busyAction === item.id}>
        <Rocket size={16} /> 生成售前方案
      </button>
    </article>
  );
}

function OpportunityList({
  opportunities,
  packages,
  onConvert,
  busyAction,
}: {
  opportunities: SalesOpportunity[];
  packages: CommercialPackage[];
  onConvert?: (id: string) => void;
  busyAction?: string | null;
}) {
  return (
    <div className="opportunity-list">
      {opportunities.map((item) => {
        const selectedPackage = packages.find((pkg) => pkg.id === item.packageId);
        return (
          <article key={item.id}>
            <div><strong>{item.customer}</strong><span>{selectedPackage?.name || item.packageId}</span></div>
            <em>{item.stage}</em>
            <p>{item.nextStep}</p>
            <small>{item.owner} · {item.status}</small>
            {onConvert && (
              <button className="button secondary compact-button" type="button" onClick={() => onConvert(item.id)} disabled={busyAction === item.id || item.status === "已转实施"}>
                <BadgeCheck size={15} /> {item.status === "已转实施" ? "已进入实施" : "转入客户启动"}
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}

function CustomerOnboarding({
  snapshot,
  onConvert,
  onCompleteActivation,
  onVerifyMasterData,
  onNavigate,
  busyAction,
}: {
  snapshot: Snapshot;
  onConvert: (id: string) => void;
  onCompleteActivation: (id: string) => void;
  onVerifyMasterData: (id: string) => void;
  onNavigate: (view: ViewKey) => void;
  busyAction: string | null;
}) {
  const activeOpportunity = snapshot.salesOpportunities.find((item) => item.status !== "已转实施") || snapshot.salesOpportunities[0];
  const convertedCount = snapshot.salesOpportunities.filter((item) => item.status === "已转实施").length;
  const activationDone = snapshot.activationTasks.filter((item) => item.status === "已完成").length;
  const dataScore = snapshot.masterDataChecks.length
    ? Math.round(snapshot.masterDataChecks.reduce((sum, item) => sum + item.readiness, 0) / snapshot.masterDataChecks.length)
    : 0;
  const activePhase = snapshot.implementationPhases.find((phase) => phase.status === "进行中");
  const nextDataCheck = snapshot.masterDataChecks.find((item) => item.status !== "已校验");

  return (
    <section className="view-stack">
      <div className="activation-hero">
        <div>
          <span className="ai-state"><BadgeCheck size={15} /> Customer activation workspace</span>
          <h2>把商机变成客户公司真正会用的上线路径</h2>
          <p>
            这里承接商业化官网生成的售前方案，把客户内部角色、主数据、接口、实施阶段和首个业务动作编排成可推进、可审计的启动工作台。
          </p>
          <div className="commercial-actions">
            {activeOpportunity && (
              <button className="button primary" type="button" onClick={() => onConvert(activeOpportunity.id)} disabled={busyAction === activeOpportunity.id || activeOpportunity.status === "已转实施"}>
                <Rocket size={16} /> {activeOpportunity.status === "已转实施" ? "已转实施" : "转入实施蓝图"}
              </button>
            )}
            {nextDataCheck && (
              <button className="button secondary" type="button" onClick={() => onVerifyMasterData(nextDataCheck.id)} disabled={busyAction === nextDataCheck.id}>
                <Database size={16} /> 校验下一组主数据
              </button>
            )}
            <button className="button ghost" type="button" onClick={() => onNavigate("implementation")}>
              <ClipboardList size={16} /> 查看蓝图阶段
            </button>
          </div>
        </div>
        <div className="activation-scorecard">
          <article><span>已转实施商机</span><strong>{convertedCount}/{snapshot.salesOpportunities.length}</strong></article>
          <article><span>角色启用完成</span><strong>{activationDone}/{snapshot.activationTasks.length}</strong></article>
          <article><span>主数据准备度</span><strong>{dataScore}%</strong></article>
          <article><span>当前蓝图阶段</span><strong>{activePhase?.name || "扩厂复制"}</strong></article>
        </div>
      </div>

      <div className="activation-layout">
        <Panel title="商机到实施" icon={Rocket}>
          <OpportunityList opportunities={snapshot.salesOpportunities} packages={snapshot.commercialPackages} onConvert={onConvert} busyAction={busyAction} />
        </Panel>
        <Panel title="上线入口顺序" icon={Route}>
          <div className="activation-path">
            {[
              ["售前方案", "确认套餐、ROI、试点线与报价口径"],
              ["客户启动", "把角色、主数据和系统边界拆成任务"],
              ["实施蓝图", "按阶段推进诊断、建模、集成和试点"],
              ["首厂验收", "用真实订单证明生产、质量、库存闭环"],
            ].map(([title, body], index) => (
              <article key={title}>
                <span>{index + 1}</span>
                <div><strong>{title}</strong><p>{body}</p></div>
              </article>
            ))}
          </div>
        </Panel>
      </div>

      <div className="activation-layout main">
        <Panel title="角色启用任务" icon={Users} wide>
          <ActivationTaskList tasks={snapshot.activationTasks} onComplete={onCompleteActivation} busyAction={busyAction} />
        </Panel>
        <Panel title="主数据准备度" icon={Database} wide>
          <MasterDataReadiness checks={snapshot.masterDataChecks} onVerify={onVerifyMasterData} busyAction={busyAction} />
        </Panel>
      </div>
    </section>
  );
}

function ActivationTaskList({
  tasks,
  onComplete,
  busyAction,
}: {
  tasks: ActivationTask[];
  onComplete: (id: string) => void;
  busyAction: string | null;
}) {
  return (
    <div className="activation-task-list">
      {tasks.map((task) => (
        <article className="activation-task" key={task.id}>
          <div className="card-head">
            <div><strong>{task.role}</strong><span>{task.workspace} · {task.owner}</span></div>
            <span className={task.status === "已完成" ? "stock-badge" : task.status === "进行中" ? "stock-badge warning" : "stock-badge muted-badge"}>{task.status}</span>
          </div>
          <p>{task.firstAction}</p>
          <small>{task.successMetric}</small>
          <button className="button secondary compact-button" type="button" onClick={() => onComplete(task.id)} disabled={busyAction === task.id || task.status === "已完成"}>
            <CheckCircle2 size={15} /> {task.status === "已完成" ? "已完成" : "完成启用"}
          </button>
        </article>
      ))}
    </div>
  );
}

function MasterDataReadiness({
  checks,
  onVerify,
  busyAction,
}: {
  checks: MasterDataCheck[];
  onVerify: (id: string) => void;
  busyAction: string | null;
}) {
  return (
    <div className="master-data-list">
      {checks.map((check) => {
        const tone = check.readiness >= 90 ? "green" : check.readiness >= 75 ? "amber" : "red";
        return (
          <article className="master-data-row" key={check.id}>
            <div>
              <strong>{check.domain}</strong>
              <span>{check.source} · {check.owner}</span>
            </div>
            <div className="readiness-meter">
              <Progress value={check.readiness} tone={tone} />
              <small>{check.readiness}% · {check.issues} 个异常</small>
            </div>
            <span className={check.status === "已校验" ? "stock-badge" : check.status === "待校验" ? "stock-badge warning" : "stock-badge danger"}>{check.status}</span>
            <button className="icon-action" type="button" onClick={() => onVerify(check.id)} disabled={busyAction === check.id || check.status === "已校验"}>
              <ShieldCheck size={15} />
              校验
            </button>
          </article>
        );
      })}
    </div>
  );
}

function PlanningBoard({
  orders,
  recommendations,
  onAccept,
  busyAction,
}: {
  orders: WorkOrder[];
  recommendations: Recommendation[];
  onAccept: (id: string) => void;
  busyAction: string | null;
}) {
  return (
    <section className="view-stack">
      <ViewHeader title="订单与动态排程" subtitle="按交期、产能、物料、质量约束计算风险，并通过 AI 重排形成可解释方案。" icon={Route} />
      <div className="planning-layout">
        <div className="order-board">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="card-head">
                <div>
                  <strong>{order.id}</strong>
                  <span>{order.customer}</span>
                </div>
                <StatusPill status={order.status} />
              </div>
              <h3>{order.sku}</h3>
              <div className="order-meta">
                <span>{order.line}</span>
                <span>{order.due}</span>
                <span>{order.priority}</span>
              </div>
              <Progress value={order.progress} tone={order.status === "阻塞" ? "red" : "green"} />
              <div className="blockers">
                {order.blockers.length ? order.blockers.map((blocker) => <span key={blocker}>{blocker}</span>) : <span>无阻塞</span>}
              </div>
            </article>
          ))}
        </div>
        <Panel title="AI 排程建议" icon={BrainCircuit}>
          <RecommendationList recommendations={recommendations} onAccept={onAccept} busyAction={busyAction} />
        </Panel>
      </div>
    </section>
  );
}

function Execution({ orders, onAdvance, busyAction }: { orders: WorkOrder[]; onAdvance: (id: string) => void; busyAction: string | null }) {
  return (
    <section className="view-stack">
      <ViewHeader title="生产执行" subtitle="班组长视角：派工、报工、首件确认、工序推进与异常同步。" icon={Play} />
      <div className="table-card">
        <table>
          <thead>
            <tr><th>工单</th><th>产品</th><th>产线</th><th>状态</th><th>进度</th><th>动作</th></tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td><strong>{order.id}</strong><span>{order.customer}</span></td>
                <td>{order.sku}</td>
                <td>{order.line}</td>
                <td><StatusPill status={order.status} /></td>
                <td><Progress value={order.progress} tone="blue" /></td>
                <td>
                  <button className="icon-action" type="button" onClick={() => onAdvance(order.id)} disabled={busyAction === order.id}>
                    <CheckCircle2 size={16} /> 报工
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function KanbanCenter({
  snapshot,
  onPublish,
  busyAction,
}: {
  snapshot: Snapshot;
  onPublish: (id: string) => void;
  busyAction: string | null;
}) {
  const boards = snapshot.kanbanBoards;
  const published = boards.filter((board) => board.status === "已发布").length;
  const widgetCount = boards.reduce((sum, board) => sum + board.widgets.length, 0);
  const avgOee = Math.round(snapshot.lines.reduce((sum, line) => sum + line.oee, 0) / Math.max(snapshot.lines.length, 1));
  const riskCount = snapshot.orders.filter((order) => order.status !== "正常").length;

  return (
    <section className="view-stack">
      <ViewHeader title="看板中心与生产统计" subtitle="面向管理层、车间和质量团队配置可发布的实时看板，把生产状态、指标、异常和投屏布局统一管理。" icon={LayoutDashboard} />
      <div className="kanban-command">
        <div>
          <span className="ai-state"><RadioTower size={15} /> Live production boards</span>
          <h2>让不同 ToB 角色拿起就能看见自己的现场</h2>
          <p>看板不是固定报表，而是按受众、范围、刷新频率和组件组合发布。发布动作会进入事件流和审计，用于首厂上线、班组投屏和集团运营复盘。</p>
        </div>
        <div className="kanban-live-grid">
          <article><span>准交预测</span><strong>{Math.max(82, 98 - riskCount * 3)}%</strong></article>
          <article><span>平均 OEE</span><strong>{avgOee}%</strong></article>
          <article><span>待处理异常</span><strong>{riskCount + snapshot.qualityIssues.filter((issue) => issue.status !== "已关闭").length}</strong></article>
        </div>
      </div>
      <div className="metric-grid">
        <article className="metric-card green"><span>已发布看板</span><strong>{published}/{boards.length}</strong><small>Board release</small></article>
        <article className="metric-card blue"><span>组件总数</span><strong>{widgetCount}</strong><small>Widgets</small></article>
        <article className="metric-card amber"><span>最快刷新</span><strong>15s</strong><small>Shopfloor live</small></article>
        <article className="metric-card red"><span>投屏场景</span><strong>3</strong><small>COO / 车间 / QA</small></article>
      </div>
      <div className="kanban-grid">
        {boards.map((board) => (
          <KanbanCard board={board} snapshot={snapshot} onPublish={onPublish} busyAction={busyAction} key={board.id} />
        ))}
      </div>
    </section>
  );
}

function KanbanCard({
  board,
  snapshot,
  onPublish,
  busyAction,
}: {
  board: KanbanBoard;
  snapshot: Snapshot;
  onPublish: (id: string) => void;
  busyAction: string | null;
}) {
  const line = snapshot.lines[board.id === "KB-SHOP" ? 1 : 0] || snapshot.lines[0];
  const openIssues = snapshot.qualityIssues.filter((issue) => issue.status !== "已关闭").length;
  const progress = board.status === "已发布" ? 100 : board.status === "变更中" ? 68 : 28;

  return (
    <article className={`kanban-card ${board.status === "已发布" ? "released" : ""}`}>
      <div className="card-head">
        <div><strong>{board.name}</strong><span>{board.id} · {board.audience}</span></div>
        <span className={board.status === "已发布" ? "stock-badge" : "stock-badge danger"}>{board.status}</span>
      </div>
      <div className="kanban-preview">
        <div className="preview-top">
          <span>{board.layout}</span>
          <em>{board.refreshRate}</em>
        </div>
        <div className="preview-metrics">
          <article><span>{line?.name || "产线"}</span><strong>{line?.oee || 0}%</strong><small>OEE</small></article>
          <article><span>工单进度</span><strong>{Math.round(snapshot.orders.reduce((sum, order) => sum + order.progress, 0) / Math.max(snapshot.orders.length, 1))}%</strong><small>MES</small></article>
          <article><span>质量待闭环</span><strong>{openIssues}</strong><small>QMS</small></article>
        </div>
        <Progress value={progress} tone={board.status === "已发布" ? "green" : "amber"} />
      </div>
      <dl className="kanban-meta">
        <div><dt>范围</dt><dd>{board.scope}</dd></div>
        <div><dt>负责人</dt><dd>{board.owner}</dd></div>
        <div><dt>上次发布</dt><dd>{board.lastPublished}</dd></div>
      </dl>
      <div className="kanban-widgets">
        <strong>看板组件</strong>
        <div>{board.widgets.map((widget) => <span key={widget}>{widget}</span>)}</div>
      </div>
      <footer>
        <span><RadioTower size={15} /> {board.status === "已发布" ? "已进入实时刷新" : "等待发布到角色工作台"}</span>
        <button className="button secondary" type="button" onClick={() => onPublish(board.id)} disabled={busyAction === board.id || board.status === "已发布"}>
          <LayoutDashboard size={16} /> {board.status === "已发布" ? "已发布" : "发布看板"}
        </button>
      </footer>
    </article>
  );
}

function MobileWorkstation({
  tasks,
  onComplete,
  busyAction,
}: {
  tasks: MobileTask[];
  onComplete: (id: string) => void;
  busyAction: string | null;
}) {
  const [scanCode, setScanCode] = useState(tasks.find((task) => task.status === "待执行")?.scanCode || "");
  const pendingTasks = tasks.filter((task) => task.status !== "已完成");
  const completed = tasks.length - pendingTasks.length;
  const matchedTask = tasks.find((task) => task.scanCode.toLowerCase() === scanCode.trim().toLowerCase());
  const sampleTask = pendingTasks[0] || tasks[0];

  return (
    <section className="view-stack">
      <ViewHeader title="移动现场与扫码作业" subtitle="面向班组、仓库、质检的手机/PDA 工作台：扫码、确认、回写、审计一次完成。" icon={Smartphone} />
      <div className="mobile-workspace">
        <div className="handheld-frame">
          <div className="phone-speaker" />
          <div className="mobile-screen">
            <div className="mobile-status">
              <span>现场在线</span>
              <strong>{completed}/{tasks.length}</strong>
            </div>
            <label className="scan-field">
              <ScanLine size={18} />
              <input value={scanCode} onChange={(event) => setScanCode(event.target.value)} placeholder="扫描工单 / 批次 / 库位码" />
            </label>
            <button className="button primary" type="button" onClick={() => sampleTask && setScanCode(sampleTask.scanCode)} disabled={!sampleTask}>
              <ScanLine size={16} /> 模拟扫码
            </button>
            <article className="scan-result">
              <span>{matchedTask ? matchedTask.type : "等待扫码"}</span>
              <strong>{matchedTask?.title || "未匹配现场任务"}</strong>
              <p>{matchedTask?.instruction || "扫描任务码后，系统会自动匹配工单、物料或批次，并把执行结果写回业务流。"}</p>
              {matchedTask && (
                <button className="button secondary" type="button" disabled={busyAction === matchedTask.id || matchedTask.status === "已完成"} onClick={() => onComplete(matchedTask.id)}>
                  <CheckCircle2 size={16} /> {matchedTask.status === "已完成" ? "已完成" : "确认执行"}
                </button>
              )}
            </article>
          </div>
        </div>
        <div className="mobile-task-board">
          <div className="metric-grid mobile-metrics">
            <article className="metric-card green"><span>待执行任务</span><strong>{pendingTasks.length}</strong><small>扫码队列</small></article>
            <article className="metric-card blue"><span>已完成</span><strong>{completed}</strong><small>回写业务流</small></article>
            <article className="metric-card amber"><span>支持场景</span><strong>3 类</strong><small>报工/发料/质检</small></article>
          </div>
          <div className="mobile-task-list">
            {tasks.map((task) => (
              <article className="mobile-task-card" key={task.id}>
                <div className="card-head">
                  <div><strong>{task.title}</strong><span>{task.owner} · {task.scanCode}</span></div>
                  <span className={task.status === "已完成" ? "stock-badge" : "stock-badge danger"}>{task.status}</span>
                </div>
                <p>{task.instruction}</p>
                <footer>
                  <span>{task.type} · {task.target}</span>
                  <button className="icon-action" type="button" onClick={() => setScanCode(task.scanCode)}>
                    <ScanLine size={15} /> 扫码
                  </button>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Quality({
  issues,
  onClose,
  onInspect,
  busyAction,
}: {
  issues: QualityIssue[];
  onClose: (id: string) => void;
  onInspect: (id: string) => void;
  busyAction: string | null;
}) {
  return (
    <section className="view-stack">
      <ViewHeader title="质量追溯与偏差闭环" subtitle="质量问题进入任务闭环，关联批次、工序、责任人和根因。" icon={ClipboardCheck} />
      <div className="issue-grid">
        {issues.map((issue) => (
          <article className="issue-card" key={issue.id}>
            <div className="card-head">
              <strong>{issue.id}</strong>
              <span className={`severity ${issue.severity}`}>{issue.severity}</span>
            </div>
            <h3>{issue.rootCause}</h3>
            <dl>
              <div><dt>批次</dt><dd>{issue.batch}</dd></div>
              <div><dt>来源</dt><dd>{issue.source}</dd></div>
              <div><dt>负责人</dt><dd>{issue.owner}</dd></div>
              <div><dt>状态</dt><dd>{issue.status}</dd></div>
            </dl>
            <button
              className="button secondary"
              type="button"
              disabled={busyAction === issue.id}
              onClick={() => (issue.status === "已关闭" ? onInspect(issue.id) : onClose(issue.id))}
            >
              <ShieldCheck size={16} /> {issue.status === "已关闭" ? "查看追溯" : "关闭偏差"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function Inventory({ materials, onReplenish, busyAction }: { materials: Material[]; onReplenish: (id: string) => void; busyAction: string | null }) {
  return (
    <section className="view-stack">
      <ViewHeader title="物料库存与齐套分析" subtitle="库存不是静态表格，而是影响工单交付风险的实时约束。" icon={Boxes} />
      <div className="inventory-grid">
        {materials.map((material) => {
          const ratio = Math.round((material.stock / material.safeStock) * 100);
          const low = material.stock < material.safeStock;
          return (
            <article className="material-card" key={material.id}>
              <div className="card-head">
                <div><strong>{material.id}</strong><span>{material.location}</span></div>
                <span className={low ? "stock-badge danger" : "stock-badge"}>{low ? "低库存" : "充足"}</span>
              </div>
              <h3>{material.name}</h3>
              <Progress value={Math.min(ratio, 120)} tone={low ? "amber" : "green"} />
              <p>{material.stock} / 安全库存 {material.safeStock}</p>
              <div className="blockers">{material.linkedOrders.map((order) => <span key={order}>{order}</span>)}</div>
              <button className="button secondary" type="button" onClick={() => onReplenish(material.id)} disabled={busyAction === material.id}>
                <RefreshCw size={16} /> 创建补货
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function MRP({ snapshot, onReplenish, busyAction }: { snapshot: Snapshot; onReplenish: (id: string) => void; busyAction: string | null }) {
  const lowMaterials = snapshot.materials.filter((material) => material.stock < material.safeStock);
  return (
    <section className="view-stack">
      <ViewHeader title="主计划与 MRP" subtitle="把销售订单、预测、库存、安全库存、产能与生产订单放在同一张计划工作台里。" icon={CalendarClock} />
      <div className="erp-workspace">
        <Panel title="计划例外" icon={AlertTriangle}>
          <div className="dense-list">
            {lowMaterials.map((material) => (
              <div className="stock-row" key={material.id}>
                <strong>{material.id}</strong>
                <span>{material.name} · 影响 {material.linkedOrders.join(" / ")}</span>
                <Progress value={Math.round((material.stock / material.safeStock) * 100)} tone="amber" />
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="供应建议" icon={CalendarClock}>
          <div className="suggestion-table">
            {lowMaterials.map((material) => (
              <article key={material.id}>
                <strong>{material.name}</strong>
                <span>建议补货 {material.safeStock + 260 - material.stock} · 提前期 2 天 · 来源 MRP</span>
                <button className="icon-action" type="button" disabled={busyAction === material.id} onClick={() => onReplenish(material.id)}>
                  <ShoppingCart size={15} /> 生成采购申请
                </button>
              </article>
            ))}
          </div>
        </Panel>
        <Panel title="产能粗排" icon={Activity}>
          <LineLoad lines={snapshot.lines} />
        </Panel>
      </div>
    </section>
  );
}

function Procurement({ snapshot, onReplenish, busyAction }: { snapshot: Snapshot; onReplenish: (id: string) => void; busyAction: string | null }) {
  const suppliers = [
    { name: "恒远包材", score: "A-", risk: "交付稳定", material: snapshot.materials[0] },
    { name: "启明电子", score: "B+", risk: "价格波动", material: snapshot.materials[2] },
    { name: "北岭五金", score: "B", risk: "需复核交期", material: snapshot.materials[3] },
  ];
  return (
    <section className="view-stack">
      <ViewHeader title="采购与供应商协同" subtitle="从缺料风险进入询价、采购申请、供应商绩效和到货承诺管理。" icon={ShoppingCart} />
      <div className="config-grid">
        {suppliers.map((supplier) => (
          <article className="config-card" key={supplier.name}>
            <div className="card-head">
              <div><strong>{supplier.name}</strong><span>供应商评分 {supplier.score}</span></div>
              <span className={supplier.risk.includes("复核") ? "stock-badge danger" : "stock-badge"}>{supplier.risk}</span>
            </div>
            <p>关联物料：{supplier.material?.name || "待分配"}。支持采购申请、价格协议、到货承诺和供应异常升级。</p>
            {supplier.material && (
              <button className="button secondary" type="button" disabled={busyAction === supplier.material.id} onClick={() => onReplenish(supplier.material.id)}>
                <ShoppingCart size={16} /> 创建采购申请
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function Costing({ snapshot, onSync, busyAction }: { snapshot: Snapshot; onSync: (id: string) => void; busyAction: string | null }) {
  const totalProgress = snapshot.orders.reduce((sum, order) => sum + order.progress, 0);
  const estimatedWip = Math.round(totalProgress * 1280);
  const variance = snapshot.qualityIssues.filter((issue) => issue.status !== "已关闭").length * 2.4;
  return (
    <section className="view-stack">
      <ViewHeader title="成本与财务过账" subtitle="把生产报工、物料消耗、质量偏差和采购价格联动到 WIP、成本差异与 ERP 凭证。" icon={Calculator} />
      <div className="metric-grid">
        <article className="metric-card blue"><span>在制品估值</span><strong>¥{estimatedWip.toLocaleString()}</strong><small>WIP valuation</small></article>
        <article className="metric-card amber"><span>成本差异</span><strong>{variance.toFixed(1)}%</strong><small>Production variance</small></article>
        <article className="metric-card green"><span>待过账报工</span><strong>{snapshot.orders.filter((order) => order.progress > 50).length}</strong><small>MES journals</small></article>
        <article className="metric-card red"><span>质量成本事件</span><strong>{snapshot.qualityIssues.filter((issue) => issue.status !== "已关闭").length}</strong><small>QMS impact</small></article>
      </div>
      <div className="config-grid">
        {snapshot.integrations.map((integration) => (
          <article className="config-card" key={integration.id}>
            <div className="card-head">
              <div><strong>{integration.name}</strong><span>{integration.type} · 财务/供应链接口</span></div>
              <span className={integration.status === "告警" ? "stock-badge danger" : "stock-badge"}>{integration.status}</span>
            </div>
            <p>最近同步：{integration.lastSync}。用于成本凭证、采购单、库存交易和财务对账。</p>
            <button className="button secondary" type="button" onClick={() => onSync(integration.id)} disabled={busyAction === integration.id}>
              <PlugZap size={16} /> 同步凭证
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function FactoryModel({
  lines,
  onInspect,
  busyAction,
}: {
  lines: Line[];
  onInspect: (id: string) => void;
  busyAction: string | null;
}) {
  const nodes = [
    { id: "TENANT", label: "集团租户", icon: Users, meta: "多租户隔离" },
    { id: "PLANT-EAST", label: "华东一厂", icon: Factory, meta: "组织与权限" },
    ...lines.map((line) => ({ id: line.id, label: line.name, icon: Route, meta: `${line.status} · OEE ${line.oee}%` })),
    { id: "QC", label: "质检中心", icon: ShieldCheck, meta: "批次追溯" },
    { id: "WH", label: "中央仓", icon: Boxes, meta: "齐套与库位" },
    { id: "EAM", label: "设备台账", icon: Wrench, meta: "点检维保" },
  ];
  return (
    <section className="view-stack">
      <ViewHeader title="工厂建模" subtitle="把组织、工厂、产线、工位、设备、人员和权限建成可复用的数字对象。" icon={GitBranch} />
      <div className="model-canvas">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          return (
            <button
              className={`model-node node-${index}`}
              key={`${node.label}-${index}`}
              type="button"
              onClick={() => onInspect(node.id)}
            >
              <Icon size={20} />
              <strong>{node.label}</strong>
              <span>{node.meta}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ProcessRoutes({
  routes,
  onPublish,
  busyAction,
}: {
  routes: ProcessRoute[];
  onPublish: (id: string) => void;
  busyAction: string | null;
}) {
  const published = routes.filter((route) => route.status === "已发布").length;
  const totalSteps = routes.reduce((sum, route) => sum + route.steps.length, 0);
  const releasedSteps = routes.reduce((sum, route) => sum + route.steps.filter((step) => step.status === "已发布").length, 0);
  const bomLines = routes.reduce((sum, route) => sum + route.bom.length, 0);

  return (
    <section className="view-stack">
      <ViewHeader title="工艺路线与 BOM" subtitle="把产品版本、物料清单、工序、质检点、SOP 和二维码发布到现场执行，形成可追溯的工程主数据。" icon={ClipboardList} />
      <div className="metric-grid">
        <article className="metric-card green"><span>已发布路线</span><strong>{published}/{routes.length}</strong><small>Route release</small></article>
        <article className="metric-card blue"><span>工序发布率</span><strong>{Math.round((releasedSteps / Math.max(totalSteps, 1)) * 100)}%</strong><small>Operation steps</small></article>
        <article className="metric-card amber"><span>BOM 行数</span><strong>{bomLines}</strong><small>Material master</small></article>
        <article className="metric-card red"><span>现场二维码</span><strong>{routes.length}</strong><small>QR to SOP</small></article>
      </div>
      <div className="route-grid">
        {routes.map((route) => {
          const routeProgress = Math.round((route.steps.filter((step) => step.status === "已发布").length / route.steps.length) * 100);
          return (
            <article className={`route-card ${route.status === "已发布" ? "released" : ""}`} key={route.id}>
              <div className="card-head">
                <div><strong>{route.product}</strong><span>{route.id} · {route.version} · {route.line}</span></div>
                <span className={route.status === "已发布" ? "stock-badge" : "stock-badge danger"}>{route.status}</span>
              </div>
              <div className="route-release">
                <div>
                  <span>发布完成度</span>
                  <strong>{routeProgress}%</strong>
                </div>
                <Progress value={routeProgress} tone={route.status === "已发布" ? "green" : "amber"} />
              </div>
              <div className="route-meta">
                <div><span>负责人</span><strong>{route.owner}</strong></div>
                <div><span>标准节拍</span><strong>{route.cycleTime}</strong></div>
                <div><span>现场码</span><strong>{route.qrCode}</strong></div>
              </div>
              <div className="bom-list">
                <strong>BOM 管理</strong>
                {route.bom.map((item) => (
                  <div key={`${route.id}-${item.id}`}>
                    <span>{item.id}</span>
                    <p>{item.material}</p>
                    <em>{item.qty} {item.uom} · 损耗 {item.scrap}</em>
                  </div>
                ))}
              </div>
              <div className="operation-list">
                <strong>工序与质检点</strong>
                {route.steps.map((step) => (
                  <div className={step.status === "已发布" ? "done" : ""} key={`${route.id}-${step.sequence}`}>
                    <span>{step.sequence}</span>
                    <p>
                      <strong>{step.name}</strong>
                      <small>{step.station} · {step.equipment} · {step.qualityGate}</small>
                    </p>
                    <em>{step.sop}</em>
                  </div>
                ))}
              </div>
              <footer>
                <span><ScanLine size={15} /> {route.qrCode} 可用于移动端扫码作业指导</span>
                <button className="button secondary" type="button" onClick={() => onPublish(route.id)} disabled={busyAction === route.id || route.status === "已发布"}>
                  <ClipboardList size={16} /> {route.status === "已发布" ? "已发布" : "发布路线"}
                </button>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function EquipmentResources({
  assets,
  onCheck,
  busyAction,
}: {
  assets: EquipmentAsset[];
  onCheck: (id: string) => void;
  busyAction: string | null;
}) {
  const warningCount = assets.filter((asset) => asset.status === "告警" || asset.status === "停机" || asset.status === "保养中").length;
  const avgHealth = Math.round(assets.reduce((sum, asset) => sum + asset.health, 0) / Math.max(assets.length, 1));
  const avgOee = Math.round(assets.reduce((sum, asset) => sum + asset.oee, 0) / Math.max(assets.length, 1));
  return (
    <section className="view-stack">
      <ViewHeader title="设备资源与 IoT 点检" subtitle="把设备台账、传感器、点检保养和产线影响联动到生产执行与流程审计。" icon={Wrench} />
      <div className="metric-grid">
        <article className="metric-card green"><span>设备健康均值</span><strong>{avgHealth}%</strong><small>IoT health</small></article>
        <article className="metric-card blue"><span>平均 OEE</span><strong>{avgOee}%</strong><small>Asset OEE</small></article>
        <article className="metric-card amber"><span>待点检/告警</span><strong>{warningCount}</strong><small>Exception assets</small></article>
        <article className="metric-card red"><span>设备台账</span><strong>{assets.length}</strong><small>Resources</small></article>
      </div>
      <div className="equipment-grid">
        {assets.map((asset) => {
          const tone = asset.status === "告警" || asset.status === "停机" ? "amber" : asset.status === "保养中" ? "blue" : "green";
          return (
            <article className="equipment-card" key={asset.id}>
              <div className="card-head">
                <div><strong>{asset.name}</strong><span>{asset.plant} · {asset.line} · {asset.id}</span></div>
                <span className={asset.status === "运行" ? "stock-badge" : "stock-badge danger"}>{asset.status}</span>
              </div>
              <div className="equipment-health">
                <div><span>健康分</span><strong>{asset.health}%</strong></div>
                <Progress value={asset.health} tone={tone} />
              </div>
              <div className="sensor-grid">
                <div><span>OEE</span><strong>{asset.oee}%</strong></div>
                <div><span>温度</span><strong>{asset.temperature}°C</strong></div>
                <div><span>振动</span><strong>{asset.vibration.toFixed(1)}</strong></div>
                <div><span>下次保养</span><strong>{asset.nextMaintenance}</strong></div>
              </div>
              <div className="template-chips">{asset.sensors.map((sensor) => <span key={sensor}>{sensor}</span>)}</div>
              <footer>
                <span>{asset.owner} · 关联产线 {asset.line}</span>
                <button className="button secondary" type="button" onClick={() => onCheck(asset.id)} disabled={busyAction === asset.id}>
                  <Wrench size={16} /> 完成点检
                </button>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function DataIntelligence({
  snapshot,
  onResolve,
  busyAction,
}: {
  snapshot: Snapshot;
  onResolve: (id: string) => void;
  busyAction: string | null;
}) {
  const insights = snapshot.intelligenceInsights;
  const pending = insights.filter((insight) => insight.status === "待处理");
  const highRisk = pending.filter((insight) => insight.severity === "高").length;
  const matrix = [
    { label: "准交预测", value: `${Math.max(86, 98 - snapshot.orders.filter((order) => order.status !== "正常").length * 3)}%`, source: "订单/排程", tone: "green" },
    { label: "库存健康", value: `${snapshot.materials.filter((item) => item.stock >= item.safeStock).length}/${snapshot.materials.length}`, source: "WMS/MRP", tone: "amber" },
    { label: "设备健康", value: `${Math.round(snapshot.equipmentAssets.reduce((sum, asset) => sum + asset.health, 0) / Math.max(snapshot.equipmentAssets.length, 1))}%`, source: "IoT/EAM", tone: "blue" },
    { label: "质量闭环", value: `${snapshot.qualityIssues.filter((issue) => issue.status === "已关闭").length}/${snapshot.qualityIssues.length}`, source: "QMS/CAPA", tone: "red" },
  ];

  return (
    <section className="view-stack">
      <ViewHeader title="数据智能平台" subtitle="把订单、库存、质量、设备和成本数据变成预测洞察、经营指标和可审计处置动作。" icon={LineChart} />
      <div className="intelligence-hero">
        <div>
          <span className="ai-state"><BrainCircuit size={15} /> Decision intelligence</span>
          <h2>从跨系统信号到业务动作</h2>
          <p>每条洞察都带来源、指标、影响对象、负责人和建议动作，适合经营层复核，也能下钻给计划、质量、设备与物料角色执行。</p>
        </div>
        <div className="intelligence-summary">
          <article><strong>{pending.length}</strong><span>待处理洞察</span></article>
          <article><strong>{highRisk}</strong><span>高优先级</span></article>
          <article><strong>{snapshot.auditLogs.length}</strong><span>审计记录</span></article>
        </div>
      </div>
      <div className="metric-grid">
        {matrix.map((item) => (
          <article className={`metric-card ${item.tone}`} key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.source}</small>
          </article>
        ))}
      </div>
      <div className="intelligence-layout">
        <div className="insight-grid">
          {insights.map((insight) => (
            <InsightCard insight={insight} onResolve={onResolve} busyAction={busyAction} key={insight.id} />
          ))}
        </div>
        <Panel title="数据血缘与落地口径" icon={Database}>
          <div className="lineage-list">
            {[
              ["订单", "ERP/CRM 导入销售订单，进入 APS 和 MES 工单。"],
              ["现场", "移动报工、IoT 点检、质量检验持续回写事实数据。"],
              ["智能", "规则、预测与工业智能体共同生成可解释建议。"],
              ["闭环", "每次处理都会更新业务对象、事件流与审计日志。"],
            ].map(([label, body]) => (
              <article key={label}>
                <strong>{label}</strong>
                <span>{body}</span>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}

function InsightCard({
  insight,
  onResolve,
  busyAction,
}: {
  insight: IntelligenceInsight;
  onResolve: (id: string) => void;
  busyAction: string | null;
}) {
  const progress = Math.max(12, Math.min(100, Number.parseInt(insight.value, 10) || (insight.status === "已处理" ? 100 : 58)));
  const tone = insight.severity === "高" ? "red" : insight.severity === "中" ? "amber" : "green";
  return (
    <article className={`insight-card ${insight.status === "已处理" ? "resolved" : ""}`}>
      <div className="card-head">
        <div><strong>{insight.title}</strong><span>{insight.domain} · {insight.id} · {insight.linkedEntity}</span></div>
        <span className={insight.status === "已处理" ? "stock-badge" : "stock-badge danger"}>{insight.status}</span>
      </div>
      <div className="insight-kpi">
        <div>
          <span>{insight.metric}</span>
          <strong>{insight.value}</strong>
          <em>{insight.change}</em>
        </div>
        <Progress value={progress} tone={tone} />
      </div>
      <dl className="insight-meta">
        <div><dt>数据来源</dt><dd>{insight.source}</dd></div>
        <div><dt>负责人</dt><dd>{insight.owner}</dd></div>
      </dl>
      <p>{insight.recommendation}</p>
      <footer>
        <span className={`severity ${insight.severity}`}>{insight.severity}</span>
        <button className="button secondary" type="button" onClick={() => onResolve(insight.id)} disabled={busyAction === insight.id || insight.status === "已处理"}>
          <CheckCircle2 size={16} /> {insight.status === "已处理" ? "已闭环" : "处理洞察"}
        </button>
      </footer>
    </article>
  );
}

function Agent({ snapshot, onAccept, busyAction }: { snapshot: Snapshot; onAccept: (id: string) => void; busyAction: string | null }) {
  return (
    <section className="view-stack">
      <ViewHeader title="工业智能体" subtitle="把报表、异常和排程约束翻译成下一步动作。" icon={BrainCircuit} />
      <div className="agent-layout">
        <Panel title="待确认建议" icon={Sparkles}>
          <RecommendationList recommendations={snapshot.recommendations} onAccept={onAccept} busyAction={busyAction} />
        </Panel>
        <Panel title="智能体上下文" icon={Activity}>
          <EventFeed events={snapshot.events} />
        </Panel>
      </div>
    </section>
  );
}

function Rules({ rules, onToggle, busyAction }: { rules: Rule[]; onToggle: (id: string) => void; busyAction: string | null }) {
  return (
    <section className="view-stack">
      <ViewHeader title="规则配置" subtitle="将预警、升级、派工与同步策略产品化，支持租户级配置和审计。" icon={Settings2} />
      <div className="config-grid">
        {rules.map((rule) => (
          <article className="config-card" key={rule.id}>
            <div className="card-head">
              <div><strong>{rule.name}</strong><span>{rule.module} · {rule.id}</span></div>
              <span className={rule.enabled ? "stock-badge" : "stock-badge muted-badge"}>{rule.enabled ? "启用" : "停用"}</span>
            </div>
            <p>{rule.threshold}</p>
            <button className="button secondary" type="button" onClick={() => onToggle(rule.id)} disabled={busyAction === rule.id}>
              <Settings2 size={16} /> {rule.enabled ? "停用规则" : "启用规则"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function IndustryTemplates({
  templates,
  onApply,
  busyAction,
}: {
  templates: IndustryTemplate[];
  onApply: (id: string) => void;
  busyAction: string | null;
}) {
  const activeTemplate = templates.find((template) => template.status === "已启用") || templates[0];
  return (
    <section className="view-stack">
      <ViewHeader title="行业配置模板" subtitle="把模块、角色权限、字段和上线节奏组件化，让不同制造客户从模板开始，而不是从零定制。" icon={Layers3} />
      <div className="template-hero">
        <div>
          <span className="ai-state"><Settings2 size={15} /> 当前启用</span>
          <h2>{activeTemplate?.name}</h2>
          <p>{activeTemplate?.fit}</p>
        </div>
        <div className="template-stats">
          <article><strong>{activeTemplate?.modules.length || 0}</strong><span>模块组件</span></article>
          <article><strong>{activeTemplate?.roles.length || 0}</strong><span>角色模板</span></article>
          <article><strong>{activeTemplate?.fields.length || 0}</strong><span>扩展字段</span></article>
        </div>
      </div>
      <div className="template-grid">
        {templates.map((template) => (
          <article className={`template-card ${template.status === "已启用" ? "enabled" : ""}`} key={template.id}>
            <div className="card-head">
              <div><strong>{template.name}</strong><span>{template.industry} · {template.id}</span></div>
              <span className={template.status === "已启用" ? "stock-badge" : "stock-badge muted-badge"}>{template.status}</span>
            </div>
            <p>{template.fit}</p>
            <div className="template-section">
              <strong>模块组件</strong>
              <div className="template-chips">{template.modules.map((item) => <span key={item}>{item}</span>)}</div>
            </div>
            <div className="template-section">
              <strong>角色权限</strong>
              <div className="template-chips">{template.roles.map((item) => <span key={item}>{item}</span>)}</div>
            </div>
            <div className="template-section">
              <strong>扩展字段</strong>
              <div className="template-chips">{template.fields.map((item) => <span key={item}>{item}</span>)}</div>
            </div>
            <footer>
              <span>{template.rollout}</span>
              <button className="button secondary" type="button" onClick={() => onApply(template.id)} disabled={busyAction === template.id || template.status === "已启用"}>
                <Layers3 size={16} /> {template.status === "已启用" ? "已启用" : "启用模板"}
              </button>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}

function WorkflowEngine({
  workflows,
  onAdvance,
  busyAction,
}: {
  workflows: WorkflowInstance[];
  onAdvance: (id: string) => void;
  busyAction: string | null;
}) {
  const activeCount = workflows.filter((workflow) => workflow.status !== "已完成").length;
  const avgProgress = Math.round(
    workflows.reduce((sum, workflow) => sum + ((workflow.currentStep + 1) / workflow.steps.length) * 100, 0) / Math.max(workflows.length, 1),
  );
  return (
    <section className="view-stack">
      <ViewHeader title="流程引擎与工艺路线" subtitle="把生产变更、质量 CAPA、采购审批配置成跨角色流程，按节点推进并全程审计。" icon={GitPullRequestArrow} />
      <div className="metric-grid">
        <article className="metric-card green"><span>运行中流程</span><strong>{activeCount}</strong><small>跨部门实例</small></article>
        <article className="metric-card blue"><span>平均进度</span><strong>{avgProgress}%</strong><small>节点完成率</small></article>
        <article className="metric-card amber"><span>流程模板</span><strong>{workflows.length}</strong><small>生产/质量/采购</small></article>
        <article className="metric-card red"><span>审计策略</span><strong>100%</strong><small>节点推进留痕</small></article>
      </div>
      <div className="workflow-grid">
        {workflows.map((workflow) => {
          const progress = Math.round(((workflow.currentStep + 1) / workflow.steps.length) * 100);
          return (
            <article className="workflow-card" key={workflow.id}>
              <div className="card-head">
                <div><strong>{workflow.name}</strong><span>{workflow.category} · {workflow.businessKey}</span></div>
                <span className={workflow.status === "已完成" ? "stock-badge" : "stock-badge danger"}>{workflow.status}</span>
              </div>
              <p>{workflow.route}</p>
              <Progress value={progress} tone={workflow.status === "已完成" ? "green" : "amber"} />
              <div className="workflow-steps">
                {workflow.steps.map((step, index) => (
                  <div className={index < workflow.currentStep ? "done" : index === workflow.currentStep ? "active" : ""} key={step}>
                    <span>{index + 1}</span>
                    <strong>{step}</strong>
                  </div>
                ))}
              </div>
              <footer>
                <span>{workflow.owner} · SLA {workflow.sla}</span>
                <button className="button secondary" type="button" onClick={() => onAdvance(workflow.id)} disabled={busyAction === workflow.id || workflow.status === "已完成"}>
                  <GitPullRequestArrow size={16} /> {workflow.status === "已完成" ? "已归档" : "推进节点"}
                </button>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Integrations({ integrations, onSync, busyAction }: { integrations: Integration[]; onSync: (id: string) => void; busyAction: string | null }) {
  return (
    <section className="view-stack">
      <ViewHeader title="开放集成" subtitle="ERP、PLM、WMS、Webhook 和事件订阅统一纳入连接状态与审计。" icon={PlugZap} />
      <div className="config-grid">
        {integrations.map((integration) => (
          <article className="config-card" key={integration.id}>
            <div className="card-head">
              <div><strong>{integration.name}</strong><span>{integration.type} · {integration.id}</span></div>
              <span className={integration.status === "告警" ? "stock-badge danger" : "stock-badge"}>{integration.status}</span>
            </div>
            <p>最近同步：{integration.lastSync}</p>
            <button className="button secondary" type="button" onClick={() => onSync(integration.id)} disabled={busyAction === integration.id}>
              <PlugZap size={16} /> 手动同步
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function Audit({ logs }: { logs: AuditLog[] }) {
  return (
    <section className="view-stack">
      <ViewHeader title="审计日志" subtitle="生产、质量、库存、规则和集成动作均写入不可忽略的操作轨迹。" icon={FileClock} />
      <div className="table-card">
        <table>
          <thead><tr><th>时间</th><th>操作者</th><th>动作</th><th>对象</th></tr></thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}><td>{log.createdAt}</td><td>{log.actor}</td><td>{log.action}</td><td>{log.entity}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Implementation({
  phases,
  onAdvance,
  busyAction,
}: {
  phases: ImplementationPhase[];
  onAdvance: (id: string) => void;
  busyAction: string | null;
}) {
  const packages = [
    { name: "Starter", scope: "单工厂 MES/QMS/WMS", price: "按工厂 + 现场席位", fit: "首条产线数字化" },
    { name: "Professional", scope: "APS/MRP + 规则 + 集成 + AI", price: "按模块 + 接口量", fit: "多产线协同" },
    { name: "Enterprise", scope: "多工厂 + 供应商 + 成本 + 专属 SLA", price: "集团协议 + 实施包", fit: "集团复制与经营平台" },
  ];
  const completed = phases.filter((phase) => phase.status === "已完成").length;
  const active = phases.find((phase) => phase.status === "进行中");
  const activeIndex = active ? phases.findIndex((phase) => phase.id === active.id) + 1 : phases.length;
  return (
    <section className="view-stack">
      <ViewHeader title="实施蓝图与商业化" subtitle="让销售、实施、IT、业务 Owner 在同一张路线图上推进首厂上线与多工厂复制。" icon={Rocket} />
      <div className="metric-grid">
        <article className="metric-card green"><span>首厂上线目标</span><strong>4-8 周</strong><small>从诊断到验收</small></article>
        <article className="metric-card blue"><span>当前阶段</span><strong>{active ? `第 ${activeIndex} 步` : "已上线"}</strong><small>{active ? `${active.name} · ${active.owner}` : "进入扩厂复制"}</small></article>
        <article className="metric-card amber"><span>商业套餐</span><strong>3 档</strong><small>Starter to Enterprise</small></article>
        <article className="metric-card red"><span>上线进度</span><strong>{completed}/{phases.length}</strong><small>阶段已完成</small></article>
      </div>
      <div className="implementation-grid">
        <Panel title="上线阶段" icon={ClipboardList} wide>
          <div className="phase-list">
            {phases.map((phase, index) => {
              const locked = phase.status === "待开始" && Boolean(active);
              return (
                <article className="phase-row" key={phase.name}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{phase.name}</strong>
                    <small>{phase.owner} · {phase.time}</small>
                    <p>{phase.detail}</p>
                  </div>
                  <div className="phase-actions">
                    <em className={phase.status === "已完成" ? "done" : phase.status === "进行中" ? "active" : ""}>{phase.status}</em>
                    <button className="icon-action" type="button" onClick={() => onAdvance(phase.id)} disabled={busyAction === phase.id || locked}>
                      <CheckCircle2 size={15} />
                      {locked ? "待前序" : phase.status === "待开始" ? "开始" : phase.status === "进行中" ? "完成" : "复核"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </Panel>
        <Panel title="商业套餐" icon={Database}>
          <div className="package-list">
            {packages.map((item) => (
              <article key={item.name}>
                <strong>{item.name}</strong>
                <span>{item.scope}</span>
                <small>{item.price} · {item.fit}</small>
              </article>
            ))}
          </div>
        </Panel>
        <Panel title="验收口径" icon={CheckCircle2}>
          <div className="acceptance-list">
            {["订单导入并进入排程", "物料齐套与补货建议可执行", "生产报工写入事件和审计", "质量偏差可追溯并关闭", "ERP/PLM/WMS 至少一个接口联通"].map((item) => (
              <div key={item}><ShieldCheck size={16} /><span>{item}</span></div>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}

function SystemReadiness({ snapshot }: { snapshot: Snapshot }) {
  const onlineUsers = snapshot.users.filter((user) => user.status === "在线").length;
  const items = [
    ["SQLite 持久化", "已启用"],
    ["SSE 实时事件", "在线"],
    ["当前登录", snapshot.currentUser.name],
    ["在线员工", `${onlineUsers}/${snapshot.users.length}`],
    ["审计日志", `${snapshot.auditLogs.length} 条`],
    ["规则引擎", `${snapshot.rules.filter((rule) => rule.enabled).length}/${snapshot.rules.length}`],
  ];
  return <div className="readiness-list">{items.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>;
}

function DatabaseManagement({
  snapshot,
  onBackup,
  onReset,
  busyAction,
}: {
  snapshot: Snapshot;
  onBackup: () => void;
  onReset: () => void;
  busyAction: string | null;
}) {
  const admin = snapshot.databaseAdmin;
  const largestTables = [...admin.tables].sort((a, b) => b.rows - a.rows).slice(0, 8);
  const latestBackup = admin.backups[0];

  return (
    <section className="view-stack">
      <ViewHeader
        title="系统数据库管理"
        subtitle="IT/实施管理员视角：查看租户数据表、记录量、SQLite 文件状态、备份与重置动作，并把管理动作写入审计。"
        icon={Database}
      />
      <div className="metric-grid">
        <article className="metric-card green"><span>数据库状态</span><strong>{admin.status}</strong><small>{admin.engine}</small></article>
        <article className="metric-card blue"><span>业务表数量</span><strong>{admin.tableCount}</strong><small>Managed tables</small></article>
        <article className="metric-card amber"><span>总记录数</span><strong>{admin.totalRows}</strong><small>Tenant rows</small></article>
        <article className="metric-card red"><span>数据库文件</span><strong>{admin.sizeKb}KB</strong><small>WAL {admin.walKb}KB</small></article>
      </div>
      <div className="database-layout">
        <Panel title="数据存储与运维动作" icon={ServerCog}>
          <div className="database-admin-card">
            <div><span>数据库路径</span><strong>{admin.path}</strong></div>
            <div><span>事务模式</span><strong>{admin.mode} · 持久化 SQLite</strong></div>
            <div><span>最近备份</span><strong>{latestBackup ? `${latestBackup.name} · ${latestBackup.sizeKb}KB` : "暂无备份"}</strong></div>
          </div>
          <div className="database-actions">
            <button className="button primary" type="button" onClick={onBackup} disabled={busyAction === "database-backup"}>
              <HardDrive size={16} /> 生成数据库备份
            </button>
            <button className="button secondary" type="button" onClick={onReset} disabled={busyAction === "reset"}>
              <RefreshCw size={16} /> 重置演示数据
            </button>
          </div>
        </Panel>
        <Panel title="最近备份" icon={HardDrive}>
          <div className="backup-list">
            {admin.backups.length ? admin.backups.map((backup) => (
              <article key={backup.id}>
                <strong>{backup.name}</strong>
                <span>{backup.sizeKb}KB · {new Date(backup.createdAt).toLocaleString("zh-CN")}</span>
              </article>
            )) : <p className="empty-note">还没有备份。点击“生成数据库备份”后会在 data/backups 下生成 SQLite 副本。</p>}
          </div>
        </Panel>
      </div>
      <Panel title="租户业务表" icon={Database} wide>
        <div className="database-table-grid">
          {largestTables.map((table) => (
            <article key={table.name}>
              <div>
                <strong>{table.label}</strong>
                <span>{table.name}</span>
              </div>
              <em>{table.rows} 行</em>
              <small>{table.columns} 字段</small>
            </article>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function EmployeePresence({ users, currentUser }: { users: Employee[]; currentUser: Snapshot["currentUser"] }) {
  return (
    <div className="employee-presence-list">
      {users.slice(0, 6).map((user) => (
        <article className={user.id === currentUser.id ? "active" : ""} key={user.id}>
          <span className={user.status === "在线" ? "presence-dot online" : "presence-dot"} />
          <div>
            <strong>{user.name}</strong>
            <small>{user.role} · {user.plant}</small>
          </div>
          <em>{user.status}</em>
        </article>
      ))}
    </div>
  );
}

function ViewHeader({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: LucideIcon }) {
  return (
    <div className="view-header">
      <div className="view-icon"><Icon size={22} /></div>
      <div><h2>{title}</h2><p>{subtitle}</p></div>
    </div>
  );
}

function Panel({ title, icon: Icon, children, wide = false }: { title: string; icon: LucideIcon; children: ReactNode; wide?: boolean }) {
  return (
    <article className={`panel-card ${wide ? "wide" : ""}`}>
      <div className="panel-title"><Icon size={18} /><h2>{title}</h2></div>
      {children}
    </article>
  );
}

function RecommendationList({
  recommendations,
  onAccept,
  busyAction,
}: {
  recommendations: Recommendation[];
  onAccept: (id: string) => void;
  busyAction: string | null;
}) {
  return (
    <div className="recommendation-list">
      {recommendations.map((item) => (
        <article className="recommendation" key={item.id}>
          <div><span className={`severity ${item.severity}`}>{item.severity}</span><strong>{item.title}</strong></div>
          <p>{item.body}</p>
          <footer>
            <em>{item.impact}</em>
            <button className="icon-action" type="button" disabled={busyAction === item.id} onClick={() => onAccept(item.id)}>
              <Sparkles size={15} /> {item.accepted ? "再次执行" : "执行"} <ChevronRight size={14} />
            </button>
          </footer>
        </article>
      ))}
    </div>
  );
}

function EventFeed({ events }: { events: EventItem[] }) {
  return (
    <ol className="event-feed">
      {events.map((event) => (
        <li key={event.id}>
          <BellRing size={15} />
          <time>{event.time}</time>
          <span>{event.type}</span>
          <p><strong>{event.actor || "系统"}</strong>{event.message}</p>
        </li>
      ))}
    </ol>
  );
}

function LineLoad({ lines }: { lines: Line[] }) {
  return (
    <div className="line-load">
      {lines.map((line) => (
        <div key={line.id}>
          <div><strong>{line.name}</strong><span>{line.status} · OEE {line.oee}%</span></div>
          <Progress value={line.load} tone={line.status === "待料" ? "amber" : "green"} />
        </div>
      ))}
    </div>
  );
}

function Progress({ value, tone }: { value: number; tone: "green" | "blue" | "amber" | "red" }) {
  return <div className={`progress ${tone}`} aria-label={`进度 ${value}%`}><i style={{ width: `${Math.min(value, 100)}%` }} /></div>;
}

function StatusPill({ status }: { status: WorkOrder["status"] }) {
  return <span className={`status-pill ${status}`}>{status}</span>;
}

export default App;
