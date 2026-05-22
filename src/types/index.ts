export type RoleKey = "coo" | "planner" | "production" | "quality" | "warehouse" | "it";
export type Status = "正常" | "风险" | "阻塞" | "完成";

export interface User {
  id: string; name: string; email: string; role: string; roleKey: RoleKey;
  department: string; title: string; plant: string; status: string;
  lastActive: string; permissions: string[];
}

export interface WorkOrder {
  id: string; customer: string; sku: string; line: string; due: string;
  priority: string; status: Status; progress: number; blockers: string[];
}

export interface Line { id: string; name: string; plant: string; status: string; oee: number; load: number; }
export interface Material { id: string; name: string; stock: number; safeStock: number; location: string; linkedOrders: string[]; }
export interface QualityIssue { id: string; batch: string; severity: string; source: string; owner: string; status: string; rootCause: string; }
export interface EquipmentAsset { id: string; name: string; line: string; plant: string; status: string; health: number; oee: number; temperature: number; vibration: number; nextMaintenance: string; owner: string; sensors: string[]; }
export interface ProcessRoute { id: string; product: string; version: string; line: string; owner: string; cycleTime: string; qrCode: string; status: string; bom: any[]; steps: any[]; }
export interface KanbanBoard { id: string; name: string; audience: string; scope: string; refreshRate: string; layout: string; owner: string; status: string; lastPublished: string; widgets: string[]; }
export interface CommercialPackage { id: string; name: string; target: string; priceModel: string; scope: string; implementation: string; roi: string; status: string; modules: string[]; }
export interface SalesOpportunity { id: string; packageId: string; customer: string; owner: string; stage: string; nextStep: string; status: string; }
export interface ActivationTask { id: string; role: string; owner: string; workspace: string; firstAction: string; successMetric: string; status: string; }
export interface MasterDataCheck { id: string; domain: string; owner: string; source: string; readiness: number; issues: number; status: string; }
export interface EventItem { id: string; time: string; type: string; message: string; actor: string; }
export interface Recommendation { id: string; severity: string; title: string; body: string; impact: string; accepted: boolean; }
export interface IntelligenceInsight { id: string; title: string; domain: string; severity: string; metric: string; value: string; change: string; source: string; linkedEntity: string; recommendation: string; owner: string; status: string; }
export interface Rule { id: string; name: string; module: string; enabled: boolean; threshold: string; }
export interface Integration { id: string; name: string; type: string; status: string; lastSync: string; }
export interface ImplementationPhase { id: string; name: string; owner: string; time: string; status: string; detail: string; }
export interface MobileTask { id: string; type: string; title: string; target: string; scanCode: string; owner: string; status: string; instruction: string; }
export interface IndustryTemplate { id: string; name: string; industry: string; fit: string; modules: string[]; roles: string[]; fields: string[]; rollout: string; status: string; }
export interface WorkflowInstance { id: string; name: string; category: string; businessKey: string; owner: string; sla: string; currentStep: number; status: string; steps: string[]; route: string; }
export interface AuditLog { id: string; actor: string; action: string; entity: string; createdAt: string; }

export interface Snapshot {
  tenant: any; currentUser: User | null; users: User[];
  orders: WorkOrder[]; materials: Material[]; qualityIssues: QualityIssue[];
  lines: Line[]; equipmentAssets: EquipmentAsset[]; processRoutes: ProcessRoute[];
  kanbanBoards: KanbanBoard[]; events: EventItem[]; recommendations: Recommendation[];
  intelligenceInsights: IntelligenceInsight[]; rules: Rule[]; integrations: Integration[];
  implementationPhases: ImplementationPhase[]; activationTasks: ActivationTask[];
  masterDataChecks: MasterDataCheck[]; mobileTasks: MobileTask[];
  industryTemplates: IndustryTemplate[]; workflowInstances: WorkflowInstance[];
  auditLogs: AuditLog[]; commercialPackages: CommercialPackage[];
  salesOpportunities: SalesOpportunity[];
}
