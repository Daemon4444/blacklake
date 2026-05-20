export type ViewKey =
  | "command"
  | "commercial"
  | "onboarding"
  | "planning"
  | "execution"
  | "kanban"
  | "quality"
  | "inventory"
  | "mrp"
  | "procurement"
  | "costing"
  | "model"
  | "routes"
  | "equipment"
  | "intelligence"
  | "agent"
  | "rules"
  | "integrations"
  | "audit"
  | "database"
  | "implementation"
  | "mobile"
  | "templates"
  | "workflow";

export type Status = "正常" | "风险" | "阻塞" | "完成";

export type Tenant = {
  id: string;
  name: string;
  plan: string;
  plants: number;
  lines: number;
  users: number;
};

export type CurrentUser = {
  id: string;
  name: string;
  role: string;
  roleKey: string;
  department: string;
  title: string;
  plant: string;
  status: "在线" | "离线";
  lastActive: string;
  permissions: string[];
};

export type Employee = CurrentUser & {
  email: string;
};

export type WorkOrder = {
  id: string;
  customer: string;
  sku: string;
  line: string;
  due: string;
  priority: "P0" | "P1" | "P2";
  status: Status;
  progress: number;
  blockers: string[];
};

export type Line = {
  id: string;
  name: string;
  plant: string;
  status: "运行" | "换线" | "待料" | "保养";
  oee: number;
  load: number;
};

export type BomLine = {
  id: string;
  material: string;
  qty: string;
  uom: string;
  scrap: string;
};

export type RouteStep = {
  sequence: number;
  name: string;
  station: string;
  equipment: string;
  qualityGate: string;
  sop: string;
  status: "待发布" | "已发布";
};

export type ProcessRoute = {
  id: string;
  product: string;
  version: string;
  line: string;
  owner: string;
  cycleTime: string;
  qrCode: string;
  status: "草稿" | "变更中" | "已发布";
  bom: BomLine[];
  steps: RouteStep[];
};

export type KanbanBoard = {
  id: string;
  name: string;
  audience: string;
  scope: string;
  refreshRate: string;
  layout: string;
  owner: string;
  status: "草稿" | "变更中" | "已发布";
  lastPublished: string;
  widgets: string[];
};

export type CommercialPackage = {
  id: string;
  name: string;
  target: string;
  priceModel: string;
  scope: string;
  implementation: string;
  roi: string;
  status: "主推" | "可售";
  modules: string[];
};

export type SalesOpportunity = {
  id: string;
  packageId: string;
  customer: string;
  owner: string;
  stage: string;
  nextStep: string;
  status: "进行中" | "已转实施";
};

export type ActivationTask = {
  id: string;
  role: string;
  owner: string;
  workspace: string;
  firstAction: string;
  successMetric: string;
  status: "待启动" | "进行中" | "已完成";
};

export type MasterDataCheck = {
  id: string;
  domain: string;
  owner: string;
  source: string;
  readiness: number;
  issues: number;
  status: "待导入" | "待校验" | "已校验";
};

export type EquipmentAsset = {
  id: string;
  name: string;
  line: string;
  plant: string;
  status: "运行" | "告警" | "保养中" | "停机";
  health: number;
  oee: number;
  temperature: number;
  vibration: number;
  nextMaintenance: string;
  owner: string;
  sensors: string[];
};

export type Material = {
  id: string;
  name: string;
  stock: number;
  safeStock: number;
  location: string;
  linkedOrders: string[];
};

export type QualityIssue = {
  id: string;
  batch: string;
  severity: "高" | "中" | "低";
  source: string;
  owner: string;
  status: "待处理" | "处理中" | "已关闭";
  rootCause: string;
};

export type EventItem = {
  id: string;
  time: string;
  type: "计划" | "生产" | "质量" | "库存" | "系统";
  message: string;
  actor?: string;
};

export type Recommendation = {
  id: string;
  severity: "高" | "中" | "低";
  title: string;
  body: string;
  impact: string;
  accepted: boolean;
};

export type IntelligenceInsight = {
  id: string;
  title: string;
  domain: "交付" | "库存" | "设备" | "质量" | "成本";
  severity: "高" | "中" | "低";
  metric: string;
  value: string;
  change: string;
  source: string;
  linkedEntity: string;
  recommendation: string;
  owner: string;
  status: "待处理" | "已处理";
};

export type Rule = {
  id: string;
  name: string;
  module: string;
  enabled: boolean;
  threshold: string;
};

export type Integration = {
  id: string;
  name: string;
  type: string;
  status: "已连接" | "告警" | "断开";
  lastSync: string;
};

export type ImplementationPhase = {
  id: string;
  name: string;
  owner: string;
  time: string;
  status: "已完成" | "进行中" | "待开始";
  detail: string;
};

export type MobileTask = {
  id: string;
  type: "报工" | "发料" | "质检";
  title: string;
  target: string;
  scanCode: string;
  owner: string;
  status: "待执行" | "已完成";
  instruction: string;
};

export type IndustryTemplate = {
  id: string;
  name: string;
  industry: string;
  fit: string;
  modules: string[];
  roles: string[];
  fields: string[];
  rollout: string;
  status: "已启用" | "可启用";
};

export type WorkflowInstance = {
  id: string;
  name: string;
  category: string;
  businessKey: string;
  owner: string;
  sla: string;
  currentStep: number;
  status: "待处理" | "进行中" | "已完成";
  steps: string[];
  route: string;
};

export type AuditLog = {
  id: string;
  actor: string;
  action: string;
  entity: string;
  createdAt: string;
};

export type DatabaseTableStat = {
  name: string;
  label: string;
  rows: number;
  columns: number;
};

export type DatabaseBackup = {
  id: string;
  name: string;
  path: string;
  sizeKb: number;
  createdAt: string;
};

export type DatabaseAdmin = {
  engine: string;
  mode: string;
  path: string;
  sizeKb: number;
  walKb: number;
  shmKb: number;
  status: "健康" | "异常";
  tableCount: number;
  totalRows: number;
  tables: DatabaseTableStat[];
  backups: DatabaseBackup[];
};

export type Snapshot = {
  tenant: Tenant;
  currentUser: CurrentUser;
  users: Employee[];
  commercialPackages: CommercialPackage[];
  salesOpportunities: SalesOpportunity[];
  activationTasks: ActivationTask[];
  masterDataChecks: MasterDataCheck[];
  lines: Line[];
  processRoutes: ProcessRoute[];
  kanbanBoards: KanbanBoard[];
  equipmentAssets: EquipmentAsset[];
  orders: WorkOrder[];
  materials: Material[];
  qualityIssues: QualityIssue[];
  events: EventItem[];
  recommendations: Recommendation[];
  intelligenceInsights: IntelligenceInsight[];
  rules: Rule[];
  integrations: Integration[];
  implementationPhases: ImplementationPhase[];
  mobileTasks: MobileTask[];
  industryTemplates: IndustryTemplate[];
  workflowInstances: WorkflowInstance[];
  auditLogs: AuditLog[];
  databaseAdmin: DatabaseAdmin;
};
