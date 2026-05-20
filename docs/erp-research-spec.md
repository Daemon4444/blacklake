# 海外大型 ERP 参考与迭代规格

## 参考来源

- SAP Fiori Theming：主题由 logo、tint、semantic colors、text、surface、background 等要素组成；基础场景只改品牌 tint，语义色用于状态和优先级。
- Microsoft Dynamics 365 Supply Chain Management：能力覆盖供应链计划、采购与寻源、制造与车间、订单管理、仓储履约、资产维护；强调 AI/Copilot、MRP、实时生产视图、库存可承诺、采购风险与 OEE。
- Microsoft Dynamics 365 Production Control：生产生命周期包含创建、计划、释放、开始、报工/完成、结束；支持 make-to-stock、make-to-order、configure-to-order、engineer-to-order 等制造模式。
- NetSuite Cloud ERP：核心是财务、采购、库存、订单、仓储、制造和多地点运营的一体化套件。
- Oracle Redwood：企业应用体验强调现代化统一界面、常用功能入口和一致的应用外壳。

## 设计结论

1. 大型 ERP 不应该像大屏展示页。应采用中性底色、高密度表格、明确导航、克制品牌色。
2. 主色只用于交互焦点和品牌识别；状态色只用于成功、警告、风险、破坏性动作。
3. AI 应该作为 Copilot/Agent 工作流嵌入业务动作，而不是满屏霓虹视觉。
4. 企业系统更重视可扫读、可追溯、可审计、可配置，而不是装饰。
5. 信息架构必须覆盖 plan-to-produce、procure-to-pay、inventory-to-fulfill、cost-to-account、quality-to-close。

## 本轮迭代范围

- 视觉：从“AI 大屏”收敛为石墨黑、雾青灰、低饱和状态色的企业级暗色 ERP。
- 信息架构：新增主计划 MRP、采购供应商、成本财务模块。
- 交互：新增采购申请、补货建议、财务接口同步等业务动作入口。
- 保留：原有生产执行、质量闭环、库存、工厂模型、智能体、规则、集成、审计能力。

## 后续真实商用硬化

- 多币种、多组织、多账簿和多地点库存。
- 真实 MRP 计算、ATP/CTP、供应分配、采购提前期和供应商评分模型。
- 成本核算：标准成本、移动平均、批次成本、WIP、差异分析和财务凭证。
- 审批流：采购申请、供应商变更、质量偏差、生产计划冻结。
- 角色工作台：CFO、供应链总监、计划员、采购员、仓库、车间主管、质量经理。
