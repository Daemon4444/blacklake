# 铸云智造 SaaS

一套对标云端制造协同平台的生产级 SaaS 骨架。当前版本已从前端 demo 升级为全栈应用，覆盖企业登录、总览、商业化官网、客户启动、订单排程、生产执行、看板中心、移动现场、质量闭环、物料库存、主计划 MRP、采购供应商、成本财务、工厂模型、工艺路线、设备资源、数据智能、工业智能体、规则配置、行业配置模板、流程引擎、开放集成、审计日志、系统数据库和实施蓝图。

## 本地运行

```bash
npm install
npm run dev
```

打开 http://127.0.0.1:5173/

登录方式：

- 员工账号：登录页下拉选择任一员工，如 `许 IT`、`林计划`、`陈班长`。
- 演示密码：`demo123`。
- 进入系统后可在顶部切换员工或点击“退出”回到登录页。

`npm run dev` 会同时启动：

- Web：Vite dev server，端口 `5173`
- API：Node HTTP + SQLite，端口 `8787`

生产模式：

```bash
npm run build
npm run start
```

打开 http://127.0.0.1:8787/

## 已实现功能

- 总览工作台：准交预测、工单进度、缺料风险、质量待闭环。
- 企业员工登录：内置 COO、计划员、班组长、质检、仓储、IT 等员工目录，登录页使用员工账号 + 演示密码进入，切换员工会调用后端登录接口并按当前员工写事件和审计。
- 商业化官网：对外呈现套餐、ROI、上线方法、行业包和销售路径，可生成售前方案并写入商机池、事件流与审计。
- 客户启动：将售前商机转入实施，管理角色启用任务、主数据准备度和上线入口顺序，所有动作写入事件流与审计。
- 订单排程：工单池、状态、阻塞原因、AI 重排建议。
- 生产执行：工单报工推进，进度写回共享状态。
- 看板中心：面向 COO、车间、质量等角色配置生产统计看板，支持刷新策略、组件组合、投屏布局和发布审计。
- 移动现场：手机/PDA 工作台，支持扫码报工、扫码发料、扫码质检确认，并同步事件流与审计。
- 质量闭环：偏差事件、批次、来源、责任人与关闭动作。
- 物料库存：安全库存、低库存预警、模拟补货。
- 工厂模型：租户、工厂、产线、质检、仓储、设备对象图。
- 工艺路线：产品版本、BOM、工序、质检点、SOP、二维码和发布闭环，发布后同步事件流与审计。
- 设备资源：设备台账、健康分、OEE、IoT 传感器指标和点检保养闭环。
- 数据智能：跨订单、库存、设备、质量、成本的经营洞察，支持处理洞察并回写业务对象、事件流和审计日志。
- 工业智能体：建议执行后改变工单、库存和事件流。
- 规则配置：预警规则启停，写入事件与审计。
- 行业配置模板：食品饮料、电子装配、医药日化模板，启用后切换模块、角色、字段和上线节奏。
- 流程引擎：生产变更、质量 CAPA、采购申请按节点推进，保留负责人、SLA、路线和审计轨迹。
- 开放集成：ERP/PLM/WMS 连接状态和手动同步。
- 审计日志：生产、质量、库存、规则、集成动作持久化。
- 系统数据库管理：IT/实施管理员可查看 SQLite 状态、业务表记录数、最近备份，并触发数据库备份或重置演示数据。
- 后端协同：所有业务动作带 `x-user-id`，后端解析当前员工、刷新在线状态、广播 SSE，并在事件流和审计日志中记录真实操作者。
- 角色化启动台：COO、计划、生产、质量、仓储、采购、财务、IT 登录后看到各自的今日动作。
- 实施蓝图：从价值诊断、蓝图、主数据、集成、试点到扩厂复制的上线路线图，支持按顺序推进阶段并写入事件流与审计日志。
- 实时事件：Server-Sent Events 推送事件变更。
- 持久化：SQLite 数据库位于 `data/zhuyun.sqlite`。

## API 摘要

- `GET /api/health`
- `GET /api/snapshot`
- `GET /api/admin/database`
- `GET /api/events/stream`
- `POST /api/auth/login`
- `POST /api/commercial/:id/plan`
- `POST /api/opportunities/:id/convert`
- `POST /api/activation/:id/complete`
- `POST /api/master-data/:id/verify`
- `POST /api/recommendations/:id/execute`
- `POST /api/orders/:id/advance`
- `POST /api/mobile/:id/complete`
- `POST /api/quality/:id/close`
- `POST /api/materials/:id/replenish`
- `POST /api/kanban/:id/publish`
- `POST /api/routes/:id/publish`
- `POST /api/equipment/:id/check`
- `POST /api/insights/:id/resolve`
- `POST /api/rules/:id/toggle`
- `POST /api/templates/:id/apply`
- `POST /api/workflows/:id/advance`
- `POST /api/integrations/:id/sync`
- `POST /api/implementation/:id/advance`
- `POST /api/events/exception`
- `POST /api/admin/database/backup`
- `POST /api/admin/reset`

## 产品规格

完整 spec 位于 [docs/spec.md](./docs/spec.md)，包含对标范围、角色、信息架构、数据模型、业务闭环和 V2-V4 迭代路线。

本轮正式 PRD 位于 [docs/prd.md](./docs/prd.md)，三轮自检位于 [docs/prd-review.md](./docs/prd-review.md)。

## 技术栈

- React + TypeScript
- Vite
- lucide-react
- Node HTTP API
- Node built-in SQLite
- Server-Sent Events
