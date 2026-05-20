# 铸云智造 SaaS 产品规格说明

## 1. 产品定位

铸云智造是一套对标云端制造协同平台的 B2B SaaS 应用，目标客户是多工厂、多产线、高追溯、高变更频率的制造企业。产品不是官网展示页，而是登录后可持续使用的制造操作系统，同时包含企业员工登录、对外商业化官网和客户启动中心，覆盖套餐售卖、商机转实施、订单计划、动态排程、生产看板、工艺路线、生产执行、质量追溯、物料仓储、设备维保、数据智能和开放集成。

## 2. 对标范围

| 对标能力 | SaaS 功能形态 | 当前迭代目标 |
| --- | --- | --- |
| 云端 MES / 制造协同 | 多角色工作台、工单流转、现场事件流 | 已纳入 V1 |
| 企业账号 / 后端协同 | 员工目录、登录页、演示密码、在线状态、按员工写事件与审计 | 已纳入 V1 |
| 系统数据库管理 | SQLite 状态、业务表统计、数据库备份、演示数据重置 | 已纳入 V1 |
| 商业化售卖 | 套餐、ROI、实施路径、行业包、预约/售前方案 | 已纳入 V1 |
| 客户启动 / 上线成功 | 商机转实施、角色启用、主数据准备度、上线入口顺序 | 已纳入 V1 |
| 工厂建模 | 工厂、车间、产线、工位、设备、人员、权限 | V1 先做模型视图 |
| 工艺路线 / BOM | 产品版本、BOM、工序、质检点、SOP、二维码发布 | 已纳入 V1 |
| 动态排程 | 订单优先级、产线负载、缺料/异常影响、AI 重排 | V1 做交互式排程板 |
| 看板管理 / 生产统计 | 角色化看板、投屏布局、实时刷新、组件发布 | 已纳入 V1 |
| 生产执行 | 派工、报工、首件确认、进度采集、异常上报 | V1 做状态推进 |
| 质量追溯 | 检验任务、偏差处理、批次追溯、质量闭环 | V1 做异常列表与闭环 |
| 物料仓储 | 库位、库存、齐套、缺料预警、扫码流转 | V1 做库存与缺料预警 |
| 设备维保 | 设备状态、点检、保养、故障与 OEE | V2 |
| 数据智能 | 指标看板、趋势解释、风险预测、自然语言问数 | V1 做 AI 建议流 |
| 开放集成 | ERP/PLM/WMS/API/Webhook/数据湖 | V2 |

## 3. 用户角色

- 企业员工账号：COO、计划员、班组长、质检、仓储、IT 等员工以不同身份登录同一租户，系统按当前员工返回角色、权限、部门、工厂和在线状态。
- 集团管理层：查看跨工厂履约、质量、库存、效率、风险。
- 计划员：承接订单、查看产能与物料约束、触发 AI 重排。
- 生产班组长：接收工单、推进工序、上报异常、查看现场节拍。
- 质检员：处理检验任务、偏差、返工返修和批次追溯。
- 仓储/物料员：处理入库、领退料、齐套分析和库存预警。
- IT/实施顾问：维护主数据、权限、集成、模板和流程配置。

## 4. V1 信息架构

- 总览工作台：经营指标、风险队列、今日产线、AI 建议。
- 商业化官网：套餐、ROI、上线方法、行业包、销售路径和售前方案。
- 客户启动：售前商机转实施、角色启用任务、主数据准备度和上线入口顺序。
- 订单与排程：订单池、产线负载、拖拽/按钮式重排、影响评估。
- 生产执行：工单详情、工序状态、报工动作、异常上报。
- 看板中心：按 COO、车间、质量等受众发布实时生产统计看板。
- 质量闭环：偏差事件、责任环节、处理状态、批次追溯链。
- 物料库存：SKU 库存、库位、齐套状态、缺料预警。
- 工厂模型：组织、产线、工位、设备、人员的关系图。
- 工艺路线：产品版本、BOM、工序、质检点、SOP 与二维码发布。
- 智能体：解释风险、生成重排建议、生成跨部门任务。

## 5. V1 数据模型

```text
Plant(id, name, location, health, utilization)
Employee(id, name, email, role, roleKey, department, title, plant, status, lastActive, permissions[])
CommercialPackage(id, name, target, priceModel, scope, implementation, roi, status, modules[])
SalesOpportunity(id, packageId, customer, owner, stage, nextStep, status)
ActivationTask(id, role, owner, workspace, firstAction, successMetric, status)
MasterDataCheck(id, domain, owner, source, readiness, issues, status)
Line(id, plantId, name, status, oee, load)
ProcessRoute(id, product, version, line, owner, cycleTime, qrCode, status, bom[], steps[])
KanbanBoard(id, name, audience, scope, refreshRate, layout, owner, status, lastPublished, widgets[])
WorkOrder(id, sku, customer, dueAt, priority, lineId, status, progress, blockers[])
Operation(id, workOrderId, name, owner, status, startedAt, finishedAt)
Material(id, name, sku, stock, safeStock, location, risk, linkedOrders[])
QualityIssue(id, batchNo, severity, source, status, owner, rootCause, actions[])
Event(id, ts, type, actor, message, relatedId)
Recommendation(id, severity, title, body, action, impact, accepted)
```

## 6. 核心业务闭环

1. 商业化官网生成售前方案，客户启动中心将商机转入实施蓝图。
2. 实施顾问按角色启用任务和主数据准备度推进首厂上线入口。
3. 订单进入订单池，系统按交期、优先级、库存、产线负载计算风险。
4. 计划员查看排程板，触发 AI 重排，系统调整产线并生成影响说明。
5. 管理层和班组通过已发布看板查看准交、OEE、派工、设备告警和质量 SLA。
6. 班组长在生产执行页推进工单状态，现场事件实时进入协同流。
7. 质检员处理偏差事件，关联批次、工序和责任环节，关闭后更新质量指标。
8. 仓储角色处理缺料预警，影响订单风险随库存变化重新计算。
9. 工艺工程维护产品路线并发布到现场端，班组按二维码进入 SOP、BOM 与质检点。
10. 智能体持续把异常翻译成可执行任务，而不是只展示报表。

## 7. 非功能要求

- 多租户：企业、工厂、角色、数据权限隔离。
- 可配置：表单、流程、字段、看板、预警规则可配置。
- 实时性：关键事件应支持 WebSocket 或 Server-Sent Events。
- 审计：生产、质量、库存和权限变更必须可追溯。
- 集成：提供 REST API、Webhook、主数据同步和事件订阅。
- 可部署：SaaS、专属云、混合云三种部署策略。

## 8. 当前生产级交付范围

本轮已将 V1-V4 的关键产品能力合并成一个可运行的全栈骨架：

- 前端：React + TypeScript + Vite，多模块 SaaS 工作台。
- 后端：Node HTTP API，提供统一 snapshot 与业务动作接口。
- 持久化：SQLite，包含租户、用户、产线、工艺路线、工单、物料、质量、事件、建议、规则、集成、审计表。
- 企业协同：前端通过员工登录切换当前用户，所有业务请求携带 `x-user-id`，后端按员工写入事件流、在线状态和审计日志。
- 系统管理：IT/实施管理员可进入“系统数据库”查看租户表记录量、数据库文件大小、WAL 状态和最近备份，并触发备份/重置。
- 客户启动：销售商机、角色启用、主数据校验与实施蓝图联动已实现。
- 实时：Server-Sent Events 推送协同事件变更。
- 权限雏形：当前用户、角色、权限随 snapshot 下发。
- 审计：AI 建议执行、报工、质量关闭、补货、规则启停、集成同步均写审计。
- 配置：规则启停能力已实现。
- 集成：ERP/PLM/WMS 连接状态与手动同步能力已实现。
- 运维：健康检查、环境重置、生产构建、静态资源服务。

## 9. API 合同

```text
GET  /api/health
GET  /api/snapshot
GET  /api/admin/database
GET  /api/events/stream
POST /api/auth/login
POST /api/admin/database/backup
POST /api/commercial/:id/plan
POST /api/opportunities/:id/convert
POST /api/activation/:id/complete
POST /api/master-data/:id/verify
POST /api/recommendations/:id/execute
POST /api/orders/:id/advance
POST /api/quality/:id/close
POST /api/materials/:id/replenish
POST /api/kanban/:id/publish
POST /api/routes/:id/publish
POST /api/rules/:id/toggle
POST /api/integrations/:id/sync
POST /api/events/exception
POST /api/admin/reset
```

## 10. 下一步生产硬化

这些是进入真实商用前仍需要做的工程硬化，不再属于“demo 补齐”：

- 将 Node 内置 SQLite 替换为 PostgreSQL，并加迁移工具。
- 加 JWT/Session/OIDC、租户级 RBAC 和字段级权限。
- 加 API schema 校验、速率限制、幂等键和错误码规范。
- 加单元测试、集成测试、Playwright 场景测试和 CI。
- 抽象排程优化器与规则引擎，接入真实约束求解或 AI 服务。
- 增加设备采集、移动端/PDA 操作流和看板投屏模式。

## 11. 原迭代计划

### V1：可演示 SaaS 原型

- React/Vite 单页应用。
- 侧边栏工作台与多模块切换。
- 本地模拟数据与状态变更。
- AI 重排、异常触发、质量闭环、库存补货等关键动作。
- 响应式桌面优先界面。

### V2：真实后端与权限

- Express/Fastify API。
- SQLite/PostgreSQL 数据持久化。
- 用户、角色、租户、工厂权限。
- RESTful API 与基础审计日志。

### V3：制造配置平台

- 低代码表单与流程配置。
- 工厂模板复制。
- 预警规则引擎。
- Webhook 与 ERP/PLM/WMS 集成模拟。

### V4：工业智能体

- 自然语言问数。
- 排程约束解释。
- 异常归因与处理建议。
- 自动生成跨部门任务。
