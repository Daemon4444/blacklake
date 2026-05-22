# Black Lake 对标产品 PRD

## 1. 产品判断

Black Lake / 黑湖科技的核心不是一个传统本地化 MES，而是“云原生制造协同平台”。它以工厂订单履约为主线，把计划、排程、物料、生产执行、质检、设备、供应链和数据分析连接成实时协同网络。官网主张“云端协同、数据驱动”，强调借助云计算、智能手机和 IoT 设备，通过数据聚合、多角色协同、可视化分析、智能决策帮助企业缩短生产周期、降低库存积压、提升产能利用率和透明化制造流程。

产品矩阵应被理解为三层：

1. 黑湖智造：面向中大型制造企业和集团多工厂的云端 MES/MOM 平台，覆盖订单、排程、物料、生产、质检、设备、看板、开放接口、低代码配置和工业智能体。
2. 黑湖小工单：面向中小工厂的轻量级生产协同工具，以工单下发、扫码报工、排产、物料、质量、计件工资和消息提醒为切入点，强调 30 分钟上手、低门槛、快速上线。
3. 黑湖供应链：面向链主企业和品牌方的供应链协同 SaaS，覆盖订单同步、供应商管理、生产进度透明、库存透明、来料进度、质量风险、追溯和数据分析。

因此本项目不应该只做“官网复刻”，而应该做一个可演示的制造协同 SaaS 原型：第一屏表达商业定位和售卖路径，核心屏提供真实的工厂运营工作台，角色可切换，动作能写入事件流，模块之间能看出订单履约闭环。

## 2. 目标用户与购买角色

目标客户：

- 成长型中小工厂：机加工、汽配、新能源装备、食品包装等多品类、小批量、交付压力大的场景。
- 中大型制造企业：食品饮料、制药、化工、日化、汽车零部件、家电、电子、金属加工等。
- 集团与链主企业：多工厂、多供应商、多外协产能，需要跨组织透明协作。

购买与使用角色：

- CEO / COO / 工厂总经理：关注准交率、库存周转、产能利用率、质量损失、复制速度。
- 计划员：关注订单池、产能负载、物料齐套、插单、冻结计划。
- 生产主管 / 班组长 / 一线员工：关注派工、扫码报工、异常上报、SOP、计件绩效。
- 质量经理 / 质检员：关注来料检、首检、巡检、成品检、偏差闭环、批次追溯。
- 仓储 / 物料员：关注发料、退料、线边库存、安全库存、盘点和库位。
- 设备工程师：关注设备状态、OEE、点检、保养、停机影响。
- IT / 实施顾问：关注 ERP/PLM/WMS/IoT 集成、权限、审计、主数据、上线里程碑。

## 3. 商业化逻辑

售卖方式应组合呈现：

- SaaS 年订阅：按模块、产线/工厂、用户席位、API 调用量或集团协议计费。
- 标准实施包：首厂诊断、主数据梳理、试点线配置、培训陪跑、上线验收。
- 行业模板包：食品饮料、制药、汽配、机加工、新能源装备等模板，包含字段、流程、质检点、看板和角色权限。
- 多厂复制包：首厂沉淀模板后向集团其他工厂复制，提升规模化交付效率。
- 工业 AI 增值包：AI 排程建议、ChatBI、异常归因、质量预警、工业智能体。
- 供应链协同扩展：从厂内协同扩展到外协工厂和供应商透明化。

典型销售路径：

1. 官网获取线索：预约演示、微信/电话咨询、行业方案。
2. 售前诊断：导入样本订单、库存、产线、质量问题，输出 ROI 和首厂范围。
3. 首厂试点：1 条样板线或关键车间先上线，验证报工、排程、物料和质量闭环。
4. 多模块扩展：从生产执行扩展到 MRP、设备、成本、供应链、AI。
5. 多厂复制：形成集团模板、统一指标、跨厂协同和供应链透明。

## 4. 核心价值主张

- 快速交付：云端部署、移动端优先、低代码配置、单厂 6-12 周上线，小工单更轻量。
- 透明协同：让订单、物料、生产、质量、设备和供应链状态实时可见。
- 数据闭环：不是只采集数据，而是将数据用于计划调整、质量追溯、库存补货、成本归因和 AI 决策。
- 本土适配：支持中国制造业多 SKU、短交期、小批量、多工序、外协和快速变更。
- 可复制：通过行业模板和首厂模型实现多工厂复制。

## 5. MVP 功能范围

### 5.1 商业首页

必须包含：

- 清晰定位：云原生制造协同平台，而非泛泛“智能工厂”。
- 产品矩阵：黑湖智造、小工单、供应链、工业智能体。
- 套餐与商业化：首厂试点、多产线协同、集团运营。
- ROI：准交、库存、报工、质量、上线周期。
- 客户证据：食品饮料、制药、汽配、装备、快消等行业信号。
- CTA：生成售前方案、进入客户启动。

### 5.2 总览工作台

必须包含：

- 准交预测、工单进度、缺料风险、质量闭环、OEE 等指标。
- AI 建议：重排、补货、质量追溯、设备保养。
- 事件流：用户动作、现场异常、接口同步、审计事件。
- 角色首要任务：不同角色登录后看到不同任务入口。

### 5.3 订单履约闭环

必须覆盖：

- 订单池与工单状态：优先级、进度、交期、阻塞项。
- 排程与产能：产线负载、切线、待料、OEE。
- MRP 与物料：库存、安全库存、补货建议、工单关联。
- 移动现场：扫码报工、发料、质检。
- 质量闭环：异常、责任人、批次、关闭动作。

### 5.4 实施与配置

必须覆盖：

- 7 步数字化转型路径：需求访谈、数据梳理、方案设计、试点上线、培训陪跑、验收复盘、多厂复制。
- 主数据准备度：物料、BOM、组织权限、产线设备、质检标准。
- 集成：ERP、PLM、WMS、IoT、企业身份。
- 审计和数据库运维：登录、动作、备份、表统计。

## 6. 交互与体验原则

- 第一屏是产品本身，不做空泛营销落地页。
- 信息密度要像生产运营系统，安静、精准、可扫描。
- 所有按钮都要有明确业务动作：生成方案、转实施、执行建议、报工、补货、关闭偏差、同步接口。
- 图标优先，文字辅助；不要用大量解释性文案教用户怎么操作。
- 视觉方向：工业级、清洁、精密、现代，不使用单一深蓝/紫色大渐变，不做廉价科技感。
- 响应式：桌面应支持高密度工作台；移动端应保留关键操作，不能溢出。

## 7. 数据模型

核心对象：

- Tenant：租户、套餐、工厂、产线、用户数。
- User：角色、权限、部门、工厂、在线状态。
- CommercialPackage / SalesOpportunity：商业套餐和商机阶段。
- WorkOrder：客户、SKU、产线、交期、优先级、状态、进度、阻塞项。
- Line：工厂、产线状态、OEE、负载。
- Material：库存、安全库存、库位、关联工单。
- QualityIssue：批次、严重度、来源、责任人、状态、根因。
- EquipmentAsset：设备状态、健康分、OEE、传感器、保养计划。
- ProcessRoute：产品、BOM、工序、质检点、SOP、二维码。
- Integration / Rule / Workflow / AuditLog：接口、规则、流程和审计。

## 8. 验收标准

- PRD 有 20 个以上来源支撑，并覆盖官网、产品页、博客案例、融资/市场报道、行业标准和竞品/行业定义。
- 页面可运行，可登录，可切换角色。
- 至少 8 类业务动作能通过 API 改变后端状态并回写事件流。
- 首屏能准确表达 Black Lake 的产品定位、商业化路径和核心价值。
- 操作台能体现从订单到生产、物料、质量、设备、供应链、AI 的闭环。
- Build 通过；本地浏览器检查桌面和移动端无明显遮挡、溢出、空白。

## 9. 研究来源

1. Black Lake 官网：[黑湖智造 - 云端制造协同系统](https://www.blacklake.cn/?h=889&w=1920)
2. Black Lake 英文官网：[Black Lake Technologies](https://www.blacklake.cn/en/home)
3. 黑湖小工单官网：[关于黑湖](https://www.xiaogongdan.cn/about)
4. 黑湖小工单产品页：[生产计划自动排产/工单管理](https://www.xiaogongdan.cn/products)
5. 黑湖小工单站点：[报工软件/MES 系统](https://xiaogongdan.tech/)
6. 黑湖小工单站点：[轻量 MES](https://www.xiaogongdan.com.cn/)
7. Microsoft AppSource：[黑湖供应链](https://appsource.microsoft.com/en-us/product/saas/1689229879375.blacklakesmartchain-id2023?tab=overview)
8. World Economic Forum：[Black Lake Technologies](https://www.weforum.org/organizations/black-lake/)
9. TechNode：[GGV leads RMB 10 million investment round](https://technode.com/2017/07/17/ggv-leads-rmb-10-million-investment-round-black-lake/)
10. TechNode：[Black Lake raises RMB 150 million](https://technode.com/2019/05/06/gsr-venture-150-million-black-lake/)
11. 动点科技中文：[协同 SaaS 公司黑湖科技完成 A 轮融资](https://cn.technode.com/post/2017-07-17/blacklake/)
12. 黑湖博客：[打造生产协同系统，黑湖智造的工业 SaaS 之路](https://blog.blacklake.cn/da-zao-sheng-chan-xie-tong-xi-tong-hei-hu-zhi-zao-de-gong-ye-saaszhi-lu-neng-fou-zou-tong-ai-fen-xi-fang-tan/)
13. 黑湖博客：[黑湖智造完成近 5 亿元 C 轮融资](https://blog.blacklake.cn/hei-hu-zhi-zao-wan-cheng-jin-5-yi-yuan-c-lun-rong-zi-chuang-zao-zhong-guo-gong-ye-ruan-jian-xin-li-cheng-bei/)
14. 黑湖博客：[黑湖智造的功能和适用行业](https://blog.blacklake.cn/hei_hu_zhi_zao_de_gong_neng_he_shi_yong_hang_ye/)
15. 黑湖博客：[黑湖小工单的功能和适用行业](https://blog.blacklake.cn/hei_hu_xiao_gong_dan_de_gong_neng_he_shi_yong_hang_ye/)
16. 黑湖博客：[黑湖科技这家公司怎么样](https://blog.blacklake.cn/hei_hu_ke_ji_zhe_jia_gong_si_zen_mo_yang/)
17. 黑湖博客：[开能环保设备案例](https://blog.blacklake.cn/canature/)
18. 黑湖博客：[欧姆柯液压案例](https://blog.blacklake.cn/)
19. 东方财富/新华财经：[黑湖科技完成近 10 亿元 D 轮融资](https://finance.eastmoney.com/a/202604233715851131.html)
20. 财新：[工业软件企业黑湖科技完成近 10 亿元 D 轮融资](https://www.caixin.com/2026-04-24/102437437.html)
21. CB Insights：[Black Lake Technologies](https://www.cbinsights.com/company/black-lake)
22. KPMG 中国：[领先智能制造科技 50](https://assets.kpmg.com/content/dam/kpmg/cn/pdf/zh/2024/11/intelligent-manufacturing-technology50.pdf)
23. ISA：[ISA-95 Standard](https://www.isa.org/standards-and-publications/isa-standards/isa-95-standard)
24. SAP：[What is a manufacturing execution system](https://www.sap.com/products/scm/digital-manufacturing/what-is-mes.html)
25. Rockwell/Plex：[What is MES](https://plex.rockwellautomation.com/en-us/products/manufacturing-execution-system/what-is-mes.html)
26. Infor：[Guide to MES](https://www.infor.com/en-ca/solutions/scm/manufacturing-execution-system/what-is-mes)
27. Siemens：[ISA-95 framework and layers](https://www.siemens.com/de-ch/technology/isa-95-framework-layers/)
28. 工信部：[5G+工业互联网 512 工程升级版](https://ynca.miit.gov.cn/xwdt/bsyw/art/2025/art_df00b7ee9f154fe29770831c46d43f6e.html)
29. Grand View Research：[MES market report](https://www.grandviewresearch.com/industry-analysis/manufacturing-execution-systems-market-report)
30. arXiv：[PlanningVis: production planning in smart factories](https://arxiv.org/abs/1907.12201)

## 10. 三轮 Review

### Review 1：是否符合 Black Lake 官网定位

结论：通过，但需要避免把产品做成传统 MES。官网强调云计算、智能手机、IoT、数据聚合、多角色协同、可视化分析和智能决策，因此产品首页和工作台必须同时呈现“云端协同”和“数据驱动”。修正：将产品定位从“制造 SaaS”收窄为“云原生制造协同平台”，并把 AI、供应链、低代码配置纳入平台能力。

### Review 2：是否符合市场认知

结论：通过。行业材料和 ISA-95/MES 定义都显示，MES/MOM 位于 ERP 与车间控制之间，负责生产、质量、库存、维护等制造运营活动。Black Lake 的差异在于云化、移动端、快速实施和数据智能，而不是单纯执行层管控。修正：补充 MOM 视角，强调 ERP/PLM/WMS/IoT 集成和多厂复制。

### Review 3：是否可指导重构

结论：通过。PRD 已经转化为可实现的页面结构、数据模型、业务动作和验收标准。修正：MVP 不做纯官网，而做“商业首页 + 操作系统工作台 + 模块化业务闭环”，用真实按钮和后端事件证明可用性。
