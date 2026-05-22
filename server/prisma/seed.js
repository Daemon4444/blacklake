import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    // Tenant
    await tx.tenant.upsert({ where: { id: "T-ACME" }, update: {}, create: { id: "T-ACME", name: "华东制造集团", plan: "Enterprise", plants: 3, lines: 17, users: 428 }});

    // Users
    const pwd = hashSync("demo123", 10);
    const users = [
      { id: "U-1001", name: "林计划", email: "lin.plan@huadong.example", password: pwd, role: "计划员", roleKey: "planner", department: "供应链计划部", title: "高级计划员", plant: "华东一厂", status: "在线", lastActive: "刚刚", permissions: ["orders:write","schedule:write","quality:write","inventory:write","config:read"], tenantId: "T-ACME" },
      { id: "U-1002", name: "周总", email: "zhou.coo@huadong.example", password: pwd, role: "COO / 工厂总经理", roleKey: "coo", department: "集团制造运营", title: "集团制造负责人", plant: "集团", status: "在线", lastActive: "2 分钟前", permissions: ["dashboard:read","kanban:write","approval:write","audit:read"], tenantId: "T-ACME" },
      { id: "U-1003", name: "陈班长", email: "chen.shop@huadong.example", password: pwd, role: "生产主管 / 班组长", roleKey: "production", department: "包装车间", title: "包装二线班组长", plant: "华东一厂", status: "在线", lastActive: "刚刚", permissions: ["execution:write","mobile:write","routes:read"], tenantId: "T-ACME" },
      { id: "U-1004", name: "吴质检", email: "wu.qa@huadong.example", password: pwd, role: "质量经理 / 质检员", roleKey: "quality", department: "质量管理部", title: "QA 经理", plant: "华东一厂", status: "离线", lastActive: "18 分钟前", permissions: ["quality:write","workflow:write","audit:read"], tenantId: "T-ACME" },
      { id: "U-1005", name: "何仓储", email: "he.wh@huadong.example", password: pwd, role: "仓库 / 物料员", roleKey: "warehouse", department: "仓储物流部", title: "仓储主管", plant: "中央仓", status: "在线", lastActive: "5 分钟前", permissions: ["inventory:write","mobile:write","integrations:read"], tenantId: "T-ACME" },
      { id: "U-1006", name: "许 IT", email: "xu.it@huadong.example", password: pwd, role: "IT / 实施顾问", roleKey: "it", department: "信息化中心", title: "实施负责人", plant: "集团", status: "在线", lastActive: "刚刚", permissions: ["config:write","integrations:write","audit:read","users:read"], tenantId: "T-ACME" },
    ];
    for (const u of users) { await tx.user.upsert({ where: { id: u.id }, update: {}, create: u }); }

    // Lines
    const lines = [
      { id: "L1", name: "灌装一线", plant: "华东一厂", status: "运行", oee: 86, load: 78, tenantId: "T-ACME" },
      { id: "L2", name: "包装二线", plant: "华东一厂", status: "待料", oee: 64, load: 52, tenantId: "T-ACME" },
      { id: "L3", name: "柔性三线", plant: "华东一厂", status: "运行", oee: 91, load: 45, tenantId: "T-ACME" },
      { id: "L4", name: "外协装配", plant: "华南二厂", status: "换线", oee: 72, load: 69, tenantId: "T-ACME" },
    ];
    for (const l of lines) { await tx.line.upsert({ where: { id: l.id }, update: {}, create: l }); }

    // Work Orders
    const orders = [
      { id: "WO-61872", customer: "永辉超市", sku: "果味饮料 330ml×24", line: "L1", due: "05-23 18:00", priority: "P0", status: "风险", progress: 62, blockers: ["L1 负载高"], tenantId: "T-ACME" },
      { id: "WO-61904", customer: "盒马鲜生", sku: "控制板 A7", line: "L3", due: "05-24 12:00", priority: "P1", status: "正常", progress: 41, blockers: [], tenantId: "T-ACME" },
      { id: "WO-61928", customer: "华南代工", sku: "压装套件 P9", line: "L4", due: "05-26 09:00", priority: "P1", status: "阻塞", progress: 18, blockers: ["外协首件未确认"], tenantId: "T-ACME" },
      { id: "WO-61955", customer: "内部备货", sku: "果味饮料 500ml×12", line: "L1", due: "05-28 18:00", priority: "P2", status: "正常", progress: 5, blockers: [], tenantId: "T-ACME" },
    ];
    for (const o of orders) { await tx.workOrder.upsert({ where: { id: o.id }, update: {}, create: o }); }

    // Materials
    const materials = [
      { id: "M-884", name: "铝塑包材", stock: 380, safeStock: 500, location: "A-12-03", linkedOrders: ["WO-61872","WO-61955"], tenantId: "T-ACME" },
      { id: "M-120", name: "食品级瓶坯", stock: 12400, safeStock: 5000, location: "B-02-01", linkedOrders: ["WO-61872"], tenantId: "T-ACME" },
      { id: "M-721", name: "果味浓缩液", stock: 860, safeStock: 400, location: "C-05-02", linkedOrders: ["WO-61872","WO-61955"], tenantId: "T-ACME" },
      { id: "M-774", name: "控制芯片", stock: 520, safeStock: 200, location: "D-01-04", linkedOrders: ["WO-61904"], tenantId: "T-ACME" },
    ];
    for (const m of materials) { await tx.material.upsert({ where: { id: m.id }, update: {}, create: m }); }

    // Quality Issues
    const quality = [
      { id: "QI-3301", batch: "B-240522-L1", severity: "高", source: "灌装旋盖", owner: "吴质检", status: "待处理", rootCause: "旋盖扭矩偏移", tenantId: "T-ACME" },
      { id: "QI-3289", batch: "B-240521-L3", severity: "中", source: "贴标装箱", owner: "吴质检", status: "处理中", rootCause: "标签偏移 2mm", tenantId: "T-ACME" },
      { id: "QI-3256", batch: "B-240520-L4", severity: "低", source: "外协收料", owner: "质检组", status: "已关闭", rootCause: "来料批次信息缺失", tenantId: "T-ACME" },
    ];
    for (const q of quality) { await tx.qualityIssue.upsert({ where: { id: q.id }, update: {}, create: q }); }

    // Equipment
    const equipment = [
      { id: "EQ-001", name: "灌装旋盖机 A", line: "L1", plant: "华东一厂", status: "运行", health: 87, oee: 84, temperature: 42, vibration: 2.1, nextMaintenance: "3 天后", owner: "设备工程", sensors: ["温度","振动","转速"], tenantId: "T-ACME" },
      { id: "EQ-002", name: "高速贴标机", line: "L1", plant: "华东一厂", status: "运行", health: 92, oee: 89, temperature: 38, vibration: 1.2, nextMaintenance: "7 天后", owner: "设备工程", sensors: ["温度","速度"], tenantId: "T-ACME" },
      { id: "EQ-003", name: "ICT 测试台", line: "L3", plant: "华东一厂", status: "告警", health: 68, oee: 71, temperature: 51, vibration: 3.8, nextMaintenance: "已逾期", owner: "电子工程", sensors: ["温度","振动","电流"], tenantId: "T-ACME" },
      { id: "EQ-004", name: "外协压装工装", line: "L4", plant: "华南二厂", status: "保养中", health: 75, oee: 72, temperature: 36, vibration: 1.5, nextMaintenance: "今天", owner: "外协工程", sensors: ["压力","位移"], tenantId: "T-ACME" },
    ];
    for (const e of equipment) { await tx.equipmentAsset.upsert({ where: { id: e.id }, update: {}, create: e }); }

    // Process Routes
    const routes = [
      { id: "PR-1001", product: "果味饮料 330ml", version: "V3.4", line: "L1 / L3", owner: "工艺工程", cycleTime: "38 秒/箱", qrCode: "QR-PR-1001", status: "已发布", bom: [{id:"M-120",material:"食品级瓶坯",qty:"24",uom:"pcs/箱",scrap:"0.8%"},{id:"M-884",material:"铝塑包材",qty:"1",uom:"套/箱",scrap:"1.2%"},{id:"M-721",material:"果味浓缩液",qty:"7.8",uom:"L/批",scrap:"0.5%"}], steps: [{sequence:10,name:"瓶坯上线",station:"ST-101",equipment:"上瓶机",qualityGate:"扫码批次校验",sop:"SOP-FB-101",status:"已发布"},{sequence:20,name:"灌装旋盖",station:"ST-108",equipment:"灌装旋盖机",qualityGate:"首件扭矩",sop:"SOP-FB-108",status:"已发布"},{sequence:30,name:"贴标装箱",station:"ST-126",equipment:"高速贴标机",qualityGate:"标签偏移",sop:"SOP-FB-126",status:"已发布"}], tenantId: "T-ACME" },
      { id: "PR-2007", product: "控制板 A7", version: "V1.9", line: "L3", owner: "电子工程", cycleTime: "9 分钟/片", qrCode: "QR-PR-2007", status: "变更中", bom: [{id:"M-774",material:"控制芯片",qty:"1",uom:"pcs",scrap:"0.3%"},{id:"M-775",material:"PCB 主板",qty:"1",uom:"pcs",scrap:"0.4%"},{id:"M-792",material:"测试治具",qty:"1",uom:"套/线",scrap:"0%"}], steps: [{sequence:10,name:"烧录",station:"ICT-01",equipment:"ICT 测试台",qualityGate:"SN 防重",sop:"SOP-EL-210",status:"已发布"},{sequence:20,name:"功能测试",station:"ICT-02",equipment:"ICT 测试台",qualityGate:"测试结果回传",sop:"SOP-EL-220",status:"待发布"},{sequence:30,name:"终检包装",station:"PK-03",equipment:"视觉工位",qualityGate:"外观抽检",sop:"SOP-EL-230",status:"待发布"}], tenantId: "T-ACME" },
      { id: "PR-3003", product: "压装套件 P9", version: "V2.1", line: "L4", owner: "外协工程", cycleTime: "4.5 分钟/套", qrCode: "QR-PR-3003", status: "草稿", bom: [{id:"M-335",material:"压装弹簧",qty:"2",uom:"pcs",scrap:"1.5%"},{id:"M-612",material:"压装外壳",qty:"1",uom:"pcs",scrap:"0.6%"},{id:"M-661",material:"防护泡棉",qty:"1",uom:"pcs",scrap:"0.9%"}], steps: [{sequence:10,name:"外协收料",station:"OUT-01",equipment:"外协压装工装",qualityGate:"来料批次",sop:"SOP-OS-310",status:"待发布"},{sequence:20,name:"压装首件",station:"OUT-02",equipment:"外协压装工装",qualityGate:"首件尺寸",sop:"SOP-OS-320",status:"待发布"},{sequence:30,name:"成品复核",station:"QC-04",equipment:"量测工位",qualityGate:"QA 放行",sop:"SOP-OS-330",status:"待发布"}], tenantId: "T-ACME" },
    ];
    for (const r of routes) { await tx.processRoute.upsert({ where: { id: r.id }, update: {}, create: r }); }

    // Kanban Boards
    const kanbans = [
      { id: "KB-01", name: "经营总览看板", audience: "COO / 管理层", scope: "全厂", refreshRate: "5 秒", layout: "4×2 网格", owner: "周总", status: "已发布", lastPublished: "2 小时前", widgets: ["准交率趋势","OEE 实时","缺料风险","质量 SLA","产线负载","事件流","AI 建议","库存周转"], tenantId: "T-ACME" },
      { id: "KB-02", name: "车间进度看板", audience: "班组长 / 现场", scope: "包装车间", refreshRate: "10 秒", layout: "3×2 网格", owner: "陈班长", status: "已发布", lastPublished: "30 分钟前", widgets: ["工单队列","报工进度","设备状态","异常计数","计件统计","SOP 提醒"], tenantId: "T-ACME" },
      { id: "KB-03", name: "质量控制看板", audience: "QA 团队", scope: "全厂", refreshRate: "30 秒", layout: "3×2 网格", owner: "吴质检", status: "草稿", lastPublished: "", widgets: ["偏差趋势","批次追溯","SPC 图","检验任务","关闭率","SLA 倒计时"], tenantId: "T-ACME" },
    ];
    for (const k of kanbans) { await tx.kanbanBoard.upsert({ where: { id: k.id }, update: {}, create: k }); }

    // Commercial Packages
    const packages = [
      { id: "PKG-STARTER", name: "Starter 首厂试点", target: "单工厂 / 1-3 条产线", priceModel: "平台费 + 现场轻量席位 + 标准实施包", scope: "MES、QMS、WMS、移动扫码、基础看板", implementation: "4 周样板线启动，8 周首厂验收", roi: "纸单减少 70%，报工及时率提升 35%", status: "可售", modules: ["生产执行","移动现场","质量闭环","物料库存","看板中心"] },
      { id: "PKG-PRO", name: "Professional 多产线协同", target: "多产线 / 多车间 / 已有 ERP", priceModel: "按模块 + 产线 + API 调用量", scope: "APS/MRP、工艺路线、流程引擎、开放集成、数据智能", implementation: "6-10 周跑通计划、物料、生产、质量闭环", roi: "计划响应提速 50%，缺料停线风险降低 40%", status: "主推", modules: ["订单排程","主计划 MRP","工艺路线","流程引擎","开放集成","数据智能"] },
      { id: "PKG-ENTERPRISE", name: "Enterprise 集团运营", target: "多工厂集团 / 供应链协同", priceModel: "集团协议 + 专属 SLA + 行业包", scope: "多工厂运营、成本财务、供应商、设备 IoT、工业智能体", implementation: "首厂复制模板，12-20 周扩展多工厂", roi: "库存周转提升 15-25%，集团准交预测统一", status: "可售", modules: ["成本财务","采购供应商","设备资源","工业智能体","实施蓝图"] },
    ];
    for (const p of packages) { await tx.commercialPackage.upsert({ where: { id: p.id }, update: {}, create: p }); }

    // Sales Opportunities
    await tx.salesOpportunity.upsert({ where: { id: "OP-1001" }, update: {}, create: { id: "OP-1001", packageId: "PKG-PRO", customer: "华东制造集团", owner: "售前顾问", stage: "ROI 诊断", nextStep: "导入真实订单、库存和质量样本，生成样板线价值测算。", status: "进行中" }});

    // Activation Tasks
    const activation = [
      { id: "ACT-COO", role: "COO / 工厂总经理", owner: "客户成功经理", workspace: "总览工作台 + 看板中心", firstAction: "确认首厂准交、库存、质量和产线负载四个验收指标。", successMetric: "每日查看经营风险，周会使用同一套指标复盘。", status: "进行中" },
      { id: "ACT-PLAN", role: "计划员", owner: "实施顾问", workspace: "订单排程 + 主计划 MRP", firstAction: "导入真实订单池，处理缺料和产能例外，冻结试点线计划。", successMetric: "计划变更响应时间下降，齐套风险可提前识别。", status: "待启动" },
      { id: "ACT-SHOP", role: "班组长 / 现场员工", owner: "生产主管", workspace: "移动现场 + 生产执行", firstAction: "扫码工单完成一次报工，并把异常回写到事件流。", successMetric: "报工及时率提升，现场不再依赖纸单汇总。", status: "待启动" },
      { id: "ACT-QA", role: "质检员 / QA", owner: "质量经理", workspace: "质量闭环 + 流程引擎", firstAction: "执行首检/巡检，关闭一条偏差并归档批次追溯链。", successMetric: "偏差关闭时长下降，追溯链完整可复核。", status: "待启动" },
      { id: "ACT-IT", role: "IT / 实施顾问", owner: "IT 负责人", workspace: "开放集成 + 配置模板 + 审计日志", firstAction: "完成 ERP/PLM/WMS 接口联调、角色权限和审计抽查。", successMetric: "接口同步成功率稳定，权限和审计满足上线要求。", status: "进行中" },
    ];
    for (const a of activation) { await tx.activationTask.upsert({ where: { id: a.id }, update: {}, create: a }); }

    // Master Data Checks
    const mdChecks = [
      { id: "MD-MATERIAL", domain: "物料与安全库存", owner: "仓储主管", source: "ERP + WMS", readiness: 86, issues: 12, status: "待校验" },
      { id: "MD-BOM", domain: "BOM 与工艺路线", owner: "工艺工程", source: "PLM + Excel", readiness: 74, issues: 18, status: "待校验" },
      { id: "MD-ORG", domain: "组织、人员与权限", owner: "IT 负责人", source: "HR + 手工矩阵", readiness: 92, issues: 5, status: "待校验" },
      { id: "MD-LINE", domain: "产线、工位与设备", owner: "设备工程", source: "设备台账 + 现场盘点", readiness: 68, issues: 21, status: "待导入" },
      { id: "MD-QA", domain: "检验标准与质量规则", owner: "质量经理", source: "QMS + SOP", readiness: 81, issues: 9, status: "待校验" },
    ];
    for (const m of mdChecks) { await tx.masterDataCheck.upsert({ where: { id: m.id }, update: {}, create: m }); }

    // Events
    const events = [
      { id: "E-1", time: "14:23", type: "计划", message: "WO-61872 准交风险升级：L1 负载 78%，铝塑包材库存低于安全线", actor: "系统" },
      { id: "E-2", time: "14:18", type: "生产", message: "L3 柔性三线完成换线，OEE 恢复至 91%", actor: "陈班长" },
      { id: "E-3", time: "14:10", type: "质量", message: "QI-3301 偏差已升级：灌装旋盖扭矩偏移，批次 B-240522-L1 待处理", actor: "吴质检" },
      { id: "E-4", time: "13:55", type: "库存", message: "M-884 铝塑包材库存 380 低于安全库存 500，影响 WO-61872", actor: "系统" },
      { id: "E-5", time: "13:40", type: "系统", message: "ERP 订单同步完成，新增 2 条工单进入排程队列", actor: "系统" },
    ];
    for (const e of events) { await tx.event.upsert({ where: { id: e.id }, update: {}, create: e }); }

    // Recommendations
    const recs = [
      { id: "R-1", severity: "高", title: "WO-61872 建议切换至 L3", body: "L1 负载 78% 且铝塑包材不足，L3 当前负载仅 45%，可承接该工单", impact: "准交率提升 12%，L1 负载降至 62%", accepted: false },
      { id: "R-2", severity: "中", title: "M-884 建议立即补货", body: "铝塑包材当前库存 380 低于安全库存 500，影响 2 条工单", impact: "消除 WO-61872 和 WO-61955 的缺料风险", accepted: false },
      { id: "R-3", severity: "低", title: "WO-61928 建议挂载 SOP", body: "压装套件 P9 工艺路线为草稿状态，外协首件无法确认", impact: "解除 WO-61928 阻塞，恢复外协产线排程", accepted: false },
    ];
    for (const r of recs) { await tx.recommendation.upsert({ where: { id: r.id }, update: {}, create: r }); }

    // Intelligence Insights
    const insights = [
      { id: "INS-1", title: "WO-61872 准交风险预警", domain: "计划", severity: "高", metric: "准交概率", value: "64%", change: "-18%", source: "排程引擎", linkedEntity: "WO-61872", recommendation: "切换至 L3 或加班补产", owner: "林计划", status: "待处理" },
      { id: "INS-2", title: "M-884 缺料影响扩散", domain: "库存", severity: "高", metric: "齐套率", value: "76%", change: "-8%", source: "MRP", linkedEntity: "M-884", recommendation: "紧急补货或启用替代料", owner: "何仓储", status: "待处理" },
      { id: "INS-3", title: "EQ-003 健康度持续下降", domain: "设备", severity: "中", metric: "健康分", value: "68", change: "-12", source: "IoT", linkedEntity: "EQ-003", recommendation: "安排预防性保养", owner: "设备工程", status: "待处理" },
      { id: "INS-4", title: "QI-3301 质量 SLA 临期", domain: "质量", severity: "中", metric: "处理时长", value: "18h", change: "+6h", source: "质量引擎", linkedEntity: "QI-3301", recommendation: "升级处理优先级", owner: "吴质检", status: "待处理" },
    ];
    for (const i of insights) { await tx.intelligenceInsight.upsert({ where: { id: i.id }, update: {}, create: i }); }

    // Rules
    const rules = [
      { id: "RULE-1", name: "缺料自动预警", module: "inventory", enabled: true, threshold: "库存 < 安全库存" },
      { id: "RULE-2", name: "准交风险自动升级", module: "planning", enabled: true, threshold: "准交概率 < 80%" },
      { id: "RULE-3", name: "设备振动超阈值告警", module: "equipment", enabled: true, threshold: "振动 > 3.5mm/s" },
      { id: "RULE-4", name: "质量偏差 SLA 提醒", module: "quality", enabled: false, threshold: "处理时长 > 24h" },
    ];
    for (const r of rules) { await tx.rule.upsert({ where: { id: r.id }, update: {}, create: r }); }

    // Integrations
    const integrations = [
      { id: "INT-ERP", name: "SAP ERP", type: "ERP", status: "已连接", lastSync: "5 分钟前" },
      { id: "INT-PLM", name: "Teamcenter PLM", type: "PLM", status: "已连接", lastSync: "1 小时前" },
      { id: "INT-WMS", name: "WMS 仓储", type: "WMS", status: "待配置", lastSync: "" },
      { id: "INT-IOT", name: "IoT 网关", type: "IoT", status: "已连接", lastSync: "实时" },
    ];
    for (const i of integrations) { await tx.integration.upsert({ where: { id: i.id }, update: {}, create: i }); }

    // Implementation Phases
    const phases = [
      { id: "IMP-0", name: "需求诊断", owner: "实施顾问", time: "1-2 周", status: "已完成", detail: "完成首厂需求访谈、痛点梳理和范围确认", sortOrder: 0 },
      { id: "IMP-1", name: "数据梳理", owner: "IT + 业务", time: "1-2 周", status: "进行中", detail: "物料、BOM、组织、产线、质检标准导入和校验", sortOrder: 1 },
      { id: "IMP-2", name: "方案设计", owner: "实施顾问", time: "1 周", status: "待开始", detail: "流程蓝图、角色权限、看板和集成方案设计", sortOrder: 2 },
      { id: "IMP-3", name: "试点上线", owner: "项目经理", time: "2-3 周", status: "待开始", detail: "样板线配置、首件验证、现场培训", sortOrder: 3 },
      { id: "IMP-4", name: "培训陪跑", owner: "客户成功", time: "1-2 周", status: "待开始", detail: "角色培训、问题收集、流程优化", sortOrder: 4 },
      { id: "IMP-5", name: "验收复盘", owner: "项目经理", time: "1 周", status: "待开始", detail: "KPI 验收、问题清单关闭、模板沉淀", sortOrder: 5 },
      { id: "IMP-6", name: "多厂复制", owner: "集团 PMO", time: "4-8 周", status: "待开始", detail: "模板复制、差异配置、集团统一指标", sortOrder: 6 },
    ];
    for (const p of phases) { await tx.implementationPhase.upsert({ where: { id: p.id }, update: {}, create: p }); }

    // Mobile Tasks
    const mobileTasks = [
      { id: "MT-1", type: "报工", title: "WO-61872 灌装工序报工", target: "WO-61872", scanCode: "QR-WO-61872-20", owner: "陈班长", status: "待完成", instruction: "扫码确认灌装旋盖工序完成数量" },
      { id: "MT-2", type: "发料", title: "M-884 铝塑包材发料", target: "M-884", scanCode: "QR-M-884-A12", owner: "何仓储", status: "待完成", instruction: "扫码确认发料数量和库位" },
      { id: "MT-3", type: "质检", title: "QI-3301 首件质检确认", target: "QI-3301", scanCode: "QR-QI-3301", owner: "吴质检", status: "待完成", instruction: "扫码确认首件检验结果" },
    ];
    for (const m of mobileTasks) { await tx.mobileTask.upsert({ where: { id: m.id }, update: {}, create: m }); }

    // Industry Templates
    const templates = [
      { id: "TPL-FB", name: "食品饮料模板", industry: "食品饮料", fit: "灌装、包装、调配", modules: ["生产执行","质量追溯","批次管理","保质期"], roles: ["车间主管","质检员","仓管"], fields: ["批次号","保质期","储存条件"], rollout: "4 周首厂", status: "已启用" },
      { id: "TPL-AUTO", name: "汽配机加模板", industry: "汽车零部件", fit: "机加工、冲压、焊接", modules: ["工艺路线","SPC","设备OEE","PPAP"], roles: ["工艺工程","质量工程","设备工程"], fields: ["图号","公差","工装号"], rollout: "6 周首厂", status: "可启用" },
      { id: "TPL-PHARMA", name: "制药合规模板", industry: "制药", fit: "原料药、制剂、包装", modules: ["批记录","偏差CAPA","验证管理","电子签名"], roles: ["QA","QC","生产","仓储"], fields: ["批号","效期","审计追踪"], rollout: "8 周首厂", status: "可启用" },
    ];
    for (const t of templates) { await tx.industryTemplate.upsert({ where: { id: t.id }, update: {}, create: t }); }

    // Workflow Instances
    const workflows = [
      { id: "WF-1", name: "质量偏差处理流程", category: "质量", businessKey: "QI-3301", owner: "吴质检", sla: "24h", currentStep: 1, status: "进行中", steps: ["发现上报","原因分析","纠正措施","验证关闭"], route: "质检→QA→生产→质检" },
      { id: "WF-2", name: "采购申请审批", category: "采购", businessKey: "M-884", owner: "何仓储", sla: "48h", currentStep: 0, status: "待处理", steps: ["提交申请","主管审批","采购执行","到货确认"], route: "仓储→计划→采购→仓储" },
    ];
    for (const w of workflows) { await tx.workflowInstance.upsert({ where: { id: w.id }, update: {}, create: w }); }
  });

  console.log("Seed data inserted successfully");
}

main().catch(console.error).finally(() => prisma.$disconnect());
