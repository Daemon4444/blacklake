# 黑湖智造 SaaS 生产级迭代规范

## 服务器信息

- 地址: `root@39.106.200.97`
- 项目路径: `/root/blacklake`
- 数据库: PostgreSQL 13, user=blacklake, password=<见部署环境变量>, db=blacklake_db
- Node: 22, PM2 管理进程, nginx 反向代理 (port 80 → 8787)
- 注意: 本机不支持 scp，文件传输用 `base64 -i file | ssh root@39.106.200.97 "base64 -d > target"` 或直接 ssh 写入

## 当前技术栈

### 前端
- React 19.2.6 + Vite 7.3.3 + TypeScript
- Ant Design 5.29.3 (antd)
- React Router DOM 7.15.1
- Zustand 5.0.13 (状态管理)
- Axios (HTTP)
- 入口: `src/main.tsx` → `src/App.tsx`
- 构建: `npx vite build` → `dist/`
- 主题色: `#02b980` (BlackLake 绿)

### 后端
- Fastify 5.3.3 + @fastify/cors + @fastify/jwt + @fastify/cookie + @fastify/static
- Prisma 6.19.3 (ORM) → PostgreSQL
- 入口: `server/app.js` (ESM)
- 端口: 8787
- JWT 认证, bcryptjs 密码哈希

### 部署
- `npx vite build && pm2 restart blacklake-api`
- nginx 配置: `/etc/nginx/conf.d/blacklake.conf`
- PM2 配置: `ecosystem.config.cjs`

## 当前代码结构

```
/root/blacklake/
├── index.html                    # Vite 入口 HTML
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env                          # DATABASE_URL, JWT_SECRET, PORT
├── ecosystem.config.cjs          # PM2
├── server/
│   ├── app.js                    # Fastify 服务器 (~360 行, 所有路由)
│   └── prisma/
│       ├── schema.prisma         # 25 个模型
│       ├── seed.js               # 种子数据
│       └── migrations/
├── src/
│   ├── main.tsx
│   ├── App.tsx                   # React Router, lazy loading, ErrorBoundary
│   ├── styles.css                # 极简全局样式
│   ├── components/
│   │   └── ErrorBoundary.tsx
│   ├── layouts/
│   │   └── SaaSLayout.tsx        # 侧边栏+头部+Content 布局
│   ├── pages/
│   │   ├── website/
│   │   │   ├── Home.tsx          # 官网首页 (已升级至 BlackLake 风格)
│   │   │   └── Login.tsx         # 登录页
│   │   ├── dashboard/index.tsx   # 经营总览
│   │   ├── orders/index.tsx      # 订单履约
│   │   ├── production/index.tsx  # 生产执行
│   │   ├── quality/index.tsx     # 质量管理
│   │   ├── materials/index.tsx   # 物料仓储
│   │   ├── equipment/index.tsx   # 设备管理
│   │   ├── process/index.tsx     # 工艺管理
│   │   ├── kanban/index.tsx      # 看板中心
│   │   ├── intelligence/index.tsx# 数据智能
│   │   ├── commercial/index.tsx  # 商业化
│   │   ├── implementation/index.tsx # 实施管理
│   │   ├── platform/index.tsx    # 平台配置
│   │   └── admin/index.tsx       # 系统管理
│   ├── stores/
│   │   ├── useAuthStore.ts       # 登录/登出/JWT
│   │   └── useAppStore.ts        # snapshot 全局数据
│   ├── services/
│   │   └── api.ts                # axios 实例, baseURL="/api"
│   ├── hooks/
│   │   └── useSSE.ts             # EventSource 实时事件
│   └── types/
│       └── index.ts              # 全部 TypeScript 接口
```

## 当前存在的问题 (demo 级别)

1. **所有页面都是只读展示** — 没有创建、编辑、删除操作
2. **表格无搜索无筛选** — 纯静态表格，无分页、无列筛选、无导出
3. **没有表单** — 无 Modal/Drawer 表单做 CRUD
4. **没有面包屑** — 用户不知道自己在哪
5. **没有全局搜索** — 头部搜索框缺失
6. **没有通知中心** — 铃铛图标是死的
7. **Dashboard 无图表** — 只有数字统计，没有趋势图
8. **无 loading 骨架屏** — 数据加载时无反馈
9. **无空状态** — 数据为空时无友好提示
10. **无详情页** — 工单等核心对象无详情页
11. **后端路由没有分页** — 所有 GET 返回全量数据
12. **SaaSLayout 侧边栏是蓝色主题** — 应该用 BlackLake 深绿色

## 迭代方向 & 具体要求

### 一、设计规范

所有页面统一遵循:
- 主题色: `#02b980` (绿), 辅助: `#019966` (深绿)
- 深色背景: `rgba(0,20,14,1)` (用于侧边栏和官网 footer/hero)
- 字体权重: 正文 300-400, 标题 600
- 圆角: 卡片 8px, 按钮 6px, 输入框 6px
- Ant Design ConfigProvider theme token: `{ colorPrimary: "#02b980", borderRadius: 6 }`
- 侧边栏背景改为深绿 `#00140e` 或 `rgba(0,20,14,1)`，不用默认蓝色 `#001529`

### 二、SaaSLayout 升级

文件: `src/layouts/SaaSLayout.tsx`

需要改动:
1. 侧边栏背景从 `#001529` 改为 `#00140e`
2. Logo 渐变从蓝色改为绿色 `linear-gradient(135deg, #02b980, #019966)`
3. Avatar 背景从 `#1890ff` 改为 `#02b980`
4. **添加面包屑**: 在 Content 区域顶部加 `<Breadcrumb>`, 根据 `location.pathname` 动态生成
5. **通知中心**: 点击铃铛弹出 Dropdown，显示最近事件列表 (从 snapshot.events 取)，未读角标
6. **全局搜索**: Header 中加 `<Input.Search placeholder="搜索工单、物料、设备..." />`, 回车后跳转搜索结果或在当前页过滤
7. **用户菜单**: 加上当前工厂、角色信息，支持角色切换

### 三、Dashboard 升级 (经营总览)

文件: `src/pages/dashboard/index.tsx`

当前: 4 个统计卡片 + 工单表格 + AI建议 + 产线表 + 事件流

需要改为:
1. **顶部 KPI 行**: 保留 4 个统计卡片，加上趋势箭头（用 Statistic 的 prefix）
2. **生产趋势图**: 用纯 CSS/SVG 画一个简单的柱状图或折线图（展示最近 7 天产量），不需要引入 chart 库
3. **OEE 仪表盘**: 用 antd Progress type="dashboard" 展示平均 OEE
4. **风险队列**: 用 Alert 组件高亮展示风险/阻塞工单，带一键处理按钮
5. **日期范围选择器**: 顶部加 DatePicker.RangePicker
6. **Skeleton loading**: 数据未加载时显示 Skeleton 骨架屏

### 四、订单履约 (Orders) — 完整 CRUD 模块示范

文件: `src/pages/orders/index.tsx`, 新增 `src/pages/orders/Detail.tsx`, `src/pages/orders/CreateModal.tsx`

这是最重要的模块，要做到生产级完整:

**列表页 (index.tsx)**:
1. 顶部搜索栏: 工单号、客户、状态(Select)、日期范围(RangePicker)、搜索按钮、重置按钮
2. 工具栏: "新建工单" 按钮(绿色)、批量操作下拉(批量排程/批量关闭)、导出按钮
3. 表格功能:
   - 列: 工单号(可点击跳转详情)、客户、SKU、产线、计划数、完成数、进度(Progress)、状态(Tag)、优先级、计划开始/结束、操作(查看/编辑/排程)
   - 行选择 checkbox
   - 列排序 (点击表头)
   - 分页 (pageSize: 10/20/50)
   - 状态筛选下拉
4. 空状态: 无数据时显示 Empty 组件 + "创建第一个工单" 按钮

**新建/编辑工单 Modal (CreateModal.tsx)**:
- antd Modal + Form
- 字段: 客户名(Input)、SKU(Input)、产线(Select, 从 API 获取)、计划数量(InputNumber)、优先级(Select: 高/中/低)、计划开始日期(DatePicker)、计划结束日期(DatePicker)、备注(TextArea)
- 表单校验: 必填项标 *，数量 > 0
- 提交后刷新列表，显示 message.success

**工单详情页 (Detail.tsx)**:
- 路由: `/app/orders/:id`
- 头部: 工单号 + 状态 Tag + 操作按钮(编辑/排程/关闭)
- Descriptions 组件展示基本信息(客户、SKU、产线、计划数、完成数)
- Timeline 组件展示工单生命周期(创建 → 排程 → 生产 → 完工)
- 进度条
- 关联质量问题列表 (如有)
- 操作日志/审计记录

**后端 API 支持**:
当前 `server/app.js` 已有:
- `GET /api/orders` — 需加分页: `?page=1&pageSize=10&status=xxx&keyword=xxx`
- `POST /api/orders` — 创建工单
- `PUT /api/orders/:id` — 编辑工单
- `PUT /api/orders/:id/status` — 改状态
- `GET /api/orders/:id` — 获取单个工单详情

如果 API 不完整，需要补齐。前端用 axios 调用 `/api/orders?page=1&pageSize=10`。

### 五、其他模块升级 (同样模式)

每个模块都需要从"只读列表"升级为"完整 CRUD + 搜索筛选":

**物料仓储 (materials/index.tsx)**:
- 搜索: 物料编码、名称、类型
- 表格: 编码、名称、类型、库存数、安全库存、单位、状态
- 库存预警高亮 (stock < safeStock 时红色)
- 新建/编辑 Modal: 物料信息 + 库存调整
- 出入库操作按钮

**质量管理 (quality/index.tsx)**:
- 搜索: 问题编号、类型、状态
- 表格: 编号、类型、产线、描述、状态、严重程度、发现时间
- 新建质量问题 Modal
- 状态流转: 待处理 → 处理中 → 已关闭

**设备管理 (equipment/index.tsx)**:
- 搜索: 设备编码、名称、状态
- 表格: 编码、名称、类型、状态、OEE、运行时长、下次保养
- OEE 用 Progress 组件可视化
- 设备详情: 保养记录、故障历史

**工艺管理 (process/index.tsx)**:
- 工艺路线列表 + 树形 BOM 展示 (用 antd Tree 组件)
- 工序步骤展示 (用 Steps 组件)

**系统管理 (admin/index.tsx)**:
- 用户列表: 完整 CRUD
- 审计日志: 带时间范围筛选的日志表格
- Tabs 切换: 用户管理 / 审计日志 / 系统信息

### 六、通用组件需求

需要创建的共享组件 (放在 `src/components/`):

1. **PageHeader.tsx**: 页面标题 + 面包屑 + 操作按钮区
   ```tsx
   <PageHeader title="订单履约" breadcrumb={["工作台", "订单履约"]} extra={<Button>新建</Button>} />
   ```

2. **SearchForm.tsx**: 通用搜索表单 (水平排列, 展开/收起)
   ```tsx
   <SearchForm fields={[{name: 'keyword', label: '关键词', type: 'input'}, ...]} onSearch={fn} onReset={fn} />
   ```

3. **StatusTag.tsx**: 统一的状态标签颜色映射
   ```tsx
   const colorMap = { "正常": "green", "风险": "orange", "阻塞": "red", "完成": "blue", "待处理": "orange", "处理中": "processing", "已关闭": "default" };
   ```

4. **EmptyState.tsx**: 空状态占位
   ```tsx
   <EmptyState description="暂无工单数据" action={<Button>创建工单</Button>} />
   ```

### 七、后端 API 补齐

当前 `server/app.js` 的 API 需要增强:

1. **所有列表接口加分页**:
   ```
   GET /api/orders?page=1&pageSize=10&status=风险&keyword=WO
   返回: { data: [...], total: 100, page: 1, pageSize: 10 }
   ```

2. **补齐 CRUD 接口** (如果缺少):
   - `POST /api/orders` — 创建
   - `PUT /api/orders/:id` — 更新
   - `DELETE /api/orders/:id` — 删除 (软删除)
   - 同样对 materials, quality, equipment 补齐

3. **搜索接口**:
   ```
   GET /api/search?q=关键词
   返回: { orders: [...], materials: [...], quality: [...] }
   ```

4. **单个资源详情**:
   ```
   GET /api/orders/:id — 返回单个工单完整信息(含关联数据)
   ```

### 八、路由补充

`src/App.tsx` 需要加:
```tsx
<Route path="orders/:id" element={<OrderDetail />} />
```

### 九、Login 页面升级

文件: `src/pages/website/Login.tsx`

改为:
- 背景: 深绿渐变 (同官网 hero)，不用紫色
- 左右分栏: 左边品牌介绍 + 数据指标，右边登录卡片
- 角色选择: 每个角色显示名称 + 职位 + 简要描述
- 登录按钮: 绿色 (#02b980)
- 底部: "返回官网" 链接

### 十、构建与部署

每次修改完成后:
```bash
cd /root/blacklake
npx vite build
pm2 restart blacklake-api
```

TypeScript 检查: `npx tsc --noEmit` (确保无类型错误)

### 十一、质量标准

- 所有 antd 组件使用 v5 API (不用已废弃的 bodyStyle, 用 styles.body)
- 所有表格必须有 rowKey
- 所有列表页必须有 loading 状态 (antd Spin 或 Table loading prop)
- 所有表单必须有校验
- 所有操作必须有反馈 (message.success / message.error)
- 所有颜色使用 #02b980 绿色主题，不用蓝色 #1890ff
- 不引入额外 npm 包 (不装 @ant-design/pro-components, @ant-design/charts 等)
- 用已有的 antd 组件组合实现所有需求
- 中文界面，所有文案中文

## 优先级排序

1. SaaSLayout 配色+面包屑+通知 (影响全局)
2. Orders 模块完整 CRUD (标杆模块)
3. Dashboard 图表+骨架屏
4. Materials / Quality / Equipment CRUD
5. Admin 用户管理+审计日志
6. Login 页面升级
7. 其他模块 (process, kanban, intelligence, commercial, implementation, platform)
8. 后端分页+搜索 API
9. 全局搜索功能
